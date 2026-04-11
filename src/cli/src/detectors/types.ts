// Detector framework — each detector takes a SessionStats and produces
// a list of Insights with dollar values, effort estimates, and fix steps.
//
// The Insight shape is the contract between detectors and the dashboard.
// Adding a new detector means writing a new file that implements the
// Detector interface and adding it to detectors/index.ts.

import type { SessionStats } from '../session.js';

export interface Insight {
  // Stable identifier for this insight type. Used for "mark as fixed"
  // tracking in the dashboard. Format: 'detector-id::session-id'.
  id: string;
  // Which detector produced this insight. Used for filtering and grouping.
  detectorId: string;
  // Session this insight belongs to.
  sessionId: string;
  projectDir: string;
  // Short, action-oriented title (e.g., "Long Bash output is wasting tokens").
  // Shown as the first line of the insight in the terminal output.
  title: string;
  // One-paragraph explanation. Shown when the user clicks/expands.
  description: string;
  // Estimated USD savings if the user implements the fix.
  savingsEstimateUsd: number;
  // Rough time-to-fix in minutes. Used for the "effort" column.
  effortMinutes: number;
  // Concrete steps the user should take. Each step is one short sentence.
  fixSteps: string[];
}

export interface Detector {
  id: string;
  // Run on a single session's stats. Returns zero or more insights.
  // Detectors must be pure with respect to their input — no globals,
  // no I/O, no shared state. This makes them trivially testable.
  run(stats: SessionStats): Insight[];
}

// Helper for stable insight IDs.
export function makeInsightId(detectorId: string, sessionId: string): string {
  return `${detectorId}::${sessionId}`;
}
