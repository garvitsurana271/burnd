// Terminal output formatting for the `npx getburnd` "wow" moment.
//
// Goal: when the user runs `npx getburnd` for the first time, they should see
// a clean, dense, dollar-denominated list of leaks within ~5 seconds.
// Per the design doc and the new positioning rule, every line of output
// must lead with the *decision* (the dollars saved) not the *data*.

import kleur from 'kleur';
import type { Insight } from './detectors/index.js';

export interface OverviewSummary {
  filesScanned: number;
  sessionsScanned: number;
  totalCostUsdAllTime: number;
  totalCostUsdLast7Days: number;
  totalSavingsAvailableUsd: number;
}

export function printHeader(): void {
  process.stdout.write('\n');
  process.stdout.write(kleur.bold().yellow('  burnd') + kleur.dim(' — find what\'s burning a hole in your AI coding budget\n'));
  process.stdout.write(kleur.dim('  ─────────────────────────────────────────────────────────────\n\n'));
}

export function printOverview(summary: OverviewSummary): void {
  const lines = [
    `  Scanned: ${kleur.cyan(summary.filesScanned.toString())} session files across ${kleur.cyan(summary.sessionsScanned.toString())} sessions`,
    `  All-time spend: ${kleur.bold().green('$' + summary.totalCostUsdAllTime.toFixed(2))}`,
    `  Last 7 days:    ${kleur.bold().green('$' + summary.totalCostUsdLast7Days.toFixed(2))}`,
    `  Potential savings (top leaks): ${kleur.bold().yellow('$' + summary.totalSavingsAvailableUsd.toFixed(2))}`,
  ];
  for (const line of lines) process.stdout.write(line + '\n');
  process.stdout.write('\n');
}

export function printTopInsights(insights: Insight[]): void {
  if (insights.length === 0) {
    process.stdout.write(kleur.green('  ✓ No leaks detected. Your spend is clean.\n\n'));
    return;
  }

  process.stdout.write(kleur.dim('  Top leaks (sorted by estimated savings):\n\n'));
  for (let i = 0; i < insights.length; i++) {
    const insight = insights[i]!;
    const num = kleur.bold().yellow((i + 1).toString());
    const savings = kleur.bold().green('$' + insight.savingsEstimateUsd.toFixed(2));
    const effort = kleur.dim(`(~${insight.effortMinutes} min to fix)`);

    process.stdout.write(`  ${num}. ${insight.title}\n`);
    process.stdout.write(`     ${savings}  ${effort}\n`);
    process.stdout.write(kleur.dim(`     ${wrap(insight.description, 70, '     ')}\n`));
    process.stdout.write('\n');
  }
}

export function printFooter(installedDomain?: string): void {
  process.stdout.write(kleur.dim('  ─────────────────────────────────────────────────────────────\n'));
  if (installedDomain) {
    process.stdout.write(
      kleur.dim('  See the full dashboard, all insights, and weekly leak reports at ') +
        kleur.cyan(installedDomain) +
        '\n',
    );
  } else {
    process.stdout.write(kleur.dim('  See the full dashboard at ') + kleur.cyan('https://getburnd.vercel.app') + '\n');
  }
  process.stdout.write('\n');
}

function wrap(text: string, width: number, indent: string): string {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (current.length + word.length + 1 > width) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines.join('\n' + indent);
}
