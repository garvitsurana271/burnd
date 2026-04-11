# Claude Code JSONL Session Format — Notes

**Date studied:** 2026-04-11
**Studied by:** Claude (autonomous, Week 1 Task 5)
**Sample size:** 5 representative files plus targeted spot-checks across 3 of them
**Sample paths:**
- `c--Users-Garvit-Surana-Desktop-Projects-FixTheBose/90f528b2-...jsonl` (1 MB, 392 records — primary structural sample)
- `c--Users-Garvit-Surana-Desktop-Projects-ChangeLife/42efe5b3-...jsonl` (2 MB, 500+ records — entrypoint/version diversity sample)
- `c--Users-Garvit-Surana-Desktop-Projects-temp/091f2e35-...jsonl` (870 KB — multi-version-within-file sample)
- `c--Users-Garvit-Surana-Desktop-Projects-StudyHelp/7429eb6d-...jsonl` (40 MB — large-file scale check)
- `c--Users-Garvit-Surana-Desktop-Projects-TheKothariMultitrade/73aa9528-...jsonl` (56 MB — large-file scale check)

**Claude Code versions observed in samples:** `2.1.87`, `2.1.96`, `2.1.101` (versions can change *within* a single session file when the user updates Claude Code mid-session)
**Models observed:** `claude-opus-4-6`, `<synthetic>` (placeholder for non-model records)

**Privacy note:** This file documents *structure only*. No actual session content (user messages, assistant responses, code, prompts, secrets, file paths inside tool inputs, command strings) is reproduced anywhere in this file. All examples use redacted placeholders. The `notes/anonymization.md` spec is built from this file's structural findings.

---

## High-level shape

Each `.jsonl` file is one session. Each line is one JSON object. **Records within a session are NOT all conversation turns.** There are at least **7 distinct record types**, only some of which carry token cost. The parser must filter by `type` before doing cost math.

### Record types observed

| `type` | Carries cost? | Frequency in samples | Purpose |
|---|---|---|---|
| `assistant` | **YES** — only this type has `usage.input_tokens` etc. | Heaviest after `user` | Assistant turns, tool calls, thinking |
| `user` | No (but contains tool_results) | Heaviest | User prompts, tool results, file attachments |
| `queue-operation` | No | ~5–10% | Lifecycle events: enqueue/dequeue of message queue |
| `attachment` | No | ~5–20% | File attachment metadata when files are added to context |
| `file-history-snapshot` | No | ~3–10% | File backup snapshots for diff/undo |
| `ai-title` | No | Exactly 1 per session | Auto-generated human-readable session title |
| `system` | No | Variable (high during retries) | API errors, retry tracking, system events |

### Top-level fields by record type

#### `assistant` record
```
top-level keys: [parentUuid, isSidechain, message, requestId, type, uuid, timestamp,
                 userType, entrypoint, cwd, sessionId, version, gitBranch]
```

- `uuid` — unique per record
- `parentUuid` — links to previous record in chain (null for first record in chain)
- `sessionId` — UUID shared across all records in this session file
- `isSidechain` — boolean. `true` = this record is from a dispatched subagent (lives in `subagents/` subdir typically). `false` = main session.
- `requestId` — present on assistant turns; matches the API request that produced this turn. Useful for retry-grouping.
- `message` — the actual content payload (see below)
- `cwd` — working directory the user was in (Windows-style path, e.g. `c:\Users\Garvit Surana\Desktop\Projects\FixTheBose`)
- `gitBranch` — git branch name OR `"HEAD"` if detached
- `version` — Claude Code version (e.g. `"2.1.96"`). **Can change within a session file.**
- `entrypoint` — how Claude Code was launched. Observed values: `claude-vscode` (the VS Code extension). Likely also `claude-code-cli` and others.
- `userType` — observed: `external`. Likely indicates non-Anthropic-employee user.
- `timestamp` — ISO8601 timestamp

#### `assistant.message` (the payload)
```
keys: [model, id, type, role, content, stop_reason, stop_sequence, stop_details, usage]
```

- `model` — model id, e.g. `"claude-opus-4-6"`. **WATCH OUT for `"<synthetic>"`** — see "Synthetic records" section below.
- `id` — Anthropic API message ID (e.g. `"msg_..."`)
- `type` — always `"message"` for real assistant turns
- `role` — `"assistant"`
- `content` — array of content blocks (see "Content blocks" section)
- `stop_reason`, `stop_sequence`, `stop_details` — generation stop info
- `usage` — **THE COST CALCULATION SOURCE** (see below)

