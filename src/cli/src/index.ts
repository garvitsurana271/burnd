#!/usr/bin/env node

import { walkJsonlFiles, defaultClaudeProjectsRoot } from './walker.js';
import type { JsonlFile } from './walker.js';
import { streamRecords, type ParseStats } from './parser.js';
import { newEmptyStats, ingestRecord, type SessionStats } from './session.js';
import { runAllDetectors, runAllMultiSessionDetectors, type Insight } from './detectors/index.js';
import { topNBySavings, totalSavingsUsd } from './insights.js';
import { printHeader, printOverview, printTopInsights, printShareBlock, printFooter } from './output.js';
import { anonymize } from './anonymize.js';
import { startServer, DEFAULT_PORT, DEFAULT_DASHBOARD_DIST } from './serve.js';
import { readConfig, writeConfig, validateLicense, generateKey, isProActive } from './license.js';
import { computeBudget, printBudget } from './pro/budget.js';
import { appendHistory, readHistory } from './pro/history.js';
import { generateWeeklyReport } from './pro/report.js';
import { exportCsv } from './pro/export.js';
import { basename } from 'node:path';
import kleur from 'kleur';

const VERSION = '0.0.2';

type Command = 'scan' | 'serve' | 'pro' | 'report' | 'export' | 'budget';

interface CliOptions {
  command: Command;
  subcommand: string;
  root: string;
  top: number;
  dryRun: boolean;
  port: number;
  dashboardDist: string;
  printVersion: boolean;
  printHelp: boolean;
  positionalArgs: string[];
  budgetAmount?: number;
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    command: 'scan',
    subcommand: '',
    root: defaultClaudeProjectsRoot(),
    top: 3,
    dryRun: false,
    port: DEFAULT_PORT,
    dashboardDist: DEFAULT_DASHBOARD_DIST,
    printVersion: false,
    printHelp: false,
    positionalArgs: [],
  };

  let i = 0;
  const cmd = argv[0];
  if (cmd === 'serve' || cmd === 'pro' || cmd === 'report' || cmd === 'export' || cmd === 'budget') {
    opts.command = cmd as Command;
    i = 1;
    if (cmd === 'pro' && argv[1] && !argv[1].startsWith('-')) {
      opts.subcommand = argv[1];
      i = 2;
    }
    if (cmd === 'budget' && argv[1] === 'set') {
      opts.subcommand = 'set';
      opts.budgetAmount = Number(argv[2] ?? '0');
      i = 3;
    }
  } else if (cmd === 'scan') {
    opts.command = 'scan';
    i = 1;
  }

  for (; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--version' || arg === '-v') opts.printVersion = true;
    else if (arg === '--help' || arg === '-h') opts.printHelp = true;
    else if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--root') opts.root = argv[++i] ?? opts.root;
    else if (arg === '--top') opts.top = Number(argv[++i] ?? '3');
    else if (arg === '--port') opts.port = Number(argv[++i] ?? String(DEFAULT_PORT));
    else if (arg === '--dashboard') opts.dashboardDist = argv[++i] ?? opts.dashboardDist;
    else if (arg && !arg.startsWith('-')) opts.positionalArgs.push(arg);
  }
  return opts;
}

function printHelp(): void {
  process.stdout.write(`
burnd ${VERSION} — find what's burning a hole in your AI coding budget

Usage:
  npx getburnd [scan]                 Scan ~/.claude/projects/, print top leaks
  npx getburnd serve                  Start the local web dashboard at localhost:${DEFAULT_PORT}

Scan options:
  --top <n>                  Print top N insights (default: 3)
  --root <path>              Use a custom Claude projects root
  --dry-run                  Show the anonymized upload payload (no upload)

Serve options:
  --port <n>                 Dashboard port (default: ${DEFAULT_PORT})
  --root <path>              Use a custom Claude projects root

${kleur.bold().yellow('BurndPro')} (₹149/month):
  npx getburnd pro activate <email> <key>   Activate your Pro license
  npx getburnd pro status                   Check license status
  npx getburnd budget                       Show weekly budget status
  npx getburnd budget set <amount>          Set weekly budget in USD
  npx getburnd report                       Generate weekly HTML report
  npx getburnd export                       Export all sessions to CSV

  Pro features: budget alerts, weekly reports, historical trends, CSV export.
  Get a license: https://getburnd.vercel.app/#buy or garvitsurana10@gmail.com

Misc:
  --version, -v              Print version
  --help, -h                 Show this help

`);
}

