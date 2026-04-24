// Burnd public library API — for programmatic use by plugins, integrations,
// and other tools that want to consume Burnd's analysis without shelling out
// to the CLI binary.
//
// This module is the single stable surface. Anything not exported here is
// an internal implementation detail and may change without notice.

import { walkJsonlFiles, defaultClaudeProjectsRoot } from './walker.js';
import { streamRecords } from './parser.js';
import { newEmptyStats, ingestRecord } from './session.js';
import { runAllDetectors, runAllMultiSessionDetectors, computeUserBaseline } from './detectors/index.js';
import { topNBySavings, totalSavingsUsd } from './insights.js';
import { basename } from 'node:path';

export type { SessionStats, ToolUsageStats } from './session.js';
export type { Insight } from './detectors/index.js';
export { defaultClaudeProjectsRoot } from './walker.js';

export interface ScanResult {
  /** Total cost across all sessions ever recorded, in USD. */
  totalCostUsdAllTime: number;
  /** Total cost across sessions started in the last 7 days, in USD. */
  totalCostUsdLast7Days: number;
  /** Number of .jsonl session files found. */
  filesScanned: number;
  /** Number of sessions (files) parsed. */
  sessionsScanned: number;
  /** All ranked insights, highest savings first. */
  insights: import('./detectors/index.js').Insight[];
  /** Total estimated savings across all insights, in USD. */
  totalSavingsUsd: number;
}

/**
 * Scan the local Claude Code session directory and return a structured result.
 *
 * @param root  Path to the Claude projects root (defaults to ~/.claude/projects).
 *              Pass `undefined` to use the default.
 */
export async function scan(root?: string): Promise<ScanResult> {
  const dir = root ?? defaultClaudeProjectsRoot();
  const allStats = [];
  const allFiles = [];

  for await (const file of walkJsonlFiles(dir)) {
    allFiles.push(file);
    const sessionId = basename(file.absPath, '.jsonl');
    const stats = newEmptyStats(sessionId, file.absPath, file.projectDir, file.isSubagent);
    for await (const record of streamRecords(file.absPath, { recordsTotal: 0, recordsParsed: 0, recordsSkipped: 0, bytesRead: 0 })) {
      ingestRecord(stats, record);
    }
    allStats.push(stats);
  }

  const baseline = computeUserBaseline(allStats);
  const perSession = allStats.flatMap((s) => runAllDetectors(s, baseline));
  const multi = runAllMultiSessionDetectors(allStats);
  const insights = topNBySavings([...perSession, ...multi], Infinity);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const totalCostUsdAllTime = allStats.reduce((acc, s) => acc + s.totalCostUsd, 0);
  const totalCostUsdLast7Days = allStats
    .filter((s) => (s.startedAt ?? '') >= sevenDaysAgo)
    .reduce((acc, s) => acc + s.totalCostUsd, 0);

  return {
    totalCostUsdAllTime,
    totalCostUsdLast7Days,
    filesScanned: allFiles.length,
    sessionsScanned: allStats.length,
    insights,
    totalSavingsUsd: totalSavingsUsd(insights),
  };
}

/** Format a ScanResult as a human-readable text summary. */
export function formatSummary(result: ScanResult): string {
  const lines: string[] = [];

  lines.push('── Burnd: Claude Code Spend Analysis ──────────────────');
  lines.push('');
  lines.push(`  Total spend (all time):  $${result.totalCostUsdAllTime.toFixed(2)}`);
  lines.push(`  Last 7 days:             $${result.totalCostUsdLast7Days.toFixed(2)}`);
  lines.push(`  Sessions scanned:        ${result.sessionsScanned}`);

  if (result.insights.length === 0) {
    lines.push('');
    lines.push('  No cost leaks detected. You\'re running a tight ship!');
    lines.push('');
    return lines.join('\n');
  }

  lines.push(`  Potential savings:       $${result.totalSavingsUsd.toFixed(2)}`);
  lines.push('');
  lines.push(`── Top ${Math.min(result.insights.length, 5)} leaks ────────────────────────────────────`);
  lines.push('');

  for (const insight of result.insights.slice(0, 5)) {
    lines.push(`  ▸ ${insight.title}`);
    lines.push(`    ${insight.description.slice(0, 200)}${insight.description.length > 200 ? '…' : ''}`);
    if (insight.fixSteps.length > 0) {
      lines.push(`    Fix: ${insight.fixSteps[0]}`);
    }
    lines.push('');
  }

  lines.push('── Run npx getburnd for the full CLI view ──────────────');
  lines.push('   getburnd.vercel.app');
  lines.push('');

  return lines.join('\n');
}
