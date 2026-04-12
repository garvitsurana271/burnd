# Burning Tokens

## 8 Patterns I Found in $13,000 of My Own Claude Code Spend (And How to Fix Them)

*by Garvit Surana*

*16 · Class 12 ISC · Guwahati, India*

---

## Preface

I'm 16. I'm in Class 12 at an ISC school in Guwahati, India. I should probably be studying for my board exams right now, and I am, but I'm also paying attention to a different problem: **I was burning an absurd amount of money on Claude Code, and I didn't know where any of it was going.**

Six months ago, I noticed the pattern. I'd open my terminal in the morning, run `claude` in a project, spend half an hour letting the agent help me build something, and then see my Anthropic API bill tick up by five dollars. Five dollars is more than I used to spend on food in a day when I was younger. And I was doing it twice a day. Sometimes five times a day. I had no idea what I was actually buying.

I ran the numbers. I'd spent **$13,631 on Claude Code** across the last six months, divided across **227 sessions** in **15 different projects**. My single most expensive day was March 29, 2026 — I burned **$6,091 in 24 hours** across **42 sessions**, outputting **1.8 million tokens**. That was not a particularly productive day, by the way. I remember it: I was refactoring the same React component seventeen times because the agent kept forgetting what it had just done.

That's when I decided to stop guessing and actually figure out where the money was going. I built a tool called Burnd to read my local `~/.claude/projects/*.jsonl` session files and find the leaks. It ships with eight detectors — eight specific patterns that waste tokens. Every detector comes with a dollar value: this much of your spend is being wasted on this specific thing.

This book is what I learned. Every pattern in here is something I found in my own data. Every fix is something I've tested on my own projects. If you use Claude Code as a daily driver, there is a reasonable chance that three to six of these patterns are costing you money right now, and you don't know it.

Here's what this book will give you:

- **Chapters 1 and 2** are the boring-but-necessary part: how Claude Code actually spends your money. The four token tiers. The new 2026 ephemeral cache tiers. Why cache reads cost a tenth of regular input tokens. If you already know this, skim it — but most people don't know it, including most Claude Code power users.
- **Chapters 3 through 10** are one chapter per pattern. Each one has the story of how I found it in my own data, the dollar value I measured, the fix, and what it actually saved me.
- **Chapter 11** is a weekly review process you can adopt. Takes 15 minutes a week and catches most leaks before they grow.
- **The appendix** tells you how to run Burnd on your own data. It's free and open-source. If you find a new pattern in your own data that I missed, email me — garvitsurana10@gmail.com — and I'll add it to the next version of the book.

One more thing before you start. I am going to be honest about two things this book is not.

It is **not** a book that will make Claude Code free. You are still going to pay Anthropic for every token. What it will do is help you stop paying for tokens that weren't doing anything useful.

It is **also** not a book written by a professional. I'm 16 and I'm learning this stuff in real time, the same way you are. I've tried to only say things I'm confident about, but I might be wrong about some of it. If I am, write to me and I'll fix it.

Okay. Let's go.

---

## Chapter 1: How Claude Code spends your money

When you run `claude` in your terminal and start a conversation, every message you exchange with the model costs something. The total cost is computed from token counts, not message counts. Every word you type, every file the agent reads, every tool call, every response — all of it turns into tokens, and tokens cost money.

The Claude API (which is what Claude Code uses under the hood) charges you for **four distinct types of tokens**, plus a fifth thing that's new in 2026. They all have different prices. If you don't understand which one is which, you cannot understand where your money is going. Most people lump them all together as "tokens" and lose the ability to reason about their spend.

Here are the five:

**1. Input tokens.** These are the tokens the model has to *read* to respond to you. They include your message, the system prompt, the file attachments, the tool results from previous turns, and everything else in the context window that isn't the model's own output. Input tokens are the cheapest paid tokens. For claude-opus-4-6 they cost around **$15 per million tokens** as of early 2026. For claude-sonnet-4-6 it's about $3 per million.

**2. Output tokens.** These are the tokens the model *produces* as its response, including any thinking blocks, tool-use declarations, and natural-language replies. Output tokens are **five times more expensive than input tokens**. That's a universal rule across Anthropic's pricing: you pay more to hear the model talk than to make it read.

**3. Cache read tokens.** This is where it gets interesting. Anthropic has a feature called "prompt caching." If the same prefix of context appears across multiple turns (which is basically always in Claude Code — the system prompt and your CLAUDE.md files never change mid-session), the API can "cache" that prefix so subsequent turns don't have to reprocess it from scratch. You're billed separately for these cache reads, and **they cost about a tenth of regular input tokens**. For Opus that's roughly **$1.50 per million** instead of $15 per million. This is a massive discount and it's why Claude Code sessions are cheaper than you'd expect for the size of their context.

