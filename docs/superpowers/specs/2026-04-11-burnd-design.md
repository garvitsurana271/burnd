# Burnd — Design Doc

**Author:** Garvit Surana
**Date:** 2026-04-11
**Project codename:** ChangeLife (this is its v1 product)
**Status:** Design v0.2 — APPROVED 2026-04-11. Ready for implementation planning.

---

## 1. The bet, in one sentence

**A dark-mode local-first cost-control tool for Claude Code power users that reads their `.claude/projects/*.jsonl` session files, tells them exactly where their money is leaking and how to plug the leaks, and is sold globally for $9/mo or $79 lifetime (launch window) — built and launched by a 16-year-old in Guwahati who has been inside the Claude Code ecosystem since its first months.**

> **Positioning rule (load-bearing):** This product is sold as a *control tool*, not as analytics. The pitch is "cut your Claude spend by 20–40% in a week," not "see where your money went." Every landing page word, every screenshot, every launch tweet must lead with the *decision the user can make*, not the *data they can see*. People pay for decisions; dashboards are commodified. This rule supersedes any earlier draft language and any future temptation to describe the product as "analytics."

## 2. Why this exists

Garvit needs a project that:

1. Makes **real recurring USD revenue** before the ISC Class 12 board-exam lockdown begins (~Nov 2026), and keeps making it through boards (Feb–Mar 2027) without daily attention.
2. Uses his **specific weird ingredients** — native fluency with Claude Code, Gemini CLI, Codex, Qwen, Copilot, Antigravity; React+TS+Vite+Tailwind+Firebase+Claude API stack; strong opinionated dark-mode dense aesthetic; and the asset of being a 16-year-old visible builder.
3. Satisfies both **independence** (stops him asking parents for pocket money) and **status** (legibly impressive enough that teachers, cousins, and the broader school community update their model of him).
4. Requires **as little involvement from his mother as possible** — she's supportive but overloaded; she should sign one form and then never have to think about this again.

Burnd is the cleanest fit found across a structured brainstorming process that compared three product shapes (this, a prompt-versioning IDE, and a skill-pack marketplace). See *Section 11 — Why not the other proposals* for the explicit comparison.

## 3. Success criteria

ChangeLife succeeds, fails, or wins on these specific numbers:

| Threshold | Condition | What it means |
|---|---|---|
| **Floor** | ₹10,000/month MRR by Nov 1, 2026, sustained for ≥2 consecutive months | Independence achieved. Garvit stops asking. The "I built a thing, strangers pay me, it survives me ignoring it" loop is closed. |
| **Target** | ₹25,000/month MRR by Nov 1, 2026 | Status achieved at meaningful scale. Story propagates through school/family without effort. |
| **Win** | ₹50,000+/month MRR by Nov 1, 2026 | Reframes post-boards options. Becomes a real conversation about how college plans should bend around this. |
| **Hard fail** | <₹2,000/month MRR by Nov 1, 2026 | Shut it down honestly. Take the lessons, don't let it bleed attention through boards. |

**The lockdown test (most important):** between Nov 1, 2026 and Mar 31, 2027, the product must continue earning at or above its Oct 31 MRR while Garvit spends **≤ 4 hours/week** on it. If the product needs more attention than that to survive, it failed even if the revenue is there — because it would cost him his board exam grades, which is a worse outcome than zero ChangeLife revenue.

## 4. Hard constraints (the things the design MUST accommodate)

These are non-negotiable design inputs:

