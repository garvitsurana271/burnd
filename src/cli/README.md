# burnd

> Find what's burning a hole in your AI coding budget.

`burnd` is a local-first cost-control tool for [Claude Code](https://www.anthropic.com/claude-code) power users. It reads your `~/.claude/projects/*.jsonl` session files and tells you exactly where your spend is leaking — and how to plug the leaks.

**Status:** v0.0.1, in development. Building toward launch end of July 2026.

## What it does

```
$ npx burnd

  burnd — find what's burning a hole in your AI coding budget
  ─────────────────────────────────────────────────────────────

  Scanned: 210 session files across 210 sessions
  All-time spend: $312.45
  Last 7 days:    $47.10
  Potential savings (top leaks): $18.30

  Top leaks (sorted by estimated savings):

  1. Bash output is bloating context — wasting ~$8.40
     $8.40  (~5 min to fix)
     In this session, Bash was called 47 times with an average output of
     12,400 bytes per call. Most of those bytes are getting fed back into
     Claude's context on the next turn, which costs you tokens. Piping
     commands through 'head', 'tail', or 'grep' would cut the average to
     ~1,000 bytes and save approximately $8.40 of token spend on this
     session alone.

  2. Re-reading the same files — wasting ~$5.20
     ...

  3. Tool error storm — 38% of calls failed, wasting ~$4.70
     ...

  ─────────────────────────────────────────────────────────────
  See the full dashboard at https://burnd.dev
```

## How it works

`burnd` is built in 6 layers, each with one responsibility:

```
┌────────────────┐
│  walker.ts     │  Walks ~/.claude/projects/ recursively, yields .jsonl files
└───────┬────────┘
        ▼
┌────────────────┐
│  parser.ts     │  Streams each .jsonl file line-by-line, never loads whole files
└───────┬────────┘
        ▼
┌────────────────┐
│  session.ts    │  Aggregates parsed records into one SessionStats per file
└───────┬────────┘
        ▼
┌────────────────┐
│  pricing.ts    │  Computes USD cost per record using the Anthropic rate table
└───────┬────────┘
        ▼
┌────────────────────────┐
│  detectors/*.ts        │  Pattern detectors that find leaks (one file per detector)
└───────┬────────────────┘
        ▼
┌────────────────┐
│  insights.ts   │  Ranks detector output by estimated savings
└───────┬────────┘
        ▼
┌────────────────┐
│  output.ts     │  Pretty terminal printing — the "wow" moment
└────────────────┘
```

The `anonymize.ts` module is a separate boundary that takes parsed records and produces upload-safe payloads (used by `--dry-run` and the eventual cloud sync).

## Privacy

`burnd` is **local-first**. The CLI runs entirely on your machine and reads your session files locally. **It never uploads your code, prompts, file contents, or tool outputs.** When you opt into the optional cloud sync (Week 4+), only anonymized aggregates are uploaded — token counts, tool names, byte sizes, hashed project paths.

The full anonymization rules are documented in [`notes/anonymization.md`](../../notes/anonymization.md). Run `npx burnd --dry-run` to see exactly what would be uploaded for your data.

The CI test suite includes a load-bearing privacy test (`__tests__/secret-leak.test.ts`) that asserts no fake-secret markers leak through the anonymization pipeline. This test runs on every commit.

## Development

```bash
# Install dependencies
npm install

# Run the CLI in dev mode (uses tsx, no build needed)
npm run dev

# Run tests
npm test

# Type-check
npm run typecheck

# Build for distribution
npm run build
```

## Project layout

```
src/
├── types.ts             — TypeScript types matching the Claude Code JSONL schema
├── parser.ts            — streaming JSONL line-by-line parser
├── walker.ts            — recursive walk of ~/.claude/projects/
├── session.ts           — per-file SessionStats aggregator
├── pricing.ts           — Anthropic rate table + cost formula
├── anonymize.ts         — privacy boundary for upload payloads
├── insights.ts          — insight ranking + top-N
├── output.ts            — terminal output formatting
├── index.ts             — CLI entry point
└── detectors/
    ├── types.ts         — Detector interface + Insight type
    ├── long-bash-output.ts
    ├── repeated-read.ts
    ├── thrash.ts
    ├── tool-overuse.ts
    └── index.ts         — registry + runner

__tests__/
├── fixtures/
│   ├── minimal-session.jsonl
│   ├── synthetic-records.jsonl
│   ├── tool-heavy-session.jsonl
│   └── secret-leak.jsonl    — fake-secret markers for the privacy CI gate
├── parser.test.ts
├── pricing.test.ts
├── anonymize.test.ts
├── detectors.test.ts
└── secret-leak.test.ts      — LOAD-BEARING privacy test
```

## License

MIT — see [LICENSE](../../LICENSE).

## Built by

[@garvitonpc](https://instagram.com/garvitonpc) — 16, Class 12 ISC, Guwahati, India.
