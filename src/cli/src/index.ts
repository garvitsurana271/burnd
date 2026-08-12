#!/usr/bin/env node

import { walkJsonlFiles, defaultClaudeProjectsRoot } from './walker.js';
import type { JsonlFile } from './walker.js';
import { streamRecords, type ParseStats } from './parser.js';
import { newEmptyStats, ingestRecord, type SessionStats } from './session.js';
import { runAllDetectors, runAllMultiSessionDetectors, computeUserBaseline, type Insight } from './detectors/index.js';
import { topNBySavings, totalSavingsUsd } from './insights.js';
import { printHeader, printOverview, printTopInsights, printShareBlock, printFooter, buildShareUrl, type SharePayload } from './output.js';
import { anonymize } from './anonymize.js';
import { unknownModels } from './pricing.js';
import { startServer, DEFAULT_PORT, DEFAULT_DASHBOARD_DIST } from './serve.js';
import { readConfig, writeConfig } from './config.js';
import { computeBudget, printBudget } from './reports/budget.js';
import { appendHistory, readHistory } from './reports/history.js';
import { generateWeeklyReport } from './reports/report.js';
import { exportCsv } from './reports/export.js';
import { fireAlertWebhooks } from './reports/webhook.js';
import { computeCostPerCommit, printCostPerCommit } from './reports/commits.js';
import { sendWeeklyDigest } from './reports/digest.js';
import { computeCapStatus, printCapStatus, parsePlanFlag } from './cap.js';
import { scanOpenClaw, formatOpenClawSummary, defaultOpenClawRoot } from './openclaw/scan.js';
import { readLastScan, writeLastScan, computeDelta, printDelta, printAliasHint, printSpendCreepWarning } from './lastscan.js';
import { incrementRunCount, promptEmailCapture, fireTelemetry } from './emailcapture.js';
import { basename } from 'node:path';
import kleur from 'kleur';

const VERSION = '0.1.0';

