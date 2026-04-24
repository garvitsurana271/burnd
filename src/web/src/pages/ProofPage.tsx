import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

export function ProofPage(): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const rotateY = useTransform(scrollYProgress, [0, 1], [-10, 10]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1.03, 0.92]);

  return (
    <div className="min-h-screen bg-[#09090f] text-[#F5E8D4] font-sans antialiased">
      <section ref={ref} className="relative py-[15vh] px-[clamp(1.5rem,4vw,3rem)]">
        <div className="mx-auto max-w-[1400px]">
          {/* Eyebrow */}
          <div className="mb-8 flex items-center gap-3">
            <span className="h-px w-8 bg-amber-400/60" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/80">
              Exhibit A &middot; the invoice
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-[#F5E8D4] text-[clamp(2.75rem,7vw,6rem)] font-normal leading-[0.95] tracking-[-0.02em] max-w-[16ch]">
            Real. <span className="italic">Redacted.</span>
            <br />
            <span className="italic text-amber-400">Undeniable.</span>
          </h1>

          {/* Invoice frame */}
          <motion.div
            className="mx-auto mt-20 max-w-3xl"
            style={{ rotateY, scale, transformStyle: 'preserve-3d', perspective: '1600px' }}
          >
            <div className="relative rounded-2xl border border-amber-400/30 bg-black/80 p-4 shadow-[0_80px_220px_rgba(245,158,11,0.15)]">
              {/* Image OR placeholder */}
              <img
                src="/proof-invoice.png"
                alt="Anthropic invoice for $14,502 (name + card digits redacted)"
                className="w-full rounded-lg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
              <div
                className="hidden aspect-[4/5] w-full rounded-lg flex-col items-center justify-center gap-4 bg-[#09090f]/80 font-mono text-[#F5E8D4]/50 text-xs uppercase tracking-[0.22em]"
              >
                <div>Invoice screenshot pending</div>
                <div className="text-[#F5E8D4]/30">save to /proof-invoice.png</div>
              </div>

              <div className="absolute -top-3 left-6 rounded-full bg-amber-400 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-[#09090f]">
                Real invoice
              </div>
            </div>
          </motion.div>

          {/* Body copy */}
          <div className="mx-auto mt-20 max-w-2xl space-y-6 text-[#F5E8D4]/75">
            <p className="font-serif text-2xl italic text-[#F5E8D4]/90">
              This is the Anthropic invoice that kicked off Burnd.
            </p>
            <p>
              Name and card digits redacted. Amount circled for clarity:{' '}
              <span className="font-mono font-bold text-amber-400 tabular-nums">$14,502.14</span>. Issue date 2026-03-31.
              One month of Claude Code usage, one developer, one account.
            </p>
            <p>
              If you were wondering whether the number was real, now you know.
            </p>
          </div>

          {/* Closer CTA */}
          <div className="mx-auto mt-16 flex max-w-2xl justify-center">
            <a
              href="/"
              className="inline-flex items-center gap-3 rounded-full border border-amber-400/40 bg-amber-500/90 px-8 py-4 font-mono text-sm font-semibold uppercase tracking-[0.2em] text-[#09090f] transition hover:bg-amber-400"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#09090f]" />
              Run npx getburnd
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
