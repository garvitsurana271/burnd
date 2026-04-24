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
  // Concrete steps shown to all users (free tier).
  fixSteps: string[];
  // Extended, session-specific steps shown only to BurndPro users.
  // Includes exact commands, deeper diagnostics, and follow-up checks.
  proFixSteps: string[];
  // The single CLAUDE.md line (or short block) that fixes this leak.
  // Pro users can copy-paste this directly into their project's CLAUDE.md.
  // null if the fix can't be expressed as a CLAUDE.md directive.
  claudeMdPatch: string | null;
}

// Per-user baseline: distribution statistics across the user's entire
// session history. Detectors use this to flag sessions that are outliers
// for THIS user, instead of hitting absolute dollar thresholds that are
// meaningless for users at different spend levels.
export interface UserBaseline {
  sessionCostP50: number;          // median cost across all sessions
  sessionCostP75: number;
  sessionCostP90: number;
  totalSpendUsd: number;           // sum of all session costs (all time in scan window)
  sessionCount: number;
  localTimezone: string;           // IANA timezone, e.g., 'Asia/Kolkata'
  // Hours (0-23, local time) where the user has historically coded.
  // If most sessions fall between 09:00 and 19:00 local, that's the
  // user's focus window — sessions outside it are candidates for
  // "tired coding". This is DATA-DRIVEN per user, not a hardcoded rule.
  focusWindowStart: number;
  focusWindowEnd: number;
}

export interface Detector {
  id: string;
  // Run on a single session's stats + user baseline. Returns zero or more
  // insights. Detectors must be pure w.r.t. input — no globals, no I/O.
  // Baseline is optional for back-compat with simple detectors.
  run(stats: SessionStats, baseline?: UserBaseline): Insight[];
}

// Helper for stable insight IDs.
export function makeInsightId(detectorId: string, sessionId: string): string {
  return `${detectorId}::${sessionId}`;
}