type Command = 'scan' | 'serve' | 'report' | 'export' | 'budget' | 'check' | 'fix' | 'commits' | 'webhook' | 'digest' | 'openclaw' | 'cap';

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
  if (cmd === 'serve' || cmd === 'report' || cmd === 'export' || cmd === 'budget' || cmd === 'check' || cmd === 'fix' || cmd === 'commits' || cmd === 'webhook' || cmd === 'digest' || cmd === 'openclaw' || cmd === 'cap') {
    opts.command = cmd as Command;
    i = 1;
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
  npx getburnd openclaw               Scan ~/.openclaw/ sessions, print top OpenClaw cost leaks
  npx getburnd check                  Pre-flight check before starting a Claude session
  npx getburnd fix                    Apply top CLAUDE.md patches for the current project
  npx getburnd commits                Show cost-per-commit across all git projects
  npx getburnd cap                    Subscription burn-rate vs your plan API-equivalent cap
                                        flags: --plan pro|max5|max20|team (default: max5)
  npx getburnd serve                  Start the local web dashboard at localhost:${DEFAULT_PORT}

Webhook alerts:
  npx getburnd webhook set <url> <$>  Fire webhook when any session exceeds $threshold
  npx getburnd webhook clear          Remove webhook config

Scan options:
  --top <n>                  Print top N insights (default: 3)
  --root <path>              Use a custom Claude projects root
  --dry-run                  Print anonymized session records to stdout (debug mode)

Serve options:
  --port <n>                 Dashboard port (default: ${DEFAULT_PORT})
  --root <path>              Use a custom Claude projects root

Reports and budget:
  npx getburnd budget                 Show weekly budget status
  npx getburnd budget set <amount>    Set weekly budget in USD
  npx getburnd report                 Generate weekly HTML report
  npx getburnd export                 Export all sessions to CSV
  npx getburnd digest                 Send weekly spend summary to your email

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

  const baseline = computeUserBaseline(allStats);
  const perSessionInsights = allStats.flatMap((s) => runAllDetectors(s, baseline));
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

  // ── Webhook config ──────────────────────────────────────────────────
  if (opts.command === 'webhook') {
    const config = readConfig();
    if (opts.subcommand === 'set' || opts.positionalArgs[0] === 'set') {
      const url = opts.positionalArgs[0] === 'set' ? opts.positionalArgs[1] : opts.positionalArgs[0];
      const threshold = Number(opts.positionalArgs[0] === 'set' ? opts.positionalArgs[2] : opts.positionalArgs[1]) || 5;
      if (!url) {
        process.stderr.write('Usage: npx getburnd webhook set <url> <threshold_usd>\n');
        process.exit(1);
      }
      config.webhookUrl = url;
      config.alertThresholdUsd = threshold;
      writeConfig(config);
      process.stdout.write(kleur.green(`\n  ✓ Webhook set: ${url}\n`));
      process.stdout.write(kleur.dim(`  Alert fires when any session > $${threshold}\n\n`));
    } else if (opts.subcommand === 'clear' || opts.positionalArgs[0] === 'clear') {
      delete config.webhookUrl;
      delete config.alertThresholdUsd;
      writeConfig(config);
      process.stdout.write(kleur.green('\n  ✓ Webhook cleared\n\n'));
    } else {
      if (config.webhookUrl) {
        process.stdout.write(kleur.green(`\n  Webhook: ${config.webhookUrl}\n`));
        process.stdout.write(kleur.dim(`  Threshold: $${config.alertThresholdUsd ?? 5}\n\n`));
      } else {
        process.stdout.write(kleur.dim('\n  No webhook configured.\n'));
        process.stdout.write(kleur.dim('  Usage: npx getburnd webhook set <url> <threshold_usd>\n\n'));
      }
    }
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

  // ── Cap (subscription burn-rate vs. plan API-equivalent cap) ────────
  // Anyone can run `burnd cap [--plan pro|max5|max20|team]`.
  // Reads this calendar month's session spend (already computed during scan)
  // and renders a horizontal progress bar with projected limit-hit date.
  if (opts.command === 'cap') {
    const { allStats } = await scanSessions(opts.root, false);
    const planKey = parsePlanFlag(process.argv.slice(2));
    const status = computeCapStatus(allStats, planKey);
    printCapStatus(status);
    printFooter('https://getburnd.vercel.app');
    return;
  }

  // ── Commits (cost-per-commit across all git projects) ───────────────
  if (opts.command === 'commits') {
    const { allStats } = await scanSessions(opts.root, false);
    printHeader();
    const correlations = computeCostPerCommit(allStats);
    printCostPerCommit(correlations);
    printFooter('https://getburnd.vercel.app');
    return;
  }

  // ── Fix (auto-apply CLAUDE.md patches) ──────────────────────────────
  //
  // Caveat worth knowing: since Opus 5 (July 2026) Anthropic advises
  // SHRINKING CLAUDE.md rather than growing it — they deleted 80%+ of Claude
  // Code's own system prompt with no measurable eval loss, and `claude doctor`
  // now helps rightsize these files. Treat every patch below as a hypothesis
  // to test, not a rule to keep forever. Delete the ones that stop earning
  // their tokens.
  if (opts.command === 'fix') {
    {
    const { allStats, allInsights } = await scanSessions(opts.root, false);
    if (allStats.length === 0) {
      process.stdout.write('\n  No sessions found.\n\n');
      return;
    }

    // Detect current project via cwd.
    const cwd = process.cwd().toLowerCase().replace(/[\\/]/g, '-');
    const cwdProject = allStats.find((s) => {
      const encoded = s.projectDir.toLowerCase();
      return cwd.includes(encoded.slice(-20)) || encoded.includes(cwd.slice(-20));
    })?.projectDir ?? null;

    // Top insights with CLAUDE.md patches for this project.
    const patches = allInsights
      .filter((i) => (!cwdProject || i.projectDir === cwdProject) && i.claudeMdPatch !== null)
      .sort((a, b) => b.savingsEstimateUsd - a.savingsEstimateUsd)
      .slice(0, 5);

    const projectName = cwdProject
      ? cwdProject.split('-').filter(Boolean).slice(-1)[0] ?? cwdProject
      : 'all projects';

    process.stdout.write('\n');
    process.stdout.write(kleur.bold().cyan(`  🔧 burnd fix — CLAUDE.md patches for ${projectName}\n`));
    process.stdout.write(kleur.dim('  ─────────────────────────────────────────────\n\n'));

    if (patches.length === 0) {
      process.stdout.write(kleur.green('  ✓ No applicable CLAUDE.md patches for this project.\n\n'));
      return;
    }

    // Show patches and ask confirmation.
    process.stdout.write(kleur.bold(`  ${patches.length} patch${patches.length > 1 ? 'es' : ''} to apply:\n\n`));
    for (const insight of patches) {
      process.stdout.write(kleur.yellow(`  [${insight.detectorId}] saves ~$${insight.savingsEstimateUsd.toFixed(2)}\n`));
      process.stdout.write(kleur.green('  ┌─ Add to CLAUDE.md:\n'));
      const lines = (insight.claudeMdPatch ?? '').split('\n');
      for (const line of lines) {
        process.stdout.write(kleur.green(`  │ ${line}\n`));
      }
      process.stdout.write(kleur.green('  └─\n\n'));
    }

    // Find CLAUDE.md to write to.
    const { readFileSync: readFS, writeFileSync: writeFS, existsSync: existsFS } = await import('node:fs');
    const { join: joinPath } = await import('node:path');

    // Try to find CLAUDE.md in cwd or parent directories.
    let claudeMdPath: string | null = null;
    let searchDir = process.cwd();
    for (let i = 0; i < 5; i++) {
      const candidate = joinPath(searchDir, 'CLAUDE.md');
      if (existsFS(candidate)) { claudeMdPath = candidate; break; }
      const parent = joinPath(searchDir, '..');
      if (parent === searchDir) break;
      searchDir = parent;
    }

    if (!claudeMdPath) {
      claudeMdPath = joinPath(process.cwd(), 'CLAUDE.md');
      process.stdout.write(kleur.dim(`  Creating new CLAUDE.md at: ${claudeMdPath}\n\n`));
    } else {
      process.stdout.write(kleur.dim(`  Target: ${claudeMdPath}\n\n`));
    }

    process.stdout.write(kleur.bold('  Apply these patches? [y/N] '));

    // Read one char from stdin.
    const answer = await new Promise<string>((resolve) => {
      process.stdin.setRawMode?.(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf-8');
      process.stdin.once('data', (key) => {
        process.stdin.setRawMode?.(false);
        process.stdin.pause();
        resolve(String(key).toLowerCase().trim());
      });
    });

    process.stdout.write(answer + '\n\n');

    if (answer !== 'y') {
      process.stdout.write(kleur.dim('  Aborted. No files changed.\n\n'));
      return;
    }

    // Apply patches.
    const existing = existsFS(claudeMdPath) ? readFS(claudeMdPath, 'utf-8') : '';
    const patchLines = patches
      .map((p) => p.claudeMdPatch!)
      .filter((patch) => !existing.includes(patch.split('\n')[0]!)); // Skip already-applied patches.

    if (patchLines.length === 0) {
      process.stdout.write(kleur.green('  ✓ All patches already applied.\n\n'));
      return;
    }

    const separator = '\n\n# Added by burnd fix\n';
    const newContent = existing.trimEnd() + separator + patchLines.join('\n\n') + '\n';
    writeFS(claudeMdPath, newContent, 'utf-8');

    process.stdout.write(kleur.bold().green(`  ✓ Applied ${patchLines.length} patch${patchLines.length > 1 ? 'es' : ''} to ${claudeMdPath}\n`));
    process.stdout.write(kleur.dim('  Run `npx getburnd` in 7 days to see if costs dropped.\n\n'));
    return;
    }
  }

  // ── Check (pre-flight audit before a session) ───────────────────────
  if (opts.command === 'check') {
    {
    const { allStats, allInsights } = await scanSessions(opts.root, false);
    if (allStats.length === 0) {
      process.stdout.write('\n  No sessions found. Run a Claude Code session first.\n\n');
      return;
    }

    // Detect current project by matching cwd against projectDir encodings.
    const cwd = process.cwd().toLowerCase().replace(/[\\/]/g, '-');
    const cwdProject = allStats.find((s) => {
      const encoded = s.projectDir.toLowerCase();
      return cwd.includes(encoded.slice(-20)) || encoded.includes(cwd.slice(-20));
    })?.projectDir ?? null;

    // Get sessions for the detected (or most-active recent) project.
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentStats = allStats.filter((s) => (s.startedAt ?? '') >= sevenDaysAgo);

    // Group recent sessions by project and find the most active.
    const projectMap = new Map<string, SessionStats[]>();
    for (const s of recentStats) {
      const list = projectMap.get(s.projectDir) ?? [];
      list.push(s);
      projectMap.set(s.projectDir, list);
    }
    const targetProject = cwdProject ??
      [...projectMap.entries()].sort((a, b) => b[1].length - a[1].length)[0]?.[0] ?? null;

    const projectSessions = targetProject ? (projectMap.get(targetProject) ?? []) : recentStats;
    const avgCost = projectSessions.length > 0
      ? projectSessions.reduce((acc, s) => acc + s.totalCostUsd, 0) / projectSessions.length
      : 0;
    const avgTurns = projectSessions.length > 0
      ? Math.round(projectSessions.reduce((acc, s) => acc + s.assistantTurnCount, 0) / projectSessions.length)
      : 0;

    // Top active leaks for this project.
    const projectInsights = allInsights
      .filter((i) => !targetProject || i.projectDir === targetProject)
      .sort((a, b) => b.savingsEstimateUsd - a.savingsEstimateUsd)
      .slice(0, 3);

    const projectName = targetProject
      ? targetProject.split('-').filter(Boolean).slice(-1)[0] ?? targetProject
      : 'all projects';

    process.stdout.write('\n');
    process.stdout.write(kleur.bold().cyan(`  ⚡ burnd check — pre-flight for ${projectName}\n`));
    process.stdout.write(kleur.dim('  ─────────────────────────────────────────────\n'));
    process.stdout.write('\n');

    // Session cost profile.
    process.stdout.write(kleur.bold('  📊 Recent session profile (last 7 days)\n'));
    process.stdout.write(`     Sessions: ${kleur.cyan(String(projectSessions.length))}\n`);
    process.stdout.write(`     Avg cost/session: ${kleur.yellow('$' + avgCost.toFixed(2))}\n`);
    process.stdout.write(`     Avg turns/session: ${kleur.cyan(String(avgTurns))}\n`);

    if (avgCost > 5) {
      process.stdout.write(kleur.yellow(`\n  ⚠  High avg cost detected. Your sessions on this project run expensive.\n`));
    }
    process.stdout.write('\n');

    // Active leaks.
    if (projectInsights.length > 0) {
      process.stdout.write(kleur.bold('  🔥 Active leaks to fix before you start\n'));
      for (const insight of projectInsights) {
        process.stdout.write(`     ${kleur.red('•')} ${kleur.bold('$' + insight.savingsEstimateUsd.toFixed(2))} — ${insight.fixSteps[0]}\n`);
      }
      process.stdout.write('\n');
    }

    // Pre-session checklist.
    process.stdout.write(kleur.bold('  ✅ Pre-session checklist\n'));
    const checklist = [
      'Set model to Sonnet unless you need deep reasoning: add `model: claude-sonnet-4-6` to CLAUDE.md',
      'Pipe noisy commands: replace `npm test` with `npm test 2>&1 | tail -50`',
      'Start with a clear, scoped prompt — vague prompts generate 2-3× more turns',
      avgTurns > 50
        ? `Your sessions average ${avgTurns} turns — consider /compact after every major milestone`
        : 'Use /compact when the task shifts to a new feature to keep context clean',
    ];
    for (const item of checklist) {
      process.stdout.write(`     ${kleur.green('□')} ${item}\n`);
    }
    process.stdout.write('\n');
    process.stdout.write(kleur.dim(`  Run \`npx getburnd serve\` to see the full dashboard.\n\n`));
    return;
    }
  }

  // ── Digest (send weekly email summary via Resend) ────────────────────
  if (opts.command === 'digest') {
    const { allStats: digestStats } = await scanSessions(opts.root, false);
    const { buildSnapshot } = await import('./snapshot.js');
    const digestSnapshot = buildSnapshot(digestStats, { burndVersion: VERSION, filesScanned: digestStats.length, recordsParsed: 0, recordsSkipped: 0 });
    await sendWeeklyDigest(digestSnapshot);
    return;
  }

  // ── OpenClaw scan ────────────────────────────────────────────────────
  if (opts.command === 'openclaw') {
    const openclawRoot = opts.root !== defaultClaudeProjectsRoot() ? opts.root : defaultOpenClawRoot();
    process.stdout.write(kleur.dim(`\n  Scanning OpenClaw sessions at ${openclawRoot}...\n\n`));
    const result = await scanOpenClaw(openclawRoot);
    if (result.filesScanned === 0) {
      process.stdout.write(kleur.yellow('\n  No OpenClaw sessions found.\n'));
      process.stdout.write(kleur.dim(`  Looked in: ${openclawRoot}\n`));
      process.stdout.write(kleur.dim('  Have you run OpenClaw yet? Use --root to specify a custom path.\n\n'));
      return;
    }
    process.stdout.write(formatOpenClawSummary(result));
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

  // Default to the top 3 leaks; `--top <n>` overrides with no ceiling.
  const DEFAULT_TOP = 3;
  const requestedTop = Number.isFinite(opts.top) && opts.top > 0 ? opts.top : DEFAULT_TOP;
  const top = topNBySavings(allInsights, requestedTop);
  const hiddenLeaksCount = Math.max(0, allInsights.length - top.length);

  // Save history on every scan so `report` can show week-over-week trend.
  appendHistory(allStats, top, allFiles.length);

  // ── Alert webhooks — fire for expensive sessions ─────────────────────
  await fireAlertWebhooks(allStats);

  // ── Export ──────────────────────────────────────────────────────────
  if (opts.command === 'export') {
    const path = exportCsv(allStats);
    process.stdout.write(kleur.green(`\n  ✓ Exported ${allStats.length} sessions to:\n`));
    process.stdout.write(kleur.cyan(`    ${path}\n\n`));
    return;
  }

  // ── Report ─────────────────────────────────────────────────────────
  if (opts.command === 'report') {
    const history = readHistory();
    const path = generateWeeklyReport(allStats, top, history);
    process.stdout.write(kleur.green(`\n  ✓ Weekly report generated:\n`));
    process.stdout.write(kleur.cyan(`    ${path}\n`));
    process.stdout.write(kleur.dim('    Open it in your browser to view.\n\n'));
    return;
  }

  // ── Default scan output ─────────────────────────────────────────────

  // Increment run counter before any output. Used for email capture gating.
  const runCount = incrementRunCount();

  const totalCostUsdAllTime = allStats.reduce((acc, s) => acc + s.totalCostUsd, 0);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const totalCostUsdLast7Days = allStats
    .filter((s) => (s.startedAt ?? '') >= sevenDaysAgo)
    .reduce((acc, s) => acc + s.totalCostUsd, 0);

  // Collect active detector IDs for delta + creep tracking.
  const activeDetectorIds = [...new Set(top.map((i) => i.detectorId))];
  const potentialSavingsUsd = totalSavingsUsd(top);

  // ── Read last scan before printing anything ─────────────────────────
  const lastScan = readLastScan();
  const isFirstScan = lastScan === null;

  // ── Write this scan so next run can compare ─────────────────────────
  writeLastScan({
    date: new Date().toISOString().slice(0, 10),
    totalCostUsdAllTime,
    totalCostUsdLast7Days,
    sessionsScanned: allStats.length,
    filesScanned: allFiles.length,
    activeDetectorIds,
    potentialSavingsUsd,
  });

  // ── Email capture on run 2 (before output, gates the delta) ─────────
  const emailContext = {
    version: VERSION,
    platform: process.platform,
    detectorIds: activeDetectorIds,
  };
  if (runCount >= 2) {
    await promptEmailCapture(emailContext);
  }

  // ── Fire anonymous telemetry (opt-in implied by email capture) ──────
  // Best-effort, no await — never block output on network.
  fireTelemetry({
    event: 'scan',
    ...emailContext,
    runCountTier: runCount === 1 ? '1' : runCount === 2 ? '2' : runCount <= 5 ? '3-5' : runCount <= 10 ? '6-10' : '10+',
  }).catch(() => {/* silent */});

  printHeader();
  printOverview({
    filesScanned: allFiles.length,
    sessionsScanned: allStats.length,
    totalCostUsdAllTime,
    totalCostUsdLast7Days,
    totalSavingsAvailableUsd: potentialSavingsUsd,
  });

  // Unpriced models make every dollar figure above an estimate on a guess.
  // Say so loudly rather than printing a confident wrong number.
  const unpriced = unknownModels();
  if (unpriced.length > 0) {
    process.stdout.write(
      kleur.yellow('  ⚠  Unpriced model') + kleur.yellow(unpriced.length === 1 ? '' : 's') +
      kleur.yellow(': ') + kleur.bold().yellow(unpriced.join(', ')) + '\n',
    );
    process.stdout.write(
      kleur.dim('     Costs for these are estimated at the highest current rate and may be too high.\n'),
    );
    process.stdout.write(
      kleur.dim('     Update the rate table: ') + kleur.cyan('github.com/garvitsurana271/burnd') +
      kleur.dim(' → src/cli/src/pricing.ts\n\n'),
    );
  }

  // ── vs last scan delta (run 2+) ─────────────────────────────────────
  if (lastScan !== null) {
    const delta = computeDelta(lastScan, {
      totalCostUsdLast7Days,
      activeDetectorIds,
      potentialSavingsUsd,
    });
    printDelta(delta, lastScan);

    // Spend creep: leaks active in both this AND last scan.
    printSpendCreepWarning(activeDetectorIds, lastScan.activeDetectorIds);
  }

  printTopInsights(top);

  // Tell the user how many more leaks exist beyond the ones printed, so the
  // default top-3 view never hides the scale of what was found.
  if (hiddenLeaksCount > 0) {
    const totalSavingsHidden = allInsights
      .slice(requestedTop)
      .reduce((acc, i) => acc + i.savingsEstimateUsd, 0);
    process.stdout.write(
      kleur.dim('  ') +
      kleur.bold().yellow(`+ ${hiddenLeaksCount} more leak${hiddenLeaksCount === 1 ? '' : 's'}`) +
      kleur.dim(` worth ~$${totalSavingsHidden.toFixed(2)} — see them with `) +
      kleur.cyan(`--top ${allInsights.length}`) +
      kleur.dim('\n\n'),
    );
  }

  if (top.length > 0) {
    const savings = potentialSavingsUsd;
    const sharePayload: SharePayload = {
      v: 1,
      t: totalCostUsdAllTime,
      w: totalCostUsdLast7Days,
      s: savings,
      n: allStats.length,
      l: top.slice(0, 3).map((i) => ({ title: i.title, save: i.savingsEstimateUsd })),
      g: new Date().toISOString().slice(0, 10),
    };
    const shareUrl = buildShareUrl(sharePayload);
    printShareBlock(top[0]!.title, savings, shareUrl);
  }

  // ── Budget after scan (shown whenever one is configured) ────────────
  {
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

  // Show shell alias hint on first scan only.
  if (isFirstScan) {
    printAliasHint();
  }
}

main().catch((err: unknown) => {
  process.stderr.write(`burnd: error: ${(err as Error).message ?? String(err)}\n`);
  process.exit(1);
});
