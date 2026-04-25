import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, useScroll, useTransform, useMotionValueEvent, useInView } from 'motion/react';
import { FlameVideo } from '../3d/FlameVideo.js';

// "Cinematic Cold Open" — v4, 2026-04-24 evening
// The corner-ticker counting mechanic was unsatisfying — too much scroll for too
// little reward. Replaced with a single film-cut style reveal: hero stays static,
// then at scroll 0.55 the cinematic CUTS to the bill amount as the dominant frame.
// Section shortened from 180vh to 130vh so the scroll feels punchy, not draggy.

export function Act1Hero(): JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.01 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Flame breathes harder as we scroll into the cut.
  const intensity = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 0.7, 1.0]);
  const [intensityVal, setIntensityVal] = useState(0.5);
  useMotionValueEvent(intensity, 'change', (v) => setIntensityVal(v));

  // Scroll cue fades the moment user starts.
  const cueOpacity = useTransform(scrollYProgress, [0, 0.05, 0.12], [1, 0.5, 0]);

  // Hero card — visible from t=0 until the reveal "cut" at 0.55.
  const heroOpacity = useTransform(scrollYProgress, [0, 0.45, 0.58], [1, 1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.55], [0, -24]);

  // Reveal — the bill amount and one-line context "cut" in at 0.55.
  const revealOpacity = useTransform(scrollYProgress, [0.5, 0.62, 0.85, 1], [0, 1, 1, 0.7]);
  const revealScale = useTransform(scrollYProgress, [0.5, 0.62], [0.94, 1]);

  // Brand mark sticks around the entire hero.
  const brandOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 1, 0]);

  // Hard darkening that punches into the cut frame.
  const overlayDark = useTransform(scrollYProgress, [0.45, 0.62], [0, 0.6]);

  // Subtle "viewport closing" cinema bars during the cut.
  const barHeight = useTransform(scrollYProgress, [0.45, 0.62], ['0%', '8%']);

  return (
    <section ref={sectionRef} className="relative h-[130vh]">
      <div className="sticky top-0 h-screen w-screen overflow-hidden bg-[#09090f] font-sans">
        {/* Flame video atmosphere */}
        <div aria-hidden="true" className="absolute inset-0">
          {isInView && (
            <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 1] }} dpr={[1, 1.5]}>
              <FlameVideo intensity={intensityVal} />
            </Canvas>
          )}
        </div>

        {/* Radial vignette focusing the flame core */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              'radial-gradient(ellipse 75% 75% at 50% 45%, transparent 0%, rgba(9,9,15,0.4) 60%, rgba(9,9,15,0.9) 100%)',
          }}
        />

        {/* Hard overlay darkens the world as the cut lands */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 bg-black"
          style={{ opacity: overlayDark }}
        />

        {/* Cinema bars — top + bottom black bars that close in during the cut */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 right-0 z-30 bg-[#09090f]"
          style={{ height: barHeight }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 bg-[#09090f]"
          style={{ height: barHeight }}
        />

        {/* Top-left brand mark */}
        <motion.div
          className="absolute top-[clamp(1.5rem,3vw,2rem)] left-[clamp(1.5rem,4vw,3rem)] z-40 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[#F5E8D4]/55"
          style={{ opacity: brandOpacity }}
        >
          <span className="text-[#F5E8D4]">Burnd</span>
          <span className="h-px w-6 bg-[#F5E8D4]/25" />
          <span>Incident 0001</span>
        </motion.div>

        {/* HERO CARD — visible until the cut */}
        <motion.div
          className="absolute bottom-[clamp(2rem,7vh,5rem)] left-[clamp(1.5rem,4vw,3rem)] right-[clamp(1.5rem,4vw,3rem)] z-30"
          style={{ opacity: heroOpacity, y: heroY }}
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

        {/* THE CUT — single dominant frame replaces the hero */}
        <motion.div
          className="absolute inset-0 z-30 flex flex-col items-center justify-center px-8"
          style={{ opacity: revealOpacity, scale: revealScale }}
        >
          <div className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-amber-400/80">
            <span className="h-px w-8 bg-amber-400/60" />
            <span>The bill</span>
            <span className="h-px w-8 bg-amber-400/60" />
          </div>

          <div className="font-mono text-[clamp(5rem,18vw,16rem)] font-bold tracking-[-0.04em] text-amber-400 tabular-nums leading-none drop-shadow-[0_0_60px_rgba(245,158,11,0.4)]">
            $14,502
          </div>

          <p className="mt-8 max-w-[36ch] text-center font-serif text-[clamp(1.1rem,1.6vw,1.5rem)] italic leading-snug text-[#F5E8D4]/80">
            One month. One developer. One Claude Code account. No idea where the money went.
          </p>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 left-1/2 z-40 -translate-x-1/2 flex flex-col items-center gap-2"
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
