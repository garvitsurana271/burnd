# Reddit — r/ClaudeAI (or r/ClaudeCode if it exists by launch day)

**Subreddit:** r/ClaudeAI
**Post type:** Show & Tell / Self-post (NOT link post — HN-style link posts get downvoted on Reddit)
**Best time:** Tue-Thu, 10 AM EST = 7:30 PM IST (US morning + Europe afternoon + India evening = best reach)
**Flair:** "Projects" or "Show HN" depending on the subreddit's flair list

## Title

```
I spent $13,631 on Claude Code in 6 months and had no idea where the money went — so I built a local CLI that finds 8 kinds of leaks in my own session files
```

(179 chars — Reddit allows 300, this leaves room for subreddit mods to add a flair or edit)

**Alt title if above feels too long:**
```
I built a local cost-control CLI for Claude Code after spending $13k on it. Finds 8 types of leaks.
```

## Body text

```
Hi r/ClaudeAI,

I'm Garvit, 16, from Guwahati, India. I use Claude Code as my daily driver across a bunch of side projects.

Six months ago I looked at my Anthropic bill and realized I'd spent **$13,631** on Claude Code across 227 sessions in 15 projects. My biggest day was $6,091 in 24 hours of burning through the API on one particularly bad refactor session. I had no idea any of this was happening until I started reading my own session files in `~/.claude/projects/`.

**What I found:** Claude Code logs every assistant turn, every tool call, every tool result, and every API retry into a local JSONL file per session. Those files have almost everything you need to reconstruct where your money is going, IF you know what to look for. Most people don't, because the JSONL format isn't documented anywhere I could find and the fields have gotten more complex in 2026 (the new ephemeral_5m vs ephemeral_1h cache tiers, the `<synthetic>` model placeholder that represents system-injected turns and has to be filtered out of cost calculations, etc).

**What I built:** Burnd. A local-first Node CLI that reads your `~/.claude/projects/*.jsonl` files, parses them (streaming, so 100+ MB session files don't OOM), computes cost per turn using the actual Anthropic pricing formula including all four token tiers, and runs 8 detectors on the aggregated data:

1. **Long Bash output** — Bash returning 10k+ bytes bloating context. Fix: pipe through `head`/`tail`.
2. **Repeated reads** — Same file read 3+ times in one session. Fix: use Edit instead of Read→Write→Read.
3. **Tool error storms** — Agent retrying a failing command 15+ times without recognizing terminal errors.
4. **Tool overuse (the Bash trap)** — One tool dominating 70%+ of calls when cheaper alternatives exist.
5. **Late-night coding** — My 00:00-05:00 sessions cost 2.5× more per session than daytime sessions. Cheapest fix: go to bed.
6. **API retry storms** — Hidden in `system` records, invisible from the UI. Each retry burns partial-response tokens.
7. **Skills firing too aggressively** — One of my skills had a trigger description that matched basically every message, eating 42% of tool calls in a session.
8. **Project cost outliers** — Cross-session detector: one project costing 3× more per session than your overall median.

**Real numbers from my own data:**
- Top leak: a project costing 3.2× more per session than my overall median. Burnd estimated $30 of waste. I fixed it in 20 minutes (trimmed the CLAUDE.md from 2000 lines to 600, removed 5 unused local skills). Saved ~$6/session since.
- 32 files re-read 3+ times in a single session (worst case: one file read 31 times). Fix: use Edit, nudge the CLAUDE.md to say "remember file contents."
- One session had 47 Bash calls (80% of all tool calls) — most of them were `cat`, `ls`, `grep` that should have been Read/Glob/Grep.
- API retry storms cost me maybe $15-25 total, concentrated around flaky Anthropic windows.

**How it works:**

    $ npx burnd
    # scans ~/.claude/projects/, prints top 3 leaks with dollar values and fixes

    $ npx burnd serve
    # opens a local web dashboard at localhost:4711 with all 8 detectors,
    # a 60-day spend chart, per-project breakdown, per-tool stats, and
    # a Sessions view

Everything runs on your machine. The CLI never uploads anything. The eventual cloud sync tier is opt-in and the full anonymization spec (field-by-field KEEP/HASH/DROP rules) is public in the repo. CI tests assert no fake-secret markers leak.

**Stack:** Node/TypeScript for the CLI, React/Vite/Tailwind for the dashboard, Recharts for the spend chart. Zero runtime dependencies on the CLI side. Built and tested against my own 227-session data.

**Links:**
- Landing page: https://getburnd.vercel.app
- GitHub (MIT licensed): https://github.com/garvitsurana271/burnd
- Schema study of the Claude Code JSONL format (useful reading even if you don't use Burnd): https://github.com/garvitsurana271/burnd/blob/main/notes/jsonl-format.md
- Anonymization spec (the public trust commitment): https://github.com/garvitsurana271/burnd/blob/main/notes/anonymization.md

**Companion ebook:** I also wrote a book called "Burning Tokens" that walks through every detector with real data and real fixes. 7,400 words, 11 chapters, honest voice. ₹399 (~$4.50 USD) via UPI direct (I'm 16 and can't legally use Stripe/Gumroad/Lemon Squeezy yet — email me for international payment). It's completely optional — the CLI + dashboard are free and open source.

---

**Honest disclaimer:** I've been running this on my own data for a couple months. It catches real leaks in my own usage. But I've only tested it against one person's Claude Code history — yours may have patterns I haven't seen. Please try it and tell me what's wrong or missing. Open issues on GitHub, DM me on Reddit, or email garvitsurana10@gmail.com.

**Questions I expect:**

- **"Is this just a JSONL parser?"** Nope. The parser is ~250 lines and maybe 15% of the code. The value is in the 8 detectors + the insights layer + the dashboard. The parser is the foundation, not the product.

- **"Anthropic will just build this themselves"** Maybe, eventually. Burnd's multi-vendor schema means when they do, I pivot to supporting Gemini CLI + Codex. Those work similarly and have similar JSONL formats.

- **"Are the pricing rates accurate?"** They're the rates Anthropic published for early 2026. I noted in the code that they need re-verification before each pricing change. One file, a few constants — easy to update.

Thanks for reading. Happy to answer whatever. And if you spend more than $50/month on Claude Code, please try it on your own data — I'd love to know if you find patterns I missed.

— Garvit
```

---

## Reply strategy

- Reply to EVERY top-level comment in the first 2 hours. Reddit's algorithm rewards early engagement.
- Upvote every thoughtful reply (not necessary but signals good-faith engagement)
- If someone asks a technical question, link to the specific file in the repo
- If someone reports a bug, say "thanks, opening an issue now" and ACTUALLY open the issue (not later — right then)
- Do NOT reply to trolls. Downvote and move on.
- Do NOT cross-post to other subreddits within 2 hours of the original post (Reddit's anti-spam will flag it)

## Cross-posting

Wait at least 2-3 hours after the r/ClaudeAI post. Then:
1. r/SideProject — different post body (see reddit-r-sideproject.md)
2. r/IndieHackers — different post body (see reddit-r-indiehackers.md)
3. r/developersIndia — mention the ₹399 Indian pricing prominently
4. r/ArtificialIntelligence — more technical, focus on the schema study
5. r/MachineLearning — probably skip, they're not the buyer audience
