# Launch Day Checklist — Burnd

**Target launch day:** Pick a Tuesday or Wednesday (best traffic on HN, Reddit, and PH).
**Total time commitment:** ~90 minutes of active launching + all-day monitoring for replies.

## The night before

- [ ] Google Form is live with the real URL (not the placeholder)
- [ ] Landing page has the real Google Form URL (search for PLACEHOLDER in LandingPage.tsx)
- [ ] Landing page has the real UPI ID (currently `garvitsurana10@oksbi` as default guess — verify this works)
- [ ] burnd.dev resolves to the Vercel deployment
- [ ] `npx burnd` installs and runs on a clean machine (test in WSL or a fresh terminal)
- [ ] Ebook PDF is generated and saved at `notes/ebook/burning-tokens.pdf` (open .html in browser → Ctrl+P → Save as PDF)
- [ ] Screenshots for HN / PH / Twitter are taken and ready (see screenshot-shotlist.md)
- [ ] Twitter bio is updated to mention burnd.dev
- [ ] `npm publish` has happened (the CLI is live on the npm registry)
- [ ] GitHub repo is public at github.com/garvitsurana271/burnd (change visibility in Settings)
- [ ] Queued a tweet from @GarvitSura5238 in Twitter's scheduled posts for the launch time

## Launch day timeline (all times IST — India Standard Time)

### 08:00 — Wake up, breakfast, shower, brain check

Nothing launch-related yet. Eat real food. Check that your laptop is charged. Don't rush.

### 09:00 — Final pre-flight

- [ ] Open 5 browser tabs: HN submit page, Twitter, Reddit (r/developersIndia), Reddit (r/ClaudeAI), ProductHunt
- [ ] Open a second browser window with: burnd.dev, `npx burnd serve` running locally for sanity, Gmail, the Google Form responses tab
- [ ] Have `notes/launch/` open in your editor so you can copy-paste post text
- [ ] Have the ebook PDF ready to attach to emails

### 09:30 — Tweet thread (launching here first because it's warm-up, not the main event)

- [ ] Post Tweet 1 from @GarvitSura5238
- [ ] Wait 2-3 minutes, post Tweet 2 as a reply
- [ ] Continue through all 8 tweets, spaced 2-3 minutes apart
- [ ] After the last tweet, pin the thread to your profile
- [ ] Post the "FAQs I anticipate" reply below Tweet 8

### 10:00 — Reddit r/developersIndia (home-field advantage post)

- [ ] Post the r/developersIndia thread (full body from reddit-r-developersindia.md)
- [ ] Flair: "I Made This"
- [ ] Monitor for replies in a separate tab
- [ ] Do NOT cross-post to other subreddits yet (wait 2 hours minimum)

### 10:15 — Gmail check

- [ ] Check Gmail for ANY email about the launch — people test fast
- [ ] Reply to anyone already asking questions

### 11:00 — Hacker News Show HN post

This is the big one. HN is won or lost in the first hour.

- [ ] Go to news.ycombinator.com/submit
- [ ] Paste the title from show-hn-post.md (exactly — every character matters)
- [ ] URL field: https://burnd.dev
- [ ] Submit
- [ ] IMMEDIATELY post the body text as the first comment on your own submission (from show-hn-post.md)
- [ ] Keep the HN thread tab open and refresh every 2-3 minutes for the first 45 minutes
- [ ] Reply to EVERY comment in the first hour, personally

### 11:15 — Reddit r/ClaudeAI (cross-post #1)

- [ ] Post the r/ClaudeAI version (different body from reddit-r-claudeai.md)
- [ ] Flair: "Projects" or "Show and Tell"

### 11:45 — Reddit r/SideProject (cross-post #2)

- [ ] Post the r/SideProject version (different body from reddit-r-sideproject.md)
- [ ] Flair: "Launched"

### 12:00 — Lunch + monitor HN

- [ ] Grab lunch but keep the HN tab visible
- [ ] Reply to any new HN comments within 5 minutes of them posting
- [ ] Don't spam-refresh — every 5 minutes is enough

### 13:00 — Reddit r/IndieHackers (cross-post #3)

