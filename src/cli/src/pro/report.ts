import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { SessionStats } from '../session.js';
import type { Insight } from '../detectors/index.js';
import type { HistoryEntry } from './history.js';

export function generateWeeklyReport(
  allStats: SessionStats[],
  insights: Insight[],
  history: HistoryEntry[],
): string {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekStartIso = weekAgo.toISOString();

  const weekStats = allStats.filter((s) => (s.startedAt ?? '') >= weekStartIso);
  const weekCost = weekStats.reduce((acc, s) => acc + s.totalCostUsd, 0);
  const totalCost = allStats.reduce((acc, s) => acc + s.totalCostUsd, 0);
  const totalSavings = insights.reduce((acc, i) => acc + i.savingsEstimateUsd, 0);

  const prevWeekStart = new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const prevWeekStats = allStats.filter(
    (s) => (s.startedAt ?? '') >= prevWeekStart && (s.startedAt ?? '') < weekStartIso,
  );
  const prevWeekCost = prevWeekStats.reduce((acc, s) => acc + s.totalCostUsd, 0);

  const weekDelta = prevWeekCost > 0 ? ((weekCost - prevWeekCost) / prevWeekCost) * 100 : 0;
  const deltaSign = weekDelta >= 0 ? '+' : '';
  const deltaColor = weekDelta <= 0 ? '#10b981' : '#ef4444';

  const top5 = insights.slice(0, 5);

  const trendRows = history
    .slice(-8)
    .map(
      (h) =>
        `<tr>
      <td style="padding:6px 12px;border-bottom:1px solid #1e1e2e;color:#94a3b8;">${h.date}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #1e1e2e;color:#e2e8f0;font-weight:600;">$${h.last7DaysCostUsd.toFixed(2)}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #1e1e2e;color:#f59e0b;">${h.detectorHits} leaks</td>
    </tr>`,
    )
    .join('\n');

  const leakRows = top5
    .map(
      (i, idx) =>
        `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #1e1e2e;color:#f59e0b;font-weight:700;">${idx + 1}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1e1e2e;color:#e2e8f0;">${escapeHtml(i.title)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1e1e2e;color:#10b981;font-weight:600;">$${i.savingsEstimateUsd.toFixed(2)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1e1e2e;color:#94a3b8;">~${i.effortMinutes} min</td>
    </tr>`,
    )
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Burnd Weekly Report — ${now.toISOString().slice(0, 10)}</title>
<style>
  body { background:#09090f; color:#e2e8f0; font-family:'JetBrains Mono',monospace; margin:0; padding:40px; }
  .container { max-width:700px; margin:0 auto; }
  h1 { color:#f59e0b; font-size:24px; margin:0 0 4px; }
  .subtitle { color:#64748b; font-size:12px; margin-bottom:32px; }
  .stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:32px; }
  .stat { background:#111118; border:1px solid #1e1e2e; border-radius:8px; padding:16px; }
  .stat-label { color:#64748b; font-size:10px; text-transform:uppercase; letter-spacing:1px; }
  .stat-value { font-size:28px; font-weight:700; margin-top:4px; }
  table { width:100%; border-collapse:collapse; background:#111118; border:1px solid #1e1e2e; border-radius:8px; overflow:hidden; margin-bottom:32px; }
  th { padding:8px 12px; text-align:left; color:#64748b; font-size:10px; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid #1e1e2e; }
  .section-title { color:#6366f1; font-size:11px; text-transform:uppercase; letter-spacing:2px; margin-bottom:12px; }
  .footer { color:#334155; font-size:10px; margin-top:40px; text-align:center; }
</style>
</head>
<body>
<div class="container">
  <h1>🔥 Burnd Weekly Report</h1>
  <div class="subtitle">Week of ${weekAgo.toISOString().slice(0, 10)} → ${now.toISOString().slice(0, 10)}</div>

  <div class="stats-grid">
    <div class="stat">
      <div class="stat-label">This week</div>
      <div class="stat-value" style="color:#e2e8f0;">$${weekCost.toFixed(2)}</div>
    </div>
    <div class="stat">
      <div class="stat-label">vs last week</div>
      <div class="stat-value" style="color:${deltaColor};">${deltaSign}${weekDelta.toFixed(0)}%</div>
    </div>
    <div class="stat">
      <div class="stat-label">Potential savings</div>
      <div class="stat-value" style="color:#f59e0b;">$${totalSavings.toFixed(2)}</div>
    </div>
  </div>

  <div class="section-title">Top Leaks</div>
  <table>
    <thead><tr><th>#</th><th>Leak</th><th>Savings</th><th>Effort</th></tr></thead>
    <tbody>${leakRows || '<tr><td colspan="4" style="padding:12px;color:#64748b;">No leaks detected this week</td></tr>'}</tbody>
  </table>

  <div class="section-title">Weekly Trend</div>
  <table>
    <thead><tr><th>Date</th><th>7-day spend</th><th>Leaks found</th></tr></thead>
    <tbody>${trendRows || '<tr><td colspan="3" style="padding:12px;color:#64748b;">Not enough history yet</td></tr>'}</tbody>
  </table>

  <div class="section-title">All-time</div>
  <div class="stats-grid">
    <div class="stat">
      <div class="stat-label">Total spend</div>
      <div class="stat-value" style="color:#e2e8f0;">$${totalCost.toFixed(2)}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Sessions</div>
      <div class="stat-value" style="color:#e2e8f0;">${allStats.length}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Active leaks</div>
      <div class="stat-value" style="color:#f59e0b;">${insights.length}</div>
    </div>
  </div>

  <div class="footer">
    Generated by Burnd Pro · getburnd.vercel.app · ${now.toISOString().slice(0, 10)}
  </div>
</div>
</body>
</html>`;

  const filename = `burnd-report-${now.toISOString().slice(0, 10)}.html`;
  const outPath = join(homedir(), '.burnd', filename);
  writeFileSync(outPath, html, 'utf-8');
  return outPath;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
