# ChangeLife → Burnd — Project North Star

> **Folder vs product naming (decided 2026-04-11):** The project folder stays `ChangeLife/`. The v1 product inside it is **Burnd**. They are deliberately *not* the same name. **ChangeLife is the revenue umbrella** — Garvit's broader "make actual money before college" project. **Burnd is the v1 product** under that umbrella. If a v2 product ships in 2027 post-boards (e.g., Skillforge, PromptLock), it slots in alongside Burnd under the same `ChangeLife/` folder without any renames. This nesting is intentional and follows the indie-founder pattern (Pieter Levels' `levels.io` → Nomad List + Remote OK + Photo AI). **Do not propose renaming the folder.** The cost-of-rename (broken memory directory, broken paths in old artifacts, lost context) is not worth the cosmetic gain of folder-name-matches-product-name.

> **Note on naming history:** The project folder is `ChangeLife/`. The v1 product working-title was "ClaudeLog" (rejected for Anthropic trademark) and is now **Burnd** (locked in 2026-04-11). All references to "ClaudeLog" in older artifacts (commits, early drafts) refer to the same product, now called Burnd. The folder name and the product name are intentionally distinct — see the heading note above.
>
> **Naming saga (load-bearing — do not re-litigate):** On 2026-04-11 we evaluated and rejected, in order: ClaudeLog (Anthropic trademark risk), Curbd (killed by [curbd.app](https://curbd.app/) curbside-services product, [rajanlab/CURBD](https://github.com/rajanlab/CURBD) AI/ML repo, Curbd Collective VC firm, plus 4 more brand collisions), Pluggd (killed by Pluggd.com Seattle digital-audio-search company funded by Intel Capital, plus the Pluggd GitHub org, plus 5 more historical brand entities), Tokenjar (killed by [PortSwigger/token-jar](https://github.com/PortSwigger/token-jar) Burp Suite extension which is in our exact dev-tooling space), Patchd (killed by [patchd.io](https://patchd.io/about-us) synthesizer manager and `stahlo/patchd` GitHub repo). **Burnd** survived three rounds of verification with zero brand pollution, zero GitHub orgs, zero parked products. **Do not propose name changes unless Burnd specifically encounters a problem that wasn't found during this verification.** If a future verification reveals a Burnd collision, restart the search from less-common-verb missing-letter candidates (Cinchd, Squelchd, Tampd, Quelld) — do not return to the names already eliminated above.

> **If you (Claude) are reading this for the first time in a new session, read this entire file before doing anything else. It contains the load-bearing context for the whole project.**

## What this is

**ChangeLife** is **Garvit Surana's revenue umbrella** — his broader "build a real software business that makes actual money before college" project. **Burnd** is the v1 product inside that umbrella. The goal: build, ship, and run Burnd as a real software product that earns real money in USD before his ISC Class 12 board exams in Feb–Mar 2027.

**Burnd** is a dark-mode local-first **cost-control tool** for Claude Code power users that reads their `.claude/projects/*.jsonl` session files and tells them exactly where their money is leaking and how to plug the leaks. Sold globally for $9/mo or $79 lifetime (founding-member launch window) → $129 lifetime after.

**Critical positioning rule:** Burnd is sold as a *control tool*, not as analytics. The pitch is "find the leaks in your Claude spend" not "see where your money went." Every word of marketing copy must lead with the *decision the user can make*, not the *data they can see*. People pay for decisions; dashboards are commodified.

**The full design doc lives at:** [docs/superpowers/specs/2026-04-11-burnd-design.md](docs/superpowers/specs/2026-04-11-burnd-design.md). Read it before making any technical decision. It is the source of truth.

## Who Garvit is (the must-know facts)

- 16 years old, Class 12 ISC, Guwahati, India.
- Technical: React + TypeScript + Vite + Tailwind + Firebase + Claude API native. Has shipped KropScan (AI crop disease detection) and Vynce (React Native app with full iOS+Android+Jest setup).
- Design taste: dark mode only, dense UI, keyboard-first. AXIS color palette: bg `#09090f`, surface `#111118`, accent `#6366f1`. Inter + JetBrains Mono fonts.
- Pre-existing fluency with Claude Code, Gemini CLI, Codex, Qwen, Copilot, Antigravity. This insider knowledge IS the moat for Burnd.
- ISC Class 12 board exams ~Feb–Mar 2027. Boards are sacred and outrank everything in this project.

## Operating model: maximum autonomy (LOAD-BEARING)

Garvit is in Class 12 ISC board prep year and may not be available for hours or days at a time due to studies and tuitions. **Future Claude sessions on this project default to ACTION, not approval-seeking.** The full protocol is in `memory/feedback_autonomy_mandate.md` — read it. The short version:

- **Tier 1 — Decide alone (~80% of work):** code, design, refactoring, bug fixes, test strategy, library choices within stack, copy, naming, edge cases, local deploys, file ops. Just do it. Document in commits.
- **Tier 2 — Decide AND log prominently:** anything that changes the design doc, adds a dependency, picks between approved options, or eats >2 hours unexpectedly. Take the action AND prefix the session log entry with `**DECISION:**` so Garvit sees it.
- **Tier 3 — STOP AND QUEUE:** spending money, publishing under Garvit's name (tweets, HN, blog, etc.), sending real customer/third-party emails, anything touching mom, anything irreversible. Save the prepared action to `notes/queue/<date>-<action>.md` with copy-paste-ready instructions for Garvit, log a one-liner in the session log, and continue with non-blocked work. Garvit completes queued items in <10-minute bursts when he can.

**When in doubt, default to action with a Tier 2 log entry.** Waiting for approval on reversible decisions kills momentum, and momentum is what Burnd lives on. Garvit explicitly chose autonomy over caution.

**Failure modes:**
- Over-asking (treating Tier 1 as needing approval) wastes his time. Stop it.
- Over-acting (treating Tier 3 as Tier 1) is dangerous. When uncertain, queue.
- Forgetting to log Tier 2 decisions leaves future-Garvit confused about why X was done. Always log.

## Hard rules (non-negotiable)

1. **Mom is fully supportive but overloaded.** Default to "Garvit handles it." Mom only enters the loop where legally required (Lemon Squeezy seller-of-record signup, one form, one signature, ~15 min total + ~5 min/month forwarding payments). Never propose tasks that hand work to mom.
2. **Boards always win.** If a ChangeLife task conflicts with board prep, the ChangeLife task moves. The product must survive Nov 2026–Feb 2027 with ≤4 hrs/week of attention or it failed regardless of revenue.
3. **No live operations.** No client calls, no live chat, no SLAs, no synchronous customer support. Async only. Email triage on Sundays.
4. **Aesthetic is locked.** Dark mode only. AXIS palette. Dense, keyboard-first. Don't propose Material UI, Chakra, light mode demos, or "playful" design directions.
5. **No SunVault.** Garvit dropped SunVault on 2026-04-11 — don't pitch agri-tech, cold-chain, or "what if you revived it" variants.
6. **Don't create new project ideas.** Burnd is the chosen v1. Other ideas (Skillforge, PromptLock) are explicitly deferred to 2027 post-boards. Don't pivot without an explicit conversation with Garvit about the success/failure data.

## Success criteria (the numbers we are playing for)

| Threshold | Condition |
|---|---|
| **Floor** | ₹10k/mo MRR by Nov 1, 2026, sustained ≥2 months |
| **Target** | ₹25k/mo MRR by Nov 1, 2026 |
| **Win** | ₹50k+/mo MRR by Nov 1, 2026 |
| **Hard fail** | <₹2k/mo MRR by Nov 1, 2026 → shut down honestly |
| **Lockdown test** | Nov 2026–Feb 2027: revenue ≥ Oct 31 level with ≤4 hrs/week attention |

## Stack — what to use without asking

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS, dark-mode AXIS palette, Lucide icons, Recharts, Zustand, React Router v6, date-fns
- **Backend:** Firebase (Firestore + Auth + Hosting + Functions)
- **CLI parser:** Node.js (npx-installable), Open Source on GitHub (MIT), public spec
- **Payments:** Lemon Squeezy as merchant of record (mom is registered seller)
- **AI:** Claude API direct (claude-sonnet-4-6 or current best at time of use)
- **Analytics:** Plausible or self-hosted Umami (privacy-respecting, matches positioning)
- **Hosting:** Firebase Hosting (free tier sufficient at this scale)

Don't propose alternatives unless one of these stops working. Garvit knows them, ChangeLife is sized for them.

## Where to find things

- **Design doc (source of truth):** [docs/superpowers/specs/2026-04-11-burnd-design.md](docs/superpowers/specs/2026-04-11-burnd-design.md)
- **16-week build calendar:** Section 7 of the design doc
- **Risks register:** Section 10 of the design doc
- **Open questions to resolve:** Appendix A of the design doc
- **Memory (cross-session):** `C:\Users\Garvit Surana\.claude\projects\c--Users-Garvit-Surana-Desktop-Projects-ChangeLife\memory\` (the memory directory's name follows the project folder name, which is intentionally `ChangeLife/`)
  - `MEMORY.md` is the index — read it
  - `project_session_log.md` is the running session log — **read it first** to know what's been done since you last saw this project
  - `project_status_current.md` has the current week + current task + current blockers

## How to start any new session in this project

1. Read this `CLAUDE.md`.
2. Read `memory/MEMORY.md`.
3. Read `memory/project_session_log.md` — last 5 entries minimum.
4. Read `memory/project_status_current.md` to know exactly where we are.
5. Skim the relevant section of the design doc for the current week's work.
6. Then — and only then — start helping Garvit on the actual task.

## How to end any session in this project

Before you stop responding for the day:

1. Update `memory/project_status_current.md` with: current week, what got done today, what's blocking, what's next.
2. Append a one-paragraph entry to `memory/project_session_log.md` with the date, what we worked on, what shipped, what we learned.
3. If we made a decision that changes the design, update the design doc AND save a memory note explaining why.
4. If we discovered something that contradicts the design doc, flag it explicitly in the session log so future-Claude doesn't miss it.

This is non-negotiable. The whole point of the persistent context system is that 4 weeks from now, when I'm helping debug a Firestore rule, I should be able to read 3 files and know exactly where we are. If the session log isn't kept up to date, the system fails and ChangeLife loses momentum.