- [ ] Post the r/IndieHackers version (different body from reddit-r-indiehackers.md)
- [ ] Flair: "Launched"

### 13:30 — ProductHunt submission

- [ ] Go to producthunt.com/posts/new
- [ ] Fill everything from producthunt-page.md
- [ ] Upload the 5-6 gallery images (from the screenshots folder)
- [ ] Submit as "maker" (you, Garvit Surana)
- [ ] DO NOT schedule for future — submit NOW so it launches immediately on PH's schedule

### 14:00 — Check + reply

- [ ] Review every comment on every platform
- [ ] Reply to everyone who asked a real question
- [ ] Upvote thoughtful replies (not your own — NEVER upvote your own HN or Reddit posts)

### 15:00 — First sales check

- [ ] Open the Google Form responses tab
- [ ] Check your UPI app for any transactions
- [ ] If you see a sale, celebrate (briefly), then IMMEDIATELY send the ebook PDF (use version 1 of first-customer-email.md template, personalize)

### 16:00-21:00 — Extended reply window

- [ ] Keep laptop open, reply to comments, send PDFs, be responsive
- [ ] Screenshot any particularly good replies / reviews for future marketing
- [ ] Update the pinned tweet with any wins ("we're #5 on HN!" if that happens)

### 21:00 — Dinner + Twitter follow-up tweet

- [ ] Post a follow-up tweet: "launch day report: X sales, Y HN upvotes, Z feedback items. thank you everyone who shared this 🙏"
- [ ] Dinner with family — they should know what you did today

### 22:30 — Wind-down + first-review request

- [ ] For the first 5 buyers who replied positively: reply asking if they'd be willing to leave a short review on the PH page or a quote for the landing page
- [ ] Do NOT ask for reviews from negative or neutral buyers
- [ ] Go to bed by 23:30 — you have school tomorrow

---

## Day 2 (the morning after)

- [ ] Check total sales number in Google Form responses
- [ ] Send ebook PDF to any overnight buyers
- [ ] Reply to any overnight comments on HN, Reddit, PH
- [ ] Post a "Day 1 retrospective" thread on Twitter with actual numbers (whether good or bad)
- [ ] Open GitHub issues for every bug report from the launch
- [ ] Update WAKEUP.md in the project to reflect the new state

## Day 3-7 (the long tail)

- [ ] Post a "Day 7 numbers" thread if you have real numbers to share
- [ ] Respond to any delayed HN/Reddit comments (they trickle in for days)
- [ ] Update the landing page with any social proof (quotes, upvote counts, etc.)
- [ ] If you have >10 customers, email them with a "how was it?" check-in

## What to do if launch day is dead

It happens. Maybe none of your posts land. Maybe HN buries you. Maybe Reddit hates your title.

**Rules for flop day:**

1. **Don't delete anything.** Posts sometimes get revived 24-48 hours later.
2. **Don't panic-launch again the same day.** You'll look desperate.
3. **Do reply to the 2-3 comments you DID get** — they're the seeds of your next try.
4. **Do post a Twitter thread that evening saying "launch day didn't land, here's what I'm trying next"** — the meta-launch sometimes gets more traction than the actual launch.
5. **Wait 5-7 days, then try a different angle.** Maybe lead with the ebook instead of the CLI. Maybe lead with the $13k number instead of the 16yo angle.

The only real failure is not launching at all.

---

## Success criteria for launch day (in order of what matters)

1. **The CLI runs successfully** on at least 3 machines that aren't yours — proves the npm package is correctly published
2. **The landing page serves** at burnd.dev with no broken images or 404s
3. **At least 1 HN / Reddit / Twitter post gets >50 engagement** — any of the channels working is a win
4. **At least 1 paid sale** — the real metric, the first rupee
5. **At least 1 GitHub star from a stranger** — proof of open-source interest
6. **At least 1 bug report from a real user** — means people tried it hard enough to hit an edge

If you hit 3 of 6 on launch day, that's a successful launch.
If you hit 5 of 6, that's a great launch.
If you hit 6 of 6, screenshot everything and put it on the landing page as social proof.
