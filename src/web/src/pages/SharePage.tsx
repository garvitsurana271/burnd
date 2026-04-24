import { useEffect, useState, useCallback } from 'react';
import { Flame, Terminal, ArrowRight, AlertTriangle, Copy, Check, Twitter } from 'lucide-react';

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
      className="flex items-center gap-1.5 rounded-md border border-axis-border bg-axis-surface/60 px-3 py-1.5 font-mono text-[11px] text-axis-textDim transition-all hover:border-axis-accent/40 hover:text-axis-accent"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
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
      <div className="flex min-h-screen items-center justify-center bg-axis-bg px-6">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
          <p className="mt-4 font-mono text-axis-textMuted">Invalid or expired share link.</p>
          <a href="/" className="mt-4 inline-block font-mono text-sm text-axis-accent hover:underline">
            Go to getburnd.vercel.app →
          </a>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-axis-bg">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-axis-accent border-t-transparent" />
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
    <div className="noise-overlay min-h-screen bg-axis-bg text-axis-text">
      {/* Header */}
      <header className="border-b border-axis-border/50 bg-axis-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-6 py-3">
          <a href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Flame className="h-5 w-5 text-amber-500" />
            <span className="font-mono text-sm font-bold tracking-tight">burnd</span>
          </a>
          <span className="ml-2 font-mono text-[11px] text-axis-textDim">/ shared report</span>
          <div className="ml-auto flex items-center gap-2">
            <CopyButton text={shareUrl} />
            <a
              href={twitterUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-axis-accent/30 bg-axis-accent/8 px-3 py-1.5 font-mono text-[11px] text-axis-accent transition-all hover:bg-axis-accent/15"
            >
              <Twitter className="h-3 w-3" />
              tweet this
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        {/* Loss framing — the hook */}
        {monthlyBurn > 0 && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-center">
            <p className="font-mono text-[13px] text-axis-textDim">
              That's{' '}
              <span className="font-bold text-red-400">${monthlyBurn.toFixed(0)}/month</span>
              {' '}in preventable Claude waste — on repeat, every month.
            </p>
          </div>
        )}

        {/* Card — this is what gets screenshotted */}
        <div
          className="relative overflow-hidden rounded-2xl border"
          style={{
            background: 'linear-gradient(135deg, #0c0c1a 0%, #111118 50%, #0e0e1f 100%)',
            borderColor: 'rgba(99,102,241,0.3)',
            boxShadow: '0 0 60px rgba(99,102,241,0.12), 0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Scanline */}
          <div
            className="pro-scanline pointer-events-none absolute left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6) 50%, transparent)' }}
          />
          {/* Grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative p-8 md:p-10">
            {/* Label */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-axis-accent/70">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                Claude Code spend report · burnd
              </div>
              <div className="font-mono text-[10px] text-axis-textDim">{data.g}</div>
            </div>

            {/* Main numbers row */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="col-span-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                <div className="font-mono text-[10px] uppercase tracking-wider text-amber-500/60">All-time spend</div>
                <div className="mt-1.5 font-mono text-4xl font-bold tracking-tight text-amber-400 md:text-5xl">
                  {fmt(data.t)}
                </div>
                <div className="mt-1 font-mono text-[11px] text-amber-500/50">{data.n} sessions scanned</div>
              </div>

              <div className="rounded-xl border border-axis-border bg-axis-surface/60 p-5">
                <div className="font-mono text-[10px] uppercase tracking-wider text-axis-textDim">Last 7 days</div>
                <div className="mt-1.5 font-mono text-2xl font-bold text-axis-text">{fmt(data.w)}</div>
              </div>

              <div className="rounded-xl border border-red-500/25 bg-red-500/5 p-5">
                <div className="font-mono text-[10px] uppercase tracking-wider text-red-400/60">Fixable waste</div>
                <div className="mt-1.5 font-mono text-2xl font-bold text-red-400">{fmt(data.s)}</div>
                {savingsRoi > 0 && (
                  <div className="mt-1 font-mono text-[10px] text-red-500/50">{savingsRoi}% of spend</div>
                )}
              </div>
            </div>

            {/* Top leaks */}
            {data.l.length > 0 && (
              <div className="mt-6">
                <div className="mb-3 font-mono text-[10px] uppercase tracking-wider text-axis-textDim">Top cost leaks</div>
                <div className="flex flex-col gap-2">
                  {data.l.map((leak, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg px-4 py-2.5"
                      style={{ background: 'rgba(9,9,15,0.6)', border: '1px solid rgba(99,102,241,0.1)' }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] text-axis-textDim">{i + 1}.</span>
                        <span className="font-mono text-[12px] text-axis-text">{leak.title}</span>
                      </div>
                      <span className="font-mono text-[12px] font-semibold text-red-400">
                        {fmt(leak.save)} wasted
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 border-t border-axis-border/40 pt-5 text-center">
              <p className="font-mono text-[11px] text-axis-textDim">
                Generated by{' '}
                <span className="text-axis-accent">npx getburnd</span>
                {' · '}reads local files only, nothing uploaded
              </p>
            </div>
          </div>
        </div>

        {/* Share strip */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-axis-border bg-axis-surface/30 px-4 py-3">
          <span className="truncate font-mono text-[11px] text-axis-textDim">{shareUrl}</span>
          <div className="ml-3 flex flex-shrink-0 items-center gap-2">
            <CopyButton text={shareUrl} />
            <a
              href={twitterUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-axis-accent/30 bg-axis-accent/8 px-3 py-1.5 font-mono text-[11px] text-axis-accent transition-all hover:bg-axis-accent/15"
            >
              <Twitter className="h-3 w-3" />
              tweet
            </a>
          </div>
        </div>

        {/* CTA below the card */}
        <div className="mt-8 flex flex-col items-center gap-4 text-center">
          <p className="font-mono text-sm text-axis-textMuted">
            Find where <em>your</em> Claude Code budget is leaking.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-5 py-3 font-mono text-sm text-axis-text">
              <Terminal className="h-4 w-4 text-amber-500" />
              npx getburnd
            </div>
            <a
              href="/#pricing"
              className="flex items-center gap-2 rounded-md border border-axis-accent/50 bg-axis-accent/10 px-5 py-3 font-mono text-sm text-axis-accent transition-all hover:bg-axis-accent/20"
            >
              Get BurndPro
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <p className="font-mono text-[11px] text-axis-textDim">
            Free · open source · 100% local · no signup
          </p>
        </div>
      </main>
    </div>
  );
}
