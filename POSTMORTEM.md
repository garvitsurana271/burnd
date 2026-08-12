# Burnd: a postmortem

**Written 2026-08-12 by [Garvit Surana](https://garvit-surana.vercel.app).**

Burnd is a cost-control CLI for Claude Code. It works. It is on npm. It made $0.

This is the writeup of why. I am publishing it because the failure turned out to be more
instructive than the product, and because a project page that only shows the good numbers
is not worth reading.

---

## What got built

Between April and June 2026:

- A streaming JSONL parser for `~/.claude/projects/*.jsonl`, Claude Code's own session logs.
- A per-turn cost model covering Opus 4.1 through 4.7, Sonnet 4.5/4.6, and Haiku 4.5,
  including the tiered 5-minute and 1-hour cache-write rates.
- **10 detectors** — nine per-session, one cross-session — each producing a dollar
  estimate, an effort estimate, concrete fix steps, and where applicable a copy-pasteable
  `CLAUDE.md` patch.
- A local web dashboard (React, served from the CLI on `:4711`).
- A complete payment pipeline: Dodo Payments checkout, HMAC webhook verification against
  the Standard Webhooks spec, licence-key generation, and delivery via Resend.
- A VS Code extension, an OpenClaw plugin, and a second detector pipeline for OpenClaw
  sessions.

Roughly 6,300 lines of TypeScript, 51 tests, all green.

The engineering was not the problem. That is the uncomfortable part.

---

## The numbers

| | |
|---|---|
| Peak downloads | ~1,979 / 30 days (May 2026) |
| Downloads, 30 days ending 2026-08-09 | **79** |
| Downloads, 7 days ending 2026-08-09 | 33 |
| Lifetime revenue | **$0** |
| Paying customers | **0** |

And the number that actually explains it:

| Package | Downloads / 30 days |
|---|---|
| **ccusage** | **423,971** |
| claudekit | 1,053 |
| token-bleed | 314 |
| **getburnd** | **79** |

ccusage is free, MIT, reads the same files, runs entirely locally, and supports fifteen-odd
agent CLIs rather than one. It outships Burnd **5,367 to 1**.

I did not discover this ratio until August. I had been treating Burnd's problem as a
distribution problem — not enough posts, not enough outreach, the README needs work — for
about three months. It was never a distribution problem.

---

## What actually happened

### The vendor absorbed the product. Twice.

**2026-04-18 — Anthropic shipped `/usage`.** A native command that reports what your
current session costs. I told myself this was fine, that Burnd was cross-session where
`/usage` was current-session, that detectors were the real product. That was half true and
entirely beside the point: the category now had a free, bundled, zero-install answer with
the vendor's name on it.

**2026-07-25 — Anthropic deleted 80%+ of Claude Code's system prompt** for Opus 5 and
Fable 5, reported "no measurable loss on our coding evaluations," and began advising
developers to audit and *shrink* their own `CLAUDE.md` files. A `claude doctor` command
was announced to help people do exactly that.

`burnd fix` appends rules to `CLAUDE.md`. Its whole prescriptive payload is built on the
assumption that more configuration is better. That assumption was retired by the vendor,
and the tool to replace it ships in the box.

### The generalizable lesson

> **Any tool that is a thin read-layer over a vendor's own artifacts will be absorbed by
> that vendor.**

The `.jsonl` files Burnd parses are Anthropic's format, on Anthropic's disk, written by
Anthropic's client, and on Anthropic's roadmap. Every feature I could build on top of them
was a feature they could build faster, with better data access, and give away bundled.

I did not lose to a competitor. I lost to the platform I was built on, which is a
different and more predictable kind of loss. It was predictable in April. I did not
predict it.

The correct question was never "what has the vendor not built yet?" It was **"what is the
vendor structurally unable to build?"** A vendor cannot credibly ship a tool that says
their own model regressed this week, or that you should switch to a competitor's agent for
this repo, or that your team should drop seats. Those are the durable positions. I picked
one on the wrong side of that line and then optimized it for three months.

---

## The technical mistake I'm least proud of

Burnd's paid tier was gated by this, in a public MIT repository:

```ts
const SECRET = 'burnd-pro-v1-garvit-2026';

export function generateKey(email: string, monthStr: string): string {
  const payload = email.toLowerCase().trim() + ':' + monthStr;
  const hash = createHmac('sha256', SECRET).update(payload).digest('hex')...
}
```

and `pro keygen` was exposed as an ungated CLI subcommand. So the complete bypass was:

```bash
npx getburnd pro keygen you@example.com lifetime
npx getburnd pro activate you@example.com BURND-XXXX-XXXX-XXXX-XXXX
```

Free lifetime Pro, for anyone who read the source, which is the entire point of shipping
open source.

The underlying error is a real one and worth stating plainly: **HMAC is symmetric.** The
same key that verifies a signature also creates one. Shipping the verifier ships the
signer. You cannot enforce a paywall this way in code you also publish.

The correct construction is asymmetric: sign licences server-side with an Ed25519 private
key, ship only the public key in the client, verify locally. Verification still works
offline, which preserves the local-first guarantee, but forging a key requires the private
key, which never leaves the server. This is the same reason TLS certificates, app-store
receipts, and software licensing generally use public-key signatures rather than shared
secrets.

I knew the difference between symmetric and asymmetric cryptography when I wrote this. I
did not connect it to my own licence check, because I was thinking about the licence as a
*business* feature rather than a *security* one. That is the actual lesson: the threat
model is a property of where the code runs, not of which department asked for the feature.

I chose not to fix it. Burnd is no longer sold, so in version 0.1.0 the paywall was
removed entirely and all 10 detectors and every command became free. Repairing a gate on a
product with no customers would have been a worse use of the time than admitting the gate
was broken.

---

## The bug that hid behind a good intention

The pricing table had a deliberate safety net. Unknown model? Assume the most
expensive rate known, so the tool never under-reports what you're spending:

```ts
// Conservatively assume "as expensive as Opus" so we never undercount cost
// (better to alarm a user about a high estimate than to silently miss spend).
const FALLBACK_RATES = { input: 15.0, output: 75.0, /* ... */ };
```

That reasoning is sound. The implementation was not.

Anthropic shipped Opus 5, Fable 5, and Opus 4.8 in July 2026. None were in the
table. Every session after that date silently fell through to the legacy Opus 4.1
rate — $15/$75 against an actual $5/$25. Scanning my own history in August, burnd
reported **$41,243** of lifetime spend. The correct figure was **$17,791**. It had
been over-reporting by 2.3x for weeks, in the one number the entire product exists
to get right.

The lesson isn't "keep the pricing table updated." It's this:

> **A fallback that fires on every call is not a fallback. It's the primary code
> path, wearing a disguise.**

3,801 of 4,092 recent model calls hit that branch. The safety net had become the
floor, and nothing said so — no warning, no log line, no counter. A defensive
default that can't tell you it engaged isn't defensive; it just relocates the
failure somewhere harder to see. Had it emitted a single line the first time it
saw `claude-opus-5`, this would have been a five-minute fix in July instead of a
number I'd been quoting publicly for a month.

The fix in 0.1.0 is two-part: correct rates, and a fallback that announces itself
by name on every scan.

## What I'd do differently

1. **Check the category before building, not after shipping.** One `npm view` against
   ccusage in April would have reframed the entire project. The information was free,
   public, and one command away for four months.

2. **Pick a wedge the platform cannot occupy.** Not "what's missing" but "what is the
   vendor structurally disqualified from shipping."

3. **Treat vendor feature releases as data, not as noise.** `/usage` was a signal about
   the category's future in April. I read it as a positioning challenge to write around,
   and I spent a week rewriting landing-page copy instead of a day rethinking the premise.

4. **Ship the security review with the feature.** The licence bypass existed from the
   first paid release and survived every subsequent version because nothing prompted a
   review of it.

5. **Make every defensive default observable.** The pricing fallback, the licence check,
   and the anonymizer were each a correctness-critical branch with no way to tell whether
   it was firing. Two of the three turned out to be wrong for months. If a branch exists
   to protect a guarantee, it should be able to say how often it engaged.

---

## What it's for now

Burnd stays on npm and stays working. Every feature is free, there is no licence, and
nothing about your sessions leaves your machine. If you want to see what your Claude Code
sessions actually cost and where the waste is, `npx getburnd` still does that well.

The detector framework is the part I'd still defend: per-user baselines rather than
absolute thresholds, so a tool tuned on a $14,502/month bill still produces correct output
for someone spending $20. That idea was right. I attached it to the wrong market.

---

*Source: [github.com/garvitsurana271/burnd](https://github.com/garvitsurana271/burnd) ·
npm: [getburnd](https://www.npmjs.com/package/getburnd)*
