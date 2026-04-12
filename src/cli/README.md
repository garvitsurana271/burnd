# burnd

> Find what's burning a hole in your AI coding budget.

**Burnd** is a local-first cost-control tool for [Claude Code](https://www.anthropic.com/claude-code) power users. It reads your `~/.claude/projects/*.jsonl` session files and finds 8 patterns that waste tokens, with dollar values and concrete fixes.

Built by [Garvit Surana](https://getburnd.vercel.app) — 16, Class 12 ISC, Guwahati, India — after spending $13,631 on Claude Code in six months.

---

## Install & run

```bash
npx getburnd
```

That's it. It scans your session files and prints the top 3 leaks to your terminal with dollar values and fixes. Free, MIT, open source. **Nothing leaves your machine.**

For the full web dashboard:

```bash
npx getburnd serve
```

Then open `http://localhost:4711` in your browser. Insights, Overview with 60-day spend chart, Projects, Tools, Sessions — all 5 views, all from your local data.

## What it finds

Burnd runs 8 leak detectors on your Claude Code session history:

| Detector | What it finds |
|---|---|
| **Long Bash output** | Test runners / builds dumping 10k+ bytes into context |
| **Repeated reads** | Same file read 3+ times in one session |
| **Tool error storms** | Agent thrashing on broken environments |
| **Tool overuse** | One tool dominating 70%+ of calls (usually Bash) |
| **Late-night coding** | 00:00-05:00 sessions cost 2.5× more per session |
| **API retry storms** | Hidden in system records, invisible from the UI |
| **Skill firing** | Skills with broad triggers eating 40%+ of tool calls |
| **Project cost outliers** | Projects costing 3× more per session than your average |

Every insight has a dollar value, an effort estimate, and step-by-step fix instructions.

## CLI

```
Usage:
  npx getburnd [scan]                 Scan ~/.claude/projects/, print top leaks
  npx getburnd serve                  Start the local web dashboard at localhost:4711

Scan options:
  --top <n>                        Print top N insights (default: 3)
  --root <path>                    Use a custom Claude projects root
  --dry-run                        Show the anonymized upload payload (no upload)

Serve options:
  --port <n>                       Dashboard port (default: 4711)
  --root <path>                    Use a custom Claude projects root

Misc:
  --version, -v                    Print version
  --help, -h                       Show this help
```

## Privacy

Burnd is **local-first by default**. The CLI runs entirely on your machine. It reads your session files, computes the leaks, and serves a dashboard from a localhost HTTP server. **Zero data leaves your machine.**

- Never uploaded: code, prompts, file contents, tool outputs, file paths, git branches, AI-generated session titles
- Parser source is public (this repo) — audit it yourself
- CI tests assert no fake-secret markers leak through anonymization
- Full anonymization spec: [notes/anonymization.md](https://github.com/garvitsurana271/burnd/blob/main/notes/anonymization.md)

The future cloud sync tier (for cross-device dashboards, weekly email reports) is explicitly opt-in and does not exist in v1.

## The ebook

If you want the full story behind each detector — with real data, real dollar values from my own $13k of spend, and tested fixes — there's a companion ebook called **Burning Tokens**. 7,400 words, 11 chapters.

**Price:** ₹399 (~$4.50 USD) via UPI for Indian buyers, email for international payment.

**Get it:** [burnd.dev#ebook](https://getburnd.vercel.app#ebook)

## Project layout

```
src/
├── types.ts             TypeScript types matching the Claude Code JSONL schema
├── parser.ts            Streaming JSONL line-by-line parser
├── walker.ts            Recursive walk of ~/.claude/projects/
├── session.ts           Per-file SessionStats aggregator
├── pricing.ts           Anthropic rate table + cost formula (verify before launch)
├── anonymize.ts         Privacy boundary for upload payloads
├── snapshot.ts          JSON contract the dashboard consumes
├── serve.ts             Local HTTP server (Node built-in, zero deps)
├── insights.ts          Insight ranking + top-N
├── output.ts            Terminal output formatting (kleur)
├── index.ts             CLI entry point
└── detectors/
    ├── long-bash-output.ts
    ├── repeated-read.ts
    ├── thrash.ts
    ├── tool-overuse.ts
    ├── tired-coding.ts
    ├── retry-storm.ts
    ├── skill-firing.ts
    └── project-cost-outlier.ts
```

The dashboard source is at [`src/web/`](https://github.com/garvitsurana271/burnd/tree/main/src/web) — React 18 + Vite + Tailwind + AXIS color palette.

## Contributing

If you find a pattern in your own Claude Code data that Burnd doesn't catch, open an issue or a pull request. Every new detector is a 50-line TypeScript file implementing the `Detector` interface. Look at `src/detectors/long-bash-output.ts` for the simplest example.

If you find a bug — especially a correctness bug in the cost calculation — please open an issue. Attach sample anonymized data if you can. I reply to everything.

## License

MIT — do whatever you want, just don't sue me.

## Links

- **Landing page:** https://getburnd.vercel.app
- **GitHub:** https://github.com/garvitsurana271/burnd
- **npm:** https://www.npmjs.com/package/burnd
- **Anonymization spec:** https://github.com/garvitsurana271/burnd/blob/main/notes/anonymization.md
- **JSONL format study:** https://github.com/garvitsurana271/burnd/blob/main/notes/jsonl-format.md
- **Ebook:** https://getburnd.vercel.app#ebook
- **Built by:** [Garvit Surana](https://github.com/garvitsurana271), garvitsurana10@gmail.com
