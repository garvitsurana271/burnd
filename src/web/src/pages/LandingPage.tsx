import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Terminal,
  Search,
  ShieldCheck,
  Zap,
  TrendingDown,
  Clock,
  AlertTriangle,
  Repeat,
  Sparkles,
  FolderSearch,
  Moon,
  Copy,
  Check,
  Github,
  BookOpen,
  ArrowRight,
  ArrowDown,
  Mail,
} from 'lucide-react';

export function LandingPage(): JSX.Element {
  return (
    <div className="noise-overlay min-h-screen bg-axis-bg text-axis-text">
      <Header />
      <Hero />
      <NumbersStrip />
      <DetectorGrid />
      <HowItWorks />
      <BuyTheEbook />
      <DashboardPreview />
      <PrivacyCallout />
      <PricingCards />
      <TheStory />
      <Footer />
    </div>
  );
}

function useFadeIn(): { ref: undefined; cls: string } {
  return { ref: undefined, cls: '' };
}

// ===========================================================================
// Header — minimal, just the brand + nav
// ===========================================================================

function Header(): JSX.Element {
  return (
    <header className="sticky top-0 z-50 border-b border-axis-border/50 bg-axis-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
        <a href="#" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <Flame className="h-5 w-5 text-amber-500" strokeWidth={2.5} />
          <span className="font-mono text-sm font-bold tracking-tight">burnd</span>
        </a>
        <nav className="ml-auto flex items-center gap-6 font-mono text-[11px] text-axis-textMuted">
          <a href="#detectors" className="hidden transition-colors hover:text-axis-text sm:block">detectors</a>
          <a href="#ebook" className="hidden transition-colors hover:text-axis-text sm:block">ebook</a>
          <a href="#pricing" className="hidden transition-colors hover:text-axis-text sm:block">pricing</a>
          <a href="#story" className="hidden transition-colors hover:text-axis-text sm:block">my story</a>
          <a
            href="https://github.com/garvitsurana271/burnd"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-axis-text"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">github</span>
          </a>
          <Link
            to="/app/insights"
            className="rounded border border-axis-accent/50 bg-axis-accent/10 px-3 py-1.5 text-axis-accent transition-all hover:border-axis-accent hover:bg-axis-accent/20"
          >
            dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}

// ===========================================================================
// Hero — THE personal story. This is what makes people click.
// ===========================================================================

function Hero(): JSX.Element {
  return (
    <section className="relative overflow-hidden border-b border-axis-border">
      <div className="hero-glow pointer-events-none absolute inset-0" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 opacity-20"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.15), transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* LEFT — the story */}
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-axis-accent/40 bg-axis-accent/10 font-mono text-xs font-bold text-axis-accent">
                16
              </div>
              <div className="font-mono text-[11px] leading-tight text-axis-textMuted">
                <span className="text-axis-text">Garvit Surana</span>
                <br />
                Class 12 ISC · Guwahati, India
              </div>
            </div>

            <h1 className="font-serif text-[2.75rem] leading-[1.1] tracking-tight text-axis-text md:text-6xl lg:text-[4rem]">
              I spent{' '}
              <span className="text-gradient-fire">$13,631</span>
              <br />
              on Claude Code.
            </h1>
            <p className="mt-2 font-serif text-2xl italic text-axis-textMuted md:text-3xl">
              Then I built the tool to find where it all went.
            </p>

            <p className="mt-8 max-w-lg text-[15px] leading-relaxed text-axis-textMuted">
              <strong className="text-axis-text">Burnd</strong> reads your local{' '}
              <code className="rounded bg-axis-muted px-1.5 py-0.5 font-mono text-sm text-axis-accent">
                ~/.claude/projects/*.jsonl
              </code>{' '}
              files and finds 8 patterns that waste tokens. Dollar values. Concrete fixes.
              Nothing leaves your machine.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <InstallCommand />
              <Link
                to="/app/insights"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-axis-border px-5 py-3 font-mono text-sm text-axis-textMuted transition-all hover:border-axis-textMuted hover:text-axis-text"
              >
                see the dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-4 font-mono text-[10px] text-axis-textDim">
              <span>free</span>
              <span className="h-3 w-px bg-axis-border" />
              <span>open source (MIT)</span>
              <span className="h-3 w-px bg-axis-border" />
              <span>runs 100% on your machine</span>
            </div>
          </div>

          {/* RIGHT — terminal preview */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-axis-accent/5 to-amber-500/5 blur-2xl" />
            <div className="relative overflow-hidden rounded-xl border border-axis-border bg-axis-surface shadow-2xl shadow-black/40">
              <div className="flex items-center gap-2 border-b border-axis-border bg-axis-bg px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <span className="ml-2 font-mono text-[10px] text-axis-textDim">~</span>
              </div>
              <div className="p-5 font-mono text-[12px] leading-relaxed">
                <div className="text-axis-textDim">$ npx burnd</div>
                <div className="mt-4 text-amber-500 font-bold">
                  {'  '}burnd<span className="text-axis-textDim font-normal"> — find what's burning a hole in your AI coding budget</span>
                </div>
                <div className="mt-1 text-axis-textDim">  ─────────────────────────────────────────────────────────────</div>
                <div className="mt-3">
                  {'  '}Scanned: <span className="text-cyan-400">227</span> session files across <span className="text-cyan-400">227</span> sessions
                </div>
                <div>
                  {'  '}All-time spend: <span className="font-bold text-emerald-400">$13,631.00</span>
                </div>
                <div>
                  {'  '}Last 7 days:{' '}<span className="font-bold text-emerald-400">$843.27</span>
                </div>
                <div>
                  {'  '}Potential savings: <span className="font-bold text-amber-400">$75.92</span>
                </div>
                <div className="mt-4 text-axis-textDim">  Top leaks (sorted by estimated savings):</div>
                <div className="mt-3">
                  {'  '}<span className="font-bold text-amber-400">1</span>. Project "ChangeLife" costs 3.2x more per session
                </div>
                <div>{'     '}<span className="font-bold text-emerald-400">$30.48</span>  <span className="text-axis-textDim">(~15 min to fix)</span></div>
                <div className="mt-2">
                  {'  '}<span className="font-bold text-amber-400">2</span>. Bash accounts for 80% of tool calls
                </div>
                <div>{'     '}<span className="font-bold text-emerald-400">$7.76</span>  <span className="text-axis-textDim">(~8 min to fix)</span></div>
                <div className="mt-2">
                  {'  '}<span className="font-bold text-amber-400">3</span>. Tool error storm — 30% of calls failed
                </div>
                <div>{'     '}<span className="font-bold text-emerald-400">$3.95</span>  <span className="text-axis-textDim">(~10 min to fix)</span></div>
                <div className="mt-3 text-axis-textDim">  ─────────────────────────────────────────────────────────────</div>
                <div className="animate-pulse">{'  '}█</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex justify-center">
          <a href="#detectors" className="group flex flex-col items-center gap-1 text-axis-textDim transition-colors hover:text-axis-textMuted">
            <span className="font-mono text-[10px] uppercase tracking-widest">scroll</span>
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
}

function InstallCommand(): JSX.Element {
  const [copied, setCopied] = useState(false);
  const cmd = 'npx burnd';

  function copy(): void {
    void navigator.clipboard.writeText(cmd).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      onClick={copy}
      className="group inline-flex items-center gap-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-6 py-3 font-mono text-sm text-axis-text transition-all hover:border-amber-500/60 hover:bg-amber-500/15"
    >
      <Terminal className="h-4 w-4 text-amber-500" />
      <span>$ {cmd}</span>
      {copied ? (
        <Check className="h-4 w-4 text-axis-success" />
      ) : (
        <Copy className="h-4 w-4 text-axis-textDim transition-colors group-hover:text-amber-500" />
      )}
    </button>
  );
}

// ===========================================================================
// Numbers strip — raw, oversized numbers
// ===========================================================================

function NumbersStrip(): JSX.Element {
  const fade = useFadeIn();
  return (
    <section
      ref={fade.ref}
      className={`border-b border-axis-border bg-axis-surface/50 ${fade.cls}`}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
        {[
          { val: '$13,631', desc: 'spent on Claude Code', sub: '6 months · 15 projects', color: 'text-amber-400' },
          { val: '227', desc: 'sessions analyzed', sub: 'across all projects', color: 'text-axis-text' },
          { val: '8', desc: 'leak patterns', sub: 'auto-detected', color: 'text-axis-accent' },
          { val: '16', desc: 'years old', sub: 'Class 12 · Guwahati, India', color: 'text-emerald-400' },
        ].map((n, i) => (
          <div key={i} className="border-r border-axis-border/50 px-6 py-10 last:border-r-0 md:py-12">
            <div className={`font-mono text-3xl font-bold tracking-tight md:text-4xl ${n.color}`}>
              {n.val}
            </div>
            <div className="mt-2 text-sm font-medium text-axis-text">{n.desc}</div>
            <div className="mt-0.5 font-mono text-[10px] text-axis-textDim">{n.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ===========================================================================
// Detector Grid — the 8 patterns
// ===========================================================================

const DETECTORS = [
  { icon: Terminal, title: 'Long Bash output', desc: 'Test runners / builds dumping 10k+ bytes into context.', finding: '~$8.40 per session' },
  { icon: Repeat, title: 'Repeated reads', desc: 'Same file read 3+ times — classic context-forgetting.', finding: '32 files, worst: 31x' },
  { icon: AlertTriangle, title: 'Tool error storms', desc: 'Agent retrying failed commands without stopping.', finding: '30-60% error rate' },
  { icon: Zap, title: 'Tool overuse', desc: 'One tool dominating 70%+ of calls (usually Bash).', finding: '80% Bash → $7.76 waste' },
  { icon: Moon, title: 'Late-night coding', desc: 'Sessions 00:00-05:00 cost 2.5x more. Tired prompts thrash.', finding: '23 sessions at 2.5x' },
  { icon: Search, title: 'API retry storms', desc: 'Hidden retries on API errors, billing every partial response.', finding: '11 retries in 90 min' },
  { icon: Sparkles, title: 'Skill firing', desc: 'Skills with broad triggers eating 40%+ of tool calls.', finding: '42% calls = 1 skill' },
  { icon: FolderSearch, title: 'Project outliers', desc: 'One project costing 3x more per session than your median.', finding: '~$30 in top outlier' },
];

function DetectorGrid(): JSX.Element {
  const fade = useFadeIn();
  return (
    <section id="detectors" className="border-b border-axis-border py-24">
      <div
        ref={fade.ref}
        className={`mx-auto max-w-7xl px-6 ${fade.cls}`}
      >
        <div className="mb-4 font-mono text-[11px] uppercase tracking-widest text-amber-500">
          What it finds
        </div>
        <h2 className="max-w-xl font-serif text-4xl tracking-tight text-axis-text md:text-5xl">
          8 patterns that quietly drain your budget
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-axis-textMuted">
          Every detector returns a dollar value. You see how much each leak costs and exactly how to plug it.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DETECTORS.map((d, i) => {
            const Icon = d.icon;
            return (
              <div
                key={d.title}
                className="group relative overflow-hidden rounded-lg border border-axis-border bg-axis-surface/60 p-5 transition-all duration-300 hover:border-axis-accent/40 hover:bg-axis-surface"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-axis-accent/5 transition-all duration-300 group-hover:scale-150 group-hover:bg-axis-accent/10" />
                <Icon className="mb-3 h-5 w-5 text-axis-accent" strokeWidth={1.5} />
                <h3 className="text-sm font-semibold text-axis-text">{d.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-axis-textMuted">{d.desc}</p>
                <div className="mt-3 inline-block rounded bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-medium text-amber-400">
                  {d.finding}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ===========================================================================
// How it works — 3 steps
// ===========================================================================

function HowItWorks(): JSX.Element {
  const fade = useFadeIn();
  const steps = [
    { icon: Terminal, title: 'Install', cmd: 'npx burnd', body: 'One command. No signup. No config. Works on Windows, macOS, Linux.' },
    { icon: Search, title: 'Scan', cmd: '227 files · $13,631 total', body: 'Streams every session JSONL from ~/.claude/projects/. Under 30 seconds.' },
    { icon: TrendingDown, title: 'Fix', cmd: 'Top leak: $30.48 saved', body: 'Dollar values, effort estimates, step-by-step fixes. Apply the top 3 and watch your weekly spend drop.' },
  ];

  return (
    <section className="border-b border-axis-border py-24">
      <div
        ref={fade.ref}
        className={`mx-auto max-w-7xl px-6 ${fade.cls}`}
      >
        <div className="mb-4 font-mono text-[11px] uppercase tracking-widest text-axis-accent">
          How it works
        </div>
        <h2 className="max-w-lg font-serif text-4xl tracking-tight text-axis-text md:text-5xl">
          Install to savings in 3 steps
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="relative">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-axis-border bg-axis-surface font-mono text-sm font-bold text-axis-accent">
                    {i + 1}
                  </div>
                  <Icon className="h-5 w-5 text-axis-textDim" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-axis-text">{s.title}</h3>
                <div className="mt-2 rounded border border-axis-border bg-axis-bg px-3 py-2 font-mono text-[11px] text-axis-accent">
                  {s.cmd}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-axis-textMuted">{s.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ===========================================================================
// Buy the Ebook — the main revenue CTA
// ===========================================================================

function BuyTheEbook(): JSX.Element {
  const fade = useFadeIn();
  return (
    <section id="ebook" className="border-b border-axis-border py-24">
      <div
        ref={fade.ref}
        className={`mx-auto max-w-7xl px-6 ${fade.cls}`}
      >
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Book cover — floating */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-8 rounded-2xl bg-gradient-to-br from-amber-500/8 to-axis-accent/8 blur-3xl" />
              <div className="animate-float relative w-[260px] rounded-lg border border-axis-border bg-gradient-to-br from-axis-surfaceHigh via-axis-surface to-axis-bg p-8 shadow-2xl shadow-black/50">
                <div className="pointer-events-none absolute inset-0 rounded-lg opacity-30"
                  style={{ background: 'radial-gradient(ellipse 200px 150px at 30% 20%, rgba(245, 158, 11, 0.2), transparent 60%)' }}
                />
                <div className="relative">
                  <div className="mb-6 inline-flex items-center gap-1.5 rounded bg-amber-500/15 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-amber-400">
                    <Flame className="h-3 w-3" />
                    ebook
                  </div>
                  <h3 className="font-serif text-3xl leading-tight text-axis-text">
                    Burning<br />Tokens
                  </h3>
                  <div className="mt-4 border-l-2 border-amber-500/50 pl-3 text-[11px] leading-relaxed text-axis-textMuted">
                    8 patterns I found in $13,000 of Claude Code spend
                  </div>
                  <div className="mt-8 font-mono text-[10px] text-axis-textDim">
                    Garvit Surana · age 16
                  </div>
                  <div className="font-mono text-[10px] text-axis-textDim">
                    Class 12 ISC · Guwahati
                  </div>
                  <div className="mt-4 flex items-center gap-2 font-mono text-[9px] text-axis-textDim">
                    <BookOpen className="h-3 w-3" /> 7,400 words · 11 chapters
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="mb-3 font-mono text-[11px] uppercase tracking-widest text-amber-500">
              The companion ebook
            </div>
            <h2 className="font-serif text-4xl tracking-tight text-axis-text md:text-5xl">
              Burning Tokens
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-axis-textMuted">
              Every detector, in book form. Real data from my <em>actual</em> $13,631 of Claude Code spend.
              Every pattern has the story of how I found it, the dollar value I measured, and the fix I tested.
            </p>
            <ul className="mt-6 flex flex-col gap-2.5 text-sm text-axis-textMuted">
              {[
                '7,400 words across 11 chapters + appendix',
                'Real examples from 227 sessions of my own data',
                'The 15-minute weekly review process I actually use',
                'Free lifetime updates as new detectors ship',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-lg border border-amber-500/30 bg-amber-500/5 p-6">
              <div className="flex items-baseline gap-3">
                <div className="font-mono text-4xl font-bold text-axis-text">&#8377;399</div>
                <div className="font-mono text-sm text-axis-textDim line-through">&#8377;999</div>
                <div className="rounded bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-medium uppercase text-amber-400">
                  founding price
                </div>
              </div>
              <div className="mt-1 font-mono text-[11px] text-axis-textDim">
                ≈ $4.50 USD · first 50 copies · raises to &#8377;599 after
              </div>
              <a
                href="#buy"
                className="mt-5 flex items-center justify-center gap-2 rounded-md bg-amber-500 px-5 py-3 text-sm font-semibold text-axis-bg transition-all hover:bg-amber-400"
              >
                Buy via UPI
                <ArrowRight className="h-4 w-4" />
              </a>
              <div className="mt-3 text-center font-mono text-[10px] text-axis-textDim">
                UPI direct · I email the PDF · no account needed
              </div>
            </div>
          </div>
        </div>

        <BuyFlow />
      </div>
    </section>
  );
}

function BuyFlow(): JSX.Element {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div id="buy" className="mx-auto mt-16 max-w-3xl rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
        <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
          <Check className="h-7 w-7 text-emerald-400" />
        </div>
        <h3 className="font-serif text-2xl text-axis-text">Got it!</h3>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-axis-textMuted">
          I'll verify the payment in my UPI app and email the <strong className="text-axis-text">Burning Tokens</strong> PDF to the address you provided.
          Usually within 1 hour if I'm awake, always within 12 hours.
        </p>
        <div className="mt-6 font-mono text-[11px] text-axis-textDim">
          Questions? garvitsurana10@gmail.com
        </div>
      </div>
    );
  }

  return (
    <div id="buy" className="mx-auto mt-16 max-w-3xl rounded-lg border border-axis-border bg-axis-surface/50 p-8">
      <div className="text-center">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-amber-500">How to buy</div>
        <h3 className="font-serif text-2xl text-axis-text">Two steps. About 90 seconds.</h3>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Step 1: UPI */}
        <div className="rounded-md border border-axis-border bg-axis-bg p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 font-mono text-[11px] font-bold text-axis-bg">1</div>
            <div className="text-sm font-semibold text-axis-text">Send &#8377;399 via UPI</div>
          </div>
          <div className="rounded border border-axis-border bg-axis-surface p-4 text-center">
            <div className="font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">UPI ID</div>
            <div className="mt-2 font-mono text-lg font-bold text-amber-400">madhusuranaa@okaxis</div>
            <div className="mt-2 font-mono text-[9px] text-axis-textDim">
              Google Pay · PhonePe · Paytm · BHIM · any UPI app
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-axis-textMuted">
            Open your UPI app, pay &#8377;399, and note the transaction ID from the confirmation screen.
          </p>
        </div>

        {/* Step 2: Form */}
        <div className="rounded-md border border-axis-border bg-axis-bg p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 font-mono text-[11px] font-bold text-axis-bg">2</div>
            <div className="text-sm font-semibold text-axis-text">Confirm your payment</div>
          </div>

          <form
            action="https://formsubmit.co/garvitsurana10@gmail.com"
            method="POST"
            onSubmit={() => setSubmitted(true)}
            className="flex flex-col gap-3"
          >
            <input type="hidden" name="_subject" value="Burning Tokens — new purchase!" />
            <input type="hidden" name="_captcha" value="true" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_next" value="https://getburnd.vercel.app/#buy" />

            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">Your name</label>
              <input type="text" name="name" required placeholder="First name is fine"
                className="w-full rounded border border-axis-border bg-axis-surface px-3 py-2 font-mono text-xs text-axis-text placeholder:text-axis-textDim focus:border-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">Email address</label>
              <input type="email" name="email" required placeholder="I'll send the PDF here"
                className="w-full rounded border border-axis-border bg-axis-surface px-3 py-2 font-mono text-xs text-axis-text placeholder:text-axis-textDim focus:border-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">UPI Transaction ID / UTR</label>
              <input type="text" name="transaction_id" required placeholder="From your UPI app confirmation"
                className="w-full rounded border border-axis-border bg-axis-surface px-3 py-2 font-mono text-xs text-axis-text placeholder:text-axis-textDim focus:border-amber-500 focus:outline-none" />
            </div>
            <button type="submit"
              className="mt-2 flex items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-axis-bg transition-all hover:bg-amber-400">
              Send — I'll email the PDF
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-3 text-[10px] leading-relaxed text-axis-textDim">
            I personally verify and email every copy. Usually within the hour.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded border border-axis-border bg-axis-bg p-4 font-mono text-[11px] text-axis-textMuted">
        <div className="mb-1 text-axis-textDim">Not in India? No UPI?</div>
        Email <a href="mailto:garvitsurana10@gmail.com" className="text-axis-accent hover:underline">garvitsurana10@gmail.com</a> with subject{' '}
        <code className="rounded bg-axis-muted px-1 text-axis-text">buy burning tokens</code>.
        International payment handled case-by-case. Manual but real.
      </div>
    </div>
  );
}

// ===========================================================================
// Dashboard Preview
// ===========================================================================

function DashboardPreview(): JSX.Element {
  const fade = useFadeIn();
  return (
    <section className="border-b border-axis-border py-24">
      <div
        ref={fade.ref}
        className={`mx-auto max-w-7xl px-6 ${fade.cls}`}
      >
        <div className="mb-4 font-mono text-[11px] uppercase tracking-widest text-axis-accent">
          Free forever
        </div>
        <h2 className="max-w-lg font-serif text-4xl tracking-tight text-axis-text md:text-5xl">
          The dashboard runs on your machine
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-axis-textMuted">
          Run <code className="rounded bg-axis-muted px-1.5 py-0.5 font-mono text-sm text-axis-accent">npx burnd serve</code> and open localhost:4711.
          No signup. No cloud. Just your data.
        </p>

        <div className="mt-12 overflow-hidden rounded-xl border border-axis-border bg-axis-surface shadow-2xl shadow-black/30">
          <div className="flex items-center gap-2 border-b border-axis-border bg-axis-bg px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <div className="ml-2 font-mono text-[10px] text-axis-textDim">localhost:4711/app/insights</div>
          </div>
          <div className="grid grid-cols-3 gap-4 bg-axis-bg p-6">
            {[
              { label: 'all-time spend', val: '$13,631', color: 'text-axis-text' },
              { label: 'last 7 days', val: '$843', color: 'text-axis-text' },
              { label: 'potential savings', val: '$75.92', color: 'text-amber-400' },
            ].map((s) => (
              <div key={s.label} className="rounded border border-axis-border bg-axis-surface p-4">
                <div className="font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">{s.label}</div>
                <div className={`mt-1 font-mono text-2xl font-bold ${s.color}`}>{s.val}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-axis-border bg-axis-bg p-6">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
              Top leaks (sorted by savings)
            </div>
            <div className="flex flex-col gap-3">
              {[
                { r: 1, t: 'Project "ChangeLife" costs 3.2x more per session', s: '$30.48', e: '~15 min' },
                { r: 2, t: 'Bash accounts for 80% of tool calls — likely overuse', s: '$7.76', e: '~8 min' },
                { r: 3, t: 'Tool error storm — 30% of calls failed', s: '$3.95', e: '~10 min' },
              ].map((l) => (
                <div key={l.r} className="flex items-center gap-4 rounded border border-axis-border bg-axis-surface px-4 py-3">
                  <div className="font-mono text-xl font-bold text-axis-textDim">{l.r}</div>
                  <div className="flex-1">
                    <div className="text-sm text-axis-text">{l.t}</div>
                    <div className="mt-1 flex gap-2 font-mono text-[10px]">
                      <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-400">save {l.s}</span>
                      <span className="rounded bg-axis-muted px-1.5 py-0.5 text-axis-textMuted">{l.e} to fix</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/app/insights"
            className="inline-flex items-center gap-2 rounded-md border border-axis-accent/40 bg-axis-accent/10 px-6 py-3 font-mono text-sm text-axis-accent transition-all hover:border-axis-accent hover:bg-axis-accent/20"
          >
            Open the live demo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ===========================================================================
// Privacy
// ===========================================================================

function PrivacyCallout(): JSX.Element {
  const fade = useFadeIn();
  return (
    <section className="border-b border-axis-border py-20">
      <div
        ref={fade.ref}
        className={`mx-auto max-w-4xl px-6 ${fade.cls}`}
      >
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-8 md:p-10">
          <div className="flex items-start gap-5">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="font-serif text-3xl text-axis-text">
                We never see your code.
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-axis-textMuted">
                Burnd is <strong className="text-axis-text">local-first by default</strong>. The CLI runs on your machine.
                It reads your session files, computes leaks, serves the dashboard from localhost.
                <strong className="text-axis-text"> Zero data leaves your machine.</strong>
              </p>
              <div className="mt-5 flex flex-col gap-2 text-sm text-axis-textMuted">
                {[
                  'Never uploaded: code, prompts, file contents, tool outputs, git branches, file paths',
                  'Parser source code is public on GitHub — audit it yourself',
                  'CI tests assert no secrets leak through anonymization',
                ].map((p) => (
                  <div key={p} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===========================================================================
// Pricing
// ===========================================================================

function PricingCards(): JSX.Element {
  const fade = useFadeIn();
  return (
    <section id="pricing" className="border-b border-axis-border py-24">
      <div
        ref={fade.ref}
        className={`mx-auto max-w-7xl px-6 ${fade.cls}`}
      >
        <div className="mb-4 font-mono text-[11px] uppercase tracking-widest text-axis-accent">
          Pricing
        </div>
        <h2 className="font-serif text-4xl tracking-tight text-axis-text md:text-5xl">
          Honest. Scrappy. Indian-first.
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-axis-textMuted">
          The CLI is free forever. The ebook is &#8377;399 (founding price). The SaaS tier launches after I turn 18 and can legally sign up for a payment processor.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Free */}
          <div className="flex flex-col rounded-xl border border-axis-border bg-axis-surface/50 p-6">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">Free forever</div>
            <div className="text-xl font-semibold text-axis-text">CLI + Dashboard</div>
            <div className="mt-4 font-mono text-4xl font-bold text-axis-text">&#8377;0</div>
            <div className="font-mono text-[11px] text-axis-textDim">MIT · open source · no signup</div>
            <ul className="mt-6 flex flex-col gap-2 text-xs text-axis-textMuted">
              {['All 8 leak detectors', 'Local web dashboard', '60-day spend chart', 'Per-project breakdown', 'Works offline'].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <div className="rounded border border-axis-border bg-axis-bg px-3 py-2.5 text-center font-mono text-xs text-axis-textMuted">npx burnd</div>
            </div>
          </div>

          {/* Ebook — highlighted */}
          <div className="relative flex flex-col rounded-xl border border-amber-500/40 bg-amber-500/5 p-6 md:-my-3">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-amber-500/40 bg-axis-bg px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-400">
              available now
            </div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-amber-500">The ebook</div>
            <div className="text-xl font-semibold text-axis-text">Burning Tokens</div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-mono text-4xl font-bold text-axis-text">&#8377;399</span>
              <span className="font-mono text-sm text-axis-textDim line-through">&#8377;999</span>
            </div>
            <div className="font-mono text-[11px] text-axis-textDim">founding · first 50</div>
            <ul className="mt-6 flex flex-col gap-2 text-xs text-axis-textMuted">
              {['7,400 words · 11 chapters', 'Every detector with real data', 'Weekly review process', 'Lifetime updates', 'UPI instant payment'].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <a href="#buy"
                className="flex items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-axis-bg transition-all hover:bg-amber-400">
                Buy via UPI
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Coming soon */}
          <div className="flex flex-col rounded-xl border border-axis-border bg-axis-surface/30 p-6 opacity-60">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-axis-textDim">Coming post-v2</div>
            <div className="text-xl font-semibold text-axis-text">Pro (cloud sync)</div>
            <div className="mt-4 font-mono text-4xl font-bold text-axis-text">$9/mo</div>
            <div className="font-mono text-[11px] text-axis-textDim">or $79 founding lifetime</div>
            <ul className="mt-6 flex flex-col gap-2 text-xs text-axis-textMuted">
              {['Everything in CLI', 'Cross-device sync', 'Weekly leak reports', 'Historical trends', 'Team dashboards'].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-axis-textDim" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <div className="rounded border border-axis-border bg-axis-bg px-3 py-2.5 text-center font-mono text-xs text-axis-textDim">after I turn 18</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===========================================================================
// The Story — this is what makes Burnd unforgettable
// ===========================================================================

function TheStory(): JSX.Element {
  const fade = useFadeIn();
  return (
    <section id="story" className="relative overflow-hidden border-b border-axis-border py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ background: 'radial-gradient(ellipse 800px 400px at 20% 50%, rgba(99, 102, 241, 0.08), transparent 70%)' }}
      />
      <div
        ref={fade.ref}
        className={`relative mx-auto max-w-4xl px-6 ${fade.cls}`}
      >
        <div className="mb-8 font-mono text-[11px] uppercase tracking-widest text-amber-500">
          The builder
        </div>

        <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-amber-500/30 to-axis-accent/30 blur-md" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-amber-500/50 bg-axis-surface font-serif text-4xl text-amber-400">
                G
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-4xl text-axis-text md:text-5xl">
              I'm Garvit Surana.
            </h3>
            <p className="mt-1 text-lg text-axis-textMuted">
              <strong className="text-amber-400">16 years old.</strong> Class 12 ISC. Guwahati, India.
            </p>

            <blockquote className="mt-6 border-l-2 border-amber-500/50 pl-5 font-serif text-xl italic leading-relaxed text-axis-textMuted md:text-2xl">
              "I spent $13,631 on Claude Code in six months and had no idea where any of it was going. So I built the tool to find out."
            </blockquote>

            <p className="mt-6 text-[15px] leading-relaxed text-axis-textMuted">
              The CLI is free and open-source. The ebook is how I'm funding the SaaS version
              I'll ship after my board exams in Feb 2027. Every &#8377;399 helps me build
              the full product before college.
            </p>

            <p className="mt-4 text-[15px] leading-relaxed text-axis-textMuted">
              I've shipped <strong className="text-axis-text">KropScan</strong> (AI crop disease detection),
              built <strong className="text-axis-text">Vynce</strong> (full React Native app with iOS + Android),
              and spend most of my time in Claude Code, Gemini CLI, and VS Code.
              This isn't my first product — but it's the first one I'm charging money for.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 font-mono text-xs">
              <a href="https://github.com/garvitsurana271" target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-axis-textMuted transition-colors hover:text-axis-text">
                <Github className="h-4 w-4" />
                garvitsurana271
              </a>
              <a href="https://twitter.com/GarvitSura5238" target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-axis-textMuted transition-colors hover:text-axis-text">
                𝕏 @GarvitSura5238
              </a>
              <a href="mailto:garvitsurana10@gmail.com"
                className="flex items-center gap-1.5 text-axis-textMuted transition-colors hover:text-axis-text">
                <Mail className="h-4 w-4" />
                garvitsurana10@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===========================================================================
// Footer
// ===========================================================================

function Footer(): JSX.Element {
  return (
    <footer className="py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-2.5">
            <Flame className="h-4 w-4 text-amber-500" />
            <span className="font-mono text-[11px] text-axis-textDim">
              burnd · built by a 16yo in Guwahati, India · shipped locally first
            </span>
          </div>
          <div className="flex flex-wrap gap-5 font-mono text-[11px] text-axis-textMuted">
            <a href="https://github.com/garvitsurana271/burnd" target="_blank" rel="noreferrer"
              className="transition-colors hover:text-axis-text">github</a>
            <a href="https://github.com/garvitsurana271/burnd/blob/main/notes/anonymization.md" target="_blank" rel="noreferrer"
              className="transition-colors hover:text-axis-text">privacy spec</a>
            <Link to="/app/insights" className="transition-colors hover:text-axis-text">dashboard</Link>
          </div>
        </div>
        <div className="mt-6 font-mono text-[10px] text-axis-textDim">
          © 2026 Garvit Surana · MIT licensed · made with Claude Code + a lot of chai
        </div>
      </div>
    </footer>
  );
}
