// Anonymization layer — implements notes/anonymization.md v0.1.
//
// This module is the privacy boundary between Burnd's local parsing
// (which sees everything in the user's session files) and Burnd's
// upload payload (which sees only what's in this module's output).
//
// CRITICAL RULES (non-negotiable; CI tests assert each):
//
// 1. Never include the text/content/input of any message, content block,
//    or tool call in the upload payload.
// 2. Never include file-history-snapshot.snapshot.trackedFileBackups —
//    this field literally contains the user's source code.
// 3. Never include aiTitle, slug, or gitBranch in the upload payload.
// 4. Hash sessionId, cwd, and promptId before upload (SHA-256, truncated
//    to 16 hex chars).
// 5. Never include synthetic records in cost-bearing aggregates (records
//    with model === '<synthetic>' must contribute zero dollars).
//
// If any new field is added to the JSONL format that this module hasn't
// seen, the parser MUST fail loudly rather than silently default to
// uploading it. The schema completeness CI test enforces this.

import { createHash } from 'node:crypto';
import type {
  AssistantRecord,
  AttachmentRecord,
  ContentBlock,
  SessionRecord,
  SystemRecord,
  UserRecord,
} from './types.js';
import { isAssistant, isUser, isSystem, isFileHistorySnapshot, isSynthetic } from './types.js';

// =============================================================================
// Hashing — 64-bit truncated SHA-256, hex-encoded
// =============================================================================

export function hashForUpload(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex').slice(0, 16);
}

// =============================================================================
// Per-record anonymized payload shapes
// =============================================================================

export interface AnonymizedAssistantRecord {
  type: 'assistant';
  vendor: 'claude-code';
  uuid: string | undefined;
  parentUuid: string | null | undefined;
  sessionIdHash: string;
  timestamp: string;
  model: string;
  isSidechain: boolean;
  isSynthetic: boolean;
  cwdHash: string | undefined;
  version: string | undefined;
  entrypoint: string | undefined;
  requestId: string | undefined;
  usage: {
    input_tokens: number;
    cache_read_input_tokens: number;
    cache_creation_input_tokens: number;
    cache_creation_5m: number;
    cache_creation_1h: number;
    output_tokens: number;
    service_tier: string | undefined;
  };
  // Per-block summary: only structural metadata, never content.
  contentBlocks: AnonymizedContentBlock[];
  stopReason: string | undefined;
}

export interface AnonymizedContentBlock {
  type: ContentBlock['type'];
  byteSize: number;
  toolName?: string;
  toolUseId?: string;
  isError?: boolean;
}

export interface AnonymizedUserRecord {
  type: 'user';
  vendor: 'claude-code';
  uuid: string | undefined;
  parentUuid: string | null | undefined;
  sessionIdHash: string;
  timestamp: string;
  isSidechain: boolean;
  cwdHash: string | undefined;
  version: string | undefined;
  entrypoint: string | undefined;
  promptIdHash: string | undefined;
  sourceToolAssistantUUID: string | undefined;
  contentBlocks: AnonymizedContentBlock[];
  toolUseResultSummary:
    | {
        toolUseId: string | undefined;
        byteSize: number;
        isError: boolean | undefined;
      }
    | undefined;
}

export interface AnonymizedSystemRecord {
  type: 'system';
  vendor: 'claude-code';
  uuid: string | undefined;
  sessionIdHash: string;
  timestamp: string;
  subtype: string | undefined;
  level: string | undefined;
  errorCode: string | undefined;
  errorErrno: number | undefined;
  errorType: string | undefined;
  retryInMs: number | undefined;
  retryAttempt: number | undefined;
  maxRetries: number | undefined;
}

export interface AnonymizedAttachmentRecord {
  type: 'attachment';
  vendor: 'claude-code';
  uuid: string | undefined;
  sessionIdHash: string;
  timestamp: string;
  addedFileCount: number;
  addedLines: number;
  removedFileCount: number;
  removedLines: number;
}

export type AnonymizedRecord =
  | AnonymizedAssistantRecord
  | AnonymizedUserRecord
  | AnonymizedSystemRecord
  | AnonymizedAttachmentRecord;

// =============================================================================
// Per-record anonymizers
// =============================================================================

function blockByteSize(block: unknown): number {
  // Use JSON.stringify length as a stable byte estimate. This counts the
  // serialized JSON, including field names and quotes — it's an upper
  // bound on the actual content size, which is the safe direction.
  try {
    return JSON.stringify(block ?? null).length;
  } catch {
    return 0;
  }
}

function summarizeContentBlock(block: ContentBlock): AnonymizedContentBlock {
  const summary: AnonymizedContentBlock = {
    type: block.type,
    byteSize: blockByteSize(block),
  };
  if (block.type === 'tool_use') {
    summary.toolName = block.name;
    summary.toolUseId = block.id;
  } else if (block.type === 'tool_result') {
    summary.toolUseId = block.tool_use_id;
    if (block.is_error !== undefined) summary.isError = block.is_error;
  }
  return summary;
}

