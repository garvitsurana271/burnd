import { PageHeader } from '../components/PageHeader.js';
import { Card } from '../components/Card.js';
import type { SnapshotView } from '../lib/snapshot.js';
import { formatBytes } from '../lib/format.js';

interface ToolsPageProps {
  snapshot: SnapshotView;
}

export function ToolsPage({ snapshot }: ToolsPageProps): JSX.Element {
  const tools = snapshot.tools;
  const maxCalls = Math.max(...tools.map((t) => t.totalCalls), 1);

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="By tool"
        title="Tools"
        subtitle={`${tools.length} distinct tools observed across your sessions. Error rates above 20% are highlighted — those are likely thrash hotspots.`}
      />
      <Card className="!p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-axis-border">
              <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
                Tool
              </th>
              <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
                Calls
              </th>
              <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
                Output
              </th>
              <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
                Errors
              </th>
              <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
                Error rate
              </th>
              <th className="w-[28%] px-5 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-axis-textMuted">
                Frequency
              </th>
            </tr>
          </thead>
          <tbody>
            {tools.map((t, i) => (
              <tr
                key={t.toolName}
                className={`border-b border-axis-border/60 transition-colors hover:bg-axis-muted ${
                  i % 2 === 0 ? '' : 'bg-axis-bg/30'
                }`}
              >
                <td className="px-5 py-3 font-mono text-sm font-medium text-axis-text">
                  {t.toolName}
                </td>
                <td className="px-5 py-3 text-right font-mono text-sm text-axis-text">
                  {t.totalCalls.toLocaleString()}
                </td>
                <td className="px-5 py-3 text-right font-mono text-sm text-axis-textMuted">
                  {formatBytes(t.totalOutputBytes)}
                </td>
                <td className="px-5 py-3 text-right font-mono text-sm">
                  {t.totalErrors > 0 ? (
                    <span className="text-axis-danger">{t.totalErrors}</span>
                  ) : (
                    <span className="text-axis-textDim">0</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right font-mono text-sm">
                  {t.errorRate >= 0.2 ? (
                    <span className="text-axis-danger">{(t.errorRate * 100).toFixed(0)}%</span>
                  ) : (
                    <span className="text-axis-textMuted">{(t.errorRate * 100).toFixed(0)}%</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="h-1.5 w-full rounded-full bg-axis-muted">
                    <div
                      className="h-1.5 rounded-full bg-axis-accent"
                      style={{ width: `${(t.totalCalls / maxCalls) * 100}%` }}
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
