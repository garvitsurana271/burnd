import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import { FlameVideo } from '../3d/FlameVideo.js';

const ESCALATING = ['$127', '$845', '$3,210', '$9,800'];
const FINAL = '$14,502';

export function Act1Hero(): JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Motion values that drive the 3D scene. Bridge to state where R3F needs numbers.
  const intensity = useTransform(scrollYProgress, [0, 1], [0.25, 1.0]);
  const bloomAmount = useTransform(scrollYProgress, [0, 1], [0.6, 2.2]);

  const [intensityVal, setIntensityVal] = useState(0.25);
  const [bloomVal, setBloomVal] = useState(0.6);
  useMotionValueEvent(intensity, 'change', (v) => setIntensityVal(v));
  useMotionValueEvent(bloomAmount, 'change', (v) => setBloomVal(v));

  // CSS scale on the canvas wrapper: start a touch pulled-in (1.3), settle to 1
  const canvasScale = useTransform(scrollYProgress, [0, 1], [1.15, 1.0]);

  // Escalating numbers. Each appears for ~7% of scroll, exits before next.
  const n0 = useTransform(scrollYProgress, [0.15, 0.19, 0.22, 0.25], [0, 1, 1, 0]);
  const n1 = useTransform(scrollYProgress, [0.25, 0.29, 0.32, 0.35], [0, 1, 1, 0]);
  const n2 = useTransform(scrollYProgress, [0.35, 0.39, 0.42, 0.45], [0, 1, 1, 0]);
  const n3 = useTransform(scrollYProgress, [0.45, 0.49, 0.52, 0.55], [0, 1, 1, 0]);
  const finalOpacity = useTransform(scrollYProgress, [0.55, 0.72], [0, 1]);
  const subtitleSharpen = useTransform(scrollYProgress, [0.72, 0.92], [0.5, 1]);

  // Ghosted watermark fades out once scroll begins so it doesn't compete with the numbers.
  const ghostOpacity = useTransform(scrollYProgress, [0, 0.12], [0.08, 0]);

  return (
    <section ref={sectionRef} className="relative h-[250vh]">
      {/* Pinned viewport */}
      <div className="sticky top-0 h-screen w-screen overflow-hidden bg-[#09090f]">
        {/* 3D flame layer */}
        <motion.div className="absolute inset-0" style={{ scale: canvasScale }}>
          <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 1] }} dpr={[1, 2]}>
            <FlameVideo intensity={intensityVal} />
            <EffectComposer>
              <Bloom
                intensity={bloomVal}
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                mipmapBlur
              />
            </EffectComposer>
          </Canvas>
        </motion.div>

        {/* Ghosted $14,502 watermark (behind flame but visible at t=0) */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
          style={{ opacity: ghostOpacity }}
        >
          <span className="font-mono text-[18vw] font-bold text-white select-none">{FINAL}</span>
        </motion.div>

        {/* Always-visible overlay (clarity-first rule) */}
        <div className="relative z-10 flex h-full flex-col items-start justify-center px-[6vw]">
          <h1 className="max-w-[13ch] text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.7)]">
            Your Claude Code bill
            <br />
            is bigger than you think.
          </h1>
          <motion.p
            className="mt-6 max-w-[42ch] text-[clamp(1rem,1.5vw,1.25rem)] text-white/75 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]"
            style={{ opacity: subtitleSharpen }}
          >
            Run <code className="rounded bg-white/10 px-2 py-0.5 font-mono text-amber-400">npx getburnd</code> to find the leaks.
            <br />
            Free. Local. MIT.
          </motion.p>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText('npx getburnd')}
            className="mt-10 rounded-lg bg-amber-500 px-8 py-4 text-lg font-semibold text-[#09090f] shadow-[0_0_60px_rgba(245,158,11,0.5)] transition-transform hover:scale-105 active:scale-100"
          >
            Copy &nbsp;<span className="font-mono">npx getburnd</span>
          </button>
        </div>

        {/* Escalating numbers erupt center-screen */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <motion.span
            className="font-mono text-[clamp(3rem,8vw,8rem)] font-bold text-white/90 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
            style={{ opacity: n0 }}
          >
            {ESCALATING[0]}
          </motion.span>
          <motion.span
            className="absolute font-mono text-[clamp(3.5rem,9vw,9rem)] font-bold text-white/95 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
            style={{ opacity: n1 }}
          >
            {ESCALATING[1]}
          </motion.span>
          <motion.span
            className="absolute font-mono text-[clamp(4rem,10vw,10rem)] font-bold text-amber-200 drop-shadow-[0_4px_32px_rgba(245,158,11,0.4)]"
            style={{ opacity: n2 }}
          >
            {ESCALATING[2]}
          </motion.span>
          <motion.span
            className="absolute font-mono text-[clamp(4.5rem,11vw,11rem)] font-bold text-amber-300 drop-shadow-[0_4px_40px_rgba(245,158,11,0.5)]"
            style={{ opacity: n3 }}
          >
            {ESCALATING[3]}
          </motion.span>
          <motion.span
            className="absolute font-mono text-[clamp(5rem,14vw,14rem)] font-bold tracking-tight text-amber-400 drop-shadow-[0_0_80px_rgba(245,158,11,0.7)]"
            style={{ opacity: finalOpacity }}
          >
            {FINAL}
          </motion.span>
        </div>
      </div>
    </section>
  );
}
