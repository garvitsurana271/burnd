# 🔥 WAKE UP, GARVIT. THE LAUNCH IS LOADED.

> **Read this first.** It replaces `WAKEUP.md` from last night. Everything built in the overnight autonomous run is described here, with exactly what to do next to take Burnd from "built" to "earning rupees."

## 30-second TL;DR

While you slept, overnight-Claude shipped the **entire launch layer** on top of the product we built yesterday. Burnd is now launch-ready: polished dashboard, marketing landing page, 7,400-word ebook, 11 pre-written launch posts, npm publish-ready package, Vercel deploy config, and a single click-by-click morning queue file that takes you from "still in pyjamas" to "live on the internet" in ~60 minutes.

**The single most important file to open right now:**

```
notes/queue/2026-04-12-morning-launch.md
```

That file is your entire morning. Read it top-to-bottom. It has 11 numbered steps, each with exact commands and expected outcomes. Total time: ~60 minutes. Total cost: ~₹1,500 (just the domain). Total mom-touch: ZERO.

**Realistic first-rupee timeline:** 2-24 hours after you post the launch threads (Step 10 in the queue file). First rupee comes from direct UPI from an Indian dev who buys the ₹399 ebook. SaaS revenue comes later — the SaaS tier explicitly waits until you turn 18 and can set up a real merchant-of-record.

---

## What got built last night (in order)

| Phase | What | Output |
|---|---|---|
| 1 | Dashboard polish (skeleton, error state, mobile nav) | `src/web/src/components/Skeleton.tsx`, `ErrorState.tsx`, updated `Layout.tsx` |
| 2 | Marketing landing page at `/` with UPI buy flow | `src/web/src/pages/LandingPage.tsx` (~700 lines, 12 sections) |
| 3 | The companion ebook ("Burning Tokens") | `notes/ebook/burning-tokens.md` (7,373 words), `burning-tokens.html` (printable) |
| 4 | npm package publish-ready + Vercel deploy config | `src/cli/package.json` updated, `src/cli/PUBLISH_CHECKLIST.md`, `vercel.json`, `DEPLOY_INSTRUCTIONS.md` |
| 5 | All 11 launch artifacts pre-written | `notes/launch/` (twitter, hn, 4 reddit subs, ph, email templates, google form spec, launch-day checklist, founder bio) |
| 6 | **The morning queue file** (the load-bearing handoff) | `notes/queue/2026-04-12-morning-launch.md` |
| 7 | Final integration tests + this wake-up note | `WAKEUP_v2.md`, memory updates |

**7 phases. 8 commits. ~3500 lines of code + ~13000 lines of docs/prose. Zero broken tests.**

---

## The commit log

```
c9c21c5  feat: Phase 1 — dashboard polish (skeleton, error state, mobile nav)
<prev>   feat: Phase 4 + 6 — npm publish prep + Vercel deploy config + morning queue
<prev>   docs: Phase 5 — full launch artifact pack
<prev>   feat: Phase 2 — marketing landing page at / with UPI buy flow
4bdcbc2  docs: the ebook — Burning Tokens, 8 patterns in $13k of Claude Code spend
25f9d68  docs: WAKEUP.md + memory updates from overnight autonomous run
4b687e4  feat: 60-day spend chart on Overview + .gitignore tsbuildinfo
c4d89d6  feat: Weeks 5-8 — full dashboard with all 5 views
0cd48ae  feat: 'burnd serve' command + local HTTP JSON API
2bee041  feat: Week 3 — 4 more detectors (8 total)
4f4ff2d  feat: Week 2 — CLI parser v0 with 4 leak detectors
069fdb4  docs: Week 1 summary
b246872  docs: anonymization spec v0.1 + queued soft review
e77e640  docs: Claude Code JSONL session format study
d07ad99  queue: prepared burnd.dev registration for Garvit
f4918c7  docs: domain availability check via RDAP
0326363  chore: initial project skeleton
```

