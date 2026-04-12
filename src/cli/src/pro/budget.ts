import kleur from 'kleur';
import type { SessionStats } from '../session.js';
import type { BurndConfig } from '../license.js';

export interface BudgetStatus {
  weeklyBudgetUsd: number;
  weeklyBudgetLocal: number;
  currency: string;
  spentThisWeekUsd: number;
  spentThisWeekLocal: number;
  remainingUsd: number;
  remainingLocal: number;
  paceMultiplier: number;
  daysIntoWeek: number;
  onTrackToExceed: boolean;
  projectedWeeklyUsd: number;
}

export function computeBudget(allStats: SessionStats[], config: BurndConfig): BudgetStatus | null {
  const budget = config.weeklyBudgetUsd;
  if (!budget || budget <= 0) return null;

  const rate = config.exchangeRate ?? 83.5;
  const currency = config.currency ?? 'INR';

  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysIntoWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - daysIntoWeek + 1);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartIso = weekStart.toISOString();

  const spentThisWeekUsd = allStats
    .filter((s) => (s.startedAt ?? '') >= weekStartIso)
    .reduce((acc, s) => acc + s.totalCostUsd, 0);

  const dailyRate = daysIntoWeek > 0 ? spentThisWeekUsd / daysIntoWeek : 0;
  const projectedWeeklyUsd = dailyRate * 7;
  const paceMultiplier = budget > 0 ? projectedWeeklyUsd / budget : 0;
  const onTrackToExceed = projectedWeeklyUsd > budget;

  const remainingUsd = Math.max(0, budget - spentThisWeekUsd);

  return {
    weeklyBudgetUsd: budget,
    weeklyBudgetLocal: budget * rate,
    currency: currency === 'INR' ? '₹' : '$',
    spentThisWeekUsd,
    spentThisWeekLocal: spentThisWeekUsd * rate,
    remainingUsd,
    remainingLocal: remainingUsd * rate,
    paceMultiplier,
    daysIntoWeek,
    onTrackToExceed,
    projectedWeeklyUsd,
  };
}

export function printBudget(status: BudgetStatus): void {
  process.stdout.write('\n');
  process.stdout.write(kleur.bold().yellow('  ⚡ BurndPro') + kleur.dim(' — Weekly Budget Tracker\n'));
  process.stdout.write(kleur.dim('  ─────────────────────────────────────────────────────────────\n\n'));

  const fmt = (usd: number, local: number, sym: string) =>
    `${kleur.bold('$' + usd.toFixed(2))} ${kleur.dim(`(${sym}${Math.round(local)})`)}`;

  process.stdout.write(`  Budget:     ${fmt(status.weeklyBudgetUsd, status.weeklyBudgetLocal, status.currency)}/week\n`);
  process.stdout.write(`  Spent:      ${fmt(status.spentThisWeekUsd, status.spentThisWeekLocal, status.currency)} (${status.daysIntoWeek}/7 days)\n`);

  const remainColor = status.onTrackToExceed ? kleur.bold().red : kleur.bold().green;
  process.stdout.write(`  Remaining:  ${remainColor('$' + status.remainingUsd.toFixed(2))} ${kleur.dim(`(${status.currency}${Math.round(status.remainingLocal)})`)}\n`);

  process.stdout.write('\n');

  if (status.onTrackToExceed) {
    const overBy = status.projectedWeeklyUsd - status.weeklyBudgetUsd;
    process.stdout.write(
      kleur.bold().red('  ⚠  On pace to EXCEED budget by $' + overBy.toFixed(2)) +
      kleur.dim(` (${status.paceMultiplier.toFixed(1)}x your limit)\n`),
    );
    process.stdout.write(kleur.dim('     Fix your top leaks above to get back on track.\n'));
  } else {
    const pct = Math.round((1 - status.paceMultiplier) * 100);
    process.stdout.write(
      kleur.bold().green(`  ✓  On track — ${pct}% under budget`) +
      kleur.dim(` (projected: $${status.projectedWeeklyUsd.toFixed(2)}/week)\n`),
    );
  }

  process.stdout.write('\n');
}