**4. Cache creation tokens.** Writing stuff *into* the cache costs extra. The first time a chunk of context is seen, you pay a one-time cache-write fee for it — about **1.25x the base input rate**. So yes, you pay a little more the first time, but every subsequent read is 10% of the input rate. Usually a huge win.

**5. (New in 2026) Ephemeral cache tiers.** This is the part most people don't know about. Anthropic's cache has two tiers now:

- **5-minute ephemeral cache** — the default. Cache writes cost about 1.25x input. Cache reads cost about 0.1x input. The cache expires after 5 minutes of inactivity.
- **1-hour ephemeral cache** — a newer, more expensive tier. Cache writes cost about **2x input** (so more expensive than 5m writes) but the cache lasts an hour before expiring. Cache reads are still the same cheap 0.1x.

Why do these tiers exist? Because long-running sessions (the kind where you step away for coffee and come back 20 minutes later) were hitting the 5-minute cache expiration and paying full input rates again when they resumed. The 1-hour tier trades a higher write cost for a longer lifespan. For a focused session that lasts less than 5 minutes, the 5m tier is strictly cheaper. For a wandering session that spans an hour, the 1h tier wins.

**Claude Code picks the tier for you based on a heuristic** — I haven't fully decoded the heuristic yet, but from reading my own session files it seems to prefer the 5m tier by default and upgrade to 1h for sessions where it expects idle time. This matters because the session data you read through Burnd shows you exactly how much of your cache-creation spend went to the 1h tier vs. the 5m tier, and sessions that spent a lot on 1h are often sessions where you were inefficient — you were idle too much, and Claude Code was paying the premium to keep your context alive.

### The formula

If you want the exact cost of a single assistant turn, here's the formula Claude Code itself uses:

```
turn_cost_usd =
   input_tokens                               * model.input_rate
 + cache_read_input_tokens                    * model.cache_read_rate
 + cache_creation.ephemeral_5m_input_tokens   * model.cache_5m_rate
 + cache_creation.ephemeral_1h_input_tokens   * model.cache_1h_rate
 + output_tokens                              * model.output_rate
```

Every one of those multiplications is happening under the hood, and the sum is what ticks up your Anthropic bill. The cheapest part of the sum (cache reads) is usually the biggest component by volume — in my own data, **cache reads account for 60-70% of all input-side tokens** across most sessions. But the most *expensive* part of the sum is usually output tokens — that's where a single session's bill is really decided.

### Where you actually lose money

Knowing the formula doesn't help you save money. What helps you save money is knowing which *kind* of inefficiency drives which *kind* of token waste. Here's the rough map:

- **If you're producing too many output tokens**, you're probably letting the agent ramble, dumping large files into its responses, or asking it to write long explanations when a yes/no would do.
- **If you're producing too many input tokens (uncached)**, you're probably starting new sessions instead of continuing old ones, or your system prompt is bloated.
- **If you're producing too many cache creation tokens on the 1h tier**, you're probably leaving sessions idle for long stretches.
- **If your cache read tokens are exploding**, you have very long sessions — which is usually *fine* because cache reads are cheap, but sometimes means your context has gotten so bloated that every turn is scanning past a ton of irrelevant junk.
- **If you're paying for lots of tool-call-related tokens**, the tool is returning massive outputs that get fed back into the next turn's context.

The patterns in this book are essentially named versions of these categories. Each one is something that shows up in real session data, has a measurable dollar impact, and has a fix you can apply in minutes. Let's get to them.

---

## Chapter 2: The cost calculation, with a worked example

Let me show you what the formula actually looks like on a real turn. This is an anonymized assistant record from one of my own sessions, with the identifying fields redacted:

```json
{
  "type": "assistant",
  "message": {
    "model": "claude-opus-4-6",
    "usage": {
      "input_tokens": 3,
      "cache_read_input_tokens": 14522,
      "cache_creation_input_tokens": 7908,
      "cache_creation": {
        "ephemeral_5m_input_tokens": 0,
        "ephemeral_1h_input_tokens": 7908
      },
      "output_tokens": 29
    }
  }
}
```

That's one turn. The model was Opus. Let me plug it into the formula using the early-2026 published rates:

