import { useState, useMemo } from 'react';

const SPEND_TIERS = [
  { label: '$20 / mo',    min: 20,   leakLow: 4,    leakHigh: 12 },
  { label: '$100 / mo',   min: 100,  leakLow: 20,   leakHigh: 45 },
  { label: '$500 / mo',   min: 500,  leakLow: 125,  leakHigh: 225 },
  { label: '$2,000 / mo', min: 2000, leakLow: 560,  leakHigh: 900 },
];

export function CalculatorPage(): JSX.Element {
  const [spend, setSpend] = useState(500);

  const estimate = useMemo(() => {
    const fallback = SPEND_TIERS[0]!;
    const tier = SPEND_TIERS.reduce<typeof fallback>((acc, t) => (spend >= t.min ? t : acc), fallback);
    const low = (spend * tier.leakLow) / tier.min;
    const high = (spend * tier.leakHigh) / tier.min;
    return { low: Math.round(low), high: Math.round(high) };
  }, [spend]);

  return (
    <div className="min-h-screen bg-[#09090f] text-[#F5E8D4] font-sans antialiased px-[clamp(1.5rem,4vw,3rem)] py-[15vh]">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <span className="h-px w-8 bg-amber-400/60" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/80">
            Tool &middot; leak estimator
          </span>
        </div>

        <h1 className="font-serif text-[#F5E8D4] text-[clamp(2.5rem,7vw,5.5rem)] font-normal leading-[0.95] tracking-[-0.02em]">
          How much <span className="italic text-amber-400">are you losing?</span>
        </h1>

        <p className="mt-6 max-w-xl text-[#F5E8D4]/65">
          Estimate your own monthly waste based on the detector patterns across the spend-tier distribution.
          Not perfect, but directionally honest.
        </p>

        <div className="mt-16 rounded-2xl border border-[#F5E8D4]/10 bg-[#0d0d15] p-8">
          <label className="block font-mono text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/40">
            Your monthly Claude Code spend
          </label>
          <input
            type="range"
            min={20}
            max={5000}
            step={20}
            value={spend}
            onChange={(e) => setSpend(Number(e.target.value))}
            className="mt-5 w-full accent-amber-500"
          />
          <div className="mt-4 font-mono text-4xl font-bold text-[#F5E8D4] tabular-nums">
            ${spend.toLocaleString()}<span className="text-lg text-[#F5E8D4]/40">/mo</span>
          </div>

          <div className="mt-10 rounded-xl border border-amber-400/30 bg-black/70 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/70">Estimated monthly leak</div>
            <div className="mt-2 font-mono text-5xl font-bold text-amber-400 tabular-nums">
              ${estimate.low.toLocaleString()}<span className="text-2xl text-amber-400/55"> &ndash; </span>${estimate.high.toLocaleString()}
            </div>
            <div className="mt-3 text-sm text-[#F5E8D4]/55">
              Retry storms, model substitution, repeated reads, tool overuse, and off-hours spend together
              typically explain this range.
            </div>
          </div>

          <a
            href="/"
            className="mt-10 inline-flex items-center gap-3 rounded-full border border-amber-400/40 bg-amber-500 px-7 py-3 font-mono text-sm font-semibold uppercase tracking-[0.2em] text-[#09090f] transition hover:bg-amber-400"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#09090f]" />
            Run npx getburnd to find yours
          </a>
        </div>
      </div>
    </div>
  );
}
