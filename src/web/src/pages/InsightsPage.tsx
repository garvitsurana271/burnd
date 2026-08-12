import { useState, Fragment } from 'react';
import { ChevronDown, Clock, DollarSign, Target, Zap, TrendingDown, Copy, Check, Terminal } from 'lucide-react';
import type { InsightView, SnapshotView } from '../lib/snapshot.js';
import { PageHeader } from '../components/PageHeader.js';
import { Card } from '../components/Card.js';
import { formatUsd, shortProjectName } from '../lib/format.js';

interface DetectorRollup {
  sessionCount: number;       // how many sessions this detector fired on (all-time)
  totalSavingsUsd: number;    // sum of savingsEstimateUsd across all sessions
  last30DaysSavingsUsd: number; // subset — last 30 days only (placeholder, same as total for now)
}

interface InsightsPageProps {
  snapshot: SnapshotView;
}

const DETECTOR_LABELS: Record<string, string> = {
  'model-substitution': 'Opus → Sonnet swap',
  'long-bash-output': 'Long Bash output',
  'repeated-read': 'Repeated reads',
  thrash: 'Tool error storm',
  'tool-overuse': 'Tool overuse',
  'tired-coding': 'Late-night coding',
  'retry-storm': 'API retry storm',
  'skill-firing': 'Skill firing',
  'project-cost-outlier': 'Project cost outlier',
};

