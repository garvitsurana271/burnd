// Snapshot — the single JSON shape the dashboard consumes.
//
// One snapshot = one full scan of ~/.claude/projects/ + all derived
// statistics + all detector insights. The dashboard fetches `/api/snapshot`
// and renders everything from this single object — no incremental loading,
// no background polling, no complexity.
//
// Why one big object instead of paginated endpoints? Because Burnd's data
// volumes are small enough. Even Garvit's 222 sessions produce a snapshot
// of ~150KB JSON, which a browser can parse in under 50ms. No need for
// pagination, streaming, or partial loading until we hit users with
// 10,000+ sessions (years away).

import type { Insight } from './detectors/index.js';
import type { SessionStats } from './session.js';
import { runAllDetectors, runAllMultiSessionDetectors } from './detectors/index.js';
import { hashForUpload } from './anonymize.js';

export interface SnapshotSession {
  // Display fields — local-only, never uploaded.
  sessionId: string;
  sessionIdHash: string;
  projectDir: string;
  isSubagent: boolean;
  startedAt: string | undefined;
  endedAt: string | undefined;
  durationMs: number | undefined;
  totalCostUsd: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheReadTokens: number;
  totalCacheCreate5mTokens: number;
  totalCacheCreate1hTokens: number;
  assistantTurnCount: number;
  syntheticTurnCount: number;
  userTurnCount: number;
  apiErrorCount: number;
  apiRetryCount: number;
  modelsUsed: string[];
  toolUsage: Array<{
    toolName: string;
    callCount: number;
    totalOutputBytes: number;
    errorCount: number;
  }>;
}

export interface SnapshotProject {
  projectDir: string;
  // Short display name (last segment of the encoded project dir).
  displayName: string;
  sessionCount: number;
  totalCostUsd: number;
  // The project's "leak score" — sum of insights.savingsEstimateUsd for
  // sessions in this project. Higher = more wasted spend in this project.
  leakScoreUsd: number;
}

export interface SnapshotToolGlobal {
  toolName: string;
  totalCalls: number;
  totalOutputBytes: number;
  totalErrors: number;
  errorRate: number; // 0..1
  // Number of distinct sessions this tool appeared in.
  sessionCount: number;
}

export interface SnapshotMeta {
  generatedAt: string;
  burndVersion: string;
  filesScanned: number;
  sessionsScanned: number;
  recordsParsed: number;
  recordsSkipped: number;
}

export interface SnapshotTotals {
  totalCostUsdAllTime: number;
  totalCostUsdLast7Days: number;
  totalCostUsdLast30Days: number;
  totalSessions: number;
  totalProjects: number;
  totalAssistantTurns: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheReadTokens: number;
  totalCacheCreate5mTokens: number;
  totalCacheCreate1hTokens: number;
  totalApiErrors: number;
  totalApiRetries: number;
  potentialSavingsUsd: number;
}

export interface DailySpendBucket {
  // YYYY-MM-DD UTC date string.
  date: string;
  totalCostUsd: number;
  sessionCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
}

export interface Snapshot {
  meta: SnapshotMeta;
  totals: SnapshotTotals;
  sessions: SnapshotSession[];
  projects: SnapshotProject[];
  tools: SnapshotToolGlobal[];
  insights: Insight[];
  // Daily spend buckets for the last 60 days, oldest first. Used by the
  // dashboard's Overview chart.
  dailySpend: DailySpendBucket[];
}

