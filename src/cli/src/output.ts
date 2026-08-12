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
  ];
  for (const line of lines) process.stdout.write(line + '\n');

  // Loss framing: turn savings into a monthly burn rate.
  if (summary.totalSavingsAvailableUsd > 0) {
    // Weekly savings → monthly (×4.33) to hit the pain number.
    const monthlyWaste = summary.totalSavingsAvailableUsd * 4.33;
    const wasteStr = kleur.bold().red('$' + monthlyWaste.toFixed(0) + '/month');
    process.stdout.write('\n');
    process.stdout.write(`  You're currently burning ${wasteStr} on fixable Claude waste.\n`);
  }

  process.stdout.write('\n');
}

// Prints every insight in full: title, dollar estimate, effort, description,
// and all fix steps. This used to be tier-gated — free users saw a one-line
// teaser and the fix steps were withheld behind BurndPro. The paywall was
// removed in 0.1.0, so everyone gets the complete output.
export function printTopInsights(insights: Insight[]): void {
  if (insights.length === 0) {
    process.stdout.write(kleur.green('  ✓ No leaks detected. Your spend is clean.\n\n'));
    return;
  }

  process.stdout.write(kleur.dim('  Top leaks (sorted by estimated savings):\n\n'));
  for (let i = 0; i < insights.length; i++) {
    const insight = insights[i]!;
    const num = kleur.bold().yellow((i + 1).toString());
    const savings = kleur.bold().red('$' + insight.savingsEstimateUsd.toFixed(2) + ' wasted');
    const effort = kleur.dim(`(~${insight.effortMinutes} min to fix)`);

    process.stdout.write(`  ${num}. ${insight.title}\n`);
    process.stdout.write(`     ${savings}  ${effort}\n`);

    process.stdout.write(kleur.dim(`     ${wrap(insight.description, 70, '     ')}\n`));
    for (const step of insight.fixSteps) {
      process.stdout.write(kleur.dim(`     Fix: `) + wrap(step, 65, '          ') + '\n');
    }
    process.stdout.write('\n');
  }
}

export interface SharePayload {
  v: 1;
  t: number;   // all-time spend USD
  w: number;   // last-7-days spend USD
  s: number;   // total savings USD
  n: number;   // sessions scanned
  l: Array<{ title: string; save: number }>;  // top leaks
  g: string;   // generated ISO date
}

export function buildShareUrl(payload: SharePayload): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `https://getburnd.vercel.app/share#${encoded}`;
}

export function printShareBlock(
  topInsightTitle: string,
  totalSavingsUsd: number,
  shareUrl?: string,
): void {
  if (totalSavingsUsd <= 0) return;
  const savingsStr = '$' + totalSavingsUsd.toFixed(0);

  process.stdout.write(kleur.dim('  ─────────────────────────────────────────────────────────────\n'));

  if (shareUrl) {
    process.stdout.write('  ' + kleur.bold().yellow('Share your report') + '\n\n');
    process.stdout.write('  ' + kleur.cyan(shareUrl) + '\n');
    process.stdout.write(kleur.dim('  ^ public link · no account · no data uploaded\n\n'));
  }

  const tweetText = `Just ran npx getburnd on my Claude Code sessions — found ${savingsStr} in fixable waste. Top leak: ${topInsightTitle}  getburnd.vercel.app`;
  process.stdout.write(kleur.dim('  Tweet: "') + tweetText + kleur.dim('"\n\n'));
  process.stdout.write(
    kleur.dim('  ⭐ Star on GitHub: ') +
      kleur.cyan('github.com/garvitsurana271/burnd') +
      '\n',
  );
}

export function printFooter(installedDomain?: string): void {
  process.stdout.write(kleur.dim('  ─────────────────────────────────────────────────────────────\n'));
  if (installedDomain) {
    process.stdout.write(
      kleur.dim('  Full dashboard + weekly reports: ') +
        kleur.cyan(installedDomain) +
        '\n',
    );
  } else {
    process.stdout.write(
      kleur.dim('  Full dashboard (9 detectors, spend chart): ') +
        kleur.cyan('https://getburnd.vercel.app') +
        kleur.dim('  |  ') +
        kleur.bold('npx getburnd serve') +
        '\n',
    );
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
