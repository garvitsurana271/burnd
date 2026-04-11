# QUEUE (soft, non-blocking): Review anonymization spec v0.1

**Created:** 2026-04-11 by Claude (Week 1 plan, Task 6)
**Estimated time:** 5 minutes
**Priority:** SOFT — Week 2 parser work proceeds in parallel against v0.1 and will be revised if you object after the fact.
**Why:** Claude drafted and self-reviewed `notes/anonymization.md` v0.1. Per the autonomy mandate, Claude committed it without blocking on your review. This queue item is the *non-blocking soft review* — read whenever you have 5 minutes, push back on anything that feels wrong, and Claude will revise to v0.2.

## What to read

Open `notes/anonymization.md`. The whole file is about 350 lines but the parts you actually need to skim are:

1. **The "Burnd never uploads" promise** at the top (~30 seconds)
2. **The "Burnd uploads only" list** right below it (~30 seconds)
3. **The field-by-field table headers** — you don't need to read every row, just scan the column for any DROP/HASH that surprises you (~2 minutes)
4. **The "highest-risk field" callout** for `file-history-snapshot.snapshot.trackedFileBackups` (~30 seconds — make sure you understand why this is special)
5. **The "Local cache, no upload" section** — confirms `aiTitle` and raw `cwd` stay on your machine forever (~30 seconds)

Total reading time: ~5 minutes if you skim, ~10 if you actually read every row.

## What to look for

- **Anything in the "never upload" promise that you want to strengthen.** E.g., "also never upload prompt embeddings" or "also never upload subagent slugs."
- **Any field marked KEEP or HASH that you'd rather see as DROP.** When in doubt, more dropping is safer.
- **Any privacy concern I missed entirely.** Especially around the things Claude Code does that I might not have observed in the 5 sample files.
- **Whether you want to publicly publish this file** in the open-source parser repo. **Default: yes** — it's a trust marketing tool. Saying "we publish our anonymization rules" is a competitive advantage no closed-source vendor can match.

## How to respond

- **All good:** Tell Claude exactly: **"anon v0.1 approved"** — Claude will mark it as v1.0, delete this queue file, log a `RESOLVED:` entry in the session log.
- **Want changes:** Tell Claude what to change in plain words (e.g., "also drop the `caller` field" or "I want `entrypoint` hashed not kept"). Claude will:
  1. Revise to v0.2
  2. Re-run the self-review checklist
  3. Commit
  4. Update this queue file with `RESOLVED v0.2:` and the diff
- **Want to think more:** No action needed. The queue file stays. v0.1 keeps shipping until you say otherwise.

## Hard deadline

None — this is non-blocking. But ideally before launch (Week 16) so the v1.0 spec is what we publish in the parser repo at launch time.

If you don't address this within 7 days (by 2026-04-18), Claude will note it as a "stale queue item" in the session log. Per the autonomy mandate, stale items get re-evaluated for whether they're still needed.
