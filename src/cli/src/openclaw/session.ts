// OpenClaw session aggregator — turns a stream of OpenClawRecords into a
// single OpenClawSessionStats that the detectors and snapshot consume.
//
// Unlike Claude Code sessions, OpenClaw pre-computes cost.total per message.
// We trust that value directly. Our job is to aggregate across messages and
// track the current model (from model_change records) for per-model breakdowns.

import type { OpenClawRecord } from './types.js';
import { isModelChange, isMessage, isAssistantMessage } from './types.js';

export interface ModelStats {
  provider: string;
  modelId: string;
  // Combined "provider::modelId" key for display and grouping.
  key: string;
  messageCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheReadTokens: number;
  totalCostUsd: number;
}

export interface OpenClawSessionStats {
  sessionId: string;
  filePath: string;
  agentId: string;
  // Unix ms timestamps (from message.timestamp field)
  startedAtMs: number | undefined;
  endedAtMs: number | undefined;
  // Total cost across ALL assistant messages in this session (USD).
  totalCostUsd: number;
  // Token totals.
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheReadTokens: number;
  // Message counts.
  assistantMessageCount: number;
  userMessageCount: number;
  // Per-model breakdown — keyed by "provider::modelId"
  modelStats: Map<string, ModelStats>;
  // Number of model_change events — high count = provider-switching waste.
  modelSwitchCount: number;
}

export function newEmptyOpenClawStats(
  sessionId: string,
  filePath: string,
  agentId: string,
): OpenClawSessionStats {
  return {
    sessionId,
    filePath,
    agentId,
    startedAtMs: undefined,
    endedAtMs: undefined,
    totalCostUsd: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCacheReadTokens: 0,
    assistantMessageCount: 0,
    userMessageCount: 0,
    modelStats: new Map(),
    modelSwitchCount: 0,
  };
}

// Tracks the currently active provider+model within a session.
// Mutated by model_change records. Starts undefined (no model yet known).
interface ModelContext {
  provider: string;
  modelId: string;
}

// We attach the model context to stats via a WeakMap to keep the public
// interface clean — exactly as the Claude Code session aggregator does.
const modelContextCache = new WeakMap<OpenClawSessionStats, ModelContext | null>();

function getModelContext(stats: OpenClawSessionStats): ModelContext | null {
  if (!modelContextCache.has(stats)) modelContextCache.set(stats, null);
  return modelContextCache.get(stats) ?? null;
}

function setModelContext(stats: OpenClawSessionStats, ctx: ModelContext): void {
  modelContextCache.set(stats, ctx);
}

// Update stats with one OpenClaw record. Mutates stats in place.
export function ingestOpenClawRecord(
  stats: OpenClawSessionStats,
  record: OpenClawRecord,
): OpenClawSessionStats {
  if (isModelChange(record)) {
    const wasNull = getModelContext(stats) === null;
    setModelContext(stats, { provider: record.provider, modelId: record.modelId });
    // First model_change in a session sets the context but isn't a "switch".
    if (!wasNull) stats.modelSwitchCount += 1;
    return stats;
  }

  if (isMessage(record)) {
    const { message } = record;
    const { usage } = message;

    // Timestamp tracking.
    if (typeof message.timestamp === 'number') {
      if (stats.startedAtMs === undefined || message.timestamp < stats.startedAtMs) {
        stats.startedAtMs = message.timestamp;
      }
      if (stats.endedAtMs === undefined || message.timestamp > stats.endedAtMs) {
        stats.endedAtMs = message.timestamp;
      }
    }

    const isAssistant = isAssistantMessage(record);

    if (isAssistant) {
      stats.assistantMessageCount += 1;
      stats.totalCostUsd += usage.cost?.total ?? 0;
      stats.totalInputTokens += usage.input ?? 0;
      stats.totalOutputTokens += usage.output ?? 0;
      stats.totalCacheReadTokens += usage.cacheRead ?? 0;

      // Attribute to current model if known.
      const ctx = getModelContext(stats);
      if (ctx) {
        const key = `${ctx.provider}::${ctx.modelId}`;
        let ms = stats.modelStats.get(key);
        if (!ms) {
          ms = {
            provider: ctx.provider,
            modelId: ctx.modelId,
            key,
            messageCount: 0,
            totalInputTokens: 0,
            totalOutputTokens: 0,
            totalCacheReadTokens: 0,
            totalCostUsd: 0,
          };
          stats.modelStats.set(key, ms);
        }
        ms.messageCount += 1;
        ms.totalInputTokens += usage.input ?? 0;
        ms.totalOutputTokens += usage.output ?? 0;
        ms.totalCacheReadTokens += usage.cacheRead ?? 0;
        ms.totalCostUsd += usage.cost?.total ?? 0;
      }
    } else {
      stats.userMessageCount += 1;
    }
  }

  return stats;
}
