# First Rupee Plan — Burnd

> This is the actual plan to get Garvit's first paid customer. Not aspirational. Not "marketing strategy." These are specific actions, in order, with reasoning for why each one matters.

---

## The reasoning (read this first)

**Who is the buyer?**

An Indian developer (25-35, probably in Bangalore/Hyderabad/Pune/Delhi) who:
- Uses Claude Code regularly (Max plan at $100/mo or API at $50-200/mo)
- Has noticed their Claude spend creeping up but has no visibility into why
- Is technically fluent enough to run `npx burnd` without hand-holding
- Checks r/developersIndia, Indian tech Twitter, and maybe HN

This person doesn't need to be convinced that AI coding costs money. They already know. What they need is:
1. **Proof that this specific tool finds real savings** (the $13,631 number)
2. **Trust that it's safe** (local-first, open source, no data upload)
3. **A frictionless way to pay** (UPI — not Stripe, not PayPal, not crypto)

**Why the 16yo angle matters (and how to use it without being cringy):**

The age isn't the product. But it IS the hook that makes people click, read, and share. The playbook:
- Lead with the problem ("$13,631 on Claude Code")
- Reveal the age in the second beat ("built by a 16yo who couldn't afford to keep ignoring it")
- Let the product speak after that

People share the "16yo spent $13k and built a tool" story. Nobody shares "new dev tool finds token leaks." The story IS the marketing channel.

**What NOT to do:**
- Don't lead with "I'm 16" — lead with the problem. The age is the surprise.
- Don't post the same text everywhere — Reddit mods will see it as spam.
- Don't ask for upvotes or shares — the story does that work.
- Don't argue in comments — answer questions, be helpful, be honest.
- Don't oversell — the tool is real, the data is real, let it speak.

---

## Day 1: Launch Day (Today/Tomorrow — pick a weekday)

### Phase 1: The warm-up (9:00-10:00 IST)

**Action 1: Twitter thread** (9:30 IST)
- Use the thread from `notes/launch/twitter-thread.md` 
- Post from @GarvitSura5238
- 8 tweets, spaced 2-3 minutes apart
- Pin the thread to your profile
- This is warm-up, not the main event — low stakes, builds momentum

**Why Twitter first:** Smallest audience, lowest risk. Gets the messaging tested. If something sounds wrong, you can adjust before the big posts.

### Phase 2: Home field (10:00-10:30 IST)

**Action 2: r/developersIndia** (10:00 IST)
- Use the post from `notes/launch/reddit-r-developersindia.md`
- Flair: "I Made This"
- This is your home audience: Indian devs who get the UPI flow, who understand the board exam timeline, who root for young builders
- Reply to EVERY comment in the first 2 hours

**Why r/developersIndia first among Reddit:** This is the one audience where the India angle, the UPI payment, the ₹399 price, and the 16yo story all amplify each other. If this post doesn't land, the others still might — but this one has the highest probability of organic engagement.

### Phase 3: The big swing (11:00-11:30 IST)

**Action 3: Hacker News Show HN** (11:00 IST)
- Use `notes/launch/show-hn-post.md`
- Title: exactly as written (every character matters on HN)
- URL: https://getburnd.vercel.app
- IMMEDIATELY post the body text as the first comment
- Reply to EVERY comment in the first 60 minutes — this is what determines if you survive the new queue

**Why HN matters disproportionately:** HN is where power-user developers hang out. Claude Code power users are ON Hacker News. One front-page hit drives 5,000-20,000 visits. Most of your non-Indian traffic will come from here.

### Phase 4: Cross-pollination (11:15-13:00 IST)

**Action 4: r/ClaudeAI** (11:15 IST)
- Use `notes/launch/reddit-r-claudeai.md` (different body from r/developersIndia)
- Flair: "Projects" or "Show and Tell"
- This is the product-specific audience — people who specifically use Claude Code

**Action 5: r/SideProject** (11:45 IST)
- Use `notes/launch/reddit-r-sideproject.md`
- Flair: "Launched"

**Action 6: r/IndieHackers** (13:00 IST)
- Use `notes/launch/reddit-r-indiehackers.md`
- The indie hacker audience cares about the business story, not just the tech

### Phase 5: Monitoring (13:00-21:00 IST)

- Refresh HN every 5 minutes for the first 2 hours
- Reply to EVERY comment within 10 minutes
- Check Reddit threads every 30 minutes
- Check Gmail for FormSubmit notifications (this is how you know someone bought)
- Check UPI app for incoming ₹399/₹149 payments

---

## The sale funnel (what happens when someone wants to buy)

