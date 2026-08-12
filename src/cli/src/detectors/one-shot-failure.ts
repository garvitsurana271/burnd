// One-shot-failure detector (Burnd detector #9).
//
// Measures the rate at which Claude's edit/write tool calls return errors —
// a proxy for "didn't get it right on the first try." Inspired by CodeBurn's
// One-Shot Rate metric, but framed Burnd-style: dollar cost + prescriptive
// fix, not just the metric.
//
// CAVEAT: this detector only catches edits that returned explicit tool errors
// (file not found, syntax mismatch, etc.). It does NOT catch the "Claude
// successfully edited but the edit was semantically wrong and got corrected
// in a follow-up turn" case — that requires sequence analysis we don't have
// yet. A v0.0.19 refinement should add edit-pair sequence detection.
//
// Threshold: 25%+ error rate on Edit + Write tools, minimum 4 total calls.
// Sessions with very few edits don't have enough signal to flag.

import type { Detector, Insight } from './types.js';
import { makeInsightId } from './types.js';
import type { SessionStats } from '../session.js';

const ID = 'one-shot-failure';
const MIN_CALLS = 4;
const MIN_ERROR_RATE = 0.25; // 25%
// Average cost-per-failed-edit estimate. Each failure usually triggers a
// follow-up turn that pays full context cost on the retry. Conservative:
// ~3,000 input tokens at $3/M for the retry context = ~$0.01 per error.
// Real cost is often higher because the original edit also burned output
// tokens.
const USD_PER_FAILED_EDIT = 0.015;

export const oneShotFailureDetector: Detector = {
  id: ID,
  run(stats: SessionStats): Insight[] {
    // Sum Edit + Write + MultiEdit tools — these are the ones where "got
    // it right first try" matters. Bash/Grep/Read failures are a different
    // class of leak.
    const editTools = ['Edit', 'Write', 'MultiEdit'];
    let totalCalls = 0;
    let totalErrors = 0;
    const perToolBreakdown: Array<{ name: string; calls: number; errors: number }> = [];

    for (const name of editTools) {
      const t = stats.toolStats.get(name);
      if (!t || t.callCount === 0) continue;
      totalCalls += t.callCount;
      totalErrors += t.errorCount;
      perToolBreakdown.push({ name, calls: t.callCount, errors: t.errorCount });
    }

    if (totalCalls < MIN_CALLS) return [];

    const errorRate = totalErrors / totalCalls;
    if (errorRate < MIN_ERROR_RATE) return [];

    const oneShotPct = Math.round((1 - errorRate) * 100);
    const savingsUsd = totalErrors * USD_PER_FAILED_EDIT;
    if (savingsUsd < 0.05) return [];

    const breakdownStr = perToolBreakdown
      .filter((p) => p.errors > 0)
      .map((p) => `${p.name}: ${p.errors}/${p.calls} failed`)
      .join(', ');

    return [
      {
        id: makeInsightId(ID, stats.sessionId),
        detectorId: ID,
        sessionId: stats.sessionId,
        projectDir: stats.projectDir,
        title: `One-shot rate ${oneShotPct}% — Claude is missing on ${totalErrors} of ${totalCalls} edits`,
        description:
          `Claude's first-attempt success rate on edit-class tools in this session is ${oneShotPct}%. ` +
          `${totalErrors} edits returned errors out of ${totalCalls} total. Each failed edit usually ` +
          `triggers a corrective follow-up that pays full context cost on the retry. Estimated wasted ` +
          `spend on the retries: $${savingsUsd.toFixed(2)}.`,
        savingsEstimateUsd: savingsUsd,
        effortMinutes: 4,
        fixSteps: [
          'Low one-shot rates usually mean Claude is editing without enough context. The fastest fix is to give it the file structure upfront — paste the relevant function signatures or interfaces into your prompt before asking for changes.',
          'For string-match-based Edit tools, exact-match failures are the most common cause. Run the file through a formatter before editing so Claude sees a stable canonical version.',
          'If errors cluster on one tool (e.g., MultiEdit), prefer single Edit calls until you confirm Claude has the context right.',
        ],
        detailedFixSteps: [
          `This session's one-shot rate on edit-class tools: ${oneShotPct}%. Breakdown: ${breakdownStr}. Estimated wasted retry cost: $${savingsUsd.toFixed(2)}.`,
          `The two most common causes of low one-shot rates: (a) Claude is editing files it hasn't read in this session (give it Read first), (b) string-match Edit calls failing because of whitespace/quote drift between Claude's expected and actual file content.`,
          `Immediate fix — add to your CLAUDE.md: "Before any Edit call, confirm you have the exact current file contents in context. Prefer reading the file first if you haven't this session."`,
          `If MultiEdit is your biggest offender: it's the highest-leverage tool when it works and the highest-cost when it fails. Consider breaking complex multi-edit operations into sequential Edit calls until your one-shot rate stabilizes.`,
          `Long-term: a one-shot rate under 75% on a recurring project usually means the project is at the edge of Claude's effective context window for the kind of changes you're making. Smaller, more focused tasks rebuild the rate.`,
        ],
        claudeMdPatch: `Before any Edit call, confirm you have the exact current file contents in context. Read the file first if you haven't this session. Prefer single Edit calls over MultiEdit until one-shot success is consistent.`,
      },
    ];
  },
};