export function InsightsPage({ snapshot }: InsightsPageProps): JSX.Element {
  const [filterDetector, setFilterDetector] = useState<string | null>(null);

  const allInsights = snapshot.insights;

  // When no filter is active, interleave detector types so a single noisy
  // detector (e.g. model-substitution) can't crowd out every other insight.
  // Within each detector bucket, insights are already sorted by savings desc.
  // When a filter is active, show all matching insights in savings order.
  const filteredInsights = filterDetector
    ? allInsights.filter((i) => i.detectorId === filterDetector)
    : diversitySort(allInsights);

  const totalSavings = filteredInsights.reduce((acc, i) => acc + i.savingsEstimateUsd, 0);

  // Detector counts for the filter chips.
  const detectorCounts = new Map<string, number>();
  for (const insight of allInsights) {
    detectorCounts.set(
      insight.detectorId,
      (detectorCounts.get(insight.detectorId) ?? 0) + 1,
    );
  }

  // "If fixed" simulator: aggregate all-time savings per detector across every session.
  // This shows free users exactly how much they would have saved if they'd fixed a leak
  // on day 1 — making the Pro ROI concrete before they've paid anything.
  const detectorRollup = new Map<string, DetectorRollup>();
  for (const insight of allInsights) {
    const existing = detectorRollup.get(insight.detectorId) ?? {
      sessionCount: 0,
      totalSavingsUsd: 0,
      last30DaysSavingsUsd: 0,
    };
    existing.sessionCount += 1;
    existing.totalSavingsUsd += insight.savingsEstimateUsd;
    // We don't have per-insight timestamps on the client, so last30Days ≈ total for now.
    // (A future CLI change can add `detectedAt` to insights to make this precise.)
    existing.last30DaysSavingsUsd += insight.savingsEstimateUsd;
    detectorRollup.set(insight.detectorId, existing);
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="The leaks"
        title="Find what's burning your AI budget"
        subtitle={`${allInsights.length} insights across your sessions, sorted by estimated savings. Each leak has a dollar value and a fix you can apply in minutes.`}
      />

      {/* Top-level totals row */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-axis-textMuted">
            <DollarSign className="h-3.5 w-3.5" />
            Potential savings
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold tracking-tight text-axis-warning">
            {formatUsd(totalSavings)}
          </div>
          <div className="mt-1.5 font-mono text-[11px] text-axis-textDim">
            across {filteredInsights.length} insights
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-axis-textMuted">
            <Target className="h-3.5 w-3.5" />
            Top single fix
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold tracking-tight text-axis-success">
            {filteredInsights[0] ? formatUsd(filteredInsights[0].savingsEstimateUsd) : '$0'}
          </div>
          <div className="mt-1.5 truncate font-mono text-[11px] text-axis-textDim">
            {filteredInsights[0]
              ? DETECTOR_LABELS[filteredInsights[0].detectorId] ?? filteredInsights[0].detectorId
              : '—'}
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-axis-textMuted">
            <Clock className="h-3.5 w-3.5" />
            Total fix effort
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold tracking-tight text-axis-text">
            {filteredInsights.reduce((acc, i) => acc + i.effortMinutes, 0)} min
          </div>
          <div className="mt-1.5 font-mono text-[11px] text-axis-textDim">
            sum of effort estimates
          </div>
        </Card>
      </div>

      {/* Detector filter chips */}
      <div className="mb-5 flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setFilterDetector(null)}
          className={`rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors ${
            filterDetector === null
              ? 'border-axis-accent bg-axis-accentSoft text-axis-text'
              : 'border-axis-border bg-axis-surface text-axis-textMuted hover:border-axis-muted hover:text-axis-text'
          }`}
        >
          all ({allInsights.length})
        </button>
        {[...detectorCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([id, count]) => (
            <button
              key={id}
              onClick={() => setFilterDetector(id)}
              className={`rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors ${
                filterDetector === id
                  ? 'border-axis-accent bg-axis-accentSoft text-axis-text'
                  : 'border-axis-border bg-axis-surface text-axis-textMuted hover:border-axis-muted hover:text-axis-text'
              }`}
            >
              {DETECTOR_LABELS[id] ?? id} ({count})
            </button>
          ))}
      </div>

      {/* Insights list */}
      <div className="flex flex-col gap-3">
        {filteredInsights.length === 0 ? (
          <Card>
            <div className="font-mono text-sm text-axis-success">
              ✓ No leaks detected. Your spend is clean.
            </div>
          </Card>
        ) : (
          filteredInsights.map((insight, idx) => (
            <Fragment key={insight.id}>
              <InsightCard
                insight={insight}
                rank={idx + 1}
                rollup={detectorRollup.get(insight.detectorId)}
              />
            </Fragment>
          ))
        )}
      </div>
    </div>
  );
}

// Round-robin across detector buckets so one noisy detector never fills the
// whole list. Within each bucket, insights are sorted by savings desc.
function diversitySort(insights: InsightView[]): InsightView[] {
  const byDetector = new Map<string, InsightView[]>();
  for (const insight of insights) {
    const bucket = byDetector.get(insight.detectorId) ?? [];
    bucket.push(insight);
    byDetector.set(insight.detectorId, bucket);
  }
  // Sort buckets: highest top-savings detector leads each round.
  const buckets = [...byDetector.values()].sort(
    (a, b) => (b[0]?.savingsEstimateUsd ?? 0) - (a[0]?.savingsEstimateUsd ?? 0),
  );
  const result: InsightView[] = [];
  let round = 0;
  while (result.length < insights.length) {
    let added = 0;
    for (const bucket of buckets) {
      const item = bucket[round];
      if (item) { result.push(item); added++; }
    }
    if (added === 0) break;
    round++;
  }
  return result;
}

function ApplyPatchButton({ projectDir, patch }: { projectDir: string; patch: string }): JSX.Element {
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const handleApply = async () => {
    setState('loading');
    try {
      const res = await fetch('/api/apply-patch', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ projectDir, patch }),
      });
      const json = await res.json() as { ok?: boolean; error?: string; message?: string };
      if (json.ok) {
        setState('ok');
        setTimeout(() => setState('idle'), 3000);
      } else {
        setErrMsg(json.error ?? 'Unknown error');
        setState('err');
        setTimeout(() => setState('idle'), 4000);
      }
    } catch (e) {
      setErrMsg('Network error — is burnd serve running?');
      setState('err');
      setTimeout(() => setState('idle'), 4000);
    }
  };

  if (state === 'ok') {
    return (
      <span className="flex items-center gap-1 rounded px-2 py-1 font-mono text-[10px] text-axis-success">
        <Check className="h-3 w-3" /> Applied!
      </span>
    );
  }
  if (state === 'err') {
    return (
      <span className="flex items-center gap-1 rounded px-2 py-1 font-mono text-[10px] text-red-400">
        <Terminal className="h-3 w-3" /> {errMsg.slice(0, 40)}
      </span>
    );
  }

  return (
    <button
      onClick={() => void handleApply()}
      disabled={state === 'loading'}
      className="flex items-center gap-1 rounded border border-green-700/40 bg-green-950/30 px-2 py-1 font-mono text-[10px] text-green-400 transition-colors hover:border-green-600/60 hover:bg-green-950/50 disabled:opacity-50"
      title="Auto-apply this patch to your project's CLAUDE.md"
    >
      <Terminal className="h-3 w-3" />
      {state === 'loading' ? 'applying…' : 'Apply to CLAUDE.md'}
    </button>
  );
}

