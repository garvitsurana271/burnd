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
