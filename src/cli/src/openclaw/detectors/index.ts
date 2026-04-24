// OpenClaw detector registry.
//
// 5 per-session detectors + 1 multi-session detector.
// Each targets a distinct OpenClaw-specific cost pattern.

import type { OpenClawDetector, OpenClawInsight } from './types.js';
import type { OpenClawSessionStats } from '../session.js';

import { expensiveModelDetector } from './expensive-model.js';
import { cacheUnderuseDetector } from './cache-underuse.js';
import { lateNightDetector } from './late-night.js';
import { providerSwitchingDetector } from './provider-switching.js';
import { highOutputRatioDetector } from './high-output-ratio.js';
import { agentCostOutlierDetector } from './agent-cost-outlier.js';

export const ALL_OPENCLAW_DETECTORS: readonly OpenClawDetector[] = Object.freeze([
  expensiveModelDetector,
  cacheUnderuseDetector,
  lateNightDetector,
  providerSwitchingDetector,
  highOutputRatioDetector,
]);

export const OPENCLAW_MULTI_DETECTORS = Object.freeze([agentCostOutlierDetector]);

export function runAllOpenClawDetectors(stats: OpenClawSessionStats): OpenClawInsight[] {
  const insights: OpenClawInsight[] = [];
  for (const detector of ALL_OPENCLAW_DETECTORS) {
    insights.push(...detector.run(stats));
  }
  return insights;
}

export function runAllOpenClawMultiDetectors(
  allStats: readonly OpenClawSessionStats[],
): OpenClawInsight[] {
  const insights: OpenClawInsight[] = [];
  for (const detector of OPENCLAW_MULTI_DETECTORS) {
    insights.push(...detector.runMulti(allStats));
  }
  return insights;
}

export type { OpenClawDetector, OpenClawInsight } from './types.js';
