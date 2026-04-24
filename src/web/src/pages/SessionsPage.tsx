import { useState, useMemo } from 'react';
import { ChevronDown, AlertTriangle, Zap } from 'lucide-react';
import { PageHeader } from '../components/PageHeader.js';
import { Card } from '../components/Card.js';
import type { SnapshotView, SessionView, InsightView } from '../lib/snapshot.js';
import { formatUsd, formatRelativeTime, formatDuration, shortProjectName, formatTokens } from '../lib/format.js';

interface SessionsPageProps {
  snapshot: SnapshotView;
}

type SortKey = 'cost' | 'recent' | 'turns' | 'duration';

export function SessionsPage({ snapshot }: SessionsPageProps): JSX.Element {
  const [sortKey, setSortKey] = useState<SortKey>('cost');
  const [search, setSearch] = useState('');

  // Build a map of sessionId → insights for the replay panel.
  const insightsBySession = useMemo(() => {
    const map = new Map<string, InsightView[]>();
    for (const insight of snapshot.insights) {
      const list = map.get(insight.sessionId) ?? [];
      list.push(insight);
      map.set(insight.sessionId, list);
    }
    return map;
  }, [snapshot.insights]);

  const sortedSessions = useMemo(() => {
    const filtered = search
      ? snapshot.sessions.filter((s) =>
          shortProjectName(s.projectDir).toLowerCase().includes(search.toLowerCase()),
        )
      : snapshot.sessions;
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case 'cost':
          return b.totalCostUsd - a.totalCostUsd;
        case 'recent':
          return (b.startedAt ?? '').localeCompare(a.startedAt ?? '');
        case 'turns':
          return b.assistantTurnCount - a.assistantTurnCount;
        case 'duration':
          return (b.durationMs ?? 0) - (a.durationMs ?? 0);
      }
    });
  }, [snapshot.sessions, sortKey, search]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="By session"
        title="Sessions"
        subtitle={`${snapshot.sessions.length} sessions across ${snapshot.totals.totalProjects} projects. Click any row to see the cost breakdown.`}
        actions={
          <input
            type="text"
            placeholder="filter by project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-axis-border bg-axis-surface px-3 py-1.5 font-mono text-xs text-axis-text placeholder:text-axis-textDim focus:border-axis-accent focus:outline-none"
          />
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
          sort by
        </span>
        {(['cost', 'recent', 'turns', 'duration'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setSortKey(key)}
            className={`rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors ${
              sortKey === key
                ? 'border-axis-accent bg-axis-accentSoft text-axis-text'
                : 'border-axis-border bg-axis-surface text-axis-textMuted hover:border-axis-muted hover:text-axis-text'
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {sortedSessions.slice(0, 100).map((s) => (
          <SessionRow
            key={s.sessionId}
            session={s}
            insights={insightsBySession.get(s.sessionId) ?? []}
          />
        ))}
        {sortedSessions.length > 100 && (
          <div className="px-5 py-3 font-mono text-[11px] text-axis-textDim">
            Showing top 100 of {sortedSessions.length}. (Pagination in v0.2.)
          </div>
        )}
      </div>
    </div>
  );
}

function SessionRow({
  session,
  insights,
}: {
  session: SessionView;
  insights: InsightView[];
}): JSX.Element {
  const [expanded, setExpanded] = useState(false);

  const totalTokens =
    session.totalInputTokens +
    session.totalOutputTokens +
    session.totalCacheReadTokens +
    session.totalCacheCreate5mTokens +
    session.totalCacheCreate1hTokens;

  // Sort tools by output bytes (most expensive first).
  const sortedTools = [...session.toolUsage].sort(
    (a, b) => b.totalOutputBytes - a.totalOutputBytes,
  );
  const maxBytes = sortedTools[0]?.totalOutputBytes ?? 1;

  // Token bar segments (% of total).
  const inputPct = totalTokens > 0 ? (session.totalInputTokens / totalTokens) * 100 : 0;
  const cachePct = totalTokens > 0 ? (session.totalCacheReadTokens / totalTokens) * 100 : 0;
  const outputPct = totalTokens > 0 ? (session.totalOutputTokens / totalTokens) * 100 : 0;

  // Cache efficiency: what % of input was served from cache (cheaper).
  const cacheEfficiency =
    session.totalInputTokens > 0
      ? (session.totalCacheReadTokens / (session.totalInputTokens + session.totalCacheReadTokens)) *
        100
      : 0;

  const hasErrors = session.apiErrorCount > 0;
  const totalToolErrors = session.toolUsage.reduce((acc, t) => acc + t.errorCount, 0);

  return (
    <Card className="!p-0 overflow-hidden">
      {/* Clickable header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-axis-muted"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-sans text-sm font-medium text-axis-text">
              {shortProjectName(session.projectDir)}
            </span>
            {session.isSubagent && (
              <span className="rounded bg-axis-purpleSoft px-1.5 py-0.5 font-mono text-[9px] uppercase text-axis-purple">
                subagent
              </span>
            )}
            {insights.length > 0 && (
              <span className="rounded bg-axis-warningSoft px-1.5 py-0.5 font-mono text-[9px] text-axis-warning">
                {insights.length} leak{insights.length > 1 ? 's' : ''}
              </span>
            )}
            {hasErrors && (
              <AlertTriangle className="h-3 w-3 text-red-400" />
            )}
          </div>
          <div className="font-mono text-[10px] text-axis-textDim">
            {session.sessionId.slice(0, 8)}… · {formatRelativeTime(session.startedAt)}
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <div className="text-right">
            <div className="font-mono text-sm font-semibold text-axis-text">
              {formatUsd(session.totalCostUsd)}
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="font-mono text-xs text-axis-textMuted">
              {session.assistantTurnCount} turns
            </div>
          </div>
          <div className="text-right hidden md:block">
            <div className="font-mono text-xs text-axis-textMuted">
              {formatDuration(session.durationMs)}
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-axis-textMuted transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Session Replay panel — expands on click */}
      {expanded && (
        <div className="border-t border-axis-border bg-axis-bg px-5 py-4">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Token breakdown */}
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-axis-textDim mb-2">
                Token breakdown
              </div>
              {/* Stacked bar */}
              <div className="flex h-5 w-full overflow-hidden rounded">
                <div
                  className="bg-axis-accent/70 transition-all"
                  style={{ width: `${inputPct}%` }}
                  title={`Input: ${formatTokens(session.totalInputTokens)}`}
                />
                <div
                  className="bg-green-600/70 transition-all"
                  style={{ width: `${cachePct}%` }}
                  title={`Cache reads: ${formatTokens(session.totalCacheReadTokens)}`}
                />
                <div
                  className="bg-orange-500/70 transition-all"
                  style={{ width: `${outputPct}%` }}
                  title={`Output: ${formatTokens(session.totalOutputTokens)}`}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-3 font-mono text-[10px] text-axis-textMuted">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-sm bg-axis-accent/70" />
                  input {formatTokens(session.totalInputTokens)}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-sm bg-green-600/70" />
                  cache {formatTokens(session.totalCacheReadTokens)}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-sm bg-orange-500/70" />
                  output {formatTokens(session.totalOutputTokens)}
                </span>
              </div>
              <div className="mt-3 flex gap-4">
                <div>
                  <div className="font-mono text-[10px] text-axis-textDim">cache efficiency</div>
                  <div className={`font-mono text-sm font-semibold ${cacheEfficiency > 50 ? 'text-axis-success' : 'text-axis-textMuted'}`}>
                    {cacheEfficiency.toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-axis-textDim">cost/turn</div>
                  <div className="font-mono text-sm font-semibold text-axis-text">
                    {session.assistantTurnCount > 0
                      ? formatUsd(session.totalCostUsd / session.assistantTurnCount)
                      : '—'}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-axis-textDim">models</div>
                  <div className="font-mono text-[11px] text-axis-textMuted truncate max-w-[120px]">
                    {session.modelsUsed.map((m) => m.replace('claude-', '').replace('-4-6', '')).join(', ') || '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Tool cost waterfall */}
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-axis-textDim mb-2">
                Tool output volume (most expensive first)
              </div>
              <div className="flex flex-col gap-1.5">
                {sortedTools.slice(0, 6).map((tool) => {
                  const pct = maxBytes > 0 ? (tool.totalOutputBytes / maxBytes) * 100 : 0;
                  const hasToolErrors = tool.errorCount > 0;
                  return (
                    <div key={tool.toolName} className="flex items-center gap-2">
                      <div className="w-16 shrink-0 font-mono text-[10px] text-axis-textMuted truncate">
                        {tool.toolName}
                      </div>
                      <div className="flex-1 h-3 bg-axis-muted rounded-sm overflow-hidden">
                        <div
                          className={`h-full rounded-sm transition-all ${hasToolErrors ? 'bg-red-500/60' : 'bg-axis-accent/50'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="w-16 shrink-0 text-right font-mono text-[10px] text-axis-textMuted">
                        {tool.callCount}× {hasToolErrors && (
                          <span className="text-red-400">{tool.errorCount}err</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {sortedTools.length === 0 && (
                  <div className="font-mono text-[11px] text-axis-textDim">No tool data.</div>
                )}
              </div>
              {totalToolErrors > 0 && (
                <div className="mt-2 font-mono text-[10px] text-red-400">
                  ⚠ {totalToolErrors} tool error{totalToolErrors > 1 ? 's' : ''} — may indicate thrash
                </div>
              )}
            </div>
          </div>

          {/* Leaks fired for this session */}
          {insights.length > 0 && (
            <div className="mt-4 border-t border-axis-border pt-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-axis-textDim mb-2">
                Leaks detected in this session
              </div>
              <div className="flex flex-col gap-1.5">
                {insights.map((insight) => (
                  <div key={insight.id} className="flex items-start gap-3">
                    <Zap className="h-3 w-3 shrink-0 mt-0.5 text-axis-warning" />
                    <div className="flex-1 min-w-0">
                      <span className="font-sans text-xs text-axis-text leading-relaxed">
                        {insight.title}
                      </span>
                    </div>
                    <span className="shrink-0 rounded bg-axis-warningSoft px-1.5 py-0.5 font-mono text-[10px] text-axis-warning">
                      {formatUsd(insight.savingsEstimateUsd)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
