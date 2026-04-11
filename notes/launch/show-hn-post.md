# Show HN — Burnd

**When to post:** Monday or Tuesday, 9:00 AM EST = 6:30 PM IST. This puts you in the US breakfast rush window where HN is most active, AND lets you stay awake in India to reply to comments for 2-3 hours before you crash.

**The title matters more than the body.** HN titles are the whole game. Below is the title I recommend — copy exactly.

## Title (80 chars max — this is 77)

```
Show HN: Burnd – I'm 16 and I built the Claude Code cost tool I needed myself
```

**Alt title if the 16yo angle feels too try-hard to you:**

```
Show HN: Burnd – I found $76 of waste in my own $13k of Claude Code spend
```

**Do NOT use:**
- "Burnd: a cost tool for Claude Code" (too generic, gets buried)
- "Burnd: Find the leaks in your AI coding budget" (marketing-speak, HN hates it)
- Any title with "AI-powered" in it

## URL field

```
https://burnd.dev
```

## Body text (the first comment, which HN shows below the link)

```
Hi HN. I'm Garvit. I'm 16, in Class 12 at an ISC school in Guwahati, India, and should probably be studying for board exams.

Six months ago I noticed something weird: my Anthropic bill was going up faster than any other line item in my life. I spent $13,631 on Claude Code across 227 sessions in 15 projects. My single biggest day was $6,091 in 24 hours (I was refactoring the same React component over and over because the agent kept forgetting what it had just done).

I had no idea where the money was going. I'd stare at the Anthropic console and see "total tokens: 40M" and think "ok, that means what exactly?"

So I built Burnd. It's a local-first CLI + dashboard that reads the JSONL session files Claude Code already writes to ~/.claude/projects/, parses them, and finds 8 kinds of leaks:

  1. Long Bash output bloating context (fix: pipe through `head`)
  2. Same file re-read 3+ times in one session (fix: use Edit, not Read→Write→Read)
  3. Tool error storms (agent thrashing on a broken environment)
  4. Tool overuse (Bash dominating 70%+ of calls when Glob/Grep would be cheaper)
  5. Late-night sessions (mine are 2.5× more expensive per session than daytime ones)
  6. API retry storms (hidden in `system` records, invisible from the UI)
  7. Skills firing too aggressively (one skill with a broad trigger ate 42% of my tool calls)
  8. Project cost outliers (my worst project cost 3.2× my overall median — bloated CLAUDE.md + 8 local skills)

Every insight has a dollar value and a concrete fix. The top insight in my own data was the project-cost outlier — Burnd said I was wasting $30 there; I fixed it in 20 minutes, saving ~$6/session on 4-6 sessions/month in that project.

A few things that might be interesting to HN specifically:

- **Local-first by default.** The CLI runs entirely on your machine. It reads your session files, computes the leaks, and serves a dashboard from a localhost HTTP server (`npx burnd serve` → localhost:4711). Zero data leaves your machine. The eventual SaaS tier with cloud sync is opt-in.
- **The anonymization spec is public.** Even when cloud sync ships later, the upload payload is defined field-by-field with explicit KEEP / HASH / DROP / AGGREGATE rules. CI tests assert no fake-secret markers leak. (notes/anonymization.md in the repo)
- **Schema study is public too.** Claude Code's JSONL has 7 distinct record types, a new 2026 ephemeral cache tier system (5m + 1h), and a `<synthetic>` model placeholder that's a silent footgun for cost calculation. I wrote up everything I learned in notes/jsonl-format.md.
- **Stack:** Node.js (zero runtime deps for the server), TypeScript, React 18, Vite, Tailwind, Recharts. 49 tests passing including a load-bearing privacy gate that asserts no fake credentials leak.
- **Multi-vendor schema from day 1.** The parser emits records with a `vendor` field so Gemini CLI + Codex support in v2 is additive, not migratory.

The payment situation is honest: I'm 16, I can't legally sign up for Stripe, Lemon Squeezy, or Gumroad as a seller under my own name. So the first revenue product is a ₹399 (~$4.50) ebook called "Burning Tokens" that walks through all 8 patterns with real data from my own sessions. It's priced for Indian devs (UPI direct, no platform fee) but the content works for any Claude Code user. International payment is via email — I'll figure out Wise/PayPal case-by-case until I turn 18 and can set up a real merchant-of-record.

Everything is MIT licensed. Source: https://github.com/garvitsurana271/burnd

I'm going to be in the comments for the next 2-3 hours answering whatever. Honestly excited and scared — this is my first real shot at making money from something I built. If you try it and something breaks, please tell me. If you find a pattern in your own data that I didn't include, I want to know.

— Garvit
```

