// Tool overuse detector.
//
// When a single tool dominates a session's calls (e.g., 80% of all calls
// are Bash), it often indicates the agent is using the wrong abstraction
// — for example, falling back to Bash when Edit or Read would be cheaper
// and faster.
//
// We flag sessions where one tool's call share exceeds 70% AND total
// tool call count is at least 10 AND session cost is > $0.25.

import type { Detector, Insight } from './types.js';
import { makeInsightId } from './types.js';
import type { SessionStats } from '../session.js';

const ID = 'tool-overuse';
const SHARE_THRESHOLD = 0.7;
const MIN_TOTAL_CALLS = 10;
const MIN_COST_USD = 0.25;

export const toolOveruseDetector: Detector = {
  id: ID,
  run(stats: SessionStats): Insight[] {
    if (stats.totalCostUsd < MIN_COST_USD) return [];

    let totalCalls = 0;
    let topTool = '';
    let topCount = 0;
    for (const [name, t] of stats.toolStats.entries()) {
      totalCalls += t.callCount;
      if (t.callCount > topCount) {
        topCount = t.callCount;
        topTool = name;
      }
    }
    if (totalCalls < MIN_TOTAL_CALLS) return [];

    const share = topCount / totalCalls;
    if (share < SHARE_THRESHOLD) return [];

    // Conservative savings estimate: if the user could replace half the
    // overused calls with a cheaper alternative, they'd save ~30% of the
    // session cost on those calls.
    const savingsUsd = stats.totalCostUsd * share * 0.15;

    return [
      {
        id: makeInsightId(ID, stats.sessionId),
        detectorId: ID,
        sessionId: stats.sessionId,
        projectDir: stats.projectDir,
        title: `${topTool} accounts for ${(share * 100).toFixed(0)}% of tool calls — likely overuse`,
        description:
          `In this session, ${topCount} of ${totalCalls} tool calls (${(share * 100).toFixed(0)}%) ` +
          `were ${topTool}. Heavy reliance on a single tool often means a cheaper alternative is ` +
          `available — for example, using Edit instead of Read+Write+Bash, or using Glob/Grep ` +
          `instead of repeated Bash 'find' calls. Switching half the ${topTool} calls to a ` +
          `cheaper tool could save approximately $${savingsUsd.toFixed(2)} on this session.`,
        savingsEstimateUsd: savingsUsd,
        effortMinutes: 8,
        fixSteps: [
          `Review when ${topTool} was used in this session (Sessions view will show the exact calls).`,
          `For each ${topTool} call, ask: could a more specialized tool have done this in fewer tokens?`,
          'Update your CLAUDE.md or initial prompt to nudge Claude toward the cheaper tool by default.',
          'Re-run the workflow next week and compare the cost in Burnd.',
        ],
      },
    ];
  },
};
