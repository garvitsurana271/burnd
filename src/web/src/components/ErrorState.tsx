import { AlertTriangle, RefreshCw, Github } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps): JSX.Element {
  const looksLikeNotRunning =
    error.toLowerCase().includes('failed to fetch') ||
    error.toLowerCase().includes('networkerror') ||
    error.toLowerCase().includes('connection') ||
    error.toLowerCase().includes('fetch') ||
    error.toLowerCase().includes('not valid json') ||
    error.toLowerCase().includes('doctype');

  return (
    <div className="animate-fade-in rounded-lg border border-axis-danger/40 bg-axis-dangerSoft p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-axis-danger/40 bg-axis-danger/10">
          <AlertTriangle className="h-5 w-5 text-axis-danger" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h2 className="font-sans text-lg font-semibold text-axis-text">
            The dashboard couldn't reach burnd
          </h2>
          <p className="mt-1 text-sm text-axis-textMuted">
            {looksLikeNotRunning ? (
              <>
                It looks like <code className="rounded bg-axis-muted px-1.5 py-0.5 font-mono text-xs text-axis-text">burnd serve</code> isn't running, or isn't on port 4711.
              </>
            ) : (
              <>The request to <code className="rounded bg-axis-muted px-1.5 py-0.5 font-mono text-xs text-axis-text">/api/snapshot</code> failed.</>
            )}
          </p>

          <div className="mt-4 rounded border border-axis-border bg-axis-surface p-3 font-mono text-[11px] text-axis-textMuted">
            <div className="mb-1 uppercase tracking-wider text-axis-textDim">Error</div>
            {error}
          </div>

          {looksLikeNotRunning && (
            <div className="mt-5">
              <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-axis-textDim">
                Try this
              </div>
              <div className="rounded border border-axis-border bg-axis-surface p-3 font-mono text-xs text-axis-text">
                <div className="text-axis-textMuted"># in a new terminal, from anywhere:</div>
                <div className="mt-1">$ npx getburnd serve</div>
              </div>
              <p className="mt-2 text-[11px] text-axis-textMuted">
                Then come back to this page and click the retry button below. Burnd serves the dashboard from a local HTTP server on your own machine — nothing runs in the cloud.
              </p>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-md border border-axis-accent bg-axis-accent/20 px-4 py-2 font-mono text-xs text-axis-text transition-colors hover:bg-axis-accent/30"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
            <a
              href="https://github.com/garvitsurana271/burnd/issues"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] text-axis-textMuted transition-colors hover:text-axis-text"
            >
              <Github className="h-3.5 w-3.5" />
              Report a bug
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
