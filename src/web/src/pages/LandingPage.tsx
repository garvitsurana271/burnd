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
} from 'lucide-react';

// Burnd's marketing landing page — the storefront for the ebook, the CLI,
// and the future dashboard SaaS tier. Pure presentation, no API calls.
// All content is hand-authored to feel like a real builder's page, not
// generated copy.

export function LandingPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-axis-bg text-axis-text">
      <Header />
      <Hero />
      <BrutalFactsStrip />
      <DetectorGrid />
      <HowItWorks />
      <BuyTheEbook />
      <DashboardPreview />
      <PrivacyCallout />
      <PricingCards />
      <BuiltBy />
      <Footer />
    </div>
  );
}

// ===========================================================================
// Header
// ===========================================================================

function Header(): JSX.Element {
  return (
    <header className="sticky top-0 z-50 border-b border-axis-border bg-axis-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-axis-accent" strokeWidth={2.5} />
          <span className="font-mono text-sm font-semibold tracking-tight">burnd</span>
          <span className="hidden rounded bg-axis-muted px-1.5 py-0.5 font-mono text-[10px] text-axis-textMuted sm:inline">
            v0.0.1
          </span>
        </div>
        <nav className="ml-auto flex items-center gap-5 font-mono text-xs text-axis-textMuted">
          <a href="#detectors" className="transition-colors hover:text-axis-text">
            detectors
          </a>
          <a href="#ebook" className="transition-colors hover:text-axis-text">
            ebook
          </a>
          <a href="#pricing" className="transition-colors hover:text-axis-text">
            pricing
          </a>
          <a
            href="https://github.com/garvitsurana271/burnd"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 transition-colors hover:text-axis-text"
          >
            <Github className="h-3.5 w-3.5" />
            github
          </a>
          <Link
            to="/app/insights"
            className="rounded-md border border-axis-border bg-axis-surface px-3 py-1.5 text-axis-text transition-colors hover:border-axis-accent hover:bg-axis-accentSoft"
          >
            open dashboard →
          </Link>
        </nav>
      </div>
    </header>
  );
}

// ===========================================================================
// Hero
// ===========================================================================

