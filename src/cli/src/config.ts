// Local config persistence for burnd.
//
// Everything burnd stores lives in ~/.burnd/. Nothing here is transmitted
// except the opt-in telemetry ping in emailcapture.ts.
//
// History note: this file used to be license.ts and carried a BurndPro
// licence check built on HMAC-SHA256 with a hardcoded shared secret. That
// scheme was unenforceable — burnd is MIT-licensed and open source, so
// shipping the verifier also shipped the signer, and anyone could mint a
// lifetime key in two commands. The paywall was removed in 0.1.0 rather
// than repaired; every feature is now free. See POSTMORTEM.md.

import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export interface BurndConfig {
  weeklyBudgetUsd?: number;
  currency?: 'USD' | 'INR';
  exchangeRate?: number;
  // Alert webhook — POST when any session exceeds alertThresholdUsd.
  webhookUrl?: string;
  alertThresholdUsd?: number;
  // Resend API key for email digest.
  resendApiKey?: string;
  digestEmail?: string;
  // Run counter + email capture state. `email` is the address the user
  // volunteered for the weekly digest — it has never gated any feature.
  email?: string;
  runCount?: number;
  emailSkipCount?: number;
  emailLastSkipRun?: number;
  // Anonymous install ID for deduplicating real installs from CI/bot downloads.
  // Generated once on first scan, never regenerated. Contains zero PII.
  installId?: string;
}

function configDir(): string {
  const dir = join(homedir(), '.burnd');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

export function configPath(): string {
  return join(configDir(), 'config.json');
}

export function historyPath(): string {
  return join(configDir(), 'history.json');
}

export function readConfig(): BurndConfig {
  const p = configPath();
  if (!existsSync(p)) return {};
  try {
    return JSON.parse(readFileSync(p, 'utf-8')) as BurndConfig;
  } catch {
    return {};
  }
}

export function writeConfig(config: BurndConfig): void {
  writeFileSync(configPath(), JSON.stringify(config, null, 2) + '\n', 'utf-8');
}

/** Returns a persistent random UUID for this machine's burnd install.
 *  Generates + stores it on first call. Never regenerates. */
export function getInstallId(): string {
  const config = readConfig();
  if (config.installId) return config.installId;
  const id = randomUUID();
  config.installId = id;
  writeConfig(config);
  return id;
}
