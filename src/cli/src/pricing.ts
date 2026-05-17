// Anthropic model pricing table + per-turn cost calculation.
//
// Rates are per-million-token, in USD. Sourced from Anthropic's public
// pricing page. Update this table when Anthropic publishes pricing changes.
// The model id matches what appears in `assistant.message.model` in JSONL.
//
// CRITICAL: per notes/anonymization.md and notes/jsonl-format.md, records
// where model === '<synthetic>' are NOT real model calls and MUST be
// excluded from cost calculation. The calling code is responsible for
// filtering; this module returns 0 cost for synthetic records as a
// defense-in-depth backup.

import type { AssistantRecord, Usage } from './types.js';

export interface ModelRates {
  // All rates in USD per 1,000,000 tokens.
  input: number;
  output: number;
  cacheRead: number;
  // Cache writes are tiered in 2026: 5-minute and 1-hour ephemeral caches
  // have different per-token costs (1h is more expensive but lasts longer).
  cacheWrite5m: number;
  cacheWrite1h: number;
}

// Pricing table verified against Anthropic's source-of-truth pricing page
// on 2026-05-17. Verified URL:
// https://platform.claude.com/docs/en/about-claude/pricing
//
// IMPORTANT context for future maintenance:
// - Anthropic cut Opus pricing 3x starting with Opus 4.5. Opus 4.5, 4.6, 4.7
//   are all $5/$25 per million tokens (input/output). Older Opus 4.1 and 4.0
//   are still at the legacy $15/$75 rate.
// - Sonnet 4.x and Haiku 4.5 pricing unchanged.
// - Cache write rates follow the standard 1.25x (5m) and 2x (1h) multipliers
//   on the input rate. Cache read = 0.1x base input rate.
// - The "<synthetic>" pseudo-model gets all-zero rates; the primary defense
//   is the filter in `costForRecord` below.
const RATES: Record<string, ModelRates> = {
  // Opus 4.5+ — post-pricecut tier ($5/$25 input/output)
  'claude-opus-4-7': {
    input: 5.0,
    output: 25.0,
    cacheRead: 0.5,
    cacheWrite5m: 6.25,
    cacheWrite1h: 10.0,
  },
  'claude-opus-4-6': {
    input: 5.0,
    output: 25.0,
    cacheRead: 0.5,
    cacheWrite5m: 6.25,
    cacheWrite1h: 10.0,
  },
  'claude-opus-4-5': {
    input: 5.0,
    output: 25.0,
    cacheRead: 0.5,
    cacheWrite5m: 6.25,
    cacheWrite1h: 10.0,
  },
  // Opus 4.1 and below — legacy pricing ($15/$75 input/output)
  'claude-opus-4-1': {
    input: 15.0,
    output: 75.0,
    cacheRead: 1.5,
    cacheWrite5m: 18.75,
    cacheWrite1h: 30.0,
  },
  // Sonnet 4.x — $3/$15
  'claude-sonnet-4-6': {
    input: 3.0,
    output: 15.0,
    cacheRead: 0.3,
    cacheWrite5m: 3.75,
    cacheWrite1h: 6.0,
  },
  'claude-sonnet-4-5': {
    input: 3.0,
    output: 15.0,
    cacheRead: 0.3,
    cacheWrite5m: 3.75,
    cacheWrite1h: 6.0,
  },
  // Haiku 4.5 — $1/$5 (note: Haiku 3.5 was $0.80/$4 but is deprecated)
  'claude-haiku-4-5-20251001': {
    input: 1.0,
    output: 5.0,
    cacheRead: 0.1,
    cacheWrite5m: 1.25,
    cacheWrite1h: 2.0,
  },
  'claude-haiku-4-5': {
    input: 1.0,
    output: 5.0,
    cacheRead: 0.1,
    cacheWrite5m: 1.25,
    cacheWrite1h: 2.0,
  },
  '<synthetic>': {
    input: 0,
    output: 0,
    cacheRead: 0,
    cacheWrite5m: 0,
    cacheWrite1h: 0,
  },
};

// Fall back rates used when an unknown model id is encountered.
// Conservatively assume "as expensive as Opus" so we never undercount cost
// (better to alarm a user about a high estimate than to silently miss spend).
const FALLBACK_RATES: ModelRates = {
  input: 15.0,
  output: 75.0,
  cacheRead: 1.5,
  cacheWrite5m: 18.75,
  cacheWrite1h: 30.0,
};

export function ratesForModel(model: string): ModelRates {
  return RATES[model] ?? FALLBACK_RATES;
}

export function isKnownModel(model: string): boolean {
  return model in RATES;
}

// Compute the USD cost of a single assistant turn from its usage block.
// Returns 0 for synthetic records as a backup safety net.
export function costForUsage(model: string, usage: Usage): number {
  if (model === '<synthetic>') return 0;
  const rates = ratesForModel(model);

  const ephemeral5m = usage.cache_creation?.ephemeral_5m_input_tokens ?? 0;
  const ephemeral1h = usage.cache_creation?.ephemeral_1h_input_tokens ?? 0;

  // If both ephemeral fields are zero/missing, fall back to the legacy
  // cache_creation_input_tokens field. Some older Claude Code versions only
  // emit the flat field. Treat the legacy total as 5-minute cache writes,
  // which is the conservative choice (cheaper than assuming 1h).
  const legacyCacheWrite =
    ephemeral5m === 0 && ephemeral1h === 0 ? usage.cache_creation_input_tokens : 0;

  const cost =
    (usage.input_tokens * rates.input +
      usage.cache_read_input_tokens * rates.cacheRead +
      ephemeral5m * rates.cacheWrite5m +
      ephemeral1h * rates.cacheWrite1h +
      legacyCacheWrite * rates.cacheWrite5m +
      usage.output_tokens * rates.output) /
    1_000_000;

  return cost;
}

// Convenience wrapper that takes a whole AssistantRecord.
export function costForRecord(record: AssistantRecord): number {
  return costForUsage(record.message.model, record.message.usage);
}