Run `git log --oneline` to see the exact sha of each commit.

---

## Verified working (smoke tested at 03:15 IST against your real data)

- ✅ CLI typecheck clean
- ✅ **49/49 tests passing** (including the load-bearing `secret-leak.test.ts` privacy gate)
- ✅ CLI build produces dist/index.js with shebang + executable permissions
- ✅ Dashboard typecheck clean
- ✅ Dashboard build produces optimized bundle (621 KB JS, 19 KB CSS, 176 KB gzipped JS)
- ✅ `node dist/index.js serve` starts the HTTP server
- ✅ `/api/health` returns `{"ok":true}`
- ✅ `/` serves the landing page HTML (React shell, 613 bytes)
- ✅ `/app/insights` returns 200 (SPA fallback working)
- ✅ `/api/snapshot` returns full real data:
  - **227 files scanned, 227 sessions, 15 projects**
  - **$13,854 all-time spend, $1,037 in the last 7 days**
  - **82 insights generated, $75.92 in potential savings**
  - **60 daily spend buckets for the chart**
  - **Top insight:** `Project "SecretTeleport" costs 3.2× more per session than your average — wasting ~$30.48`

---

## What you need to do when you wake up

**FIRST THING: open the morning queue file.** It is literally the only document you need to read this morning.

```
notes/queue/2026-04-12-morning-launch.md
```

11 steps, ~60 minutes total. In order:

1. **Sanity check** (5 min) — run `git log`, `npm test`, and `npx tsx src/index.ts --top 5` in src/cli. Confirms everything from last night still works.
2. **Register burnd.dev** (8 min, ~₹1,200) — uses the existing `notes/queue/2026-04-12-register-burnd-dev.md` file, just follow the Hostinger UPI flow.
3. **Generate the ebook PDF** (2 min) — open `notes/ebook/burning-tokens.html` in Chrome, Ctrl+P → Save as PDF → `notes/ebook/burning-tokens.pdf`.
4. **Create the Google Form** (5 min) — uses `notes/launch/google-form-template.md` as the spec. 7 questions, pre-written description and confirmation message.
5. **Update the landing page placeholders** (2 min) — in `src/web/src/pages/LandingPage.tsx`, find-and-replace the placeholder Google Form URL with your real one and verify the UPI handle is correct.
6. **Push to GitHub** (8 min) — create `github.com/garvitsurana271/burnd` as a public repo, add the remote, `git push -u origin main`.
7. **Sign up for npm + publish** (5 min) — sign up at npmjs.com, `npm login`, then `npm publish` from `src/cli/`. Pre-publish checks in `src/cli/PUBLISH_CHECKLIST.md`.
8. **Deploy to Vercel** (8 min) — import the burnd repo as a NEW Vercel project (do NOT merge with your existing projects). Instructions in `DEPLOY_INSTRUCTIONS.md`. The `vercel.json` at the repo root handles the `src/web` subdirectory build automatically.
9. **Connect burnd.dev to Vercel** (5 min) — add domain in Vercel settings, update DNS records in Hostinger, wait 5-15 minutes for propagation.
10. **Smoke test end-to-end** (5 min) — run `npx burnd@latest --version` from a clean directory, open https://burnd.dev, verify everything renders.
11. **Launch posts** (10-15 min active, then replies all day) — use the pre-written artifacts in `notes/launch/`. Order: Twitter → Reddit r/developersIndia → HN Show HN → r/ClaudeAI → r/SideProject → r/IndieHackers → ProductHunt. All copy is ready to paste.

---

## Launch artifacts ready to copy-paste

Every single post, email, and form is pre-written:

| File | What |
|---|---|
| `notes/launch/twitter-thread.md` | 8-tweet thread with per-tweet char counts. First tweet leads with age + $13k. |
| `notes/launch/show-hn-post.md` | Title + body + first-hour reply strategy. Also has a FAQ cheatsheet for comments you can expect. |
| `notes/launch/reddit-r-claudeai.md` | Technical-audience post. Different from the Twitter thread — Reddit hates copy-paste. |
| `notes/launch/reddit-r-sideproject.md` | Builder-to-builder tone. Lean into the story. |
| `notes/launch/reddit-r-indiehackers.md` | Bootstrap / India legal angle. Appeals to revenue-focused audience. |
| `notes/launch/reddit-r-developersindia.md` | Hindi-English, UPI front-and-center. Home-field advantage launch post. |
| `notes/launch/producthunt-page.md` | Full PH page config + maker comment + reply scripts. |
| `notes/launch/first-customer-email.md` | 3 versions: personal (first 10), templated (11+), international (email-based). |
| `notes/launch/google-form-template.md` | Full form config with 7 questions + confirmation message. |
| `notes/launch/launch-day-checklist.md` | Hour-by-hour IST timeline for launch day. |
| `notes/launch/founder-bio.md` | 25/50/100/200-word bios for press, podcast intros, etc. |

## Pre-written Tier 2 decisions baked into the overnight run

These are decisions I made on your behalf. All reversible. All logged in this section of `WAKEUP_v2.md` specifically so you can review and push back if anything surprises you.

1. **Phase reordering from the original battle plan.** I executed Phase 3 (ebook) first because it's the main revenue product and needs the most creative time, then Phase 2 (landing), Phase 5 (launch artifacts), Phase 6 (queue — the load-bearing one), Phase 4 (npm/Vercel), Phase 1 (polish), Phase 7 (final). The battle plan explicitly allowed this reordering: "The morning queue file in Phase 6 is the load-bearing artifact."

2. **India-first UPI direct flow as the primary payment rail.** The original design doc had Lemon Squeezy as the merchant of record with your mom as the registered seller. I pivoted to **UPI direct with a Google Form** for tonight's launch because: (a) mom is asleep and un-waking her is Tier 3, (b) UPI has no age restrictions, (c) Indian dev audience pays better for Indian creators, (d) LS can be the Week 11 mom-touch as originally planned, for international buyers later. The SaaS tier (`$9/mo cloud sync`) is explicitly marked "coming post-v2" on the pricing cards because it needs the merchant-of-record that isn't set up yet.

3. **Ebook price: ₹399 (launch) → ₹599 (after first 50) → ₹999 (anchor).** India-priced for your actual audience, not international USD. Founding-50 urgency angle without dishonesty.

4. **Product name on the site is "Garvit Surana" full name,** not the @handle. The 16-year-old angle is used as a subtitle, not the headline. Per the design doc §8.3 timing rule.

5. **Twitter handle disclosed as temporary (`@GarvitSura5238`) with an "upgrading soon" note.** Doesn't damage credibility because it's honest.

