# ProductHunt Page — Burnd

**When to launch:** A Tuesday, Wednesday, or Thursday. Avoid weekends (lower traffic) and Monday (product hunt resets).
**How it works:** Submit the page the day BEFORE your launch day (PH "hunts" at 00:01 PST and votes over 24 hours). So if you want a Tuesday launch, submit Monday night PST = Tuesday morning IST.
**Maker:** Garvit Surana (add self as maker, don't need a "hunter" — you can launch yourself)

## Product name

```
Burnd
```

## Tagline (max 60 chars)

```
Find what's burning a hole in your AI coding budget
```

(55 chars ✓)

**Alt taglines (if above feels weak):**
- `Local CLI that finds leaks in your Claude Code spend` (53 chars)
- `Cost-control for Claude Code — local, private, free` (52 chars)

## Description (max 260 chars, keep it tight)

```
Local-first CLI + dashboard that reads your Claude Code session files and finds 8 kinds of spend leaks with dollar values. Built by a 16-year-old after burning $13k. Free, MIT, no cloud. Companion ebook for ₹399.
```

(259 chars — JUST under the limit)

## Topics / categories

Pick 3. Best for Burnd:
- **Developer Tools**
- **Artificial Intelligence**
- **Productivity**

Alt options if any are saturated:
- **Open Source**
- **SaaS** (only after the SaaS tier exists — skip for v1)
- **CLI**

## Gallery images (need 4-6)

**Image 1 — the money shot (1270×760 px):**
- Full screenshot of the dashboard Insights page with Garvit's real data
- Prominently shows "All-time spend: $13,631" and the top 3 leaks
- Caption: "The Insights page — every leak has a dollar value and a fix"

**Image 2 — the terminal (1270×760 px):**
- Screenshot of `npx getburnd` running in a terminal with colored output
- Shows the top 3 leaks in the CLI format
- Caption: "`npx getburnd` — 30 seconds in your terminal to find where your money is going"

**Image 3 — the spend chart (1270×760 px):**
- Screenshot of the Overview page showing the 60-day spend chart with the $6,091 March 29 spike
- Caption: "The 60-day spend chart. That spike is the day I burned $6,091 refactoring one React component."

**Image 4 — the 8 detectors (1270×760 px):**
- Screenshot of the landing page's 8-detector grid
- Caption: "8 leak patterns with real dollar-value examples from my own data"

**Image 5 — the book (1270×760 px):**
- The book cover mock from the landing page with a "₹399" price badge
- Caption: "The companion ebook: 7,400 words of patterns I found in $13k of my own Claude Code spend"

**Image 6 (optional) — the architecture (1270×760 px):**
- A simple diagram: CLI → parser → snapshot → dashboard
- Or the "Privacy" callout from the landing page
- Caption: "Local-first by design. Your data never leaves your machine."

## Maker comment (first comment on the launch — this is YOU introducing the product)

```
Hi PH 👋

I'm Garvit, 16, Class 12 student in Guwahati, India. Burnd is my first real shipping product and I'm nervous about this launch.

The story: six months ago I realized I'd spent $13,631 on Claude Code across 227 sessions. I had no idea where the money was going — the Anthropic console just shows a total, not a breakdown. So I built a local tool to read the JSONL session files Claude Code writes automatically and find the leaks.

It finds 8 kinds of waste:

→ Long Bash output bloating context
→ The same file being re-read 3+ times in a session
→ Tool error storms (agent thrashing on broken environment)
→ Tool overuse (80% Bash calls when Glob/Grep would be cheaper)
→ Late-night coding (my 2am sessions cost 2.5× more)
→ API retry storms (hidden in system records, invisible from UI)
→ Skills firing too often
→ Per-project cost outliers (cross-session detection)

Every insight has a dollar value and a tested fix from my own projects.

**Three things Burnd IS:**

1. **Free CLI + dashboard.** `npx getburnd` runs in your terminal. `npx getburnd serve` opens a local web dashboard. MIT licensed. Open source on GitHub.
2. **An ebook.** "Burning Tokens" — 7,400 words, 11 chapters, walks through every detector with real data from my own sessions. ₹399 (~$4.50) via UPI for Indian buyers, email me for international payment.
3. **Local-first.** Everything runs on your machine. Zero data upload unless you explicitly opt in to future cloud sync (which doesn't exist yet). The anonymization spec is public and CI-tested.

**Three things Burnd is NOT:**

1. It's not a SaaS yet. I'm 16 and can't legally sign up for Stripe/Gumroad/Lemon Squeezy as a seller under my own name. The SaaS tier with cloud sync and team dashboards is a post-v2 thing that ships after I turn 18.
2. It's not polished. This is literally my launch day. Bugs exist. Please report them — I'll fix them same day.
3. It's not general-purpose. It only works on Claude Code session files right now. Gemini CLI + Codex support is planned for v2.

I'm going to be in the comments all day answering everything. Technical questions, pricing questions, why-16-year-old questions, whatever.

Honest ask: if you use Claude Code at all, please run `npx getburnd` on your own data. Takes 30 seconds. Tell me what you find. If you find something Burnd missed, email me (garvitsurana10@gmail.com) or open an issue on GitHub — I want the detector list to grow.

Thank you for launching with me.

— Garvit
```

## Follow-up comments (reply to engagement)

**If someone asks "what makes this different from [competitor]":**
> Honest answer: Burnd is the individual-developer version. PromptLayer/Braintrust/Helicone are built for teams on SaaS plans with cloud ingestion. Burnd runs locally, doesn't need auth, doesn't need a team, and reads the JSONL files Claude Code already writes. Different audience, different price point, different trust model.

**If someone asks "will this work for my team":**
> Not in v1 — it's a single-developer tool right now. Each dev runs it against their own local session files. Team dashboards are on the roadmap for the post-v2 SaaS tier.

**If someone asks "why is the ebook so cheap":**
> Because I'm launching it in India first and ₹399 is a fair price for Indian devs. The content is worth more but the pricing is optimized for my target audience, not maximum profit. Founding price too — first 50 sales at ₹399, then it goes to ₹599.

**If someone offers to help:**
> I need: (a) bug reports from anyone running on a non-standard setup, (b) detector suggestions — if you find a leak pattern in your data that Burnd doesn't catch, I'll build a detector for it, (c) honest feedback on the ebook if you buy it. Thank you for offering.

## What PH voters care about (order by impact)

1. **First impression** — the hero image, the tagline, the first sentence of the description
2. **Maker engagement** — PH voters check if the maker is responding in the comments
3. **Unique angle** — "16 year old in India" is the angle here; don't hide it
4. **Price** — free tier shown prominently, paid tier shown honestly
5. **Reviews** — get 3-5 friends to try it the day before launch and leave honest (not fake-positive) reviews

## If you win the day on PH

- You'll get a "Product of the Day" badge
- Screenshot it, pin to Twitter, add to the landing page
- Email everyone who bought the ebook with a "Thanks to PH we crossed ₹X in sales" update
- Do not rest on this — PH is a one-day lever. The ongoing channels are Twitter, HN, Reddit, word of mouth

## If you flop

- Happens often. PH is random.
- Don't re-launch on PH for at least 6 months — they don't like it
- The Twitter thread + Reddit posts carry the launch if PH doesn't
