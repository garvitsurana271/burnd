# Twitter Thread — Burnd launch

**Account:** @GarvitSura5238 (temporary throwaway handle — in bio, mention you're upgrading)
**Recommended post time:** 11:30 AM IST on a weekday (best for India dev timeline + US East Coast morning)
**Each tweet below is ≤280 chars. Copy-paste one at a time.**

---

## Tweet 1 (the hook — leads with age + dollar number, the 2 most potent social proofs)

```
i'm 16, in class 12 in guwahati india, and six months ago i noticed i was spending more on claude code than my mom spent on groceries

so i built a tool to find the leaks. in my own data, i found $76 of waste i didn't know about

here's what i learned 🧵
```
(259 chars)

---

## Tweet 2 (the number drop — make the reader feel the scale)

```
the numbers on my own claude code spend, which is what made me build this:

$13,631 all-time, across 6 months
227 sessions in 15 projects
biggest day: $6,091 in 24 hours, 1.8M output tokens

i had no idea any of this was happening until i read my own session files
```
(281 chars — trim the last word if needed: drop "own")

Safer 280-char version:
```
my own claude code spend, 6 months:

$13,631 all-time
227 sessions, 15 projects
biggest day: $6,091 in 24 hrs, 1.8M output tokens

i had no idea any of this was happening until i read my session files. the waste was hiding in plain sight
```
(267 chars)

---

## Tweet 3 (the tool)

```
so i built burnd

it reads your ~/.claude/projects/*.jsonl files locally and finds 8 kinds of leaks:

→ long bash output bloating context
→ files being re-read 30× a session
→ tool error storms
→ bash-trap tool overuse
→ late-night tired coding
→ api retry storms
→ aggressive skill firing
→ project-cost outliers
```
(277 chars)

---

## Tweet 4 (the insight — make them curious about their own data)

```
the top leak in my own data was a project costing 3.2× more per session than my overall median

burnd estimated i was wasting $30 just on that one project (bloated CLAUDE.md, 8 local skills all firing, repeated-read loop)

i fixed it in 20 minutes. measurable savings every week since
```
(286 chars — TRIM)

Trimmed version:
```
top leak in my own data: one project costing 3.2× more per session than my overall median

burnd estimated $30 of waste there (bloated CLAUDE.md, 8 local skills firing, repeated-read loop)

i fixed it in 20 min. measurable savings every week since
```
(258 chars)

---

## Tweet 5 (the visual — this tweet should attach a dashboard screenshot)

```
every leak has a dollar value. every fix has steps. everything runs locally — burnd never sees your code

(screenshot of the dashboard showing real leak detection with dollar amounts on my own data)

this is running on my own $13k — no cherry-picked demos
```
(268 chars)

**Attach: a screenshot of http://localhost:4711/app/insights showing real data. To capture: run `npx getburnd serve`, open the browser, take a screenshot of the Insights page.**

---

## Tweet 6 (the ebook — primary revenue CTA)

```
i also wrote a book about it

"burning tokens: 8 patterns i found in $13k of my own claude code spend"

7,400 words · 11 chapters · real data · tested fixes

₹399 (≈$4.50) · pay via UPI · first 50 copies at founding price then it goes up to ₹599
```
(271 chars)

---

## Tweet 7 (the install command + link)

```
if you use claude code at all, it's worth checking your own data:

$ npx getburnd

runs locally. takes 30 seconds. free and open source (MIT)

dashboard + landing + buy the book: https://getburnd.vercel.app

github: https://github.com/garvitsurana271/burnd
```
(262 chars)

---

## Tweet 8 (the honest close — the 16yo + india angle stays to the very end)

```
i'm going to launch this from my school desk in between classes. my payment is UPI and my merchant-of-record is my own name

if it helps even 5 devs save $100 this month, i'll consider it a win

questions? drop them below. i'll answer everything
```
(258 chars)

---

## Pinned reply strategy

After posting the thread, IMMEDIATELY reply to tweet 8 with:

**Pinned reply:**

```
FAQs i already anticipate:

→ "why ₹399 not free?" — the CLI + dashboard IS free. the book is optional. you don't need it to use burnd

→ "why UPI not stripe?" — i'm 16. stripe needs 18+. upi is what i can legally accept. if you're outside india, email me and we'll figure it out

→ "how do i trust the privacy claims?" — parser source is public, anonymization spec is public, CI test asserts no secrets leak. audit it yourself

→ "is the $13k real?" — yes. sessions are timestamped in my .claude/projects/ and the dashboard reads them live. i'll DM you a screenshot if you want
```

---

## If the thread gains traction

- Monitor replies every 15 minutes for the first hour
- Reply to EVERY thoughtful reply personally, not with canned responses
- If someone asks for international payment, respond immediately with the email path
- If someone finds a bug, thank them and open a GitHub issue tagged `first-users`
- Screenshot any positive reply and save for future credibility posts
- DO NOT reply with emojis or generic "thank you 🙏" messages — that looks bot-like

## If the thread flops

- Don't delete it. Let it live. Sometimes things resurface 48 hours later
- Post the same content in a different format to Reddit + HN (see other launch files)
- Try again in 7 days with a different opening — maybe lead with the ebook instead of the tool
- The 16yo angle is a one-shot lever — don't burn it twice in the same week