function anonymizeAssistant(r: AssistantRecord): AnonymizedAssistantRecord {
  const usage = r.message.usage;
  return {
    type: 'assistant',
    vendor: 'claude-code',
    uuid: r.uuid,
    parentUuid: r.parentUuid,
    sessionIdHash: hashForUpload(r.sessionId),
    timestamp: r.timestamp,
    model: r.message.model,
    isSidechain: r.isSidechain ?? false,
    isSynthetic: isSynthetic(r),
    cwdHash: r.cwd ? hashForUpload(r.cwd) : undefined,
    version: r.version,
    entrypoint: r.entrypoint,
    requestId: r.requestId,
    usage: {
      input_tokens: usage.input_tokens,
      cache_read_input_tokens: usage.cache_read_input_tokens,
      cache_creation_input_tokens: usage.cache_creation_input_tokens,
      cache_creation_5m: usage.cache_creation?.ephemeral_5m_input_tokens ?? 0,
      cache_creation_1h: usage.cache_creation?.ephemeral_1h_input_tokens ?? 0,
      output_tokens: usage.output_tokens,
      service_tier: usage.service_tier,
    },
    contentBlocks: Array.isArray(r.message.content)
      ? r.message.content.map(summarizeContentBlock)
      : [],
    stopReason: r.message.stop_reason,
  };
}

function anonymizeUser(r: UserRecord): AnonymizedUserRecord {
  const blocks: AnonymizedContentBlock[] = [];
  if (Array.isArray(r.message?.content)) {
    for (const block of r.message.content as ContentBlock[]) {
      blocks.push(summarizeContentBlock(block));
    }
  }
  return {
    type: 'user',
    vendor: 'claude-code',
    uuid: r.uuid,
    parentUuid: r.parentUuid,
    sessionIdHash: hashForUpload(r.sessionId),
    timestamp: r.timestamp,
    isSidechain: r.isSidechain ?? false,
    cwdHash: r.cwd ? hashForUpload(r.cwd) : undefined,
    version: r.version,
    entrypoint: r.entrypoint,
    promptIdHash: r.promptId ? hashForUpload(r.promptId) : undefined,
    sourceToolAssistantUUID: r.sourceToolAssistantUUID,
    contentBlocks: blocks,
    toolUseResultSummary: r.toolUseResult
      ? {
          toolUseId: r.toolUseResult.tool_use_id,
          byteSize: blockByteSize(r.toolUseResult.content),
          isError: r.toolUseResult.is_error,
        }
      : undefined,
  };
}

function anonymizeSystem(r: SystemRecord): AnonymizedSystemRecord {
  return {
    type: 'system',
    vendor: 'claude-code',
    uuid: r.uuid,
    sessionIdHash: hashForUpload(r.sessionId),
    timestamp: r.timestamp,
    subtype: r.subtype,
    level: r.level,
    errorCode: r.cause?.code,
    errorErrno: r.cause?.errno,
    errorType: r.error?.type,
    retryInMs: r.retryInMs,
    retryAttempt: r.retryAttempt,
    maxRetries: r.maxRetries,
  };
}

function anonymizeAttachment(r: AttachmentRecord): AnonymizedAttachmentRecord {
  const att = r.attachment ?? {};
  return {
    type: 'attachment',
    vendor: 'claude-code',
    uuid: r.uuid,
    sessionIdHash: hashForUpload(r.sessionId),
    timestamp: r.timestamp,
    addedFileCount: att.addedNames?.length ?? 0,
    addedLines: att.addedLines ?? 0,
    removedFileCount: att.removedNames?.length ?? 0,
    removedLines: att.removedLines ?? 0,
  };
}

// =============================================================================
// Top-level entrypoint
// =============================================================================

// Convert a parsed SessionRecord into an upload-safe AnonymizedRecord, or
// null for record types that have no upload representation (queue-operation,
// ai-title, file-history-snapshot — all dropped entirely).
export function anonymize(record: SessionRecord): AnonymizedRecord | null {
  if (isAssistant(record)) return anonymizeAssistant(record);
  if (isUser(record)) return anonymizeUser(record);
  if (isSystem(record)) return anonymizeSystem(record);
  if (record.type === 'attachment') return anonymizeAttachment(record);

  // Record types we never upload:
  // - queue-operation: lifecycle metadata, not useful aggregated
  // - ai-title: contains content-derived titles (per spec)
  // - file-history-snapshot: contains source code backups (per spec)
  if (record.type === 'queue-operation') return null;
  if (record.type === 'ai-title') return null;
  if (isFileHistorySnapshot(record)) return null;

  // Unknown record type: fail soft, do NOT silently upload an unknown shape.
  // The schema completeness CI test should catch new types before they
  // reach this code path.
  return null;
}