#### `assistant.message.usage` — THE COST FIELDS
```json
{
  "input_tokens": 3,
  "cache_creation_input_tokens": 7908,
  "cache_read_input_tokens": 14522,
  "cache_creation": {
    "ephemeral_5m_input_tokens": 0,
    "ephemeral_1h_input_tokens": 7908
  },
  "output_tokens": 29,
  "service_tier": "standard",
  "inference_geo": "not_available"
}
```

- `input_tokens` — uncached input tokens this turn
- `cache_creation_input_tokens` — tokens written to prompt cache this turn
- `cache_read_input_tokens` — tokens read from prompt cache this turn (cheaper than uncached)
- **`cache_creation` (sub-object) — NEW IN 2026:** breaks cache writes into **5-minute ephemeral** vs **1-hour ephemeral** tiers. The 1-hour tier is more expensive per token but lasts longer. **The parser MUST sum these correctly per the model's pricing or the cost numbers will be wrong.**
- `output_tokens` — assistant output tokens this turn
- `service_tier` — observed: `"standard"`. Probably also `"priority"` for users on priority service.
- `inference_geo` — observed: `"not_available"`. Geo of inference for compliance reporting.

**Cost formula (per turn):**
```
turn_cost_usd =
   input_tokens                       * model.input_rate
 + cache_read_input_tokens            * model.cache_read_rate         (~10% of input rate)
 + cache_creation.ephemeral_5m_input_tokens * model.cache_5m_rate     (~125% of input rate)
 + cache_creation.ephemeral_1h_input_tokens * model.cache_1h_rate     (~200% of input rate)
 + output_tokens                      * model.output_rate
```

The exact rate multipliers depend on the model and Anthropic's pricing — Burnd will maintain a `model-rates.ts` lookup table that's updated whenever Anthropic publishes pricing changes. As of the early 2026 sampling, `claude-opus-4-6` is the heaviest observed model; rates need verification before launch.

#### `user` record
```
top-level keys: [parentUuid, isSidechain, promptId, type, message, uuid, timestamp,
                 toolUseResult, sourceToolAssistantUUID, userType, entrypoint, cwd,
                 sessionId, version, gitBranch]
```

Mostly mirrors `assistant` record top-level fields. Three user-only additions are **load-bearing**:

- **`promptId`** — present when this user record is a real prompt (not a tool_result). Used as prompt-cache key by the API.
- **`toolUseResult`** — present when this user record carries a tool result. **This is a structured top-level field — the parser doesn't need to dig inside `message.content[]` to find tool results.** Massive simplification.
- **`sourceToolAssistantUUID`** — links a tool_result user record back to the assistant record that originated the tool_use. **The parser uses this to compute per-tool stats without doing UUID-graph traversal in JS.**

#### `queue-operation` record (simplest)
```
keys: [type, operation, timestamp, sessionId]
```
- `operation` — observed: `"enqueue"`. Likely also `"dequeue"`, `"process"`, etc.
- Always safe to skip for cost computation.

#### `attachment` record
```
keys: [parentUuid, isSidechain, attachment, type, uuid, timestamp, userType,
       entrypoint, cwd, sessionId, version, gitBranch]
```
- `attachment` — sub-object with `addedNames`, `addedLines`, `removedNames` (and probably `removedLines`). Tracks files added to/removed from the conversation context.
- **PRIVACY-SENSITIVE:** `addedNames` likely contains file paths/names. The anonymization spec must drop these.

#### `file-history-snapshot` record
```
keys: [type, messageId, snapshot, isSnapshotUpdate]
```
- `messageId` — references a previous message uuid
- `snapshot` — sub-object with `messageId`, `trackedFileBackups`, `timestamp`. **Contains file content backups** for the diff/undo functionality. **PRIVACY-SENSITIVE in the extreme** — `trackedFileBackups` is literally copies of the user's source code. **MUST DROP entirely** in anonymization. The parser doesn't need this data for any v1 detector.

