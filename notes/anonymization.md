# Burnd — Anonymization Specification (v0.1)

**Last updated:** 2026-04-11
**Status:** Draft v0.1, self-reviewed by Claude, committed under autonomy mandate. Soft review queued for Garvit at `notes/queue/2026-04-13-review-anonymization.md`.
**Public commitment:** This file will be published in the open-source parser repo under the MIT license. Users can read it to verify exactly what Burnd uploads from their machine. **If this file says "we never upload X," the parser MUST NOT upload X under any circumstances.**

---

## The promise to the user (top-level, marketing-quotable)

**Burnd never uploads:**

- The content of any user message you sent to Claude Code
- The content of any assistant response Claude Code sent back
- Any code, prompt, command, or text you passed as input to a tool
- Any output, error message, file content, or text returned from a tool
- File names, file paths, or directory contents
- Source code in any form, ever, under any circumstances
- File backups from Claude Code's diff/undo system (`file-history-snapshot.snapshot.trackedFileBackups`)
- Environment variables, secrets, API keys, or credentials of any kind
- Git branch names, commit messages, repository contents, or `.git` directory data
- Auto-generated session titles or slugs (these are derived from your conversation content and may leak project/feature names)
- Anything that could be used to reconstruct what you were actually working on

**Burnd uploads only:**

- Numeric token counts (input, output, all four cache tiers, per assistant turn)
- Tool call frequencies (e.g., "Bash was called 47 times in this session")
- Tool output sizes in bytes (e.g., "tool output was 12 KB" — never the actual output)
- Session timestamps (start, end, per-turn)
- Model identifiers (e.g., `claude-opus-4-6`)
- Hashed identifiers for grouping (SHA-256 of project paths, sessionIds, file paths — truncated to 16 hex chars)
- Claude Code version markers (e.g., `2.1.96`)
- Tool names (e.g., `Bash`, `Read`, `Edit`)
- Boolean flags like `is_error`, `isSidechain`, `isMeta`
- Counts of API errors / retries from `system` records (without the error content itself)

If anything in the "uploads only" list could leak information beyond what we intend, that's a bug in this spec — file an issue against the public parser repo.

---

## Field-by-field rules

For each field in `notes/jsonl-format.md`, classify as one of:

- **KEEP** — upload as-is. Numeric counts, timestamps, uuids that aren't tied to user identity, model ids, structural metadata.
- **HASH** — replace with `sha256(value).slice(0, 16)` (16 hex chars). For values needed to group/compare across sessions but where the raw value would leak identity.
- **DROP** — never upload. Replace with `null`, `undefined`, or omit from the upload payload entirely.
- **AGGREGATE** — derive a structural property (size, length, count, type) and upload only that. Used for content that has structural value but not safe to upload raw.

### Top-level fields (all record types)

| Field | Rule | Reason |
|---|---|---|
| `uuid` | **KEEP** | random per-record id, not identity-linked |
| `parentUuid` | **KEEP** | random, used for chain structure |
| `sessionId` | **HASH** | needed for grouping records into sessions; raw uuid is harmless but hash is safer |
| `requestId` | **KEEP** | Anthropic API request id, not identity-linked |
| `promptId` | **HASH** | prompt-cache key — could theoretically link to other systems; hash to be safe |
| `sourceToolAssistantUUID` | **KEEP** | references another uuid in the same session, not identity-linked |
| `timestamp` | **KEEP** | ISO8601 timestamps are not sensitive on their own |
| `type` | **KEEP** | structural metadata: `assistant` / `user` / `queue-operation` / etc. |
| `subtype` | **KEEP** | structural |
| `level` | **KEEP** | structural (`error` / `warn` / `info`) |
| `slug` | **DROP** | the auto-generated session slug like `"jolly-swinging-pine"` is harmless, but we don't need it for any detector and dropping it avoids one more cross-session linkability vector |
| `userType` | **KEEP** | structural (`external` etc.) |
| `entrypoint` | **KEEP** | structural (`claude-vscode`, `claude-code-cli`) — useful for grouping by IDE-vs-CLI |
| `cwd` | **HASH** | working directory leaks project/company names; hash for grouping |
| `gitBranch` | **DROP** | branch names leak feature names, customer names, internal projects (e.g., `feat/acme-customer-onboarding`). Even hashed, the linkability across sessions is a leak vector. Drop entirely. |
| `version` | **KEEP** | Claude Code version, not sensitive |
| `isSidechain` | **KEEP** | boolean, structural |
| `isMeta` | **KEEP** | boolean, structural |
| `isSnapshotUpdate` | **KEEP** | boolean, structural |

