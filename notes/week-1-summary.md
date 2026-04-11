# Week 1 Summary — 2026-04-11 to 2026-04-17

**Hours logged:** ~2 (compressed AI execution; budget was 18 human-hours)
**Phase:** Research and decisions (no production code)
**Executed by:** Claude (autonomous, inline session, with Garvit watching)

## What shipped

- ✅ **Project skeleton** — `notes/`, `notes/queue/`, `src/` directories with `.gitkeep` markers; `.gitignore` (with explicit `.claude/` exclusion to never commit session data); MIT `LICENSE`; minimal `README.md`; queue directory README explaining the autonomy mechanism; git initialized with `main` branch and per-repo author identity (`Garvit Surana <garvitsurana10@gmail.com>`)
- ✅ **Domain verified** — `notes/domain-verification.md`. Findings: `burnd.com` is taken (parked on Afternic since 2010, squatter listing), `burnd.dev` is AVAILABLE (Charleston Road Registry returned the canonical 404 "not found" via RDAP), `burnd.io` is AVAILABLE as fallback. **Decision: register `burnd.dev`** (Tier 1, no escalation).
- ✅ **Domain registration queued** — `notes/queue/2026-04-12-register-burnd-dev.md`. Click-by-click instructions for Hostinger India checkout via UPI, ~8 minutes of Garvit's time, ~₹1,200–₹1,500 cost.
- ✅ **JSONL format study** — `notes/jsonl-format.md` (348 lines). Documented:
  - 7 distinct record types (`assistant`, `user`, `queue-operation`, `attachment`, `file-history-snapshot`, `ai-title`, `system`)
  - `assistant.message.usage` as the cost calculation source-of-truth, including the **NEW 2026 ephemeral cache tiers** (`ephemeral_5m_input_tokens` and `ephemeral_1h_input_tokens`)
  - Tool call structure (`tool_use` and `tool_result` content blocks)
  - The `<synthetic>` model placeholder rule (parser MUST exclude these from cost)
  - Subagent nesting under `<session-uuid>/subagents/`
  - Multi-version-within-a-single-session edge case
  - 10 known edge cases for the parser to handle
  - 8 open questions deferred to Week 2 implementation
- ✅ **Anonymization spec v0.1** — `notes/anonymization.md` (299 lines). Field-by-field rules (KEEP/HASH/DROP/AGGREGATE) for every field documented in the format study. The highest-risk field — `file-history-snapshot.snapshot.trackedFileBackups` (literal source code backups) — is explicitly DROPPED with the strongest possible language. Soft review queued at `notes/queue/2026-04-13-review-anonymization.md` (non-blocking).

## Key decisions made this week

These are decisions made under the autonomy mandate during Week 1 execution. All Tier 1 or Tier 2 — none escalated.

- **DECISION (Tier 1):** Register `burnd.dev` not `burnd.io`. Reason: `.dev` is the canonical dev-tool TLD in 2026, has auto-HTTPS via HSTS preload, signals "dev tool" to buyers immediately. `.io` is acceptable fallback only.
- **DECISION (Tier 1):** Don't pursue purchase of `burnd.com` from the Afternic squatter. Reason: cost is likely $500–$5,000+ for short squatted words, not worth it when `.dev` is free at ~₹1,200/year and is the better TLD anyway.
- **DECISION (Tier 1):** Use Hostinger India as the registrar. Reason: cheapest verified UPI-friendly option for `.dev` in early 2026, free WHOIS privacy. Migrate to Cloudflare Registrar in Year 2 if Garvit gets an international card.
- **DECISION (Tier 2):** Subagent attribution will be "both" — store with `isSubagent` flag and `parentSessionId` link in Firestore, default UI rolls them into the parent session, advanced view splits them out. **This adds a small new field to the design doc §6 schema; should be reflected when the design doc is next updated.**
- **DECISION (Tier 2):** Parser will stream JSONL line-by-line, not load whole files. **This is a Week 2 implementation constraint** based on observing a 101.5 MB session file in Garvit's data. Whatever Node.js library Week 2 picks for parsing must support a line-by-line read interface (`readline.createInterface` is the obvious built-in choice).
- **DECISION (Tier 2):** Add an 8th detector to design doc §5.2 — **API retry storm detector**. Discovered during the schema study that `system` records track API failures and retries with `subtype === "api_error"`, `retryAttempt`, `maxRetries`. Sessions with high retry counts indicate wasted spend (failed turns still cost money for the partial output). Add to the Week 3 implementation list.
- **DECISION (Tier 1):** Drop `aiTitle`, `slug`, and `gitBranch` from the upload payload entirely (not just hash them). Reason: even hashed, they create cross-session linkability and may leak project/feature names. The local dashboard still shows `aiTitle` from a local-only cache so users get the UX benefit without the privacy cost.

