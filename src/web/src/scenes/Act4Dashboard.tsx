import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

const bars = [60, 78, 45, 92, 68, 88, 72, 95];

export function Act4Dashboard(): JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // 3D tilt: tilts forward as section enters, levels, then tilts back as it exits.
  const rotateX = useTransform(scrollYProgress, [0, 0.45, 1], [18, 0, -18]);

  // Counter: ticks 0 → $2,140 as the card crosses the viewport midpoint.
  const savedCount = useTransform(scrollYProgress, [0.2, 0.75], [0, 2140]);
  const savedText = useTransform(savedCount, (v) => `$${Math.floor(v).toLocaleString()}`);

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
            Section 04 · the dashboard
          </span>
        </div>

        {/* Headline */}
        <h2 className="font-serif text-[#F5E8D4] text-[clamp(2.5rem,6vw,5.5rem)] font-normal leading-[0.95] tracking-[-0.01em] max-w-[20ch]">
          Watch the leaks close{' '}
          <span className="italic text-amber-400">in real time.</span>
        </h2>

        {/* Supporting body */}
        <p className="mt-6 max-w-[48ch] text-[15px] leading-relaxed text-[#F5E8D4]/65">
          Burnd tracks every session locally. Every fix you apply shows up as saved spend, with the receipt in raw jsonl. No cloud sync. No data leaving your machine.
        </p>

        {/* 3D-tilted dashboard card */}
        <motion.div
          className="mx-auto mt-16 max-w-[1100px]"
          style={{
            rotateX,
            transformStyle: 'preserve-3d',
            transformOrigin: '50% 100%',
            perspective: '1400px',
          }}
        >
          {/* Ambient glow behind the card */}
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl blur-[80px] bg-indigo-500/10" />

          <div className="overflow-hidden rounded-2xl border border-[#F5E8D4]/10 bg-black/80 shadow-[0_60px_160px_rgba(99,102,241,0.15)] backdrop-blur-md">
            {/* Chrome bar */}
            <div className="flex items-center gap-2 border-b border-[#F5E8D4]/10 px-5 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
              <span className="ml-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[#F5E8D4]/35">
                burnd · /insights
              </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 gap-6 border-b border-[#F5E8D4]/10 p-8 sm:grid-cols-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/40">
                  Saved this month
                </div>
                <motion.div className="mt-2 font-mono text-4xl font-bold tabular-nums text-amber-400">
                  {savedText}
                </motion.div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/40">
                  Retry storms flagged
                </div>
                <div className="mt-2 font-mono text-4xl font-bold tabular-nums text-indigo-400">7</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/40">
                  Model subs suggested
                </div>
                <div className="mt-2 font-mono text-4xl font-bold tabular-nums text-[#F5E8D4]">12</div>
              </div>
            </div>

            {/* Bar chart */}
            <div className="p-6">
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/35">
                Daily spend · last 8 sessions
              </div>
              <div className="flex h-44 items-end gap-2">
                {bars.map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-amber-500/80 via-amber-400/50 to-indigo-500/60"
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, delay: i * 0.055, ease: [0.16, 1, 0.3, 1] }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Below-card caption */}
        <div className="mt-8">
          <div className="h-px w-full bg-gradient-to-r from-amber-400/60 via-[#F5E8D4]/15 to-transparent" />
          <p className="mt-5 text-sm leading-relaxed text-[#F5E8D4]/55 max-w-[60ch]">
            Numbers update live as{' '}
            <span className="font-mono text-amber-400/90">burnd fix</span>{' '}
            applies patches. Close the leak, watch the counter move.
          </p>
        </div>
      </div>
    </section>
  );
}