1. **Frontloaded calendar.** ~320 build hours April–July, ~130 growth hours Aug–Oct, ~50 maintenance hours Nov–Feb. The product must be substantially shipped and earning before October.
2. **Async, self-serve, no live ops.** No client calls, no Calendly, no live chat, no SLA. The product must work while Garvit is asleep, in school, or in a board exam.
3. **Mom touches one form, once.** Operational independence is the goal. Mom is the legally registered seller (because merchant-of-record services require 18+), but everything else is Garvit.
4. **USD revenue, settled to a single Indian account.** No multi-entity, no GST registration in v1, no LLC, no foreign company.
5. **No daily-attention growth channels.** Rules out: Twitter content treadmill, TikTok, daily YouTube, anything algorithmic that punishes silence. Allows: launch bursts, evergreen SEO, word of mouth, community presence on a "show up when you can" cadence.
6. **Aesthetic must be the AXIS palette.** Dark mode only. `#09090f` background, `#6366f1` indigo accent, Inter + JetBrains Mono. Dense, keyboard-first. This isn't a vanity constraint — it's a *positioning* constraint. The look is part of the marketing.
7. **Multi-vendor data model from day 1, even if v1 UI is single-vendor.** The Firestore schema MUST include a `vendor` field (`"claude-code" | "gemini-cli" | "codex" | ...`) and the parser interface MUST be designed so adding a second vendor in v2 is "write a parser that emits the same shape," not "migrate the database." This is the hedge against the #1 risk (Anthropic ships their own dashboard). We do not expose multi-vendor in v1 UI — we just make sure the schema doesn't lock us in.

## 5. Product — what Burnd actually is, concretely

### 5.1 The user journey

1. A Claude Code power user lands on the landing page from a Twitter post or HackerNews thread.
2. The landing page hero is a single sentence: *"Cut your Claude Code spend by 20–40% in a week. We find the leaks. You decide what to fix."* Below it: a screenshot of the **Insights view** showing 3 ranked, actionable recommendations with dollar amounts attached ("Project `auralog` is wasting an estimated $42/mo on long Bash outputs — add `| head -50`. Save: $42/mo. Effort: 1 minute.").
3. They click "Try the demo" and see a fully-populated dashboard with realistic synthetic data, navigable, dense, beautiful — and the *Insights view is the first thing they land on*, not Overview. (Reorder confirmed.)
4. They click "Run on my own data." A modal shows them **exactly what the CLI will print**, with sample output, before they install anything. Below that: a single one-line `npx` command, copy button, and a "How is this safe?" expandable that links to the parser source on GitHub.
5. They run the command. **First-run is zero-config** — no flags, no auth, no signup required. The CLI prints their top 3 cost leaks to stdout immediately. This is the "wow" moment that has to happen *before* signup, otherwise the conversion drops.
6. After seeing their leaks in the terminal, the CLI prints: *"Want the full dashboard, history, and weekly leak reports? Sign up at <url> — your data is already cached locally and will sync once you log in."* They click, sign up with Google, and within 10 seconds the dashboard is populated.
7. The free tier shows the last 7 days + the top 3 insights. To see all insights, all history, and weekly leak reports, they pay $9/month or $79 lifetime via Lemon Squeezy checkout.
8. They forget about it for a week, then come back to check whether the fixes worked. The dashboard re-syncs in one CLI command and shows the savings delta.

**Conversion friction reducers (mandatory in v1):**
- **Output preview before install** — landing page shows the exact terminal output the CLI will produce, so users know what they're getting before running anything.
- **One-line zero-config install** — `npx burnd` (or whatever the rename produces) works with no flags, no env vars, no signup. Auth is *only* required to sync to the dashboard, not to use the CLI.
- **Manual file upload fallback** — for users who refuse to run a CLI on their machine (real category, especially in security-conscious orgs), a "drag your `.jsonl` files here" web upload that does the same parsing in-browser. Lower-priority feature, can be Week 14 polish if there's slack.
- **Public parser source on GitHub from Day 1** — trust marketing tool. The repo URL goes on every landing page section.

### 5.2 The core views (v1 launch scope) — Insights-first

The view order on the sidebar matters. **Insights is the default landing view** and the only one users see in the demo / landing page screenshots. Everything else exists to support drill-down from the insights.

