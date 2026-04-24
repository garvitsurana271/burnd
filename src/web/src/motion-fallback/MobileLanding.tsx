// src/web/src/motion-fallback/MobileLanding.tsx
// 2D parallel narrative — 6 sections mirroring the desktop 3D acts.
// No WebGL. No Lenis. Motion-library lightweight fade/slide only.
// Reduced-motion users get the full story without scroll-linked transforms.

import { useState } from 'react';
import { motion } from 'motion/react';
import { BurningFuse } from '../components/BurningFuse.js';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Detector {
  id: string;
  name: string;
  what: string;
  cost: string;
  fix: string;
}

interface Seg {
  t: string;
  cls: string;
}

// ─── Data (mirrors Act3Embers + Act2Terminal exactly) ─────────────────────────

const DETECTORS: Detector[] = [
  { id: 'retry',      name: 'RETRY STORM',        what: 'Same prompt retried 3+ times',       cost: '~$180 per incident', fix: 'Flags first retry, suggests prompt change' },
  { id: 'substitute', name: 'MODEL SUBSTITUTION',  what: 'Opus on work Sonnet handles',        cost: '5x cost, same output', fix: 'Swaps to Sonnet for matched patterns' },
  { id: 'reads',      name: 'REPEATED READS',      what: 'Same file read 20+ times',           cost: '~$95/session', fix: 'Suggests caching + file-anchor pins' },
  { id: 'tool',       name: 'TOOL OVERUSE',        what: 'One tool 80%+ of calls',             cost: 'Token bloat', fix: 'Flags imbalance, proposes tool-shift' },
  { id: 'focus',      name: 'FOCUS-WINDOW',        what: 'Spend outside focus hours',          cost: '~30% more per $1', fix: 'Surfaces off-hours, CLAUDE.md patch' },
  { id: 'thrash',     name: 'THRASH',              what: 'High agent error rate',              cost: 'Compounds retries', fix: 'Rolls back to working state' },
  { id: 'outlier',    name: 'PROJECT OUTLIER',     what: 'One project 5x median cost',         cost: '~$340/mo blind spot', fix: 'Diff vs baseline' },
  { id: 'skill',      name: 'SKILL FIRING',        what: 'Anomalous skill trigger rate',       cost: 'Variable', fix: 'Suggests skill-scoping' },
];

const HEADER_LINES: Array<{ text: string; cls: string }> = [
  { text: '$ npx getburnd',                                              cls: 'text-amber-400' },
  { text: 'Scanning ~/.claude/projects/*.jsonl ...',                     cls: 'text-[#F5E8D4]/55' },
  { text: 'Found 47 sessions, 2.1M tokens, $2,140 spent last 30 days.', cls: 'text-[#F5E8D4]/80' },
];

const LEAK_LINES: Seg[][] = [
  [
    { t: '1. ',                          cls: 'text-[#F5E8D4]/55' },
    { t: '[RETRY_STORM]',                cls: 'font-bold text-indigo-400' },
    { t: ' session 2026-04-15-opus-2 · ', cls: 'text-[#F5E8D4]/55' },
    { t: '$180',                         cls: 'font-bold text-amber-400' },
    { t: ' wasted on retries',           cls: 'text-[#F5E8D4]/55' },
  ],
  [
    { t: '2. ',                cls: 'text-[#F5E8D4]/55' },
    { t: '[REPEATED_READ]',    cls: 'font-bold text-indigo-400' },
    { t: ' ',                  cls: '' },
    { t: 'src/api/handlers.ts', cls: 'font-mono text-[#F5E8D4]/45' },
    { t: ' read ',             cls: 'text-[#F5E8D4]/55' },
    { t: '41x',                cls: 'font-bold text-[#F5E8D4]' },
    { t: ' in one session · ', cls: 'text-[#F5E8D4]/55' },
    { t: '$95',                cls: 'font-bold text-amber-400' },
    { t: ' wasted',            cls: 'text-[#F5E8D4]/55' },
  ],
  [
    { t: '3. ',                             cls: 'text-[#F5E8D4]/55' },
    { t: '[MODEL_SUBSTITUTION]',            cls: 'font-bold text-indigo-400' },
    { t: ' Opus on routine work, Sonnet handles for ', cls: 'text-[#F5E8D4]/55' },
    { t: '5x',                             cls: 'font-bold text-[#F5E8D4]' },
    { t: ' less · ',                       cls: 'text-[#F5E8D4]/55' },
    { t: '$340/mo',                        cls: 'font-bold text-amber-400' },
    { t: ' savings',                       cls: 'text-[#F5E8D4]/55' },
  ],
];

