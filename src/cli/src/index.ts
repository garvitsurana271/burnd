#!/usr/bin/env node
// burnd — CLI entry point.
//
// Usage:
//   npx burnd                  Scan ~/.claude/projects/, print top leaks.
//   npx burnd --root <path>    Use a custom Claude projects root directory.
//   npx burnd --top <n>        Print top N insights instead of the default 3.
//   npx burnd --dry-run        Print the upload payload (anonymized) instead
//                              of insights. Used to verify what would be
//                              uploaded — never actually uploads.
//   npx burnd --version        Print version and exit.
//   npx burnd --help           Print help and exit.

import { walkJsonlFiles, defaultClaudeProjectsRoot } from './walker.js';
import type { JsonlFile } from './walker.js';
import { streamRecords, type ParseStats } from './parser.js';
import { newEmptyStats, ingestRecord, type SessionStats } from './session.js';
import { runAllDetectors, runAllMultiSessionDetectors } from './detectors/index.js';
import { topNBySavings, totalSavingsUsd } from './insights.js';
import { printHeader, printOverview, printTopInsights, printFooter } from './output.js';
import { anonymize } from './anonymize.js';
import { startServer, DEFAULT_PORT, DEFAULT_DASHBOARD_DIST } from './serve.js';
import { basename } from 'node:path';

const VERSION = '0.0.1';

type Command = 'scan' | 'serve';

interface CliOptions {
  command: Command;
  root: string;
  top: number;
  dryRun: boolean;
  port: number;
  dashboardDist: string;
  printVersion: boolean;
  printHelp: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    command: 'scan',
    root: defaultClaudeProjectsRoot(),
    top: 3,
    dryRun: false,
    port: DEFAULT_PORT,
    dashboardDist: DEFAULT_DASHBOARD_DIST,
    printVersion: false,
    printHelp: false,
  };
  // First non-flag argument is the subcommand.
  let i = 0;
  if (argv[0] === 'serve') {
    opts.command = 'serve';
    i = 1;
  } else if (argv[0] === 'scan') {
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
  }
  return opts;
}

function printHelp(): void {
  process.stdout.write(`
burnd ${VERSION} — find what's burning a hole in your AI coding budget

Usage:
  npx burnd [scan]                 Scan ~/.claude/projects/, print top leaks
  npx burnd serve                  Start the local web dashboard at localhost:${DEFAULT_PORT}

Scan options:
  --top <n>                  Print top N insights (default: 3)
  --root <path>              Use a custom Claude projects root
  --dry-run                  Show the anonymized upload payload (no upload)

Serve options:
  --port <n>                 Dashboard port (default: ${DEFAULT_PORT})
  --root <path>              Use a custom Claude projects root
  --dashboard <path>         Use a custom dashboard build directory

Misc:
  --version, -v              Print version
  --help, -h                 Show this help

Burnd reads your local Claude Code session files and finds the leaks in your
AI spend. We never see your code — only aggregates. Source code for the
parser is at https://github.com/garvitonpc/burnd

`);
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

  if (opts.command === 'serve') {
    await startServer({
      root: opts.root,
      port: opts.port,
      burndVersion: VERSION,
      dashboardDist: opts.dashboardDist,
    });
    return;
  }

  const allStats: SessionStats[] = [];
  const allFiles: JsonlFile[] = [];
  const parseStats: ParseStats = {
    recordsTotal: 0,
    recordsParsed: 0,
    recordsSkipped: 0,
    bytesRead: 0,
  };

  for await (const file of walkJsonlFiles(opts.root)) {
    allFiles.push(file);
    const sessionId = basename(file.absPath, '.jsonl');
    const stats = newEmptyStats(sessionId, file.absPath, file.projectDir, file.isSubagent);
    for await (const record of streamRecords(file.absPath, parseStats)) {
      ingestRecord(stats, record);
      if (opts.dryRun) {
        const anon = anonymize(record);
        if (anon !== null) process.stdout.write(JSON.stringify(anon) + '\n');
      }
    }
    allStats.push(stats);
  }

  // Dry-run mode is purely for piping to jq/grep — no human output.
  if (opts.dryRun) return;

  if (allFiles.length === 0) {
    printHeader();
    process.stdout.write(`  No Claude Code session files found at ${opts.root}\n`);
    process.stdout.write(`  Have you run Claude Code yet? If you use a non-default location,\n`);
    process.stdout.write(`  pass --root <path> to point burnd at it.\n\n`);
    return;
  }

  // Aggregate insights across all sessions: per-session detectors + cross-session detectors.
  const perSessionInsights = allStats.flatMap(runAllDetectors);
  const multiSessionInsights = runAllMultiSessionDetectors(allStats);
  const allInsights = [...perSessionInsights, ...multiSessionInsights];
  const top = topNBySavings(allInsights, opts.top);

  // Compute the overview totals.
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
  printFooter('https://getburnd.vercel.app');
}

main().catch((err: unknown) => {
  process.stderr.write(`burnd: error: ${(err as Error).message ?? String(err)}\n`);
  process.exit(1);
});
