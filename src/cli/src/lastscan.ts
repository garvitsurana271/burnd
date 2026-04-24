// Last-scan persistence — free tier feature.
//
// After every scan, we write a lightweight summary to ~/.burnd/last-scan.json.
// On the *next* scan, we read it back and compute a delta: spend up/down,
// new leaks, fixed leaks. This is the core "one-and-done" fix — users who
// run burnd twice actually see whether their fixes worked.
//
// Design constraints:
//   - Available on free tier (not Pro-gated). The delta is the hook that
//     brings users back. Pro is the thing they upgrade to once they're back.
//   - No PII, no session IDs, no project paths in the stored JSON.
//   - File stays small (<2KB) regardless of how many sessions the user has.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import kleur from 'kleur';

export interface LastScan {
  // ISO date of the scan (UTC, YYYY-MM-DD).
  date: string;
  // Spend totals at scan time.
  totalCostUsdAllTime: number;
  totalCostUsdLast7Days: number;
  // Sessions & files counted.
  sessionsScanned: number;
  filesScanned: number;
  // Top 5 leak detector IDs that were active at scan time.
  // We use these to detect "fixed" vs "returned" vs "new" leaks.
  activeDetectorIds: string[];
  // Sum of all potential savings at scan time.
  potentialSavingsUsd: number;
}

function lastScanPath(): string {
  return join(homedir(), '.burnd', 'last-scan.json');
}

export function readLastScan(): LastScan | null {
  const p = lastScanPath();
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf-8')) as LastScan;
  } catch {
    return null;
  }
}

export function writeLastScan(scan: LastScan): void {
  writeFileSync(lastScanPath(), JSON.stringify(scan, null, 2) + '\n', 'utf-8');
}

export interface ScanDelta {
  // Days between last scan and now (fractional).
  daysSince: number;
  // Spend change over the period (can be negative = spend went down).
  spendDeltaUsd: number;
  spendDeltaPct: number;
  // How many detector IDs disappeared (fixed) vs appeared (new).
  fixedCount: number;
  newCount: number;
  returnedCount: number;
  // The actual sets for detailed messaging.
  fixedIds: string[];
  newIds: string[];
}

export function computeDelta(last: LastScan, current: {
  totalCostUsdLast7Days: number;
  activeDetectorIds: string[];
  potentialSavingsUsd: number;
}): ScanDelta {
  const lastMs = new Date(last.date).getTime();
  const nowMs = Date.now();
  const daysSince = (nowMs - lastMs) / (1000 * 60 * 60 * 24);

  const lastSet = new Set(last.activeDetectorIds);
  const currSet = new Set(current.activeDetectorIds);

  const fixedIds = last.activeDetectorIds.filter((id) => !currSet.has(id));
  const newIds = current.activeDetectorIds.filter((id) => !lastSet.has(id));
  // "Returned" = a detector that was fixed between two previous scans
  // but we can't track that with only one prior scan. Best approximation:
  // detectors that are new but share a prefix with fixed ones (same pattern).
  const returnedCount = newIds.filter((id) =>
    fixedIds.some((fid) => fid.split('-')[0] === id.split('-')[0])
  ).length;

  const spendDeltaUsd = current.totalCostUsdLast7Days - last.totalCostUsdLast7Days;
  const spendDeltaPct = last.totalCostUsdLast7Days > 0
    ? (spendDeltaUsd / last.totalCostUsdLast7Days) * 100
    : 0;

  return {
    daysSince,
    spendDeltaUsd,
    spendDeltaPct,
    fixedCount: fixedIds.length,
    newCount: newIds.length,
    returnedCount,
    fixedIds,
    newIds,
  };
}