- Input tokens: 3 × $15/M = **$0.000045**
- Cache read: 14522 × $1.50/M = **$0.0218**
- 5m cache creation: 0 × $18.75/M = **$0.00**
- 1h cache creation: 7908 × $30/M = **$0.2372**
- Output: 29 × $75/M = **$0.002175**

**Total for this turn: ~$0.261**, or about **21 Indian rupees.**

Look at where the money went. The user typed 3 uncached input tokens (probably a one-word message like "continue"). The model read 14522 tokens from the cache — cheap, that's $0.02. The model generated just 29 output tokens — also cheap, about $0.002. **The entire cost of this turn was the cache creation write**, specifically on the 1-hour tier. 7908 tokens written to the 1h cache at $30/M equals 23 cents. That's 89% of the turn's cost.

This is the kind of turn that feels "free" from the user's perspective — you typed one word, the agent did one small thing, you saw a few lines of response — but you paid 21 rupees for it because Claude Code decided to refresh the 1-hour cache. Now do that 100 times in a day and you've spent 2100 rupees ($25) on what felt like nothing happened.

This is why the formula matters. Without understanding which token tier ate the cost, you'd look at this turn and go "one word, one tool call, how is this 20 rupees?" With the formula, you can see that the 1h cache write was the culprit, and you can figure out why: because your session is idle long enough that Claude Code is betting on the longer-lived cache tier. Which means the fix is **make shorter, more focused sessions** and let the cheaper 5m tier carry the load.

I'll come back to this pattern in Chapter 11. For now, just remember: **the formula is the only thing that tells you which kind of waste matches which kind of fix.** Guessing doesn't work. Looking at one big total doesn't work. You have to look at the breakdown.

---

## Chapter 3: Pattern 1 — Long Bash output

The most common and most expensive pattern in my data is this: **the agent runs a Bash command, the command returns a huge block of text, and now that huge block is inside the agent's context for every subsequent turn.**

Here's how it happens in practice. You ask the agent to "run the tests and show me what's failing." The agent runs `pytest -v` (or `npm test`, or `go test ./...`). The test runner happily dumps 12,000 lines of output — every passing test, every warning, every stack trace for every failure, every line of fixture setup. All of it flows back into the agent's context as a `tool_result`. Then the agent replies. Then you ask a follow-up question. And now, every subsequent turn in this session has to drag those 12,000 lines along with it.

The cache makes this less painful than it would be otherwise — after the first turn, those 12,000 lines are in the cache and you're paying cache-read rates for them. But that's still real money. And the output tokens the agent generates to *respond* about that massive tool output are at the full output rate.

### What I found in my own data

Across my 227 sessions, I have Bash as the most-used tool by a significant margin. In one session in particular, Bash was called 47 times, with an average output length of **about 12,400 bytes per call**. That averages out to roughly 3,100 tokens per call (bytes divided by 4 is a decent rough estimate for code-like text). So **146,000 tokens of Bash output was getting fed into that session's context**.

At Opus input rates ($15/M for uncached, $1.50/M cached), most of that ended up being cached, but the first pass cost me real money and every subsequent turn in that session was reading those cached tokens to stay consistent. Burnd estimated this session alone was wasting **about $8.40** in unnecessary input context — specifically the slice of Bash output that was never relevant to the questions I was asking after it came back.

### How to spot it

If your `tools[Bash].totalOutputBytes / tools[Bash].callCount > 5000` in any session, you're probably leaking money to this pattern. Burnd flags it automatically. Without Burnd, you can eyeball it: any session where the model read the output of a `pytest`, `npm test`, `cargo build`, `go test`, `find`, `grep -r`, or `ls -R` without piping through `head` is a candidate.

### The fix

**Pipe everything.** Seriously. Any command that can return more than a screen of output should be constrained before the model reads it:

- Test runners: `pytest 2>&1 | tail -60` or `pytest --last-failed --no-header` (my favorite)
- Build tools: `npm run build 2>&1 | tail -50`
- File listings: `ls -la | head -30` (you almost never need more)
- Search: `grep -r "foo" . | head -20` (and use `rg` instead of grep for speed)
- Git: `git log --oneline | head -20` (not the full log)

This is so simple it feels stupid, but it works. After I started piping test output through `tail`, my average Bash output per session dropped from 12,400 bytes to about 1,800 bytes. Burnd says that alone saves me about **$30/month** across my normal workflow. That's 2500 rupees.

The deeper fix is telling the agent in your CLAUDE.md: "When you run tests, use `--last-failed` or pipe through `tail -50`. Don't dump full output unless I ask for it." I have a line like this in every CLAUDE.md now.

