// Session aggregator — turns a stream of parsed SessionRecords into a
// single SessionStats object that the detectors and the dashboard consume.
//
// One SessionStats per .jsonl file. Each detector can compute its insights
// from these stats without re-walking the raw records, which keeps the
// detector code small and predictable.

import type { SessionRecord, ToolUseBlock } from './types.js';
import { isAssistant, isUser, isSystem, isToolResult, isToolUse, isSynthetic } from './types.js';
import { costForRecord } from './pricing.js';

export interface ToolUsageStats {
  // Number of times this tool was invoked.
  callCount: number;
  // Sum of bytes returned by this tool's results (JSON.stringify length).
  totalOutputBytes: number;
  // Number of tool_results for this tool that came back with is_error=true.
  errorCount: number;
}

export interface SessionStats {
  sessionId: string;
  filePath: string;
  isSubagent: boolean;
  projectDir: string;
  // Wall-clock window of the session.
  startedAt: string | undefined;
  endedAt: string | undefined;
  // Cost in USD across all non-synthetic assistant turns.
  totalCostUsd: number;
  // Token totals for the dashboard's Overview view.
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheReadTokens: number;
  totalCacheCreate5mTokens: number;
  totalCacheCreate1hTokens: number;
  // Counts.
  assistantTurnCount: number;
  syntheticTurnCount: number;
  userTurnCount: number;
  // Per-tool aggregates, keyed by tool name (e.g., "Bash", "Edit").
  toolStats: Map<string, ToolUsageStats>;
  // System-level retry tracking for the API retry storm detector.
  apiErrorCount: number;
  apiRetryCount: number;
  // For the repeated-read detector: a map from file path hash → read count.
  // We hash the path here so the detector can group without ever holding
  // the raw path in memory longer than necessary.
  readCountsByPathHash: Map<string, number>;
  // Models used in this session (for the dashboard's "models" filter).
  modelsSeen: Set<string>;
}

export function newEmptyStats(
  sessionId: string,
  filePath: string,
  projectDir: string,
  isSubagent: boolean,
): SessionStats {
  return {
    sessionId,
    filePath,
    isSubagent,
    projectDir,
    startedAt: undefined,
    endedAt: undefined,
    totalCostUsd: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCacheReadTokens: 0,
    totalCacheCreate5mTokens: 0,
    totalCacheCreate1hTokens: 0,
    assistantTurnCount: 0,
    syntheticTurnCount: 0,
    userTurnCount: 0,
    toolStats: new Map(),
    apiErrorCount: 0,
    apiRetryCount: 0,
    readCountsByPathHash: new Map(),
    modelsSeen: new Set(),
  };
}

// Update an existing SessionStats with information from one parsed record.
// Pure-ish: mutates `stats` in place but returns it for chaining.
export function ingestRecord(stats: SessionStats, record: SessionRecord): SessionStats {
  // Time bounds — every record has a timestamp.
  const ts = (record as { timestamp?: string }).timestamp;
  if (typeof ts === 'string') {
    if (!stats.startedAt || ts < stats.startedAt) stats.startedAt = ts;
    if (!stats.endedAt || ts > stats.endedAt) stats.endedAt = ts;
  }

  if (isAssistant(record)) {
    stats.modelsSeen.add(record.message.model);

    if (isSynthetic(record)) {
      stats.syntheticTurnCount += 1;
      // Synthetic records contribute zero dollars but we still want to know
      // they happened — they're a useful UX signal for the dashboard.
      return stats;
    }
    stats.assistantTurnCount += 1;

    const usage = record.message.usage;
    stats.totalInputTokens += usage.input_tokens ?? 0;
    stats.totalOutputTokens += usage.output_tokens ?? 0;
    stats.totalCacheReadTokens += usage.cache_read_input_tokens ?? 0;
    stats.totalCacheCreate5mTokens += usage.cache_creation?.ephemeral_5m_input_tokens ?? 0;
    stats.totalCacheCreate1hTokens += usage.cache_creation?.ephemeral_1h_input_tokens ?? 0;
    stats.totalCostUsd += costForRecord(record);

    // Track tool_use blocks inside this assistant turn.
    if (Array.isArray(record.message.content)) {
      for (const block of record.message.content) {
        if (isToolUse(block)) {
          recordToolUse(stats, block);
        }
      }
    }
  } else if (isUser(record)) {
    stats.userTurnCount += 1;

    if (Array.isArray(record.message?.content)) {
      for (const block of record.message.content) {
        if (isToolResult(block)) {
          // Match this tool_result back to the tool name via callerCache.
          // We don't have the tool name on the result block itself, so we
          // approximate via byte size of the content. The detectors that
          // need exact tool→result correlation will use the tool_use_id
          // join in a separate pass.
          const toolName = inferToolNameFromUuid(stats, block.tool_use_id);
          if (toolName) {
            const t = ensureToolStats(stats, toolName);
            const bytes = byteSizeOf(block.content);
            t.totalOutputBytes += bytes;
            if (block.is_error) t.errorCount += 1;
          }
        }
      }
    }
  } else if (isSystem(record)) {
    if (record.subtype === 'api_error') {
      stats.apiErrorCount += 1;
      if ((record.retryAttempt ?? 0) > 0) stats.apiRetryCount += 1;
    }
  }

  return stats;
}

function ensureToolStats(stats: SessionStats, toolName: string): ToolUsageStats {
  let t = stats.toolStats.get(toolName);
  if (!t) {
    t = { callCount: 0, totalOutputBytes: 0, errorCount: 0 };
    stats.toolStats.set(toolName, t);
  }
  return t;
}

function recordToolUse(stats: SessionStats, block: ToolUseBlock): void {
  const t = ensureToolStats(stats, block.name);
  t.callCount += 1;
  // Track tool_use_id → tool name so the next user record (carrying the
  // matching tool_result) can attribute its bytes to the right tool.
  toolNameByUseId(stats).set(block.id, block.name);

  // For the repeated-read detector: track Read tool calls by file_path.
  if (block.name === 'Read' && typeof block.input?.file_path === 'string') {
    const pathHash = simpleHash(block.input.file_path);
    stats.readCountsByPathHash.set(pathHash, (stats.readCountsByPathHash.get(pathHash) ?? 0) + 1);
  }
}

// We attach a private map to the stats object via a WeakMap so the
// SessionStats interface stays clean of implementation-detail caches.
const toolNameByUseIdCache = new WeakMap<SessionStats, Map<string, string>>();
function toolNameByUseId(stats: SessionStats): Map<string, string> {
  let m = toolNameByUseIdCache.get(stats);
  if (!m) {
    m = new Map();
    toolNameByUseIdCache.set(stats, m);
  }
  return m;
}

function inferToolNameFromUuid(stats: SessionStats, toolUseId: string): string | null {
  return toolNameByUseId(stats).get(toolUseId) ?? null;
}

function byteSizeOf(value: unknown): number {
  if (typeof value === 'string') return value.length;
  try {
    return JSON.stringify(value ?? null).length;
  } catch {
    return 0;
  }
}

// Cheap, deterministic non-cryptographic hash for path grouping inside a
// single session. We use this instead of SHA-256 because we don't need
// security here — just a stable key for "same path twice."
function simpleHash(value: string): string {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) | 0;
  }
  return h.toString(16);
}