### `assistant.message` fields

| Field | Rule | Reason |
|---|---|---|
| `message.id` | **KEEP** | Anthropic API message id |
| `message.type` | **KEEP** | always `"message"`, structural |
| `message.role` | **KEEP** | `assistant` / `user`, structural |
| `message.model` | **KEEP** | model id, not sensitive — drives cost calculation |
| `message.content` | **AGGREGATE** | the array of content blocks: upload only `{ type, byteSize, (toolName for tool_use), (isError for tool_result) }` per block. **NEVER upload `text`, `thinking`, `input`, or `content` strings/objects.** |
| `message.stop_reason` | **KEEP** | structural (`end_turn`, `tool_use`, `max_tokens`, `refusal`) |
| `message.stop_sequence` | **DROP** | could leak custom stop sequences set by user-side wrappers |
| `message.stop_details` | **DROP** | may contain refusal text or partial generation; safer to drop in v1, revisit for v2 |

### `assistant.message.usage` (THE COST FIELDS — all KEEP)

| Field | Rule | Reason |
|---|---|---|
| `usage.input_tokens` | **KEEP** | numeric, the heart of cost calc |
| `usage.cache_creation_input_tokens` | **KEEP** | numeric |
| `usage.cache_read_input_tokens` | **KEEP** | numeric |
| `usage.cache_creation.ephemeral_5m_input_tokens` | **KEEP** | numeric (NEW 2026 cache tier) |
| `usage.cache_creation.ephemeral_1h_input_tokens` | **KEEP** | numeric (NEW 2026 cache tier) |
| `usage.output_tokens` | **KEEP** | numeric |
| `usage.service_tier` | **KEEP** | structural (`standard` / `priority`) |
| `usage.inference_geo` | **KEEP** | structural; observed `not_available` only |

### Content blocks (inside `message.content[]` arrays)

For every content block, the parser computes a *summary object* and uploads only that:

```ts
{
  type: 'text' | 'thinking' | 'tool_use' | 'tool_result',
  byteSize: number,                  // the JSON.stringify length of the original block
  toolName?: string,                 // ONLY for tool_use blocks
  toolUseId?: string,                // ONLY for tool_use / tool_result blocks (links them)
  isError?: boolean,                 // ONLY for tool_result blocks
}
```

**Specifically and explicitly NEVER uploaded:**
- `text` field of any content block (the actual text)
- `thinking` field of any thinking block (the actual reasoning trace)
- `input` field of any tool_use block (the tool arguments — could be Bash commands, file paths, edit text)
- `content` field of any tool_result block (the tool output — could be file contents, command output, secrets)
- `signature` field of any thinking block (cryptographic signature of the reasoning, not useful for cost analysis)

### `user.toolUseResult` (top-level on user records)

| Field | Rule | Reason |
|---|---|---|
| `toolUseResult` | **AGGREGATE** | this is the structured top-level copy of the tool result. Compute `{ toolUseId, byteSize, isError }` and upload only that. **Never upload the `content`, `output`, `stdout`, `stderr`, `file_path`, or any other sub-field that contains actual data.** |

### Attachment records

