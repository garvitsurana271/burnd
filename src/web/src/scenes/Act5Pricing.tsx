import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { BurningFuse } from '../components/BurningFuse.js';

const MONTHLY_FEATURES = [
  'All 8 detectors',
  'Auto-fix CLAUDE.md patches',
  'Weekly email digest',
  'CSV export',
];

const LIFETIME_FEATURES = [
  'Everything in Monthly',
  'One-time payment, no renewals',
  'Pays back in under 3 weeks at $2,140/mo saved',
];

export function Act5Pricing(): JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  });

  // Lifetime card picks up an amber glow as user scrolls it into frame.
  const lifetimeGlow = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const glowShadow = useTransform(
    lifetimeGlow,
    [0, 1],
    ['0 0 0px rgba(245,158,11,0)', '0 0 100px rgba(245,158,11,0.35)'],
  );

  return (
    <section
      ref={sectionRef}
      className="relative py-[20vh] px-[clamp(1.5rem,4vw,3rem)]"
    >
      <div className="mx-auto max-w-[1400px]">
        {/* Eyebrow */}
        <div className="mb-8 flex items-center gap-3">
          <span className="h-px w-8 bg-amber-400/60" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/80">
            Section 05 · pricing
          </span>
        </div>

        {/* Headline */}
        <h2 className="font-serif text-[#F5E8D4] text-[clamp(2.5rem,6vw,5.5rem)] font-normal leading-[0.95] tracking-[-0.01em] max-w-[20ch]">
          Pay $89 <span className="italic">once.</span>
          <br />
          Save $2,140{' '}
          <span className="italic text-amber-400">every month.</span>
        </h2>

        {/* Burning fuse countdown */}
        <div className="mt-10">
          <BurningFuse />
        </div>

        {/* Pricing cards */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Monthly */}
          <div className="rounded-2xl border border-[#F5E8D4]/10 bg-[#0d0d15] p-8">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/40">
              Pro Monthly
            </div>
            <div className="mt-3 font-mono text-5xl font-bold tabular-nums text-[#F5E8D4]">
              $8.99
              <span className="text-xl text-[#F5E8D4]/40">/mo</span>
            </div>

            <ul className="mt-8 space-y-3">
              {MONTHLY_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[#F5E8D4]/75">
                  <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#F5E8D4]/30" />
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="/buy?plan=monthly"
              className="mt-10 block rounded-lg border border-[#F5E8D4]/15 bg-white/[0.03] px-6 py-3 text-center font-mono text-sm uppercase tracking-[0.2em] text-[#F5E8D4]/85 transition hover:border-[#F5E8D4]/30 hover:text-[#F5E8D4]"
            >
              Start monthly
            </a>
          </div>

          {/* Lifetime */}
          <motion.div
            className="relative rounded-2xl border-2 border-amber-400/40 bg-[#0d0d15] p-8"
            style={{ boxShadow: glowShadow }}
          >
            {/* Best value pill */}
            <div className="absolute -top-3 left-6 rounded-full bg-amber-400 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-[#09090f]">
              Lifetime · best value
            </div>

            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/70">
              Pro Lifetime
            </div>
            <div className="mt-3 font-mono text-5xl font-bold tabular-nums text-amber-400">
              $89
              <span className="text-xl text-amber-400/55"> until May 18</span>
            </div>
            <div className="mt-1 font-mono text-sm text-[#F5E8D4]/40">$129 after</div>

            <ul className="mt-8 space-y-3">
              {LIFETIME_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[#F5E8D4]/85">
                  <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="/buy?plan=lifetime"
              className="mt-10 block rounded-lg bg-amber-500 px-6 py-3 text-center font-mono text-sm font-semibold uppercase tracking-[0.2em] text-[#09090f] transition hover:bg-amber-400"
            >
              Buy lifetime · $89
            </a>
          </motion.div>
        </div>

        {/* Free vs Pro split */}
        <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Free */}
          <motion.div
            className="rounded-xl border border-[#F5E8D4]/10 bg-black/40 p-6"
            initial={{ x: -40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/40">
              Free
            </div>
            <p className="mt-3 font-serif text-2xl italic text-[#F5E8D4]/85">
              Top 3 leaks per scan. Once.
            </p>
            <div className="mt-4 h-px w-full bg-[#F5E8D4]/10" />
            <div className="mt-4 font-mono text-[11px] leading-relaxed text-[#F5E8D4]/35">
              NOT included: burnd fix · burnd digest · burnd report · burnd export · burnd commits
            </div>
          </motion.div>

          {/* Pro */}
          <motion.div
            className="rounded-xl border border-amber-400/30 bg-black/60 p-6"
            initial={{ x: 40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/70">
              Pro
            </div>
            <p className="mt-3 font-serif text-2xl italic text-amber-200">
              All leaks. All fixes. Forever.
            </p>
            <div className="mt-4 h-px w-full bg-amber-400/15" />
            <div className="mt-4 font-mono text-[11px] leading-relaxed text-amber-200/60">
              Every command · auto-apply patches · weekly digest · CSV export · cost-per-commit
            </div>
          </motion.div>
        </div>

        {/* Section footer hairline */}
        <div className="mt-16 h-px w-full bg-gradient-to-r from-amber-400/60 via-[#F5E8D4]/15 to-transparent" />
      </div>
    </section>
  );
}
