// Detector registry — exports all v1 detectors and provides a runner that
// applies every registered detector to a single SessionStats.

import type { Detector, Insight } from './types.js';
import type { SessionStats } from '../session.js';

import { longBashOutputDetector } from './long-bash-output.js';
import { repeatedReadDetector } from './repeated-read.js';
import { thrashDetector } from './thrash.js';
import { toolOveruseDetector } from './tool-overuse.js';

// The v1 detector list. Add new detectors here.
// Week 3 will add: skill-firing, project-cost-outlier, tired-coding, retry-storm.
export const ALL_DETECTORS: readonly Detector[] = Object.freeze([
  longBashOutputDetector,
  repeatedReadDetector,
  thrashDetector,
  toolOveruseDetector,
]);

// Run every detector against a single session and return all insights.
export function runAllDetectors(stats: SessionStats): Insight[] {
  const insights: Insight[] = [];
  for (const detector of ALL_DETECTORS) {
    insights.push(...detector.run(stats));
  }
  return insights;
}

export type { Detector, Insight } from './types.js';