async function scanSessions(root: string, dryRun: boolean): Promise<{ allStats: SessionStats[]; allFiles: JsonlFile[]; allInsights: Insight[] }> {
  const allStats: SessionStats[] = [];
  const allFiles: JsonlFile[] = [];
  const parseStats: ParseStats = { recordsTotal: 0, recordsParsed: 0, recordsSkipped: 0, bytesRead: 0 };

  for await (const file of walkJsonlFiles(root)) {
    allFiles.push(file);
    const sessionId = basename(file.absPath, '.jsonl');
    const stats = newEmptyStats(sessionId, file.absPath, file.projectDir, file.isSubagent);
    for await (const record of streamRecords(file.absPath, parseStats)) {
      ingestRecord(stats, record);
      if (dryRun) {
        const anon = anonymize(record);
        if (anon !== null) process.stdout.write(JSON.stringify(anon) + '\n');
      }
    }
    allStats.push(stats);
  }

  const perSessionInsights = allStats.flatMap(runAllDetectors);
  const multiSessionInsights = runAllMultiSessionDetectors(allStats);
  const allInsights = [...perSessionInsights, ...multiSessionInsights];

  return { allStats, allFiles, allInsights };
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.printVersion) {
    process.stdout.write(`burnd ${VERSION}\n`);
    return;
  }
  if (opts.printHelp) {
    printHelp();
    return;
  }

  // ── Pro license management ──────────────────────────────────────────
  if (opts.command === 'pro') {
    const config = readConfig();

    if (opts.subcommand === 'activate') {
      const email = opts.positionalArgs[0];
      const key = opts.positionalArgs[1];
      if (!email || !key) {
        process.stderr.write('Usage: npx getburnd pro activate <email> <key>\n');
        process.exit(1);
      }
      config.email = email;
      config.licenseKey = key;
      writeConfig(config);

      const status = validateLicense(config);
      if (status.active) {
        process.stdout.write(kleur.bold().green('\n  ✓ BurndPro activated!\n'));
        process.stdout.write(kleur.dim(`  Email: ${status.email}\n`));
        if (status.reason) process.stdout.write(kleur.yellow(`  Note: ${status.reason}\n`));
        process.stdout.write('\n');
      } else {
        process.stdout.write(kleur.bold().red('\n  ✗ License key is invalid or expired.\n'));
        process.stdout.write(kleur.dim(`  ${status.reason}\n\n`));
      }
      return;
    }

    if (opts.subcommand === 'status') {
      const status = validateLicense(config);
      process.stdout.write('\n');
      if (status.active) {
        process.stdout.write(kleur.bold().green('  ⚡ BurndPro — Active\n'));
        process.stdout.write(kleur.dim(`  Email: ${status.email}\n`));
        process.stdout.write(kleur.dim(`  Valid for: ${status.expiresMonth}\n`));
        if (status.reason) process.stdout.write(kleur.yellow(`  ${status.reason}\n`));
      } else {
        process.stdout.write(kleur.dim('  BurndPro — ') + kleur.red('Inactive\n'));
        process.stdout.write(kleur.dim(`  ${status.reason}\n`));
      }
      process.stdout.write('\n');
      return;
    }

    if (opts.subcommand === 'keygen') {
      const email = opts.positionalArgs[0];
      const month = opts.positionalArgs[1];
      if (!email || !month) {
        process.stderr.write('Usage: npx getburnd pro keygen <email> <YYYY-MM>\n');
        process.exit(1);
      }
      process.stdout.write(generateKey(email, month) + '\n');
      return;
    }

    printHelp();
    return;
  }

  // ── Budget set ──────────────────────────────────────────────────────
  if (opts.command === 'budget' && opts.subcommand === 'set') {
    if (!opts.budgetAmount || opts.budgetAmount <= 0) {
      process.stderr.write('Usage: npx getburnd budget set <amount_usd>\n');
      process.stderr.write('Example: npx getburnd budget set 50\n');
      process.exit(1);
    }
    const config = readConfig();
    config.weeklyBudgetUsd = opts.budgetAmount;
    writeConfig(config);
    process.stdout.write(kleur.green(`\n  ✓ Weekly budget set to $${opts.budgetAmount}\n\n`));
    return;
  }

  // ── Serve ───────────────────────────────────────────────────────────
  if (opts.command === 'serve') {
    await startServer({
      root: opts.root,
      port: opts.port,
      burndVersion: VERSION,
      dashboardDist: opts.dashboardDist,
    });
    return;
  }

  // ── Scan (shared by scan, budget, report, export) ───────────────────
  const { allStats, allFiles, allInsights } = await scanSessions(opts.root, opts.dryRun);

  if (opts.dryRun) return;

  if (allFiles.length === 0) {
    printHeader();
    process.stdout.write(`  No Claude Code session files found at ${opts.root}\n`);
    process.stdout.write(`  Have you run Claude Code yet? If you use a non-default location,\n`);
    process.stdout.write(`  pass --root <path> to point burnd at it.\n\n`);
    return;
  }

  const top = topNBySavings(allInsights, opts.top);

  // ── Pro: save history on every scan ─────────────────────────────────
  if (isProActive()) {
    appendHistory(allStats, top, allFiles.length);
  }

  // ── Export ──────────────────────────────────────────────────────────
  if (opts.command === 'export') {
    if (!isProActive()) {
      process.stdout.write(kleur.yellow('\n  ⚡ CSV export is a BurndPro feature.\n'));
      process.stdout.write(kleur.dim('  Get a license at https://getburnd.vercel.app/#buy\n\n'));
      return;
    }
    const path = exportCsv(allStats);
    process.stdout.write(kleur.green(`\n  ✓ Exported ${allStats.length} sessions to:\n`));
    process.stdout.write(kleur.cyan(`    ${path}\n\n`));
    return;
  }

  // ── Report ─────────────────────────────────────────────────────────
  if (opts.command === 'report') {
    if (!isProActive()) {
      process.stdout.write(kleur.yellow('\n  ⚡ Weekly reports are a BurndPro feature.\n'));
      process.stdout.write(kleur.dim('  Get a license at https://getburnd.vercel.app/#buy\n\n'));
      return;
    }
    const history = readHistory();
    const path = generateWeeklyReport(allStats, top, history);
    process.stdout.write(kleur.green(`\n  ✓ Weekly report generated:\n`));
    process.stdout.write(kleur.cyan(`    ${path}\n`));
    process.stdout.write(kleur.dim('    Open it in your browser to view.\n\n'));
    return;
  }

  // ── Default scan output ─────────────────────────────────────────────
  const totalCostUsdAllTime = allStats.reduce((acc, s) => acc + s.totalCostUsd, 0);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const totalCostUsdLast7Days = allStats
    .filter((s) => (s.startedAt ?? '') >= sevenDaysAgo)
    .reduce((acc, s) => acc + s.totalCostUsd, 0);

  printHeader();
  printOverview({
    filesScanned: allFiles.length,
    sessionsScanned: allStats.length,
    totalCostUsdAllTime,
    totalCostUsdLast7Days,
    totalSavingsAvailableUsd: totalSavingsUsd(top),
  });
  printTopInsights(top);
  if (top.length > 0) {
    printShareBlock(top[0]!.title, totalSavingsUsd(top));
  }

  // ── Pro: budget after scan ──────────────────────────────────────────
  if (opts.command === 'budget' || isProActive()) {
    const config = readConfig();
    const budget = computeBudget(allStats, config);
    if (budget) {
      printBudget(budget);
    } else if (opts.command === 'budget') {
      process.stdout.write(kleur.yellow('\n  No budget set. Run: npx getburnd budget set <amount_usd>\n'));
      process.stdout.write(kleur.dim('  Example: npx getburnd budget set 50\n\n'));
    }
  }

  printFooter('https://getburnd.vercel.app');
}

main().catch((err: unknown) => {
  process.stderr.write(`burnd: error: ${(err as Error).message ?? String(err)}\n`);
  process.exit(1);
});
