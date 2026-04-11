import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps): JSX.Element {
  return (
    <div
      className={`rounded-lg border border-axis-border bg-axis-surface p-5 ${className}`}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'warning' | 'success' | 'danger';
}

export function StatCard({ label, value, hint, tone = 'default' }: StatCardProps): JSX.Element {
  const toneClass = {
    default: 'text-axis-text',
    warning: 'text-axis-warning',
    success: 'text-axis-success',
    danger: 'text-axis-danger',
  }[tone];
  return (
    <Card>
      <div className="font-mono text-[11px] uppercase tracking-wider text-axis-textMuted">
        {label}
      </div>
      <div className={`mt-2 font-mono text-2xl font-semibold tracking-tight ${toneClass}`}>
        {value}
      </div>
      {hint && (
        <div className="mt-1.5 font-mono text-[11px] text-axis-textDim">{hint}</div>
      )}
    </Card>
  );
}
