// Streaming JSONL parser for OpenClaw session files.
//
// Same streaming-first philosophy as the Claude Code parser: never load whole
// files into memory, fail soft on bad lines, keep parsing after errors.
//
// OpenClaw session files are simpler than Claude Code's — only two record
// types matter: model_change and message. Everything else is skipped.

import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { isModelChange, isMessage } from './types.js';
import type { OpenClawRecord } from './types.js';

export interface OpenClawParseStats {
  linesTotal: number;
  linesParsed: number;
  linesSkipped: number;
  bytesRead: number;
}

// Stream OpenClaw records lazily from a JSONL file.
// Yields only records we understand (model_change, message).
// Bad lines are silently counted in stats and skipped — never throws.
export async function* streamOpenClawRecords(
  filePath: string,
  stats: OpenClawParseStats,
): AsyncGenerator<OpenClawRecord> {
  const stream = createReadStream(filePath, { encoding: 'utf8' });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (!line.trim()) continue;
    stats.linesTotal += 1;
    stats.bytesRead += line.length + 1;

    const record = tryParseLine(line);
    if (record === null) {
      stats.linesSkipped += 1;
      continue;
    }
    stats.linesParsed += 1;
    yield record;
  }
}

function tryParseLine(line: string): OpenClawRecord | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(line);
  } catch {
    return null;
  }

  if (isModelChange(parsed)) return parsed;
  if (isMessage(parsed)) return parsed;
  return null; // Unknown type — skip
}
