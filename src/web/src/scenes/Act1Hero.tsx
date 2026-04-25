import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, useScroll, useTransform, useMotionValueEvent, useInView } from 'motion/react';
import { FlameVideo } from '../3d/FlameVideo.js';

// "Cinematic Cold Open" — v5, 2026-04-25
// All animations stripped from the hero. The $14,502 is the headline.
// One frame, one image, one number. No scroll-driven crossfades that can break.
// Section is now a single screen height — no sticky range, no transitions.
// Gentle scroll-driven flame intensity is the only motion.

export function Act1Hero(): JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.01 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const intensity = useTransform(scrollYProgress, [0, 1], [0.55, 0.85]);
  const [intensityVal, setIntensityVal] = useState(0.55);
  useMotionValueEvent(intensity, 'change', (v) => setIntensityVal(v));

  return (
    <section ref={sectionRef} className="relative h-screen">
      <div className="relative h-full w-full overflow-hidden bg-[#09090f] font-sans">
        {/* Flame video atmosphere */}
        <div aria-hidden="true" className="absolute inset-0">
          {isInView && (
            <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 1] }} dpr={[1, 1.5]}>
              <FlameVideo intensity={intensityVal} />
            </Canvas>
          )}
        </div>

        {/* Radial vignette focusing flame core, lifting the bottom-left content */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              'radial-gradient(ellipse 75% 75% at 60% 40%, transparent 0%, rgba(9,9,15,0.45) 60%, rgba(9,9,15,0.92) 100%)',
          }}
        />

        {/* Top-left brand mark */}
        <div className="absolute top-[clamp(1.5rem,3vw,2rem)] left-[clamp(1.5rem,4vw,3rem)] z-30 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[#F5E8D4]/55">
          <span className="text-[#F5E8D4]">Burnd</span>
          <span className="h-px w-6 bg-[#F5E8D4]/25" />
          <span>Incident 0001</span>
        </div>

        {/* Top-right meta */}
        <div className="hidden md:flex absolute top-[clamp(1.5rem,3vw,2rem)] right-[clamp(1.5rem,4vw,3rem)] z-30 items-center gap-4 font-mono text-[10px] uppercase tracking-[0.24em] text-[#F5E8D4]/45">
          <span>One developer</span>
          <span className="text-[#F5E8D4]/20">&middot;</span>
          <span>One month</span>
          <span className="text-[#F5E8D4]/20">&middot;</span>
          <span>Claude Code</span>
        </div>

        {/* Hero content — bottom-left anchor, all visible at t=0 */}
        <div className="absolute bottom-[clamp(2rem,8vh,6rem)] left-[clamp(1.5rem,4vw,3rem)] right-[clamp(1.5rem,4vw,3rem)] z-30">
          <div className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-amber-400/85">
            <span className="h-px w-8 bg-amber-400/70" />
            <span>Filed 2026-03-31 &middot; the bill</span>
          </div>

          <div className="mb-8 font-mono font-bold tabular-nums tracking-[-0.04em] text-amber-400 text-[clamp(4.5rem,15vw,13rem)] leading-[0.9] drop-shadow-[0_0_60px_rgba(245,158,11,0.35)]">
            $14,502
          </div>

          <h1 className="font-serif text-[#F5E8D4] text-[clamp(1.5rem,3.6vw,3rem)] font-normal italic leading-[1.1] tracking-[-0.01em] max-w-[26ch]">
            Your Claude Code bill is bigger than you think.
          </h1>

          <div className="mt-8 flex items-center gap-6">
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText('npx getburnd')}
              className="group inline-flex items-center gap-3 rounded-full border border-amber-400/40 bg-white/[0.04] px-6 py-3 font-mono text-sm text-amber-300 transition-all hover:border-amber-300 hover:bg-amber-400/10 hover:text-amber-200"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              npx getburnd
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/40 transition-colors group-hover:text-[#F5E8D4]/70">copy</span>
            </button>

            <a href="/proof" className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#F5E8D4]/55 transition hover:text-[#F5E8D4]">
              See the invoice &rarr;
            </a>
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 right-[clamp(1.5rem,4vw,3rem)] z-30 flex flex-col items-center gap-2"
          animate={{ opacity: [0.3, 0.85, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#F5E8D4]/55">Scroll</span>
          <span className="block h-6 w-px bg-gradient-to-b from-amber-400/60 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
