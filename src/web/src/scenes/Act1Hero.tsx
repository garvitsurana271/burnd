import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, useScroll, useTransform, useMotionValueEvent, useInView } from 'motion/react';
import { FlameVideo } from '../3d/FlameVideo.js';

// Perf-conscious redesign (2026-04-24 b):
// - Section height dropped from 300vh to 180vh so the scroll feels snappy.
// - Canvas unmounts the moment the section leaves viewport (frees GPU for Act 2+).
// - Postprocessing (Bloom/Vignette) removed — too expensive on mid-range hardware.
// - Grain overlay removed (mix-blend-overlay was causing jank).
// - DPR capped at 1.5 so retina doesn't quadruple pixel cost.
// - Flame shader octave count reduced in flame.ts (3 instead of 6).
// - Lenis smooth scroll disabled project-wide; native scroll responds instantly.

const STOP_PROGRESSES = [0.0, 0.08, 0.18, 0.28, 0.38, 0.47, 0.55];
const STOP_VALUES = [127, 845, 3210, 9800, 13800, 14200, 14502];

export function Act1Hero(): JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null);
  // isInView guards the Canvas mount — when user scrolls past, we unmount R3F
  // so the GPU isn't doing work while Acts 2-6 try to render.
  const isInView = useInView(sectionRef, { amount: 0.01 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const intensity = useTransform(scrollYProgress, [0, 1], [0.4, 1.0]);
  const [intensityVal, setIntensityVal] = useState(0.4);
  useMotionValueEvent(intensity, 'change', (v) => setIntensityVal(v));

  // Smooth count-up for the ticker.
  const tickerValue = useTransform(scrollYProgress, STOP_PROGRESSES, STOP_VALUES);
  const tickerText = useTransform(tickerValue, (v) => `$${Math.round(v).toLocaleString()}`);

  const [vp, setVp] = useState({ w: 1920, h: 1080 });
  useEffect(() => {
    const update = (): void => setVp({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Ticker escape: idle in corner until 0.6, then translates center and scales.
  const tickerScale = useTransform(scrollYProgress, [0, 0.6, 0.88], [1, 1, 8]);
  const tickerX = useTransform(scrollYProgress, [0.6, 0.88], [0, -(vp.w / 2 - 120)]);
  const tickerY = useTransform(scrollYProgress, [0.6, 0.88], [0, vp.h / 2 - 60]);
  const tickerColor = useTransform(
    scrollYProgress,
    [0, 0.55, 0.7, 1],
    ['rgba(245, 158, 11, 0.95)', 'rgba(245, 158, 11, 1)', 'rgba(251, 191, 36, 1)', 'rgba(251, 191, 36, 1)'],
  );

  const bodyOpacity = useTransform(scrollYProgress, [0, 0.05, 0.6, 0.75], [1, 1, 1, 0]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.5, 0.7], [1, 1, 0]);
  const overlayDark = useTransform(scrollYProgress, [0.55, 0.88], [0, 0.55]);

  return (
    <section ref={sectionRef} className="relative h-[180vh]">
      <div className="sticky top-0 h-screen w-screen overflow-hidden bg-[#09090f] font-sans">
        {/* Flame canvas (only mounted while section is in view) */}
        <div aria-hidden="true" className="absolute inset-0">
          {isInView && (
            <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 1] }} dpr={[1, 1.5]}>
              <FlameVideo intensity={intensityVal} />
            </Canvas>
          )}
        </div>

        <motion.div
          className="pointer-events-none absolute inset-0 z-20 bg-black"
          style={{ opacity: overlayDark }}
        />

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

        <motion.div
          className="absolute top-[3.5rem] right-[clamp(1rem,4vw,3rem)] z-40 flex items-center gap-3 origin-top-right"
          style={{
            scale: tickerScale,
            x: tickerX,
            y: tickerY,
          }}
        >
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

        <motion.div
          className="absolute inset-0 z-30 flex items-center"
          style={{ opacity: headlineOpacity }}
        >
          <div className="w-full max-w-[1400px] mx-auto px-[clamp(1.5rem,4vw,3rem)]">
            <div className="max-w-[24ch]">
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

        <motion.div
          className="absolute bottom-0 left-0 right-0 z-30 px-[clamp(1rem,4vw,3rem)] pb-8"
          style={{ opacity: bodyOpacity }}
        >
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
