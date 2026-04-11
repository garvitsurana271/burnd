import { PageHeader } from '../components/PageHeader.js';
import { StatCard } from '../components/Card.js';
import type { SnapshotView } from '../lib/snapshot.js';
import { formatUsd, formatTokens } from '../lib/format.js';

interface OverviewPageProps {
  snapshot: SnapshotView;
}

export function OverviewPage({ snapshot }: OverviewPageProps): JSX.Element {
  const t = snapshot.totals;
  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="The big picture"
        title="Overview"
        subtitle="Your all-time Claude Code spend, broken down across time windows and token tiers."
      />
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
