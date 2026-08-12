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
// on 2026-08-12. Verified URL:
// https://platform.claude.com/docs/en/about-claude/pricing
//
// IMPORTANT context for future maintenance:
// - Anthropic cut Opus pricing 3x starting with Opus 4.5. Opus 4.5 through
//   Opus 5 are all $5/$25 per million tokens (input/output). Older Opus 4.1
//   and 4.0 are still at the legacy $15/$75 rate.
// - Fable 5 and Mythos 5 sit ABOVE the Opus tier at $10/$50.
// - Sonnet 5 lists at $3/$15. An introductory $2/$10 rate runs through
//   2026-08-31; we deliberately price at the standard rate so estimates stay
//   correct after it lapses (and so we never under-report spend).
// - Cache write rates follow the standard 1.25x (5m) and 2x (1h) multipliers
//   on the input rate. Cache read = 0.1x base input rate.
// - The "<synthetic>" pseudo-model gets all-zero rates; the primary defense
//   is the filter in `costForRecord` below.
//
// WHEN ANTHROPIC SHIPS A NEW MODEL: add it here. An unmatched model id falls
// back to FALLBACK_RATES and every session using it is mispriced. burnd 0.0.19
// shipped without Opus 5 / Fable 5 / Opus 4.8 and silently priced every
// post-July-2026 session at the legacy $15/$75 rate — a 3x over-report. The
// `unknownModelsSeen` set below exists so that failure is never silent again.
const RATES: Record<string, ModelRates> = {
  // Fable 5 / Mythos 5 — above the Opus tier ($10/$50 input/output)
  'claude-fable-5': {
    input: 10.0,
    output: 50.0,
    cacheRead: 1.0,
    cacheWrite5m: 12.5,
    cacheWrite1h: 20.0,
  },
  'claude-mythos-5': {
    input: 10.0,
    output: 50.0,
    cacheRead: 1.0,
    cacheWrite5m: 12.5,
    cacheWrite1h: 20.0,
  },
  // Opus 4.5+ — post-pricecut tier ($5/$25 input/output)
  'claude-opus-5': {
    input: 5.0,
    output: 25.0,
    cacheRead: 0.5,
    cacheWrite5m: 6.25,
    cacheWrite1h: 10.0,
  },
  'claude-opus-4-8': {
    input: 5.0,
    output: 25.0,
    cacheRead: 0.5,
    cacheWrite5m: 6.25,
    cacheWrite1h: 10.0,
  },
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
  // Sonnet 4.x / 5 — $3/$15
  'claude-sonnet-5': {
    input: 3.0,
    output: 15.0,
    cacheRead: 0.3,
    cacheWrite5m: 3.75,
    cacheWrite1h: 6.0,
  },
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

// Fallback rates for an unknown model id. Anchored to the most expensive
// CURRENT model (Fable 5, $10/$50) rather than the legacy Opus 4.1 rate.
//
// The principle is still "never undercount" — but bounded by what Anthropic
// actually charges today. The old $15/$75 anchor was the legacy Opus 4.1 rate,
// which no current model has used since Opus 4.5. Applying it to a newly
// released model over-reports by 3x and destroys the credibility of every
// number burnd prints, which is a worse failure than a small undercount.
const FALLBACK_RATES: ModelRates = {
  input: 10.0,
  output: 50.0,
  cacheRead: 1.0,
  cacheWrite5m: 12.5,
  cacheWrite1h: 20.0,
};

// Model ids that hit FALLBACK_RATES during this scan. A silent fallback is how
// burnd shipped three months of 3x-inflated numbers; the CLI reads this after
// scanning and warns so the estimate is never quietly wrong again.
const unknownModelsSeen = new Set<string>();

export function unknownModels(): string[] {
  return [...unknownModelsSeen].sort();
}

export function resetUnknownModels(): void {
  unknownModelsSeen.clear();
}

export function ratesForModel(model: string): ModelRates {
  const rates = RATES[model];
  if (rates) return rates;
  unknownModelsSeen.add(model);
  return FALLBACK_RATES;
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
