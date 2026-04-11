// LOAD-BEARING test — this is the privacy CI gate.
//
// The fixture file `secret-leak.jsonl` contains a set of fake secret markers
// embedded in every place a real session might leak data: user prompts,
// assistant thinking blocks, tool inputs, tool outputs, file-history snapshots
// (literal source code), AI titles, attachment file names, and git branch names.
//
// Each marker is unique and recognizable (CANARY-PASSWORD, CANARY-AWS-KEY, etc.).
// This test parses the fixture, runs every record through the anonymization
// pipeline, and asserts that NONE of the markers appear anywhere in the
// upload payload.
//
// If this test ever fails, the parser has been changed in a way that leaks
// content. Do NOT silence this test. Fix the leak.

import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseFile } from '../src/parser.js';
import { anonymize } from '../src/anonymize.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SECRET_MARKERS = [
  'CANARY-PASSWORD',
  'CANARY-AWS-KEY',
  'CANARY-PRIVATE-KEY',
  'CANARY-DB-PASSWORD',
  'CANARY-STRIPE-KEY',
  'CANARY-AI-TITLE',
  'CANARY-FILENAME',
  'CANARY-THINKING-CONTENT',
  'super-secret-project',
  'feat/acme-customer-deal',
  'hunter2',
  'AKIA-CANARY',
  'sk_live_CANARY',
  'BEGIN CANARY-PRIVATE-KEY',
  '/etc/passwd',
  'employee-salaries',
  // Common real-world patterns we never want to see in upload payloads:
  'BEGIN PRIVATE KEY',
  'BEGIN RSA PRIVATE KEY',
  'sk_live_',
  'AKIA',
];

describe('secret-leak CI gate (load-bearing privacy test)', () => {
  it('the anonymized payload of a malicious fixture file leaks ZERO secrets', async () => {
    const path = join(__dirname, 'fixtures', 'secret-leak.jsonl');
    const result = await parseFile(path);

    // Build the upload payload as it would actually be uploaded:
    // every record run through anonymize(), nulls dropped.
    const uploadPayload: unknown[] = [];
    for (const record of result.records) {
      const anon = anonymize(record);
      if (anon !== null) uploadPayload.push(anon);
    }

    // Serialize to a single string and search for every secret marker.
    const serialized = JSON.stringify(uploadPayload);

    const leaked: string[] = [];
    for (const marker of SECRET_MARKERS) {
      if (serialized.includes(marker)) leaked.push(marker);
    }

    if (leaked.length > 0) {
      // Print clearly so a CI failure is unmissable.
      throw new Error(
        `Secret leak detected in upload payload. The following markers were found:\n` +
          leaked.map((m) => `  - ${m}`).join('\n') +
          `\n\nThis is a non-negotiable failure. Do NOT silence this test. Fix the leak.`,
      );
    }
    expect(leaked).toEqual([]);
  });

  it('the parser still successfully reads the fixture (sanity check)', async () => {
    const path = join(__dirname, 'fixtures', 'secret-leak.jsonl');
    const result = await parseFile(path);
    expect(result.stats.recordsTotal).toBeGreaterThan(0);
    expect(result.stats.recordsParsed).toBeGreaterThan(0);
  });
});