#### `ai-title` record (one per session)
```
keys: [type, sessionId, aiTitle]
```
- `aiTitle` — auto-generated human-readable title. Example: `"Fix broken Bose Lifestyle 535 remote"`.
- **Burnd UX win:** the dashboard's Sessions view should display `aiTitle` instead of raw UUIDs. Free human-readability.
- **Privacy note:** AI titles are derived from session content and may contain project/feature names. **HASH or DROP for upload** — the dashboard can show titles for the *local* user but should not transmit them to the cloud unhashed.

#### `system` record
```
keys: [parentUuid, isSidechain, type, subtype, level, cause, error, retryInMs,
       retryAttempt, maxRetries, timestamp, uuid, userType, entrypoint, cwd,
       sessionId, version, gitBranch, slug]
```
- `subtype` — observed: `"api_error"`. Likely also `"hook_event"`, others.
- `level` — observed: `"error"`. Probably also `"warn"`, `"info"`.
- `cause` — sub-object with `code`, `path`, `errno` (Node.js-style error)
- `error` — sub-object with `type`, `cause`
- `retryInMs`, `retryAttempt`, `maxRetries` — retry tracking. **Critical for the new "retry storm detector" (see below).**
- `slug` — observed: `"jolly-swinging-pine"`. Auto-generated human-readable session slug, possibly unique. Three-word combinations.

---

## Content blocks (inside `assistant.message.content[]` and `user.message.content[]`)

Observed content block types across the samples:

| Block type | Where it appears | Purpose | Cost-bearing? |
|---|---|---|---|
| `text` | both user and assistant | natural language | tokens are in the parent record's `usage` block |
| `thinking` | assistant only | extended thinking traces | included in parent record's output_tokens |
| `tool_use` | assistant only | tool invocations | included in parent record's output_tokens |
| `tool_result` | user only | tool output returned to model | tokens counted as `input_tokens` of the next assistant turn |

### `tool_use` content block (inside assistant content array)
```
keys: [type, id, name, input, caller]
```
- `type` — always `"tool_use"`
- `id` — Anthropic tool use id (e.g. `"toolu_..."`)
- `name` — tool name (e.g. `"Bash"`, `"Edit"`, `"Write"`, `"Read"`, `"WebSearch"`, `"Skill"`, `"ToolSearch"`, `"TodoWrite"`, `"WebFetch"`)
- `input` — tool args (e.g. `{ command, description }` for Bash). **PRIVACY-SENSITIVE** — Bash command strings, file paths, edit text all live here. **DROP from upload.**
- `caller` — **NEW FIELD I haven't seen documented elsewhere.** Probably identifies the calling agent (main vs subagent slug). Need to confirm in Week 2.

### `tool_result` content block (inside user content array)
```
keys: [tool_use_id, type, content, is_error]
```
- `tool_use_id` — links back to the originating tool_use's `id`
- `type` — always `"tool_result"`
- `content` — string OR array. **PRIVACY-SENSITIVE** — tool outputs. **AGGREGATE only (size in bytes), never upload content.**
- `is_error` — boolean

---

## Subagent files

**Pattern:** Subagent sessions live in a `subagents/` subdirectory under the parent session's UUID directory:
```
.claude/projects/<encoded-cwd>/<session-uuid>.jsonl                    ← parent session
.claude/projects/<encoded-cwd>/<session-uuid>/subagents/agent-<...>.jsonl ← subagent run
```

Example observed:
```
.../KropScan--V1/ded157d5-8787-4a12-bb15-a4cdd30a26df.jsonl
.../KropScan--V1/ded157d5-8787-4a12-bb15-a4cdd30a26df/subagents/agent-acompact-5bf09a12e5285520.jsonl
```

The `acompact` prefix on the subagent filename suggests it's an auto-compaction subagent (Claude Code dispatches a sub-agent to compact long sessions). Other subagent prefixes likely exist for explore, plan, code-review, etc.

**Parser design question for Week 2 (DECISION DEFERRED):** Should subagent files be counted as part of the parent session's cost, or as separate runs?
- **Argument for "part of parent":** Token spend in the subagent was triggered by the parent session, so attributing to the parent is more honest from a cost-attribution standpoint.
- **Argument for "separate":** Subagents have their own session boundaries, can run in parallel, and have their own UUIDs. Treating them as separate makes per-session metrics cleaner.
- **Recommendation:** Both. Store them with `isSubagent: true` and `parentSessionId: <uuid>` in the Firestore schema. Default UI view aggregates them under the parent; advanced view lets users see them separately.