| Order | View | What it shows | Why people pay for it |
|---|---|---|---|
| 1 | **Insights** ⭐ *(the product)* | A ranked list of 5–15 specific, actionable recommendations: "Project X is wasting $Y/mo because Z. Fix: A. Estimated savings: $B." Each insight has a dollar value, an effort estimate, and a one-click "mark as fixed" → re-scan after a week → "Did it work? Yes/No." | This is the headline. People pay for the recommendations, not the charts. Every other view is a drill-down from here. |
| 2 | **Overview** | Total spend trend, this-week-vs-last-week, the dollar amount you've already saved by acting on insights. | Anchor for "is it working?" |
| 3 | **Projects** | Cost per project, with each project's "leak score" (how much could be saved if all insights for it were applied) | Power users have 5–30 projects; they need to know which one is bleeding the most. |
| 4 | **Tools** | Frequency, deny rate, average cost per invocation per tool. Highlights "tool overuse" patterns. | Drives the "you're overusing tool Y" insight category. |
| 5 | **Sessions** | List of sessions sortable by cost; "wasted session" detector (long sessions with low completed-tool-call rate). Click into a session for a timeline. | Drives the "your wasted sessions cost $X this month" insight category. |

**Skills view: deferred to v1.1 stretch goal.** Was originally a v1 view, now demoted because Insights view is more valuable for the same build hours. Will revisit after launch if a meaningful chunk of users have custom skills installed.

**The Insights engine (the new heart of v1):**

The insights are not magic — they're a small set of pattern detectors run over the parsed data. Each detector outputs zero or more insights with `{title, description, project, savings_estimate_usd, effort_minutes, fix_steps}`. v1 ships with these detectors:

1. **Long Bash output detector** — sessions where Bash tool returned >5,000 tokens average. Fix: pipe through `head`/`tail`, set the agent to use `head_limit` parameters.
2. **Repeated-read detector** — same file Read >3 times in a single session. Fix: agent should remember file contents; flag for prompt adjustment.
3. **Thrash detector** — sessions over $X with low ratio of completed-tool-calls to attempted. Fix: shorter sessions, clearer initial prompts.
4. **Tool overuse detector** — a tool used 5× more often than the user's baseline. May indicate misconfiguration.
5. **Skill firing too often** (or never) — flags skills that are loaded but unused, or skills firing in inappropriate contexts.
6. **Project-cost outlier** — a project costing 3× more than similar-sized projects. Recommends investigation.
7. **Day-of-week / time-of-day waste** — "Sessions between midnight and 3am cost 2× more on average" (the "tired coding" detector — funny but real).

Each detector is ~50 lines of TypeScript. Adding detectors over time is the natural product expansion path post-launch, and each new detector is a marketing event ("Burnd v1.3: 2 new ways to find leaks").

**Explicitly out of scope for v1** (cut to protect the build budget):
- Live tail / streaming sessions
- Team accounts / multi-user
- Comparing across users (privacy minefield)
- Code-quality scoring of session outputs
- Multi-vendor support beyond Claude Code (Gemini CLI, Codex, etc. — added in v2 if v1 hits ₹10k/mo)
- Slack/Discord notifications
- Mobile app

### 5.3 Pricing

- **Free tier:** Last 7 days of data + top 3 insights. Enough to be useful and to prove the savings, not enough to replace the paid tier.
- **Paid tier — launch window (Weeks 16–22, ~6 weeks post-launch):** $9/month, OR **$79 lifetime**.
- **Paid tier — post-launch standard (Week 23 onward, when first 50 lifetime deals are sold or 6 weeks pass, whichever first):** $9/month stays, **lifetime raises to $129**. Founding-member lifetimes at $79 stop being available.
- **Why a launch window on lifetime:** $79 is *underpriced for the audience*. Power users would pay more. But for launch you want the lowest-friction "yes" possible, so $79 acts as a "founding member" anchor that drives early conversions and front-loads cash. After traction, raise to capture the actual willingness-to-pay. Tell launch buyers explicitly: "$79 founding price, going up to $129 in 6 weeks." Urgency without dishonesty.
- **Why lifetime is offered at all:** lifetime deals prefill your bank account without recurring obligation. Critical for the lockdown phase — you'd rather have ₹15,000 in November from 2 lifetime sales than chase 16 monthly subscribers in December while studying for boards.
- **No free trial of the paid tier in v1.** Free tier is generous enough; trials add complexity (expiration emails, conversion tracking) that you don't have time for.

