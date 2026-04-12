import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { SessionStats } from '../session.js';

export function exportCsv(allStats: SessionStats[]): string {
  const header = 'session_id,project,started_at,cost_usd,input_tokens,output_tokens,cache_read_tokens,tool_calls,error_count,duration_minutes';

  const rows = allStats
    .sort((a, b) => (a.startedAt ?? '').localeCompare(b.startedAt ?? ''))
    .map((s) => {
      const durationMin = s.startedAt && s.endedAt
        ? Math.round((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60000)
        : 0;
      let toolCalls = 0;
      let toolErrors = 0;
      for (const t of s.toolStats.values()) { toolCalls += t.callCount; toolErrors += t.errorCount; }
      return [
        csvEscape(s.sessionId),
        csvEscape(s.projectDir),
        s.startedAt ?? '',
        s.totalCostUsd.toFixed(4),
        s.totalInputTokens,
        s.totalOutputTokens,
        s.totalCacheReadTokens,
        toolCalls,
        toolErrors,
        durationMin,
      ].join(',');
    });

  const csv = [header, ...rows].join('\n') + '\n';

  const filename = `burnd-export-${new Date().toISOString().slice(0, 10)}.csv`;
  const outPath = join(homedir(), '.burnd', filename);
  writeFileSync(outPath, csv, 'utf-8');
  return outPath;
}

function csvEscape(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return '"' + val.replace(/"/g, '""') + '"';
  }
  return val;
}
