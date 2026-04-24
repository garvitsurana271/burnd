import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import { FlameVideo } from '../3d/FlameVideo.js';

// Incident-report aesthetic: the story is a financial disaster post-mortem, not a SaaS pitch.
// One dev, one month, one Claude Code account. Bill: $14,502.
// The ticker lives in the top-right corner like a Bloomberg feed, ticks up as the user scrolls,
// then "escapes" its corner and dominates the viewport at the climax.

// Seven interpolation stops so the ticker visibly steps through notable values.
const STOP_PROGRESSES = [0.0, 0.15, 0.23, 0.31, 0.39, 0.47, 0.58];
const STOP_VALUES = [0, 127, 845, 3210, 9800, 13800, 14502];

export function Act1Hero(): JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Flame + bloom driven by scroll.
  const intensity = useTransform(scrollYProgress, [0, 1], [0.3, 1.0]);
  const bloomAmount = useTransform(scrollYProgress, [0, 1], [0.6, 2.0]);

  const [intensityVal, setIntensityVal] = useState(0.3);
  const [bloomVal, setBloomVal] = useState(0.6);
  useMotionValueEvent(intensity, 'change', (v) => setIntensityVal(v));
  useMotionValueEvent(bloomAmount, 'change', (v) => setBloomVal(v));

  // Smooth count-up for the ticker value.
  const tickerValue = useTransform(scrollYProgress, STOP_PROGRESSES, STOP_VALUES);
  const tickerText = useTransform(tickerValue, (v) => `$${Math.round(v).toLocaleString()}`);

  // Ticker escape animation: stays small in top-right until 0.62, then scales out toward center
  // while translating left and down. By 0.88 it fills viewport center.
  const tickerScale = useTransform(scrollYProgress, [0, 0.62, 0.88], [1, 1, 7.5]);
  const tickerX = useTransform(scrollYProgress, [0.62, 0.88], ['0vw', '-calc(50vw - 10rem)' as unknown as string]);
  const tickerY = useTransform(scrollYProgress, [0.62, 0.88], ['0vh', 'calc(48vh - 2rem)' as unknown as string]);
  // Pulse on the ticker body through its whole lifetime (breathing)
  const tickerColor = useTransform(
    scrollYProgress,
    [0, 0.58, 0.7, 1],
    ['rgba(245, 158, 11, 0.85)', 'rgba(245, 158, 11, 1)', 'rgba(251, 191, 36, 1)', 'rgba(251, 191, 36, 1)'],
  );

  // Headline + metadata fade out as the ticker takes over.
  const bodyOpacity = useTransform(scrollYProgress, [0, 0.1, 0.6, 0.75], [0, 1, 1, 0]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.1, 0.5, 0.7], [1, 1, 1, 0]);

  // Overall viewport darkening as the ticker dominates.
  const overlayDark = useTransform(scrollYProgress, [0.55, 0.88], [0, 0.55]);

  return (
    <section ref={sectionRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen w-screen overflow-hidden bg-[#09090f] font-sans">
        {/* Flame canvas */}
        <div className="absolute inset-0">
          <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 1] }} dpr={[1, 2]}>
            <FlameVideo intensity={intensityVal} />
            <EffectComposer>
              <Bloom
                intensity={bloomVal}
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                mipmapBlur
              />
              <Vignette offset={0.15} darkness={0.75} />
            </EffectComposer>
          </Canvas>
        </div>

        {/* Grain overlay (noise texture) */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' seed='7'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Scroll-driven dark overlay that takes over as $14,502 dominates */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 bg-black"
          style={{ opacity: overlayDark }}
        />

        {/* Top eyebrow band */}
        <motion.div
          className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-[clamp(1rem,4vw,3rem)] py-6 font-mono text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/50"
          style={{ opacity: bodyOpacity }}
        >
          <div className="flex items-center gap-4">
            <span className="text-[#F5E8D4]/80">Burnd</span>
            <span className="h-px w-8 bg-[#F5E8D4]/20" />
            <span>Incident report &middot; 0001</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span>One developer</span>
            <span className="text-[#F5E8D4]/20">&middot;</span>
            <span>One month</span>
            <span className="text-[#F5E8D4]/20">&middot;</span>
            <span>Claude Code API</span>
          </div>
        </motion.div>

        {/* Live ticker — starts top-right as corner counter, then escapes center */}
        <motion.div
          className="absolute top-[3.5rem] right-[clamp(1rem,4vw,3rem)] z-40 flex items-center gap-3 origin-top-right"
          style={{
            scale: tickerScale,
            x: tickerX,
            y: tickerY,
          }}
        >
          {/* LIVE dot */}
          <motion.span
            className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/55">Live</span>
          <motion.span
            className="font-mono text-[1.25rem] font-semibold tabular-nums leading-none"
            style={{ color: tickerColor }}
          >
            {tickerText}
          </motion.span>
        </motion.div>

        {/* Headline zone (left-aligned, asymmetric) */}
        <motion.div
          className="absolute inset-0 z-30 flex items-center"
          style={{ opacity: headlineOpacity }}
        >
          <div className="w-full max-w-[1400px] mx-auto px-[clamp(1.5rem,4vw,3rem)]">
            <div className="max-w-[20ch]">
              <div className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/80">
                <span className="h-px w-8 bg-amber-400/60" />
                <span>Filed 2026-03-31</span>
              </div>
              <h1 className="font-serif text-[#F5E8D4] text-[clamp(3rem,8vw,7.5rem)] font-normal leading-[0.92] tracking-[-0.02em]">
                <span className="italic text-[#F5E8D4]/95">Your </span>
                <span>Claude Code </span>
                <span className="italic text-[#F5E8D4]/95">bill </span>
                <br />
                <span>is bigger </span>
                <span className="italic text-amber-400">than you think.</span>
              </h1>
            </div>
          </div>
        </motion.div>

        {/* Bottom metadata strip */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-30 px-[clamp(1rem,4vw,3rem)] pb-8"
          style={{ opacity: bodyOpacity }}
        >
          {/* Hairline rule */}
          <div className="h-px w-full bg-gradient-to-r from-amber-400/60 via-[#F5E8D4]/15 to-transparent" />

          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <p className="max-w-[42ch] text-[15px] leading-relaxed text-[#F5E8D4]/65">
              A free local CLI that reads your <span className="font-mono text-amber-400/90">.claude/projects/*.jsonl</span> session files and surfaces the cost leaks nobody else sees.
            </p>

            <button
              type="button"
              onClick={() => navigator.clipboard.writeText('npx getburnd')}
              className="group inline-flex items-center gap-3 self-start md:self-auto"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/75 transition group-hover:text-amber-300">Run</span>
              <span className="flex items-center gap-2 font-mono text-base text-[#F5E8D4] transition group-hover:text-amber-200">
                <span className="text-amber-400">&rarr;</span>
                npx getburnd
              </span>
              <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/35 transition group-hover:text-[#F5E8D4]/70">click to copy</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