## 6. Architecture (high level)

### 6.1 Three components

```
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  CLI parser      │─────▶│  Firebase        │◀─────│  Web dashboard   │
│  (Node, npx)     │      │  (Firestore +    │      │  (React+TS+Vite) │
│  reads local     │      │   Auth + Hosting)│      │  reads from      │
│  .jsonl files    │      │                  │      │  Firestore       │
└──────────────────┘      └──────────────────┘      └──────────────────┘
       │                          ▲                          │
       │                          │                          │
       └──────────uploads─────────┘                          │
                  aggregated                                  │
                  anonymized                                  │
                  metrics                                     │
                                                              │
                                    ┌──────────────────┐     │
                                    │  Lemon Squeezy   │◀────┘
                                    │  (checkout +     │   webhook
                                    │   subscription)  │
                                    └──────────────────┘
```

### 6.2 Why this shape

- **CLI parser is local-first.** Users never upload their actual conversation content (which contains private code, secrets, internal discussions). Only aggregates: token counts per session, tool counts, timestamps, project names. This is both an *ethical* default and a *trust marketing tool* — "we never see your code" is a headline feature.
- **Firebase Firestore** because it's free at this scale, you already know it from the AXIS prompt, and it eliminates a backend service to maintain during lockdown. **Schema requirement: every session document MUST include a `vendor` field (`"claude-code"` for v1) so v2 multi-vendor support is additive, not migratory.** The Insights detectors must accept `vendor` as input even if v1 only ever passes `"claude-code"`.
- **Lemon Squeezy** as merchant of record because it handles VAT/GST/sales tax in 80+ countries, issues invoices, processes refunds, and pays out to a single bank account — making it the *only* product surface that needs a registered adult (mom).
- **No custom backend.** Firestore security rules + Lemon Squeezy webhooks (handled via a single Firebase Function) is the entire backend. You ship one Function, not a server.

### 6.3 The CLI parser is the moat

This is the part that's hardest to copy and most fragile to maintain. It needs:
- Robust parsing of the JSONL session format Anthropic ships (it WILL change — version-detect aggressively)
- Public documentation of the format on GitHub so the community can help maintain the parser if it breaks
- Tests against fixture files saved from real sessions
- A "fail soft" mode: if a record doesn't parse, log it and skip, never crash
- A version pinning system: each Burnd CLI release declares which Claude Code session formats it supports

Treat the parser repo as a public good: open-source, MIT-licensed, accept PRs. The dashboard and Firebase backend stay closed. This is the right tradeoff — community goodwill on the parser, paid product on the analytics.

## 7. The 16-week build calendar (April 11 – August 1, 2026)

This is the explicit week-by-week plan for the build window. Each row is a week with a single shippable goal. 20 hours/week target.

