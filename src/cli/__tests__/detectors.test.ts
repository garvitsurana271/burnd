import { describe, it, expect } from 'vitest';
import { newEmptyStats, ingestRecord } from '../src/session.js';
import { runAllDetectors, ALL_DETECTORS } from '../src/detectors/index.js';
import { rankBySavings, topNBySavings } from '../src/insights.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseFile } from '../src/parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('detector framework', () => {
  it('exports a non-empty list of detectors', () => {
    expect(ALL_DETECTORS.length).toBeGreaterThan(0);
  });

  it('every detector has a unique id', () => {
    const ids = ALL_DETECTORS.map((d) => d.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('runs every detector against an empty stats object without crashing', () => {
    const stats = newEmptyStats('empty-001', '/tmp/empty.jsonl', 'tmp', false);
    const insights = runAllDetectors(stats);
    expect(insights).toEqual([]);
  });
});

describe('long-bash-output detector', () => {
  it('flags a session where Bash returns long output', async () => {
    const result = await parseFile(
      join(__dirname, 'fixtures', 'tool-heavy-session.jsonl'),
    );
    const stats = newEmptyStats('tool-heavy-001', '/tmp/x.jsonl', 'demo', false);
    for (const r of result.records) ingestRecord(stats, r);

    // The fixture has 1 Bash call with a ~6000-byte output. The detector
    // requires >=3 calls to fire, so a single-call fixture should NOT fire it.
    // (We're testing the false-negative path here; the positive path is
    // covered by the synthesized stats test below.)
    const insights = runAllDetectors(stats);
    const longBash = insights.filter((i) => i.detectorId === 'long-bash-output');
    expect(longBash.length).toBe(0);
  });

  it('fires when synthesized stats have many large Bash outputs', () => {
    const stats = newEmptyStats('synth-001', '/tmp/y.jsonl', 'synth', false);
    stats.toolStats.set('Bash', {
      callCount: 10,
      totalOutputBytes: 100_000, // avg 10kb per call → triggers >5kb threshold
      errorCount: 0,
    });
    stats.totalCostUsd = 5;

    const insights = runAllDetectors(stats);
    const longBash = insights.filter((i) => i.detectorId === 'long-bash-output');
    expect(longBash.length).toBe(1);
    expect(longBash[0]!.savingsEstimateUsd).toBeGreaterThan(0);
    expect(longBash[0]!.fixSteps.length).toBeGreaterThan(0);
  });
});

describe('thrash detector', () => {
  it('fires when error rate is high', () => {
    const stats = newEmptyStats('thrash-001', '/tmp/z.jsonl', 'demo', false);
    stats.toolStats.set('Bash', {
      callCount: 20,
      totalOutputBytes: 1000,
      errorCount: 12, // 60% error rate
    });
    stats.totalCostUsd = 5;

    const insights = runAllDetectors(stats);
    const thrash = insights.filter((i) => i.detectorId === 'thrash');
    expect(thrash.length).toBe(1);
  });

  it('does not fire on low-cost sessions', () => {
    const stats = newEmptyStats('thrash-002', '/tmp/zz.jsonl', 'demo', false);
    stats.toolStats.set('Bash', { callCount: 4, totalOutputBytes: 100, errorCount: 3 });
    stats.totalCostUsd = 0.1;
    const insights = runAllDetectors(stats);
    const thrash = insights.filter((i) => i.detectorId === 'thrash');
    expect(thrash.length).toBe(0);
  });
});

describe('tool-overuse detector', () => {
  it('fires when one tool dominates the call mix', () => {
    const stats = newEmptyStats('overuse-001', '/tmp/q.jsonl', 'demo', false);
    stats.toolStats.set('Bash', { callCount: 80, totalOutputBytes: 1000, errorCount: 0 });
    stats.toolStats.set('Edit', { callCount: 5, totalOutputBytes: 100, errorCount: 0 });
    stats.toolStats.set('Read', { callCount: 5, totalOutputBytes: 100, errorCount: 0 });
    stats.totalCostUsd = 5;

    const insights = runAllDetectors(stats);
    const overuse = insights.filter((i) => i.detectorId === 'tool-overuse');
    expect(overuse.length).toBe(1);
    expect(overuse[0]!.title).toContain('Bash');
  });
});

describe('repeated-read detector', () => {
  it('fires when the same file is read 3+ times', () => {
    const stats = newEmptyStats('reread-001', '/tmp/r.jsonl', 'demo', false);
    stats.readCountsByPathHash.set('hash-of-config-yaml', 5);
    stats.readCountsByPathHash.set('hash-of-package-json', 4);

    const insights = runAllDetectors(stats);
    const reread = insights.filter((i) => i.detectorId === 'repeated-read');
    expect(reread.length).toBe(1);
  });
});

describe('insights ranking', () => {
  it('ranks insights by savings descending', () => {
    const stats1 = newEmptyStats('s1', '/tmp/1.jsonl', 'd', false);
    stats1.toolStats.set('Bash', { callCount: 10, totalOutputBytes: 100_000, errorCount: 0 });
    stats1.totalCostUsd = 5;

    const stats2 = newEmptyStats('s2', '/tmp/2.jsonl', 'd', false);
    stats2.toolStats.set('Bash', { callCount: 100, totalOutputBytes: 2_000_000, errorCount: 0 });
    stats2.totalCostUsd = 50;

    const all = [...runAllDetectors(stats1), ...runAllDetectors(stats2)];
    const ranked = rankBySavings(all);
    for (let i = 0; i < ranked.length - 1; i++) {
      expect(ranked[i]!.savingsEstimateUsd).toBeGreaterThanOrEqual(
        ranked[i + 1]!.savingsEstimateUsd,
      );
    }
    const top = topNBySavings(all, 1);
    expect(top.length).toBe(1);
    expect(top[0]!.savingsEstimateUsd).toBe(ranked[0]!.savingsEstimateUsd);
  });
});
