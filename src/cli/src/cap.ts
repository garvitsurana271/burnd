// `burnd cap` — subscription tracking.
//
// Reads this calendar month's session spend (already computed by every detector
// + insight), compares against the user's stated Claude plan API-equivalent
// cap, renders a horizontal progress bar with projected limit-hit date.
//
// Free tier feature. Available to anyone running `burnd cap`.
// CodeBurn ships a similar "Subscription Tracking" with menu-bar live updates;
// we ship the same insight in the CLI without the menu bar, on the assumption
// that anyone who runs Burnd already lives in a terminal.

import kleur from 'kleur';
import type { SessionStats } from './session.js';

// Anthropic's documented plan API-equivalent caps as of 2026-05-14.
// These are the Pro / Max prices, not the actual API consumption budget
// — but they're useful as a 'what would I have paid pay-as-you-go' anchor,
// which is the headline number Anthropic itself shows in /usage.
export const PLAN_CAPS: Record<string, { label: string; capUsd: number }> = {
  pro:    { label: 'Pro ($20/mo)',         capUsd: 20 },
  max5:   { label: 'Max 5x ($100/mo)',     capUsd: 100 },
  max20:  { label: 'Max 20x ($200/mo)',    capUsd: 200 },
  team:   { label: 'Team Premium ($100/seat)', capUsd: 100 },
};

export interface CapStatus {
  planKey: string;
  planLabel: string;
  capUsd: number;
  spentUsd: number;
  remainingUsd: number;
  pctUsed: number;
  daysIntoMonth: number;
  daysInMonth: number;
  dailyRateUsd: number;
  projectedMonthlyUsd: number;
  projectedHitDate: Date | null;  // null = won't hit cap this month
  status: 'safe' | 'watch' | 'danger' | 'over';
}

export function computeCapStatus(
  allStats: readonly SessionStats[],
  planKey: string,
  now: Date = new Date(),
): CapStatus {
  const plan = PLAN_CAPS[planKey] ?? PLAN_CAPS['max5']!;

  // Start-of-month boundary in user's local time.
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  monthEnd.setHours(23, 59, 59, 999);
  const daysInMonth = monthEnd.getDate();
  const daysIntoMonth = Math.max(1, now.getDate());

  // Sum spend from sessions started this calendar month.
  const monthStartIso = monthStart.toISOString();
  const spentUsd = allStats
    .filter((s) => (s.startedAt ?? '') >= monthStartIso)
    .reduce((acc, s) => acc + s.totalCostUsd, 0);

  const pctUsed = plan.capUsd > 0 ? (spentUsd / plan.capUsd) * 100 : 0;
  const remainingUsd = Math.max(0, plan.capUsd - spentUsd);

  // Project monthly spend at current pace.
  const dailyRateUsd = daysIntoMonth > 0 ? spentUsd / daysIntoMonth : 0;
  const projectedMonthlyUsd = dailyRateUsd * daysInMonth;

  // Projected hit date: when does cumulative spend = capUsd?
  // hitDay = capUsd / dailyRateUsd  (days from month-start)
  let projectedHitDate: Date | null = null;
  if (dailyRateUsd > 0 && remainingUsd > 0) {
    const daysUntilHit = remainingUsd / dailyRateUsd;
    const hitDate = new Date(now);
    hitDate.setDate(hitDate.getDate() + Math.ceil(daysUntilHit));
    if (hitDate <= monthEnd) {
      projectedHitDate = hitDate;
    }
  } else if (remainingUsd <= 0) {
    // Already over cap. Hit date is the day we passed it (approximate).
    const dayHit = Math.min(daysInMonth, Math.ceil(plan.capUsd / Math.max(dailyRateUsd, 0.01)));
    const hitDate = new Date(monthStart);
    hitDate.setDate(dayHit);
    projectedHitDate = hitDate;
  }

  // Bucket the status. Color-code is the leverage here.
  let status: CapStatus['status'];
  if (pctUsed >= 100) status = 'over';
  else if (pctUsed >= 90) status = 'danger';
  else if (pctUsed >= 60) status = 'watch';
  else status = 'safe';

  return {
    planKey,
    planLabel: plan.label,
    capUsd: plan.capUsd,
    spentUsd,
    remainingUsd,
    pctUsed,
    daysIntoMonth,
    daysInMonth,
    dailyRateUsd,
    projectedMonthlyUsd,
    projectedHitDate,
    status,
  };
}

