// Top-level OpenClaw scan — walks all session files, parses them, runs
// detectors, and returns a structured result ready for CLI output or
// the web dashboard.
//
// Mirrors the shape of the Claude Code scan() in lib.ts so the CLI
// command handler can treat both sources uniformly.

import { walkOpenClawSessions } from './walker.js';
import { streamOpenClawRecords } from './parser.js';
import { newEmptyOpenClawStats, ingestOpenClawRecord } from './session.js';
import { runAllOpenClawDetectors, runAllOpenClawMultiDetectors } from './detectors/index.js';
import type { OpenClawInsight } from './detectors/index.js';
import type { OpenClawSessionStats } from './session.js';

export type { OpenClawSessionStats } from './session.js';
export type { OpenClawInsight } from './detectors/index.js';
export { defaultOpenClawRoot } from './walker.js';

export interface OpenClawScanResult {
  /** Total cost across all sessions ever recorded, in USD. */
  totalCostUsdAllTime: number;
  /** Total cost across sessions started in the last 7 days, in USD. */
  totalCostUsdLast7Days: number;
  /** Number of session files found. */
  filesScanned: number;
  /** Number of sessions parsed. */
  sessionsScanned: number;
  /** All ranked insights, highest savings first. */
  insights: OpenClawInsight[];
  /** Total estimated savings across all insights, in USD. */
  totalSavingsUsd: number;
  /** Per-session stats for dashboard / serve. */
  sessions: OpenClawSessionStats[];
  /** Per-model aggregate across all sessions. */
  modelBreakdown: Array<{
    key: string;
    provider: string;
    modelId: string;
    totalCostUsd: number;
    totalMessages: number;
    totalInputTokens: number;
    totalOutputTokens: number;
  }>;
}

export async function scanOpenClaw(root?: string): Promise<OpenClawScanResult> {
  const allStats: OpenClawSessionStats[] = [];
  let filesScanned = 0;
  let linesTotal = 0;
  let linesParsed = 0;

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  for await (const file of walkOpenClawSessions(root)) {
    filesScanned += 1;
    const stats = newEmptyOpenClawStats(file.sessionId, file.absPath, file.agentId);
    const parseStats = { linesTotal: 0, linesParsed: 0, linesSkipped: 0, bytesRead: 0 };

    for await (const record of streamOpenClawRecords(file.absPath, parseStats)) {
      ingestOpenClawRecord(stats, record);
    }

    linesTotal += parseStats.linesTotal;
    linesParsed += parseStats.linesParsed;
    allStats.push(stats);
  }

  const perSession = allStats.flatMap(runAllOpenClawDetectors);
  const multi = runAllOpenClawMultiDetectors(allStats);
  const allInsights = [...perSession, ...multi].sort(
    (a, b) => b.savingsEstimateUsd - a.savingsEstimateUsd,
  );

  const totalCostUsdAllTime = allStats.reduce((acc, s) => acc + s.totalCostUsd, 0);
  const totalCostUsdLast7Days = allStats
    .filter((s) => s.startedAtMs !== undefined && s.startedAtMs >= sevenDaysAgo)
    .reduce((acc, s) => acc + s.totalCostUsd, 0);

  const totalSavingsUsd = allInsights.reduce((acc, i) => acc + i.savingsEstimateUsd, 0);

  // Aggregate per-model stats across all sessions.
  const modelMap = new Map<string, {
    key: string; provider: string; modelId: string;
    totalCostUsd: number; totalMessages: number;
    totalInputTokens: number; totalOutputTokens: number;
  }>();

  for (const s of allStats) {
    for (const [key, ms] of s.modelStats) {
      let g = modelMap.get(key);
      if (!g) {
        g = { key, provider: ms.provider, modelId: ms.modelId, totalCostUsd: 0, totalMessages: 0, totalInputTokens: 0, totalOutputTokens: 0 };
        modelMap.set(key, g);
      }
      g.totalCostUsd += ms.totalCostUsd;
      g.totalMessages += ms.messageCount;
      g.totalInputTokens += ms.totalInputTokens;
      g.totalOutputTokens += ms.totalOutputTokens;
    }
  }

  return {
    totalCostUsdAllTime,
    totalCostUsdLast7Days,
    filesScanned,
    sessionsScanned: allStats.length,
    insights: allInsights,
    totalSavingsUsd,
    sessions: allStats,
    modelBreakdown: [...modelMap.values()].sort((a, b) => b.totalCostUsd - a.totalCostUsd),
  };
}

/** Format an OpenClawScanResult as human-readable terminal output. */
export function formatOpenClawSummary(result: OpenClawScanResult): string {
  const lines: string[] = [];

  lines.push('── Burnd: OpenClaw Spend Analysis ─────────────────────');
  lines.push('');
  lines.push(`  Total spend (all time):  $${result.totalCostUsdAllTime.toFixed(2)}`);
  lines.push(`  Last 7 days:             $${result.totalCostUsdLast7Days.toFixed(2)}`);
  lines.push(`  Sessions scanned:        ${result.sessionsScanned}`);

  if (result.modelBreakdown.length > 0) {
    lines.push('');
    lines.push('── Top models by cost ──────────────────────────────────');
    for (const m of result.modelBreakdown.slice(0, 5)) {
      lines.push(`  ${m.provider}::${m.modelId}`);
      lines.push(`    $${m.totalCostUsd.toFixed(3)} across ${m.totalMessages} messages`);
    }
  }

  if (result.insights.length === 0) {
    lines.push('');
    lines.push("  No cost leaks detected. Clean setup!");
    lines.push('');
    return lines.join('\n');
  }

  lines.push('');
  lines.push(`  Potential savings:       $${result.totalSavingsUsd.toFixed(2)}`);
  lines.push('');
  lines.push(`── Top ${Math.min(result.insights.length, 5)} leaks ────────────────────────────────────`);
  lines.push('');

  for (const insight of result.insights.slice(0, 5)) {
    lines.push(`  ▸ ${insight.title}`);
    lines.push(`    ${insight.description.slice(0, 200)}${insight.description.length > 200 ? '...' : ''}`);
    if (insight.fixSteps.length > 0) {
      lines.push(`    Fix: ${insight.fixSteps[0]}`);
    }
    lines.push('');
  }

  lines.push('── Run npx getburnd openclaw for the full view ─────────');
  lines.push('   getburnd.vercel.app');
  lines.push('');

  return lines.join('\n');
}