function Hero(): JSX.Element {
  return (
    <section className="relative overflow-hidden border-b border-axis-border">
      {/* subtle gradient ornament */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse 800px 400px at 50% 0%, rgba(99, 102, 241, 0.15), transparent 60%)',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-axis-border bg-axis-surface px-3 py-1 font-mono text-[11px] text-axis-textMuted">
            <span className="h-1.5 w-1.5 rounded-full bg-axis-success"></span>
            Built by a 16 year old who spent $13,631 on Claude Code in 6 months
          </div>
          <h1 className="font-sans text-5xl font-bold tracking-tight text-axis-text md:text-6xl">
            Cut your <span className="text-axis-accent">Claude Code</span> spend by 20–40% in a week.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-axis-textMuted md:text-xl">
            Burnd reads your local <code className="rounded bg-axis-muted px-1.5 py-0.5 font-mono text-base text-axis-text">~/.claude/projects/*.jsonl</code> files and finds the leaks in your AI coding spend.
            <br />
            <span className="text-axis-textDim">We never upload your code. Only you see your data.</span>
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <InstallCommand />
            <Link
              to="/app/insights"
              className="inline-flex items-center gap-2 rounded-md border border-axis-border bg-axis-surface px-5 py-3 font-mono text-sm text-axis-text transition-colors hover:border-axis-accent hover:bg-axis-accentSoft"
            >
              live demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-6 font-mono text-[11px] text-axis-textDim">
            free · open source · MIT · runs 100% on your machine
          </p>
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
      className="group inline-flex items-center gap-3 rounded-md border border-axis-accent bg-axis-accent/15 px-5 py-3 font-mono text-sm text-axis-text transition-all hover:bg-axis-accent/25"
    >
      <Terminal className="h-4 w-4 text-axis-accent" />
      <span>$ {cmd}</span>
      {copied ? (
        <Check className="h-4 w-4 text-axis-success" />
      ) : (
        <Copy className="h-4 w-4 text-axis-textMuted transition-colors group-hover:text-axis-accent" />
      )}
    </button>
  );
}

// ===========================================================================
// Brutal-facts strip (the "$13,631" social proof row)
// ===========================================================================

function BrutalFactsStrip(): JSX.Element {
  return (
    <section className="border-b border-axis-border bg-axis-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-0 divide-axis-border md:grid-cols-4 md:divide-x">
        <Fact
          value="$13,631"
          label="my own Claude Code spend in 6 months"
          accent="warning"
        />
        <Fact value="227" label="sessions across 15 projects" />
        <Fact value="8" label="leak patterns detected automatically" />
        <Fact value="₹399" label="ebook · lifetime · founding price" accent="success" />
      </div>
    </section>
  );
}

function Fact({
  value,
  label,
  accent = 'default',
}: {
  value: string;
  label: string;
  accent?: 'default' | 'warning' | 'success';
}): JSX.Element {
  const color =
    accent === 'warning'
      ? 'text-axis-warning'
      : accent === 'success'
        ? 'text-axis-success'
        : 'text-axis-text';
  return (
    <div className="px-6 py-8 text-center">
      <div className={`font-mono text-3xl font-bold tracking-tight ${color}`}>{value}</div>
      <div className="mt-2 font-mono text-[11px] uppercase tracking-wider text-axis-textMuted">
        {label}
      </div>
    </div>
  );
}

// ===========================================================================
// What burnd finds — the 8 detectors
// ===========================================================================

const DETECTORS = [
  {
    icon: Terminal,
    title: 'Long Bash output',
    description:
      'Test runners and builds dumping 10k+ bytes into every session. Fix: pipe through head/tail.',
    example: '~$8.40 found in one session',
  },
  {
    icon: Repeat,
    title: 'Repeated reads',
    description:
      'Same file read 3+ times in one session — classic context-forgetting pattern.',
    example: '32 files re-read, worst case 31×',
  },
  {
    icon: AlertTriangle,
    title: 'Tool error storms',
    description:
      'Agent retrying failed commands without recognizing terminal errors. Real money wasted.',
    example: '30-60% error rate in bad sessions',
  },
  {
    icon: Zap,
    title: 'Tool overuse',
    description:
      'One tool dominating 70%+ of calls — usually Bash doing file ops that cheaper tools handle better.',
    example: '80% Bash share → $7.76 savings',
  },
  {
    icon: Moon,
    title: 'Late-night coding',
    description:
      'Sessions started 00:00–05:00 local cost 2.5× more per session. Tired prompts thrash.',
    example: '23 sessions at 2.5× cost premium',
  },
  {
    icon: Search,
    title: 'API retry storms',
    description:
      'Invisible from the UI: Claude Code retries API errors and bills you for every partial response.',
    example: '11 retries in one 90-min window',
  },
  {
    icon: Sparkles,
    title: 'Skill firing too often',
    description:
      'Skills with overly broad trigger descriptions loading into context on every message.',
    example: '42% of tool calls were one skill',
  },
  {
    icon: FolderSearch,
    title: 'Project cost outliers',
    description:
      'Cross-session detection: one project costing 3× more per session than your overall median.',
    example: '~$30 savings in top outlier',
  },
];

function DetectorGrid(): JSX.Element {
  return (
    <section id="detectors" className="border-b border-axis-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="What Burnd finds"
          title="8 patterns that quietly drain your budget"
          subtitle="Every detector comes with a dollar value. You don't just see where your money went — you see how much each leak is costing you, and exactly how to fix it."
        />
        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {DETECTORS.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.title}
                className="group flex flex-col rounded-lg border border-axis-border bg-axis-surface p-5 transition-all hover:border-axis-accent/50 hover:bg-axis-surfaceHigh"
              >
                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md bg-axis-accentSoft">
                  <Icon className="h-4 w-4 text-axis-accent" strokeWidth={2} />
                </div>
                <h3 className="font-sans text-sm font-semibold text-axis-text">{d.title}</h3>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-axis-textMuted">
                  {d.description}
                </p>
                <div className="mt-3 font-mono text-[10px] text-axis-warning">{d.example}</div>
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
  const steps = [
    {
      icon: Terminal,
      title: 'Install',
      command: 'npx burnd',
      description:
        'One command, no signup, no config. Works with any Claude Code installation — Windows, macOS, Linux.',
    },
    {
      icon: Search,
      title: 'Scan',
      command: 'Scanned 227 files · $13,631 all-time',
      description:
        'Burnd walks your ~/.claude/projects directory and streams every session JSONL. Parses in under 30 seconds on a typical laptop.',
    },
    {
      icon: TrendingDown,
      title: 'Fix',
      command: 'Top leak: $30.48 in one project',
      description:
        'Each insight comes with a dollar value, effort estimate, and step-by-step fix. Apply the top 3 and watch your weekly spend drop.',
    },
  ];

  return (
    <section className="border-b border-axis-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="How it works"
          title="From install to savings in 3 steps"
          subtitle="No SaaS dashboard signup. No credit card. No data upload. Just you, your terminal, and your own data."
        />
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-axis-border bg-axis-surface">
                  <Icon className="h-5 w-5 text-axis-accent" strokeWidth={2} />
                </div>
                <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-axis-textDim">
                  Step {i + 1}
                </div>
                <h3 className="font-sans text-xl font-semibold text-axis-text">{step.title}</h3>
                <div className="mt-2 rounded border border-axis-border bg-axis-surface px-3 py-2 font-mono text-[11px] text-axis-accent">
                  {step.command}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-axis-textMuted">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ===========================================================================
// Buy the ebook — the main revenue CTA for the India launch
// ===========================================================================

function BuyTheEbook(): JSX.Element {
  return (
    <section id="ebook" className="border-b border-axis-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          {/* LEFT: Book "cover" */}
          <div className="relative flex justify-center">
            <div className="relative w-[280px] rotate-[-3deg] rounded-md border border-axis-border bg-gradient-to-br from-axis-surfaceHigh to-axis-surface p-8 shadow-2xl transition-transform hover:rotate-0">
              <div
                className="pointer-events-none absolute inset-0 rounded-md opacity-20"
                style={{
                  background:
                    'radial-gradient(ellipse 300px 200px at 30% 20%, rgba(99, 102, 241, 0.3), transparent 60%)',
                }}
              />
              <div className="relative">
                <div className="mb-6 inline-flex items-center gap-1.5 rounded bg-axis-warningSoft px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-axis-warning">
                  <Flame className="h-3 w-3" />
                  ebook · v1
                </div>
                <h3 className="font-sans text-2xl font-bold leading-tight text-axis-text">
                  Burning<br />Tokens
                </h3>
                <div className="mt-4 border-l-2 border-axis-accent pl-3 text-[11px] leading-relaxed text-axis-textMuted">
                  8 patterns I found in $13,000 of my own Claude Code spend (and how to fix them)
                </div>
                <div className="mt-8 font-mono text-[10px] uppercase tracking-wider text-axis-textDim">
                  Garvit Surana · 16
                </div>
                <div className="font-mono text-[10px] text-axis-textDim">
                  Class 12 ISC · Guwahati, India
                </div>
                <div className="mt-4 flex items-center gap-2 font-mono text-[9px] text-axis-textDim">
                  <BookOpen className="h-3 w-3" /> 7,400 words · 11 chapters · PDF
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Content + buy CTA */}
          <div>
            <div className="mb-3 font-mono text-[11px] uppercase tracking-wider text-axis-accent">
              The companion ebook
            </div>
            <h2 className="font-sans text-4xl font-bold leading-tight tracking-tight text-axis-text">
              Burning Tokens
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-axis-textMuted">
              Every Burnd detector, in book form. Real data from my actual $13,631 of Claude Code spend. Every pattern has the story of how I found it, the dollar value I measured, and the fix I tested on my own projects.
            </p>
            <ul className="mt-6 flex flex-col gap-2 font-mono text-xs text-axis-textMuted">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-axis-success" />
                <span>7,400 words across 11 chapters + appendix</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-axis-success" />
                <span>Real examples from 227 sessions of my own data</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-axis-success" />
                <span>The 15-minute weekly review process I actually use</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-axis-success" />
                <span>Free lifetime updates as new detectors are added</span>
              </li>
            </ul>

            <div className="mt-8 rounded-lg border border-axis-accent bg-axis-accentSoft p-5">
              <div className="flex items-baseline gap-3">
                <div className="font-mono text-4xl font-bold text-axis-text">₹399</div>
                <div className="font-mono text-sm text-axis-textMuted line-through">₹999</div>
                <div className="rounded bg-axis-warningSoft px-2 py-0.5 font-mono text-[10px] uppercase text-axis-warning">
                  founding · first 50
                </div>
              </div>
              <div className="mt-1 font-mono text-[11px] text-axis-textDim">
                ≈ $4.50 USD · launch price · raises to ₹599 after first 50 sales
              </div>
              <a
                href="#buy"
                className="mt-5 flex items-center justify-center gap-2 rounded-md bg-axis-accent px-5 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-axis-accentHover"
              >
                Buy via UPI
                <ArrowRight className="h-4 w-4" />
              </a>
              <div className="mt-3 text-center font-mono text-[10px] text-axis-textDim">
                UPI direct · instant delivery via email · no account needed
              </div>
            </div>
          </div>
        </div>

        {/* Buy flow detail — the UPI instructions */}
        <BuyFlow />
      </div>
    </section>
  );
}