// Visual horizontal progress bar. 40 cells wide, filled-empty.
function renderBar(pct: number, status: CapStatus['status'], width = 40): string {
  const clamped = Math.max(0, Math.min(100, pct));
  const filled = Math.floor((clamped / 100) * width);
  const empty = width - filled;
  const color =
    status === 'over' ? kleur.red :
    status === 'danger' ? kleur.red :
    status === 'watch' ? kleur.yellow :
    kleur.green;
  return color('█'.repeat(filled)) + kleur.dim('░'.repeat(empty));
}

function fmtUsd(n: number): string {
  return '$' + n.toFixed(2);
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function printCapStatus(status: CapStatus): void {
  const o = process.stdout;
  o.write('\n');
  o.write(kleur.bold().yellow('  burnd cap') + kleur.dim(' — subscription burn-rate\n'));
  o.write(kleur.dim('  ─────────────────────────────────────────────────────────────\n\n'));

  // Plan + headline numbers
  o.write(`  Plan: ${kleur.bold(status.planLabel)}\n`);
  o.write(`  Month: day ${kleur.cyan(String(status.daysIntoMonth))} of ${kleur.cyan(String(status.daysInMonth))}\n`);
  o.write('\n');

  // Progress bar — the focal piece
  const bar = renderBar(status.pctUsed, status.status);
  const pctStr = status.pctUsed.toFixed(1) + '%';
  const pctColor =
    status.status === 'over' ? kleur.bold().red :
    status.status === 'danger' ? kleur.bold().red :
    status.status === 'watch' ? kleur.bold().yellow :
    kleur.bold().green;
  o.write(`  ${bar} ${pctColor(pctStr)}\n`);
  o.write(`  ${kleur.dim(fmtUsd(status.spentUsd))} ${kleur.dim('of')} ${kleur.dim(fmtUsd(status.capUsd))} ${kleur.dim('used')}` +
          `   ${kleur.dim(fmtUsd(status.remainingUsd))} ${kleur.dim('remaining')}\n`);
  o.write('\n');

  // Projection
  if (status.dailyRateUsd <= 0) {
    o.write(kleur.dim('  No spend recorded this month yet. Status check only.\n\n'));
    return;
  }

  const rateStr = fmtUsd(status.dailyRateUsd) + '/day';
  o.write(`  Current pace: ${kleur.bold(rateStr)}` +
          `   Projected month-end: ${kleur.bold(fmtUsd(status.projectedMonthlyUsd))}\n`);

  if (status.status === 'over') {
    o.write('\n');
    o.write(kleur.bold().red(`  ⚠ You are already past the ${status.planLabel} cap.\n`));
    o.write(kleur.dim(`    The API-equivalent overage so far: ${fmtUsd(status.spentUsd - status.capUsd)}.\n`));
    o.write(kleur.dim('    Run `npx getburnd` to see which sessions drove it.\n'));
  } else if (status.projectedHitDate) {
    o.write('\n');
    const hitStr = fmtDate(status.projectedHitDate);
    if (status.status === 'danger') {
      o.write(kleur.bold().red(`  ⚠ At current pace you hit the cap on ${hitStr}.\n`));
    } else if (status.status === 'watch') {
      o.write(kleur.bold().yellow(`  ⚠ At current pace you hit the cap on ${hitStr}.\n`));
    } else {
      o.write(kleur.dim(`  At current pace you hit the cap on ${hitStr}.\n`));
    }
    o.write(kleur.dim('  Run `npx getburnd` to find which patterns are driving the burn.\n'));
  } else {
    o.write('\n');
    o.write(kleur.bold().green(`  ✓ On track. Projected ${fmtUsd(status.projectedMonthlyUsd)} of ${fmtUsd(status.capUsd)} cap.\n`));
  }

  o.write('\n');
}

// Find the --plan flag value from CLI args, defaulting to 'max5'.
// Accepts: pro, max5, max20, team. Anything else falls back.
export function parsePlanFlag(argv: readonly string[]): string {
  const i = argv.indexOf('--plan');
  if (i < 0 || i === argv.length - 1) return 'max5';
  const raw = (argv[i + 1] ?? '').toLowerCase();
  return PLAN_CAPS[raw] ? raw : 'max5';
}
