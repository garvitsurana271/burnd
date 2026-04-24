import { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Copy, Check, Twitter } from 'lucide-react';

interface SharePayload {
  v: 1;
  t: number;   // all-time spend USD
  w: number;   // last-7-days spend USD
  s: number;   // total savings USD
  n: number;   // sessions scanned
  l: Array<{ title: string; save: number }>;
  g: string;   // generated date YYYY-MM-DD
}

function decodeHash(hash: string): SharePayload | null {
  try {
    const raw = hash.startsWith('#') ? hash.slice(1) : hash;
    if (!raw) return null;
    const json = atob(raw.replace(/-/g, '+').replace(/_/g, '/'));
    const data = JSON.parse(json) as SharePayload;
    if (data.v !== 1) return null;
    return data;
  } catch {
    return null;
  }
}

function fmt(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function CopyButton({ text }: { text: string }): JSX.Element {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1.5 rounded-full border border-[#F5E8D4]/15 bg-white/[0.03] px-3 py-1.5 font-mono text-[11px] text-[#F5E8D4]/55 transition hover:border-[#F5E8D4]/30 hover:text-[#F5E8D4]"
    >
      {copied ? <Check className="h-3 w-3 text-amber-400" /> : <Copy className="h-3 w-3" />}
      {copied ? 'copied!' : 'copy link'}
    </button>
  );
}

export function SharePage(): JSX.Element {
  const [data, setData] = useState<SharePayload | null>(null);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    const result = decodeHash(window.location.hash);
    if (result) {
      setData(result);
    } else {
      setInvalid(true);
    }
  }, []);

  if (invalid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090f] px-6">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-400" />
          <p className="mt-4 font-mono text-[#F5E8D4]/50">Invalid or expired share link.</p>
          <a href="/" className="mt-4 inline-block font-mono text-sm text-amber-400 hover:text-amber-300 transition">
            Go to getburnd.vercel.app &rarr;
          </a>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090f]">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  const savingsRoi = data.s > 0 && data.t > 0 ? Math.round((data.s / data.t) * 100) : 0;
  const monthlyBurn = data.s * 4.33;
  const shareUrl = window.location.href;
  const topLeak = data.l[0]?.title ?? 'repeated file reads';

  const tweetText = `Just ran npx getburnd on my Claude Code sessions — found ${fmt(data.s)} in fixable waste.\n\nTop leak: ${topLeak}\n\ngetburnd.vercel.app`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  return (
    <div className="min-h-screen bg-[#09090f] text-[#F5E8D4] font-sans antialiased px-[clamp(1.5rem,4vw,3rem)] py-[15vh]">
      <div className="mx-auto max-w-2xl">
        {/* Eyebrow */}
        <div className="mb-8 flex items-center gap-3">
          <span className="h-px w-8 bg-amber-400/60" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/80">
            Exhibit &middot; your leak receipt
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-[#F5E8D4] text-[clamp(2.5rem,6vw,4.5rem)] font-normal leading-[0.95] tracking-[-0.02em]">
          Your leak <span className="italic text-amber-400">receipt.</span>
        </h1>

        {/* Monthly burn framing */}
        {monthlyBurn > 0 && (
          <div className="mt-8 rounded-xl border border-amber-400/20 bg-amber-400/5 px-5 py-4">
            <p className="font-mono text-[13px] text-[#F5E8D4]/65">
              That&apos;s{' '}
              <span className="font-bold text-amber-400 tabular-nums">${monthlyBurn.toFixed(0)}/month</span>
              {' '}in preventable Claude waste, on repeat, every month.
            </p>
          </div>
        )}

        {/* Main receipt card */}
        <motion.div
          className="mt-14"
          whileHover={{ rotateY: 3 }}
          style={{ transformStyle: 'preserve-3d', perspective: '1400px' }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        >
          <div className="rounded-2xl border border-amber-400/25 bg-black/80 p-8 shadow-[0_60px_160px_rgba(245,158,11,0.1)]">
            {/* Card header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/70">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Claude Code spend &middot; burnd
              </div>
              <div className="font-mono text-[10px] text-[#F5E8D4]/30">{data.g}</div>
            </div>

            {/* Main numbers */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="col-span-2 rounded-xl border border-amber-400/20 bg-amber-400/5 p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/60">All-time spend</div>
                <div className="mt-1.5 font-mono text-4xl font-bold tabular-nums text-amber-400 md:text-5xl">
                  {fmt(data.t)}
                </div>
                <div className="mt-1 font-mono text-[11px] text-amber-400/45">{data.n} sessions scanned</div>
              </div>

              <div className="rounded-xl border border-[#F5E8D4]/10 bg-[#09090f]/60 p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/35">Last 7 days</div>
                <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-[#F5E8D4]">{fmt(data.w)}</div>
              </div>

              <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-red-400/60">Fixable waste</div>
                <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-red-400">{fmt(data.s)}</div>
                {savingsRoi > 0 && (
                  <div className="mt-1 font-mono text-[10px] text-red-400/45">{savingsRoi}% of spend</div>
                )}
              </div>
            </div>

            {/* Top leaks */}
            {data.l.length > 0 && (
              <div className="mt-6">
                <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#F5E8D4]/35">Top cost leaks</div>
                <div className="flex flex-col gap-2">
                  {data.l.map((leak, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-[#F5E8D4]/8 bg-[#09090f]/60 px-4 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-[#F5E8D4]/30">{i + 1}.</span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-indigo-400">
                          {leak.title}
                        </span>
                      </div>
                      <span className="font-mono text-sm font-bold tabular-nums text-amber-400">
                        {fmt(leak.save)} wasted
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card footer */}
            <div className="mt-6 border-t border-[#F5E8D4]/8 pt-5 text-center">
              <p className="font-mono text-[11px] text-[#F5E8D4]/30">
                Generated by{' '}
                <span className="text-amber-400">npx getburnd</span>
                {' · '}reads local files only, nothing uploaded
              </p>
            </div>
          </div>
        </motion.div>

        {/* Share strip */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-[#F5E8D4]/8 bg-[#09090f]/40 px-4 py-3">
          <span className="truncate font-mono text-[11px] text-[#F5E8D4]/30">{shareUrl}</span>
          <div className="ml-3 flex flex-shrink-0 items-center gap-2">
            <CopyButton text={shareUrl} />
            <a
              href={twitterUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-400/8 px-3 py-1.5 font-mono text-[11px] text-indigo-400 transition hover:bg-indigo-400/15"
            >
              <Twitter className="h-3 w-3" />
              tweet
            </a>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 flex items-center justify-center">
          <a
            href="/"
            className="inline-flex items-center gap-3 rounded-full border border-[#F5E8D4]/15 bg-white/[0.03] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[#F5E8D4]/80 transition hover:border-[#F5E8D4]/30 hover:text-[#F5E8D4]"
          >
            <span className="h-1 w-1 rounded-full bg-amber-400/60" />
            Run your own scan &middot; npx getburnd
          </a>
        </div>
      </div>
    </div>
  );
}