### Ebook (₹399 one-time):
1. Visitor lands on getburnd.vercel.app
2. Scrolls to #buy → sees UPI ID (madhusuranaa@okaxis)
3. Sends ₹399 via UPI
4. Fills the form (name + email + transaction ID)
5. FormSubmit.co emails you at garvitsurana10@gmail.com
6. You verify the UPI receipt in your UPI app
7. You email the PDF using the template in `notes/launch/first-customer-email.md`
8. **Done.** First rupee earned.

### BurndPro (₹149/month):
1. Visitor sees BurndPro card on pricing page
2. Same UPI flow as ebook but pays ₹149
3. You generate their key: `npx burnd pro keygen their@email.com 2026-04`
4. Email them the key + activation instructions
5. Next month: they pay again via UPI, you generate 2026-05 key
6. If they stop paying, the key expires after 30 days + grace period

---

## The ebook PDF

**BLOCKER: You need to generate the PDF before launch.**

The ebook source is at `notes/ebook/burning-tokens.md`.

To generate:
1. Open the markdown file in VS Code
2. Install the "Markdown PDF" extension (or use any markdown→PDF tool)
3. Export as PDF
4. Save to `notes/ebook/burning-tokens.pdf`
5. This is the file you email to buyers

Alternative: open the .md file in Chrome (via a markdown viewer extension) → Ctrl+P → Save as PDF.

---

## Day 2-7: The long tail

### Day 2 (morning after):
- Check total sales in Gmail (search for "Burning Tokens — new purchase!")
- Send PDFs to any overnight buyers
- Reply to all overnight comments on HN/Reddit
- Post a "Day 1 numbers" tweet (honest, even if zero)

### Day 3-5:
- If you got >0 sales: post a follow-up on r/developersIndia with "Day N update: X sales, Y feedback items, here's what I learned"
- If you got 0 sales: don't panic. Post the "meta-launch" tweet (see launch-day-checklist.md for the flop playbook)
- Reply to any trickling comments

### Day 7:
- Post a "Week 1 retrospective" thread on Twitter
- If >5 customers: ask the happiest ones for a quote → add to landing page
- If >0 sales on BurndPro: that's your recurring revenue seed

---

## What to do right now (before posting anything)

1. **Check Gmail for npm OTP** — npm sent a 6-digit code. Give it to Claude to finish publishing `npx burnd`.
2. **Generate the ebook PDF** — you can't sell what you can't deliver.
3. **Test the UPI flow yourself** — send ₹1 to madhusuranaa@okaxis from a different UPI app. Verify it lands. If the UPI handle is wrong, everything breaks.
4. **Change your npm password** — you shared it in this conversation. Go to npmjs.com → Profile → Password → change it.
5. **Pick the launch day** — Tuesday or Wednesday. Not today (Saturday) — dev communities have lower weekday traffic on weekends. Plan to launch Tuesday 2026-04-14 or Wednesday 2026-04-15.

---

## Revenue projections (realistic, not optimistic)

| Scenario | Week 1 | Month 1 | Month 3 |
|---|---|---|---|
| **Floor** (story doesn't land) | ₹0-1,200 (0-3 ebook sales) | ₹2,000-5,000 | ₹5,000-10,000 |
| **Base** (moderate traction) | ₹2,000-4,000 (5-10 ebook + 1-2 Pro) | ₹8,000-15,000 | ₹15,000-25,000 |
| **Upside** (HN front page) | ₹5,000-15,000 (15-30 ebook + 5-10 Pro) | ₹20,000-40,000 | ₹30,000-60,000 |

The difference between floor and upside is almost entirely whether the HN post lands. That's why the first-comment and first-hour replies are load-bearing.

---

## The one thing that matters most

> **Reply to every comment within 10 minutes for the first 4 hours.**

This is the single highest-leverage action on launch day. People who comment early are your potential buyers. A fast, personal, technically competent reply from a 16yo is the most compelling sales pitch possible. No landing page, no copy, no design can match that.

---

## Quick reference: all launch post files

| Platform | File | Priority |
|---|---|---|
| Twitter | `notes/launch/twitter-thread.md` | Phase 1 |
| r/developersIndia | `notes/launch/reddit-r-developersindia.md` | Phase 2 (highest) |
| Hacker News | `notes/launch/show-hn-post.md` | Phase 3 (biggest swing) |
| r/ClaudeAI | `notes/launch/reddit-r-claudeai.md` | Phase 4 |
| r/SideProject | `notes/launch/reddit-r-sideproject.md` | Phase 4 |
| r/IndieHackers | `notes/launch/reddit-r-indiehackers.md` | Phase 4 |
| Email template | `notes/launch/first-customer-email.md` | After first sale |
| Full checklist | `notes/launch/launch-day-checklist.md` | Reference |
