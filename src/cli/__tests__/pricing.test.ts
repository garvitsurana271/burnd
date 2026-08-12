import { describe, it, expect } from 'vitest';
import { costForUsage, ratesForModel, isKnownModel, unknownModels, resetUnknownModels } from '../src/pricing.js';
import type { Usage } from '../src/types.js';

const ZERO_USAGE: Usage = {
  input_tokens: 0,
  cache_creation_input_tokens: 0,
  cache_read_input_tokens: 0,
  cache_creation: { ephemeral_5m_input_tokens: 0, ephemeral_1h_input_tokens: 0 },
  output_tokens: 0,
};

describe('pricing.costForUsage', () => {
  it('returns zero cost for zero usage', () => {
    expect(costForUsage('claude-sonnet-4-6', ZERO_USAGE)).toBe(0);
  });

  it('returns ZERO cost for synthetic model regardless of usage', () => {
    // This is the load-bearing safety net for the <synthetic> filter.
    // Even if synthetic usage is non-zero (and it can be — see fixtures),
    // the cost MUST be zero.
    const heavyUsage: Usage = {
      input_tokens: 1_000_000,
      cache_creation_input_tokens: 1_000_000,
      cache_read_input_tokens: 1_000_000,
      cache_creation: { ephemeral_5m_input_tokens: 1_000_000, ephemeral_1h_input_tokens: 1_000_000 },
      output_tokens: 1_000_000,
    };
    expect(costForUsage('<synthetic>', heavyUsage)).toBe(0);
  });

  it('computes a sane cost for a typical sonnet turn', () => {
    const usage: Usage = {
      input_tokens: 1000,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
      cache_creation: { ephemeral_5m_input_tokens: 0, ephemeral_1h_input_tokens: 0 },
      output_tokens: 200,
    };
    // Sonnet input rate $3/M, output rate $15/M:
    // 1000 * 3/1M + 200 * 15/1M = 0.003 + 0.003 = 0.006
    expect(costForUsage('claude-sonnet-4-6', usage)).toBeCloseTo(0.006, 6);
  });

  it('charges the new ephemeral_5m cache tier correctly', () => {
    const usage: Usage = {
      input_tokens: 0,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
      cache_creation: { ephemeral_5m_input_tokens: 1_000_000, ephemeral_1h_input_tokens: 0 },
      output_tokens: 0,
    };
    // Sonnet 5m cache write rate is 1.25x input = $3.75/M.
    // 1M tokens at $3.75/M = $3.75
    expect(costForUsage('claude-sonnet-4-6', usage)).toBeCloseTo(3.75, 4);
  });

  it('charges the new ephemeral_1h cache tier correctly', () => {
    const usage: Usage = {
      input_tokens: 0,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
      cache_creation: { ephemeral_5m_input_tokens: 0, ephemeral_1h_input_tokens: 1_000_000 },
      output_tokens: 0,
    };
    // Sonnet 1h cache write rate is 2x input = $6/M.
    expect(costForUsage('claude-sonnet-4-6', usage)).toBeCloseTo(6.0, 4);
  });

  it('falls back to the legacy cache_creation_input_tokens field when ephemeral fields are zero', () => {
    const usage: Usage = {
      input_tokens: 0,
      cache_creation_input_tokens: 1_000_000,
      cache_read_input_tokens: 0,
      cache_creation: { ephemeral_5m_input_tokens: 0, ephemeral_1h_input_tokens: 0 },
      output_tokens: 0,
    };
    // Falls back to 5m rate = $3.75/M
    expect(costForUsage('claude-sonnet-4-6', usage)).toBeCloseTo(3.75, 4);
  });

  it('falls back to the most-expensive rate for an unknown model id', () => {
    const usage: Usage = {
      input_tokens: 1_000_000,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
      cache_creation: { ephemeral_5m_input_tokens: 0, ephemeral_1h_input_tokens: 0 },
      output_tokens: 0,
    };
    // Unknown model falls back to the most expensive CURRENT rate
    // (Fable 5, $10/M input) — not the legacy Opus 4.1 $15/M rate.
    expect(costForUsage('claude-future-model-9', usage)).toBeCloseTo(10.0, 4);
  });
});

describe('pricing.ratesForModel', () => {
  it('returns the correct rates for known models', () => {
    // Opus 4.5+ uses the post-pricecut tier ($5 input / $25 output).
    // Opus 4.1 retains the legacy $15/$75 rate.
    expect(ratesForModel('claude-opus-5').input).toBe(5.0);
    expect(ratesForModel('claude-opus-5').output).toBe(25.0);
    expect(ratesForModel('claude-opus-4-8').input).toBe(5.0);
    expect(ratesForModel('claude-opus-4-7').input).toBe(5.0);
    expect(ratesForModel('claude-opus-4-7').output).toBe(25.0);
    expect(ratesForModel('claude-opus-4-6').input).toBe(5.0);
    expect(ratesForModel('claude-opus-4-5').input).toBe(5.0);
    expect(ratesForModel('claude-opus-4-1').input).toBe(15.0);
    expect(ratesForModel('claude-sonnet-4-6').input).toBe(3.0);
    expect(ratesForModel('claude-haiku-4-5-20251001').input).toBe(1.0);
    expect(ratesForModel('claude-haiku-4-5').input).toBe(1.0);
  });

  it('prices Fable 5 and Mythos 5 above the Opus tier', () => {
    expect(ratesForModel('claude-fable-5').input).toBe(10.0);
    expect(ratesForModel('claude-fable-5').output).toBe(50.0);
    expect(ratesForModel('claude-mythos-5').input).toBe(10.0);
  });

  it('prices Sonnet 5 at the standard rate, not the intro rate', () => {
    // An introductory $2/$10 ran through 2026-08-31. We price at the standard
    // $3/$15 so estimates stay correct after it lapses.
    expect(ratesForModel('claude-sonnet-5').input).toBe(3.0);
    expect(ratesForModel('claude-sonnet-5').output).toBe(15.0);
  });

  it('reports known vs unknown models', () => {
    expect(isKnownModel('claude-opus-5')).toBe(true);
    expect(isKnownModel('claude-fable-5')).toBe(true);
    expect(isKnownModel('claude-sonnet-5')).toBe(true);
    expect(isKnownModel('claude-opus-4-8')).toBe(true);
    expect(isKnownModel('claude-opus-4-7')).toBe(true);
    expect(isKnownModel('claude-opus-4-6')).toBe(true);
    expect(isKnownModel('claude-haiku-4-5')).toBe(true);
    expect(isKnownModel('claude-future-model-9')).toBe(false);
  });

  it('records unknown model ids so the CLI can warn instead of failing silently', () => {
    resetUnknownModels();
    ratesForModel('claude-opus-5');
    expect(unknownModels()).toEqual([]);

    ratesForModel('claude-nonexistent-7');
    ratesForModel('claude-nonexistent-7');
    ratesForModel('another-unknown-model');
    expect(unknownModels()).toEqual(['another-unknown-model', 'claude-nonexistent-7']);

    resetUnknownModels();
    expect(unknownModels()).toEqual([]);
  });
});