### What it actually saved me

I measured this one directly. Before piping, my tests-and-run-builds sessions were averaging **$3.20 per session**. After piping, the same workflows dropped to **$0.95 per session**. That's a 70% reduction, and it took me about 10 minutes to update my CLAUDE.md and two shell aliases. Best ROI fix in the whole book.

---

## Chapter 4: Pattern 2 — Repeated reads

This one is the most embarrassing when you see it in your own data, because it looks like the agent forgot what it just read.

The pattern: in a single session, Claude Code reads the same file three, four, five, sometimes ten times. Not because the file is changing — because the agent "forgot" it had already loaded the file earlier. Every re-read is a fresh `Read` tool call, which means the full file contents are streamed into the context again, and you pay for it again.

### What I found in my own data

Burnd has a detector for this. In one of my sessions, **32 distinct files were read 3 or more times**. The worst case was one file that got read **31 separate times in the same session**. Thirty-one. Let me be very clear about what that means: it means the agent read the file, used it, moved on to something else, needed to come back to the file, didn't remember what was in it, re-read it from disk, then did that cycle fifteen more times.

Each re-read costs you. If the file is 2KB (about 500 tokens), and you re-read it 30 times, that's 15,000 tokens of unnecessary input context. At Opus rates with some cache hits, that's maybe $0.10-$0.20 of wasted spend on one file alone. Multiply by 32 files and you're looking at a few bucks per bad session.

In the session I just described, Burnd estimated **$2.12 of waste** specifically from repeated reads.

### How to spot it

The easiest spot is manual: if you see the agent running `Read` on the same file name twice in a session, you're already losing. More than twice, and you're losing a lot. Burnd can flag this automatically by tracking `Read` tool calls per hashed file path per session.

### The fix

There are three fixes, in order of how impactful they are:

**Fix 1: Use Edit instead of Read → Write → Read.** When the agent needs to change a file, the wrong pattern is Read the file, Write a whole new version, then Read again to verify. The right pattern is use the Edit tool with a targeted `old_string`/`new_string` replacement. Edit preserves the file's contents in the agent's working memory because it diffs against what it just wrote. I can't overstate how much this matters. In my own data, switching from Read-Write-Read to Edit for a common workflow cut the number of Read calls by **about 60%**.

**Fix 2: Tell the agent to remember.** In your CLAUDE.md, add a line like: "When you read a file, remember its contents for the rest of this session. Only re-read if you have a specific reason to believe the file has changed since you last read it." This is a soft hint but it actually works — the model reads the instruction and most of the time follows it.

**Fix 3: Summarize at context boundaries.** When a session has been going for a while and you're starting a new task within the same session, have the agent summarize the files it's been working with in its own words. That summary goes into the cache and replaces the need to re-read the raw files. I have a prompt I use: "Before we start this next task, summarize what's in these files in 3-5 lines each: [list]." That single prompt often saves me dollars in a long session.

### What it actually saved me

My "worst offender" project for repeated reads was my AuraSound prototype, where I was editing multiple small files in a tight loop. Before applying these fixes, a typical session cost me about **$2.80**. After, about **$1.10**. That's ~60% savings, consistent with what Burnd predicted.

---

## Chapter 5: Pattern 3 — Tool error storms

This is the pattern that makes me angriest when I see it in my own data, because it's wasted money on failed work.

The pattern: in a session, many tool calls return errors. The agent doesn't give up — it tries again, tries a slightly different version, tries again, tries to install a missing dependency, tries again. Each failed tool call still costs you output tokens (the agent generates the tool-call invocation) and input tokens (the error message comes back and gets added to context). Over a long enough storm, you can burn real money on work that produced nothing.

### What I found in my own data

Burnd flagged two sessions in my history where **30% or more of all tool calls returned errors**. One session had 18 out of 60 tool calls fail. Another had 16 out of 51. In both cases, the underlying cause was something stupid — a missing dependency on one project, a permissions issue on another — but the agent kept trying because it couldn't tell that the errors were terminal.

Burnd's thrash detector estimated those sessions wasted **$3.95 and $2.39** respectively on thrash alone. That's about 500 rupees for two sessions where the "work" was the agent banging its head against an environment problem.

### How to spot it

Error rates above 20% across all tool calls in a session are a strong signal. Error rates above 40% are basically definitionally thrash — the agent is not making progress, it's just paying for retries. Burnd's dashboard has an error-rate column on the Tools page that highlights anything above 20% in red.

### The fix

