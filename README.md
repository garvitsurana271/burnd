# burnd — find what's burning your Claude Code budget

[![npm](https://img.shields.io/npm/v/getburnd?color=6366f1&label=npm)](https://www.npmjs.com/package/getburnd)
[![npm downloads](https://img.shields.io/npm/dw/getburnd?color=6366f1)](https://www.npmjs.com/package/getburnd)
[![License: MIT](https://img.shields.io/badge/License-MIT-6366f1.svg)](LICENSE)

Built by **[Garvit Surana](https://garvit-surana.vercel.app)** — Class XII ISC, Guwahati, India.

> I spent **$14,502** on Claude Code in one month and had no idea where it went. Built this to find out.

**Burnd** reads your local `~/.claude/projects/*.jsonl` session files and finds the 8 patterns that waste your Claude Code money — with dollar estimates and concrete one-line fixes.

Free. Open source. **Nothing leaves your machine.**

---

## Quickstart

```bash
npx getburnd
```

That's it. Output looks like this:

```
burnd v0.4.1 — scanning ~/.claude/projects/

  TOP 3 LEAKS THIS WEEK

  1  Long Bash output        23 sessions   est. $31.40 wasted
     fix: pipe through head/tail to cap output at 500 lines

  2  Late-night sessions     11 sessions   est. $18.20 wasted
     fix: your 01:00-04:00 sessions cost 2.4x more per task

  3  Repeated file reads     8 sessions    est. $9.60 wasted
     fix: one file read 19 times in a single session — use Edit not Read

  total estimated waste: $59.20  →  run 'npx getburnd serve' for full dashboard
```

Full dashboard (8 detectors, spend chart, per-project breakdown):

```bash
npx getburnd serve
# open http://localhost:4711
```

---

## What it detects

| Detector | What it catches | Typical monthly saving |
|---|---|---|
| **Long Bash output** | Test runners / builds dumping 10k+ bytes into context | $20–40/mo |
| **Repeated reads** | Same file read 3+ times in one session (worst case: 31×) | $10–20/mo |
| **Tool error storms** | Agent thrashing on broken environments | $30–50/mo |
| **Tool overuse** | Bash dominating 70%+ of calls when Read/Grep would be cheaper | $15–25/mo |
| **Late-night sessions** | 00:00–05:00 sessions cost 2.5× more per task completed | $50–200/mo |
| **API retry storms** | Hidden in system records, invisible from the billing UI | $5–15/mo |
| **Skill over-firing** | Skills with broad triggers eating 40%+ of tool calls | $10–30/mo |
| **Project outliers** | Projects costing 3× your session median | $20–40/mo |

In my own data: **$76/month** in flagged waste. Fixed in a weekend.

---

## How it works

Claude Code writes a `.jsonl` file for every session to `~/.claude/projects/`. Each line is a structured event — tool calls, responses, token counts. Burnd parses these files locally, runs the 8 detectors, and estimates dollar waste from token consumption patterns.

**It never connects to the internet.** No telemetry, no account, no API key.

---

## Privacy

- Runs 100% locally — no server, no uploads, no accounts
- Never reads your code, only the session metadata Claude Code writes itself
- Parser source is in `src/cli/src/` — audit it yourself
- MIT license — fork it, self-host it, do whatever

---

## About

Built by **Garvit Surana** — Class XII ISC, Guwahati, India. After my Anthropic bill hit $14,502 in one month with no good tooling to understand why, I built this. Portfolio: [garvit-surana.vercel.app](https://garvit-surana.vercel.app).

- Landing page: [getburnd.vercel.app](https://getburnd.vercel.app)
- npm: [npmjs.com/package/getburnd](https://www.npmjs.com/package/getburnd)
- Bugs / feature requests: open an issue
- Email: garvitsurana10@gmail.com

## Contributing

Each detector is ~50 lines of TypeScript implementing the `Detector` interface. `src/cli/src/detectors/long-bash-output.ts` is the simplest one — copy it to add your own. PRs welcome.

## License

MIT
