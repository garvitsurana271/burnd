import { useEffect, useState } from 'react';

// Founding-member window: Apr 20 → May 18 2026, at $89 lifetime. After: $129.
const DEADLINE = new Date('2026-05-18T23:59:00+05:30').getTime();
const START = new Date('2026-04-20T00:00:00+05:30').getTime();

export function BurningFuse(): JSX.Element {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, DEADLINE - now);
  const days = Math.floor(remaining / (24 * 3600 * 1000));
  const hours = Math.floor((remaining / (3600 * 1000)) % 24);
  const minutes = Math.floor((remaining / 60_000) % 60);

  // Progress: 0 = just started, 1 = deadline reached.
  const progress = Math.min(1, Math.max(0, (now - START) / (DEADLINE - START)));
  // Flame tip x position along the 380px fuse span.
  const tipX = 10 + progress * 380;

  return (
    <div className="inline-flex flex-wrap items-center gap-4">
      <svg viewBox="0 0 400 20" className="h-7 w-64" aria-hidden="true">
        <defs>
          <linearGradient id="fuseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        {/* Unburned track */}
        <line
          x1="10"
          y1="10"
          x2="390"
          y2="10"
          stroke="#3f3f46"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Burned portion */}
        <line
          x1="10"
          y1="10"
          x2={tipX}
          y2="10"
          stroke="url(#fuseGrad)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Blinking flame tip */}
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
        {days}d {hours}h {minutes}m until lifetime goes to $129
      </span>
    </div>
  );
}