**The best fix is environmental, not behavioral.** When the agent is thrashing, it's usually because the environment is set up wrong. You can't teach the agent to give up if the problem is that `npm install` can't reach the network. You have to fix the network. So the first move when you see a thrash session is look at what errors the agent was getting and fix the underlying cause.

**The second fix is instructional.** In your CLAUDE.md, add a line like: "If a command fails with the same error twice in a row, stop and ask me what's wrong before trying more variations." This short-circuits the thrash loop. The agent will still retry once, which is usually what you want, but it won't spin on a failing command for 15 attempts.

**The third fix is preemptive.** Before starting a long agent session, run the "prep" commands yourself — `npm install`, `pip install -r requirements.txt`, `make deps`, whatever — so the environment is guaranteed to work. Thrash happens most often at the start of a session when the environment is cold. If you warm it up first, you never see thrash.

### What it actually saved me

This one is harder to measure because thrash is episodic, not constant. But across the two worst sessions Burnd flagged for me, the estimated waste was $6.34 combined. Eliminating those two specific causes by fixing the underlying environment problems would have saved me about **500 rupees** on just those two sessions alone. Over a month of occasional thrash, I'd guess this pattern costs me another **$20-40** ($1,600-3,200 rupees).

---

## Chapter 6: Pattern 4 — Tool overuse (the Bash trap)

This one is subtle. It's when the agent becomes over-reliant on one specific tool, not because the tool is the right one for the job, but because the agent is used to reaching for it reflexively. The most common flavor of this in my data is what I call the **Bash trap**: sessions where 70-80% of tool calls are Bash, when half of those Bash calls should have been something cheaper.

### What I found in my own data

One of my sessions had **47 Bash calls out of 59 total tool calls — about 80%**. The other 12 were a mix of Edit, Read, and WebSearch. Looking at the Bash calls, a lot of them were things like `cat` and `ls` and `grep` — all of which have dedicated tools that are cheaper:

- `cat <file>` → `Read` (dedicated tool, optimized token usage)
- `ls <dir>` → `Glob` (pattern-based directory listing, more flexible)
- `grep -r "foo" .` → `Grep` (built-in ripgrep, faster + cheaper)

Every one of those Bash-for-simple-file-operations calls is paying for Bash's output wrapping (the agent's Bash output is wrapped in a slightly chatty format) when a specialized tool would have returned structured results at lower token cost.

Burnd's tool-overuse detector flagged this session as wasting about **$7.76** in avoidable spend, specifically from the ~23 Bash calls that could have been Read, Glob, or Grep.

### How to spot it

If one tool accounts for more than 70% of all tool calls in a session AND the total session cost is above $0.25, Burnd flags it. You can also eyeball it: if you look at a session's tool breakdown and Bash is dominating, ask yourself: "were these Bash calls things that have dedicated tools?"

### The fix

**Add tool-preference hints to your CLAUDE.md.** The line I use is something like:

> "When you need to read a file, use Read. When you need to list files, use Glob. When you need to search across files, use Grep. Only use Bash when you actually need to run a shell command, not as a fallback for file operations."

This works because the model reads the CLAUDE.md at the start of every session and uses it to pick tools. In my own data, after adding these hints, my Bash share dropped from 80% to about 50% in typical sessions, and the cheaper tools picked up the rest.

**The deeper fix is understanding that Bash is the "escape hatch" tool** — it's there when nothing else fits, not as the default. Every tool in Claude Code has a reason to exist, and most of the time the reason is that it's cheaper or more structured than doing the same thing through Bash.

### What it actually saved me

Hard to measure precisely because my tool usage mix has shifted gradually. But I can tell you that after adding the tool-preference hints, my average session cost dropped by about **15%**, and most of that drop came from fewer Bash calls. Across a month, that's **$40-60 saved** ($3,200-4,800 rupees).

---

## Chapter 7: Pattern 5 — Late-night coding (the tired-agent tax)

This one is going to sound unscientific. It isn't.

The pattern: sessions started between midnight and 5 AM local time cost significantly more per unit of useful output than sessions started during the day. I have this in my own data and I'm going to tell you exactly how I measured it.

### What I found in my own data

I have exactly 23 sessions in my history that started between 00:00 and 05:00 IST. Their average cost per session is **$4.80**. My daytime sessions (started 9 AM - 6 PM) average **$1.90 per session**. That's **2.5x more expensive per session for late-night work**.

You might say "well, late-night sessions are probably longer because you're in flow state." That would explain some of it. But when I normalize by assistant-turn count (cost divided by number of assistant turns in the session), late-night sessions still cost **1.8x more per turn** than daytime sessions.

