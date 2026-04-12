import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { historyPath } from '../license.js';
import type { SessionStats } from '../session.js';
import type { Insight } from '../detectors/index.js';

export interface HistoryEntry {
  date: string;
  totalCostUsd: number;
  last7DaysCostUsd: number;
  sessionsCount: number;
  filesCount: number;
  topLeakSavingsUsd: number;
  topLeakTitle: string;
  detectorHits: number;
}

export function readHistory(): HistoryEntry[] {
  const p = historyPath();
  if (!existsSync(p)) return [];
  try {
    return JSON.parse(readFileSync(p, 'utf-8')) as HistoryEntry[];
  } catch {
    return [];
  }
}

function writeHistory(entries: HistoryEntry[]): void {
  writeFileSync(historyPath(), JSON.stringify(entries, null, 2) + '\n', 'utf-8');
}

export function appendHistory(
  allStats: SessionStats[],
  insights: Insight[],
  filesCount: number,
): void {
  const today = new Date().toISOString().slice(0, 10);
  const history = readHistory();

  const existing = history.findIndex((e) => e.date === today);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const last7 = allStats
    .filter((s) => (s.startedAt ?? '') >= sevenDaysAgo)
    .reduce((acc, s) => acc + s.totalCostUsd, 0);

  const topLeak = insights.length > 0 ? insights[0]! : null;

  const entry: HistoryEntry = {
    date: today,
    totalCostUsd: allStats.reduce((acc, s) => acc + s.totalCostUsd, 0),
    last7DaysCostUsd: last7,
    sessionsCount: allStats.length,
    filesCount,
    topLeakSavingsUsd: topLeak?.savingsEstimateUsd ?? 0,
    topLeakTitle: topLeak?.title ?? 'none',
    detectorHits: insights.length,
  };

  if (existing >= 0) {
    history[existing] = entry;
  } else {
    history.push(entry);
  }

  if (history.length > 365) history.splice(0, history.length - 365);

  writeHistory(history);
}
