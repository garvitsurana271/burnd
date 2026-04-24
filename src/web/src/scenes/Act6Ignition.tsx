import { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'motion/react';

export function Act6Ignition(): JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end end'],
  });

  // Ignition edge sweeps 0% -> 100% during 30-90% of scroll progress
  const edgePct = useTransform(scrollYProgress, [0.3, 0.9], [0, 100]);
  const backgroundImage = useMotionTemplate`linear-gradient(92deg, #f59e0b 0%, #f59e0b ${edgePct}%, rgba(245, 232, 212, 0.35) ${edgePct}%, rgba(245, 232, 212, 0.35) 100%)`;
  const glowShadow = useMotionTemplate`0 0 ${edgePct}px rgba(245, 158, 11, 0.45)`;

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col items-center justify-center px-[clamp(1.5rem,4vw,3rem)] py-[15vh]"
    >
      <div className="mx-auto max-w-[1400px] w-full">
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-amber-400/60" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/80">Section 06 · ignition</span>
        </div>

        <motion.h1
          className="mx-auto font-mono font-black leading-none tracking-[-0.04em] text-center"
          style={{
            fontSize: 'clamp(5rem, 20vw, 18rem)',
            backgroundImage,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: glowShadow,
          }}
        >
          BURND
        </motion.h1>

        <p className="mx-auto mt-14 max-w-[50ch] text-center font-serif text-[clamp(1.25rem,2vw,1.75rem)] italic leading-snug text-[#F5E8D4]/75">
          Stop wondering where the money went.
          <br />
          See it. Fix it. Keep the savings.
        </p>

        <div className="mx-auto mt-12 flex max-w-md flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText('npx getburnd')}
            className="group inline-flex items-center gap-3 rounded-full border border-amber-400/40 bg-white/[0.04] px-7 py-3 font-mono text-sm text-amber-300 backdrop-blur-md transition-all hover:border-amber-300 hover:bg-amber-400/10 hover:text-amber-200"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            npx getburnd
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/40 transition-colors group-hover:text-[#F5E8D4]/70">copy</span>
          </button>
        </div>

        <div className="mx-auto mt-16 flex items-center justify-center gap-6 font-mono text-[11px] uppercase tracking-[0.22em] text-[#F5E8D4]/40">
          <a href="https://github.com/garvitsurana/burnd" className="transition hover:text-[#F5E8D4]/80">GitHub</a>
          <span className="text-[#F5E8D4]/20">·</span>
          <a href="/proof" className="transition hover:text-[#F5E8D4]/80">Real invoice</a>
          <span className="text-[#F5E8D4]/20">·</span>
          <a href="/why-claude-code-is-expensive.html" className="transition hover:text-[#F5E8D4]/80">Why it&apos;s expensive</a>
          <span className="text-[#F5E8D4]/20">·</span>
          <a href="/calculator" className="transition hover:text-[#F5E8D4]/80">Calculator</a>
        </div>
      </div>
    </section>
  );
}