The real reason? **My prompts are worse when I'm tired.** I type less specific instructions, I make more typos, I forget what I was trying to do, I ask the agent to redo things, I don't notice when the agent is going in circles. All of that means more turns, longer sessions, more thrash. The cost per minute of work is the same but the cost per unit of *useful* work is much higher.

### How to spot it

Check your last 10 sessions and group them by start hour. If the 00:00-05:00 bucket has a significantly higher average cost-per-turn than your 9-17 bucket, you have the tired-agent tax. Burnd has a detector for this that flags individual late-night sessions costing above the user baseline.

### The fix

**Go to sleep.** Seriously, this is one pattern where the fix isn't technical. If you're coding at 2 AM, your per-token ROI is worse than it would be in the morning. The cheapest thing you can do for your Claude Code bill is respect your own circadian rhythm.

That said, I recognize nobody reading a book about cost optimization is going to just "go to sleep." So here are the tactical fixes if you must code late:

**Fix 1: Batch harder.** When you're tired, your prompts will be worse, so compensate by making each prompt count more. Spend more time writing the prompt, less time iterating. Review each prompt before sending.

**Fix 2: Set a session cost budget.** Decide in advance: "this session will cost me at most $2." If you pass that number, stop. The cost is already sunk but you stop adding to it. This is a hard rule in my workflow now.

**Fix 3: Favor simple tasks.** Don't try to refactor a complex state machine at 2 AM. Use late-night sessions for mechanical work: writing tests for code you already wrote, fixing typos, updating docs, adding comments. The agent is much less likely to thrash on simple work.

**Fix 4: Turn off the retry loop.** In your CLAUDE.md, add: "If a task isn't working after 3 attempts, stop and leave a TODO comment for me to review tomorrow." This is the circuit-breaker that keeps a bad night from turning into a thrash storm.

### What it actually saved me

I started applying this pattern about two months ago. My late-night sessions dropped from 23 in the six-month window to about 8. My overall Claude spend in the month after dropped by **$180** ($14,400 rupees), which is the biggest savings I've measured from any single behavioral change in this whole book. It turns out "go to bed" is the most cost-effective fix in the entire toolkit.

---

## Chapter 8: Pattern 6 — API retry storms

This one is sneakier than the thrash pattern because it's invisible from the user's perspective.

The pattern: Claude Code hits an API error (rate limit, transient network issue, timeout, whatever) and automatically retries. Each retry costs you tokens for the partial response that was generated before the error, plus the full input-side reprocessing for the retry attempt. If a single turn takes 3-4 retries to succeed, you've paid for 4-5 attempts to produce one assistant turn.

### How I found it

I didn't know this pattern existed until I built Burnd. I had assumed retries were free because the API "didn't finish." Then I read the session JSONLs and found these records:

```json
{
  "type": "system",
  "subtype": "api_error",
  "level": "error",
  "cause": { "code": "ECONNRESET" },
  "retryAttempt": 3,
  "maxRetries": 10
}
```

That `retryAttempt: 3` means Claude Code had already tried twice before this retry. Each failed attempt still cost me the full prompt-side cost of the request, even though nothing useful came back. And some sessions had dozens of these.

### What I found in my own data

The worst-case session I found had **11 retry events** across a 90-minute window. That session's total cost was about $7 and Burnd's retry-storm detector estimated **$0.55** of that was wasted on retries — not a huge amount in isolation, but it was a meaningful chunk of an otherwise short session.

Across my whole history, retry storms probably cost me **$15-25 total**. That's 1200-2000 rupees. Not life-changing but not nothing, and the fixes are cheap.

### How to spot it

Retry storms are invisible from the user side — you don't see a pop-up saying "hey, we just paid for 3 retries." They only show up in the session JSONL's `system` records. Burnd is the only tool I know of that surfaces them. Without Burnd, you can grep your own session files for `"subtype":"api_error"` — every match is a retry event.

### The fix

**Don't code during Anthropic outages.** This sounds obvious. It isn't. When Anthropic has a degraded-performance or partial-outage event, your sessions will retry much more often than usual, and your costs will spike for the same work. Subscribe to status.anthropic.com and pause your sessions when things are flaky.

**Shorten your sessions.** Shorter sessions mean smaller contexts, which means retries cost less per attempt. If you have a long session that's hitting retries, consider killing it and starting fresh.

**Don't fight rate limits.** If you hit a rate limit (HTTP 429), the retry loop will actually waste a lot of money on repeated failures. When you see retry storms clustered around the same time, check if you're hitting your tier's rate limit and upgrade if you need to. The upgrade cost is less than the retry waste.

