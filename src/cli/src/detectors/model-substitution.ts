// Model substitution detector.
//
// Flags sessions that ran on claude-opus-4-6 where the output profile
// suggests claude-sonnet-4-6 would have been sufficient. Opus is 5x the
// price of Sonnet — routine tasks (short edits, reads, simple answers)
// rarely need its extra reasoning depth.
//
// Heuristic: if the session averaged < 400 output tokens per assistant turn,
// it was probably not doing the kind of deep, multi-step synthesis that
// justifies Opus. We calculate exact savings using the per-token totals
// already tracked in SessionStats and Sonnet's published rates.

import type { Detector, Insight } from './types.js';
import { makeInsightId } from './types.js';
import type { SessionStats } from '../session.js';
import { ratesForModel } from '../pricing.js';

const ID = 'model-substitution';
const OPUS_MODEL = 'claude-opus-4-6';
const SONNET_MODEL = 'claude-sonnet-4-6';

// Sessions averaging more than this many output tokens per turn are likely
// doing non-trivial reasoning — leave them alone.
const MAX_AVG_OUTPUT_TOKENS_PER_TURN = 400;

// Don't surface an insight if the savings are too small to matter.
const MIN_SAVINGS_USD = 0.05;

export const modelSubstitutionDetector: Detector = {
  id: ID,

  run(stats: SessionStats): Insight[] {
    if (!stats.modelsSeen.has(OPUS_MODEL)) return [];
    if (stats.assistantTurnCount === 0) return [];

    const avgOutputPerTurn = stats.totalOutputTokens / stats.assistantTurnCount;
    if (avgOutputPerTurn > MAX_AVG_OUTPUT_TOKENS_PER_TURN) return [];

    // Exact savings calculation: replay the same token counts at Sonnet rates.
    const sonnetRates = ratesForModel(SONNET_MODEL);
    const sonnetCostUsd =
      (stats.totalInputTokens * sonnetRates.input +
        stats.totalCacheReadTokens * sonnetRates.cacheRead +
        stats.totalCacheCreate5mTokens * sonnetRates.cacheWrite5m +
        stats.totalCacheCreate1hTokens * sonnetRates.cacheWrite1h +
        stats.totalOutputTokens * sonnetRates.output) /
      1_000_000;

    const savingsUsd = stats.totalCostUsd - sonnetCostUsd;
    if (savingsUsd < MIN_SAVINGS_USD) return [];

    const pctSavings = Math.round((savingsUsd / stats.totalCostUsd) * 100);
    const avgRounded = Math.round(avgOutputPerTurn);

    return [
      {
        id: makeInsightId(ID, stats.sessionId),
        detectorId: ID,
        sessionId: stats.sessionId,
        projectDir: stats.projectDir,
        title: `Opus on routine work — switch to Sonnet and save ~${pctSavings}% per session like this`,
        description:
          `This session ran on claude-opus-4-6 but averaged only ${avgRounded} output tokens per ` +
          `assistant turn — the pattern of routine work (short edits, reads, quick answers) that ` +
          `Sonnet handles just as well at 1/5th the price. ` +
          `This session cost $${stats.totalCostUsd.toFixed(2)}; the same work at Sonnet rates ` +
          `would have cost $${sonnetCostUsd.toFixed(2)}. ` +
          `If similar sessions are still happening, switching the default model to Sonnet will ` +
          `cut that recurring cost by ~${pctSavings}% going forward.`,
        savingsEstimateUsd: savingsUsd,
        effortMinutes: 2,
        fixSteps: [
          'Set the default model: add `model: claude-sonnet-4-6` to your CLAUDE.md (or change it in Claude Code settings).',
          'Use /model in-session to upgrade to Opus only when you hit a genuinely hard reasoning problem.',
          'Reserve Opus for architecture decisions, complex debugging, or novel multi-step planning — not file edits and reads.',
        ],
        proFixSteps: [
          `This session (${stats.sessionId.slice(0, 8)}…) ran ${stats.assistantTurnCount} turns at an average of ${avgRounded} output tokens/turn — well below the 400-token threshold where Opus adds measurable value.`,
          `Exact cost breakdown: input $${(stats.totalInputTokens * ratesForModel(OPUS_MODEL).input / 1_000_000).toFixed(3)}, cache reads $${(stats.totalCacheReadTokens * ratesForModel(OPUS_MODEL).cacheRead / 1_000_000).toFixed(3)}, output $${(stats.totalOutputTokens * ratesForModel(OPUS_MODEL).output / 1_000_000).toFixed(3)}. At Sonnet rates that drops to $${sonnetCostUsd.toFixed(3)} total.`,
          `To switch immediately: run \`claude config set model claude-sonnet-4-6\` in your terminal, OR add \`model: claude-sonnet-4-6\` to the CLAUDE.md in ${stats.projectDir.split('-').slice(-2).join('/')}.`,
          `If you need Opus mid-session for a hard problem, type /model claude-opus-4-6 at that point — then /model claude-sonnet-4-6 to switch back when the hard part is done.`,
          `Follow-up: run \`npx getburnd\` again in 7 days. If model-substitution insights drop out of your top leaks, the switch worked. Target: last-7-days cost under $${(stats.totalCostUsd * 0.25).toFixed(2)} for sessions like this.`,
        ],
        claudeMdPatch: `model: claude-sonnet-4-6`,
      },
    ];
  },
};