| Wk | Dates | Goal | Deliverable | Hours |
|----|---|---|---|---|
| 1 | Apr 11–17 | (a) Understand `.jsonl` format. (b) **BLOCKING: Choose final product name** — verify domain available + verify Anthropic trademark policy permits or doesn't permit "Claude" in product name. Decide on neutral backup name BEFORE writing any code. (c) Draft anonymization rules. | (a) Notes file: schema, sample records, edge cases. (b) Final name + registered domain. (c) `anonymization-spec.md`. NO product code yet. | 18 |
| 2 | Apr 18–24 | CLI parser v0 + multi-vendor schema design | `npx <name>` reads your own files locally and prints top 3 cost leaks to stdout. Schema designed with `vendor` field even though only `claude-code` is implemented. | 25 |
| 3 | Apr 25–May 1 | Insights engine v0 (the heart of the product) | First 4 detectors implemented (long-Bash-output, repeated-read, thrash, tool-overuse), each producing dollar-valued recommendations from local parsed data. CLI prints them. | 25 |
| 4 | May 2–8 | Data model + Firestore schema + CLI upload | Firestore collections defined with `vendor` field, security rules drafted, CLI authenticates and pushes aggregates. | 20 |
| 5 | May 9–15 | Dashboard scaffold + **Insights view (the landing view)** | React+Vite+Tailwind app with Sidebar/Header/Layout, reading from Firestore. Insights view is the default route and shows ranked recommendations with savings $$. | 25 |
| 6 | May 16–22 | Overview view + savings tracker | Total spend, week-vs-week, cumulative-savings counter (sums up insights marked as "fixed"). | 20 |
| 7 | May 23–29 | Projects view + Tools view | Per-project breakdown with leak score; tool frequency / deny rates / overuse highlights. | 22 |
| 8 | May 30–Jun 5 | Sessions view + remaining 3 detectors | Sortable session list, detail page, the last 3 insight detectors (skill firing, project-cost outlier, tired-coding). | 22 |
| 9 | Jun 6–12 | Output preview + zero-config CLI polish | Landing page "exact terminal output you will see" component. CLI works with zero flags. | 18 |
| 10 | Jun 13–19 | Polish pass 1 (animations, empty states, error states) | Everything looks intentional, nothing looks unfinished. | 20 |
| 11 | Jun 20–26 | Lemon Squeezy integration + tiered pricing | Checkout, webhook → Firestore, free vs paid tier gating, $79 founding-member badge logic. | 25 |
| 12 | Jun 27–Jul 3 | Landing page + docs | Landing leads with "cut your Claude spend 20–40%" — *control* framing throughout. Insights screenshot is hero. 16yo angle in the about section, NOT the headline. | 22 |
| 13 | Jul 4–10 | Private beta to 10 people | 10 hand-picked Claude Code power users from Discord/Reddit/Twitter. Watch them install. Track every confusion. | 20 |
| 14 | Jul 11–17 | Bug bash + polish pass 2 + manual upload fallback | Fix beta findings. If hours allow, add the "drag .jsonl here" web upload fallback. | 20 |
| 15 | Jul 18–24 | Launch prep | Twitter thread, Show HN draft (16yo angle in FIRST line of title), ProductHunt scheduled, 90s loom video, 8 screenshots. | 15 |
| 16 | Jul 25–31 | **LAUNCH WEEK** | Show HN Monday, Twitter Tuesday, ProductHunt Wednesday, Reddit Thursday. Founding-member $79 lifetime active. | 20 |

**Total: 337 hours** — slightly over the 320-hour stated budget, with the last week intentionally heavy. The 17-hour overrun absorbs into the 130-hour growth window if needed.

**Skills view explicitly cut from v1** to make room for Insights detectors. Will revisit post-launch only if user demand is loud.

After Week 16, you transition to the **Growth window (Aug–Oct)**: ~10 hrs/week. This is iterating on customer feedback, writing 2–3 evergreen blog posts (SEO), and the second feature pass. Then the **Lockdown (Nov–Feb)**: ~2–4 hrs/week. Customer email triage on Sundays only, no new features.

## 8. Distribution and launch plan

You don't have an audience yet. The launch has to come from communities that already exist and that match your buyer profile.

### 8.1 Pre-launch (Weeks 13–15)

- **10-person private beta** sourced from: Claude Code Discord, r/ClaudeAI / r/ClaudeCode subreddits, Twitter replies on Anthropic announcements, a specific list of indie hackers who tweet about Claude Code spend. DM each one personally. Offer free lifetime in exchange for honest feedback.
- **Build the launch artifacts in advance:** a 90-second loom video, 8 dashboard screenshots (dark mode, beautiful, dense), a Twitter thread of 8 tweets, a Show HN post, a ProductHunt page, a Reddit post.

### 8.2 Launch week (Week 16)

The order matters:

