// Detector interface for OpenClaw — mirrors the Claude Code detector types
// but operates on OpenClawSessionStats instead of Claude Code's SessionStats.

import type { OpenClawSessionStats } from '../session.js';

export interface OpenClawInsight {
  id: string;
  detectorId: string;
  sessionId: string;
  agentId: string;
  title: string;
  description: string;
  savingsEstimateUsd: number;
  effortMinutes: number;
  fixSteps: string[];
  // OpenClaw equivalent of claudeMdPatch — a config snippet or setting to change.
  configPatch: string | null;
}

export interface OpenClawDetector {
  id: string;
  run(stats: OpenClawSessionStats): OpenClawInsight[];
}

export interface OpenClawMultiDetector {
  id: string;
  runMulti(allStats: readonly OpenClawSessionStats[]): OpenClawInsight[];
}

export function makeInsightId(detectorId: string, sessionId: string): string {
  return `openclaw::${detectorId}::${sessionId}`;
}
