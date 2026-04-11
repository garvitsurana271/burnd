# Burnd — Week 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Week 1 of the Burnd build (2026-04-11 to 2026-04-17, ~18 hours): verify the project rename was completed, register the burnd.* domain, study the Claude Code JSONL session-file format, and draft the anonymization spec — producing the three notes files that Week 2 (CLI parser v0) depends on. **No production code in Week 1.**

**Architecture:** Pure research and documentation week. The deliverables are three markdown notes files (`notes/jsonl-format.md`, `notes/anonymization.md`, `notes/domain-verification.md`), one registered domain, and a project skeleton with a git repo. Week 2's CLI parser is built on top of these notes and cannot proceed without them.

**Tech Stack:** Bash, WHOIS lookups, manual file inspection of JSONL session files, markdown notes, git. No code dependencies in Week 1.

**Source of truth:** [`docs/superpowers/specs/2026-04-11-burnd-design.md`](../specs/2026-04-11-burnd-design.md), specifically Section 7 (build calendar), Appendix A (open questions to resolve in Week 1), and Section 6.3 (CLI parser as the moat — informs the JSONL study scope).

**Operating model: maximum autonomy (see CLAUDE.md and `memory/feedback_autonomy_mandate.md`)**

Garvit is in Class 12 board prep and may not be available for days at a time. The default mode for executing this plan is **act, don't ask**. The three tiers:

- **Tier 1 (decide alone):** code, file ops, research, documentation, commits, refactoring, edge cases. Just do it.
- **Tier 2 (decide and log):** plan deviations, dependency additions, choices between approved options, surprises that eat >2 hours. Take the action AND add a `**DECISION:**` entry to `memory/project_session_log.md`.
- **Tier 3 (stop and queue):** spending money, publishing under Garvit's name, anything touching mom, anything irreversible. Create a file in `notes/queue/<date>-<action>.md` with click-by-click instructions and a one-liner in the session log under `QUEUED FOR GARVIT:`. Then continue with non-blocked work.

**Task ownership legend:**
- 🤖 **AI-doable** — Future Claude session executes end-to-end. Default mode.
- 📋 **AI-prep + queue** — AI does all preparation work and creates a queue file with click-by-click instructions; Garvit completes the actual irreversible action in <10 minutes whenever he can.
- 🤝 **AI-do + soft review** — AI executes and commits as v0.1; queues a non-blocking review request for Garvit. If he objects later, revise.

**Time budget:** 18 hours total. Per-task estimates in each task header. Garvit's actual involvement should sum to <30 minutes across the entire week.

---

## Task 0: Acknowledge the folder-name decision (no-op precondition)

**Owner:** 🤖 AI-doable (read-only acknowledgment)
**Estimated time:** 30 seconds

The project folder is **`ChangeLife/`** by deliberate decision (see CLAUDE.md heading note). The v1 product is **Burnd**. They are intentionally different names — ChangeLife is the revenue umbrella, Burnd is the product. **Do NOT propose renaming the folder.** Every path in this plan references `ChangeLife/` because that is the actual folder name. Every product mention uses "Burnd" because that is the actual product name.

If a future session reads this plan and is confused by the mismatch, the resolution is in CLAUDE.md's heading note. Re-read it before proceeding.

- [ ] **Step 1: Read the heading note in CLAUDE.md to confirm the framing**

```bash
head -5 "/c/Users/Garvit Surana/Desktop/Projects/ChangeLife/CLAUDE.md"
```

Expected: a paragraph explaining ChangeLife = umbrella, Burnd = product, do not rename. Once you've read it and it's coherent, proceed to Task 1.

(No commit needed — this task produces no artifacts.)

---

## Task 1: Project skeleton — folders, .gitignore, LICENSE, minimal README, queue directory

**Owner:** 🤖 AI-doable
**Estimated time:** 30 minutes
**Files:**
- Create: `ChangeLife/notes/.gitkeep`
- Create: `ChangeLife/notes/queue/.gitkeep` ← **load-bearing for autonomy mandate**
- Create: `ChangeLife/notes/queue/README.md`
- Create: `ChangeLife/src/.gitkeep`
- Create: `ChangeLife/.gitignore`
- Create: `ChangeLife/LICENSE`
- Create: `ChangeLife/README.md`

The project's `ChangeLife/` folder currently contains only `CLAUDE.md` and `docs/`. Week 1 adds the minimal scaffolding so future weeks have somewhere to put files.

- [ ] **Step 1: Create the empty directories with .gitkeep markers**

```bash
cd "/c/Users/Garvit Surana/Desktop/Projects/ChangeLife"
mkdir -p notes/queue src
touch notes/.gitkeep notes/queue/.gitkeep src/.gitkeep
```

- [ ] **Step 1b: Write `notes/queue/README.md`**

The `notes/queue/` directory is the asynchronous interface between AI execution and Garvit's decisions. Document what it's for so future-Garvit (and future-Claude) can find it.

```markdown
# Queue for Garvit

This directory holds **Tier 3 actions** that future Claude sessions cannot do autonomously and need Garvit to complete in person — typically because they involve spending money, publishing under his name, or something irreversible.

## Format

Each queue item is a single markdown file named `YYYY-MM-DD-<short-slug>.md` containing:
- **What** the action is and why it's needed
- **Click-by-click instructions** Garvit can follow without re-reading the design doc
- **Estimated time** (target: always under 10 minutes)
- **Decisions Garvit needs to make** (if any) — usually pre-narrowed to two options
- **What to tell Claude after completing** (e.g., "say 'queue/2026-04-15-register-domain done' and Claude will verify and proceed")

## Workflow

1. Claude creates a queue file when blocked on a Tier 3 action.
2. Claude logs `QUEUED FOR GARVIT: notes/queue/<file>.md` in `memory/project_session_log.md`.
3. Garvit checks this directory whenever he opens Claude (or whenever he has 10 free minutes during tuition breaks).
4. Garvit completes the action and tells Claude.
5. Claude verifies, deletes the queue file, and continues.

## What does NOT go in here

- Tier 1 (decide alone) work — Claude just does it.
- Tier 2 (decide and log) work — Claude does it AND writes a `**DECISION:**` entry in the session log.
- Conversational questions — those go in chat, not in queue files.

See `memory/feedback_autonomy_mandate.md` for the full protocol.
```

