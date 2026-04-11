// Detector registry — exports all v1 detectors and provides a runner that
// applies every registered detector to a single SessionStats.
//
// Two kinds of detectors:
// 1. Per-session detectors: implement the Detector interface (single SessionStats input).
// 2. Multi-session detectors: take ALL SessionStats and produce insights that
//    span sessions (e.g., project-cost-outlier needs cross-session comparison).

import type { Detector, Insight } from './types.js';
import type { SessionStats } from '../session.js';

import { longBashOutputDetector } from './long-bash-output.js';
import { repeatedReadDetector } from './repeated-read.js';
import { thrashDetector } from './thrash.js';
import { toolOveruseDetector } from './tool-overuse.js';
import { tiredCodingDetector } from './tired-coding.js';
import { retryStormDetector } from './retry-storm.js';
import { skillFiringDetector } from './skill-firing.js';
import { projectCostOutlierDetector } from './project-cost-outlier.js';

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
]);

// Multi-session detectors. Each runs against ALL SessionStats and returns
// zero or more Insights that span sessions.
export const MULTI_SESSION_DETECTORS = Object.freeze([projectCostOutlierDetector]);

// Run every per-session detector against a single SessionStats.
export function runAllDetectors(stats: SessionStats): Insight[] {
  const insights: Insight[] = [];
  for (const detector of ALL_DETECTORS) {
    insights.push(...detector.run(stats));
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

export type { Detector, Insight } from './types.js';
