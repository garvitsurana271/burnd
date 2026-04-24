import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';

// Styled segment type — never hardcode styling inside content strings.
interface Seg {
  t: string;
  cls: string;
}

// Header lines (command + scan + summary): Motion-driven, not scroll-locked.
const HEADER_LINES: Array<{ text: string; prompt: boolean }> = [
  { text: '$ npx getburnd', prompt: true },
  { text: 'Scanning ~/.claude/projects/*.jsonl ...', prompt: false },
  { text: 'Found 47 sessions, 2.1M tokens, $2,140 spent last 30 days.', prompt: false },
];

// Leak lines: each is a list of styled segments.
const LEAK_LINES: Seg[][] = [
  [
    { t: '1. ', cls: 'text-[#F5E8D4]/55' },
    { t: '[RETRY_STORM]', cls: 'font-bold text-indigo-400' },
    { t: ' session 2026-04-15-opus-2 · ', cls: 'text-[#F5E8D4]/55' },
    { t: '$180', cls: 'font-bold text-amber-400 text-[1.05em]' },
    { t: ' wasted on retries', cls: 'text-[#F5E8D4]/55' },
  ],
  [
    { t: '2. ', cls: 'text-[#F5E8D4]/55' },
    { t: '[REPEATED_READ]', cls: 'font-bold text-indigo-400' },
    { t: ' ', cls: '' },
    { t: 'src/api/handlers.ts', cls: 'font-mono text-[#F5E8D4]/45' },
    { t: ' read ', cls: 'text-[#F5E8D4]/55' },
    { t: '41x', cls: 'font-bold text-[#F5E8D4]' },
    { t: ' in one session · ', cls: 'text-[#F5E8D4]/55' },
    { t: '$95', cls: 'font-bold text-amber-400 text-[1.05em]' },
    { t: ' wasted', cls: 'text-[#F5E8D4]/55' },
  ],
  [
    { t: '3. ', cls: 'text-[#F5E8D4]/55' },
    { t: '[MODEL_SUBSTITUTION]', cls: 'font-bold text-indigo-400' },
    { t: ' Opus on routine work, Sonnet handles for ', cls: 'text-[#F5E8D4]/55' },
    { t: '5x', cls: 'font-bold text-[#F5E8D4]' },
    { t: ' less · ', cls: 'text-[#F5E8D4]/55' },
    { t: '$340/mo', cls: 'font-bold text-amber-400 text-[1.05em]' },
    { t: ' savings', cls: 'text-[#F5E8D4]/55' },
  ],
];

export function Act2Terminal(): JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Scroll progress for revealing leak lines as user scrolls through section.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end center'],
  });

  // useInView drives the initial header reveal — independent of scroll range.
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  // Map scroll progress to reveal thresholds for each leak line.
  // Leak lines start appearing once card is well in view (~0.3 progress).
  const leak0Opacity = useTransform(scrollYProgress, [0.25, 0.38], [0, 1]);
  const leak1Opacity = useTransform(scrollYProgress, [0.38, 0.51], [0, 1]);
  const leak2Opacity = useTransform(scrollYProgress, [0.51, 0.64], [0, 1]);

  const leakOpacities = [leak0Opacity, leak1Opacity, leak2Opacity];

  return (
    <section
      ref={sectionRef}
      className="relative py-[20vh] px-[clamp(1.5rem,4vw,3rem)]"
    >
      <div className="mx-auto max-w-[1400px]">
        {/* Eyebrow */}
        <motion.div
          className="mb-10 flex items-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <span className="h-px w-8 bg-amber-400/60" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/80">
            Section 02 · the readout
          </span>
        </motion.div>

        {/* Terminal card */}
        <motion.div
          ref={terminalRef}
          className="rounded-2xl border border-[#F5E8D4]/10 bg-black/70 backdrop-blur-lg p-8 shadow-[0_40px_120px_rgba(245,158,11,0.08)]"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          {/* Terminal chrome header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Traffic light dots */}
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/35">
              burnd · /scan
            </span>
          </div>

          {/* Hairline separator under chrome */}
          <div className="mb-6 h-px w-full bg-gradient-to-r from-amber-400/60 via-[#F5E8D4]/15 to-transparent" />

          {/* Header lines: Motion-driven (~400ms total), fire on inView */}
          <div className="space-y-2 font-mono text-sm leading-relaxed">
            {HEADER_LINES.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.18, delay: 0.25 + i * 0.12, ease: 'easeOut' }}
                className={
                  i === 0
                    ? 'text-amber-400'
                    : i === 1
                    ? 'text-[#F5E8D4]/55'
                    : 'text-[#F5E8D4]/80'
                }
              >
                {line.text}
              </motion.div>
            ))}

            {/* Empty line spacer */}
            <div className="h-3" />

            {/* Section label */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.18, delay: 0.65, ease: 'easeOut' }}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#F5E8D4]/40"
            >
              TOP 3 LEAKS (free tier):
            </motion.div>

            {/* Leak lines: scroll-driven, each ~100ms to fully render once triggered */}
            {LEAK_LINES.map((segments, i) => (
              <motion.div
                key={i}
                style={{ opacity: leakOpacities[i] }}
                className="flex flex-wrap items-baseline gap-0"
              >
                {segments.map((seg, j) => (
                  <span key={j} className={seg.cls}>
                    {seg.t}
                  </span>
                ))}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Below-card: hairline + framing text */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
        >
          <div className="h-px w-full bg-gradient-to-r from-amber-400/60 via-[#F5E8D4]/15 to-transparent" />
          <p className="mt-5 text-sm text-[#F5E8D4]/55 leading-relaxed max-w-[60ch]">
            A free CLI reads the files Claude Code already writes, and surfaces where the money goes.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
