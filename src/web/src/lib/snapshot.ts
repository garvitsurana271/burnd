// Snapshot types — mirror of src/cli/src/snapshot.ts so the dashboard
// can consume the JSON shape with full type safety. Keep these in sync;
// when the snapshot shape changes in the CLI, update both files.

export interface InsightView {
  id: string;
  detectorId: string;
  sessionId: string;
  projectDir: string;
  title: string;
  description: string;
  savingsEstimateUsd: number;
  effortMinutes: number;
  fixSteps: string[];
  detailedFixSteps: string[];
  claudeMdPatch: string | null;
}

export interface ToolUsageView {
  toolName: string;
  callCount: number;
  totalOutputBytes: number;
  errorCount: number;
}

export interface SessionView {
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
  toolUsage: ToolUsageView[];
}

export interface ProjectView {
  projectDir: string;
  displayName: string;
  sessionCount: number;
  totalCostUsd: number;
  leakScoreUsd: number;
}

export interface ToolGlobalView {
  toolName: string;
  totalCalls: number;
  totalOutputBytes: number;
  totalErrors: number;
  errorRate: number;
  sessionCount: number;
}

export interface SnapshotMetaView {
  generatedAt: string;
  burndVersion: string;
  filesScanned: number;
  sessionsScanned: number;
  recordsParsed: number;
  recordsSkipped: number;

}

export interface SnapshotTotalsView {
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

export interface DailySpendBucketView {
  date: string;
  totalCostUsd: number;
  sessionCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
}

export interface SnapshotView {
  meta: SnapshotMetaView;
  totals: SnapshotTotalsView;
  sessions: SessionView[];
  projects: ProjectView[];
  tools: ToolGlobalView[];
  insights: InsightView[];
  dailySpend: DailySpendBucketView[];
}

// Fetch the latest snapshot from the local burnd serve API.
// In dev mode (Vite dev server) this hits http://localhost:5173/api/snapshot
// which is proxied to http://localhost:4711/api/snapshot (the burnd CLI server).
// In prod mode (served by `burnd serve`) it's same-origin.
export async function fetchSnapshot(forceRefresh = false): Promise<SnapshotView> {
  const path = forceRefresh ? '/api/refresh' : '/api/snapshot';
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`burnd API returned ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as SnapshotView;
}
