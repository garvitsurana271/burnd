import { useState } from 'react';
import { ChevronDown, Clock, DollarSign, Target } from 'lucide-react';
import type { InsightView, SnapshotView } from '../lib/snapshot.js';
import { PageHeader } from '../components/PageHeader.js';
import { Card } from '../components/Card.js';
import { formatUsd, shortProjectName } from '../lib/format.js';

interface InsightsPageProps {
  snapshot: SnapshotView;
}

const DETECTOR_LABELS: Record<string, string> = {
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
  const filteredInsights = filterDetector
    ? allInsights.filter((i) => i.detectorId === filterDetector)
    : allInsights;
  const totalSavings = filteredInsights.reduce((acc, i) => acc + i.savingsEstimateUsd, 0);

  // Detector counts for the filter chips.
  const detectorCounts = new Map<string, number>();
  for (const insight of allInsights) {
    detectorCounts.set(
      insight.detectorId,
      (detectorCounts.get(insight.detectorId) ?? 0) + 1,
    );
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
            <InsightCard key={insight.id} insight={insight} rank={idx + 1} />
          ))
        )}
      </div>
    </div>
  );
}

function InsightCard({ insight, rank }: { insight: InsightView; rank: number }): JSX.Element {
  const [expanded, setExpanded] = useState(rank <= 3); // Top 3 expanded by default.

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
        </div>
      )}
    </Card>
  );
}
