// Walker for OpenClaw's session directory structure.
//
// OpenClaw stores sessions differently from Claude Code — instead of flat JSONL
// files per session, it uses an index file (sessions.json) that maps session
// keys to the actual JSONL paths.
//
// Directory layout:
//   ~/.openclaw/agents/<agentId>/sessions/sessions.json   ← index
//   <path-from-index>.jsonl                               ← session data
//
// Legacy roots (OpenClaw was renamed twice in early 2026):
//   ~/.clawdbot/    ← original name
//   ~/.moltbot/     ← first rename
//   ~/.moldbot/     ← second rename (typo that stuck briefly)
//
// We probe all roots and deduplicate by resolved session file path.

import { readdir, readFile, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import type { SessionsIndex } from './types.js';

export interface OpenClawSessionFile {
  absPath: string;       // Absolute path to the .jsonl file
  sessionId: string;     // From the sessions.json index
  agentId: string;       // The agent directory name (e.g. "main")
  sizeBytes: number;
}

// All roots we check, newest-name first.
const OPENCLAW_ROOT_NAMES = ['.openclaw', '.moldbot', '.moltbot', '.clawdbot'];

export function defaultOpenClawRoot(): string {
  // Return the first root that exists, or the canonical one as fallback.
  return join(homedir(), '.openclaw');
}

// Walk all known OpenClaw roots and yield every session JSONL file found.
// Deduplicates by resolved absolute path so legacy roots don't double-count.
export async function* walkOpenClawSessions(
  explicitRoot?: string,
): AsyncGenerator<OpenClawSessionFile> {
  const seen = new Set<string>();

  const roots = explicitRoot
    ? [explicitRoot]
    : OPENCLAW_ROOT_NAMES.map((name) => join(homedir(), name));

  for (const root of roots) {
    yield* walkRoot(root, seen);
  }
}

async function* walkRoot(
  root: string,
  seen: Set<string>,
): AsyncGenerator<OpenClawSessionFile> {
  // Check ~/.openclaw/agents/ directory
  const agentsDir = join(root, 'agents');
  let agentDirs: string[];
  try {
    agentDirs = await readdir(agentsDir);
  } catch {
    return; // Root or agents dir doesn't exist
  }

  for (const agentId of agentDirs) {
    const sessionsDir = join(agentsDir, agentId, 'sessions');
    const indexPath = join(sessionsDir, 'sessions.json');

    let indexRaw: string;
    try {
      indexRaw = await readFile(indexPath, 'utf8');
    } catch {
      continue; // No index file for this agent
    }

    let index: SessionsIndex;
    try {
      index = JSON.parse(indexRaw) as SessionsIndex;
    } catch {
      continue; // Malformed index — skip silently
    }

    for (const [, entry] of Object.entries(index)) {
      if (!entry?.sessionFile || !entry?.sessionId) continue;

      // Resolve relative paths against the sessions directory.
      const absPath = resolve(sessionsDir, entry.sessionFile);

      if (seen.has(absPath)) continue; // Already yielded from another root
      seen.add(absPath);

      let fileStat;
      try {
        fileStat = await stat(absPath);
      } catch {
        continue; // File missing or unreadable
      }

      if (!fileStat.isFile()) continue;

      yield {
        absPath,
        sessionId: entry.sessionId,
        agentId,
        sizeBytes: fileStat.size,
      };
    }
  }
}