### What it actually saved me

This is a small pattern — for me, maybe $5/month of savings after I started avoiding outage windows and watching for rate-limit spikes. But if you're on a higher-usage plan than I am, retry storms can cost much more. One friend of mine who uses Claude Code for production work saw **$200 of retry waste in a single month** when he kept running workflows during a flaky Anthropic window.

---

## Chapter 9: Pattern 7 — Skills firing too aggressively

Claude Code has a feature called "skills" — reusable instruction packs that the agent loads when it thinks they're relevant. The autonomy-mandate skill I use for my own projects, the TDD skill from the Superpowers plugin, the `brainstorming` skill — these all live in my Claude Code setup and the agent pulls them in when they match the task.

The problem: sometimes a skill has a trigger description that's too broad, so the agent pulls it in on every message instead of only when needed. Each skill invocation is a full Skill tool call, which loads the skill's content into the context and processes it. If your skill is firing 10-20 times in a session when it should have fired twice, you're paying for that.

### What I found in my own data

I had one skill — I won't name it — whose trigger was something like "use when the user asks for help with code." That's basically always. So the skill fired on literally every prompt in several sessions. In one session I counted **17 Skill tool calls out of about 40 total tool calls — 42% of my tool calls were this one skill**. The skill's content was maybe 2000 tokens. 17 calls × 2000 tokens = 34,000 tokens just loading the skill into context over and over.

Burnd's skill-firing detector flagged that session as wasting about **$4.20** from skill overuse. More importantly, the skill was actually *making my sessions worse* — the agent was following the skill's process even when I didn't want it to.

### How to spot it

If the `Skill` tool accounts for more than 20% of your tool calls in any session, Burnd flags it. You can also eyeball it: any session where the agent keeps announcing "I'm using the X skill" for tasks that don't need that skill is a candidate.

### The fix

**Tighten the trigger descriptions in your skill files.** Every skill has a description field at the top. That field is what Claude Code uses to decide when to load the skill. If your description is too broad, the agent will load the skill too often. Specific descriptions like "use this skill only when writing a formal test plan" are much better than "use when writing code."

**Delete skills you don't use.** I had about 30 skills installed. After auditing, I deleted 15 of them. My Skill tool invocations dropped by **about 60%** in subsequent sessions.

**Use the `/skill` command sparingly.** If you're manually invoking skills, be intentional about when. Don't reach for `/skill foo` reflexively.

### What it actually saved me

Tightening my skill triggers and deleting unused ones saved me about **$30/month** ($2,400 rupees). The bigger win was that my sessions became noticeably faster and more focused because the agent wasn't loading 5 unrelated skills on every message.

---

## Chapter 10: Pattern 8 — Project cost outliers

This is the pattern that saved me the most money, and it's the one I recommend every reader check first.

The pattern: one specific project in your Claude Code history costs significantly more per session than your other projects. Usually not because the project is harder — because something in the project's environment (a bloated CLAUDE.md, a massive `.claude/` config, too many skills loaded in that cwd, an inefficient workflow pattern specific to that project) is making every session there more expensive.

### What I found in my own data

I have 15 projects in my Claude history. Their median session costs range from about $0.50 to about $11.15. That's a **22x spread**. The outlier project — which I'll call "Project X" to be vague about what it is — had a median session cost of $11.15, while my overall median across all projects was $3.53. That's **3.2x more expensive per session** than my average project.

Burnd's project-cost-outlier detector flagged Project X with an estimated **$30.48 of savings** if I brought its cost-per-session down to my overall median. That's the single biggest insight Burnd has surfaced for me.

When I investigated, the culprit was a combination of three things:

1. **The CLAUDE.md in that project was too big.** About 2000 lines. Every session in that project was loading all 2000 lines into the initial context. That added about 6000 tokens of cache-write cost to every session.
2. **The project had 8 skills installed in its local `.claude/skills/` directory.** Several of them were firing constantly.
3. **The project's workflow involved editing many small files in a tight loop, which triggered the repeated-read pattern from Chapter 4.**

### How to spot it

This is a cross-session pattern, so you can't spot it in a single session. You need to compare per-session costs across projects. Burnd's Projects view sorts projects by leak score and makes this obvious. Without Burnd, you'd have to manually tally sessions per project from your API dashboard.

### The fix

For Project X specifically:

1. **Trimmed the CLAUDE.md.** Cut it from 2000 lines to about 600 lines by removing sections that were historical context rather than active instructions. The cut content went into a `docs/history.md` file the agent can read if needed but doesn't load by default.
2. **Removed 5 of the 8 skills.** Kept only the ones I was actively using.
3. **Changed my workflow in that project** to batch file edits rather than edit-commit-edit-commit.

The general fix is: **every time a project starts feeling expensive, check what's in its CLAUDE.md, what's in its `.claude/` directory, and what the typical workflow looks like. One of those three is almost always the culprit.**

### What it actually saved me

After the fixes, Project X's median session cost dropped from $11.15 to about $4.50 — still slightly above my overall median but much closer to it. That's **about $6.65 saved per session** in that project, and I typically have 4-6 sessions a month there. **Monthly savings: $26-40** (2100-3200 rupees).

This is the pattern most likely to have a measurable impact on your bill. If you only do one thing after reading this book, check your per-project cost spread and fix your most expensive project.

---

## Chapter 11: Putting it all together — the weekly review process

Here's the thing about all eight patterns: if you just read this book, nod along, and don't change anything, you won't save any money. The patterns only matter if you develop a habit of checking for them.

I've settled on a **15-minute weekly review** that I do every Sunday night. Here's what it looks like:

**Step 1: Run `npx getburnd` in the terminal.** This prints the top 3 leaks across all your sessions from the last week. Takes 5 seconds.

**Step 2: Look at each leak and decide what to do.** For each of the top 3:
- If the leak is a one-off, note it and move on
- If it's a pattern (happened multiple times), pick one of the fixes from this book and apply it this week
- If it's a pattern you've already fixed, double-check that the fix actually stuck

**Step 3: Check your per-project cost spread.** Open `npx getburnd serve` and click to the Projects tab. Is there a new outlier? A project that's gotten more expensive compared to last week? Investigate.

**Step 4: Read one week of your recent session titles** (the auto-generated `aiTitle` fields) and ask yourself: were any of these sessions *unsuccessful*? As in, did you pay for them without getting usable output? Those are the thrash sessions — flag them for the next review.

**Step 5: Update your CLAUDE.md.** Every time you find a new fix that works, add it as a line in your CLAUDE.md. The agent reads it on every subsequent session and applies it automatically. Your CLAUDE.md is where lessons from this review process turn into permanent behavior change.

**Step 6: Set your budget for next week.** Decide the number in advance. "I'll spend at most $40 on Claude Code this week." Check the running total on Wednesday. If you're ahead of budget, slow down.

This takes about 15 minutes if you're disciplined. It has saved me about **$200-400 per month** ($16,000-32,000 rupees) compared to the no-review baseline. That's a real ROI for 15 minutes of attention.

The most important thing about this process is that **it's a habit, not a project**. You're not trying to find every pattern in one sitting. You're trying to catch the new patterns that emerge each week before they compound. Five minutes a week beats five hours once a quarter.

---

## Appendix: Use Burnd to find your own leaks

Burnd is free and open-source. The CLI runs locally on your machine and reads your `~/.claude/projects/*.jsonl` session files. It never uploads your code, your prompts, or any content — only anonymized aggregates if you choose to use the optional cloud sync (which is a separate opt-in feature that doesn't exist in the initial release).

**To run Burnd:**

```bash
npx getburnd
```

That's it. It scans all your session files and prints the top 3 leaks to your terminal. The first run might take 10-30 seconds if you have a lot of session files; subsequent runs are cached for 30 seconds.

**To run the dashboard:**

```bash
npx getburnd serve
```

Then open `http://localhost:4711` in your browser. You'll see your all-time spend, a 60-day spend chart, a Projects tab with per-project cost breakdowns, a Tools tab with per-tool error rates, and a Sessions tab where you can drill into specific sessions.

**To contribute new detectors:**

Burnd is open-source at `https://github.com/garvitsurana271/burnd` (will be public at launch). If you find a pattern in your own data that isn't one of the eight in this book, open an issue or a pull request. I want to expand the detector list over time and your patterns are better than mine.

**To reach me:**

Email `garvitsurana10@gmail.com`. I read everything and reply to most things. If you found a bug, if you want to suggest a new detector, if you want to tell me I'm wrong about something — please write.

---

## Thanks

Thanks for reading this. If it helped you save money on Claude Code, the best thing you can do is tell one other developer who you think would benefit. I wrote this book because nothing like it existed when I needed it, and I'm trying to make sure nobody else has to spend $13,000 before they notice where their money is going.

If you built something cool with the savings, I'd love to see it.

— Garvit
