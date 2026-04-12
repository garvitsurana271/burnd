import { createHmac } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const SECRET = 'burnd-pro-v1-garvit-2026';

export interface BurndConfig {
  licenseKey?: string;
  email?: string;
  weeklyBudgetUsd?: number;
  currency?: 'USD' | 'INR';
  exchangeRate?: number;
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

export function generateKey(email: string, monthStr: string): string {
  const payload = email.toLowerCase().trim() + ':' + monthStr;
  const hash = createHmac('sha256', SECRET).update(payload).digest('hex').slice(0, 16).toUpperCase();
  return `BURND-${hash.slice(0, 4)}-${hash.slice(4, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}`;
}

function currentMonthStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function prevMonthStr(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export interface LicenseStatus {
  active: boolean;
  email?: string;
  expiresMonth?: string;
  reason?: string;
}

export function validateLicense(config: BurndConfig): LicenseStatus {
  if (!config.licenseKey || !config.email) {
    return { active: false, reason: 'No license key configured. Run: npx burnd pro activate <email> <key>' };
  }

  const email = config.email;
  const key = config.licenseKey.toUpperCase().trim();
  const current = currentMonthStr();
  const prev = prevMonthStr();

  if (key === generateKey(email, current)) {
    return { active: true, email, expiresMonth: current };
  }
  if (key === generateKey(email, prev)) {
    return { active: true, email, expiresMonth: prev, reason: 'Grace period — renew soon' };
  }

  return { active: false, email, reason: 'License key expired or invalid. Contact garvitsurana10@gmail.com to renew.' };
}

export function isProActive(): boolean {
  return validateLicense(readConfig()).active;
}
