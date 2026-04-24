---
name: burnd-analyze-spend
description: Analyze your OpenClaw API spend — total cost, cost last 7 days, top cost leaks by model and provider, and concrete steps to reduce your bill. Use when the user asks about their AI spending, costs, budget, or which models are costing the most.
metadata:
  {"openclaw": {"emoji": "🔥", "requires": {"bins": ["node"]}, "install": [{"id": "node-burnd", "kind": "node", "package": "getburnd", "bins": ["npx"], "label": "Install Burnd CLI (npm)"}]}}
---

# Burnd — OpenClaw Spend Analyzer

Use this skill when the user asks about their OpenClaw API costs, spending, models, or budget.

## How to analyze spend

Run the following command and return its full output to the user:

```bash
npx getburnd@latest openclaw
```

This scans `~/.openclaw/agents/*/sessions/*.jsonl` locally and returns:
- Total spend all time and last 7 days
- Top models by cost (provider + model ID + dollar amount)
- Top cost leaks with dollar savings estimates
- Concrete fix steps for each leak

## Important notes

- Zero network calls — reads only local files on this machine
- Nothing is uploaded or transmitted anywhere
- Takes 5–15 seconds for large session histories
- If the user hasn't used OpenClaw yet, it will report "No sessions found"
- Legacy OpenClaw roots (`~/.clawdbot`, `~/.moltbot`) are checked automatically

## Example triggers

- "how much have I spent on AI this week?"
- "which model is costing me the most?"
- "analyze my OpenClaw spend"
- "what's my AI budget looking like?"
- "am I wasting money on expensive models?"

## After running

Present the output clearly. If leaks are found, ask the user if they want help implementing any of the fixes. The fix steps are actionable — most take under 10 minutes.
