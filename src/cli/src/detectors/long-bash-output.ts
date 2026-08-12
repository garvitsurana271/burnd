// Long Bash output detector.
//
// Sessions where the Bash tool returns very large outputs are wasting input
// tokens on the next assistant turn (because Claude has to re-read the
// output as part of its context). The fix is usually to pipe through
// `head`, `tail`, or `grep` so the agent only sees the relevant lines.
//
// The detector flags sessions where the average Bash output exceeds a
// threshold (default 5,000 bytes per call) AND Bash was called at least
// 3 times. The savings estimate assumes the user could cut the average
// to ~1,000 bytes per call by piping more aggressively.

import type { Detector, Insight } from './types.js';
import { makeInsightId } from './types.js';
import type { SessionStats } from '../session.js';

const ID = 'long-bash-output';

// Heuristic constants. Tunable in v0.2 once we have real user data.
const MIN_CALLS = 3;
const HIGH_AVG_BYTES = 5_000;
const TARGET_AVG_BYTES = 1_000;
// Approximate token-to-byte ratio for typical command output (rough).
const BYTES_PER_TOKEN = 4;
// Cost per million input tokens (Opus rate as a conservative upper bound,
// matching the FALLBACK_RATES in pricing.ts).
const USD_PER_MILLION_INPUT_TOKENS = 15;

export const longBashOutputDetector: Detector = {
  id: ID,
  run(stats: SessionStats): Insight[] {
    const bash = stats.toolStats.get('Bash');
    if (!bash || bash.callCount < MIN_CALLS) return [];

    const avgBytes = bash.totalOutputBytes / bash.callCount;
    if (avgBytes < HIGH_AVG_BYTES) return [];

    const wastedBytesPerCall = avgBytes - TARGET_AVG_BYTES;
    const wastedTokensPerCall = wastedBytesPerCall / BYTES_PER_TOKEN;
    const totalWastedTokens = wastedTokensPerCall * bash.callCount;
    const savingsUsd = (totalWastedTokens * USD_PER_MILLION_INPUT_TOKENS) / 1_000_000;

    if (savingsUsd < 0.05) return []; // Don't flag pennies — it's annoying.

    return [
      {
        id: makeInsightId(ID, stats.sessionId),
        detectorId: ID,
        sessionId: stats.sessionId,
        projectDir: stats.projectDir,
        title: `Bash output is bloating context — wasting ~$${savingsUsd.toFixed(2)}`,
        description:
          `In this session, Bash was called ${bash.callCount} times with an average output ` +
          `of ${Math.round(avgBytes).toLocaleString()} bytes per call. Most of those bytes are ` +
          `getting fed back into Claude's context on the next turn, which costs you tokens. ` +
          `Piping commands through 'head', 'tail', or 'grep' would cut the average to ~${TARGET_AVG_BYTES} bytes ` +
          `and save approximately $${savingsUsd.toFixed(2)} of token spend on this session alone.`,
        savingsEstimateUsd: savingsUsd,
        effortMinutes: 5,
        fixSteps: [
          'Look at the Bash commands in this session that returned long output (most often: build/test runs, find, grep, ls -R).',
          "Pipe each long-output command through 'head -50', 'tail -100', or a more targeted 'grep'.",
          'For test commands, use the test runner\'s "fail-only" or "verbose=1" flag to drop passing-test noise.',
          'Re-run the same workflow in Burnd next week to confirm the savings.',
        ],
        detailedFixSteps: [
          `Bash was called ${bash.callCount} times averaging ${Math.round(avgBytes).toLocaleString()} bytes/call in this session. That's ${Math.round(totalWastedTokens).toLocaleString()} wasted input tokens — $${savingsUsd.toFixed(2)} thrown away on noise Claude doesn't need.`,
          `The highest-impact fix is usually the build/test commands. Replace \`npm test\` with \`npm test -- --reporter=min 2>&1 | tail -30\`. Replace \`npm run build\` with \`npm run build 2>&1 | grep -E "(error|warning|✓|✗)" | head -40\`.`,
          `For find/ls commands: never use \`ls -la\` or \`find . -type f\` without piping. Use \`find . -name "*.ts" | head -20\` or switch to the Glob tool entirely (no shell, no output bloat).`,
          `Add this to your CLAUDE.md: "Always pipe Bash commands that return large output. For tests: tail -50. For builds: grep errors. For file lists: head -20 or use Glob."`,
          `After optimizing: check the next similar session in Burnd's Sessions view. Target: Bash average output below 2,000 bytes/call. That brings this session's token cost from $${savingsUsd.toFixed(2)} of wasted spend down to near zero.`,
        ],
        claudeMdPatch: `Always pipe Bash commands that return large output:\n- Tests: npm test 2>&1 | tail -50\n- Builds: npm run build 2>&1 | grep -E "(error|✓|✗)" | head -40\n- File lists: use Glob tool instead of ls/find`,
      },
    ];
  },
};