// Build a Snapshot from a list of SessionStats. Pure function — no I/O.
// The CLI calls this after walking and parsing everything.
export function buildSnapshot(
  allStats: SessionStats[],
  meta: { burndVersion: string; filesScanned: number; recordsParsed: number; recordsSkipped: number },
): Snapshot {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Per-session insights + multi-session insights.
  const perSessionInsights = allStats.flatMap(runAllDetectors);
  const multiSessionInsights = runAllMultiSessionDetectors(allStats);
  const allInsights = [...perSessionInsights, ...multiSessionInsights];

  // Per-project rollups.
  const projectMap = new Map<string, SnapshotProject>();
  for (const s of allStats) {
    let p = projectMap.get(s.projectDir);
    if (!p) {
      p = {
        projectDir: s.projectDir,
        displayName: shortProjectName(s.projectDir),
        sessionCount: 0,
        totalCostUsd: 0,
        leakScoreUsd: 0,
      };
      projectMap.set(s.projectDir, p);
    }
    p.sessionCount += 1;
    p.totalCostUsd += s.totalCostUsd;
  }
  // Add per-session insight savings to the project leak scores.
  for (const insight of allInsights) {
    const p = projectMap.get(insight.projectDir);
    if (p) p.leakScoreUsd += insight.savingsEstimateUsd;
  }

  // Per-tool global rollups.
  const toolMap = new Map<string, SnapshotToolGlobal>();
  for (const s of allStats) {
    for (const [toolName, t] of s.toolStats.entries()) {
      let g = toolMap.get(toolName);
      if (!g) {
        g = {
          toolName,
          totalCalls: 0,
          totalOutputBytes: 0,
          totalErrors: 0,
          errorRate: 0,
          sessionCount: 0,
        };
        toolMap.set(toolName, g);
      }
      g.totalCalls += t.callCount;
      g.totalOutputBytes += t.totalOutputBytes;
      g.totalErrors += t.errorCount;
      g.sessionCount += 1;
    }
  }
  for (const g of toolMap.values()) {
    g.errorRate = g.totalCalls > 0 ? g.totalErrors / g.totalCalls : 0;
  }

  // Convert sessions to snapshot shape (drop the implementation-detail caches).
  const snapshotSessions: SnapshotSession[] = allStats.map((s) => ({
    sessionId: s.sessionId,
    sessionIdHash: hashForUpload(s.sessionId),
    projectDir: s.projectDir,
    isSubagent: s.isSubagent,
    startedAt: s.startedAt,
    endedAt: s.endedAt,
    durationMs:
      s.startedAt && s.endedAt
        ? new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()
        : undefined,
    totalCostUsd: s.totalCostUsd,
    totalInputTokens: s.totalInputTokens,
    totalOutputTokens: s.totalOutputTokens,
    totalCacheReadTokens: s.totalCacheReadTokens,
    totalCacheCreate5mTokens: s.totalCacheCreate5mTokens,
    totalCacheCreate1hTokens: s.totalCacheCreate1hTokens,
    assistantTurnCount: s.assistantTurnCount,
    syntheticTurnCount: s.syntheticTurnCount,
    userTurnCount: s.userTurnCount,
    apiErrorCount: s.apiErrorCount,
    apiRetryCount: s.apiRetryCount,
    modelsUsed: [...s.modelsSeen],
    toolUsage: [...s.toolStats.entries()].map(([toolName, t]) => ({
      toolName,
      callCount: t.callCount,
      totalOutputBytes: t.totalOutputBytes,
      errorCount: t.errorCount,
    })),
  }));

  const totals: SnapshotTotals = {
    totalCostUsdAllTime: allStats.reduce((acc, s) => acc + s.totalCostUsd, 0),
    totalCostUsdLast7Days: allStats
      .filter((s) => (s.startedAt ?? '') >= sevenDaysAgo)
      .reduce((acc, s) => acc + s.totalCostUsd, 0),
    totalCostUsdLast30Days: allStats
      .filter((s) => (s.startedAt ?? '') >= thirtyDaysAgo)
      .reduce((acc, s) => acc + s.totalCostUsd, 0),
    totalSessions: allStats.length,
    totalProjects: projectMap.size,
    totalAssistantTurns: allStats.reduce((acc, s) => acc + s.assistantTurnCount, 0),
    totalInputTokens: allStats.reduce((acc, s) => acc + s.totalInputTokens, 0),
    totalOutputTokens: allStats.reduce((acc, s) => acc + s.totalOutputTokens, 0),
    totalCacheReadTokens: allStats.reduce((acc, s) => acc + s.totalCacheReadTokens, 0),
    totalCacheCreate5mTokens: allStats.reduce((acc, s) => acc + s.totalCacheCreate5mTokens, 0),
    totalCacheCreate1hTokens: allStats.reduce((acc, s) => acc + s.totalCacheCreate1hTokens, 0),
    totalApiErrors: allStats.reduce((acc, s) => acc + s.apiErrorCount, 0),
    totalApiRetries: allStats.reduce((acc, s) => acc + s.apiRetryCount, 0),
    potentialSavingsUsd: allInsights.reduce((acc, i) => acc + i.savingsEstimateUsd, 0),
  };

  // Daily spend buckets for the last 60 days. We pre-fill empty days
  // (zero spend) so the chart shows continuous time, not gaps.
  const DAYS = 60;
  const dailyMap = new Map<string, DailySpendBucket>();
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, {
      date: key,
      totalCostUsd: 0,
      sessionCount: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
    });
  }
  for (const s of allStats) {
    if (!s.startedAt) continue;
    const dateKey = s.startedAt.slice(0, 10);
    const bucket = dailyMap.get(dateKey);
    if (!bucket) continue; // older than 60 days, skip
    bucket.totalCostUsd += s.totalCostUsd;
    bucket.sessionCount += 1;
    bucket.totalInputTokens += s.totalInputTokens;
    bucket.totalOutputTokens += s.totalOutputTokens;
  }
  const dailySpend = [...dailyMap.values()].sort((a, b) => a.date.localeCompare(b.date));

  return {
    meta: {
      generatedAt: now.toISOString(),
      burndVersion: meta.burndVersion,
      filesScanned: meta.filesScanned,
      sessionsScanned: allStats.length,
      recordsParsed: meta.recordsParsed,
      recordsSkipped: meta.recordsSkipped,
    },
    totals,
    sessions: snapshotSessions,
    projects: [...projectMap.values()].sort((a, b) => b.totalCostUsd - a.totalCostUsd),
    tools: [...toolMap.values()].sort((a, b) => b.totalCalls - a.totalCalls),
    insights: allInsights.sort((a, b) => b.savingsEstimateUsd - a.savingsEstimateUsd),
    dailySpend,
  };
}

function shortProjectName(projectDir: string): string {
  const parts = projectDir.split('-').filter((p) => p.length > 0);
  return parts[parts.length - 1] ?? projectDir;
}