function BuyFlow(): JSX.Element {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div id="buy" className="mx-auto mt-16 max-w-3xl rounded-lg border border-axis-success/40 bg-axis-success/5 p-8 text-center">
        <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-axis-success/20">
          <Check className="h-7 w-7 text-axis-success" />
        </div>
        <h3 className="font-sans text-2xl font-bold text-axis-text">Got it!</h3>
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
    <div id="buy" className="mx-auto mt-16 max-w-3xl rounded-lg border border-axis-border bg-axis-surface p-8">
      <div className="text-center">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-axis-accent">
          How to buy
        </div>
        <h3 className="font-sans text-2xl font-bold text-axis-text">
          Two steps. About 90 seconds.
        </h3>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* LEFT: UPI payment instructions */}
        <div className="rounded-md border border-axis-border bg-axis-bg p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-axis-accent font-mono text-[11px] font-semibold text-white">
              1
            </div>
            <div className="font-sans text-sm font-semibold text-axis-text">Send ₹399 via UPI</div>
          </div>
          <div className="rounded border border-axis-border bg-axis-surface p-4 text-center">
            <div className="font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
              UPI ID
            </div>
            <div className="mt-2 font-mono text-lg font-semibold text-axis-accent">
              madhusuranaa@okaxis
            </div>
            <div className="mt-2 font-mono text-[9px] text-axis-textDim">
              Google Pay · PhonePe · Paytm · BHIM · any UPI app
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-axis-textMuted">
            Open your UPI app, pay ₹399, and note the transaction ID from the confirmation screen.
          </p>
        </div>

        {/* RIGHT: Inline fulfillment form (submitted via FormSubmit.co) */}
        <div className="rounded-md border border-axis-border bg-axis-bg p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-axis-accent font-mono text-[11px] font-semibold text-white">
              2
            </div>
            <div className="font-sans text-sm font-semibold text-axis-text">
              Confirm your payment
            </div>
          </div>

          <form
            action="https://formsubmit.co/garvitsurana10@gmail.com"
            method="POST"
            onSubmit={() => setSubmitted(true)}
            className="flex flex-col gap-3"
          >
            {/* FormSubmit config (hidden fields) */}
            <input type="hidden" name="_subject" value="🔥 Burning Tokens — new purchase!" />
            <input type="hidden" name="_captcha" value="true" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_next" value="https://getburnd.vercel.app/#buy" />

            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
                Your name
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="First name is fine"
                className="w-full rounded border border-axis-border bg-axis-surface px-3 py-2 font-mono text-xs text-axis-text placeholder:text-axis-textDim focus:border-axis-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
                Email address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="I'll send the PDF here"
                className="w-full rounded border border-axis-border bg-axis-surface px-3 py-2 font-mono text-xs text-axis-text placeholder:text-axis-textDim focus:border-axis-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
                UPI Transaction ID / UTR
              </label>
              <input
                type="text"
                name="transaction_id"
                required
                placeholder="From your UPI app confirmation"
                className="w-full rounded border border-axis-border bg-axis-surface px-3 py-2 font-mono text-xs text-axis-text placeholder:text-axis-textDim focus:border-axis-accent focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-2 flex items-center justify-center gap-2 rounded-md bg-axis-accent px-4 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-axis-accentHover"
            >
              Send — I'll email the PDF
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-3 text-[10px] leading-relaxed text-axis-textDim">
            Delivery: within 12 hours (usually within the hour if I'm awake). Zero automation, I personally verify and email every copy.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded border border-axis-border bg-axis-bg p-4 font-mono text-[11px] text-axis-textMuted">
        <div className="mb-1 text-axis-textDim">Not in India? No UPI?</div>
        Email <a href="mailto:garvitsurana10@gmail.com" className="text-axis-accent hover:underline">garvitsurana10@gmail.com</a> with the subject <code className="rounded bg-axis-muted px-1 text-axis-text">buy burning tokens</code>. International payment handled case-by-case (Wise, PayPal, crypto, whatever works). Manual but real.
      </div>
    </div>
  );
}

