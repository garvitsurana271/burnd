import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, useScroll, useTransform, useMotionValueEvent, useInView } from 'motion/react';
import { FlameVideo } from '../3d/FlameVideo.js';

// "Cinematic Cold Open" — v6, 2026-04-25
// Layered animations: page-load stagger reveal + continuous breath + scroll-driven parallax.
// Every element is visible at t=0 but animates IN dramatically. No crossfades that can break.
// The $14,502 is the headline — huge, animated, the focal point of the entire frame.

export function Act1Hero(): JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.01 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const intensity = useTransform(scrollYProgress, [0, 1], [0.55, 1.0]);
  const [intensityVal, setIntensityVal] = useState(0.55);
  useMotionValueEvent(intensity, 'change', (v) => setIntensityVal(v));

  // Scroll-driven parallax on the bill amount + headline (gentle, all in single direction).
  const billY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const billScale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);
  const billGlow = useTransform(
    scrollYProgress,
    [0, 1],
    ['0 0 60px rgba(245,158,11,0.35)', '0 0 100px rgba(245,158,11,0.55)'],
  );
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -40]);

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

        {/* Radial vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              'radial-gradient(ellipse 75% 75% at 60% 40%, transparent 0%, rgba(9,9,15,0.45) 60%, rgba(9,9,15,0.92) 100%)',
          }}
        />

        {/* TOP-LEFT brand mark — fade in fast on load, then static */}
        <motion.div
          className="absolute top-[clamp(1.5rem,3vw,2rem)] left-[clamp(1.5rem,4vw,3rem)] z-30 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[#F5E8D4]/55"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          <span className="text-[#F5E8D4]">Burnd</span>
          <motion.span
            className="h-px bg-[#F5E8D4]/25"
            initial={{ width: 0 }}
            animate={{ width: 24 }}
            transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
          />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            Incident 0001
          </motion.span>
        </motion.div>

        {/* TOP-RIGHT meta */}
        <motion.div
          className="hidden md:flex absolute top-[clamp(1.5rem,3vw,2rem)] right-[clamp(1.5rem,4vw,3rem)] z-30 items-center gap-4 font-mono text-[10px] uppercase tracking-[0.24em] text-[#F5E8D4]/45"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
        >
          <span>One developer</span>
          <span className="text-[#F5E8D4]/20">&middot;</span>
          <span>One month</span>
          <span className="text-[#F5E8D4]/20">&middot;</span>
          <motion.span
            className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="text-amber-400/85">Live</span>
        </motion.div>

        {/* BOTTOM-LEFT hero stack */}
        <motion.div
          className="absolute bottom-[clamp(2rem,8vh,6rem)] left-[clamp(1.5rem,4vw,3rem)] right-[clamp(1.5rem,4vw,3rem)] z-30"
          style={{ y: headlineY }}
        >
          {/* Eyebrow with drawing line */}
          <motion.div
            className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-amber-400/85"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.85 }}
          >
            <motion.span
              className="h-px bg-amber-400/70"
              initial={{ width: 0 }}
              animate={{ width: 32 }}
              transition={{ duration: 0.55, delay: 0.95, ease: 'easeOut' }}
            />
            <span>Filed 2026-03-31 &middot; the bill</span>
          </motion.div>

          {/* THE NUMBER — big, animated entrance + continuous breath + scroll parallax */}
          <motion.div
            className="mb-8 font-mono font-bold tabular-nums tracking-[-0.04em] text-amber-400 text-[clamp(4.5rem,15vw,13rem)] leading-[0.9]"
            initial={{ opacity: 0, scale: 1.15, y: 32, filter: 'blur(12px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.0, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              y: billY,
              scale: billScale,
              textShadow: billGlow,
            }}
          >
            <BillBreath />
          </motion.div>

          {/* Italic serif headline — word-by-word stagger */}
          <h1 className="font-serif text-[#F5E8D4] text-[clamp(1.5rem,3.6vw,3rem)] font-normal italic leading-[1.1] tracking-[-0.01em] max-w-[26ch]">
            <StaggeredWords
              words={['Your', 'Claude', 'Code', 'bill', 'is', 'bigger', 'than', 'you', 'think.']}
              baseDelay={1.55}
            />
          </h1>

          {/* CTA row */}
          <motion.div
            className="mt-9 flex flex-wrap items-center gap-6"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.45, ease: 'easeOut' }}
          >
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText('npx getburnd')}
              className="group inline-flex items-center gap-3 rounded-full border border-amber-400/40 bg-white/[0.04] px-6 py-3 font-mono text-sm text-amber-300 transition-all hover:border-amber-300 hover:bg-amber-400/10 hover:text-amber-200"
            >
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-amber-400"
                animate={{
                  boxShadow: ['0 0 6px rgba(245,158,11,0.6)', '0 0 16px rgba(245,158,11,0.95)', '0 0 6px rgba(245,158,11,0.6)'],
                }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              npx getburnd
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/40 transition-colors group-hover:text-[#F5E8D4]/70">copy</span>
            </button>

            <a href="/proof" className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#F5E8D4]/55 transition hover:text-[#F5E8D4]">
              See the invoice &rarr;
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll cue — looping pulse */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 right-[clamp(1.5rem,4vw,3rem)] z-30 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.85, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 2.8 }}
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#F5E8D4]/55">Scroll</span>
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

// Continuous "breath" effect on the bill amount — subtle rise and fall like firelight.
function BillBreath(): JSX.Element {
  return (
    <motion.span
      className="inline-block"
      animate={{
        opacity: [1, 0.93, 1],
        scale: [1, 1.005, 1],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      $14,502
    </motion.span>
  );
}

// Word-by-word reveal for the italic serif headline.
function StaggeredWords({ words, baseDelay }: { words: string[]; baseDelay: number }): JSX.Element {
  return (
    <>
      {words.map((w, i) => (
        <motion.span
          key={`${i}-${w}`}
          className="inline-block"
          initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 0.7,
            delay: baseDelay + i * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </>
  );
}