function CopyButton({ text }: { text: string }): JSX.Element {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 rounded px-2 py-1 font-mono text-[10px] text-axis-textMuted transition-colors hover:bg-axis-muted hover:text-axis-text"
      title="Copy to clipboard"
    >
      {copied ? <Check className="h-3 w-3 text-axis-success" /> : <Copy className="h-3 w-3" />}
      {copied ? 'copied!' : 'copy'}
    </button>
  );
}

function InsightCard({
  insight,
  rank,
  rollup,
}: {
  insight: InsightView;
  rank: number;
  rollup: DetectorRollup | undefined;
}): JSX.Element {
  const [expanded, setExpanded] = useState(rank <= 3);

  return (
    <Card className="animate-slide-up">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-4 text-left"
      >
        <div className="font-mono text-2xl font-semibold tracking-tight text-axis-textDim">
          {rank}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-3">
            <h3 className="font-sans text-base font-semibold text-axis-text">{insight.title}</h3>
          </div>
          <div className="mt-1.5 flex items-center gap-3 font-mono text-[11px]">
            <span className="rounded bg-axis-warningSoft px-1.5 py-0.5 text-axis-warning">
              save {formatUsd(insight.savingsEstimateUsd)}
            </span>
            {rollup && rollup.sessionCount > 1 && (
              <span className="rounded bg-red-950/60 px-1.5 py-0.5 text-red-400">
                {rollup.sessionCount} sessions affected
              </span>
            )}
            <span className="rounded bg-axis-muted px-1.5 py-0.5 text-axis-textMuted">
              ~{insight.effortMinutes} min
            </span>
            <span className="text-axis-textDim">
              project: {shortProjectName(insight.projectDir)}
            </span>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-axis-textMuted transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="mt-4 border-t border-axis-border pt-4">
          <p className="text-sm leading-relaxed text-axis-textMuted">{insight.description}</p>

          {/* Basic fix steps — visible to all users */}
          <div className="mt-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-axis-textDim">
              How to fix
            </div>
            <ol className="mt-2 flex flex-col gap-1.5 text-sm text-axis-text">
              {insight.fixSteps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-mono text-axis-textDim">{i + 1}.</span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* "If fixed" simulator — historical damage from this leak pattern,
              to make the cost of inaction concrete. */}
          {rollup && rollup.sessionCount > 1 && (
            <div className="mt-5 rounded-md border border-red-900/40 bg-red-950/20 p-4">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-red-400">
                <TrendingDown className="h-3 w-3" />
                If fixed on day 1 — what you would have saved
              </div>
              <div className="mt-3 flex items-end gap-6">
                <div>
                  <div className="font-mono text-2xl font-semibold tracking-tight text-red-300">
                    {formatUsd(rollup.totalSavingsUsd)}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-red-400/70">
                    across {rollup.sessionCount} affected sessions
                  </div>
                </div>
                <div className="mb-0.5 font-mono text-[11px] text-axis-textDim leading-relaxed">
                  This leak pattern fired {rollup.sessionCount} times in your history.
                  Fix it with the session-specific steps below.
                </div>
              </div>
            </div>
          )}

          {/* Session-specific deep analysis. This used to be Pro-gated behind a
              blurred paywall; every feature is free as of 0.1.0. */}
          {insight.detailedFixSteps.length > 0 && (
            <div className="mt-5 rounded-md border border-axis-accent/30 bg-axis-accentSoft/30 p-4">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-axis-accent">
                <Zap className="h-3 w-3" />
                Session-specific deep analysis
              </div>
              <ol className="mt-3 flex flex-col gap-2 text-sm text-axis-text">
                {insight.detailedFixSteps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-0.5 font-mono text-axis-accent/60">{i + 1}.</span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>

              {/* CLAUDE.md Auto-Patcher */}
              {insight.claudeMdPatch && (
                <div className="mt-4 rounded-md border border-green-800/40 bg-green-950/30">
                  <div className="flex items-center justify-between border-b border-green-800/30 px-3 py-2">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-green-400">
                      CLAUDE.md patch
                    </div>
                    <div className="flex items-center gap-2">
                      <CopyButton text={insight.claudeMdPatch} />
                      <ApplyPatchButton projectDir={insight.projectDir} patch={insight.claudeMdPatch} />
                    </div>
                  </div>
                  <pre className="overflow-x-auto px-3 py-3 font-mono text-[12px] leading-relaxed text-green-300">
                    {insight.claudeMdPatch}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