| Field | Rule | Reason |
|---|---|---|
| `attachment.addedNames` | **AGGREGATE** | upload only `addedNames.length` (count of files added). Never the file names themselves. |
| `attachment.addedLines` | **KEEP** | numeric — total lines of added file content |
| `attachment.removedNames` | **AGGREGATE** | upload only count, never names |
| `attachment.removedLines` | **KEEP** | numeric |

### File-history-snapshot records

| Field | Rule | Reason |
|---|---|---|
| `messageId` | **KEEP** | references another uuid |
| `snapshot` | **DROP — entirely** | **`snapshot.trackedFileBackups` literally contains copies of the user's source code.** This is the highest-risk field in the entire JSONL. Burnd has no need for this data in any v1 or v2 detector. The parser must explicitly skip every `file-history-snapshot` record without ever inspecting `snapshot.trackedFileBackups`. **VIOLATION OF THIS RULE = INSTANT TRUST DEATH.** |
| `isSnapshotUpdate` | **KEEP** | boolean structural |

### AI title records

| Field | Rule | Reason |
|---|---|---|
| `aiTitle` | **DROP** | auto-generated titles like `"Fix broken Bose Lifestyle 535 remote"` leak project/feature names. The local dashboard displays them (for the user's own benefit), but they NEVER leave the user's machine. Implementation: the CLI parser strips `aiTitle` from any payload before upload; the dashboard reads titles from a local-only cache that's never synced to Firestore. |

### System (error/retry) records

| Field | Rule | Reason |
|---|---|---|
| `subtype` | **KEEP** | `api_error` / `hook_event` / etc. — structural |
| `level` | **KEEP** | `error` / `warn` / `info` |
| `cause` | **AGGREGATE** | upload only `{ code, errno }` (numeric error codes). NEVER `cause.path` (which is a file path). |
| `error` | **AGGREGATE** | upload only `{ type }`. NEVER `error.cause` (may contain stack traces with file paths). |
| `retryInMs` | **KEEP** | numeric |
| `retryAttempt` | **KEEP** | numeric |
| `maxRetries` | **KEEP** | numeric |

### Queue-operation records

| Field | Rule | Reason |
|---|---|---|
| `operation` | **KEEP** | enum (`enqueue` / `dequeue` / etc.) |
| `timestamp` | **KEEP** | numeric |

(No content in queue-operation records — safe to keep all fields.)

---

## Special rules

### The `<synthetic>` model placeholder

Records with `message.model === "<synthetic>"` are NOT real model calls. They MUST be excluded from cost calculation (per the schema notes). They CAN still be uploaded structurally — Burnd's dashboard could show "X synthetic interjections per session" — but they must never contribute to dollar totals.

### Hash format (for HASH-classified fields)

All hashes use:
```ts
function hashForUpload(value: string): string {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex').slice(0, 16);
}
```

Truncation to 16 hex chars = 64 bits of entropy. This is enough to make hashes unique within a user's data (millions of records would have a one-in-billions collision rate) while reducing the rainbow-table risk for short common inputs (e.g., a `cwd` of `c:\Users\Foo\Desktop\Projects\Bar` is short enough that with the full 256-bit hash + a known scheme, an attacker could brute-force it; truncated to 64 bits, brute-forcing across the realistic input space costs more than the value of the recovered data).

### Local-first principle

The parser must run the entire transformation **locally**, in the user's process, before any network call.

The user can run:
```bash
npx burnd --dry-run
```

...to see EXACTLY what will be uploaded, as JSON, without any network call ever happening. This is both:
- A trust feature (the user can verify, every time, before opting in)
- A debugging feature (the user can pipe the dry-run output to `jq`, `grep`, or `diff` to confirm the parser is doing what they expect)

The dry-run output goes to stdout. The actual upload (if the user runs `npx burnd upload` without `--dry-run`) goes over HTTPS to Firestore via Firebase Auth.

### Local cache, no upload

Some data (like `aiTitle`) is useful for the user's own dashboard but should never leave their machine. The parser maintains a **local SQLite cache** at `~/.burnd/cache.db` for this data. The cache is read-only by the dashboard (which connects to it via a tiny local HTTP server when running `npx burnd dashboard`), and is never synced to Firestore.

Local-only fields (in cache, never uploaded):
- `aiTitle`
- `cwd` (raw, before hashing)
- Any other field the user might want to see in their own dashboard but that has privacy implications if uploaded

### CI verification plan

The public parser repo will include a test suite that runs on every commit:

1. **Fixture-based redaction tests:** Load a fixture session file containing fake "secret" markers (e.g., `"SECRET_API_KEY=xxx"` in a Bash command, `"AWS_ACCESS_KEY_ID=AKIA..."` in environment dump output, `"-----BEGIN PRIVATE KEY-----"` in a file content). Run the parser. Assert that **none** of the secret markers appear anywhere in the upload payload (recursive string search).
2. **No-content-leak tests:** For each content-bearing field (`text`, `thinking`, `input`, `content`, `aiTitle`, `slug`, `gitBranch`, `cause.path`, `error.cause`, `snapshot.trackedFileBackups`), the test asserts that field NEVER appears in the upload payload.
3. **Hash format tests:** Assert all `HASH` fields produce 16-character hex strings.
4. **Schema completeness tests:** Assert that every field documented in `notes/jsonl-format.md` has an explicit rule in this spec. New fields added by future Claude Code versions will fail this test, forcing a parser update before they can leak.

These tests are non-negotiable. The parser repo's CI must run them on every PR. A red CI = no merge.

---

## Fields NOT yet covered (open for v0.2)

The schema notes call out several fields whose existence I'm only partially sure of. The v0.1 spec assumes the following defaults for them, but they should be explicitly resolved in v0.2 once Week 2 implementation hits them:

- **`caller`** field on tool_use blocks (NEW, undocumented elsewhere): assumed to identify the calling subagent. **Default rule: HASH** (it's likely an identifier we want to group by but not leak).
- **Other `entrypoint` values** beyond `claude-vscode`: assumed to be enum-safe to KEEP. Confirm by looking at CLI-generated sessions in Week 2.
- **Other `system.subtype` values** beyond `api_error`: assumed structural, KEEP.
- **MCP tool names** in `tool_use.name` (like `mcp__server__tool`): the server portion may leak company names. **Default rule: KEEP** (most MCP server names are public), but may need to HASH the server portion for some users. Revisit in v0.2.

When Week 2 parser implementation hits a field not covered here, the parser MUST fail loudly (not silently default to KEEP). New fields require an explicit anonymization rule before they can be in the upload payload.

---

## Self-review checklist (run before commit — completed 2026-04-11)

- [x] **Coverage:** Every field in `notes/jsonl-format.md` has a rule above OR is explicitly listed in "Fields not yet covered."
- [x] **Tier-3 fields:** All KEEP / HASH fields re-checked; downgraded `slug` and `aiTitle` to DROP after re-review.
- [x] **Content blocks:** Every place `text`, `thinking`, `input`, `content`, `signature` appears is marked DROP or AGGREGATE. None KEEP.
- [x] **Hash scope:** SHA-256 + 16-char truncation documented with reasoning.
- [x] **Promise consistency:** Each item in the "Burnd never uploads" list is enforced by at least one DROP/AGGREGATE rule below.
- [x] **Local-first verification:** `--dry-run` flag documented.
- [x] **CI test plan:** Documented with 4 test categories.
- [x] **Highest-risk field flagged:** `file-history-snapshot.snapshot.trackedFileBackups` is called out in the strongest possible language.

---

## Versioning

- **v0.1** (2026-04-11): Initial draft. Self-reviewed, committed, soft review queued for Garvit.
- **v1.0**: After Garvit reviews and approves (or after 7 days with no objection — the autonomy mandate's "stale queue" rule)
- **v2.x**: When Week 2 implementation hits the open fields and resolves them
