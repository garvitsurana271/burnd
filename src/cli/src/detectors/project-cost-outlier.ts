// Project-cost-outlier detector — the only detector that needs to look
// at MULTIPLE sessions to fire, because "outlier" is a comparative concept.
//
// Unlike the per-session detectors, this one takes a list of all SessionStats
// across all of the user's sessions, computes a cost-per-session distribution
// per project, and flags any project whose median session cost is 3x or
// more than the user's overall median.
//
// The Detector interface only takes a single SessionStats, so this detector
// implements a different signature and is run separately by the CLI runner.

import type { Insight } from './types.js';
import { makeInsightId } from './types.js';
import type { SessionStats } from '../session.js';

const ID = 'project-cost-outlier';
const MULTIPLIER = 3;
const MIN_SESSIONS_PER_PROJECT = 3;

export const projectCostOutlierDetector = {
  id: ID,
  // Multi-session signature — takes ALL sessions and returns insights.
  runMulti(allStats: readonly SessionStats[]): Insight[] {
    // Group sessions by project.
    const byProject = new Map<string, SessionStats[]>();
    for (const s of allStats) {
      let arr = byProject.get(s.projectDir);
      if (!arr) {
        arr = [];
        byProject.set(s.projectDir, arr);
      }
      arr.push(s);
    }

    // Compute the user's overall median session cost.
    const allCosts = allStats.map((s) => s.totalCostUsd).sort((a, b) => a - b);
    if (allCosts.length === 0) return [];
    const overallMedian = allCosts[Math.floor(allCosts.length / 2)] ?? 0;
    if (overallMedian === 0) return [];

    const insights: Insight[] = [];
    for (const [projectDir, projectSessions] of byProject.entries()) {
      if (projectSessions.length < MIN_SESSIONS_PER_PROJECT) continue;

      const projectCosts = projectSessions.map((s) => s.totalCostUsd).sort((a, b) => a - b);
      const projectMedian = projectCosts[Math.floor(projectCosts.length / 2)] ?? 0;
      if (projectMedian < overallMedian * MULTIPLIER) continue;

      const totalProjectCost = projectSessions.reduce((acc, s) => acc + s.totalCostUsd, 0);
      // Conservative estimate: if the project's per-session cost dropped
      // to the user's overall median, the savings would be roughly:
      const savingsUsd = projectSessions.length * (projectMedian - overallMedian);
      if (savingsUsd < 1) continue;

      // Use the most expensive session in the project as the "anchor" so
      // the dashboard can link to a representative example.
      const anchorSession = projectSessions.reduce(
        (a, b) => (a.totalCostUsd > b.totalCostUsd ? a : b),
      );

      insights.push({
        id: makeInsightId(ID, anchorSession.sessionId),
        detectorId: ID,
        sessionId: anchorSession.sessionId,
        projectDir,
        title: `Project "${shortProjectName(projectDir)}" costs ${(projectMedian / overallMedian).toFixed(1)}× more per session than your average — wasting ~$${savingsUsd.toFixed(2)}`,
        description:
          `Across ${projectSessions.length} sessions in this project, the median cost per ` +
          `session is $${projectMedian.toFixed(2)} — that's ${(projectMedian / overallMedian).toFixed(1)}× ` +
          `your overall median of $${overallMedian.toFixed(2)}. Total spend on this project: ` +
          `$${totalProjectCost.toFixed(2)}. If you brought this project's per-session cost down ` +
          `to your average, you would save approximately $${savingsUsd.toFixed(2)} across the ` +
          `same number of sessions.`,
        savingsEstimateUsd: savingsUsd,
        effortMinutes: 15,
        fixSteps: [
          'Investigate what makes this project unusually expensive: long sessions, large context, heavy tool use, or thrash?',
          'Check the project\'s CLAUDE.md file — is the project context bloated with too much background info?',
          'Look at the most expensive session in this project (Burnd\'s Sessions view will surface it) and identify the cost spike.',
          'Apply patterns from your cheaper projects (shorter sessions, more focused prompts, less context).',
        ],
      });
    }
    return insights;
  },
};

function shortProjectName(projectDir: string): string {
  // Project dirs are encoded paths like "c--Users-Garvit-Surana-Desktop-Projects-Burnd".
  // Take the last segment after the last dash for display.
  const parts = projectDir.split('-').filter((p) => p.length > 0);
  return parts[parts.length - 1] ?? projectDir;
}