- [ ] **Step 2: Write the .gitignore**

Create `ChangeLife/.gitignore` with this exact content:

```
# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Vite / build outputs
dist/
build/
.vite/

# Environment / secrets — NEVER commit
.env
.env.local
.env.*.local
*.key
*.pem
serviceAccountKey.json

# Firebase
.firebase/
firebase-debug.log

# Editor / OS
.vscode/
.idea/
.DS_Store
Thumbs.db

# Claude Code session data — private to the developer running it
.claude/
**/jsonl-samples/

# Test fixtures with potentially private data
notes/jsonl-samples/
```

The `.claude/` and `**/jsonl-samples/` lines are load-bearing. They prevent Garvit from ever accidentally committing his own session data (which contains his prompts, code, and possibly secrets) to a public repo.

- [ ] **Step 3: Write the MIT LICENSE**

Create `ChangeLife/LICENSE` with the standard MIT license, copyright 2026 Garvit Surana:

```
MIT License

Copyright (c) 2026 Garvit Surana

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OF OTHER DEALINGS IN THE
SOFTWARE.
```

The MIT license is what the eventual public parser repo will ship under (per design doc §6.3). Putting it here from day 1 means the dashboard repo and the parser repo share legal terms, no rework later.

- [ ] **Step 4: Write the minimal README.md**

Create `ChangeLife/README.md` with this exact content:

```markdown
# Burnd

> Find what's burning a hole in your AI coding budget.

**Status:** In development. Building toward launch in late July 2026.

Burnd is a local-first cost-control tool for Claude Code power users. It reads your `~/.claude/projects/*.jsonl` session files, finds the leaks in your spend, and tells you exactly what to fix. We never see your code — only aggregates.

## Repo layout

- `notes/` — research notes, schema docs, anonymization spec
- `src/` — application code (added in Week 2)
- `docs/superpowers/` — design docs, implementation plans, session log

## Built by

[@garvitonpc](https://instagram.com/garvitonpc) — 16, Class 12 ISC, Guwahati, India.
```

This is the README a first visitor sees. It is intentionally minimal until launch — fancy READMEs come in Week 12.

- [ ] **Step 5: Verify all files exist and look right**

```bash
cd "/c/Users/Garvit Surana/Desktop/Projects/ChangeLife"
ls -la
cat README.md | head -3
cat .gitignore | head -5
```

Expected: README starts with "# Burnd", .gitignore starts with "# Node", LICENSE and the two .gitkeep files exist.

- [ ] **Step 6: Initialize git and make the first commit**

```bash
cd "/c/Users/Garvit Surana/Desktop/Projects/ChangeLife"
git init -b main
git add .gitignore LICENSE README.md notes/.gitkeep src/.gitkeep CLAUDE.md docs/
git status
git commit -m "chore: initial project skeleton

- README, MIT LICENSE, .gitignore
- empty notes/ and src/ directories
- design doc and CLAUDE.md from brainstorming session

Week 1 of the 16-week build calendar.
"
```

Expected: a single commit with all the skeleton files.

---

## Task 2: Verify burnd.* domain availability via WHOIS

**Owner:** 🤖 AI-doable (lookups only — actual purchase is human-only in Task 3)
**Estimated time:** 30 minutes
**Files:**
- Create: `ChangeLife/notes/domain-verification.md`

The earlier web search returned "no links found" for `burnd.com / burnd.dev / burnd.io`, which is a strong signal but not a conclusive one. Some squatters park domains without serving HTTP and without indexing. WHOIS is the authoritative check.

- [ ] **Step 1: Check whether `whois` is available locally**

```bash
which whois 2>&1
```

If it returns a path, proceed to Step 2. If it returns "not found," fall back to Step 2-alt below.

- [ ] **Step 2 (preferred): Run WHOIS on three TLDs**

```bash
whois burnd.com 2>&1 | head -30
echo "---"
whois burnd.dev 2>&1 | head -30
echo "---"
whois burnd.io 2>&1 | head -30
```

For each, look for either:
- **"No match for"** / **"NOT FOUND"** / **"Status: AVAILABLE"** → domain is registrable
- **"Registry Domain ID"** / **"Registrant"** / **"Created Date"** → domain is taken; record who holds it and what status

- [ ] **Step 2-alt (if whois not installed): Use a public WHOIS API via curl**

```bash
curl -s "https://rdap.verisign.com/com/v1/domain/burnd.com" | head -50
echo "---"
curl -s "https://rdap.nic.google/domain/burnd.dev" | head -50
echo "---"
curl -s "https://rdap.nic.io/domain/burnd.io" | head -50
```

A 404 response on any of these typically means the domain is unregistered. A 200 response with JSON means it's taken and the JSON describes the registrant.

- [ ] **Step 3: Write `notes/domain-verification.md` with the findings**

Create `ChangeLife/notes/domain-verification.md` and fill in this template with the actual results from Step 2:

```markdown
# Burnd — Domain Verification

**Date checked:** 2026-04-11
**Method:** WHOIS / RDAP lookup

## Results

| TLD | Status | Notes |
|---|---|---|
| burnd.com | [available / taken] | [if taken: registrant + creation date + expiry] |
| burnd.dev | [available / taken] | [same] |
| burnd.io | [available / taken] | [same] |

## Decision

**Primary domain to register:** [chosen TLD, e.g., burnd.dev]
**Reason:** [short justification — see below]

### Registration priority order
1. **burnd.dev** if available — `.dev` is the canonical dev-tool TLD in 2026 (auto-HTTPS via HSTS preload, signals "dev tool" to buyers, the audience expects it).
2. **burnd.com** if .dev is taken but .com is free — broadest reach, easier word-of-mouth.
3. **burnd.io** as a third fallback — common dev-tool TLD, slightly dated.
4. If all three are taken: STOP. Re-open the naming brainstorm and pick from {Cinchd, Squelchd, Tampd, Quelld} per the design doc Appendix A guidance.

## What I'm NOT doing right now
- Not registering yet (Task 3, human-only).
- Not setting up DNS (Week 12, when the landing page goes up).
- Not setting up email on the domain (Week 11, alongside Lemon Squeezy setup).
```

- [ ] **Step 4: Commit**

```bash
cd "/c/Users/Garvit Surana/Desktop/Projects/ChangeLife"
git add notes/domain-verification.md
git commit -m "docs: domain availability check for burnd.{com,dev,io}"
```

---

## Task 3: Prepare the domain registration as a queue item for Garvit

**Owner:** 📋 AI-prep + queue
**Estimated time:** 20 min AI prep + 5–10 min for Garvit when he's free
**Files:**
- Create: `ChangeLife/notes/queue/2026-04-12-register-domain.md`
- Modify: `ChangeLife/notes/domain-verification.md` (append the registration details AFTER Garvit confirms it's done)

Domain registration is Tier 3: it costs real money and requires Garvit's payment method. AI cannot complete it. **But AI should do all the preparation work** — choose the registrar, navigate the registrar's flow, identify the exact purchase URL, draft the cart, anticipate every question — so Garvit's actual involvement is reduced to clicking "pay with UPI" and entering an OTP. Target: under 10 minutes of his time.

- [ ] **Step 1: Choose the registrar (AI decides, no human involvement)**

The mom-minimization rule applies — pick a registrar that takes UPI from Garvit's own account, not an international card.

UPI-friendly Indian registrars verified as of early 2026:
- **Hostinger India** — cheapest for `.com` (~₹200 yr 1, ~₹900 renewal) and `.dev` (~₹1,200 yr 1, ~₹1,400 renewal). Has WHOIS privacy free. **Default choice.**
- **GoDaddy India** — UPI works, slightly pricier, free WHOIS privacy.
- **BigRock** — UPI works, Indian-HQ.
- **Cloudflare Registrar** — at-cost pricing best long-term BUT requires international card. **Skip for Year 1**; migrate later.

**Decision (Tier 1):** Use Hostinger India for Year 1. Migrate to Cloudflare Registrar in Year 2 once Garvit has access to an international card. Log this in the session log under `**DECISION:**`.

- [ ] **Step 2: Write the queue file with click-by-click instructions**

Create `ChangeLife/notes/queue/2026-04-12-register-domain.md`. The file must be self-contained — Garvit should be able to do this from his phone during a tuition break without re-reading the design doc.

```markdown
# QUEUE: Register burnd.[chosen TLD] domain

**Created:** 2026-04-12 by Claude (Week 1 plan, Task 3)
**Estimated time:** 8 minutes
**Cost:** ~₹[amount] (Year 1) — payable via UPI
**Why:** Burnd needs a registered domain before the CLI can ship with a `--help` URL and before any landing page work in Week 12.

## What you're doing in plain words
You're buying the domain `burnd.[chosen TLD]` from Hostinger India. It's just like buying anything online: search, add to cart, pay via UPI. Total real time on your phone: ~8 minutes.

## Click-by-click

1. **Open** [https://www.hostinger.in/domain-name-search](https://www.hostinger.in/domain-name-search) on your phone or laptop.
2. **Search for** `burnd` (just the word, no extension).
3. In the results, **click "Add to cart"** next to `burnd.[chosen TLD]` — the one Claude verified as available in Task 2 of the Week 1 plan.
4. **Decline all upsells** on the next screen:
   - "Premium DNS" → No
   - "Domain Privacy" → **YES, ENABLE THIS** (it's free at Hostinger and hides your home address from public WHOIS lookups — important because you're 16)
   - "Professional Email" → No (we'll use Gmail forwarding)
   - "Web Hosting" → No (Firebase Hosting will be used)
   - "SSL Certificate" → No (Firebase + Vercel auto-provision SSL)
5. **Cart should show only**: 1 × `burnd.[chosen TLD]` for 1 year, with WHOIS privacy enabled. Total ~₹[amount].
6. **Click "Continue to checkout"** → if not signed in, create an account using your own email + phone (not mom's).
7. **Account details**: use your own name. For address, use your home address — this is fine because WHOIS privacy is enabled, so it's not public.
8. **Payment**: select **UPI**. Hostinger will show a UPI QR code or push a request to your UPI app. Approve in your UPI app, enter PIN.
9. **After payment confirms**, you'll get an email confirmation. Take a screenshot of: (a) the payment success page, (b) the email confirmation. Save both.
10. **In your Hostinger dashboard**, find the domain under "My Domains" and **toggle Auto-Renew ON** (this is critical — auto-renew prevents the domain from expiring during your board exam lockdown when you might forget to pay).

## Decisions you might be asked to make
- **Year 1 vs multi-year discount?** Pick **1 year** unless multi-year is meaningfully cheaper (>30% off). We may migrate registrars in Year 2.
- **Add another TLD?** No, just the one we picked.
- **Trustpilot review prompt?** Skip.

## After you're done
Tell Claude: **"queue/2026-04-12-register-domain done — registered burnd.<tld>, cost ₹X, expires <date>"**

Claude will:
1. Verify the domain resolves (just a DNS lookup, not asking you to point it anywhere)
2. Append the registration details to `notes/domain-verification.md`
3. Delete this queue file
4. Update the session log
5. Move on to the next blocked-on-this-task work

## If something goes wrong
- **Hostinger UPI fails** → try GoDaddy India ([https://in.godaddy.com/](https://in.godaddy.com/)) — same flow, slightly pricier.
- **All UPI options fail** → tell Claude. Claude will queue an alternative path (Razorpay-backed registrar or a request to mom for a one-time card use).
- **The domain you came to register is suddenly showing as taken** → tell Claude immediately. Don't pick a similar variant on your own — Claude needs to re-run the verification process to pick a fallback name from the design doc Appendix A list ({Cinchd, Squelchd, Tampd, Quelld}).
```

- [ ] **Step 3: Log the queue item and continue with non-blocked work**

Add to `memory/project_session_log.md` (top of the most recent entry):

```
QUEUED FOR GARVIT: notes/queue/2026-04-12-register-domain.md (~8 min, ~₹[amount])
```

Continue with Tasks 4, 5, 6, 7, 8 — none of them depend on the domain being registered. The domain registration is parallel and async.

- [ ] **Step 4: When Garvit reports "done"**

When Garvit says some variant of "domain done" or "queue/2026-04-12-register-domain done":

1. Append the registration record to `notes/domain-verification.md`:

```markdown
## Registration

**Registered:** [date Garvit reported]
**Registrar:** Hostinger India (or whichever was used)
**Domain:** `burnd.[tld]`
**Cost (year 1):** ₹[amount Garvit reported]
**Auto-renew:** ON
**WHOIS privacy:** ON
**Expiry:** [registered date + 1 year]
**Account holder:** Garvit Surana
**Migration plan:** Move to Cloudflare Registrar in Year 2 if international card available.
```

2. Delete the queue file: `rm "ChangeLife/notes/queue/2026-04-12-register-domain.md"`
3. Commit:

```bash
cd "/c/Users/Garvit Surana/Desktop/Projects/ChangeLife"
git add notes/domain-verification.md notes/queue/
git commit -m "docs: domain registered, queue item resolved"
```

4. Add a one-line confirmation to the session log: `RESOLVED: queue/2026-04-12-register-domain — burnd.<tld> live`

---

## Task 4: Inventory Garvit's existing Claude Code session files

**Owner:** 🤖 AI-doable (read-only inspection of his own files)
**Estimated time:** 30 minutes
**Files:**
- No files created in this task — output is observations used in Task 5

The CLI parser has to be designed against the actual file format, not against assumptions about it. This task takes inventory: how many session files exist, how big they are, how they're organized on disk, what Claude Code versions produced them.

- [ ] **Step 1: Find all `.jsonl` files under the user's `.claude/projects/` directory**

```bash
find "/c/Users/Garvit Surana/.claude/projects/" -name "*.jsonl" -type f 2>/dev/null | head -50
```

- [ ] **Step 2: Count how many session files exist and how much disk they use**

```bash
find "/c/Users/Garvit Surana/.claude/projects/" -name "*.jsonl" -type f 2>/dev/null | wc -l
du -sh "/c/Users/Garvit Surana/.claude/projects/" 2>/dev/null
```

Record the numbers. They inform the parser's expected scale (10s of files, 100s, 1000s — different design implications).

- [ ] **Step 3: Look at how projects are organized as subdirectories**

```bash
ls "/c/Users/Garvit Surana/.claude/projects/" | head -20
```

Expected: directory names that look like encoded paths (e.g., `c--Users-Garvit-Surana-Desktop-Projects-...`). Note: this is the SAME encoding used by the memory directory naming scheme — useful for the parser to decode back into project paths.

- [ ] **Step 4: Identify the 5 most recently modified session files (across all projects)**

```bash
find "/c/Users/Garvit Surana/.claude/projects/" -name "*.jsonl" -type f -printf "%T@ %p\n" 2>/dev/null | sort -rn | head -5 | awk '{print $2}'
```

These five will be the **representative sample** for the schema study in Task 5. They should cover Garvit's most recent / most realistic Claude Code usage.

Save the list of paths somewhere — you'll reference it in the next task.

- [ ] **Step 5: Note any unusual file sizes**

```bash
find "/c/Users/Garvit Surana/.claude/projects/" -name "*.jsonl" -type f -printf "%s %p\n" 2>/dev/null | sort -rn | head -10
```

Look for outliers — sessions that are 10MB+ are interesting (likely heavy tool use or long agent runs); 0-byte files would indicate a Claude Code bug. Both inform parser robustness requirements.

(No commit yet — Task 5 produces the actual notes file.)

---

## Task 5: Read 5 representative session files and document the JSONL schema

**Owner:** 🤖 AI-doable (file reading + structural notes)
**Estimated time:** 3 hours (the longest single task in Week 1)
**Files:**
- Create: `ChangeLife/notes/jsonl-format.md`

This is the most important Week 1 task. The CLI parser in Week 2 is built directly from these notes. If the schema notes are wrong or incomplete, the parser breaks and Week 2 stalls.

**Critical privacy rule:** The session files contain Garvit's actual prompts, code, and possibly secrets. **The notes file must NOT include any actual content from the sessions.** It documents *structure only* — field names, value types, message types, but never the content of any user message, assistant response, tool input, or tool output. If you need to show a sample, anonymize it: replace strings with `"<redacted-string>"`, replace code blocks with `<redacted-code-block>`, etc.

- [ ] **Step 1: Pick the 5 sample files from Task 4 Step 4**

Use the list of 5 most-recent JSONL files identified in Task 4. Reference them by relative path in the rest of this task.

- [ ] **Step 2: Read the first 20 lines of the first sample file to understand the per-line structure**

```bash
head -20 "/c/Users/Garvit Surana/.claude/projects/<project-dir>/<session>.jsonl" | python3 -c "import sys, json; [print(json.dumps(json.loads(line), indent=2)) for line in sys.stdin]" 2>&1 | head -100
```

(If `python3` isn't available, substitute `node -e` with a JSON parse, or just read raw with `head -20 <file>`.)

The goal: get a clean view of what one record looks like. JSONL = one JSON object per line.

- [ ] **Step 3: Identify and list the top-level fields in each record**

For the first sample file, list every top-level key that appears across the first ~50 records. Note which keys are present in EVERY record (always) and which are present only sometimes (conditional).

Common fields you should expect (based on the Claude Code session format as of early 2026, but verify against the actual file):
- `parentUuid`, `uuid`, `sessionId`, `timestamp` (always)
- `type` (always — values include `user`, `assistant`, `tool_use`, `tool_result`, `system`)
- `message` (when applicable — contains the actual content, redact in notes)
- `cwd`, `gitBranch`, `userType`, `version` (sometimes — environment metadata)
- `model` (assistant turns — load-bearing for cost calculation)
- `usage` (assistant turns — input/output/cache token counts, the source of all cost numbers)
- `requestId` (assistant turns — for matching tool_results to tool_uses)
- `isMeta`, `isSidechain` (conditional — these matter for filtering "real" turns from agent sub-runs)

**Verify each of these against the actual file. If a field is missing or named differently, write down what you actually saw.**

- [ ] **Step 4: Identify the message types and their record shapes**

For each value of `type` you saw, document:
- What other fields are populated when this type appears
- What the `message` field contains (structurally — strings, arrays of content blocks, objects)
- Specifically for `assistant` turns: confirm that `message.usage.input_tokens`, `message.usage.output_tokens`, `message.usage.cache_creation_input_tokens`, `message.usage.cache_read_input_tokens` exist. These four numbers are the foundation of every cost calculation Burnd does.

- [ ] **Step 5: Identify how tool calls are recorded**

Tool calls are how Burnd's "tool overuse" and "long Bash output" detectors work. Find a session in the sample that uses tools heavily. Document:
- How a tool_use record looks (which fields, what the tool name field is called)
- How the matching tool_result record references the tool_use (likely via `tool_use_id` inside the message content)
- How tool inputs and outputs are structured
- How the parser will be able to compute "tokens spent on tool output" per tool

- [ ] **Step 6: Identify version markers**

Look for any field that indicates the Claude Code version that produced the file (e.g., `version`, `claudeCodeVersion`). Note where it appears and what values you see. The parser MUST version-detect because the format will change over time (per design doc §10 risk #2).

- [ ] **Step 7: Identify edge cases across the 5 sample files**

Skim the other 4 sample files looking for:
- Records that fail to parse cleanly
- Unusual `type` values not in your list from Step 4
- Sessions that started/ended abnormally (no final assistant turn, etc.)
- Fields you saw in one file that are completely absent in another (forward/backward compatibility)
- Any obviously private content the parser must NEVER upload (passwords, API keys in tool output, private code)

Document each as a "known edge case" in the notes file.

- [ ] **Step 8: Write `notes/jsonl-format.md`**

Create the file with this structure (fill in actual observations from Steps 3-7):

```markdown
# Claude Code JSONL Session Format — Notes

**Date studied:** 2026-04-11
**Sample size:** 5 session files (most recent across all projects)
**Claude Code versions observed:** [list versions seen in the `version` field]
**Studied by:** [Garvit / AI agent]

**Privacy note:** This file documents structure only. No actual session content (user messages, code, prompts, secrets) is reproduced here. All examples are anonymized.

## Per-record structure

Each line of a `.jsonl` file is one JSON object. Top-level fields observed:

| Field | Always present? | Type | Notes |
|---|---|---|---|
| `uuid` | yes | string | unique per record |
| `parentUuid` | yes | string \| null | links to previous record in chain |
| `sessionId` | yes | string | shared across all records in a session |
| `timestamp` | yes | string (ISO8601) | record creation time |
| `type` | yes | string | one of: [list values] |
| `message` | conditional | object | content payload, structure varies by type |
| `cwd` | sometimes | string | working directory |
| `gitBranch` | sometimes | string | git branch at record time |
| `version` | sometimes | string | Claude Code version that wrote the record |
| `userType` | sometimes | string | e.g. "external" |
| `requestId` | conditional | string | present on assistant turns; matches tool_results |
| `isMeta` | sometimes | boolean | true for system/meta records |
| `isSidechain` | sometimes | boolean | true for sub-agent runs |
| ... | | | [add any others observed] |

## Message types

For each value of `type`:

### type: `user`
[document fields populated, message structure]

### type: `assistant`
[document fields populated, message structure, especially the `usage` block with input_tokens / output_tokens / cache_creation_input_tokens / cache_read_input_tokens]

### type: `tool_use`
[how tool_uses are recorded — note: in Claude Code 2026 these are typically inside the `assistant` message's content array, not as separate top-level records. Verify and document.]

### type: `tool_result`
[how tool_results are recorded — typically inside `user` message content as a content block referencing tool_use_id]

[continue for all types observed]

## Cost calculation source-of-truth

Every dollar Burnd reports comes from these four fields on assistant turns:
- `message.usage.input_tokens`
- `message.usage.output_tokens`
- `message.usage.cache_creation_input_tokens`
- `message.usage.cache_read_input_tokens`

Multiplied by the model's per-token rates (which vary by model — `message.model` gives the model id). The parser must maintain a model→rate lookup table that's updated when Anthropic changes pricing.

[Document the exact path to these fields as observed in the sample.]

## Version markers

[Document which fields indicate Claude Code version, what values were seen, and the parser's strategy for version-detection and graceful fallback when an unknown version is encountered.]

## Tool-call schema

[Document the structure for tool_use and tool_result, including how to match a result to its use, and how to extract tool name + input + output token counts. This is the foundation of the "long Bash output" and "tool overuse" detectors.]

## Known edge cases

[List the edge cases observed in Step 7, one per bullet.]

## Open questions for Week 2 parser implementation

[List anything ambiguous from this study that the parser implementation will need to decide. Examples: "How does the parser handle a session with no assistant turns?" "What if `usage` is missing from an assistant turn?"]
```

- [ ] **Step 9: Sanity-check the notes file**

Re-read your notes file. For each detector listed in design doc §5.2, ask: *"Do my notes contain enough information to implement this detector in Week 3?"* If any detector requires data that isn't in your schema notes, go back to the sample files and add it.

The 7 detectors that need to be implementable from these notes:
1. Long Bash output detector (needs: tool_result content size for `Bash` tool calls)
2. Repeated-read detector (needs: tool_use input for `Read` tool, file path argument)
3. Thrash detector (needs: tool_use count vs success rate per session)
4. Tool overuse detector (needs: tool name frequency per session)
5. Skill firing detector (needs: identification of skill invocations in the JSONL — may be in `system` records or hook outputs)
6. Project-cost outlier detector (needs: cwd or sessionId → project mapping)
7. Tired-coding detector (needs: timestamp + total cost per session)

If any of these can't be answered from the notes, the parser is at risk. Add the missing information now.

- [ ] **Step 10: Commit**

```bash
cd "/c/Users/Garvit Surana/Desktop/Projects/ChangeLife"
git add notes/jsonl-format.md
git commit -m "docs: Claude Code JSONL session format study

- Studied 5 representative session files
- Documented per-record fields, message types, version markers
- Documented cost calculation source-of-truth (usage fields)
- Documented tool_use/tool_result schema for detector implementation
- Listed known edge cases and open questions for Week 2
"
```

---

## Task 6: Draft the anonymization specification

**Owner:** 🤝 AI-do + soft review — AI writes, self-reviews, commits as v0.1, queues a non-blocking review request for Garvit
**Estimated time:** 2 hours AI work + 5 min Garvit review whenever convenient
**Files:**
- Create: `ChangeLife/notes/anonymization.md`

The anonymization spec is the **trust moat** for Burnd. Per design doc §6.2 and §6.3, the parser uploads only aggregates — never user content. This task defines the exact rule for every field: keep, hash, drop, or aggregate.

The spec is also a **public document** — it will eventually live in the open-source parser repo so users can verify what's uploaded before they trust the CLI. Write it accordingly.

- [ ] **Step 1: List every field from `notes/jsonl-format.md` that the parser will encounter**

Cross-reference your schema notes from Task 5. For each top-level field, each `message` sub-field, and each `usage` sub-field, you need a rule.

- [ ] **Step 2: Apply the four-rule classification**

For each field, classify as one of:

- **KEEP** — safe to upload as-is. Rule of thumb: numeric counts, timestamps, uuids that aren't tied to user identity, model ids.
- **HASH** — replace with a one-way SHA-256 hash so the parser can group/compare without leaking the value. Rule of thumb: project paths (which leak company names), file paths inside tool inputs, sessionIds when grouping is needed but the raw value isn't.
- **DROP** — never upload. Replace with `null` or omit entirely. Rule of thumb: any content, any code, any prompts, any tool outputs, any user-facing text. Never uploaded, ever.
- **AGGREGATE** — derive a structural property and upload only that, not the underlying value. Rule of thumb: tool outputs become "size in bytes," file paths become "depth and extension," code blocks become "language and line count."

- [ ] **Step 3: Write `notes/anonymization.md`**

Use this exact template, filled in with the per-field decisions from Step 2:

```markdown
# Burnd — Anonymization Specification (v0.1)

**Last updated:** 2026-04-11
**Status:** Draft, pending Garvit's approval before parser implementation
**Public commitment:** This file will be published in the open-source parser repo. Users can read it to verify exactly what Burnd uploads from their machine. If this file says "we never upload X," the parser MUST NOT upload X under any circumstances.

## Promise to the user

Burnd never uploads:
- The content of any user message
- The content of any assistant response
- Any code, prompt, or text passed as input to a tool
- Any output, error message, or content returned from a tool
- File names, file paths, or directory contents
- Environment variables, secrets, API keys, or credentials of any kind
- Git branch names, commit messages, or repository contents
- Anything that could be used to reconstruct what the user was actually working on

Burnd uploads only:
- Numeric token counts (input, output, cache, per assistant turn)
- Tool call frequencies (e.g., "Bash was called 47 times in this session")
- Tool output sizes in bytes (e.g., "tool output was 12KB" — never the actual output)
- Session timestamps (start, end, per-turn)
- Model identifiers (e.g., `claude-sonnet-4-6`)
- Hashed identifiers for grouping (e.g., a SHA-256 hash of the project path so the same project across runs is recognizable, but the raw path is unrecoverable)
- Version markers (Claude Code version that produced the file)

## Field-by-field rules

| Field | Rule | Implementation |
|---|---|---|
| `uuid` | KEEP | upload as-is — random, no identity content |
| `parentUuid` | KEEP | same |
| `sessionId` | HASH | sha256(sessionId)[:16] for grouping; raw value never uploaded |
| `timestamp` | KEEP | ISO8601 timestamps are not sensitive |
| `type` | KEEP | structural metadata, no content |
| `message` (top-level) | DROP | the entire `message` object is content; do NOT upload it |
| `message.usage.input_tokens` | KEEP | numeric, the heart of cost calc |
| `message.usage.output_tokens` | KEEP | same |
| `message.usage.cache_creation_input_tokens` | KEEP | same |
| `message.usage.cache_read_input_tokens` | KEEP | same |
| `message.model` | KEEP | model id is not sensitive |
| `message.role` | KEEP | "user" / "assistant" / "system" |
| `message.content` (the array of content blocks) | AGGREGATE | for each content block, upload only the type ("text", "tool_use", "tool_result"), the byte length, and (for tool_use) the tool name. Never the text content itself. |
| `message.content[*].text` | DROP | content text is never uploaded |
| `message.content[*].input` (tool_use input) | AGGREGATE | upload tool_name + input byte size; NEVER the input itself |
| `message.content[*].content` (tool_result content) | AGGREGATE | upload tool_use_id reference + output byte size; NEVER the output itself |
| `cwd` | HASH | sha256(cwd)[:16] so we can group "same project" without leaking the path |
| `gitBranch` | DROP | branch names can leak feature names, customer names, internal projects |
| `version` | KEEP | Claude Code version, not sensitive |
| `userType` | KEEP | structural |
| `requestId` | KEEP | random uuid, not identity-linked |
| `isMeta` / `isSidechain` | KEEP | structural booleans |

[Add any additional fields observed in Task 5 with their rule + reasoning.]

## Special cases

### Tool inputs and outputs are NEVER uploaded raw
The parser may compute byte sizes, character counts, and language detection (for code blocks), but never uploads the actual content. This is the most important rule in this entire spec because tool outputs are where private code, secrets, and customer data leak.

### Hash format
All hashes are SHA-256, hex-encoded, truncated to the first 16 characters. Truncation reduces accidental rainbow-table risk on small inputs (e.g., "main" branch name) while preserving enough entropy for grouping.

### Local-first principle
The parser must run the entire transformation locally, in the user's process, before any network call. The user can run `npx burnd --dry-run` and see EXACTLY what will be uploaded as JSON before any data leaves their machine. (This is also a marketing feature — implement in Week 2 alongside the CLI.)

## Verification plan
The parser repo will include a test suite that:
1. Loads a fixture session file containing fake "secret" markers (e.g., "SECRET_API_KEY=xxx" in tool outputs)
2. Runs the parser
3. Asserts that none of the secret markers appear anywhere in the output upload payload

Tests must run in CI on every commit to the parser repo.

## Open questions
- [Any field where the rule is genuinely ambiguous — flag here for Garvit to review]
```

- [ ] **Step 4: Run the AI self-review (this replaces blocking on Garvit)**

Re-read your draft with these specific checks. Fix anything that fails inline; do NOT skip any check.

1. **Coverage:** Open `notes/jsonl-format.md` side by side. For every field listed in the schema notes, find the matching row in your anonymization table. Any field missing from the table → add it now with an explicit rule. Do not leave any field with an implicit rule.
2. **Tier-3 fields:** For every field marked KEEP or HASH, ask: "If I'm wrong about this, can leaking it harm Garvit's customers?" If yes, downgrade to AGGREGATE or DROP. When in doubt, drop.
3. **Content blocks:** Verify that every place the schema mentions `text`, `code`, `input`, `output`, or `content` of any kind is marked DROP or AGGREGATE. Never KEEP. This is non-negotiable.
4. **Hashing scope:** Verify the SHA-256 truncation length (16 hex chars = 64 bits of entropy) is documented and that you've explained why truncation is safe.
5. **Promise consistency:** Re-read the "Burnd never uploads" promise at the top of the file. For each item in that list, verify the field-by-field table actually enforces it. Inconsistencies → fix immediately.
6. **Local-first verification:** The spec must say `npx burnd --dry-run` shows the upload payload locally before any network call. Confirm that's in there.
7. **CI test plan:** The spec must reference fixture-based CI tests that assert no secret markers leak. Confirm that's in there.

Fix anything that fails. No need to re-review after fixing — just fix and move on.

- [ ] **Step 5: Commit as v0.1**

```bash
cd "/c/Users/Garvit Surana/Desktop/Projects/ChangeLife"
git add notes/anonymization.md
git commit -m "docs: anonymization spec v0.1 — public trust commitment

Defines field-by-field rules for what the CLI parser uploads:
KEEP, HASH, DROP, or AGGREGATE. Will be published in the
open-source parser repo so users can verify before installing.

v0.1 self-reviewed; queued for soft Garvit review (non-blocking).
"
```

- [ ] **Step 6: Queue a soft review request for Garvit (non-blocking)**

The Week 2 parser implementation does NOT wait on this review — it builds against v0.1. If Garvit objects later, we revise to v0.2 and the parser updates accordingly.

Create `ChangeLife/notes/queue/2026-04-13-review-anonymization.md`:

```markdown
# QUEUE (soft, non-blocking): Review anonymization spec v0.1

**Created:** 2026-04-13 by Claude (Week 1 plan, Task 6)
**Estimated time:** 5 minutes
**Why:** Claude drafted and self-reviewed the anonymization spec v0.1 at `notes/anonymization.md`. Per the autonomy mandate, Claude committed it without blocking on Garvit's review. This is a NON-BLOCKING soft review — Week 2 parser work proceeds in parallel and will be revised if Garvit objects.

## What to read
Open `notes/anonymization.md`. Skim the "Burnd never uploads" promise at the top, then scan the field-by-field table. Total reading time: ~5 minutes.

## What to look for
- Anything in the "never upload" promise that you want to strengthen (e.g., "also never upload prompt embeddings")
- Any field marked KEEP or HASH that you'd rather see as DROP
- Any privacy concern Claude missed
- Whether you want to publicly publish this file in the open-source parser repo (default: yes — it's a trust marketing tool)

## How to respond
- **All good:** Tell Claude "anon v0.1 approved" — Claude will mark it as v1.0 and delete this queue file.
- **Want changes:** Tell Claude what to change in plain words. Claude revises to v0.2, re-runs self-review, commits, and updates this queue file.
- **Want to think more:** No action needed. The queue file stays. v0.1 keeps shipping until you say otherwise.
```

- [ ] **Step 7: Log the queued soft review and continue**

Add to `memory/project_session_log.md`:

```
QUEUED FOR GARVIT (soft, non-blocking): notes/queue/2026-04-13-review-anonymization.md (~5 min)
```

---

## Task 7: Write the Week 1 summary

**Owner:** 🤖 AI-doable
**Estimated time:** 30 minutes
**Files:**
- Create: `ChangeLife/notes/week-1-summary.md`

Each week of the build calendar should produce a summary that future-Garvit (and future-Claude) can read to know what state the project was in at the end of that week. Week 1's summary closes the loop on the research phase.

- [ ] **Step 1: Write the summary**

Create `ChangeLife/notes/week-1-summary.md`:

```markdown
# Week 1 Summary — 2026-04-11 to 2026-04-17

**Hours logged:** [actual] (budgeted: 18)
**Phase:** Research and decisions (no production code)

## What shipped

- ✅ Project skeleton: notes/, src/, .gitignore, MIT LICENSE, minimal README, git initialized
- ✅ Domain verified: [chosen TLD] is available / registered
- ✅ JSONL format study: `notes/jsonl-format.md` documents the per-record schema, message types, cost-calculation source-of-truth, tool-call structure, version markers, and known edge cases — all from a sample of 5 representative session files
- ✅ Anonymization spec v0.1: `notes/anonymization.md` defines field-by-field rules (KEEP / HASH / DROP / AGGREGATE) and the public trust commitment that will be published with the open-source parser

## Key decisions made this week

- [List any decisions made during Tasks 4-6 that weren't pre-decided in the design doc, e.g., specific hashing strategy, choice of registrar, edge-case handling rules]

## What I learned

- [Anything about the JSONL format that surprised you or wasn't in your prior mental model]
- [Any constraints you discovered that affect Week 2's parser design]

## What's blocked / open

- [Any open questions in jsonl-format.md or anonymization.md that Week 2 needs to answer first]

## Ready for Week 2?

Week 2 (Apr 18-24, 25 hours) builds the CLI parser v0. It depends on:
- ✅ `notes/jsonl-format.md` — tells the parser what to read
- ✅ `notes/anonymization.md` — tells the parser what to upload
- ✅ Multi-vendor schema design (described in design doc §6.2 — `vendor` field required from day 1)
- ⏳ A registered domain (so the CLI's `--help` can point to it as the home URL)

If all four are ✅, Week 2 is unblocked.
```

- [ ] **Step 2: Commit**

```bash
cd "/c/Users/Garvit Surana/Desktop/Projects/ChangeLife"
git add notes/week-1-summary.md
git commit -m "docs: Week 1 summary"
```

---

## Task 8: Update persistent memory with Week 1 completion

**Owner:** 🤖 AI-doable
**Estimated time:** 15 minutes
**Files:**
- Modify: `C:\Users\Garvit Surana\.claude\projects\c--Users-Garvit-Surana-Desktop-Projects-ChangeLife\memory\project_status_current.md`
- Modify: `C:\Users\Garvit Surana\.claude\projects\c--Users-Garvit-Surana-Desktop-Projects-ChangeLife\memory\project_session_log.md`

This is the discipline test for the persistent context system. Updating these files at the end of every working session is what makes the 4-week-later memory recovery actually work. Per `CLAUDE.md`'s "How to end any session in this project" section.

- [ ] **Step 1: Update `project_status_current.md`**

Open the file and update:
- `Last updated:` line → today's date
- `Build week:` → "Week 1 complete (2026-04-11 to 2026-04-17)"
- `Cumulative hours logged on Burnd:` → actual hours
- `Most recent decisions:` add bullet for "2026-04-17: Week 1 complete — domain registered ([domain]), JSONL format documented, anonymization spec drafted, project skeleton in place"
- `Next physical action:` replace with the Week 2 description from design doc Section 7 Week 2: "CLI parser v0 — `npx burnd` reads local files and prints top 3 cost leaks to stdout. Schema designed with `vendor` field. 25 hours budgeted."
- `Open blockers:` clear out the Week 1 BLOCKING items (they're now done) and replace with whatever Week 2 needs

- [ ] **Step 2: Append a new entry to `project_session_log.md`**

Add at the TOP of the log (most recent first):

```markdown
## 2026-04-17 — Week 1 complete

**Session type:** Research + documentation (no production code)
**Hours logged:** [actual]

**What shipped:**
- Project skeleton (notes/, src/, .gitignore, LICENSE, README) and git repo initialized
- `notes/domain-verification.md` — WHOIS results + registration record
- `notes/jsonl-format.md` — Claude Code session format documented from 5 sample files
- `notes/anonymization.md` v0.1 — public trust commitment, field-by-field upload rules
- `notes/week-1-summary.md` — week recap
- Domain registered: [chosen TLD]

**Key decisions:**
- [Any decisions made during execution that weren't pre-decided]

**What I learned:**
- [Any surprises about the JSONL format or anonymization tradeoffs]

**Next session should:**
- Begin Week 2: CLI parser v0. Use `notes/jsonl-format.md` as the schema reference and `notes/anonymization.md` as the upload contract.
- Initialize the Node.js project in `src/cli/` with TypeScript + the multi-vendor parser interface (per design doc §6.2 — `vendor` field required from day 1).
- Target: by end of Week 2, `npx burnd` runs locally on Garvit's own session files and prints the top 3 cost leaks to stdout, with no Firestore upload yet.
```

- [ ] **Step 3: Verify the memory files are at the right path**

```bash
ls "/c/Users/Garvit Surana/.claude/projects/c--Users-Garvit-Surana-Desktop-Projects-ChangeLife/memory/" | head -20
```

Expected: all the memory files are visible (no `c--...-ChangeLife` orphan).

- [ ] **Step 4: No commit needed**

Memory files live outside the project repo, so they're not tracked by git. Just save and move on.

---

## Final task: Self-review and Week 2 handoff

**Owner:** 🤖 AI-doable
**Estimated time:** 15 minutes

- [ ] **Step 1: Verify the Week 1 deliverables**

```bash
cd "/c/Users/Garvit Surana/Desktop/Projects/ChangeLife"
ls notes/
git log --oneline
```

Expected files in `notes/`:
- `domain-verification.md`
- `jsonl-format.md`
- `anonymization.md`
- `week-1-summary.md`

Expected git log: ~7 commits, one per task that produced files.

- [ ] **Step 2: Confirm Week 2 unblock status**

Read `week-1-summary.md`'s "Ready for Week 2?" section. All four prerequisites should be ✅. If any is ⏳, document why and what's needed to unblock it.

- [ ] **Step 3: Tell Garvit Week 1 is complete**

Show Garvit:
- The summary file
- Total hours logged vs the 18-hour budget
- Any open questions or blockers for Week 2
- The git log

Ask: "Ready to begin Week 2 (CLI parser v0) in this session, or in a fresh session next time?"

---

## Plan self-review notes

This plan has 9 tasks covering ~7-8 hours of explicit step time, which fits comfortably under the 18-hour Week 1 budget. The remaining ~10 hours are slack for: re-reading sample files when something is ambiguous, debugging unexpected JSONL edge cases, researching registrars, the domain registration browser flow, and the inevitable "wait, I should also document X" iterations during Tasks 5-6. Research weeks always overrun on the longest research task (here, Task 5 — JSONL study).

**Spec coverage:** Maps to design doc §7 Week 1 deliverables (JSONL format study, name+domain decision, anonymization spec) and design doc Appendix A blocking items (final name → done in this session; domain verification → Tasks 2-3; anonymization scope → Task 6). The non-blocking items in Appendix A (mom's bank account, W-8BEN) are correctly deferred to Week 11 and not in this plan.

**No placeholders:** Every code block contains real code or real commands. No "TBD" or "fill in later." The two places that say "fill in actual observations" (Tasks 2 and 5) are template scaffolding for the human/agent to populate with real findings, not deferred work — this is the only honest way to write a research-task plan.

**Type/name consistency:** The chosen domain is referenced as "burnd.[chosen TLD]" throughout, and Task 2 explicitly resolves which TLD before Task 3 uses it. The JSONL field names in Task 5 (`message.usage.input_tokens` etc.) match what Task 6 references in the anonymization spec.

**Out of scope for this plan (deferred to later weeks):**
- Writing any production code (Week 2+)
- Setting up Firebase (Week 4)
- Lemon Squeezy integration (Week 11)
- Landing page copy (Week 12)
- Launch artifacts (Week 15)

If executing this plan reveals that Week 1 needs more research or that the JSONL format is more complex than expected, **expand Week 1 into Week 1.5 rather than rushing into Week 2 with a shaky schema understanding**. The parser cannot be built without the schema notes, so the schema notes have to be right.
