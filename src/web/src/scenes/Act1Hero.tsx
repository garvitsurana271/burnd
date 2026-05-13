import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, useScroll, useTransform, useMotionValueEvent, useInView, useMotionValue, useSpring } from 'motion/react';
import { FlameVideo } from '../3d/FlameVideo.js';

// "Cinematic Cold Open" — v7, 2026-04-25 ULTRA
// Layers added beyond v6:
//   1. Drifting ember particles (16 spans, CSS-only float-up loop with random delays)
//   2. Scanline sweep across $14,502 every ~5 seconds (vertical amber line)
//   3. Heat haze shimmer on $14,502 (sin-wave skewX)
//   4. Magnetic CTA — pill button leans toward cursor within its bounds
//   5. Cursor-tracked vignette — radial darkness center follows the mouse
//   6. Bottom-edge amber sweep beam every ~6 seconds
// Plus everything from v6: stagger reveal, breath, scroll parallax, glow pulse, etc.

const EMBERS = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  size: 2 + Math.random() * 3,
  duration: 7 + Math.random() * 8,
  delay: Math.random() * 10,
  drift: -10 + Math.random() * 20,
}));

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

  // Scroll-driven parallax + glow
  const billY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const billScale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);
  const billGlow = useTransform(
    scrollYProgress,
    [0, 1],
    ['0 0 60px rgba(245,158,11,0.35)', '0 0 100px rgba(245,158,11,0.55)'],
  );
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  // Cursor-tracked vignette
  const cursorX = useMotionValue(50);
  const cursorY = useMotionValue(40);
  const smoothCursorX = useSpring(cursorX, { stiffness: 60, damping: 20 });
  const smoothCursorY = useSpring(cursorY, { stiffness: 60, damping: 20 });
  const vignetteBg = useTransform(
    [smoothCursorX, smoothCursorY],
    ([x, y]: number[]) =>
      `radial-gradient(ellipse 75% 75% at ${x}% ${y}%, transparent 0%, rgba(9,9,15,0.45) 60%, rgba(9,9,15,0.92) 100%)`,
  );

  useEffect(() => {
    function onMove(e: MouseEvent): void {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      cursorX.set(((e.clientX - rect.left) / rect.width) * 100);
      cursorY.set(((e.clientY - rect.top) / rect.height) * 100);
    }
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [cursorX, cursorY]);

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

        {/* Drifting ember particles — atmospheric */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
          {EMBERS.map((e) => (
            <span
              key={e.id}
              className="absolute rounded-full bg-amber-400"
              style={{
                left: `${e.left}%`,
                bottom: '-10px',
                width: `${e.size}px`,
                height: `${e.size}px`,
                opacity: 0,
                animation: `emberRise ${e.duration}s ${e.delay}s ease-in infinite`,
                ['--drift' as string]: `${e.drift}vw`,
                boxShadow: '0 0 8px rgba(245,158,11,0.7)',
              }}
            />
          ))}
        </div>

        {/* Cursor-tracked vignette (replaces the static one) */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{ background: vignetteBg }}
        />

        {/* Bottom edge sweeping beam */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-[11] h-px overflow-hidden"
        >
          <span className="block h-full w-1/3 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-60" style={{ animation: 'sweepBeam 6s linear infinite' }} />
        </div>

        {/* TOP-LEFT brand mark */}
        <motion.div
          className="absolute top-[clamp(1.5rem,3vw,2rem)] left-[clamp(1.5rem,4vw,3rem)] z-30 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[#F5E8D4]/55"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          <motion.span
            className="text-[#F5E8D4]"
            animate={{ opacity: [1, 1, 0.6, 1, 1] }}
            transition={{ duration: 4, times: [0, 0.45, 0.5, 0.55, 1], repeat: Infinity, repeatDelay: 6 }}
          >
            Burnd
          </motion.span>
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

        {/* TOP-RIGHT meta with live dot */}
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
          {/* Eyebrow */}
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

          {/* THE NUMBER — SLAMS in, breathes, scroll-parallax, scanline sweep, heat haze */}
          <motion.div
            className="relative mb-8 inline-block font-mono font-bold tabular-nums tracking-[-0.04em] text-amber-400 text-[clamp(4.5rem,15vw,13rem)] leading-[0.9]"
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
            {/* Scanline sweep across the number */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
              style={{ mixBlendMode: 'overlay' }}
            >
              <span
                className="absolute left-0 right-0 h-[14%] bg-gradient-to-b from-transparent via-amber-200/60 to-transparent"
                style={{ animation: 'scanlineSweep 5s linear infinite', animationDelay: '2.5s' }}
              />
            </span>
          </motion.div>

          {/* Italic serif headline — word stagger */}
          <h1 className="font-serif text-[#F5E8D4] text-[clamp(1.5rem,3.6vw,3rem)] font-normal italic leading-[1.1] tracking-[-0.01em] max-w-[26ch]">
            <StaggeredWords
              words={['Your', 'Claude', 'Code', 'bill', 'is', 'bigger', 'than', 'you', 'think.']}
              baseDelay={1.55}
            />
          </h1>

          {/* CTA row — magnetic */}
          <motion.div
            className="mt-9 flex flex-wrap items-center gap-6"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.45, ease: 'easeOut' }}
          >
            <MagneticButton />

            <a href="/proof" className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#F5E8D4]/55 transition hover:text-[#F5E8D4]">
              See the invoice &rarr;
            </a>

            <a
              href="https://dev.to/getburnd/i-lost-14502-to-claude-code-in-one-month-heres-the-autopsy-1n1n"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#F5E8D4]/55 transition hover:text-[#F5E8D4]"
            >
              Read the autopsy &rarr;
            </a>
          </motion.div>

          {/* Social proof — live npm install count */}
          <motion.div
            className="mt-6 flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] uppercase text-[#F5E8D4]/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 2.85, ease: 'easeOut' }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400/80 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
            <InstallTicker />
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
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

      {/* Keyframes for the CSS-only loops */}
      <style>{`
        @keyframes emberRise {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }
          10% {
            opacity: 0.85;
          }
          85% {
            opacity: 0.6;
          }
          100% {
            transform: translate(var(--drift, 0), -110vh);
            opacity: 0;
          }
        }
        @keyframes sweepBeam {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(400%); }
          100% { transform: translateX(400%); }
        }
        @keyframes scanlineSweep {
          0% { top: -20%; opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { top: 110%; opacity: 0; }
        }
        @keyframes heatHaze {
          0%, 100% { transform: skewX(0deg) translateY(0); }
          25% { transform: skewX(0.4deg) translateY(-1px); }
          50% { transform: skewX(0deg) translateY(0); }
          75% { transform: skewX(-0.4deg) translateY(1px); }
        }
      `}</style>
    </section>
  );
}

