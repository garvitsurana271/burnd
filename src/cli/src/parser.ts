// Streaming JSONL parser for Claude Code session files.
//
// MUST stream line-by-line. The largest observed session file in Garvit's
// own data is 101.5 MB (KropScan-V1). Loading whole files into memory would
// OOM on heavy users. The schema study in notes/jsonl-format.md is the
// authoritative format reference.
//
// Failure mode: fail soft, never crash. If a line fails to parse, increment
// a counter and continue with the next line. Burnd's value is "better than
// zero visibility" — partial parsing beats no parsing.

import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import type { SessionRecord } from './types.js';

export interface ParseStats {
  recordsTotal: number;
  recordsParsed: number;
  recordsSkipped: number;
  bytesRead: number;
}

export interface ParseResult {
  records: SessionRecord[];
  stats: ParseStats;
}

// Parse a single JSONL file and return all records plus stats.
// Used by tests and by the per-session aggregator. For large files used
// in production analytics, prefer streamRecords() to avoid holding the
// whole array in memory.
export async function parseFile(filePath: string): Promise<ParseResult> {
  const stats: ParseStats = {
    recordsTotal: 0,
    recordsParsed: 0,
    recordsSkipped: 0,
    bytesRead: 0,
  };
  const records: SessionRecord[] = [];
  for await (const record of streamRecords(filePath, stats)) {
    records.push(record);
  }
  return { records, stats };
}

// Stream records lazily from a JSONL file. Caller passes a stats object
// that gets mutated as parsing progresses. The stream yields each successfully
// parsed record; failures are silently counted in stats.recordsSkipped.
export async function* streamRecords(
  filePath: string,
  stats: ParseStats,
): AsyncGenerator<SessionRecord> {
  const stream = createReadStream(filePath, { encoding: 'utf8' });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (!line.trim()) continue;
    stats.recordsTotal += 1;
    stats.bytesRead += line.length + 1; // +1 for the newline

    const record = tryParseLine(line);
    if (record === null) {
      stats.recordsSkipped += 1;
      continue;
    }
    stats.recordsParsed += 1;
    yield record;
  }
}

// Parse a single JSONL line. Returns null on any failure (invalid JSON,
// missing required fields, unknown structure). Never throws.
function tryParseLine(line: string): SessionRecord | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(line);
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) return null;
  const obj = parsed as Record<string, unknown>;

  // The `type` discriminator is the only required field — all other fields
  // are validated lazily by consumers. This is intentional: the parser stays
  // permissive so format additions in future Claude Code versions don't
  // break existing parsing.
  if (typeof obj.type !== 'string') return null;

  return obj as unknown as SessionRecord;
}
