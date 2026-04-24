// Detector: Late-night sessions (00:00–05:00 local time).
//
// Same pattern as the Claude Code tired-coding detector. Sessions run in the
// early hours average significantly more back-and-forth (fatigue → unclear
// prompts → more correction turns) and therefore cost more per unit of useful
// output. Flagging them helps users understand the fatigue tax.
//
// Fires when: session started between 00:00 and 05:00 local time.
// Savings estimate: 40% reduction if the same work is done during alert hours
// (based on the Claude Code baseline from Garvit's own data).

import type { OpenClawDetector } from './types.js';
import { makeInsightId } from './types.js';

const LATE_NIGHT_START_HOUR = 0;  // midnight
const LATE_NIGHT_END_HOUR = 5;    // 5am exclusive

export const lateNightDetector: OpenClawDetector = {
  id: 'late-night',

  run(stats) {
    if (stats.startedAtMs === undefined) return [];
    if (stats.totalCostUsd < 0.05) return [];

    const startDate = new Date(stats.startedAtMs);
    const hour = startDate.getHours(); // local time

    if (hour < LATE_NIGHT_START_HOUR || hour >= LATE_NIGHT_END_HOUR) return [];

    const savingsEstimateUsd = stats.totalCostUsd * 0.4;
    const timeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return [
      {
        id: makeInsightId('late-night', stats.sessionId),
        detectorId: 'late-night',
        sessionId: stats.sessionId,
        agentId: stats.agentId,
        title: `Late-night session (${timeStr}) — fatigue tax on your AI spend`,
        description:
          `This OpenClaw session started at ${timeStr}. Sessions in the 00:00–05:00 window ` +
          `tend to cost ~2x more per unit of useful output because tired users write vague ` +
          `prompts, require more correction turns, and abandon work mid-session. ` +
          `This session cost $${stats.totalCostUsd.toFixed(3)}.`,
        savingsEstimateUsd,
        effortMinutes: 0,
        fixSteps: [
          `Write a detailed prompt in a notes file before sleeping — run it fresh in the morning.`,
          `Set an OpenClaw session budget alert for late-night hours so you catch runaway sessions early.`,
          `Consider disabling your most expensive model after midnight and using a cheaper one as the default.`,
        ],
        configPatch: null,
      },
    ];
  },
};
