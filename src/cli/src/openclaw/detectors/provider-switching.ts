// Detector: Excessive provider/model switching within a session.
//
// OpenClaw emits a model_change record every time the active model changes.
// Multiple model switches within a single session suggests the user is
// experimenting or thrashing — each context switch forces the model to
// re-read the conversation from scratch (no cross-provider cache sharing),
// which burns tokens on context re-ingestion.
//
// Fires when: 3+ model switches AND session cost > $0.10.
// Savings: 30% — consolidating to one model per session eliminates re-ingestion.

import type { OpenClawDetector } from './types.js';
import { makeInsightId } from './types.js';

const SWITCH_THRESHOLD = 3;

export const providerSwitchingDetector: OpenClawDetector = {
  id: 'provider-switching',

  run(stats) {
    if (stats.modelSwitchCount < SWITCH_THRESHOLD) return [];
    if (stats.totalCostUsd < 0.10) return [];

    const savingsEstimateUsd = stats.totalCostUsd * 0.3;
    const modelList = [...stats.modelStats.keys()].join(', ');

    return [
      {
        id: makeInsightId('provider-switching', stats.sessionId),
        detectorId: 'provider-switching',
        sessionId: stats.sessionId,
        agentId: stats.agentId,
        title: `${stats.modelSwitchCount} model switches in one session — context re-ingestion waste`,
        description:
          `This session switched models ${stats.modelSwitchCount} times (${modelList}). ` +
          `Every switch forces the new model to re-ingest the entire conversation context from scratch — ` +
          `no cross-provider cache sharing exists. At ${stats.assistantMessageCount} messages, ` +
          `that's significant repeated token cost. ` +
          `Estimated waste from re-ingestion: ~$${savingsEstimateUsd.toFixed(3)}.`,
        savingsEstimateUsd,
        effortMinutes: 5,
        fixSteps: [
          `Pick one model per task type and stick with it for the entire session.`,
          `Use OpenClaw's routing rules to route tasks deterministically rather than switching manually.`,
          `If you need multiple models, split the work into separate OpenClaw sessions (one per model) — this preserves each model's cache.`,
        ],
        configPatch: `# Lock model for this agent in openclaw config:\nagents:\n  main:\n    model: gpt-4o  # pick one and stick with it`,
      },
    ];
  },
};