---

## Synthetic records — `model: "<synthetic>"`

Some `assistant` records have `model: "<synthetic>"` instead of a real model id. These are placeholders for messages that aren't real Anthropic API calls — likely:
- System-injected reminders (e.g. the TodoWrite "haven't been used recently" reminders we've been seeing)
- Hook outputs that look like assistant turns but aren't
- Context insertions
- Compaction summaries

**RULE: The parser MUST exclude `<synthetic>` records from cost calculation.** They have no real cost. They DO carry useful structural information (the dashboard could show "X synthetic interjections this session"), but they must NEVER be summed into dollar totals.

**Verification test for the parser (Week 2):** Run the parser on a session known to contain `<synthetic>` records and assert that the synthetic records are excluded from any USD-denominated metric. Failing this test = silent overcounting of costs.

---

## Version handling

`version` is a top-level field on most records (`2.1.87`, `2.1.96`, `2.1.101` observed). **Critical observation: a single session file can contain MULTIPLE versions.** Garvit's `temp` session has both `2.1.87` and `2.1.101` because Claude Code was updated mid-session.

**Parser strategy for version handling:**
1. On every record, check the `version` field. If unknown, log a warning and apply the most-recent-known schema rules.
2. Maintain a per-version compatibility table (e.g., `version-compat.ts`) that says which fields exist in which versions.
3. **Fail soft, never crash.** If parsing a record throws, skip it, log it, and continue with the next record. Burnd's value is "better than zero visibility" — partial parsing is better than no parsing.
4. Maintain a public `parser-debt.md` file in the open-source parser repo with known format quirks per version. The community helps update this.

**Recommended pinning strategy:** the CLI declares "supports Claude Code 2.1.x" in its package.json. When a major version (3.x) ships, the CLI version-detects, warns the user, and either falls back to best-effort or asks them to upgrade Burnd.

---

## Cost-calculation source-of-truth (one-line summary)

```
For each record where:
  type === 'assistant'
  AND message.model !== '<synthetic>'
  AND message.usage exists

Sum into the running total:
  message.usage.input_tokens                       * input_rate(model)
  + message.usage.cache_read_input_tokens          * cache_read_rate(model)
  + message.usage.cache_creation.ephemeral_5m_input_tokens * cache_5m_rate(model)
  + message.usage.cache_creation.ephemeral_1h_input_tokens * cache_1h_rate(model)
  + message.usage.output_tokens                    * output_rate(model)
```

That's the formula. Everything else in Burnd is filtering, grouping, and visualization on top of this.

---

## Detector implementation notes (cross-check against design doc §5.2)

The 7 detectors specified in the design doc Section 5.2, plus 1 new one discovered during this study:

1. **Long Bash output detector** — needs `tool_result.content` size for tool_use records where `name === "Bash"`. The `toolUseResult` top-level field on user records makes this easy to compute.
2. **Repeated-read detector** — needs `tool_use.input.file_path` for `name === "Read"`, grouped by hash within session.
3. **Thrash detector** — needs `tool_use` count and matched `tool_result` count per session, with `tool_result.is_error` ratio. All available in `assistant.content[].tool_use` and `user.content[].tool_result`.
4. **Tool overuse detector** — needs `tool_use.name` frequency per session. Available.
5. **Skill firing detector** — needs `tool_use.name === "Skill"` count, plus the skill name from `tool_use.input.skill`. Available. Also: skill firings probably show up in the `system` record `subtype === "hook_event"` (TBD in Week 2).
6. **Project-cost outlier detector** — needs `cwd` (or hashed `cwd`) → cost mapping across sessions. Available.
7. **Tired-coding detector** — needs `timestamp` + total cost per session. Available.
8. **API retry storm detector (NEW — added during this study)** — needs `system` records where `subtype === "api_error"`, grouped by `requestId`. Sessions with high retry counts indicate API failures that waste tokens (failed assistant turns still cost money for the partial output). **Add this detector to the Week 3 implementation list.**

All 8 detectors are implementable from the schema fields documented above. **No blockers for Week 2.**

---

## Known edge cases observed

1. **Multiple Claude Code versions in one session file** (temp session: 2.1.87 + 2.1.101). Parser must handle.
2. **Detached HEAD git state** (`gitBranch === "HEAD"`). Parser must not assume `gitBranch` is a real branch name.
3. **Synthetic records** mixed in with real assistant turns (`model === "<synthetic>"`). Parser must filter.
4. **Subagent files in nested `subagents/` subdirectories** under the parent session UUID directory. Parser must walk recursively.
5. **Single session files of 100+ MB** (KropScan-V1 has a 101.5 MB session). Parser MUST stream JSONL line-by-line, never `JSON.parse(entire_file)` or `fs.readFileSync(entire_file)`. Use a line-stream library.
6. **First record of a session is often a `queue-operation`, not a conversation turn.** Parser must handle non-conversation records at any position.
7. **`cwd` uses Windows-style backslashes** on Windows users. Parser must handle both `/` and `\` separators in `cwd`.
8. **`gitBranch` can be `null`** (not just missing) in some early-version records. Treat null and missing as equivalent.
9. **`tool_result.content` is sometimes a string and sometimes an array** of content blocks. Parser must handle both.
10. **`stop_details` is a sub-object** that may contain refusal info, max-tokens-hit info, etc. Not used in v1 cost calc but worth preserving for v2 detectors.

---

## Open questions for Week 2 parser implementation

These are deferred decisions that don't block Week 1 but need to be answered when actually writing the parser:

1. **Subagent attribution** — count subagent costs as part of parent session, separate, or both? **Recommended: both**, with `isSubagent` and `parentSessionId` fields in Firestore.
2. **`caller` field on tool_use blocks** — what does this contain? Looks like a subagent identifier but not confirmed. Investigate by reading a few subagent tool_use records in Week 2.
3. **Other `system.subtype` values** beyond `api_error` — probably `hook_event`, possibly `compaction_event`. Need to enumerate by sampling more system records.
4. **Other `entrypoint` values** beyond `claude-vscode` — likely `claude-code-cli`, possibly others. Test against a session generated from the bare CLI (not the VS Code extension).
5. **Other `service_tier` values** beyond `"standard"` — `"priority"` exists per Anthropic docs, but Garvit's samples are all `standard`. Pricing rates may differ by tier.
6. **`inference_geo` always `"not_available"`?** — possibly populated for enterprise/zero-data-retention customers. Not relevant for Burnd v1.
7. **How to detect a session has ended?** — there's no explicit "end" record. The parser probably has to infer end-of-session from "no more records after timestamp T" or "explicit logout queue-operation."
8. **Compaction events** — when Claude Code compacts a long session, does it emit a special record type, or just rewrite the JSONL? Need to find a compacted session and inspect.

---

## Tool name canonical list (observed in samples)

For the v1 dashboard's Tools view and Tool Overuse detector, here's the observed list of tool names. Add new ones as encountered:

- `Bash`
- `Edit`
- `Write`
- `Read`
- `Glob`
- `Grep`
- `WebSearch`
- `WebFetch`
- `TodoWrite`
- `Skill`
- `ToolSearch`
- `Task` (subagent dispatch, not yet observed in samples but documented in the system prompt)

Custom MCP tools likely use namespaced names like `mcp__<server>__<tool>`. The parser should handle arbitrary tool names without crashing on unknowns.

---

## Sanity check: are all 8 detectors implementable from this schema? ✅

| Detector | Required fields | Status |
|---|---|---|
| 1. Long Bash output | `tool_result.content` size for `Bash` tool_use | ✅ available via `toolUseResult` |
| 2. Repeated-read | `tool_use.input.file_path` for `Read` | ✅ |
| 3. Thrash | `tool_use` count + `tool_result.is_error` per session | ✅ |
| 4. Tool overuse | `tool_use.name` frequency per session vs baseline | ✅ |
| 5. Skill firing | `tool_use.name === "Skill"` + `tool_use.input.skill` | ✅ (and bonus from `system.subtype === "hook_event"` in Week 2) |
| 6. Project-cost outlier | `cwd` → cost across sessions | ✅ via `hash(cwd)` |
| 7. Tired-coding | `timestamp` + total cost per session | ✅ |
| 8. **NEW: API retry storm** | `system.subtype === "api_error"` count grouped by `requestId` | ✅ new detector, add to design doc §5.2 |

**Week 2 is unblocked.** The parser can be built directly against this schema.
