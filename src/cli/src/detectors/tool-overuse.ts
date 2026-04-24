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
        proFixSteps: [
          `${topTool} was called ${topCount} times — ${(share * 100).toFixed(0)}% of all ${totalCalls} tool calls in this session. Each unnecessary ${topTool} call sends extra tokens for shell overhead, stderr, and output parsing.`,
          topTool === 'Bash'
            ? `Bash replacements by use-case: file reads → Read tool (no shell overhead); file edits → Edit tool (sends only the diff); searching for files → Glob; searching file contents → Grep. Each of these costs 2–5× fewer tokens than the equivalent Bash command.`
            : `Check the Sessions view for the exact ${topTool} calls. Group them by purpose — batch similar calls into single operations where possible to reduce round-trips.`,
          `Add this to your CLAUDE.md: "Prefer Read over cat/head/tail. Prefer Edit over sed/awk. Prefer Glob over find. Prefer Grep over grep. Only use Bash for commands that have no dedicated tool equivalent."`,
          `Estimated impact: replacing half the ${topTool} calls saves ~${(share * 50).toFixed(0)}% of per-call token overhead. On a session like this that's roughly $${savingsUsd.toFixed(2)} per run.`,
          `After updating CLAUDE.md: compare the tool breakdown in Burnd for your next similar session. ${topTool}'s share should drop below 50%.`,
        ],
        claudeMdPatch: `Prefer Read over cat/head/tail. Prefer Edit over sed/awk. Prefer Glob over find/ls. Prefer Grep over grep/rg. Only use Bash for commands with no dedicated tool equivalent.`,
      },
    ];
  },
};
