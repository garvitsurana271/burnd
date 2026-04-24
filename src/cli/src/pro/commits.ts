// Cost-per-commit — correlates Claude Code sessions with git commits.
//
// For each session, we look for git commits made within 2 hours of the
// session ending. This gives an approximate "AI cost per commit shipped"
// metric — the most developer-legible way to measure ROI on Claude spend.
//
// This is read-only: we only run `git log`, never modify any repo.

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { SessionStats } from '../session.js';

export interface CommitCorrelation {
  projectDir: string;
  displayName: string;
  totalCostUsd: number;
  commitCount: number;
  costPerCommit: number; // totalCostUsd / commitCount
  sessionCount: number;
}

// Decode a Claude-encoded projectDir to a likely filesystem path.
// The encoding on Windows: C:\Users\Foo\Bar → c--Users-Foo-Bar
// On Unix: /Users/foo/bar → -Users-foo-bar
// This is best-effort — spaces and path separators are both encoded as '-'.
function decodeProjectDir(projectDir: string): string[] {
  const candidates: string[] = [];

  // Windows: starts with letter + '--'
  const winMatch = projectDir.match(/^([a-zA-Z])--(.+)$/);
  if (winMatch) {
    const [, drive, rest] = winMatch;
    // Try with backslashes (most common — path separators)
    candidates.push(`${drive!.toUpperCase()}:\\${rest!.replace(/-/g, '\\')}`);
    // Also try the raw decoded form
    candidates.push(`${drive!.toUpperCase()}:\\${rest!}`);
  }

  // Unix: starts with '-'
  if (projectDir.startsWith('-')) {
    candidates.push(projectDir.replace(/-/g, '/'));
  }

  return candidates;
}

function findGitRoot(candidates: string[]): string | null {
  for (const candidate of candidates) {
    if (existsSync(join(candidate, '.git'))) return candidate;
    // Walk up one level in case the decoded path is off by one segment.
    const parent = candidate.split(/[\\/]/).slice(0, -1).join('\\') || candidate.split('/').slice(0, -1).join('/');
    if (parent && existsSync(join(parent, '.git'))) return parent;
  }
  return null;
}

function countCommitsInWindow(gitRoot: string, since: string, until: string): number {
  try {
    const result = execSync(
      `git -C "${gitRoot}" log --oneline --after="${since}" --before="${until}" --no-merges 2>/dev/null`,
      { timeout: 5000, encoding: 'utf-8' },
    );
    return result.trim().split('\n').filter(Boolean).length;
  } catch {
    return 0;
  }
}

export function computeCostPerCommit(allStats: SessionStats[]): CommitCorrelation[] {
  // Group sessions by project.
  const byProject = new Map<string, SessionStats[]>();
  for (const s of allStats) {
    const list = byProject.get(s.projectDir) ?? [];
    list.push(s);
    byProject.set(s.projectDir, list);
  }

  const results: CommitCorrelation[] = [];

  for (const [projectDir, sessions] of byProject.entries()) {
    const candidates = decodeProjectDir(projectDir);
    const gitRoot = findGitRoot(candidates);
    if (!gitRoot) continue; // Not a git repo or can't find it.

    let totalCommits = 0;
    let totalCost = 0;

    for (const session of sessions) {
      if (!session.endedAt) continue;
      const endTime = new Date(session.endedAt);
      // Window: session start → 2 hours after session end.
      const windowStart = session.startedAt ?? session.endedAt;
      const windowEnd = new Date(endTime.getTime() + 2 * 60 * 60 * 1000).toISOString();
      const commits = countCommitsInWindow(gitRoot, windowStart, windowEnd);
      totalCommits += commits;
      totalCost += session.totalCostUsd;
    }

    if (totalCommits === 0) continue;

    const displayName = projectDir.split('-').filter(Boolean).slice(-1)[0] ?? projectDir;
    results.push({
      projectDir,
      displayName,
      totalCostUsd: totalCost,
      commitCount: totalCommits,
      costPerCommit: totalCost / totalCommits,
      sessionCount: sessions.length,
    });
  }

  return results.sort((a, b) => b.totalCostUsd - a.totalCostUsd);
}

export function printCostPerCommit(correlations: CommitCorrelation[]): void {
  if (correlations.length === 0) {
    process.stdout.write('  No git repos found for your projects. Make sure your projects are git repos.\n\n');
    return;
  }

  process.stdout.write('\n  💰 Cost per commit (Claude spend ÷ commits made within 2h of each session)\n\n');
  for (const c of correlations) {
    const bar = '█'.repeat(Math.min(20, Math.ceil(c.costPerCommit * 2)));
    process.stdout.write(`  ${c.displayName.padEnd(20)} $${c.costPerCommit.toFixed(2)}/commit  ${bar}\n`);
    process.stdout.write(`  ${''.padEnd(20)} ${c.commitCount} commits · ${c.sessionCount} sessions · $${c.totalCostUsd.toFixed(2)} total\n\n`);
  }
}
