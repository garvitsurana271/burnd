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
  Zap,
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
    <div className="flex h-full min-h-screen bg-[#09090f] text-[#F5E8D4]">
      {/* Scanline overlay — atmospheric, pointer-events-none, full viewport */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[repeating-linear-gradient(180deg,transparent_0,transparent_3px,rgba(255,255,255,0.012)_3px,rgba(255,255,255,0.012)_4px)]" />

      {/* Mobile top bar — hidden on md and up */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-amber-400/10 bg-[#09090f]/90 px-4 py-3 md:hidden backdrop-blur-md">
        <NavLink to="/" className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-amber-400" strokeWidth={2.5} />
          <span className="font-serif italic text-base font-normal tracking-tight text-[#F5E8D4]">burnd</span>
        </NavLink>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="rounded-md p-1.5 text-[#F5E8D4]/45 hover:bg-white/[0.04] hover:text-[#F5E8D4]"
          aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar — hidden on mobile unless mobileNavOpen, always visible on md+ */}
      <aside
        className={`${
          mobileNavOpen ? 'fixed inset-y-0 left-0 z-50 flex' : 'hidden'
        } w-60 flex-col border-r border-amber-400/10 bg-[#111118] md:flex relative z-10`}
      >
        <NavLink
          to="/"
          className="flex items-center gap-2 border-b border-amber-400/10 px-5 py-4 transition-colors hover:bg-white/[0.03]"
          title="Back to landing page"
        >
          <Flame className="h-5 w-5 text-amber-400" strokeWidth={2.5} />
          <span className="font-serif italic text-base font-normal tracking-tight text-[#F5E8D4]">
            burnd
          </span>
          <span className="ml-auto rounded border border-[#F5E8D4]/10 px-1.5 py-0.5 font-mono text-[10px] text-[#F5E8D4]/35">
            v{snapshot?.meta.burndVersion ?? '0.0.16'}
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
                      ? 'bg-amber-400/10 text-[#F5E8D4]'
                      : 'text-[#F5E8D4]/45 hover:bg-white/[0.04] hover:text-[#F5E8D4]',
                  ].join(' ')
                }
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto rounded border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-400">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom panel — quick stats */}
        <div className="mt-auto border-t border-amber-400/10 px-5 py-4 text-xs">
          {snapshot ? (
            <>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#F5E8D4]/35">all-time spend</div>
              <div className="mt-0.5 font-mono text-base font-semibold text-[#F5E8D4] tabular-nums">
                {formatUsd(snapshot.totals.totalCostUsdAllTime)}
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#F5E8D4]/35">last 7 days</div>
              <div className="mt-0.5 font-mono text-base font-semibold text-[#F5E8D4] tabular-nums">
                {formatUsd(snapshot.totals.totalCostUsdLast7Days)}
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#F5E8D4]/35">potential savings</div>
              <div className="mt-0.5 font-mono text-base font-semibold text-amber-400 tabular-nums">
                {formatUsd(snapshot.totals.potentialSavingsUsd)}
              </div>
              <button
                onClick={onRefresh}
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md border border-[#F5E8D4]/10 bg-white/[0.03] px-2 py-1.5 font-mono text-[11px] text-[#F5E8D4]/45 transition-colors hover:bg-white/[0.06] hover:text-[#F5E8D4] disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'scanning...' : 'rescan'}
              </button>
              <div className="mt-2 font-mono text-[10px] text-[#F5E8D4]/25">
                generated {formatRelativeTime(snapshot.meta.generatedAt)}
              </div>

              {/* Everything is free as of 0.1.0 — see POSTMORTEM.md */}
              <div className="mt-4 flex items-center gap-2 rounded-md border border-indigo-400/40 bg-indigo-400/10 px-3 py-2">
                <Zap className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                <span className="font-mono text-[11px] font-semibold text-indigo-400">
                  All features free
                </span>
              </div>
            </>
          ) : (
            <div className="font-mono text-[10px] text-[#F5E8D4]/30">loading...</div>
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
      <main className="relative z-10 flex-1 overflow-y-auto pt-14 md:pt-0">
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
