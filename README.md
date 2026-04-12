# burnd

> Find what's burning a hole in your AI coding budget.

**Burnd** is a local-first cost-control tool for [Claude Code](https://www.anthropic.com/claude-code) power users. It reads your `~/.claude/projects/*.jsonl` session files and finds 8 patterns that waste tokens — with dollar values and concrete fixes.

Built by [Garvit Surana](https://getburnd.vercel.app) — 16, Class 12 ISC, Guwahati, India — after spending $13,631 on Claude Code in six months.

## Install & run

```bash
npx getburnd
```

That's it. Scans your session files and prints the top 3 leaks with dollar values and fixes. Free, MIT, open source. **Nothing leaves your machine.**

For the full web dashboard:

```bash
npx getburnd serve
```

Then open `http://localhost:4711` in your browser.

## What it finds

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

## BurndPro

Budget alerts, weekly HTML reports, historical trends, CSV export. ₹149/month via UPI.

```bash
npx getburnd budget set 50        # weekly budget in USD
npx getburnd report               # generate weekly report
npx getburnd export               # export to CSV
```

Get a license at [getburnd.vercel.app](https://getburnd.vercel.app/#buy).

## Privacy

Burnd is **local-first by default**. The CLI runs entirely on your machine. **Zero data leaves your machine.**

- Never uploaded: code, prompts, file contents, tool outputs, file paths, git branches
- Parser source is public — audit it yourself
- Full anonymization spec: [notes/anonymization.md](notes/anonymization.md)
- JSONL format study: [notes/jsonl-format.md](notes/jsonl-format.md)

## Contributing

Found a pattern Burnd doesn't catch? Open an issue or PR. Each detector is a ~50-line TypeScript file implementing the `Detector` interface. See `src/cli/src/detectors/long-bash-output.ts` for the simplest example.

## License

MIT

## Links

- **Landing page:** https://getburnd.vercel.app
- **npm:** https://www.npmjs.com/package/getburnd
- **Built by:** [Garvit Surana](https://github.com/garvitsurana271) — garvitsurana10@gmail.com
