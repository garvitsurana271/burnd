import { PageHeader } from '../components/PageHeader.js';
import { Card } from '../components/Card.js';
import type { SnapshotView } from '../lib/snapshot.js';
import { formatUsd } from '../lib/format.js';

interface ProjectsPageProps {
  snapshot: SnapshotView;
}

export function ProjectsPage({ snapshot }: ProjectsPageProps): JSX.Element {
  const projects = snapshot.projects;
  const maxCost = Math.max(...projects.map((p) => p.totalCostUsd), 1);

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="By project"
        title="Projects"
        subtitle={`${projects.length} projects, sorted by total spend. Leak score is the sum of detector savings for sessions in each project — higher = more wasted spend.`}
      />
      <Card className="!p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-axis-border">
              <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
                Project
              </th>
              <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
                Sessions
              </th>
              <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
                Total spend
              </th>
              <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
                Leak score
              </th>
              <th className="w-[35%] px-5 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
                Spend share
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => (
              <tr
                key={p.projectDir}
                className={`border-b border-axis-border/60 transition-colors hover:bg-axis-muted ${
                  i % 2 === 0 ? '' : 'bg-axis-bg/30'
                }`}
              >
                <td className="px-5 py-3 font-sans text-sm font-medium text-axis-text">
                  {p.displayName}
                </td>
                <td className="px-5 py-3 text-right font-mono text-sm text-axis-textMuted">
                  {p.sessionCount}
                </td>
                <td className="px-5 py-3 text-right font-mono text-sm font-semibold text-axis-text">
                  {formatUsd(p.totalCostUsd)}
                </td>
                <td className="px-5 py-3 text-right font-mono text-sm">
                  {p.leakScoreUsd > 0.01 ? (
                    <span className="text-axis-warning">{formatUsd(p.leakScoreUsd)}</span>
                  ) : (
                    <span className="text-axis-textDim">—</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="h-1.5 w-full rounded-full bg-axis-muted">
                    <div
                      className="h-1.5 rounded-full bg-axis-accent"
                      style={{ width: `${(p.totalCostUsd / maxCost) * 100}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