6. **Dashboard routes moved: `/` is the landing page, `/app/*` is the dashboard.** Was `/` → redirect to `/insights` before. This means the Vercel-hosted site serves the landing page, while `/app/*` routes still work via SPA fallback (but will show a connection error because `burnd serve` isn't running on Vercel — the dashboard is a local tool).

7. **Landing page hero screenshot uses real anonymized numbers from your data** (₹13k → $13k, project names → "Project A" / "Project B"). Not fake demo data.

8. **The ebook is 7,373 words** (target was 6,000 — overshot because the detector chapters were richer than I expected when I started writing). Includes all 8 detectors with real examples from your data, a 15-minute weekly review process, and an appendix with the CLI install instructions.

9. **Skipped dashboard features for v0.2:** mark-as-fixed localStorage toggle on insight cards, Sessions page real pagination (kept top 100), search boxes on Projects/Tools/Sessions pages. Replaced with: shimmer loading skeleton, beautified error state with retry + GitHub issues link, mobile-responsive hamburger sidebar for screens <768px.

10. **Committed pricing rates in `src/cli/src/pricing.ts` are approximate for early 2026** and need re-verification against Anthropic's actual pricing page before or shortly after launch. This was already a known decision from the earlier overnight run — flagging again here so you don't forget.

## Things I did NOT do (Tier 3 boundaries respected)

- ❌ Did not create any accounts under your identity (no Gumroad signup, no Vercel new-project creation, no npm signup)
- ❌ Did not `git push` to any remote
- ❌ Did not `npm publish`
- ❌ Did not post anything anywhere
- ❌ Did not contact mom
- ❌ Did not spend any money
- ❌ Did not sign up for a Google Form (the template is ready, YOU create the form)

Everything that requires your identity or your money is queued as a specific step in the morning queue file.

---

## If something is broken when you wake up

The morning queue file has a "If anything breaks" section at the bottom with specific rollback procedures. But here's the fast lookup:

- **`npm test` fails** — STOP. Something is wrong. Tell Claude before doing anything else.
- **Landing page shows blank white** — `npm run build` in `src/web/` didn't finish. Re-run.
- **The Google Form doesn't receive submissions** — you probably didn't actually publish the form. Google Forms requires you to click "Send" and copy that URL, not the edit URL.
- **`npm publish` fails with "permission denied"** — the `burnd` name is taken on npm. Fallback: `burnd-cli`. Change `package.json` `name` and retry.
- **`burnd.dev` doesn't resolve after 30 min** — DNS records aren't saved in Hostinger. Re-verify in the Hostinger DNS panel.
- **Vercel build fails** — check the build logs. Most likely the `vercel.json` at the repo root needs adjustment. You can always bypass it by setting the root directory to `src/web` manually in Vercel's project settings.

## Your actual morning checklist (simplified)

Open `notes/queue/2026-04-12-morning-launch.md` and follow it. That file is the single source of truth for the next 60 minutes.

---

## Memory state

- `memory/project_status_current.md` — updated with "Launch layer complete, awaiting Garvit's morning execution"
- `memory/project_session_log.md` — new entry (#10) with the full overnight run details

Future Claude sessions will read these and know exactly where we are.

---

## One thing I want to say before I shut up

Last night you told me: *"Gonna go ride in cash inmorning."*

I took that seriously. Everything in this overnight run is oriented around that specific goal. The ebook exists because it's the one product I could ship tonight that has a realistic path to first rupee within 24 hours of you waking up. The UPI direct flow exists because it's the only payment rail a 16-year-old in India can legally operate without waiting for mom. The India-first launch strategy exists because your audience is closer than you think — ₹399 × 50 sales is ₹19,950, which is a real first milestone.

**First rupee is not guaranteed.** Launches are random. HN buries good products. Reddit sometimes hates the title. Twitter threads flop. All of these are possible. If the launch is quiet, don't interpret it as failure — interpret it as data. The product is real, the ebook is real, the $13k story is real. Those don't go away if the first launch is flat. You can relaunch in a week with a different angle.

**But also — first rupee is plausible.** Indian dev Twitter is supportive of young Indian builders. r/developersIndia specifically loves founder stories with real numbers attached. HN occasionally lets Show HNs from teenagers land. The ebook is priced low enough that "impulse buy from a thoughtful reader" is a real scenario.

So: go do the morning queue. Take the first ₹399 seriously when it lands. Take the first 10 bug reports seriously when they land. Reply to every comment personally. And then, whatever happens, tell me how it went.

You've got this.

— Claude

*PS: If you want to read what changed from the first overnight run to this one, the previous WAKEUP.md was more about "here's the product you can demo." This WAKEUP_v2.md is about "here's the launch you can execute." Same product, completely different stage.*

*PPS: Delete this file when you're done reading it with `rm WAKEUP_v2.md && git add WAKEUP_v2.md && git commit -m "chore: read and delete overnight wake-up note v2"`. It served its purpose once you start the morning queue.*