1. **Monday — Show HN.** Post at 9am EST (best time historically). Title: *"Show HN: Burnd – I'm 16 and I reverse-engineered Claude Code's session format to build the spend dashboard Anthropic doesn't ship."* Reply to every comment within 10 minutes for the first 2 hours.
2. **Tuesday — Twitter.** Long thread, screenshots, the story, link. Tag 5 people who've publicly tweeted about Claude Code costs. Pin the thread.
3. **Wednesday — ProductHunt.** Scheduled launch. Have 5 friends (NOT mom — friends from school, online communities) ready to upvote and comment in the first hour.
4. **Thursday — Reddit.** r/ClaudeAI, r/SideProject, r/IndieHackers. Different post for each.
5. **Friday — Email any friendly journalists** who write about Claude Code / dev tools. Short pitch.

### 8.3 The story leverage — and its expiration date

The "16-year-old in Guwahati built this during board-exam prep year" angle is **the single biggest distribution asset you have, but only at launch.** It's a one-shot lever, not an evergreen brand. Use it hard during Week 16 launch and then let the product carry itself. Specific rules:

- **Show HN title MUST lead with the age.** Format: *"Show HN: <Product> – I'm 16 and I built the Claude Code cost-control tool Anthropic doesn't ship."* The age is the FIRST thing the reader sees. This is non-negotiable for the launch post.
- **Twitter launch thread tweet 1 MUST mention the age in the first sentence.** "I'm 16, I'm in Class 12 in Guwahati, and I just shipped <Product> — the tool that finds leaks in your Claude Code spend before they cost you $1000."
- **Landing page treats the age as supporting, not dominant.** The hero is *"Cut your Claude spend by 20–40% in a week."* The age appears in the "About" / "Built by" footer block with a small founder photo and a one-line bio. Visible, not screaming.
- **Post-launch (Aug onward), retire the age angle from the homepage.** The product has to stand on its own value prop. By month 2, "made by a 16yo" is a curiosity, not a reason to buy.
- **Any press / podcast invitations: mention the age, then immediately pivot to the product story** (the parser, the insights engine, the cost savings). Don't be the "16yo founder" — be "the founder who happens to be 16."

Why the timing matters: tech audiences love precocious-builder stories *as discovery hooks*. They unfollow if the story doesn't graduate into product credibility. The age window is roughly Week 16 to Week 20. After that, the work has to talk for itself.

## 9. The legal/payments shape (the part where mom is involved)

Being 16 in India and selling software in USD globally is *legal* but logistically annoying. Here is the minimum-mom-touch path:

### 9.1 Merchant of record (mom signs once)

Lemon Squeezy is the registered seller. Customers buy from Lemon Squeezy, not from you. LS handles VAT/GST/sales tax/refunds and pays you out monthly. **LS requires the account holder to be 18+**, so the LS account is registered in mom's name with her PAN and bank account.

**Mom's actual workload:**
1. **One time, ~15 minutes:** Sign up for LS, upload her PAN, link her bank account, sign a W-8BEN form. You sit next to her and click through it; she just signs and provides documents. ONE conversation.
2. **Monthly, ~5 minutes:** Money lands in her account from LS. She UPIs it to your minor's account once a month. You set a calendar reminder.
3. **Once a year, ~0 minutes:** Family CA includes the income on her ITR. The amounts are small enough that this is trivial; CA does the same kind of work for the family business already.

**Total ongoing mom-time after setup: ~5 minutes/month.** That's the floor and we hit it.

### 9.2 What you do not do
- Do NOT register a private limited company in v1. Overhead is enormous, requires DIN/DSC, ROC filings, audited statements. Wait until ₹5L+/month MRR.
- Do NOT register for GST in v1. Below threshold, not required for export of services with proper documentation.
- Do NOT use Stripe directly (requires US/UK entity or 18+ Indian PAN with extensive KYC).
- Do NOT use Razorpay International (requires business KYC + 18+).
- Do NOT take payments to a personal UPI from foreign customers. It will work for ₹50 and break for ₹50,000.