const MONTHLY_FEATURES = [
  'All 8 detectors',
  'Auto-fix CLAUDE.md patches',
  'Weekly email digest',
  'CSV export',
];

const LIFETIME_FEATURES = [
  'Everything in Monthly',
  'One-time payment, no renewals',
  'Pays back in under 3 weeks at $2,140/mo saved',
];

const bars = [60, 78, 45, 92, 68, 88, 72, 95];

// ─── Shared animation preset ──────────────────────────────────────────────────

const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
} as const;

// ─── Eyebrow helper ───────────────────────────────────────────────────────────

function Eyebrow({ children }: { children: string }): JSX.Element {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="h-px w-8 bg-amber-400/60" />
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/80">
        {children}
      </span>
    </div>
  );
}

// ─── Section 1 — Hero (Act 1) ─────────────────────────────────────────────────

function Section1Hero(): JSX.Element {
  const [copied, setCopied] = useState(false);

  function handleCopy(): void {
    navigator.clipboard.writeText('npx getburnd').catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="px-5 py-16">
      <motion.div {...FADE_UP} transition={{ duration: 0.55 }}>
        <Eyebrow>Incident report · 0001</Eyebrow>

        <div className="mb-4 flex items-center gap-3">
          <span className="h-px w-8 bg-amber-400/60" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/80">
            Filed 2026-03-31
          </span>
        </div>

        <h1 className="font-serif text-[#F5E8D4] text-[clamp(2.5rem,10vw,4.5rem)] font-normal leading-[0.95] tracking-[-0.02em]">
          <span className="italic text-[#F5E8D4]/95">Your </span>
          Claude Code{' '}
          <span className="italic text-[#F5E8D4]/95">bill </span>
          <br />
          is bigger{' '}
          <span className="italic text-amber-400">than you think.</span>
        </h1>

        <p className="mt-5 text-[15px] leading-relaxed text-[#F5E8D4]/65 max-w-[44ch]">
          Free local CLI that reads your{' '}
          <span className="font-mono text-amber-400/90">.claude/projects/*.jsonl</span>{' '}
          files and finds the leaks.
        </p>
      </motion.div>

      <motion.div {...FADE_UP} transition={{ duration: 0.55, delay: 0.12 }} className="my-10">
        <MobileFlameSvg />
      </motion.div>

      <motion.div {...FADE_UP} transition={{ duration: 0.55, delay: 0.18 }}>
        {/* Big cost number */}
        <div className="text-center font-mono text-[clamp(3.5rem,16vw,6rem)] font-bold tabular-nums text-amber-400 leading-none">
          $14,502
        </div>
        <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/35">
          One developer · one month · Claude Code API
        </p>

        {/* Copy button */}
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleCopy}
            className="group inline-flex items-center gap-3 rounded-full border border-amber-400/40 bg-white/[0.04] px-7 py-3 font-mono text-sm text-amber-300 backdrop-blur-md transition-all hover:border-amber-300 hover:bg-amber-400/10 hover:text-amber-200"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            npx getburnd
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/40 transition-colors group-hover:text-[#F5E8D4]/70">
              {copied ? 'copied!' : 'copy'}
            </span>
          </button>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Section 2 — Terminal readout (Act 2) ────────────────────────────────────

function Section2Terminal(): JSX.Element {
  return (
    <section className="px-5 py-16">
      <motion.div {...FADE_UP} transition={{ duration: 0.55 }}>
        <Eyebrow>Section 02 · the readout</Eyebrow>
      </motion.div>

      <motion.div
        {...FADE_UP}
        transition={{ duration: 0.6, delay: 0.08 }}
        className="rounded-2xl border border-[#F5E8D4]/10 bg-black/70 p-6 shadow-[0_40px_120px_rgba(245,158,11,0.08)]"
      >
        {/* Terminal chrome */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/35">
            burnd · /scan
          </span>
        </div>

        <div className="mb-5 h-px w-full bg-gradient-to-r from-amber-400/60 via-[#F5E8D4]/15 to-transparent" />

        {/* Lines */}
        <div className="space-y-2 font-mono text-sm leading-relaxed">
          {HEADER_LINES.map((line, i) => (
            <div key={i} className={line.cls}>{line.text}</div>
          ))}

          <div className="h-3" />

          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#F5E8D4]/40">
            TOP 3 LEAKS (free tier):
          </div>

          {/* All leak lines visible at once on mobile — no scroll-gating */}
          {LEAK_LINES.map((segments, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.12 }}
              className="flex flex-wrap items-baseline gap-0"
            >
              {segments.map((seg, j) => (
                <span key={j} className={seg.cls}>{seg.t}</span>
              ))}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div {...FADE_UP} transition={{ duration: 0.5, delay: 0.2 }} className="mt-6">
        <div className="h-px w-full bg-gradient-to-r from-amber-400/60 via-[#F5E8D4]/15 to-transparent" />
        <p className="mt-5 text-sm text-[#F5E8D4]/55 leading-relaxed">
          A free CLI reads the files Claude Code already writes, and surfaces where the money goes.
        </p>
      </motion.div>
    </section>
  );
}

// ─── Section 3 — Detectors grid (Act 3) ──────────────────────────────────────

function Section3Detectors(): JSX.Element {
  return (
    <section className="px-5 py-16">
      <motion.div {...FADE_UP} transition={{ duration: 0.55 }}>
        <Eyebrow>Section 03 · the detectors</Eyebrow>

        <h2 className="font-serif text-[#F5E8D4] text-[clamp(2rem,8vw,3.5rem)] font-normal leading-[0.95] tracking-[-0.01em]">
          Eight ways <span className="italic">your bill</span> leaks.
          <br />
          <span className="italic text-amber-400">One detector each.</span>
        </h2>
      </motion.div>

      <div className="mt-10 grid grid-cols-1 gap-4">
        {DETECTORS.map((d, i) => (
          <motion.article
            key={d.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: i * 0.05 }}
            className="rounded-xl border border-[#F5E8D4]/10 bg-black/60 p-5"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400/60" />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-indigo-400">
                {d.name}
              </span>
            </div>
            <div className="font-serif text-lg text-[#F5E8D4] leading-tight">{d.what}</div>
            <div className="mt-2 font-mono text-sm text-amber-400 tabular-nums">{d.cost}</div>
            <div className="mt-1 text-xs text-[#F5E8D4]/55">{d.fix}</div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

// ─── Section 4 — Dashboard mock (Act 4) ──────────────────────────────────────

function Section4Dashboard(): JSX.Element {
  return (
    <section className="px-5 py-16">
      <motion.div {...FADE_UP} transition={{ duration: 0.55 }}>
        <Eyebrow>Section 04 · the dashboard</Eyebrow>

        <h2 className="font-serif text-[#F5E8D4] text-[clamp(2rem,8vw,3.5rem)] font-normal leading-[0.95] tracking-[-0.01em]">
          Watch the leaks close{' '}
          <span className="italic text-amber-400">in real time.</span>
        </h2>
      </motion.div>

      <motion.div
        {...FADE_UP}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-10 overflow-hidden rounded-2xl border border-[#F5E8D4]/10 bg-black/80 shadow-[0_40px_120px_rgba(99,102,241,0.12)]"
      >
        {/* Chrome bar */}
        <div className="flex items-center gap-2 border-b border-[#F5E8D4]/10 px-5 py-3">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
          <span className="ml-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[#F5E8D4]/35">
            burnd · /insights
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 border-b border-[#F5E8D4]/10 px-5 py-6">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#F5E8D4]/40 mb-1">Saved</div>
            <div className="font-mono text-2xl font-bold tabular-nums text-amber-400">$2,140</div>
          </div>
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#F5E8D4]/40 mb-1">Storms</div>
            <div className="font-mono text-2xl font-bold tabular-nums text-indigo-400">7</div>
          </div>
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#F5E8D4]/40 mb-1">Subs</div>
            <div className="font-mono text-2xl font-bold tabular-nums text-[#F5E8D4]">12</div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="p-5">
          <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.18em] text-[#F5E8D4]/35">
            Daily spend · last 8 sessions
          </div>
          <div className="flex h-32 items-end gap-1.5">
            {bars.map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-amber-500/80 via-amber-400/50 to-indigo-500/60"
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div {...FADE_UP} transition={{ duration: 0.5, delay: 0.2 }} className="mt-6">
        <div className="h-px w-full bg-gradient-to-r from-amber-400/60 via-[#F5E8D4]/15 to-transparent" />
        <p className="mt-5 text-sm leading-relaxed text-[#F5E8D4]/55">
          Numbers update live as{' '}
          <span className="font-mono text-amber-400/90">burnd fix</span>{' '}
          applies patches. Close the leak, watch the counter move.
        </p>
      </motion.div>
    </section>
  );
}

// ─── Section 5 — Pricing (Act 5) ─────────────────────────────────────────────

function Section5Pricing(): JSX.Element {
  return (
    <section className="px-5 py-16">
      <motion.div {...FADE_UP} transition={{ duration: 0.55 }}>
        <Eyebrow>Section 05 · pricing</Eyebrow>

        <h2 className="font-serif text-[#F5E8D4] text-[clamp(2rem,8vw,3.5rem)] font-normal leading-[0.95] tracking-[-0.01em]">
          Pay $89 <span className="italic">once.</span>
          <br />
          Save $2,140{' '}
          <span className="italic text-amber-400">every month.</span>
        </h2>
      </motion.div>

      <motion.div {...FADE_UP} transition={{ duration: 0.5, delay: 0.1 }} className="mt-8">
        <BurningFuse />
      </motion.div>

      {/* Pricing cards — stacked on mobile */}
      <div className="mt-10 flex flex-col gap-5">
        {/* Monthly */}
        <motion.div
          {...FADE_UP}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="rounded-2xl border border-[#F5E8D4]/10 bg-black/60 p-7"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/40">
            Pro Monthly
          </div>
          <div className="mt-3 font-mono text-4xl font-bold tabular-nums text-[#F5E8D4]">
            $8.99
            <span className="text-lg text-[#F5E8D4]/40">/mo</span>
          </div>
          <ul className="mt-6 space-y-3">
            {MONTHLY_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-[#F5E8D4]/75">
                <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#F5E8D4]/30" />
                {f}
              </li>
            ))}
          </ul>
          <a
            href="https://dodopayments.com/checkout/PLACEHOLDER_MONTHLY"
            className="mt-8 block rounded-lg border border-[#F5E8D4]/15 bg-white/[0.03] px-6 py-3 text-center font-mono text-sm uppercase tracking-[0.2em] text-[#F5E8D4]/85 transition hover:border-[#F5E8D4]/30 hover:text-[#F5E8D4]"
          >
            Start monthly
          </a>
        </motion.div>

        {/* Lifetime */}
        <motion.div
          {...FADE_UP}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative rounded-2xl border-2 border-amber-400/40 bg-black/80 p-7 shadow-[0_0_60px_rgba(245,158,11,0.18)]"
        >
          <div className="absolute -top-3 left-5 rounded-full bg-amber-400 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-[#09090f]">
            Lifetime · best value
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/70">
            Pro Lifetime
          </div>
          <div className="mt-3 font-mono text-4xl font-bold tabular-nums text-amber-400">
            $89
            <span className="text-lg text-amber-400/55"> until May 18</span>
          </div>
          <div className="mt-1 font-mono text-sm text-[#F5E8D4]/40">$129 after</div>
          <ul className="mt-6 space-y-3">
            {LIFETIME_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-[#F5E8D4]/85">
                <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />
                {f}
              </li>
            ))}
          </ul>
          <a
            href="https://dodopayments.com/checkout/PLACEHOLDER_LIFETIME"
            className="mt-8 block rounded-lg bg-amber-500 px-6 py-3 text-center font-mono text-sm font-semibold uppercase tracking-[0.2em] text-[#09090f] transition hover:bg-amber-400"
          >
            Buy lifetime · $89
          </a>
        </motion.div>
      </div>

      {/* Free vs Pro split */}
      <div className="mt-12 flex flex-col gap-5">
        <motion.div
          {...FADE_UP}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-xl border border-[#F5E8D4]/10 bg-black/40 p-6"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/40">
            Free
          </div>
          <p className="mt-3 font-serif text-xl italic text-[#F5E8D4]/85">
            Top 3 leaks per scan. Once.
          </p>
          <div className="mt-4 h-px w-full bg-[#F5E8D4]/10" />
          <div className="mt-4 font-mono text-[11px] leading-relaxed text-[#F5E8D4]/35">
            NOT included: burnd fix · burnd digest · burnd report · burnd export · burnd commits
          </div>
        </motion.div>

        <motion.div
          {...FADE_UP}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="rounded-xl border border-amber-400/30 bg-black/60 p-6"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/70">
            Pro
          </div>
          <p className="mt-3 font-serif text-xl italic text-amber-200">
            All leaks. All fixes. Forever.
          </p>
          <div className="mt-4 h-px w-full bg-amber-400/15" />
          <div className="mt-4 font-mono text-[11px] leading-relaxed text-amber-200/60">
            Every command · auto-apply patches · weekly digest · CSV export · cost-per-commit
          </div>
        </motion.div>
      </div>

      <div className="mt-14 h-px w-full bg-gradient-to-r from-amber-400/60 via-[#F5E8D4]/15 to-transparent" />
    </section>
  );
}

// ─── Section 6 — Ignition (Act 6) ────────────────────────────────────────────

function Section6Ignition(): JSX.Element {
  const [copied, setCopied] = useState(false);

  function handleCopy(): void {
    navigator.clipboard.writeText('npx getburnd').catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="flex flex-col items-center px-5 py-20 text-center">
      <motion.div {...FADE_UP} transition={{ duration: 0.55 }}>
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-amber-400/60" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/80">
            Section 06 · ignition
          </span>
        </div>

        {/* Static solid-amber BURND — no scroll-driven sweep on fallback */}
        <h1
          className="font-mono font-black leading-none tracking-[-0.04em] text-amber-400"
          style={{ fontSize: 'clamp(4rem,22vw,9rem)' }}
        >
          BURND
        </h1>
      </motion.div>

      <motion.div {...FADE_UP} transition={{ duration: 0.55, delay: 0.12 }}>
        <p className="mx-auto mt-10 max-w-[40ch] font-serif text-[clamp(1.1rem,4vw,1.4rem)] italic leading-snug text-[#F5E8D4]/75">
          Stop wondering where the money went.
          <br />
          See it. Fix it. Keep the savings.
        </p>
      </motion.div>

      <motion.div {...FADE_UP} transition={{ duration: 0.55, delay: 0.2 }} className="mt-10">
        <button
          type="button"
          onClick={handleCopy}
          className="group inline-flex items-center gap-3 rounded-full border border-amber-400/40 bg-white/[0.04] px-7 py-3 font-mono text-sm text-amber-300 backdrop-blur-md transition-all hover:border-amber-300 hover:bg-amber-400/10 hover:text-amber-200"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          npx getburnd
          <span className="text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/40 transition-colors group-hover:text-[#F5E8D4]/70">
            {copied ? 'copied!' : 'copy'}
          </span>
        </button>
      </motion.div>

      <motion.div
        {...FADE_UP}
        transition={{ duration: 0.5, delay: 0.28 }}
        className="mt-14 flex flex-wrap items-center justify-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[#F5E8D4]/40"
      >
        <a href="https://github.com/garvitsurana/burnd" className="transition hover:text-[#F5E8D4]/80">GitHub</a>
        <span className="text-[#F5E8D4]/20">·</span>
        <a href="/proof" className="transition hover:text-[#F5E8D4]/80">Real invoice</a>
        <span className="text-[#F5E8D4]/20">·</span>
        <a href="/why-claude-code-is-expensive.html" className="transition hover:text-[#F5E8D4]/80">Why it&apos;s expensive</a>
        <span className="text-[#F5E8D4]/20">·</span>
        <a href="/calculator" className="transition hover:text-[#F5E8D4]/80">Calculator</a>
      </motion.div>
    </section>
  );
}

// ─── SVG Flame (pure CSS animation, no JS) ───────────────────────────────────

function MobileFlameSvg(): JSX.Element {
  return (
    <svg viewBox="0 0 200 320" className="mx-auto h-56 w-full max-w-[240px] opacity-80">
      <defs>
        <linearGradient id="mobFlame" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="60%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <g style={{ animation: 'mflame 2.6s ease-in-out infinite' }}>
        <path
          d="M100 300 Q55 235 75 170 Q100 110 95 40 Q115 90 135 140 Q170 210 100 300 Z"
          fill="url(#mobFlame)"
          opacity="0.9"
        />
        <path
          d="M100 280 Q75 240 85 200 Q95 160 92 120 Q105 150 120 180 Q140 230 100 280 Z"
          fill="#fbbf24"
          opacity="0.6"
        />
      </g>
      <style>
        {`@keyframes mflame {
          0%, 100% { transform: scale(1, 1) translateY(0); }
          50%      { transform: scale(1.05, 0.97) translateY(-4px); }
        }`}
      </style>
    </svg>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function MobileLanding(): JSX.Element {
  return (
    <div className="bg-[#09090f] text-[#F5E8D4] font-sans antialiased">
      {/* Hairline section divider utility */}
      <Section1Hero />
      <div className="mx-5 h-px bg-gradient-to-r from-amber-400/30 via-[#F5E8D4]/10 to-transparent" />
      <Section2Terminal />
      <div className="mx-5 h-px bg-gradient-to-r from-amber-400/30 via-[#F5E8D4]/10 to-transparent" />
      <Section3Detectors />
      <div className="mx-5 h-px bg-gradient-to-r from-amber-400/30 via-[#F5E8D4]/10 to-transparent" />
      <Section4Dashboard />
      <div className="mx-5 h-px bg-gradient-to-r from-amber-400/30 via-[#F5E8D4]/10 to-transparent" />
      <Section5Pricing />
      <div className="mx-5 h-px bg-gradient-to-r from-amber-400/30 via-[#F5E8D4]/10 to-transparent" />
      <Section6Ignition />
    </div>
  );
}
