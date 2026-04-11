import { useState, useMemo } from 'react';
import { PageHeader } from '../components/PageHeader.js';
import { Card } from '../components/Card.js';
import type { SnapshotView, SessionView } from '../lib/snapshot.js';
import { formatUsd, formatRelativeTime, formatDuration, shortProjectName, formatTokens } from '../lib/format.js';

interface SessionsPageProps {
  snapshot: SnapshotView;
}

type SortKey = 'cost' | 'recent' | 'turns' | 'duration';

export function SessionsPage({ snapshot }: SessionsPageProps): JSX.Element {
  const [sortKey, setSortKey] = useState<SortKey>('cost');
  const [search, setSearch] = useState('');

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
        subtitle={`${snapshot.sessions.length} sessions across ${snapshot.totals.totalProjects} projects.`}
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

      <Card className="!p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-axis-border">
              <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
                Project
              </th>
              <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
                Cost
              </th>
              <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
                Turns
              </th>
              <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
                Duration
              </th>
              <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
                Started
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedSessions.slice(0, 100).map((s) => (
              <SessionRow key={s.sessionId} session={s} />
            ))}
          </tbody>
        </table>
        {sortedSessions.length > 100 && (
          <div className="border-t border-axis-border px-5 py-3 font-mono text-[11px] text-axis-textDim">
            Showing top 100 of {sortedSessions.length}. (Pagination in v0.2.)
          </div>
        )}
      </Card>
    </div>
  );
}

function SessionRow({ session }: { session: SessionView }): JSX.Element {
  return (
    <tr className="border-b border-axis-border/60 transition-colors hover:bg-axis-muted">
      <td className="px-5 py-3">
        <div className="font-sans text-sm font-medium text-axis-text">
          {shortProjectName(session.projectDir)}
          {session.isSubagent && (
            <span className="ml-2 rounded bg-axis-purpleSoft px-1.5 py-0.5 font-mono text-[9px] uppercase text-axis-purple">
              subagent
            </span>
          )}
        </div>
        <div className="font-mono text-[10px] text-axis-textDim">
          {session.sessionId.slice(0, 8)}…
        </div>
      </td>
      <td className="px-5 py-3 text-right font-mono text-sm font-semibold text-axis-text">
        {formatUsd(session.totalCostUsd)}
      </td>
      <td className="px-5 py-3 text-right font-mono text-sm text-axis-textMuted">
        {session.assistantTurnCount}
        {session.syntheticTurnCount > 0 && (
          <span className="ml-1 text-axis-textDim">({formatTokens(session.syntheticTurnCount)} synth)</span>
        )}
      </td>
      <td className="px-5 py-3 text-right font-mono text-sm text-axis-textMuted">
        {formatDuration(session.durationMs)}
      </td>
      <td className="px-5 py-3 text-right font-mono text-sm text-axis-textMuted">
        {formatRelativeTime(session.startedAt)}
      </td>
    </tr>
  );
}
