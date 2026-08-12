# burnd — find what's burning your Claude Code budget

[![npm](https://img.shields.io/npm/v/getburnd?color=6366f1&label=npm)](https://www.npmjs.com/package/getburnd)
[![npm downloads](https://img.shields.io/npm/dw/getburnd?color=6366f1)](https://www.npmjs.com/package/getburnd)
[![License: MIT](https://img.shields.io/badge/License-MIT-6366f1.svg)](LICENSE)

Built by **[Garvit Surana](https://garvit-surana.vercel.app)** — Class XII ISC, Guwahati, India.

> **Status: feature-complete, no longer actively developed.** Everything below works
> and stays on npm. The paid tier was removed in 0.1.0 — all 10 detectors and every
> command are free. I wrote up honestly why this project didn't work as a business:
> **[read the postmortem](POSTMORTEM.md)**.

> I spent **$14,502** on Claude Code in one month and had no idea where it went. Built this to find out.

**Burnd** reads your local `~/.claude/projects/*.jsonl` session files and finds 10 patterns
that waste your Claude Code money — with dollar estimates and concrete one-line fixes.

Free. Open source. **Nothing leaves your machine.**

---

## Quickstart

```bash
npx getburnd
```

That's it. Output looks like this:

```
burnd v0.1.0 — scanning ~/.claude/projects/

  TOP 3 LEAKS THIS WEEK

  1  Bash output is bloating context     23 sessions   est. $31.40 wasted
     fix: pipe through head/tail to cap output at 500 lines

  2  Expensive session outside your      11 sessions   est. $18.20 wasted
     focus window
     fix: your 01:00-04:00 sessions run 2.4x more expensive per unit of work

  3  Re-reading the same files            8 sessions   est. $9.60 wasted
     fix: one file read 19 times in a single session — use Edit not Read

  total estimated waste: $59.20  →  run 'npx getburnd serve' for full dashboard
```

Full dashboard (10 detectors, spend chart, per-project breakdown):

```bash
npx getburnd serve
# open http://localhost:4711
```

---

## What it detects

Nine per-session detectors plus one that compares across sessions:

| Detector | What it catches |
|---|---|
| **Long Bash output** | Test runners / builds dumping 10k+ bytes into context |
| **Repeated reads** | Same file read 3+ times in one session |
| **Tool error storms** | Agent thrashing on a broken environment |
| **Tool overuse** | One tool dominating 70%+ of calls when a cheaper one would do |
| **Off-focus-window sessions** | Sessions outside *your* inferred working hours, which run more expensive per unit of work |
| **API retry storms** | Hidden in system records, invisible from the billing UI |
| **Skill over-firing** | Skills with broad triggers eating a large share of tool calls |
| **Model substitution** | Opus doing routine work that Sonnet would handle |
| **One-shot edit failures** | How often Claude's first edit attempt misses |
| **Project cost outliers** | Projects costing several times your session median (cross-session) |

`burnd` estimates dollar waste from token-consumption patterns. Treat the numbers as
directional, not as an invoice.

---

## How it works

Claude Code writes a `.jsonl` file for every session to `~/.claude/projects/`. Each line
is a structured event — tool calls, responses, token counts. Burnd parses these files
locally, runs the 10 detectors, and estimates dollar waste from token consumption.

Two design choices are worth calling out:

**Per-user baselines, not absolute thresholds.** `computeUserBaseline()` builds a
histogram of your session-start hours, finds the 10-hour window where you actually work,
and defines "off-focus" relative to that. Cost thresholds are percentiles of your own
sessions. A detector tuned on a $14k/month user still fires correctly for a $20/month user.

**Fail-expensive on unknown models.** When Anthropic ships a model the pricing table
doesn't know, burnd assumes the most expensive known rate rather than skipping it. For a
tool whose job is warning you about spend, over-estimating is recoverable and silently
missing spend is not.

**It never connects to the internet for analysis.** No account, no API key. There is an
opt-in anonymous telemetry ping you can disable with `BURND_NO_TELEMETRY=1`.

---

## Commands

```
npx getburnd              Scan and print top leaks
npx getburnd serve        Local web dashboard on :4711
npx getburnd check        Pre-flight audit before a session
npx getburnd fix          Apply CLAUDE.md patches for the current project
npx getburnd cap          Burn-rate vs your Claude plan's API-equivalent cap
npx getburnd commits      Cost-per-commit across git projects
npx getburnd openclaw     Scan ~/.openclaw/ sessions instead
npx getburnd report       Weekly HTML report
npx getburnd export       Export all sessions to CSV
npx getburnd budget       Weekly budget status
```

A caveat on `burnd fix`: since Opus 5 (July 2026) Anthropic advises *shrinking*
`CLAUDE.md` rather than growing it, having deleted 80%+ of Claude Code's own system prompt
with no measurable eval loss. Treat every patch as a hypothesis to test, not a permanent
rule. This is discussed in the [postmortem](POSTMORTEM.md).

---

## Privacy

- Analysis runs 100% locally — no server, no uploads, no accounts
- Never reads your code, only the session metadata Claude Code writes itself
- Parser source is in `src/cli/src/` — audit it yourself
- Telemetry is opt-in and disabled by `BURND_NO_TELEMETRY=1`
- MIT license — fork it, self-host it, do whatever

---

## Contributing

Each detector is ~50 lines of TypeScript implementing the `Detector` interface.
[`src/cli/src/detectors/long-bash-output.ts`](src/cli/src/detectors/long-bash-output.ts)
is the simplest one — copy it to add your own. PRs welcome; the project isn't actively
developed but I'll review them.

## About

Built by **Garvit Surana** — Class XII ISC, Guwahati, India. After my Anthropic bill hit
$14,502 in one month with no good tooling to understand why, I built this. Portfolio:
[garvit-surana.vercel.app](https://garvit-surana.vercel.app).

- Postmortem: [POSTMORTEM.md](POSTMORTEM.md)
- npm: [npmjs.com/package/getburnd](https://www.npmjs.com/package/getburnd)
- Email: garvitsurana10@gmail.com

## License

MIT