// ===========================================================================
// Dashboard preview
// ===========================================================================

function DashboardPreview(): JSX.Element {
  return (
    <section className="border-b border-axis-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="See it live"
          title="The dashboard is free forever"
          subtitle="The CLI ships with a local web dashboard. Run npx burnd serve and open localhost:4711 in your browser. No signup, no cloud sync, no account."
        />

        {/* A mock dashboard screenshot using real-ish Garvit numbers */}
        <div className="mt-12 overflow-hidden rounded-lg border border-axis-border bg-axis-surface">
          <div className="flex items-center gap-2 border-b border-axis-border bg-axis-surfaceHigh px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-axis-danger"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-axis-warning"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-axis-success"></div>
            </div>
            <div className="ml-2 font-mono text-[11px] text-axis-textDim">
              localhost:4711/app/insights
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 bg-axis-bg p-6">
            <MockStatCard label="all-time spend" value="$13,631" tone="text" />
            <MockStatCard label="last 7 days" value="$843" tone="text" />
            <MockStatCard label="potential savings" value="$75.92" tone="warning" />
          </div>
          <div className="border-t border-axis-border bg-axis-bg p-6">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
              Top leaks (sorted by savings)
            </div>
            <div className="flex flex-col gap-3">
              <MockInsight
                rank={1}
                title={'Project "A" costs 3.2× more per session — wasting ~$30.48'}
                savings="$30.48"
                effort="~15 min"
              />
              <MockInsight
                rank={2}
                title="Bash accounts for 80% of tool calls — likely overuse"
                savings="$7.76"
                effort="~8 min"
              />
              <MockInsight
                rank={3}
                title="Tool error storm — 30% of calls failed"
                savings="$3.95"
                effort="~10 min"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/app/insights"
            className="inline-flex items-center gap-2 rounded-md border border-axis-accent bg-axis-accent/15 px-6 py-3 font-mono text-sm text-axis-text transition-colors hover:bg-axis-accent/25"
          >
            Open the live demo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function MockStatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'text' | 'warning';
}): JSX.Element {
  const color = tone === 'warning' ? 'text-axis-warning' : 'text-axis-text';
  return (
    <div className="rounded border border-axis-border bg-axis-surface p-4">
      <div className="font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
        {label}
      </div>
      <div className={`mt-1 font-mono text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function MockInsight({
  rank,
  title,
  savings,
  effort,
}: {
  rank: number;
  title: string;
  savings: string;
  effort: string;
}): JSX.Element {
  return (
    <div className="flex items-center gap-4 rounded border border-axis-border bg-axis-surface px-4 py-3">
      <div className="font-mono text-xl font-bold text-axis-textDim">{rank}</div>
      <div className="flex-1">
        <div className="font-sans text-sm text-axis-text">{title}</div>
        <div className="mt-1 flex gap-2 font-mono text-[10px]">
          <span className="rounded bg-axis-warningSoft px-1.5 py-0.5 text-axis-warning">
            save {savings}
          </span>
          <span className="rounded bg-axis-muted px-1.5 py-0.5 text-axis-textMuted">
            {effort} to fix
          </span>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Privacy callout
// ===========================================================================

function PrivacyCallout(): JSX.Element {
  return (
    <section className="border-b border-axis-border py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-lg border border-axis-success/30 bg-axis-success/5 p-8 md:p-10">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-axis-success/20">
                <ShieldCheck className="h-6 w-6 text-axis-success" />
              </div>
            </div>
            <div>
              <h3 className="font-sans text-2xl font-bold text-axis-text">
                We never see your code.
              </h3>
              <p className="mt-3 leading-relaxed text-axis-textMuted">
                Burnd is <strong className="text-axis-text">local-first by default</strong>. The CLI runs entirely on your machine. It reads your session files, computes the leaks, and serves the dashboard from a localhost HTTP server. <strong className="text-axis-text">Zero data leaves your machine unless you explicitly opt in to the optional cloud sync</strong> (which doesn't exist yet — the v1 dashboard is 100% local).
              </p>
              <div className="mt-5 flex flex-col gap-2 font-mono text-xs text-axis-textMuted">
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-axis-success" />
                  <span>
                    Never uploaded: code, prompts, file contents, tool outputs, git branches, AI titles, file paths
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-axis-success" />
                  <span>Parser source code is public on GitHub — audit it yourself</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-axis-success" />
                  <span>CI tests assert no fake-secret markers leak (load-bearing privacy gate)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-axis-success" />
                  <span>
                    Full anonymization spec published at{' '}
                    <a
                      href="https://github.com/garvitsurana271/burnd/blob/main/notes/anonymization.md"
                      className="text-axis-accent hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      github.com/garvitsurana271/burnd
                    </a>
                  </span>
                </div>
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
  return (
    <section id="pricing" className="border-b border-axis-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="Pricing"
          title="Honest. Scrappy. Indian-first."
          subtitle="The CLI is free forever. The ebook is ₹399 (founding price). The SaaS tier is coming after I turn 18 and can set up a payment processor."
        />
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Free CLI */}
          <div className="flex flex-col rounded-lg border border-axis-border bg-axis-surface p-6">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-axis-textMuted">
              Free forever
            </div>
            <div className="font-sans text-2xl font-bold text-axis-text">CLI + Dashboard</div>
            <div className="mt-4 font-mono text-4xl font-bold text-axis-text">₹0</div>
            <div className="font-mono text-[11px] text-axis-textDim">MIT · open source · no signup</div>
            <ul className="mt-6 flex flex-col gap-2 text-xs text-axis-textMuted">
              {[
                'All 8 leak detectors',
                'Local-first web dashboard',
                '60-day spend chart',
                'Per-project cost breakdown',
                'Works offline, no account',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-axis-success" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <div className="rounded border border-axis-border bg-axis-bg px-3 py-2 text-center font-mono text-xs text-axis-text">
                npx burnd
              </div>
            </div>
          </div>

          {/* Ebook — RECOMMENDED */}
          <div className="relative flex flex-col rounded-lg border border-axis-accent bg-axis-accentSoft p-6 md:-my-4">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-axis-accent bg-axis-bg px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-axis-accent">
              Available now
            </div>
            <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-axis-accent">
              The ebook
            </div>
            <div className="font-sans text-2xl font-bold text-axis-text">Burning Tokens</div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-mono text-4xl font-bold text-axis-text">₹399</span>
              <span className="font-mono text-sm text-axis-textMuted line-through">₹999</span>
            </div>
            <div className="font-mono text-[11px] text-axis-textDim">
              founding · first 50 · raises to ₹599
            </div>
            <ul className="mt-6 flex flex-col gap-2 text-xs text-axis-textMuted">
              {[
                '7,400 words · 11 chapters',
                'Every detector with real data',
                'The 15-min weekly review',
                'Lifetime updates included',
                'Paid via UPI (instant)',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-axis-success" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <a
                href="#buy"
                className="flex items-center justify-center gap-2 rounded-md bg-axis-accent px-4 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-axis-accentHover"
              >
                Buy via UPI
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* SaaS Pro — COMING SOON */}
          <div className="flex flex-col rounded-lg border border-axis-border bg-axis-surface p-6 opacity-70">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-axis-textDim">
              Coming post-v2
            </div>
            <div className="font-sans text-2xl font-bold text-axis-text">Pro (cloud sync)</div>
            <div className="mt-4 font-mono text-4xl font-bold text-axis-text">$9/mo</div>
            <div className="font-mono text-[11px] text-axis-textDim">
              or $79 founding lifetime (50 seats)
            </div>
            <ul className="mt-6 flex flex-col gap-2 text-xs text-axis-textMuted">
              {[
                'Everything in CLI',
                'Cross-device sync via cloud',
                'Weekly leak reports by email',
                'Historical trend analysis',
                'Team dashboards (orgs)',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-axis-textMuted" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <div className="rounded border border-axis-border bg-axis-bg px-3 py-2 text-center font-mono text-xs text-axis-textDim">
                launching post-v2
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center font-mono text-[11px] text-axis-textDim">
          Note: Pro (SaaS) tier launches after I turn 18 and can register a merchant-of-record account. Until then, buy the ebook or use the free CLI + local dashboard.
        </div>
      </div>
    </section>
  );
}

// ===========================================================================
// Built by
// ===========================================================================

function BuiltBy(): JSX.Element {
  return (
    <section className="border-b border-axis-border py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-2 border-axis-accent bg-axis-accentSoft font-mono text-2xl font-bold text-axis-accent">
            GS
          </div>
          <div>
            <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-axis-textMuted">
              Built by
            </div>
            <h3 className="font-sans text-2xl font-bold text-axis-text">Garvit Surana</h3>
            <div className="mt-1 font-mono text-[11px] text-axis-textMuted">
              16 · Class 12 ISC · Guwahati, India
            </div>
            <p className="mt-4 max-w-xl leading-relaxed text-axis-textMuted">
              "I built Burnd because I spent $13,631 on Claude Code in six months and had no idea where any of it was going. I built the CLI for myself first. Then I found 8 patterns in my own data that were costing me real money. Now the CLI is free and open-source, and the book is how I'm funding the SaaS version I'll ship after my board exams in 2027."
            </p>
            <div className="mt-4 flex flex-wrap gap-4 font-mono text-xs">
              <a
                href="https://github.com/garvitsurana271"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-axis-textMuted transition-colors hover:text-axis-text"
              >
                <Github className="h-3.5 w-3.5" />
                github.com/garvitsurana271
              </a>
              <a
                href="https://twitter.com/GarvitSura5238"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-axis-textMuted transition-colors hover:text-axis-text"
              >
                𝕏 @GarvitSura5238 <span className="text-axis-textDim">(temp · upgrading soon)</span>
              </a>
              <a
                href="mailto:garvitsurana10@gmail.com"
                className="flex items-center gap-1.5 text-axis-textMuted transition-colors hover:text-axis-text"
              >
                ✉ garvitsurana10@gmail.com
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
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-2 font-mono text-[11px] text-axis-textDim">
            <Flame className="h-3.5 w-3.5 text-axis-accent" />
            burnd · built in Guwahati, India · shipped locally first
          </div>
          <div className="flex flex-wrap gap-5 font-mono text-[11px] text-axis-textMuted">
            <a
              href="https://github.com/garvitsurana271/burnd"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-axis-text"
            >
              github
            </a>
            <a
              href="https://github.com/garvitsurana271/burnd/blob/main/notes/anonymization.md"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-axis-text"
            >
              privacy spec
            </a>
            <a
              href="https://github.com/garvitsurana271/burnd/blob/main/docs/superpowers/specs/2026-04-11-burnd-design.md"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-axis-text"
            >
              design doc
            </a>
            <Link to="/app/insights" className="transition-colors hover:text-axis-text">
              dashboard →
            </Link>
          </div>
        </div>
        <div className="mt-6 font-mono text-[10px] text-axis-textDim">
          © 2026 Garvit Surana · MIT licensed · you owe me nothing and I owe you nothing
        </div>
      </div>
    </footer>
  );
}

// ===========================================================================
// Section header helper
// ===========================================================================

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}): JSX.Element {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="mb-3 font-mono text-[11px] uppercase tracking-wider text-axis-accent">
        {eyebrow}
      </div>
      <h2 className="font-sans text-3xl font-bold tracking-tight text-axis-text md:text-4xl">
        {title}
      </h2>
      <p className="mt-4 leading-relaxed text-axis-textMuted">{subtitle}</p>
    </div>
  );
}
