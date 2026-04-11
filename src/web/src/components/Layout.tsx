import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Flame,
  Sparkles,
  LayoutDashboard,
  FolderTree,
  Wrench,
  ScrollText,
  RefreshCw,
} from 'lucide-react';
import type { SnapshotView } from '../lib/snapshot.js';
import { formatUsd, formatRelativeTime } from '../lib/format.js';

interface LayoutProps {
  snapshot: SnapshotView | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  children: ReactNode;
}

const NAV_ITEMS = [
  { to: '/app/insights', label: 'Insights', icon: Sparkles, badge: 'leaks' },
  { to: '/app/overview', label: 'Overview', icon: LayoutDashboard, badge: null },
  { to: '/app/projects', label: 'Projects', icon: FolderTree, badge: null },
  { to: '/app/tools', label: 'Tools', icon: Wrench, badge: null },
  { to: '/app/sessions', label: 'Sessions', icon: ScrollText, badge: null },
] as const;

export function Layout({
  snapshot,
  loading,
  error,
  onRefresh,
  children,
}: LayoutProps): JSX.Element {
  return (
    <div className="flex h-full min-h-screen bg-axis-bg text-axis-text">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-axis-border bg-axis-surface">
        <NavLink
          to="/"
          className="flex items-center gap-2 border-b border-axis-border px-5 py-4 transition-colors hover:bg-axis-muted"
          title="Back to landing page"
        >
          <Flame className="h-5 w-5 text-axis-accent" strokeWidth={2.5} />
          <span className="font-mono text-sm font-semibold tracking-tight text-axis-text">
            burnd
          </span>
          <span className="ml-auto rounded bg-axis-muted px-1.5 py-0.5 font-mono text-[10px] text-axis-textMuted">
            v{snapshot?.meta.burndVersion ?? '0.0.1'}
          </span>
        </NavLink>

        <nav className="flex flex-col gap-0.5 px-2 py-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-axis-accentSoft text-axis-text'
                      : 'text-axis-textMuted hover:bg-axis-muted hover:text-axis-text',
                  ].join(' ')
                }
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto rounded bg-axis-warningSoft px-1.5 py-0.5 font-mono text-[10px] text-axis-warning">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom panel — quick stats */}
        <div className="mt-auto border-t border-axis-border px-5 py-4 text-xs">
          {snapshot ? (
            <>
              <div className="font-mono text-axis-textMuted">all-time spend</div>
              <div className="mt-0.5 font-mono text-base font-semibold text-axis-text">
                {formatUsd(snapshot.totals.totalCostUsdAllTime)}
              </div>
              <div className="mt-3 font-mono text-axis-textMuted">last 7 days</div>
              <div className="mt-0.5 font-mono text-base font-semibold text-axis-text">
                {formatUsd(snapshot.totals.totalCostUsdLast7Days)}
              </div>
              <div className="mt-3 font-mono text-axis-textMuted">potential savings</div>
              <div className="mt-0.5 font-mono text-base font-semibold text-axis-warning">
                {formatUsd(snapshot.totals.potentialSavingsUsd)}
              </div>
              <button
                onClick={onRefresh}
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md border border-axis-border bg-axis-muted px-2 py-1.5 font-mono text-[11px] text-axis-textMuted transition-colors hover:bg-axis-surfaceHigh hover:text-axis-text disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'scanning...' : 'rescan'}
              </button>
              <div className="mt-2 font-mono text-[10px] text-axis-textDim">
                generated {formatRelativeTime(snapshot.meta.generatedAt)}
              </div>
            </>
          ) : (
            <div className="font-mono text-axis-textMuted">loading...</div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">
          {error && (
            <div className="mb-6 rounded-md border border-axis-danger/40 bg-axis-dangerSoft px-4 py-3 font-mono text-sm text-axis-danger">
              <span className="font-semibold">error: </span>
              {error}
              <div className="mt-2 text-xs text-axis-danger/70">
                Make sure <code>burnd serve</code> is running on port 4711.
              </div>
            </div>
          )}
          {loading && !snapshot ? (
            <div className="font-mono text-sm text-axis-textMuted">scanning your sessions...</div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}
