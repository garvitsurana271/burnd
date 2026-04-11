// Insights ranking — orders detector output by estimated savings (highest
// first) and exposes a "top N" helper that the CLI uses to print the
// 3-leak summary on stdout.

import type { Insight } from './detectors/index.js';

export function rankBySavings(insights: Insight[]): Insight[] {
  return [...insights].sort((a, b) => b.savingsEstimateUsd - a.savingsEstimateUsd);
}

export function topNBySavings(insights: Insight[], n: number): Insight[] {
  return rankBySavings(insights).slice(0, n);
}

export function totalSavingsUsd(insights: Insight[]): number {
  return insights.reduce((acc, i) => acc + i.savingsEstimateUsd, 0);
}
