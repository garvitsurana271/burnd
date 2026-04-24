// Insights ranking — orders detector output by estimated savings (highest
// first) and exposes a "top N" helper that the CLI uses to print the
// 3-leak summary on stdout.
//
// Diversity rule: the top-N selection rotates through detector types so a
// single detector never crowds out all the others. Within each detector slot
// we always pick the highest-savings representative.

import type { Insight } from './detectors/index.js';

export function rankBySavings(insights: Insight[]): Insight[] {
  return [...insights].sort((a, b) => b.savingsEstimateUsd - a.savingsEstimateUsd);
}

// Pick at most `maxPerDetector` insights per detector type, then rank the
// resulting pool by savings. This prevents one noisy detector (e.g.,
// model-substitution on a project with many big Opus sessions) from
// filling every top-N slot.
export function topNBySavings(insights: Insight[], n: number, maxPerDetector = 1): Insight[] {
  if (n === Infinity || n > insights.length) {
    // When callers ask for everything (lib.ts), skip the diversity cap.
    return rankBySavings(insights);
  }

  // Group by detector, keep the top-savings representative per group.
  const byDetector = new Map<string, Insight[]>();
  for (const insight of insights) {
    const bucket = byDetector.get(insight.detectorId) ?? [];
    bucket.push(insight);
    byDetector.set(insight.detectorId, bucket);
  }

  // Sort within each bucket (best first), then interleave across detectors
  // round-robin style so variety is guaranteed even when n > detector count.
  const buckets = [...byDetector.values()].map((b) =>
    [...b].sort((a, c) => c.savingsEstimateUsd - a.savingsEstimateUsd),
  );
  // Sort the buckets themselves so the highest-value detector leads each round.
  buckets.sort((a, b) => (b[0]?.savingsEstimateUsd ?? 0) - (a[0]?.savingsEstimateUsd ?? 0));

  const result: Insight[] = [];
  let round = 0;
  while (result.length < n) {
    let added = 0;
    for (const bucket of buckets) {
      if (result.length >= n) break;
      const insight = bucket[round];
      if (insight && round < maxPerDetector) {
        result.push(insight);
        added++;
      }
    }
    if (added === 0) break; // exhausted all buckets
    round++;
  }

  return result;
}

export function totalSavingsUsd(insights: Insight[]): number {
  return insights.reduce((acc, i) => acc + i.savingsEstimateUsd, 0);
}
