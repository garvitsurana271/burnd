// Email capture — free tier retention hook.
//
// Strategy: gate the "vs last scan" delta behind an email prompt on run 2.
// Run 1 = full output, no friction (let the wow moment land).
// Run 2+ = prompt for email before showing the delta. Skip = still show delta,
// but ask again after every 5 runs. Once email is stored, never prompt again.
//
// Telemetry is bundled with the email prompt (opt-in). If user gives email
// they're implicitly opting in to anonymous usage stats too — disclosed in
// the prompt copy. If they skip email, we ask about telemetry separately once.

import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { readConfig, writeConfig, getInstallId } from './license.js';
import kleur from 'kleur';

const SUBSCRIBE_URL = 'https://getburnd.vercel.app/api/subscribe';
const TELEMETRY_URL = 'https://getburnd.vercel.app/api/telemetry';

// ── Run counter ────────────────────────────────────────────────────────────

export function incrementRunCount(): number {
  const config = readConfig();
  const count = (config.runCount ?? 0) + 1;
  config.runCount = count;
  writeConfig(config);
  return count;
}

export function getRunCount(): number {
  return readConfig().runCount ?? 0;
}

// ── Email prompt gating ────────────────────────────────────────────────────

export function shouldPromptEmail(): boolean {
  const config = readConfig();
  // Already captured.
  if (config.email) return false;
  // Never on first run.
  if ((config.runCount ?? 0) < 2) return false;
  // Skip cooldown: only ask every 5 runs after a skip.
  const skipCount = config.emailSkipCount ?? 0;
  const lastSkipRun = config.emailLastSkipRun ?? 0;
  const runsSinceSkip = (config.runCount ?? 0) - lastSkipRun;
  if (skipCount > 0 && runsSinceSkip < 5) return false;
  return true;
}

export async function promptEmailCapture(context: {
  version: string;
  platform: string;
  detectorIds: string[];
  isPro: boolean;
}): Promise<void> {
  if (!shouldPromptEmail()) return;

  process.stdout.write(kleur.dim('  ─────────────────────────────────────────────────────────────\n'));
  process.stdout.write('\n');
  process.stdout.write(`  ${kleur.bold().cyan('Your weekly spend trend is ready.')}\n`);
  process.stdout.write(`  ${kleur.dim('Enter email for free weekly digest + trend history.')}\n`);
  process.stdout.write(`  ${kleur.dim('Also sends anonymous usage stats (no costs, no paths) — helps build')}\n`);
  process.stdout.write(`  ${kleur.dim('the "State of Claude Code Spending" report.')}\n`);
  process.stdout.write('\n');

  const rl = readline.createInterface({ input, output });

  let email = '';
  try {
    const answer = await rl.question(kleur.dim('  Email (or Enter to skip): '));
    email = answer.trim().toLowerCase();
  } finally {
    rl.close();
  }

  if (!email || !email.includes('@')) {
    // Skip — record skip so we cool down.
    const config = readConfig();
    config.emailSkipCount = (config.emailSkipCount ?? 0) + 1;
    config.emailLastSkipRun = config.runCount ?? 0;
    writeConfig(config);
    process.stdout.write(kleur.dim('\n  Got it. Results below.\n\n'));
    return;
  }

  // Save email locally.
  const config = readConfig();
  config.email = email;
  writeConfig(config);

  // Fire API calls in the background — don't block output.
  fireSubscribe(email, context).catch(() => {/* silent — no network is fine */});
  fireTelemetry({ ...context, event: 'email_captured' }).catch(() => {/* silent */});

  process.stdout.write(kleur.green(`\n  ✓ Subscribed! First digest arrives next Monday.\n\n`));
}

// ── Telemetry ──────────────────────────────────────────────────────────────

export interface TelemetryEvent {
  event: string;
  version: string;
  platform: string;
  detectorIds: string[];
  isPro: boolean;
  runCountTier?: string;
  installId?: string;
}

export function fireTelemetry(event: TelemetryEvent): Promise<void> {
  // Opt-out honored. Users who don't want any network calls can set
  // BURND_NO_TELEMETRY=1 in their shell. Everything else is anonymous.
  if (process.env['BURND_NO_TELEMETRY']) return Promise.resolve();

  const config = readConfig();
  const runCount = config.runCount ?? 0;
  const payload: TelemetryEvent = {
    ...event,
    runCountTier: runCountTier(runCount),
    installId: getInstallId(),
  };

  return fetch(TELEMETRY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(4000),
  }).then(() => undefined).catch(() => undefined);
}

function fireSubscribe(email: string, context: {
  version: string;
  platform: string;
  detectorIds: string[];
  isPro: boolean;
}): Promise<void> {
  return fetch(SUBSCRIBE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, ...context }),
    signal: AbortSignal.timeout(6000),
  }).then(() => undefined).catch(() => undefined);
}

function runCountTier(n: number): string {
  if (n === 1) return '1';
  if (n === 2) return '2';
  if (n <= 5) return '3-5';
  if (n <= 10) return '6-10';
  return '10+';
}
