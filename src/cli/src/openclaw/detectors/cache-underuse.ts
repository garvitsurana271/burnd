// Detector: Cache underuse — not leveraging OpenClaw's prompt caching.
//
// OpenClaw tracks cacheRead tokens separately from input tokens. When
// cacheRead tokens are a tiny fraction of total input tokens across a long
// session, it means the user isn't benefiting from caching. Enabling caching
// on repeated system prompts / tool schemas typically cuts input costs by 60–90%.
//
// Fires when: session has 10+ assistant messages AND cacheRead < 5% of input tokens.
// Savings: assume 70% of input tokens could be cached at ~10x cheaper read rate.

import type { OpenClawDetector } from './types.js';
import { makeInsightId } from './types.js';

const MIN_MESSAGES = 10;
const CACHE_RATIO_THRESHOLD = 0.05; // <5% of input tokens coming from cache

export const cacheUnderuseDetector: OpenClawDetector = {
  id: 'cache-underuse',

  run(stats) {
    if (stats.assistantMessageCount < MIN_MESSAGES) return [];
    if (stats.totalInputTokens === 0) return [];

    const cacheRatio = stats.totalCacheReadTokens / stats.totalInputTokens;
    if (cacheRatio >= CACHE_RATIO_THRESHOLD) return [];
    if (stats.totalCostUsd < 0.10) return [];

    // Conservative estimate: 70% of input tokens are repetitive (system prompt,
    // tool schemas) and could be cached. Cache reads cost ~10x less than uncached
    // input tokens. So savings ≈ 0.7 * inputCost * (1 - 1/10) = 0.7 * 0.9 * inputCost.
    // We don't have per-token rates from OpenClaw directly, so we estimate
    // input cost as ~60% of total session cost (typical for most models).
    const estimatedInputCost = stats.totalCostUsd * 0.6;
    const savingsEstimateUsd = estimatedInputCost * 0.7 * 0.9;

    return [
      {
        id: makeInsightId('cache-underuse', stats.sessionId),
        detectorId: 'cache-underuse',
        sessionId: stats.sessionId,
        agentId: stats.agentId,
        title: `Long session with almost no cache hits — paying full price for repeated tokens`,
        description:
          `This session had ${stats.assistantMessageCount} messages but only ` +
          `${(cacheRatio * 100).toFixed(1)}% of input tokens came from cache. ` +
          `OpenClaw re-sends your system prompt and tool schemas on every turn. ` +
          `Enabling prompt caching would let repeated tokens load at ~10x cheaper cache-read rates. ` +
          `Potential saving: ~$${savingsEstimateUsd.toFixed(3)} on this session alone.`,
        savingsEstimateUsd,
        effortMinutes: 10,
        fixSteps: [
          `Enable prompt caching in your OpenClaw agent settings (cache: true in agent config).`,
          `Mark your system prompt and tool schemas as cacheable — these are the biggest repeated-token sources.`,
          `For Anthropic models: cache_control: {type: "ephemeral"} on system prompt blocks.`,
          `For OpenAI models: use the Assistants API with persistent threads which cache automatically.`,
        ],
        configPatch: `# In your OpenClaw agent config:\ncaching:\n  enabled: true\n  systemPrompt: true\n  toolSchemas: true`,
      },
    ];
  },
};
