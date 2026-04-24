import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { PageHeader } from '../components/PageHeader.js';
import { Card, StatCard } from '../components/Card.js';
import { SpendChart } from '../components/SpendChart.js';
import type { SnapshotView } from '../lib/snapshot.js';
import { formatUsd, formatTokens } from '../lib/format.js';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface OverviewPageProps {
  snapshot: SnapshotView;
}

export function OverviewPage({ snapshot }: OverviewPageProps): JSX.Element {
  const t = snapshot.totals;

  // Weekly digest: compute last-7-days vs prior-7-days spend from dailySpend buckets.
  const daily = snapshot.dailySpend; // sorted oldest first, 60 buckets
  const last7 = daily.slice(-7).reduce((acc, d) => acc + d.totalCostUsd, 0);
  const prev7 = daily.slice(-14, -7).reduce((acc, d) => acc + d.totalCostUsd, 0);
  const weekTrendPct = prev7 > 0 ? ((last7 - prev7) / prev7) * 100 : 0;
  const sessionsThisWeek = daily.slice(-7).reduce((acc, d) => acc + d.sessionCount, 0);

  // Top insight by savings for the "action item".
  const topInsight = snapshot.insights[0];

  // Week-over-week comparison data: align prev7 and last7 by day-of-week label.
  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekCompareData = Array.from({ length: 7 }, (_, i) => {
    const prevDay = daily[daily.length - 14 + i];
    const thisDay = daily[daily.length - 7 + i];
    const dayLabel = thisDay?.date
      ? DAY_LABELS[new Date(thisDay.date + 'T12:00:00').getDay() === 0 ? 6 : new Date(thisDay.date + 'T12:00:00').getDay() - 1] ?? DAY_LABELS[i]
      : DAY_LABELS[i];
    return {
      day: dayLabel,
      thisWeek: parseFloat((thisDay?.totalCostUsd ?? 0).toFixed(4)),
      lastWeek: parseFloat((prevDay?.totalCostUsd ?? 0).toFixed(4)),
    };
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="The big picture"
        title="Overview"
        subtitle="Your all-time Claude Code spend, broken down across time windows and token tiers."
      />

      {/* Weekly Digest — the Monday morning report */}
      <div className="mb-6 rounded-lg border border-axis-border bg-axis-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
            Weekly digest
          </div>
          <div className="font-mono text-[10px] text-axis-textDim">
            last 7 days vs prior 7 days
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {/* Spend this week */}
          <div>
            <div className="font-mono text-[10px] text-axis-textDim mb-1">spend this week</div>
            <div className="font-mono text-2xl font-semibold text-axis-text">
              {formatUsd(last7)}
            </div>
            <div className={`mt-1 flex items-center gap-1 font-mono text-[11px] ${
              weekTrendPct > 5 ? 'text-red-400' : weekTrendPct < -5 ? 'text-axis-success' : 'text-axis-textMuted'
            }`}>
              {weekTrendPct > 5 ? (
                <TrendingUp className="h-3 w-3" />
              ) : weekTrendPct < -5 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {weekTrendPct > 0 ? '+' : ''}{weekTrendPct.toFixed(0)}% vs last week
            </div>
          </div>

          {/* Sessions this week */}
          <div>
            <div className="font-mono text-[10px] text-axis-textDim mb-1">sessions</div>
            <div className="font-mono text-2xl font-semibold text-axis-text">
              {sessionsThisWeek}
            </div>
            <div className="mt-1 font-mono text-[11px] text-axis-textDim">
              {sessionsThisWeek > 0
                ? `${formatUsd(last7 / sessionsThisWeek)}/session avg`
                : 'no sessions'}
            </div>
          </div>

          {/* Potential savings */}
          <div>
            <div className="font-mono text-[10px] text-axis-textDim mb-1">fixable waste</div>
            <div className="font-mono text-2xl font-semibold text-axis-warning">
              {formatUsd(t.potentialSavingsUsd)}
            </div>
            <div className="mt-1 font-mono text-[11px] text-axis-textDim">
              {snapshot.insights.length} leaks identified
            </div>
          </div>

          {/* Top action */}
          <div>
            <div className="font-mono text-[10px] text-axis-textDim mb-1">top action this week</div>
            {topInsight ? (
              <>
                <div className="font-mono text-sm font-semibold text-axis-warning leading-tight">
                  {formatUsd(topInsight.savingsEstimateUsd)} savings available
                </div>
                <div className="mt-1 font-sans text-[11px] text-axis-textMuted leading-snug line-clamp-2">
                  {topInsight.fixSteps[0]}
                </div>
              </>
            ) : (
              <div className="font-mono text-sm text-axis-success">✓ No leaks detected</div>
            )}
          </div>
        </div>

        {/* Week guilt trip / motivator */}
        {last7 > 0 && t.potentialSavingsUsd > last7 * 0.3 && (
          <div className="mt-4 flex items-center gap-3 rounded-md border border-axis-warning/30 bg-axis-warningSoft/20 px-4 py-3">
            <Zap className="h-4 w-4 shrink-0 text-axis-warning" />
            <span className="font-sans text-xs text-axis-textMuted">
              <strong className="text-axis-text">
                {((t.potentialSavingsUsd / (t.totalCostUsdAllTime || 1)) * 100).toFixed(0)}% of your all-time spend is fixable waste.
              </strong>{' '}
              Fixing your top leak ({topInsight ? formatUsd(topInsight.savingsEstimateUsd) : '$0'} savings) would take ~{topInsight?.effortMinutes ?? 0} minutes.
            </span>
            <a
              href="/app/insights"
              className="shrink-0 rounded bg-axis-accent px-3 py-1.5 font-mono text-[11px] font-semibold text-white transition-opacity hover:opacity-80"
            >
              Fix it →
            </a>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="All-time spend" value={formatUsd(t.totalCostUsdAllTime)} />
        <StatCard label="Last 30 days" value={formatUsd(t.totalCostUsdLast30Days)} />
        <StatCard label="Last 7 days" value={formatUsd(t.totalCostUsdLast7Days)} />
        <StatCard
          label="Potential savings"
          value={formatUsd(t.potentialSavingsUsd)}
          tone="warning"
          hint="if you applied every insight"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-baseline justify-between">
            <div className="font-mono text-[11px] uppercase tracking-wider text-axis-textMuted">
              Daily spend (last 60 days)
            </div>
            <div className="font-mono text-[11px] text-axis-textDim">USD per day</div>
          </div>
          <SpendChart data={snapshot.dailySpend} />
        </Card>
        <Card>
          <div className="mb-4 flex items-baseline justify-between">
            <div className="font-mono text-[11px] uppercase tracking-wider text-axis-textMuted">
              This week vs last week
            </div>
            <div className={`flex items-center gap-1 font-mono text-[11px] ${
              weekTrendPct > 5 ? 'text-red-400' : weekTrendPct < -5 ? 'text-axis-success' : 'text-axis-textMuted'
            }`}>
              {weekTrendPct > 5 ? <TrendingUp className="h-3 w-3" /> : weekTrendPct < -5 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              {weekTrendPct > 0 ? '+' : ''}{weekTrendPct.toFixed(0)}%
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekCompareData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }} barGap={2}>
                <CartesianGrid stroke="#1e1e2e" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} axisLine={{ stroke: '#1e1e2e' }} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v: number) => v === 0 ? '$0' : `$${v.toFixed(2)}`} width={48} />
                <Tooltip
                  cursor={{ fill: '#1e1e2e' }}
                  contentStyle={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 6, fontFamily: 'monospace', fontSize: 11 }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(v: number) => [`$${v.toFixed(4)}`, '']}
                />
                <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: 10, color: '#64748b', paddingTop: 8 }} />
                <Bar dataKey="lastWeek" name="last week" fill="#334155" radius={[2, 2, 0, 0]} />
                <Bar dataKey="thisWeek" name="this week" fill="#6366f1" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Sessions" value={t.totalSessions.toLocaleString()} />
        <StatCard label="Projects" value={t.totalProjects.toString()} />
        <StatCard label="Assistant turns" value={formatTokens(t.totalAssistantTurns)} />
        <StatCard label="API errors" value={t.totalApiErrors.toLocaleString()} tone="danger" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="Input tokens" value={formatTokens(t.totalInputTokens)} />
        <StatCard label="Output tokens" value={formatTokens(t.totalOutputTokens)} />
        <StatCard label="Cache reads" value={formatTokens(t.totalCacheReadTokens)} />
        <StatCard
          label="Cache writes (5m)"
          value={formatTokens(t.totalCacheCreate5mTokens)}
          hint="ephemeral 5-minute tier"
        />
        <StatCard
          label="Cache writes (1h)"
          value={formatTokens(t.totalCacheCreate1hTokens)}
          hint="ephemeral 1-hour tier"
        />
        <StatCard label="Retries" value={t.totalApiRetries.toLocaleString()} tone="warning" />
      </div>
    </div>
  );
}
