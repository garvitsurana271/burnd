import { useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Flame,
  Sparkles,
  LayoutDashboard,
  FolderTree,
  Wrench,
  ScrollText,
  RefreshCw,
  Menu,
  X,
} from 'lucide-react';
import type { SnapshotView } from '../lib/snapshot.js';
import { formatUsd, formatRelativeTime } from '../lib/format.js';
import { Skeleton } from './Skeleton.js';
import { ErrorState } from './ErrorState.js';

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-full min-h-screen bg-axis-bg text-axis-text">
      {/* Mobile top bar — hidden on md and up */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-axis-border bg-axis-surface px-4 py-3 md:hidden">
        <NavLink to="/" className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-axis-accent" strokeWidth={2.5} />
          <span className="font-mono text-sm font-semibold tracking-tight">burnd</span>
        </NavLink>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="rounded-md p-1.5 text-axis-textMuted hover:bg-axis-muted hover:text-axis-text"
          aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar — hidden on mobile unless mobileNavOpen, always visible on md+ */}
      <aside
        className={`${
          mobileNavOpen ? 'fixed inset-y-0 left-0 z-50 flex' : 'hidden'
        } w-60 flex-col border-r border-axis-border bg-axis-surface md:flex`}
      >
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
                onClick={() => setMobileNavOpen(false)}
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

      {/* Backdrop to close mobile nav when tapping outside */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
          {error ? (
            <ErrorState error={error} onRetry={onRefresh} />
          ) : loading && !snapshot ? (
            <Skeleton />
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}
