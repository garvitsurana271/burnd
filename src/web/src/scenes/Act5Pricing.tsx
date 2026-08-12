import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

// Act 5 used to be the pricing act — $8.99/mo and $89 lifetime, with live Dodo
// checkout links. Burnd stopped being sold in 0.1.0 and every feature is now
// free, so this act became the honest ending instead: what happened, and why.
// See POSTMORTEM.md at the repo root.

const WHAT_HAPPENED = [
  {
    stat: '10',
    label: 'detectors, all free',
    detail: 'Every command unlocked in 0.1.0. No licence, no tiers, no account.',
  },
  {
    stat: '5,367:1',
    label: 'the download gap',
    detail: 'ccusage ships 423,971/month against burnd’s 79. The category has a free winner.',
  },
  {
    stat: '2×',
    label: 'absorbed by the vendor',
    detail: 'Anthropic shipped /usage, then claude doctor. Both were burnd’s core value.',
  },
];

export function Act5Pricing(): JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  });

  // The postmortem card picks up an amber glow as the user scrolls it into frame.
  const glow = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const glowShadow = useTransform(
    glow,
    [0, 1],
    ['0 0 0px rgba(245,158,11,0)', '0 0 100px rgba(245,158,11,0.28)'],
  );

  return (
    <section
      ref={sectionRef}
      className="relative py-[20vh] px-[clamp(1.5rem,4vw,3rem)]"
    >
      <div className="mx-auto max-w-[1400px]">
        {/* Eyebrow */}
        <div className="mb-8 flex items-center gap-3">
          <span className="h-px w-8 bg-amber-400/60" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/80">
            Section 05 · what happened
          </span>
        </div>

        {/* Headline */}
        <h2 className="font-serif text-[#F5E8D4] text-[clamp(2.5rem,6vw,5.5rem)] font-normal leading-[0.95] tracking-[-0.01em] max-w-[22ch]">
          It&rsquo;s free now.
          <br />
          Here&rsquo;s{' '}
          <span className="italic text-amber-400">why it failed.</span>
        </h2>

        <p className="mt-8 max-w-[62ch] text-lg leading-relaxed text-[#F5E8D4]/70">
          Burnd was sold for $89. It earned nothing. Rather than quietly leave a
          paywall on a product nobody bought, I removed it, made all 10 detectors
          free, and wrote up the numbers honestly &mdash; including the ones that
          don&rsquo;t flatter me.
        </p>

        {/* The three numbers */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {WHAT_HAPPENED.map((item, i) => (
            <motion.div
              key={item.label}
              className="rounded-2xl border border-[#F5E8D4]/10 bg-[#0d0d15] p-8"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="font-mono text-5xl font-bold tabular-nums text-amber-400">
                {item.stat}
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/45">
                {item.label}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[#F5E8D4]/65">
                {item.detail}
              </p>
            </motion.div>
          ))}
        </div>

        {/* The lesson */}
        <motion.div
          className="relative mt-10 rounded-2xl border-2 border-amber-400/35 bg-[#0d0d15] p-10"
          style={{ boxShadow: glowShadow }}
        >
          <div className="absolute -top-3 left-6 rounded-full bg-amber-400 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-[#09090f]">
            The lesson
          </div>

          <p className="font-serif text-[clamp(1.5rem,3vw,2.5rem)] italic leading-[1.25] text-amber-100">
            Any tool that is a thin read-layer over a vendor&rsquo;s own artifacts
            will be absorbed by that vendor.
          </p>

          <p className="mt-6 max-w-[70ch] text-base leading-relaxed text-[#F5E8D4]/60">
            The <span className="font-mono text-[#F5E8D4]/80">.jsonl</span> files
            burnd parses are Anthropic&rsquo;s format, on Anthropic&rsquo;s disk,
            written by Anthropic&rsquo;s client, and on Anthropic&rsquo;s roadmap.
            I didn&rsquo;t lose to a competitor. I lost to the platform I built on
            &mdash; which was predictable in April, and I didn&rsquo;t predict it.
          </p>

          <a
            href="https://github.com/garvitsurana271/burnd/blob/main/POSTMORTEM.md"
            className="mt-10 inline-block rounded-lg bg-amber-500 px-6 py-3 text-center font-mono text-sm font-semibold uppercase tracking-[0.2em] text-[#09090f] transition hover:bg-amber-400"
          >
            Read the full postmortem
          </a>
        </motion.div>

        {/* Still works */}
        <motion.div
          className="mt-10 rounded-xl border border-[#F5E8D4]/10 bg-black/40 p-6"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/40">
            Still maintained enough to work
          </div>
          <p className="mt-3 font-serif text-2xl italic text-[#F5E8D4]/85">
            <span className="font-mono not-italic text-amber-400">npx getburnd</span>{' '}
            &mdash; free, local, no account.
          </p>
          <div className="mt-4 h-px w-full bg-[#F5E8D4]/10" />
          <div className="mt-4 font-mono text-[11px] leading-relaxed text-[#F5E8D4]/40">
            All 10 detectors · burnd fix · burnd report · burnd digest · burnd export ·
            burnd commits · burnd cap · nothing leaves your machine
          </div>
        </motion.div>

        {/* Section footer hairline */}
        <div className="mt-16 h-px w-full bg-gradient-to-r from-amber-400/60 via-[#F5E8D4]/15 to-transparent" />
      </div>
    </section>
  );
}
