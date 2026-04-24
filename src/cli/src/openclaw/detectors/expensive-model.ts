// Detector: Expensive model when a cheaper one would do.
//
// OpenClaw routes to many providers. Some models (GPT-5, Claude Opus, Gemini Ultra)
// cost 10–50x more per token than capable mid-tier models (GPT-4o-mini, Claude Haiku,
// Gemini Flash). If a session's cost-per-message is >5x the cross-session average
// AND an expensive model was used, this fires.
//
// Savings estimate: 70% cost reduction if the user switches to a mid-tier model.

import type { OpenClawDetector, OpenClawInsight } from './types.js';
import { makeInsightId } from './types.js';
import type { OpenClawSessionStats } from '../session.js';

// Models known to be expensive tier. We match by substring so partial
// model IDs (e.g. "opus", "gpt-5") still match.
const EXPENSIVE_PATTERNS = [
  'opus',
  'gpt-5',
  'gemini-ultra',
  'gemini-3-pro',
  'gemini-3',
  'claude-3-7',
  'o3',
  'o1',
];

// Suggested cheaper alternatives per expensive model.
const CHEAPER_ALTERNATIVES: Record<string, string> = {
  opus: 'claude-haiku-4-5 or claude-sonnet-4-6',
  'gpt-5': 'gpt-4o-mini',
  'gemini-ultra': 'gemini-flash',
  'gemini-3-pro': 'gemini-flash',
  'gemini-3': 'gemini-flash',
  o3: 'gpt-4o-mini',
  o1: 'gpt-4o',
};

function matchesExpensive(modelId: string): string | null {
  for (const pattern of EXPENSIVE_PATTERNS) {
    if (modelId.toLowerCase().includes(pattern)) return pattern;
  }
  return null;
}

export const expensiveModelDetector: OpenClawDetector = {
  id: 'expensive-model',

  run(stats: OpenClawSessionStats): OpenClawInsight[] {
    if (stats.assistantMessageCount === 0) return [];

    const costPerMessage = stats.totalCostUsd / stats.assistantMessageCount;

    // Only fire if the session actually spent meaningful money.
    if (stats.totalCostUsd < 0.05) return [];

    const expensiveModels: string[] = [];
    let expensiveModelCost = 0;

    for (const [, ms] of stats.modelStats) {
      const match = matchesExpensive(ms.modelId);
      if (match) {
        expensiveModels.push(ms.modelId);
        expensiveModelCost += ms.totalCostUsd;
      }
    }

    if (expensiveModels.length === 0) return [];

    // Only fire if the expensive model drove most of the cost.
    if (expensiveModelCost < stats.totalCostUsd * 0.5) return [];

    const savingsEstimateUsd = expensiveModelCost * 0.7; // 70% savings switching to mid-tier
    const matchedPattern = matchesExpensive(expensiveModels[0]!);
    const alternative = matchedPattern ? (CHEAPER_ALTERNATIVES[matchedPattern] ?? 'a mid-tier model') : 'a mid-tier model';

    return [
      {
        id: makeInsightId('expensive-model', stats.sessionId),
        detectorId: 'expensive-model',
        sessionId: stats.sessionId,
        agentId: stats.agentId,
        title: `Using expensive model (${expensiveModels[0]}) for routine tasks`,
        description:
          `This session spent $${expensiveModelCost.toFixed(3)} on ${expensiveModels.join(', ')}, ` +
          `which is a top-tier model costing significantly more per token than capable mid-tier alternatives. ` +
          `At $${costPerMessage.toFixed(4)}/message, this session is likely using a premium model for ` +
          `tasks where a cheaper model would produce the same quality output.`,
        savingsEstimateUsd,
        effortMinutes: 5,
        fixSteps: [
          `Switch to ${alternative} for most tasks — same quality, fraction of the cost.`,
          `Reserve ${expensiveModels[0]} for tasks that truly need maximum reasoning (complex architecture decisions, novel problem-solving).`,
          `In OpenClaw settings, set the default model to a mid-tier option and only escalate explicitly.`,
        ],
        configPatch: `# In OpenClaw config, set default model:\ndefaultModel: gpt-4o-mini  # or claude-haiku-4-5`,
      },
    ];
  },
};
