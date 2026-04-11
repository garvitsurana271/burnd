import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseFile } from '../src/parser.js';
import { isAssistant, isUser } from '../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, 'fixtures');

describe('streaming JSONL parser', () => {
  it('parses a minimal session file end-to-end', async () => {
    const result = await parseFile(join(fixturesDir, 'minimal-session.jsonl'));

    expect(result.stats.recordsTotal).toBe(4);
    expect(result.stats.recordsParsed).toBe(4);
    expect(result.stats.recordsSkipped).toBe(0);

    const types = result.records.map((r) => r.type);
    expect(types).toContain('queue-operation');
    expect(types).toContain('user');
    expect(types).toContain('assistant');
    expect(types).toContain('ai-title');
  });

  it('discriminates assistant vs user records via type guards', async () => {
    const result = await parseFile(join(fixturesDir, 'minimal-session.jsonl'));

    const assistants = result.records.filter(isAssistant);
    const users = result.records.filter(isUser);

    expect(assistants.length).toBe(1);
    expect(users.length).toBe(1);

    const assistant = assistants[0]!;
    expect(assistant.message.model).toBe('claude-sonnet-4-6');
    expect(assistant.message.usage.input_tokens).toBe(100);
    expect(assistant.message.usage.output_tokens).toBe(50);
  });

  it('parses synthetic records and preserves their model marker', async () => {
    const result = await parseFile(join(fixturesDir, 'synthetic-records.jsonl'));

    const assistants = result.records.filter(isAssistant);
    expect(assistants.length).toBe(3);

    const synthetic = assistants.filter((a) => a.message.model === '<synthetic>');
    expect(synthetic.length).toBe(1);
    // The synthetic record's giant fake usage should be parsed faithfully —
    // it's the calling code's responsibility to filter, not the parser's.
    expect(synthetic[0]!.message.usage.input_tokens).toBe(99999);
  });

  it('counts the records in the tool-heavy fixture without crashing', async () => {
    const result = await parseFile(join(fixturesDir, 'tool-heavy-session.jsonl'));
    expect(result.stats.recordsTotal).toBeGreaterThan(0);
    expect(result.stats.recordsParsed).toBe(result.stats.recordsTotal);
  });
});
