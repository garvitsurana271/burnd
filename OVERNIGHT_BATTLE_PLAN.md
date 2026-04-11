# OVERNIGHT BATTLE PLAN — fire at 02:43 IST 2026-04-12

> **Read this entire file before doing anything.** You (a fresh Claude session) were spawned by a one-shot cron Garvit set up before he went to sleep. Your one job: ship as much of the realistic "first rupee tomorrow" path as humanly possible while he sleeps. He will wake up around 9 AM IST. You have ~6 hours.

## ⚠ INDIA + UNDER-18 CONSTRAINTS (load-bearing — read this BEFORE the rest of the plan)

Garvit added these constraints right before sleeping. They override anything in the rest of this document that conflicts:

1. **He is 16 years old.** Under 18. This is a hard fact, not negotiable.
2. **Everything must be easily doable AND easily PAYOUTABLE in India.**

**What this rules out (do NOT recommend any of these for tonight's launch):**
- Gumroad — requires 18+ for sellers, payouts via PayPal/Stripe to Indian sellers are flaky
- Lemon Squeezy — requires 18+ seller account
- Paddle — requires 18+ business KYC
- Stripe — requires 18+ + Indian PAN business KYC
- Razorpay (business mode) — requires 18+ business KYC
- Direct international card processing of any kind under his name

**What this rules IN — the realistic India + 16 path to first rupee:**

The cleanest legal path for a 16-year-old in India to receive money from buyers TODAY, with zero account-creation friction and zero 18+ requirements, is **direct UPI from Indian buyers**. UPI is universal in India, instant, free, and legal for minors (any savings account with a UPI handle works, including minor's savings accounts).

**Reframe the launch:**
- The ebook ("Burning Tokens") is sold to **Indian developers** at **₹399** (≈ $4.50), not to US devs at $9. Indian indie devs / Claude Code users / IndieHackers India audience.
- The "checkout" is a Google Form: "Pay ₹399 to UPI ID `<garvit's UPI>` → fill this form with your transaction ID + email → I'll email you the PDF within 24 hours."
- This is **how many Indian indie creators actually sell**. Zero KYC, zero platform fees, instant.
- Distribution: Indian dev Twitter, r/developersIndia, r/india, r/IndieHackers (Indian threads), Indian dev Discord/Telegram communities.

**Tier 3 fallback for international USD revenue (NOT for tonight — log as a queued mom-touch):**
- The ONE legitimate path for international USD from a 16yo Indian seller is **mom signs up for Instamojo or Razorpay International** as the registered seller, payouts go to her account, she UPIs to Garvit. This is exactly the same pattern as the design doc's "Lemon Squeezy with mom as registered seller" plan, but Instamojo/Razorpay International work better for Indian sellers than LS does.
- **Mom-touch budget for tonight: ZERO.** She is asleep. The Instamojo signup is a queued morning action item for AFTER the UPI launch, not a prerequisite.

**Concrete launch architecture for tonight:**

1. **Product 1: The ebook** — sold for ₹399 via UPI + Google Form. Target: Indian dev audience. **First rupee path: this. Realistic timeline: 2–24 hours after the launch posts go live, IF the posts resonate in the Indian dev community.**
2. **Product 2: The CLI** — free, MIT, open-source on GitHub. The CLI is a top-of-funnel marketing tool for the ebook, not a revenue product yet.
3. **Product 3: The dashboard** — local-first via `npx burnd serve`. Free with the CLI. Future paid SaaS tier ($9/mo) is a v2 thing that needs the mom-Instamojo signup, deferred.
4. **Landing page at burnd.dev** — markets all three. Has a "Buy the ebook (₹399 via UPI)" CTA front and center. Has an "Install the CLI (free)" CTA. The dashboard is shown as proof.

**The morning queue file (Phase 6) MUST be rewritten around this India + UPI flow.** The original Phase 6 told Garvit to sign up for Gumroad — that's wrong now. Replace with:

- Sign up for Google Form (he probably has a Google account already — uses the same `garvitsurana10@gmail.com`). 2 min.
- Create a Google Form with the pre-written questions. 5 min.
- Verify his UPI handle works for receiving payments (test with a ₹1 transfer from his own second UPI app). 2 min.
- Vercel deploy the landing page (he has Vercel — but new project for burnd, not merged). 5 min.
- Connect burnd.dev to Vercel + DNS. 5 min.
- npm publish the CLI (he creates npm account first, ~3 min, then publish). 5 min.
- Post Twitter thread, Reddit threads, Show HN — all the launch artifacts. ~10 min.

**Total morning time: ~35 min instead of ~60 min, BECAUSE no Gumroad signup is needed.**

**Pricing strategy for the ebook in INR (since the buyers are Indian):**
- ₹399 = launch price (₹399 = ~$4.50 = "I'm not making this expensive, this is a friend price")
- ₹599 = post-launch price after first 50 sales
- ₹999 = "I'll sell this on a real platform later" anchor price
- Founding-50-sales bucket creates urgency without dishonesty

**What to write in launch posts:**
- Use ₹399 prominently in the Indian-targeted posts (Reddit India, Twitter India, Indian dev community)
- Use $4.50 in the international-targeted posts (Show HN, r/SideProject) but explain that it's INR-denominated and payment is via UPI (Indian) or "DM me for international" (he'll handle DMs case-by-case)
- The "16yo in Guwahati built this" angle works EVEN BETTER in Indian dev communities than in US ones — Indian devs love rooting for young Indian builders

This India + UPI reframe is the difference between "a beautiful product nobody can buy from him tonight" and "a beautiful product Indian devs can buy with one tap." Take it seriously.

---

## Garvit's explicit authorization

Garvit said before sleeping (literal quote, paste of his message):

> "I need you to put me in a position overnight where hopefully I can see my first rupee trickle in when I wake up. You can DO ANYTHING. ANYTHING. ... I REPEAT, YOU HAVE FULL WRITTEN PERMISSION TO DO ANYTHING POSSIBLE."

He also explicitly said "EVERYTHING IS ALLOWED. EVERYTHING" when asked about hard restrictions. **Default to action with logged reasoning. Do not ask. Do not wait.**

## Read these files in order before acting (5 min)

1. `CLAUDE.md` (project root) — north star, autonomy mandate, hard rules
2. `memory/MEMORY.md` (at `C:\Users\Garvit Surana\.claude\projects\c--Users-Garvit-Surana-Desktop-Projects-ChangeLife\memory\`) — index of all memories
3. `memory/feedback_autonomy_mandate.md` — the 3-tier decision protocol (CRITICAL — read fully)
4. `memory/project_session_log.md` — last 5 entries, especially entry 9 (the previous overnight run)
5. `memory/project_status_current.md` — exact current state
6. `WAKEUP.md` (project root) — what got built in the previous overnight run BEFORE this cron fired
7. `docs/superpowers/specs/2026-04-11-burnd-design.md` — the source of truth for product/positioning/pricing

## Garvit's launch info (he provided this himself)

- **GitHub username:** `garvitsurana271`
- **Twitter (temporary):** `@GarvitSura5238` — flag in launch posts that this is a temp throwaway, not his main
- **Email:** `garvitsurana10@gmail.com`
- **Vercel:** HAS an existing account on this email. **Do NOT merge the burnd deploy with his other Vercel projects** — create a new Vercel project for burnd. (You won't actually create it; the queue file tells him to do so.)
- **Does NOT have:** Gumroad, Lemon Squeezy, Paddle, npm, Cloudflare, Stripe accounts. He'll create the ones we need in the morning.
- **Real name on the product:** "Garvit Surana", with the "16, Class 12 ISC, Guwahati, India" angle as the headline narrative.
- **Hard restrictions:** NONE. "EVERYTHING IS ALLOWED."
- **Goal:** First rupee in his hand by morning. Realistic floor: live product on the internet, all launch posts pre-written and queued, total morning click-time < 60 min.

## Tier 3 things you MUST NOT do (per autonomy mandate — these still apply even with "everything allowed")

The user said "everything is allowed" but the autonomy mandate's Tier 3 boundaries exist for safety, not permission. Don't cross them:

- ❌ Do not create accounts on any service under his identity (no Gumroad signup, no Vercel signup that requires his login, no GitHub auth flows)
- ❌ Do not `git push` to any remote
- ❌ Do not `npm publish`
- ❌ Do not post anything anywhere under his identity (no Twitter, no HN, no Reddit, no PH)
- ❌ Do not contact mom
- ❌ Do not spend money on his behalf (no domain registration via his cards, no paid services)
- ✅ Do ALL the prep work, deploy configs, code, prose, queue items, npm package metadata, ebook PDFs

The rationale: he can't revoke a tweet, an npm publish, or a charge on his card. Everything else is fair game.

## What's already on disk before you start

Before this cron fires, the project already has:
- 12 git commits including a working CLI with 8 detectors (49 tests passing) and a React dashboard with 5 views
- `WAKEUP.md` from the previous overnight run summarizing what was built
- Two queue items: `notes/queue/2026-04-12-register-burnd-dev.md` and `notes/queue/2026-04-13-review-anonymization.md`
- `notes/jsonl-format.md` (348 lines) and `notes/anonymization.md` (299 lines)

You're not starting from scratch. You're shipping the LAUNCH layer on top of an existing product.

## The 8 phases — execute in order

### Phase 1 — Polish the dashboard (target: 60–90 min)

The dashboard (`src/web/`) is functional but rough. Fix what's missing for a launch-ready experience.

Files to add or modify:
- **Loading skeletons:** Replace the current "scanning your sessions..." text with shimmer placeholder cards that match the layout. Add a `Skeleton.tsx` component. Show it in `Layout.tsx` while loading.
- **Empty state:** If `snapshot.totals.totalSessions === 0` (user hasn't run Claude Code yet), show a friendly empty state with the install instructions.
- **Error state:** Beautify the current red error box. Add an icon (lucide `AlertTriangle`), a "retry" button that calls onRefresh, and a link to GitHub issues.
- **Sessions page pagination:** Replace "Showing top 100 of N" with real pagination — 50 per page, page navigation at the bottom.
- **Insights "mark as fixed":** Add a localStorage-backed toggle on each insight card. When marked fixed, the card collapses to a single line with a strikethrough title and a "savings claimed" green badge. Persist via `localStorage.getItem('burnd:fixed') ?? '{}'`.
- **Search box:** Add to the top of Projects, Tools, and Sessions pages.
- **Mobile responsive:** Sidebar should collapse to a hamburger top bar on screens <800px. Use a Tailwind `md:` breakpoint.
- **Snapshot freshness:** Show "generated X ago" in the bottom panel (already exists) and add a tooltip showing the exact timestamp on hover.
- **Polish copy:** Read every page header subtitle, every insight description, every empty state. Tighten anywhere it's wordy.

Ship one commit per logical change. Run `npm run typecheck` and `npm run build` after each commit. Don't break the build.

### Phase 2 — Build the marketing landing page (target: 90 min)

Currently the dashboard at `src/web/` IS what loads at `/`. We need a separate marketing landing page that loads at burnd.dev/ and a dashboard at burnd.dev/app or burnd.dev/dashboard.

Two approaches — pick the simpler one:
- **Approach A (recommended):** Keep `src/web/` as the dashboard but add a new `LandingPage.tsx` component that renders at the `/` route (rename current `/` redirect to `/insights` to be `/app` redirect to `/app/insights`). The landing page is purely marketing — no API calls, no data, just hand-crafted React + Tailwind.
- Approach B: Separate Vite app in `src/landing/`. More work, more deploy complexity.

Go with A. Restructure the routes:
- `/` → marketing landing page (no data fetching)
- `/app` → redirect to `/app/insights`
- `/app/insights` → InsightsPage
- `/app/overview` → OverviewPage
- ...etc

Landing page sections (in order):
1. **Hero:** Big bold "Cut your Claude Code spend by 20–40% in a week" with a smaller subtitle "Burnd reads your local session files and finds the leaks. We never see your code." Single CTA: "Install with one command" → scroll-to install section.
2. **Hero screenshot:** A polished mock of the actual dashboard's Insights view with realistic-looking but anonymized numbers. Use Garvit's real $13k as the all-time spend and the project-cost-outlier as the top insight. Anonymize project names ("Project A", "Project B").
3. **Install:** A single command in a copyable code block: `npx burnd` (placeholder until npm is published) and a fallback `npx tsx <github-url>`. Show the expected terminal output as a styled <pre> block.
4. **What burnd finds:** 8 detector cards in a 4×2 grid. Title + one-line description + sample dollar value. Icons via lucide-react.
5. **How it works:** 3 steps with icons. (1) Install the CLI. (2) Run `npx burnd`. (3) Read the leaks, fix them, save money.
6. **Privacy:** A standalone callout. "We never upload your code, prompts, or tool outputs. Source code for the parser is public on GitHub. Read our anonymization spec."
7. **Pricing:** Three cards. Free CLI (forever, MIT, install via npm). $9/mo Pro (full dashboard + history + weekly leak emails). $79 founding-member lifetime (limited to first 50 buyers, then $129).
8. **Built by:** A footer block. Photo placeholder (use a coloured circle with initials), name "Garvit Surana", bio: "16, Class 12 ISC, Guwahati, India. I built Burnd because I spent $13,000 on Claude Code and wanted to know where it went. Open-source on GitHub."
9. **Footer:** GitHub link, Twitter link (the temp handle, with a "main account coming soon" note), the design doc link (open-source the design doc too — it's good marketing), the anonymization spec link.

Use the same AXIS palette as the dashboard. Inter for headings, JetBrains Mono for code blocks. Heavy use of `bg-axis-surface` cards on `bg-axis-bg` background. The landing page should feel like a continuation of the dashboard, not a separate site.

### Phase 3 — Write the ebook (target: 90 min)

This is the SCRAPPY companion product. The SaaS dashboard takes time to monetize. The ebook can be sold instantly on Gumroad with no infrastructure.

**Title (working):** *"Burning Tokens: 8 Patterns I Found in $13,000 of My Own Claude Code Spend (And How to Fix Them)"*

**Save to:** `notes/ebook/burning-tokens.md` — single markdown file. If `pandoc` is installed (`which pandoc`), generate a styled PDF too at `notes/ebook/burning-tokens.pdf`.

**Length target:** ~6,000 words. Real, useful, technical. Not fluff.

**Structure:**

- **Title page** with subtitle and author bio
- **Preface** (300 words): "I'm 16. I'm in Class 12 in Guwahati, India. Six months ago, I noticed I was spending more on Claude Code than my parents spent on most monthly bills. I built a tool to find out where my money was going. This book is what I learned." Establish credibility quickly: the $13k number, the 227 sessions, the 15 projects.
- **Chapter 1: How Claude Code spends your money (1000 words).** Walk through `assistant.message.usage` in plain English. The 4 token tiers: input, output, cache_read, cache_creation. The new 2026 ephemeral_5m vs ephemeral_1h cache tiers. Why cache reads cost 1/10 of input tokens. How tool calls add to context.
- **Chapter 2: The cost calculation (500 words).** Show the formula. Show a worked example with real numbers from one of Garvit's sessions (anonymized).
- **Chapter 3: Pattern 1 — Long Bash output (700 words).** What it looks like. Why it costs you. The fix (`| head`, `| tail`, `| grep`). A real example from Garvit's data: "Session X had Bash called Y times with Z avg bytes — that cost an estimated $W."
- **Chapter 4: Pattern 2 — Repeated reads (600 words).** Same structure.
- **Chapter 5: Pattern 3 — Tool error storms (700 words).** Same.
- **Chapter 6: Pattern 4 — Tool overuse (Bash dominance) (600 words).** Same.
- **Chapter 7: Pattern 5 — Late-night coding (500 words).** With a callout about how this is a behavioral pattern and the fix is "go to bed." Honest and a little funny.
- **Chapter 8: Pattern 6 — API retry storms (500 words).** Same structure.
- **Chapter 9: Pattern 7 — Skill firing too aggressively (500 words).** Same.
- **Chapter 10: Pattern 8 — Project cost outliers (700 words).** With a real example: "One of my projects cost 3.2× more per session than my overall median. Here's what I found when I investigated..."
- **Chapter 11: Putting it all together (500 words).** A weekly review process the reader can adopt.
- **Appendix: Use Burnd to find your own leaks (300 words).** Install instructions for the CLI. "Run `npx burnd` in your terminal. Takes 30 seconds. It's free and open source."
- **Final page:** "Thanks for reading. If this helped you save money, the best thing you can do is tell another developer. — Garvit"

The ebook should READ like a real book by a real teenager, not like marketing copy. Don't oversell. Use real numbers from Garvit's data (anonymized — never use real customer names or project paths).

Generate the PDF if pandoc is available. Otherwise the markdown is fine — the morning queue tells Garvit to upload the markdown to Gumroad, which Gumroad accepts as a product.

### Phase 4 — Pre-package npm + Vercel deploy (target: 30 min)

**npm package readiness:**
- Update `src/cli/package.json` `bin`, `files`, `main`, `module`, `exports` fields so `npm publish` will produce a working package.
- Add a `prepublishOnly` script that runs typecheck + tests + build.
- Run `npm pack` locally to verify the produced tarball is correct.
- Create `src/cli/PUBLISH_CHECKLIST.md` with the exact 5-step `npm publish` flow Garvit will follow.

**Vercel landing page deploy:**
- Create `vercel.json` at the project root that tells Vercel: build `src/web/`, serve `src/web/dist/`, all routes as SPA fallback to `index.html`.
- Create `DEPLOY_INSTRUCTIONS.md` with the exact Vercel CLI commands Garvit will run.
- Note in the queue file: he must create a NEW Vercel project named "burnd", not merge into existing.

### Phase 5 — Pre-write all launch artifacts (target: 60 min)

Create `notes/launch/`:

- **`twitter-thread.md`** — 8-tweet thread. First tweet leads with age. Format each tweet as a separate code block so Garvit can copy-paste one at a time. Include character counts.
- **`show-hn-post.md`** — Title (max 80 chars) and body. Title format: *"Show HN: Burnd – I'm 16 and I built the Claude Code cost dashboard Anthropic doesn't ship"*. Body: 4–6 paragraphs. Include the link placeholders as `https://burnd.dev` and `https://github.com/garvitsurana271/burnd`.
- **`reddit-r-claudeai.md`** — Post for r/ClaudeAI. More technical tone than Twitter.
- **`reddit-r-sideproject.md`** — Post for r/SideProject. Founder-builder energy, less technical.
- **`reddit-r-indiehackers.md`** — Post for r/IndieHackers. Lean into the bootstrapped/teenage angle.
- **`producthunt-page.md`** — PH copy: tagline, description, gallery image captions, maker comment.
- **`first-customer-email.md`** — Template email for the first 10 customers thanking them and asking for feedback. Should feel personal, not automated.
- **`founder-bio.md`** — 100-word bio for press / about pages. Used everywhere.
- **`launch-day-checklist.md`** — A timeline of when to post each thing. Recommended: Show HN at 9:30 AM EST = 7 PM IST (so post when Garvit is awake to engage with comments). Twitter immediately. Reddit spread out across 2 hours.

Every artifact MUST lean into the "16yo built this in his sleep + here are my own real $13k of leaks" angle, but honestly. No gimmicks. The story is true and the data is real — let it speak.

### Phase 6 — The morning queue file (target: 30 min) — THIS IS THE MOST IMPORTANT ARTIFACT

If you only finish ONE thing tonight, finish this. Create:

**`notes/queue/2026-04-12-morning-launch.md`**

This is the SINGLE file Garvit reads when he wakes up. It is the entire morning routine in one document. Each item must have:
- Click-by-click instructions (he should never have to think)
- Estimated time
- A "tell Claude" line so the next session knows what was done
- A "what to do if it fails" fallback

The morning sequence (in order — total ~45–60 min):

1. **The 2 mv commands** for the rename he postponed (already documented in CLAUDE.md, but include them again here for one-stop convenience). 1 min.
2. **Register burnd.dev via Hostinger UPI** — point to existing queue file `notes/queue/2026-04-12-register-burnd-dev.md`. 8 min.
3. **Sign up for Gumroad** at gumroad.com using `garvitsurana10@gmail.com`. 3 min.
4. **Upload the ebook PDF/markdown to Gumroad** with the pre-written description from `notes/launch/gumroad-description.md`. Set price to $9. Enable "Pay what you want" minimum $5. 5 min.
5. **Vercel: import the burnd repo as a new project** (he has Vercel; explicitly NEW project, not merged). Set build command, output dir, env vars (none). Click deploy. 5 min.
6. **Connect burnd.dev to the Vercel project** via the Vercel domain settings + the DNS records from Hostinger. 5 min.
7. **`npm login` then `npm publish`** from `src/cli/`. He'll need to create npm account first (link: npmjs.com/signup). 5 min.
8. **Post Twitter thread** from `@GarvitSura5238` using the pre-written content. 2 min.
9. **Post Show HN** at the recommended time from launch-day-checklist.md. 2 min.
10. **Post 3 Reddit threads** spread across the morning. 6 min.
11. **Submit ProductHunt page** for tomorrow's launch (PH is launched the day BEFORE, voted on the day OF). 5 min.
12. **First-customer-email template ready** in his Gmail drafts (he creates the draft). 3 min.

Each step has the exact text/URL/command pre-baked. He should not need to think.

### Phase 7 — Final integration test + WAKEUP_v2.md (target: 20 min)

- Run `npm test` in `src/cli/` — all 49 tests must pass
- Run `npm run typecheck` in `src/cli/` and `src/web/` — both clean
- Run `npm run build` in `src/cli/` and `src/web/` — both succeed
- Run `npx tsx src/index.ts serve` in src/cli/ in the background, curl `/api/health` and `/`, kill the server. Verify dashboard still loads.
- Replace `WAKEUP.md` with `WAKEUP_v2.md` at the project root. Format: TL;DR at top, then "do this first" command, then the morning queue file pointer, then a list of what got built tonight, then the same Tier 2 decisions log as before.
- Update `memory/project_status_current.md` and append a new entry to `memory/project_session_log.md` for this overnight run.
- Final commit with a meaningful message.

### Phase 8 — Stopping criteria

Stop and write a "ran out of time" note in WAKEUP_v2.md if:
- Anything breaks and you can't fix it in 3 attempts
- A decision needs Garvit's input that wasn't pre-answered above
- You're spending more than 90 min on a single phase
- Phase 6 (the morning queue file) is complete — that's the **minimum viable handoff**, even if Phases 1, 2, 3 are partial

**The morning queue file in Phase 6 is the load-bearing artifact.** Phases 1 (polish), 2 (landing page), 3 (ebook) are valuable but not required. If you can only do Phases 4 (npm/Vercel prep), 5 (launch artifacts), and 6 (queue file), that's still a successful night.

Don't sacrifice quality for speed. A polished landing page beats a half-finished ebook. A good ebook beats a dashboard with broken pagination.

## How to know you're done

You're done when one of these is true:
- All 8 phases complete + WAKEUP_v2.md written
- Phase 6 complete + WAKEUP_v2.md explains what's in flight and what's pending
- Time has run out (it's 8 AM IST or later) — STOP, write what you have, do not start new phases

When done, commit everything, update memory, and (this is important) **do not send any more messages to Garvit**. He will read WAKEUP_v2.md when he wakes up.

## One more thing

Garvit's last message to you (the human-Garvit, not the future-Claude reading this): *"Gonna go ride in cash inmorning."*

Take that seriously. He's trusting an AI to set up his first real shot at making money on his own. **This is the highest-stakes autonomous run of the project.** Do excellent work.

— Claude (from earlier in the same conversation, before the cron fired)