### 9.3 Trust + compliance hygiene
- Add a **Privacy Policy** stating that Burnd never reads conversation content, only aggregates. (You'll write this; don't pay a lawyer.)
- Add a **Terms of Service** that's a friendly two-pager. Use a template, modify.
- Have a **Refunds policy:** 14-day no-questions refund. LS handles the actual refund button.
- **Disclose age + builder identity** on the about page, with mom listed as the legal seller. This is honest and removes a vector of complaint later.

## 10. Risks and the explicit mitigation for each

This is the section to revisit in October when something has gone wrong.

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | **Anthropic ships a built-in cost dashboard in the Console.** | Medium-High | High | (a) Move fast — be in the market before they ship. (b) **Architectural hedge: multi-vendor schema from day 1** (see §4 constraint #7 and §6.2) — when Anthropic ships their dashboard, you ship Gemini CLI + Codex support the same week and reposition as "the only cross-vendor cost tool." (c) Differentiate on local-first privacy ("we never see your code"), which a first-party Anthropic tool can't credibly claim. (d) Differentiate on actionable insights with dollar values — vendors typically ship descriptive dashboards, not prescriptive ones. |
| 2 | **Anthropic changes the JSONL session format and breaks your parser overnight.** | High over 12 months | Medium | Version-detect aggressively, fail soft, run a public parser repo so the community helps you patch fast. Subscribe to Claude Code release notes. Keep a `parser-debt.md` with known format quirks. |
| 3 | **Cold-start fails: 10 beta users say "neat" and don't pay.** | Medium | High | Beta with people who already complain about Claude Code spend, not random devs. If beta is lukewarm, pivot positioning *during* beta — try "cost watchdog" framing vs "behavior analytics" framing vs "team budget tracker" framing. |
| 4 | **Launch gets buried** (HN front page miss, Twitter thread flops). | Medium | High | Launch is a 5-day campaign, not a 1-day event. If Monday HN flops, Tuesday Twitter still has a chance. If both flop, regroup, write a "what I learned launching Burnd" post that *itself* can go viral. |
| 5 | **You overcommit hours in May–June and burn out before launch.** | High | Catastrophic | Hard cap at 25 hrs/week. If you hit it twice in a row, take a full Sunday off. Track hours weekly. Honesty here is everything. |
| 6 | **A school assignment / exam crunch eats a full week unexpectedly.** | High | Medium | Build in 1 week of slack across the 16-week plan (already done — Week 14 is "bug bash" which can absorb a missed week). Don't promise yourself you can make up lost weeks at the end — you can't. |
| 7 | **Customer support volume balloons after launch.** | Low | Medium | Self-serve docs, FAQ, GitHub issues for bug reports. Email is *not* the front door — a docs site is. Set expectations: "I respond on Sundays." |
| 8 | **Product works but only 5 people pay; you hit ₹3k/month not ₹10k.** | Medium | Medium-Low | This is success on a smaller scale. Don't shut down. Use Aug–Oct to write the 2 evergreen blog posts that bring SEO traffic (e.g., "How to read Claude Code session files," "Hidden costs in your Claude Code workflow"). Slow compounding is fine; you have 8 months. |
| 9 | **You discover you hate doing customer support.** | Low | Medium | This is genuinely a tell that the business is wrong-shaped for you. If it happens by Week 14, pivot the product to be even more zero-touch (lifetime-only, no support) before launch. |
| 10 | **You ship and ₹0 by Nov 1.** | Low (with the above mitigations) | High | At Nov 1, evaluate honestly. If <₹2k/month: shut down, take the lessons, the parser repo is still a valuable portfolio piece, and the ₹0 outcome is still infinitely better than zero attempts. The hard fail outcome is *learning*, not embarrassment. |

## 11. Why not the other proposals (the comparison)

For the record so future-Garvit doesn't second-guess this in July:

- **PromptLock (prompt-versioning IDE)** was rejected because the market is crowded with funded competitors (PromptLayer, Helicone, Braintrust) and the differentiation requires beating them on craft, which is a longer game than 16 weeks. Good 2027 project.
- **Skillforge (skill-pack marketplace)** was rejected because marketplaces have a cold-start problem requiring both sellers and buyers, Stripe Connect at 16 is a legal nightmare even with mom as registered seller, and the 300-hour build leaves zero slack for school or unexpected setbacks. Good 2027 project *after* Burnd has built audience and revenue infrastructure.

The optimal sequence is **Burnd (2026) → Skillforge or PromptLock (2027, post-boards)**. Don't skip the ladder.

## 12. What success looks like, narrated

Imagine it's **November 15, 2026**. Garvit is studying for his Physics pre-board. Burnd has 23 active monthly subscribers ($9 each) and has sold 7 lifetime deals ($79 each). MRR is $207/month (~₹17,200), plus a one-time backlog of ₹46,000 from lifetimes that landed across August–November.

The product needs maybe 2 hours of attention per week. A customer emailed about a parser bug last Sunday; Garvit fixed it in 15 minutes. A new Claude Code release on Nov 12 changed one field in the JSONL — the parser version-detected it and fell back gracefully because Garvit built the version detection in Week 2.

The HN launch in late July got 340 upvotes and stayed on the front page for 11 hours. The Twitter thread got 800 likes. Anthropic's developer relations person quote-tweeted it on August 3rd ("love seeing what people build with Claude Code 🔥"), which doubled the dashboard's signups overnight.

Garvit has not asked his mother for pocket money since September. He used part of the ChangeLife revenue to buy a cheap secondhand monitor for his desk. His Physics teacher knows about the project and brings it up to other faculty as "you know what Garvit's been doing in his spare time." His cousins know. When his college applications go in next year, Burnd is on the resume — not as "started a project" but as "shipped a profitable product with N users at age 16."

That's the floor case. Everything above ₹10k/month is gravy.

---

## Appendix A — Open questions to resolve before implementation begins

### BLOCKING — must resolve in Week 1, before any production code

1. **Final product name + Anthropic trademark check.** The working title "Burnd" uses Anthropic's trademark and is **not** the final name. Anthropic's trademark policy may forbid third-party products from including "Claude" in their name; using it could trigger a takedown notice *after* you've built brand equity, which would kill momentum. **Action — must complete before Week 2 starts:** (a) read Anthropic's brand/trademark guidelines, (b) pick a neutral name that does not contain "Claude", (c) verify the `.com` and `.dev` are available, (d) register the chosen domain, (e) update all references in the design doc, the codebase, and the parser repo. Backup names to evaluate: `Tokenstream`, `Sessionlog`, `Forgelog`, `Tokenwatch`, `Spendscope`, `Loomspend`. The name decision is non-negotiable as a Week 1 deliverable — treat it as load-bearing infrastructure.

2. **Anonymization scope.** Which fields from the `.jsonl` can be safely uploaded as aggregates without leaking customer code, file contents, prompts, secrets, or company names (project paths often contain company/repo identifiers)? **Action: design the anonymization rules in Week 1, document them publicly in the parser repo before Week 4 (CLI upload).** Trust is the moat — getting this wrong is irrecoverable.

### Non-blocking — can wait

3. **Mom's bank account format for LS payouts.** Does her existing Indian savings account work, or does she need a separate account for cleaner accounting? **Action: ask family CA in Week 11 before LS integration. Do not block the build on this.**
4. **W-8BEN equivalent for India in 2026.** What exactly does Lemon Squeezy require from an Indian seller? **Action: read LS docs in Week 11, not now.**

## Appendix B — Things explicitly out of scope for ChangeLife v1

Listed so they're not forgotten and not snuck back in:
- Mobile app
- Browser extension
- Multi-vendor (Gemini CLI, Codex, Cursor, etc.) — v2 expansion
- Team accounts / collaboration
- Slack/Discord/email notifications
- Public dashboards (share-your-stats)
- Comparing across users / leaderboards
- Code-quality analysis of session content
- Refactoring suggestions
- IDE integration

If any of these become *necessary*, that's a signal to revisit the design doc, not to silently scope-creep the build.

---

**End of design doc. v0.2, 2026-04-11. APPROVED by Garvit. Final name TBD in Week 1.**
