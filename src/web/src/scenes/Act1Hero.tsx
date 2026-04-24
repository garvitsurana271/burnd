import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, useScroll, useTransform, useMotionValueEvent, useInView } from 'motion/react';
import { FlameVideo } from '../3d/FlameVideo.js';

// "Cinematic Cold Open" — v3, 2026-04-24
// One image, one title card. Full-bleed flame as atmosphere. Headline bottom-left.
// Corner brand mark top-left. NOTHING else visible at t=0. Ticker and CTA fade
// in after the smallest nudge of scroll so the reveal feels intentional.
// Duotone: amber flame + cream headline on near-black. No indigo (reserved for Act 3+).

const STOP_PROGRESSES = [0.0, 0.08, 0.18, 0.28, 0.38, 0.47, 0.55];
const STOP_VALUES = [127, 845, 3210, 9800, 13800, 14200, 14502];

export function Act1Hero(): JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.01 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const intensity = useTransform(scrollYProgress, [0, 1], [0.45, 1.0]);
  const [intensityVal, setIntensityVal] = useState(0.45);
  useMotionValueEvent(intensity, 'change', (v) => setIntensityVal(v));

  // Ticker value — counts up with scroll.
  const tickerValue = useTransform(scrollYProgress, STOP_PROGRESSES, STOP_VALUES);
  const tickerText = useTransform(tickerValue, (v) => `$${Math.round(v).toLocaleString()}`);

  // Ticker visibility: hidden at t=0, fades in at 0.02 (the tiniest scroll cue)
  const tickerOpacity = useTransform(scrollYProgress, [0, 0.02, 0.06], [0, 1, 1]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.03, 0.08], [1, 0.7, 0]);

  // Viewport for ticker escape translate.
  const [vp, setVp] = useState({ w: 1920, h: 1080 });
  useEffect(() => {
    const update = (): void => setVp({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Ticker escape: idles top-right until 0.6, then scales + translates to center.
  const tickerScale = useTransform(scrollYProgress, [0, 0.6, 0.88], [1, 1, 8]);
  const tickerX = useTransform(scrollYProgress, [0.6, 0.88], [0, -(vp.w / 2 - 120)]);
  const tickerY = useTransform(scrollYProgress, [0.6, 0.88], [0, vp.h / 2 - 60]);
  const tickerColor = useTransform(
    scrollYProgress,
    [0, 0.55, 0.7, 1],
    ['rgba(245, 158, 11, 0.95)', 'rgba(245, 158, 11, 1)', 'rgba(251, 191, 36, 1)', 'rgba(251, 191, 36, 1)'],
  );

  // Headline stays visible until the ticker starts escaping — then fades.
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.55, 0.72], [1, 1, 0]);
  const brandOpacity = useTransform(scrollYProgress, [0, 0.55, 0.7], [1, 1, 0]);
  const overlayDark = useTransform(scrollYProgress, [0.55, 0.88], [0, 0.55]);

  return (
    <section ref={sectionRef} className="relative h-[180vh]">
      <div className="sticky top-0 h-screen w-screen overflow-hidden bg-[#09090f] font-sans">
        {/* Flame canvas (mount-on-view) */}
        <div aria-hidden="true" className="absolute inset-0">
          {isInView && (
            <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 1] }} dpr={[1, 1.5]}>
              <FlameVideo intensity={intensityVal} />
            </Canvas>
          )}
        </div>

        {/* Radial vignette to focus the eye on the flame core + lift the bottom-left headline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              'radial-gradient(ellipse 70% 70% at 50% 45%, transparent 0%, rgba(9,9,15,0.35) 60%, rgba(9,9,15,0.85) 100%)',
          }}
        />

        {/* Overlay that takes over as $14,502 dominates */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 bg-black"
          style={{ opacity: overlayDark }}
        />

        {/* Top-left brand mark — tiny, unobtrusive */}
        <motion.div
          className="absolute top-[clamp(1.5rem,3vw,2rem)] left-[clamp(1.5rem,4vw,3rem)] z-30 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[#F5E8D4]/55"
          style={{ opacity: brandOpacity }}
        >
          <span className="text-[#F5E8D4]">Burnd</span>
          <span className="h-px w-6 bg-[#F5E8D4]/25" />
          <span>Incident 0001</span>
        </motion.div>

        {/* Live ticker — hidden at t=0, fades in with scroll cue. Escapes center at 0.6. */}
        <motion.div
          className="absolute top-[clamp(1.5rem,3vw,2rem)] right-[clamp(1.5rem,4vw,3rem)] z-40 flex items-center gap-3 origin-top-right"
          style={{
            scale: tickerScale,
            x: tickerX,
            y: tickerY,
            opacity: tickerOpacity,
          }}
        >
          <motion.span
            className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#F5E8D4]/55">Live</span>
          <motion.span
            className="font-mono text-[1.25rem] font-semibold tabular-nums leading-none"
            style={{ color: tickerColor }}
          >
            {tickerText}
          </motion.span>
        </motion.div>

        {/* Hero headline — bottom-left anchor. Only 2 lines. */}
        <motion.div
          className="absolute bottom-[clamp(2rem,7vh,5rem)] left-[clamp(1.5rem,4vw,3rem)] right-[clamp(1.5rem,4vw,3rem)] z-30"
          style={{ opacity: headlineOpacity }}
        >
          <div className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-amber-400/80">
            <span className="h-px w-8 bg-amber-400/60" />
            <span>Filed 2026-03-31 &middot; one developer &middot; one month</span>
          </div>

          <h1 className="font-serif text-[#F5E8D4] text-[clamp(3rem,8.5vw,8rem)] font-normal leading-[0.92] tracking-[-0.025em] max-w-[20ch]">
            <span>Your Claude Code </span>
            <span className="italic">bill</span>{' '}
            <br className="hidden sm:block" />
            <span className="italic text-amber-400">is bigger than you think.</span>
          </h1>
        </motion.div>

        {/* Scroll cue — faint line that fades after the smallest scroll */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 left-1/2 z-30 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ opacity: cueOpacity }}
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#F5E8D4]/40">Scroll</span>
          <motion.span
            className="block h-6 w-px bg-gradient-to-b from-amber-400/60 to-transparent"
            animate={{ scaleY: [1, 0.3, 1], transformOrigin: 'top' }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </section>
  );
}