export function printDelta(delta: ScanDelta, _last: LastScan): void {
  const daysLabel = delta.daysSince < 1
    ? 'since your last scan today'
    : delta.daysSince < 1.5
    ? 'since yesterday\'s scan'
    : `since your scan ${Math.round(delta.daysSince)} days ago`;

  process.stdout.write(kleur.dim(`  ── vs last scan (${daysLabel}) ─────────────────────\n\n`));

  // Spend delta line.
  const sign = delta.spendDeltaUsd >= 0 ? '+' : '';
  const pct = Math.abs(delta.spendDeltaPct).toFixed(0);
  const spendStr = `${sign}$${delta.spendDeltaUsd.toFixed(2)} (${sign}${pct}%)`;

  if (delta.spendDeltaUsd < -0.5) {
    // Spend down — celebrate it.
    process.stdout.write(
      `  ${kleur.bold().green('↓ Spend down')}  ${kleur.green(spendStr)}  last 7 days\n`
    );
    if (delta.fixedCount > 0) {
      const plural = delta.fixedCount === 1 ? 'leak' : 'leaks';
      process.stdout.write(
        `  ${kleur.green('✓')} ${kleur.dim(`${delta.fixedCount} ${plural} cleared: `)}${kleur.dim(delta.fixedIds.join(', '))}\n`
      );
    }
  } else if (delta.spendDeltaUsd > 0.5) {
    // Spend up — flag it clearly.
    process.stdout.write(
      `  ${kleur.bold().red('↑ Spend up')}    ${kleur.red(spendStr)}  last 7 days\n`
    );
  } else {
    // Flat — neutral.
    process.stdout.write(
      `  ${kleur.dim('→ Spend flat')}  ${kleur.dim(spendStr)}  last 7 days\n`
    );
  }

  // New / returned leaks.
  if (delta.newCount > 0) {
    const verb = delta.returnedCount > 0 ? 'crept back' : 'detected';
    const noun = delta.newCount === 1 ? 'new leak' : 'new leaks';
    process.stdout.write(
      `  ${kleur.yellow('⚠')}  ${kleur.bold().yellow(`${delta.newCount} ${noun} ${verb}`)}  — see below\n`
    );
  }

  process.stdout.write('\n');
}

export function printAliasHint(): void {
  // Shown only on the very first scan. Helps users run burnd before every
  // Claude session without thinking about it.
  const shell = process.env['SHELL'] ?? '';
  const isZsh = shell.includes('zsh');
  const configFile = isZsh ? '~/.zshrc' : '~/.bashrc';
  const aliasLine = `alias claude='npx getburnd check && claude'`;

  process.stdout.write(kleur.dim('  ─────────────────────────────────────────────────────────────\n'));
  process.stdout.write('\n');
  process.stdout.write(`  ${kleur.bold().cyan('Tip:')} Run burnd automatically before every Claude session:\n`);
  process.stdout.write(`\n`);
  process.stdout.write(`  ${kleur.dim('$ echo \'')}${aliasLine}${kleur.dim(`\' >> ${configFile}`)}\n`);
  process.stdout.write(`  ${kleur.dim('$ source ' + configFile)}\n`);
  process.stdout.write(`\n`);
  process.stdout.write(`  ${kleur.dim('Then just type')} ${kleur.cyan('claude')} ${kleur.dim('as usual — burnd checks your leaks first.\n')}`);
  process.stdout.write('\n');
}

export function printSpendCreepWarning(
  currentDetectorIds: string[],
  lastDetectorIds: string[],
): void {
  // Spend creep: detectors that fired in the last scan AND fire now,
  // meaning the user didn't fix them. Only show this if they've had 2+ scans.
  const creeping = currentDetectorIds.filter((id) => lastDetectorIds.includes(id));
  if (creeping.length === 0) return;

  const plural = creeping.length === 1 ? 'leak has' : 'leaks have';
  process.stdout.write(
    `  ${kleur.yellow('⚠')}  ${kleur.bold().yellow(`${creeping.length} ${plural} been active for 2+ scans`)}  — these are costing you every week:\n`
  );
  for (const id of creeping.slice(0, 3)) {
    process.stdout.write(`     ${kleur.dim('•')} ${kleur.dim(id)}\n`);
  }
  process.stdout.write('\n');
}
