// Detector: High output token ratio — model generating verbose responses.
//
// Output tokens cost significantly more than input tokens across all providers
// (typically 3–5x more per token). When output tokens exceed 40% of total tokens,
// the user is likely getting verbose responses where a tighter, more focused
// prompt would produce the same answer with fewer output tokens.
//
// Fires when: output/(input+output) > 0.4 AND session cost > $0.20 AND 5+ messages.
// Savings: 25% — focused prompts typically cut output verbosity by 30–40%.

import type { OpenClawDetector } from './types.js';
import { makeInsightId } from './types.js';

const OUTPUT_RATIO_THRESHOLD = 0.40;
const MIN_COST = 0.20;
const MIN_MESSAGES = 5;

export const highOutputRatioDetector: OpenClawDetector = {
  id: 'high-output-ratio',

  run(stats) {
    if (stats.assistantMessageCount < MIN_MESSAGES) return [];
    if (stats.totalCostUsd < MIN_COST) return [];

    const totalTokens = stats.totalInputTokens + stats.totalOutputTokens;
    if (totalTokens === 0) return [];

    const outputRatio = stats.totalOutputTokens / totalTokens;
    if (outputRatio < OUTPUT_RATIO_THRESHOLD) return [];

    const savingsEstimateUsd = stats.totalCostUsd * 0.25;

    return [
      {
        id: makeInsightId('high-output-ratio', stats.sessionId),
        detectorId: 'high-output-ratio',
        sessionId: stats.sessionId,
        agentId: stats.agentId,
        title: `${(outputRatio * 100).toFixed(0)}% output tokens — verbose responses inflating your bill`,
        description:
          `Output tokens made up ${(outputRatio * 100).toFixed(1)}% of this session's total tokens ` +
          `(${stats.totalOutputTokens.toLocaleString()} output vs ${stats.totalInputTokens.toLocaleString()} input). ` +
          `Output tokens cost 3–5x more than input tokens across all providers. ` +
          `This pattern usually means prompts aren't constraining response length, ` +
          `and the model is generating long explanations where short answers would suffice.`,
        savingsEstimateUsd,
        effortMinutes: 15,
        fixSteps: [
          `Add "Be concise. Answer in under 3 sentences unless I ask for detail." to your system prompt.`,
          `Use structured output formats (JSON, bullet points) instead of free-form explanations — they're shorter.`,
          `For code tasks: ask for just the diff/changes, not a full rewrite with explanation.`,
          `Set max_tokens in your OpenClaw agent config to cap response length.`,
        ],
        configPatch: `# In OpenClaw agent system prompt, add:\n"Be concise. Avoid unnecessary explanations unless explicitly asked."`,
      },
    ];
  },
};
