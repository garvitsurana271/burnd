// Detector registry — exports all v1 detectors and provides a runner that
// applies every registered detector to a single SessionStats.
//
// Two kinds of detectors:
// 1. Per-session detectors: implement the Detector interface (single SessionStats input).
// 2. Multi-session detectors: take ALL SessionStats and produce insights that
//    span sessions (e.g., project-cost-outlier needs cross-session comparison).

import type { Detector, Insight, UserBaseline } from './types.js';
import type { SessionStats } from '../session.js';

// Compute percentile statistics across the user's full session history.
// Used to flag sessions that are outliers for THIS user, independent of
// absolute dollar scale.
export function computeUserBaseline(allStats: readonly SessionStats[]): UserBaseline {
  const costs = allStats
    .map((s) => s.totalCostUsd)
    .filter((c) => c > 0)
    .sort((a, b) => a - b);

  const pct = (p: number): number => {
    if (costs.length === 0) return 0;
    const idx = Math.min(costs.length - 1, Math.floor((p / 100) * costs.length));
    return costs[idx] ?? 0;
  };

  const totalSpend = costs.reduce((a, b) => a + b, 0);

  // IANA timezone from system settings. Fallback to UTC.
  let localTimezone = 'UTC';
  try {
    localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
  } catch {
    // keep UTC
  }

  // Infer the user's focus window from when they actually code.
  // Build a histogram of session-start hours in LOCAL time, find the
  // contiguous 10-hour window containing the most sessions.
  const hourCounts = new Array(24).fill(0);
  for (const s of allStats) {
    if (!s.startedAt) continue;
    const d = new Date(s.startedAt);
    try {
      const localHour = Number(
        d.toLocaleString('en-US', {
          timeZone: localTimezone,
          hour: 'numeric',
          hour12: false,
        }),
      );
      if (Number.isFinite(localHour) && localHour >= 0 && localHour < 24) {
        hourCounts[localHour] += 1;
      }
    } catch {
      // skip
    }
  }
  // Find the 10-hour window with the most session-starts.
  let bestStart = 9;
  let bestCount = -1;
  for (let start = 0; start < 24; start++) {
    let sum = 0;
    for (let h = 0; h < 10; h++) sum += hourCounts[(start + h) % 24];
    if (sum > bestCount) {
      bestCount = sum;
      bestStart = start;
    }
  }
  // Default to standard working hours if no data.
  if (bestCount <= 0) { bestStart = 9; }

  return {
    sessionCostP50: pct(50),
    sessionCostP75: pct(75),
    sessionCostP90: pct(90),
    totalSpendUsd: totalSpend,
    sessionCount: costs.length,
    localTimezone,
    focusWindowStart: bestStart,
    focusWindowEnd: (bestStart + 10) % 24,
  };
}

// Helper for detectors: return the hour-of-day (0-23) of a session start
// in the user's local timezone.
export function localHour(isoTimestamp: string, timezone: string): number {
  try {
    return Number(
      new Date(isoTimestamp).toLocaleString('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false,
      }),
    );
  } catch {
    return new Date(isoTimestamp).getUTCHours();
  }
}

import { longBashOutputDetector } from './long-bash-output.js';
import { repeatedReadDetector } from './repeated-read.js';
import { thrashDetector } from './thrash.js';
import { toolOveruseDetector } from './tool-overuse.js';
import { tiredCodingDetector } from './tired-coding.js';
import { retryStormDetector } from './retry-storm.js';
import { skillFiringDetector } from './skill-firing.js';
import { projectCostOutlierDetector } from './project-cost-outlier.js';
import { modelSubstitutionDetector } from './model-substitution.js';
import { oneShotFailureDetector } from './one-shot-failure.js';

// Per-session detectors. Each runs against ONE SessionStats and returns
// zero or more Insights.
export const ALL_DETECTORS: readonly Detector[] = Object.freeze([
  longBashOutputDetector,
  repeatedReadDetector,
  thrashDetector,
  toolOveruseDetector,
  tiredCodingDetector,
  retryStormDetector,
  skillFiringDetector,
  modelSubstitutionDetector,
  oneShotFailureDetector,
]);

// Multi-session detectors. Each runs against ALL SessionStats and returns
// zero or more Insights that span sessions.
export const MULTI_SESSION_DETECTORS = Object.freeze([projectCostOutlierDetector]);

// Run every per-session detector against a single SessionStats with the
// user's computed baseline. Baseline is optional for callers that haven't
// been updated yet — detectors should degrade gracefully when it's missing.
export function runAllDetectors(stats: SessionStats, baseline?: UserBaseline): Insight[] {
  const insights: Insight[] = [];
  for (const detector of ALL_DETECTORS) {
    insights.push(...detector.run(stats, baseline));
  }
  return insights;
}

// Run every multi-session detector against the full SessionStats array.
export function runAllMultiSessionDetectors(allStats: readonly SessionStats[]): Insight[] {
  const insights: Insight[] = [];
  for (const detector of MULTI_SESSION_DETECTORS) {
    insights.push(...detector.runMulti(allStats));
  }
  return insights;
}

export type { Detector, Insight, UserBaseline } from './types.js';
