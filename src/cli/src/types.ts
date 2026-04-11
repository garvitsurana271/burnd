// TypeScript types matching the Claude Code JSONL session format,
// as documented in notes/jsonl-format.md from the Week 1 schema study.
//
// These types are intentionally permissive on optional fields because the
// JSONL format evolves between Claude Code versions and the parser must
// fail soft on unknown shapes.

// =============================================================================
// Vendor identifier — load-bearing for the multi-vendor schema design.
// v1 only emits 'claude-code' but the rest of the codebase must accept
// VendorId as the discriminator so v2 (Gemini CLI, Codex, etc.) is additive.
// =============================================================================

export type VendorId = 'claude-code' | 'gemini-cli' | 'codex' | 'cursor';

// =============================================================================
// Token usage (the cost calculation source-of-truth)
// Per notes/jsonl-format.md cost formula. The 2026 ephemeral cache tiers
// (5m and 1h) are NEW and must be handled correctly or cost will be wrong.
// =============================================================================

export interface CacheCreation {
  ephemeral_5m_input_tokens: number;
  ephemeral_1h_input_tokens: number;
}

export interface Usage {
  input_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  cache_creation?: CacheCreation;
  output_tokens: number;
  service_tier?: string;
  inference_geo?: string;
}

// =============================================================================
// Content blocks (inside message.content arrays)
// =============================================================================

export interface TextBlock {
  type: 'text';
  text: string;
}

export interface ThinkingBlock {
  type: 'thinking';
  thinking: string;
  signature?: string;
}

export interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
  caller?: string;
}

export interface ToolResultBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: string | Array<{ type: string; text?: string; [key: string]: unknown }>;
  is_error?: boolean;
}

export type ContentBlock = TextBlock | ThinkingBlock | ToolUseBlock | ToolResultBlock;

// =============================================================================
// Message payload (inside assistant/user records)
// =============================================================================

export interface AssistantMessage {
  id?: string;
  type: 'message';
  role: 'assistant';
  // The "<synthetic>" placeholder model is the silent footgun documented
  // in notes/jsonl-format.md. The cost calculator MUST exclude these.
  model: string;
  content: ContentBlock[];
  stop_reason?: string;
  stop_sequence?: string | null;
  stop_details?: unknown;
  usage: Usage;
}

export interface UserMessage {
  type?: 'message';
  role: 'user';
  content: string | ContentBlock[];
}

// =============================================================================
// Top-level record types
// =============================================================================

interface RecordBase {
  uuid?: string;
  parentUuid?: string | null;
  sessionId: string;
  timestamp: string;
  isSidechain?: boolean;
  userType?: string;
  entrypoint?: string;
  cwd?: string;
  version?: string;
  gitBranch?: string | null;
}

export interface AssistantRecord extends RecordBase {
  type: 'assistant';
  message: AssistantMessage;
  requestId?: string;
}

export interface UserRecord extends RecordBase {
  type: 'user';
  message: UserMessage;
  promptId?: string;
  toolUseResult?: {
    tool_use_id?: string;
    content?: unknown;
    is_error?: boolean;
    [key: string]: unknown;
  };
  sourceToolAssistantUUID?: string;
}

export interface QueueOperationRecord {
  type: 'queue-operation';
  operation: string;
  timestamp: string;
  sessionId: string;
}

export interface AttachmentRecord extends RecordBase {
  type: 'attachment';
  attachment: {
    type?: string;
    addedNames?: string[];
    addedLines?: number;
    removedNames?: string[];
    removedLines?: number;
    [key: string]: unknown;
  };
}

export interface FileHistorySnapshotRecord {
  type: 'file-history-snapshot';
  messageId?: string;
  // CRITICAL: snapshot.trackedFileBackups contains literal source code.
  // The parser MUST never inspect this field. Typed as `unknown` to make
  // it impossible to accidentally read.
  snapshot?: unknown;
  isSnapshotUpdate?: boolean;
}

export interface AiTitleRecord {
  type: 'ai-title';
  sessionId: string;
  aiTitle: string;
}

export interface SystemRecord extends RecordBase {
  type: 'system';
  subtype?: string;
  level?: 'error' | 'warn' | 'info' | string;
  cause?: { code?: string; path?: string; errno?: number; [key: string]: unknown };
  error?: { type?: string; cause?: unknown; [key: string]: unknown };
  retryInMs?: number;
  retryAttempt?: number;
  maxRetries?: number;
  slug?: string;
}

export type SessionRecord =
  | AssistantRecord
  | UserRecord
  | QueueOperationRecord
  | AttachmentRecord
  | FileHistorySnapshotRecord
  | AiTitleRecord
  | SystemRecord;

// =============================================================================
// Type guards (so the rest of the parser can narrow without ts-ignore noise)
// =============================================================================

export function isAssistant(r: SessionRecord): r is AssistantRecord {
  return r.type === 'assistant';
}

export function isUser(r: SessionRecord): r is UserRecord {
  return r.type === 'user';
}

export function isSystem(r: SessionRecord): r is SystemRecord {
  return r.type === 'system';
}

export function isFileHistorySnapshot(r: SessionRecord): r is FileHistorySnapshotRecord {
  return r.type === 'file-history-snapshot';
}

export function isSynthetic(r: AssistantRecord): boolean {
  return r.message.model === '<synthetic>';
}

export function isToolUse(b: ContentBlock): b is ToolUseBlock {
  return b.type === 'tool_use';
}

export function isToolResult(b: ContentBlock): b is ToolResultBlock {
  return b.type === 'tool_result';
}