---

## Reply strategy for the first hour

HN is won in the first hour. Every comment that lands in the first 60 minutes gets a personal, thoughtful reply from you, not a canned response. Keep the laptop open.

### Comments you should prepare stock (but not canned) responses for:

**"How do you handle [specific edge case in the JSONL format]?"**
→ Answer the specific case, then point at the relevant section of notes/jsonl-format.md. This is the best comment you can get because it proves your docs are the product.

**"What's the cloud sync privacy model?"**
→ Point at notes/anonymization.md. Mention the field-by-field KEEP/HASH/DROP table. Mention the CI test that asserts no secrets leak. Offer to walk through a specific field if they want.

**"Why not use [Braintrust / Helicone / PromptLayer]?"**
→ Acknowledge they're good for team observability. Position Burnd as the individual-dev version: local-first, no signup, no cloud dependency. "Those tools are built for teams on a SaaS plan. Burnd is built for me — one dev, one laptop, one local data file."

**"Anthropic will just build this themselves"**
→ Agree it's possible. Point out that (a) they haven't yet after 18 months, (b) Burnd's multi-vendor design means the moment Anthropic ships it, you pivot to supporting Gemini CLI + Codex, (c) the open-source parser + public anonymization spec are moats even an in-house vendor can't replicate credibly.

**"Show me a screenshot"**
→ Reply with a direct link to an uploaded image. DO NOT link to an imgur that you just created — HN users are suspicious of those. Instead, host the screenshot at burnd.dev/screenshots/insights.png (you'll add this to the landing page before launch).

**"Does this work on [Gemini / Cursor / Copilot]?"**
→ Not yet in v1, but the schema is designed for it. The parser takes a vendor parameter from day 1. Adding Gemini CLI support in v2 is a single new parser file, not a migration.

**"Are the pricing rates accurate?"**
→ Be honest: they're the rates Anthropic published for early-2026. I noted in the README + pricing.ts that they need re-verification before each pricing change. If Anthropic changes rates, the fix is one line in src/pricing.ts.

**Hostile comment: "You're 16, this is a school project"**
→ Don't get defensive. Respond: "Yep. It's also running on my real $13k of spend and finding real leaks. The code speaks for itself — the tests, the schema study, the anonymization spec. Try it on your own data and tell me if the insights are wrong."

**Hostile comment: "This is just a wrapper around JSONL parsing"**
→ "Correct. The value isn't the parsing — it's knowing what to look for. The 8 detectors are pattern matchers that distill what I learned reading 227 of my own sessions. If you can write a better detector I'll merge a PR the same day."

### What NOT to do

- Don't reply to every comment with emojis. One 🙏 per day max.
- Don't get into arguments. If someone is aggressive, reply once honestly and then stop.
- Don't bump the post with "any thoughts?" — that's seen as begging.
- Don't tweet "look at my HN post." Let it find its own audience.
- Don't delete negative comments. Don't even reply to them if they're pure hate. Let HN users handle it.
- Don't upvote your own post from alts. HN detects this and shadowbans.

## If you hit the front page

- Pin the show-hn URL to your Twitter bio
- Don't tweet about it — let HN users tweet about it (more credible)
- Screenshot your best replies for future use
- Save every comment that turns into a follow/customer — those people are your first 10

## If you don't hit the front page

- Totally fine. HN is random.
- Try again in 2-3 months with an update post ("Show HN: Burnd now supports Gemini CLI")
- The Twitter thread + Reddit posts might carry the launch on their own
