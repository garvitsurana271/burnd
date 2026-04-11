# Reddit — r/developersIndia

**Best time:** Weekday evening IST (7-10 PM)
**Tone:** Hindi-English code switch optional, India-specific framing, UPI front and center
**Flair:** "I Made This" or "Show and Tell"

## Title

```
Built a tool to find leaks in my own Claude Code spend (spent ₹11 lakh / $13k in 6 months, found ₹6k of waste). Free CLI + ₹399 companion ebook. I'm 16.
```

## Body

```
Hi r/developersIndia,

Garvit here. Class 12 ISC student in Guwahati. Been building side projects since Class 9 (a crop disease classifier, a React Native app, some web stuff) but this is the first thing I'm shipping that I expect people to actually pay for. Felt like this sub should see it first before I post to HN + global Reddit.

## The problem (and why I think Indian devs specifically care)

Six months ago I realized I was spending a LOT on Claude Code. I kept running `claude` in my terminal for side projects, and the Anthropic bill kept going up.

Final number: **$13,631 in 6 months, which is about ₹11.4 lakh at ₹83/dollar**.

For context: that's more than my family spent on groceries during the same period. I'm not exaggerating when I say this is a real problem, especially for Indian devs / students who are paying Anthropic in USD and feeling the currency conversion on top of the raw cost.

I looked at the Anthropic billing console and it just said "total tokens: 40M" with basically no breakdown of WHY. That was useless. I needed to know which sessions ate the most, which projects were expensive, which tools were wasting tokens, etc.

So I built **Burnd**.

## What it does

It reads your local `~/.claude/projects/*.jsonl` files (Claude Code writes one of these per session automatically) and finds 8 patterns that cost me money:

1. **Long Bash output** — tests/builds dumping 10,000+ bytes into context. Fix: pipe through `head`/`tail`. Saved me ~$30/month alone.
2. **Repeated reads** — same file read 3+ times in a single session. Worst case in my data: one file read 31 times. Fix: use Edit, not Read→Write→Read.
3. **Tool error storms** — agent thrashing on broken environment. Saved ~$40/month once I started fixing environments before sessions.
4. **Tool overuse (Bash trap)** — one session had 80% Bash calls when Read/Glob/Grep would have been cheaper.
5. **Late-night coding** — my 00:00–05:00 sessions cost **2.5× more per session** than daytime ones. The cheapest fix is "go to sleep." Saved $180 in one month after I started respecting this.
6. **API retry storms** — invisible from the UI, hidden in system records.
7. **Skills firing too aggressively** — one of my skills had a trigger that matched basically every message. 42% of tool calls in a session were that one skill.
8. **Project cost outliers** — cross-session detection. My worst project cost 3.2× my overall median. Burnd estimated $30 of waste there. Fixed in 20 minutes (trimmed a bloated CLAUDE.md + removed 5 unused local skills).

Total waste Burnd currently flags in my data: about $76. Real money, real fixes, all tested.

## How to run it

```
$ npx burnd
```

Done. Prints top 3 leaks to your terminal. Free, MIT, open source. Local-first by design: **nothing leaves your machine**. The CLI never uploads your code, prompts, tool outputs, or anything else.

For the full dashboard with 8 detectors, spend chart, per-project breakdown, etc:

```
$ npx burnd serve
# then open http://localhost:4711 in your browser
```

## The companion ebook — ₹399 via UPI

I also wrote a book called **"Burning Tokens"** that walks through every detector with real data and tested fixes. 7,400 words across 11 chapters. Written in my actual voice as a 16-year-old Indian dev who has made these mistakes himself.

**Price: ₹399** (about $4.50 USD). First 50 copies at this price, then it goes up to ₹599.

**How to buy (India, via UPI):**

1. Open your UPI app (Google Pay, PhonePe, Paytm, BHIM, any of them)
2. Pay ₹399 to `garvitsurana10@oksbi` (my UPI ID)
3. Note down the transaction ID
4. Fill this form (linked on the landing page) with your transaction ID + email
5. I email you the ebook PDF within a few hours

No Stripe, no Gumroad, no 18+ KYC, no platform fees. Just rupees direct.

**Why not Stripe/Gumroad/Lemon Squeezy?** Because I'm 16 and literally cannot legally sign up for any of them. This forced me into the most Indian indie launch possible, which I'm actually kind of proud of.

## The links

- Landing: **https://burnd.dev**
- GitHub (MIT): **https://github.com/garvitsurana271/burnd**
- Ebook buy flow: linked from the landing page

## Why I'm posting here first

Three reasons:

1. **You're my audience.** Indian devs spending USD on Claude Code feel the currency pressure more than most. If I can help even 10 of you save ₹5,000/month, it's worth it.

2. **The UPI flow works for you immediately.** International buyers have to email me for manual processing. You can just scan and pay.

3. **The 16yo + India angle lands better here than anywhere else.** I know that's a bit of a humble brag but also it's true — Indian devs are incredibly supportive of young Indian builders and I'd rather launch to a supportive audience first than to a potentially hostile HN thread.

## Honest asks

- If you use Claude Code at all, please try `npx burnd` on your own data. Takes 30 seconds. Tell me what you find.
- If you find a bug, open a GitHub issue or DM me. I'll fix it same day.
- If you buy the ebook and it's not worth ₹399, tell me honestly and I'll refund you. No questions.
- If you want to boost this post, please do — the first hour matters a lot for Reddit reach.

Also: if any of you have launched a side project in India as a minor / under 18 and have war stories about the payment/legal stuff, please share. I'm going to be stumbling through this for the next ~18 months and any learnings would save me weeks.

Thanks for reading. Building this has been the most fun thing I've done this year. I hope it's useful to at least a few of you.

— Garvit (Class 12 · Guwahati · very tired · very excited)
```

## Reply strategy specific to r/developersIndia

- Engage heavily in Hinglish if people comment in Hinglish. Don't force it but don't shy from it either.
- Indian dev community is very supportive of young builders — soak it up without being weird about it
- If someone asks about JEE/NEET vs side projects tradeoff, answer honestly: boards in Feb-Mar 2027 are priority, Burnd has to survive my absence during that window
- If someone offers to help (beta testing, ebook review, spreading the word), say yes and remember their usernames — these become your first 10 customers
- Bug reports from Indian devs are GOLD because they're running Windows + WSL + various Linux distros that I've probably not tested
