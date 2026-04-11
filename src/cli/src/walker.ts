// Recursive walker over Claude Code's projects directory.
//
// Locates all .jsonl session files under ~/.claude/projects/ and yields
// their absolute paths. Walks recursively to handle the subagents/
// subdirectory pattern documented in notes/jsonl-format.md.
//
// On Windows the default location is C:\Users\<user>\.claude\projects\.
// On macOS/Linux it's ~/.claude/projects/. The walker accepts an explicit
// root path so callers can override for testing or non-default installs.

import { readdir, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

export interface JsonlFile {
  absPath: string;
  relPath: string;
  sizeBytes: number;
  // The encoded project directory name (e.g., 'c--Users-Garvit-Surana-Desktop-Projects-Burnd').
  // Same string for both top-level and subagent files belonging to the same project.
  projectDir: string;
  // True if this file is in a subagents/ subdirectory under a session UUID.
  isSubagent: boolean;
}

// Default root: ~/.claude/projects/
export function defaultClaudeProjectsRoot(): string {
  return join(homedir(), '.claude', 'projects');
}

// Walk a Claude projects root directory and yield every .jsonl file found.
// Walks recursively (top-level files + nested subagents/ files).
export async function* walkJsonlFiles(root: string = defaultClaudeProjectsRoot()): AsyncGenerator<JsonlFile> {
  let projectDirs: string[];
  try {
    projectDirs = await readdir(root);
  } catch {
    // Root doesn't exist or isn't readable — common on first-time users
    // who haven't run Claude Code yet. Yield nothing and let the caller
    // produce a friendly error.
    return;
  }

  for (const projectDir of projectDirs) {
    const projectPath = join(root, projectDir);
    let entries: string[];
    try {
      entries = await readdir(projectPath);
    } catch {
      continue;
    }

    for (const entry of entries) {
      const entryPath = join(projectPath, entry);
      let entryStat;
      try {
        entryStat = await stat(entryPath);
      } catch {
        continue;
      }

      if (entryStat.isFile() && entry.endsWith('.jsonl')) {
        yield {
          absPath: entryPath,
          relPath: join(projectDir, entry),
          sizeBytes: entryStat.size,
          projectDir,
          isSubagent: false,
        };
      } else if (entryStat.isDirectory()) {
        // Walk into <session-uuid>/subagents/ for nested subagent files.
        yield* walkSubagents(entryPath, projectDir);
      }
    }
  }
}

async function* walkSubagents(sessionUuidDir: string, projectDir: string): AsyncGenerator<JsonlFile> {
  let entries: string[];
  try {
    entries = await readdir(sessionUuidDir);
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry !== 'subagents') continue;
    const subagentDir = join(sessionUuidDir, 'subagents');
    let subagentFiles: string[];
    try {
      subagentFiles = await readdir(subagentDir);
    } catch {
      continue;
    }
    for (const file of subagentFiles) {
      if (!file.endsWith('.jsonl')) continue;
      const absPath = join(subagentDir, file);
      try {
        const fileStat = await stat(absPath);
        yield {
          absPath,
          relPath: join(projectDir, 'subagents', file),
          sizeBytes: fileStat.size,
          projectDir,
          isSubagent: true,
        };
      } catch {
        continue;
      }
    }
  }
}
