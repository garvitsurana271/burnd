import { describe, it, expect } from 'vitest';
import { newEmptyStats, ingestRecord } from '../src/session.js';
import {
  runAllDetectors,
  runAllMultiSessionDetectors,
  ALL_DETECTORS,
  MULTI_SESSION_DETECTORS,
} from '../src/detectors/index.js';
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

describe('tired-coding detector', () => {
  // v0.0.16: the detector now requires a UserBaseline computed from the
  // user's full session history. It flags sessions that are BOTH outside
  // the user's focus window AND above their P75 cost — a per-user rule,
  // not a hardcoded UTC window.
  const baseline = {
    sessionCostP50: 2.0,
    sessionCostP75: 3.0,
    sessionCostP90: 4.5,
    totalSpendUsd: 50,
    sessionCount: 20,
    localTimezone: 'UTC', // UTC so the test times below are treated as local
    focusWindowStart: 9,
    focusWindowEnd: 19,
  };

  it('fires for expensive sessions outside the focus window', () => {
    const stats = newEmptyStats('tired-001', '/tmp/t.jsonl', 'demo', false);
    stats.startedAt = '2026-04-01T02:30:00.000Z'; // 2:30 local, outside 09-19
    stats.totalCostUsd = 5; // > P75 of 3.0
    const insights = runAllDetectors(stats, baseline);
    const tired = insights.filter((i) => i.detectorId === 'tired-coding');
    expect(tired.length).toBe(1);
  });

  it('does not fire for sessions inside the focus window', () => {
    const stats = newEmptyStats('day-001', '/tmp/d.jsonl', 'demo', false);
    stats.startedAt = '2026-04-01T14:00:00.000Z'; // 14 local, inside 09-19
    stats.totalCostUsd = 5;
    const insights = runAllDetectors(stats, baseline);
    const tired = insights.filter((i) => i.detectorId === 'tired-coding');
    expect(tired.length).toBe(0);
  });

  it('does not fire for outside-window sessions below user P75', () => {
    const stats = newEmptyStats('cheap-001', '/tmp/c.jsonl', 'demo', false);
    stats.startedAt = '2026-04-01T02:30:00.000Z'; // outside window
    stats.totalCostUsd = 1.5; // below P75 of 3.0 — normal cost, just late
    const insights = runAllDetectors(stats, baseline);
    const tired = insights.filter((i) => i.detectorId === 'tired-coding');
    expect(tired.length).toBe(0);
  });

  it('degrades silently when no baseline provided', () => {
    const stats = newEmptyStats('no-ctx-001', '/tmp/n.jsonl', 'demo', false);
    stats.startedAt = '2026-04-01T02:30:00.000Z';
    stats.totalCostUsd = 5;
    const insights = runAllDetectors(stats);
    const tired = insights.filter((i) => i.detectorId === 'tired-coding');
    expect(tired.length).toBe(0);
  });
});

describe('retry-storm detector', () => {
  it('fires when there are 5+ retries', () => {
    const stats = newEmptyStats('retry-001', '/tmp/r.jsonl', 'demo', false);
    stats.apiErrorCount = 8;
    stats.apiRetryCount = 8;
    const insights = runAllDetectors(stats);
    const storm = insights.filter((i) => i.detectorId === 'retry-storm');
    expect(storm.length).toBe(1);
  });

  it('does not fire when retries are below threshold', () => {
    const stats = newEmptyStats('retry-002', '/tmp/r.jsonl', 'demo', false);
    stats.apiErrorCount = 2;
    stats.apiRetryCount = 2;
    const insights = runAllDetectors(stats);
    const storm = insights.filter((i) => i.detectorId === 'retry-storm');
    expect(storm.length).toBe(0);
  });
});

describe('skill-firing detector', () => {
  it('fires when Skill dominates the tool mix', () => {
    const stats = newEmptyStats('skill-001', '/tmp/s.jsonl', 'demo', false);
    stats.toolStats.set('Skill', { callCount: 10, totalOutputBytes: 100, errorCount: 0 });
    stats.toolStats.set('Bash', { callCount: 5, totalOutputBytes: 100, errorCount: 0 });
    stats.totalCostUsd = 5;
    const insights = runAllDetectors(stats);
    const skill = insights.filter((i) => i.detectorId === 'skill-firing');
    expect(skill.length).toBe(1);
  });

  it('does not fire when Skill is occasional', () => {
    const stats = newEmptyStats('skill-002', '/tmp/s.jsonl', 'demo', false);
    stats.toolStats.set('Skill', { callCount: 2, totalOutputBytes: 100, errorCount: 0 });
    stats.toolStats.set('Bash', { callCount: 50, totalOutputBytes: 100, errorCount: 0 });
    stats.totalCostUsd = 5;
    const insights = runAllDetectors(stats);
    const skill = insights.filter((i) => i.detectorId === 'skill-firing');
    expect(skill.length).toBe(0);
  });
});

describe('project-cost-outlier detector (multi-session)', () => {
  it('fires when one project has a much higher median than the user average', () => {
    const allStats = [
      // Lots of cheap sessions in 3 projects (so the overall median stays low)
      makeStats('a1', 'project-a', 0.5),
      makeStats('a2', 'project-a', 0.6),
      makeStats('a3', 'project-a', 0.7),
      makeStats('a4', 'project-a', 0.8),
      makeStats('a5', 'project-a', 1.0),
      makeStats('c1', 'project-c', 0.5),
      makeStats('c2', 'project-c', 0.6),
      makeStats('c3', 'project-c', 0.7),
      makeStats('d1', 'project-d', 0.4),
      makeStats('d2', 'project-d', 0.5),
      makeStats('d3', 'project-d', 0.6),
      // Project B: 5 sessions massively above the overall median
      makeStats('b1', 'project-b', 30),
      makeStats('b2', 'project-b', 40),
      makeStats('b3', 'project-b', 50),
      makeStats('b4', 'project-b', 60),
      makeStats('b5', 'project-b', 70),
    ];
    const insights = runAllMultiSessionDetectors(allStats);
    const outliers = insights.filter((i) => i.detectorId === 'project-cost-outlier');
    expect(outliers.length).toBeGreaterThanOrEqual(1);
    // The outlier should be project-b, not project-a.
    expect(outliers.some((i) => i.projectDir === 'project-b')).toBe(true);
    expect(outliers.every((i) => i.projectDir !== 'project-a')).toBe(true);
  });

  it('does not fire when all projects have similar cost', () => {
    const allStats = [
      makeStats('x1', 'project-x', 1),
      makeStats('x2', 'project-x', 1.1),
      makeStats('x3', 'project-x', 0.9),
      makeStats('y1', 'project-y', 1.05),
      makeStats('y2', 'project-y', 0.95),
      makeStats('y3', 'project-y', 1),
    ];
    const insights = runAllMultiSessionDetectors(allStats);
    const outliers = insights.filter((i) => i.detectorId === 'project-cost-outlier');
    expect(outliers.length).toBe(0);
  });
});

describe('multi-session detector registry', () => {
  it('exposes a non-empty list', () => {
    expect(MULTI_SESSION_DETECTORS.length).toBeGreaterThan(0);
  });
});

function makeStats(sessionId: string, projectDir: string, cost: number) {
  const s = newEmptyStats(sessionId, `/tmp/${sessionId}.jsonl`, projectDir, false);
  s.totalCostUsd = cost;
  return s;
}

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
