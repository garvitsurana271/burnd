// Thrash detector.
//
// Sessions where many tool calls return errors usually indicate the agent
// is "thrashing" — making repeated failed attempts that all cost tokens
// without producing usable output. Common causes: a flaky build, a wrong
// path, a permission denied error that the agent keeps retrying.
//
// We flag sessions where the error rate across all tools exceeds 25%
// AND the total cost is > $0.50 (so we don't bother flagging tiny sessions).

import type { Detector, Insight } from './types.js';
import { makeInsightId } from './types.js';
import type { SessionStats } from '../session.js';

const ID = 'thrash';
const ERROR_RATE_THRESHOLD = 0.25;
const MIN_COST_USD = 0.5;

export const thrashDetector: Detector = {
  id: ID,
  run(stats: SessionStats): Insight[] {
    if (stats.totalCostUsd < MIN_COST_USD) return [];

    let totalCalls = 0;
    let totalErrors = 0;
    for (const t of stats.toolStats.values()) {
      totalCalls += t.callCount;
      totalErrors += t.errorCount;
    }
    if (totalCalls === 0) return [];

    const errorRate = totalErrors / totalCalls;
    if (errorRate < ERROR_RATE_THRESHOLD) return [];

    // Approximate "wasted on failed work" as the cost-share of failed calls.
    // This is a heuristic — failed calls don't cost the same as successful
    // ones, but it's a reasonable order-of-magnitude estimate.
    const wastedCostUsd = stats.totalCostUsd * errorRate * 0.5;

    return [
      {
        id: makeInsightId(ID, stats.sessionId),
        detectorId: ID,
        sessionId: stats.sessionId,
        projectDir: stats.projectDir,
        title: `Tool error storm — ${(errorRate * 100).toFixed(0)}% of calls failed, wasting ~$${wastedCostUsd.toFixed(2)}`,
        description:
          `${totalErrors} of ${totalCalls} tool calls (${(errorRate * 100).toFixed(0)}%) returned ` +
          `errors in this session. The agent kept trying despite the failures, costing about ` +
          `$${wastedCostUsd.toFixed(2)} in wasted thrash. The most common cause is a flaky ` +
          `command, a wrong file path, or a missing permission that the agent didn't recognize as terminal.`,
        savingsEstimateUsd: wastedCostUsd,
        effortMinutes: 10,
        fixSteps: [
          'Review the failed tool calls in this session (Burnd will list them in the Sessions view).',
          'Identify the root cause of the failures (often a single misconfiguration or missing dependency).',
          'Fix the underlying issue and re-run the workflow.',
          'If the agent kept trying obviously failing commands, add a CLAUDE.md hint telling it when to give up early.',
        ],
      },
    ];
  },
};
