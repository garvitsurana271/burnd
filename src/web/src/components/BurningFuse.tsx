// Founding-cohort visualizer. Previously a calendar countdown to May 18,
// 2026, which auto-staled the moment that date passed. Reworked 2026-05-17
// to represent "X of 100 founding licenses claimed" instead — a milestone-
// based scarcity signal that never goes stale.
//
// SOLD is hand-bumped for now. When Dodo's count API + env vars are wired,
// swap to a fetch from /api/sales-count or similar.

const SOLD = 0;
const CAP = 100;

export function BurningFuse(): JSX.Element {
  const progress = Math.min(1, Math.max(0, SOLD / CAP));
  // Flame tip x position along the 380px fuse span. Even when 0% sold,
  // the tip sits at the start so the flame animation reads as "live."
  const tipX = 10 + progress * 380;
  const remaining = Math.max(0, CAP - SOLD);

  return (
    <div className="inline-flex flex-wrap items-center gap-4">
      <svg viewBox="0 0 400 20" className="h-7 w-64" aria-hidden="true">
        <defs>
          <linearGradient id="fuseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        {/* Unclaimed track */}
        <line
          x1="10"
          y1="10"
          x2="390"
          y2="10"
          stroke="#3f3f46"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Claimed portion */}
        <line
          x1="10"
          y1="10"
          x2={tipX}
          y2="10"
          stroke="url(#fuseGrad)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Live flame tip */}
        <circle cx={tipX} cy="10" r="5" fill="#f59e0b">
          <animate
            attributeName="opacity"
            values="1;0.35;1"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/80 tabular-nums">
        {remaining} of {CAP} founding licenses left · then $129
      </span>
    </div>
  );
}