## What I learned this week

- **Claude Code's session JSONL format is far richer than I expected.** I assumed ~3 record types; there are at least 7. The `file-history-snapshot` records contain literal source code backups for the diff/undo system — that single discovery makes the anonymization spec way more important than I initially treated it.
- **The 2026 cache tiers are new:** `cache_creation.ephemeral_5m_input_tokens` and `cache_creation.ephemeral_1h_input_tokens`. Burnd needs to handle them correctly or it will undercount cost on heavy-cache users.
- **Garvit is a heavy Claude Code user.** 210 session files, 513 MB total, across 15 projects. The largest single session is 101.5 MB. This validates Burnd's target audience: someone like Garvit is exactly the buyer profile, and his own data is the test fixture.
- **`<synthetic>` model placeholder is a silent footgun.** A parser that includes `<synthetic>` records in cost calculation will report wildly inflated numbers. The Week 2 parser will have a CI test specifically for this.
- **Subagent files exist in nested subdirectories** (`<session-uuid>/subagents/`), not as flat siblings. The parser must walk recursively, not just `glob` flat directories.
- **`gitBranch` can be `"HEAD"`** when the user is in detached HEAD state. Parser must not assume it's a real branch name.
- **Multiple Claude Code versions can appear in a single session file** if the user updates Claude Code mid-session. Parser version handling has to be per-record, not per-file.
- **The autonomy mandate works.** Garvit's Week 1 involvement was: choose a name + email for git config (1 minute), and (still pending) the queued domain registration (~8 minutes). Everything else was autonomous. The queue mechanism kept Tier 3 actions out of the critical path.

## Open / queued for Garvit

| File | Type | Time est | Status |
|---|---|---|---|
| `notes/queue/2026-04-12-register-burnd-dev.md` | Tier 3 (money) | ~8 min | OPEN — register burnd.dev via Hostinger UPI |
| `notes/queue/2026-04-13-review-anonymization.md` | Soft review (non-blocking) | ~5 min | OPEN — skim anonymization spec, approve or push back |

## Ready for Week 2?

Week 2 (Apr 18–24, 25 hours budgeted) builds the **CLI parser v0**. It depends on:

- ✅ `notes/jsonl-format.md` — tells the parser what to read
- ✅ `notes/anonymization.md` — tells the parser what to upload (v0.1, may revise to v1.0 after Garvit's soft review)
- ✅ Multi-vendor schema design (per design doc §6.2 — `vendor` field required in Firestore from day 1; v1 only emits `claude-code` but the schema accommodates Gemini/Codex in v2)
- ⏳ A registered domain (Garvit's queue item) — **NOT BLOCKING** for Week 2 itself; only needed for the CLI's `--help` URL output, which can use a placeholder until the domain lands
- ✅ Project skeleton with git initialized

**Week 2 is unblocked.** All blocking research is done. The implementation plan for Week 2 should be written next session (separate plan file: `docs/superpowers/plans/2026-04-18-burnd-week-2-plan.md`).

## Commits this week

```
b246872 docs: anonymization spec v0.1 + queued soft review
e77e640 docs: Claude Code JSONL session format study
d07ad99 queue: prepared burnd.dev registration for Garvit
f4918c7 docs: domain availability check via RDAP
0326363 chore: initial project skeleton
```

5 commits, ~1,400 lines of documentation, 0 lines of production code (as planned for the research week).
