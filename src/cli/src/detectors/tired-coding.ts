// Tired-coding detector.
//
// Sessions started in the late-night hours (midnight to 5am local time)
// tend to cost more on average — likely because the user is less focused,
// agent gets worse prompts, more iterations needed. We flag sessions that
// were both started in the witching hours AND cost more than a per-user
// baseline.
//
// For v0 the baseline is hardcoded as $1.50/session. v0.2 will compute
// it as the user's own median session cost.

import type { Detector, Insight } from './types.js';
import { makeInsightId } from './types.js';
import type { SessionStats } from '../session.js';

const ID = 'tired-coding';
const BASELINE_USD = 1.5;
const LATE_HOUR_START = 0; // midnight UTC (TODO: use local time in v0.2)
const LATE_HOUR_END = 5;

export const tiredCodingDetector: Detector = {
  id: ID,
  run(stats: SessionStats): Insight[] {
    if (!stats.startedAt) return [];
    if (stats.totalCostUsd <= BASELINE_USD) return [];

    const startedAt = new Date(stats.startedAt);
    const hour = startedAt.getUTCHours();
    if (hour < LATE_HOUR_START || hour >= LATE_HOUR_END) return [];

    // Estimated savings if the user had run this same workflow during
    // alert hours instead — assume a 30% reduction in cost. Conservative.
    const savingsUsd = stats.totalCostUsd * 0.3;

    return [
      {
        id: makeInsightId(ID, stats.sessionId),
        detectorId: ID,
        sessionId: stats.sessionId,
        projectDir: stats.projectDir,
        title: `Late-night session — costs ~30% more on average`,
        description:
          `This session started at ${startedAt.toISOString()} and cost $${stats.totalCostUsd.toFixed(2)}. ` +
          `Sessions started between midnight and 5 AM tend to cost ~30% more than daytime sessions ` +
          `for similar work, because tired prompts lead to more iterations. Running the same workflow ` +
          `during the day could save approximately $${savingsUsd.toFixed(2)}.`,
        savingsEstimateUsd: savingsUsd,
        effortMinutes: 0, // Behavioral, not a code fix.
        fixSteps: [
          'When you find yourself coding past midnight, consider whether the work can wait until morning.',
          'If you must code late, write more explicit prompts to compensate for tired thinking.',
          'Set a "no Claude after 11 PM" rule for non-urgent work.',
        ],
      },
    ];
  },
};
