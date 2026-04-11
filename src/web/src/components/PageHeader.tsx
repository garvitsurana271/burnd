import { type ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps): JSX.Element {
  return (
    <header className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-axis-textMuted">
            {eyebrow}
          </div>
        )}
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-axis-text">{title}</h1>
        {subtitle && (
          <p className="mt-1 max-w-2xl text-sm text-axis-textMuted">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