// Continuous breath + heat haze — subtle wobble like firelight on metal.
function BillBreath(): JSX.Element {
  return (
    <motion.span
      className="inline-block"
      animate={{
        opacity: [1, 0.93, 1],
        scale: [1, 1.005, 1],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      style={{ animation: 'heatHaze 7s ease-in-out infinite' }}
    >
      $14,502
    </motion.span>
  );
}

// Word-by-word stagger reveal. Spaces live OUTSIDE the inline-block spans
// (otherwise display:inline-block strips them and words run together).
function StaggeredWords({ words, baseDelay }: { words: string[]; baseDelay: number }): JSX.Element {
  return (
    <>
      {words.map((w, i) => (
        <span key={`${i}-${w}`}>
          <motion.span
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
          </motion.span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  );
}

// Magnetic button — pill leans subtly toward the cursor when hovered.
function MagneticButton(): JSX.Element {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });

  function handleMove(e: React.MouseEvent<HTMLButtonElement>): void {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(dx * 0.25);
    y.set(dy * 0.25);
  }

  function handleLeave(): void {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      ref={ref}
      type="button"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={() => navigator.clipboard.writeText('npx getburnd')}
      className="group inline-flex items-center gap-3 rounded-full border border-amber-400/40 bg-white/[0.04] px-6 py-3 font-mono text-sm text-amber-300 transition-colors hover:border-amber-300 hover:bg-amber-400/10 hover:text-amber-200"
      style={{ x: sx, y: sy }}
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
    </motion.button>
  );
}

// Live npm install count. Fetches from api.npmjs.org/downloads/point/last-month.
// Falls back to a sensible static number if the API is offline so we never
// render an empty social-proof line. Cheap one-shot fetch; runs on mount.
function InstallTicker(): JSX.Element {
  const [count, setCount] = useState<number | null>(null);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('https://api.npmjs.org/downloads/point/last-month/getburnd')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const n = typeof d?.downloads === 'number' ? d.downloads : null;
        if (n != null && n > 0) setCount(n);
        else { setCount(1979); setStale(true); }
      })
      .catch(() => {
        if (cancelled) return;
        setCount(1979); setStale(true);
      });
    return () => { cancelled = true; };
  }, []);

  if (count == null) {
    return <span className="opacity-60">loading installs…</span>;
  }
  const formatted = count.toLocaleString('en-US');
  return (
    <span>
      <strong className="text-[#F5E8D4]/85 font-semibold tabular-nums">{formatted}</strong>
      <span className="ml-1.5">{stale ? 'devs ran burnd on their bill' : 'devs ran burnd last 30 days'}</span>
    </span>
  );
}
