// Repeated-read detector.
//
// When Claude reads the same file 3+ times in a single session, it usually
// means the agent is "forgetting" the file's contents between turns. This
// is wasted spend — the second/third reads pay for context the agent
// already had access to.
//
// The fix is usually a prompt-engineering one: tell the agent to remember
// what it just read, or use Edit instead of Read+Write+Read.

import type { Detector, Insight } from './types.js';
import { makeInsightId } from './types.js';
import type { SessionStats } from '../session.js';

const ID = 'repeated-read';
const MIN_REPEATS = 3;
// Conservative average cost-per-Read estimate. Real value depends on file
// size; we assume an average ~2 KB file = 500 tokens at $15/million.
const USD_PER_REREAD = 0.0075;

export const repeatedReadDetector: Detector = {
  id: ID,
  run(stats: SessionStats): Insight[] {
    if (stats.readCountsByPathHash.size === 0) return [];

    let totalRereads = 0;
    let pathsWithRereads = 0;
    let worstCount = 0;
    for (const count of stats.readCountsByPathHash.values()) {
      if (count >= MIN_REPEATS) {
        totalRereads += count - 1; // First read is fine; only flag the extras.
        pathsWithRereads += 1;
        if (count > worstCount) worstCount = count;
      }
    }
    if (pathsWithRereads === 0) return [];

    const savingsUsd = totalRereads * USD_PER_REREAD;
    if (savingsUsd < 0.05) return [];

    return [
      {
        id: makeInsightId(ID, stats.sessionId),
        detectorId: ID,
        sessionId: stats.sessionId,
        projectDir: stats.projectDir,
        title: `Re-reading the same files — wasting ~$${savingsUsd.toFixed(2)}`,
        description:
          `Claude re-read ${pathsWithRereads} file(s) ${MIN_REPEATS}+ times each in this session ` +
          `(worst case: ${worstCount} reads of one file). Each extra read pays for context Claude ` +
          `should already have. Estimated wasted spend: $${savingsUsd.toFixed(2)}.`,
        savingsEstimateUsd: savingsUsd,
        effortMinutes: 3,
        fixSteps: [
          'Identify the files Claude is re-reading (Burnd will surface them in the dashboard\'s Sessions view).',
          'Adjust your prompts to remind Claude to remember file contents between turns.',
          'When making sequential edits, use Edit (which preserves the file in context) instead of Read → Write → Read.',
          'For long-running sessions, ask Claude to summarize file contents at the top of each new task instead of re-reading.',
        ],
        proFixSteps: [
          `This session re-read ${pathsWithRereads} file(s) 3+ times each — ${totalRereads} redundant reads at ~$0.0075/read = $${savingsUsd.toFixed(2)} wasted. Worst offender: read ${worstCount}× in a single session.`,
          `The repeated-read pattern almost always means: (a) Claude lost track of the file mid-task (context too long), or (b) your prompts don't anchor Claude's understanding before each sub-task.`,
          `Immediate fix — add to your CLAUDE.md: "After reading a file, note its current contents in your thinking before editing. Do not re-read a file unless the contents may have changed since your last read."`,
          `For the worst-offending file: consider adding a summary of its structure/purpose to your CLAUDE.md so Claude doesn't need to read it from scratch every session.`,
          `Longer-term: if this project consistently triggers repeated-read, your task descriptions may be too large for one session. Break complex tasks into focused sub-sessions with clear context at the start of each.`,
        ],
        claudeMdPatch: `After reading a file, note its contents before editing. Do not re-read a file unless it may have changed since your last read in this session.`,
      },
    ];
  },
};
