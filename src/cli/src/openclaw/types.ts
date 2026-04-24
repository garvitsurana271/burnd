// TypeScript types for OpenClaw's JSONL session format.
//
// Format source: tokscale parser (github.com/junhoyeo/tokscale) + openclaw docs.
// OpenClaw stores sessions at:
//   ~/.openclaw/agents/<agentId>/sessions/sessions.json  ← index
//   <sessionFile>.jsonl                                  ← actual records
//
// Legacy paths (renamed during early development):
//   ~/.clawdbot/ ~/.moltbot/ ~/.moldbot/
//
// Two record types appear in session JSONL files:
//   1. model_change — emitted when the active model switches
//   2. message      — one LLM turn (input + output + cost pre-computed by OpenClaw)
//
// IMPORTANT: OpenClaw pre-computes cost.total for every message. We trust this
// value directly instead of computing our own rates — OpenClaw knows the exact
// provider billing for each model it routes to.

// =============================================================================
// Sessions index (sessions.json)
// =============================================================================

export interface SessionsIndex {
  // Keys are agent-scoped session labels like "agent:main:main"
  [sessionKey: string]: {
    sessionId: string;
    sessionFile: string; // absolute path to the .jsonl file
  };
}

// =============================================================================
// JSONL record types
// =============================================================================

export interface ModelChangeRecord {
  type: 'model_change';
  provider: string;  // e.g. "anthropic", "openai-codex", "google"
  modelId: string;   // e.g. "claude-sonnet-4-6", "gpt-5.2", "gemini-3-pro"
}

export interface OpenClawUsage {
  input: number;
  output: number;
  cacheRead: number;
  cost: {
    total: number; // USD, pre-computed by OpenClaw
  };
}

export interface MessageRecord {
  type: 'message';
  message: {
    role: 'assistant' | 'user' | string;
    usage: OpenClawUsage;
    timestamp: number; // Unix ms
  };
}

// Union of all known record types. Parser stays permissive — unknown types
// are skipped, not crashed on.
export type OpenClawRecord = ModelChangeRecord | MessageRecord;

// =============================================================================
// Type guards
// =============================================================================

export function isModelChange(r: unknown): r is ModelChangeRecord {
  return typeof r === 'object' && r !== null && (r as Record<string, unknown>).type === 'model_change';
}

export function isMessage(r: unknown): r is MessageRecord {
  if (typeof r !== 'object' || r === null) return false;
  const obj = r as Record<string, unknown>;
  if (obj.type !== 'message') return false;
  const msg = obj.message as Record<string, unknown> | undefined;
  return (
    typeof msg === 'object' &&
    msg !== null &&
    typeof (msg.usage as Record<string, unknown> | undefined)?.cost === 'object'
  );
}

export function isAssistantMessage(r: MessageRecord): boolean {
  return r.message.role === 'assistant';
}
