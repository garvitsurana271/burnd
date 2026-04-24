import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, useScroll, useTransform, useMotionValueEvent, useInView } from 'motion/react';
import { EmberSphere } from '../3d/EmberSphere.js';

interface Detector {
  id: string;
  name: string;
  what: string;
  cost: string;
  fix: string;
}

const DETECTORS: Detector[] = [
  { id: 'retry', name: 'RETRY STORM', what: 'Same prompt retried 3+ times', cost: '~$180 per incident', fix: 'Flags first retry, suggests prompt change' },
  { id: 'substitute', name: 'MODEL SUBSTITUTION', what: 'Opus on work Sonnet handles', cost: '5x cost, same output', fix: 'Swaps to Sonnet for matched patterns' },
  { id: 'reads', name: 'REPEATED READS', what: 'Same file read 20+ times', cost: '~$95/session', fix: 'Suggests caching + file-anchor pins' },
  { id: 'tool', name: 'TOOL OVERUSE', what: 'One tool 80%+ of calls', cost: 'Token bloat', fix: 'Flags imbalance, proposes tool-shift' },
  { id: 'focus', name: 'FOCUS-WINDOW', what: 'Spend outside focus hours', cost: '~30% more per $1', fix: 'Surfaces off-hours, CLAUDE.md patch' },
  { id: 'thrash', name: 'THRASH', what: 'High agent error rate', cost: 'Compounds retries', fix: 'Rolls back to working state' },
  { id: 'outlier', name: 'PROJECT OUTLIER', what: 'One project 5x median cost', cost: '~$340/mo blind spot', fix: 'Diff vs baseline' },
  { id: 'skill', name: 'SKILL FIRING', what: 'Anomalous skill trigger rate', cost: 'Variable', fix: 'Suggests skill-scoping' },
];

const RING_POSITIONS: Array<[number, number, number]> = [
  [-2.8,  1.0, 0.2],
  [-1.6,  1.7, -0.4],
  [ 0.0,  2.0, 0.3],
  [ 1.6,  1.7, -0.4],
  [ 2.8,  1.0, 0.2],
  [ 1.6, -0.4, -0.3],
  [ 0.0, -0.8, 0.4],
  [-1.6, -0.4, -0.3],
];

export function Act3Embers(): JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.05 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const rotateY = useTransform(scrollYProgress, [0, 1], [0, Math.PI * 0.5]);

  const [rotVal, setRotVal] = useState(0);
  useMotionValueEvent(rotateY, 'change', (v) => setRotVal(v));

  return (
    <section ref={sectionRef} className="relative py-[20vh] px-[clamp(1.5rem,4vw,3rem)]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex items-center gap-3">
          <span className="h-px w-8 bg-amber-400/60" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/80">
            Section 03 · the detectors
          </span>
        </div>

        <h2 className="font-serif text-[#F5E8D4] text-[clamp(2.5rem,6vw,5.5rem)] font-normal leading-[0.95] tracking-[-0.01em] max-w-[20ch]">
          Eight ways <span className="italic">your bill</span> leaks.
          <br />
          <span className="italic text-amber-400">One detector each.</span>
        </h2>

        <div className="relative mt-16 min-h-[60vh]">
          {/* 3D ember ring: mount only while section is in view to free GPU otherwise */}
          <div aria-hidden="true" className="absolute inset-0 -z-0 opacity-60">
            {isInView && (
              <Canvas camera={{ position: [0, 0, 6], fov: 55 }} dpr={[1, 1.5]}>
                <ambientLight intensity={0.3} />
                <pointLight position={[0, 0, 5]} intensity={1.4} color="#f59e0b" />
                <group rotation={[0, rotVal, 0]}>
                  {RING_POSITIONS.map((pos, i) => (
                    <EmberSphere key={i} position={pos} intensity={0.5 + (i % 3) * 0.2} />
                  ))}
                </group>
              </Canvas>
            )}
          </div>

          {/* Cards grid: substance-first, always visible. bg-black/70 replaces backdrop-blur (GPU-expensive) */}
          <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DETECTORS.map((d, i) => (
              <motion.article
                key={d.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group relative rounded-xl border border-[#F5E8D4]/10 bg-black/70 p-5 transition-colors hover:border-amber-400/40"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400/60 transition group-hover:bg-amber-400" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-indigo-400">{d.name}</span>
                </div>
                <div className="font-serif text-xl text-[#F5E8D4] leading-tight">{d.what}</div>
                <div className="mt-3 font-mono text-sm text-amber-400 tabular-nums">{d.cost}</div>
                <div className="mt-1 text-xs text-[#F5E8D4]/55">{d.fix}</div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
