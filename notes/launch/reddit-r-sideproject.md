# Reddit — r/SideProject

**Best time:** Saturday or Sunday afternoon (this subreddit skews weekend-indie)
**Flair:** "Launched" or "Looking for Feedback"
**Tone:** builder-to-builder, not technical. Lean into the story.

## Title

```
Built my first real side project at 16 — local CLI that finds leaks in your Claude Code spend after I burned $13k in 6 months
```

## Body

```
Hey r/SideProject,

First real shipping post for me. I'm Garvit, 16, Class 12 student in Guwahati, India. Been building side projects for a few years (React apps, a crop disease classifier, a React Native app) but never shipped anything I expected anyone to actually pay for.

This one is different and I'm nervous.

## The story

Six months ago I noticed I was spending stupid money on Claude Code. I kept running `claude` in my terminal, building stuff, and the Anthropic bill kept creeping up. I finally looked at the total and it was **$13,631** across 227 sessions. My biggest single day was $6,091.

I had no idea where any of it was going. I'd look at the Anthropic console and just see a huge token total with no breakdown of WHY. So I started reading my own session files — Claude Code writes a JSONL per session in ~/.claude/projects/ that has everything: tokens, tool calls, cache tiers, API retries, the works.

I built a tool called Burnd that parses those files locally and finds 8 patterns that cost me money. Every pattern has a dollar value attached. Every fix is tested on my own projects.

## What it does

`npx burnd` prints the top 3 leaks in your terminal with dollar values and fixes. `npx burnd serve` runs a local web dashboard at localhost:4711 with all 8 detectors, a 60-day spend chart, per-project breakdown, per-tool stats, etc.

The 8 leak patterns:

1. Long Bash output — tests/builds dumping huge output into context
2. Repeated reads — same file read 3+ times in one session
3. Tool error storms — agent thrashing on broken environment
4. Tool overuse — one tool dominating 70%+ of calls
5. Late-night coding — my 00:00-05:00 sessions are 2.5× more expensive
6. API retry storms — hidden in system records, invisible from the UI
7. Skills firing too aggressively — my worst skill hit 42% of tool calls
8. Project cost outliers — cross-session detection of "the expensive project"

## What I'm launching

Three things:

1. **The CLI + dashboard** — free, MIT, open source. No signup, no tracking, no cloud. Just `npx burnd` and you're in.
2. **A companion ebook** — "Burning Tokens" — I wrote up every pattern in book form with real data. 7,400 words. ₹399 (about $4.50 USD) via UPI. First 50 copies at this price, then it goes up to ₹599.
3. **Future SaaS tier** — $9/mo with cloud sync, weekly email reports, historical trends. Coming after I turn 18 (I can't legally set up Stripe/Gumroad/Lemon Squeezy yet, so the SaaS tier waits).

## The reason for the ebook pricing thing

I'm 16 and in India. Stripe, Lemon Squeezy, Gumroad, all the normal indie-maker payment infrastructure requires 18+. So for my first revenue product I'm doing the most Indian indie thing possible: selling via UPI direct. Indian buyers send UPI to my handle, then fill a checkout form on the landing page (name + email + transaction ID) — it goes straight to my Gmail. I verify the UPI receipt and email the PDF within a few hours. No platform fees, no KYC, no 18+ requirement, legal.

If you're outside India, email me (garvitsurana10@gmail.com) with subject "buy burning tokens" and I'll figure out Wise/PayPal friends-and-family or whatever works. Manual and slow but real.

## Links

- Landing: https://getburnd.vercel.app
- GitHub (MIT): https://github.com/garvitsurana271/burnd
- The dashboard: `npx burnd serve` → localhost:4711
- Ebook: the landing page has the buy flow

## What I'd love feedback on

- Does the CLI actually work on your machine? It's been tested on Windows + WSL + one Mac, but I haven't hit every edge case.
- Are the detectors finding real stuff in your data, or are they just flagging things that look like leaks but aren't?
- Is the landing page clear or does it bury the lead?
- If you try the ebook, is it actually worth ₹399 or should it be free?

Any feedback helps. I'm committed to making this actually useful, not just launching for launch's sake.

Also: if you've ever spent >$100 on an LLM API and wondered where it went, this is literally the tool I wish existed six months ago.

— Garvit
```

## Reply strategy

- r/SideProject people are supportive. They'll mostly ask about the building process, not the tech.
- Be honest about what you don't know. Don't pretend to be an expert.
- If someone asks "how did you come up with this?", tell the real story — the bill shock, the first crude Python script that just counted tokens, then the realization that the JSONL had way more data.
- If someone says "cool, I'll try it" — reply with a personal note asking them to tell you what they find. Those are your first 10 users.
