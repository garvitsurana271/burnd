# QUEUE: Morning Launch Routine — Burnd

> **Read this first thing when you wake up.** This is the complete click-by-click morning routine to take Burnd from "built overnight" to "live on the internet generating real revenue." Total time: ~60 minutes of focused work. You can pause between any two steps — the order matters but the spacing doesn't.

---

## TL;DR — what you're doing

1. Verify everything from overnight is still working (5 min)
2. Register `burnd.dev` via Hostinger UPI (~₹1,200) (8 min)
3. Generate the ebook PDF from the HTML (2 min)
4. Create the Google Form for ₹399 UPI fulfillment (5 min)
5. Update the landing page with the real UPI handle + Google Form URL (2 min)
6. Set up a GitHub repo for burnd under `garvitsurana271/burnd` and push the code (8 min)
7. Sign up for npm and publish `burnd` CLI (5 min)
8. Deploy the landing page + dashboard to Vercel as a new project (8 min)
9. Connect burnd.dev to Vercel (DNS) (5 min)
10. Final smoke test: run `npx burnd` (from npm) and open https://burnd.dev (5 min)
11. Post the launch artifacts (Twitter, HN, Reddit, PH) using the pre-written files (10-15 min spread across the day)

**First-rupee path:** After step 11, you wait. Realistic timeline for first ₹399 sale = 2-24 hours after the first Reddit India / Twitter post gains any traction.

---

## STEP 0 — Sanity check everything overnight-Claude built

**Time:** 5 minutes
**Blocking:** NO — even if something is broken, you can fix it as you go

```bash
cd "C:\Users\Garvit Surana\Desktop\Projects\ChangeLife"
git log --oneline | head -20
```

**You should see commits ending in** something like:

```
<latest>  docs: Phase 6 — morning queue file
<...>     docs: Phase 5 — full launch artifact pack
ea7506f   feat: Phase 2 — marketing landing page at / with UPI buy flow
4bdcbc2   docs: the ebook — Burning Tokens...
25f9d68   docs: WAKEUP.md + memory updates from overnight autonomous run
...
```

If commits are missing, read `WAKEUP_v2.md` (also in the project root) for the "ran out of time" report.

Run the tests:

```bash
cd src/cli
npm test
```

**Expected: 49/49 passing.** If any test fails, STOP and tell Claude about the failure before proceeding.

Run the CLI against your own data as a sanity check:

```bash
cd src/cli
npx tsx src/index.ts --top 5
```

**Expected: colored output showing ~$13k all-time spend and the top 5 leaks.** If the CLI fails to run, STOP.

---

## STEP 1 — Register burnd.dev (Tier 3 — spending money)

**Time:** 8 minutes
**Cost:** ~₹1,200-1,500 (Year 1 including WHOIS privacy)
**Existing queue file:** `notes/queue/2026-04-12-register-burnd-dev.md` has the full click-by-click walkthrough

**Short version:**

1. Open https://www.hostinger.in/domain-name-search on phone or laptop
2. Search for `burnd.dev`
3. Add to cart, decline all upsells EXCEPT "Domain Privacy" (enable that one — it's free)
4. Sign up with `garvitsurana10@gmail.com`
5. Pay via UPI (~₹1,200-1,500)
6. In Hostinger dashboard, toggle Auto-Renew ON (critical — prevents accidental expiry during board exam lockdown)
7. Take screenshots of the payment success page and the domain in your dashboard

**If `burnd.dev` is suddenly taken:** STOP. Tell Claude immediately — do not pick a similar variant on your own. Fallback is `burnd.io` per the design doc Appendix A.

**After this step:** Delete the old queue file for domain registration:
```bash
rm "C:\Users\Garvit Surana\Desktop\Projects\ChangeLife\notes\queue\2026-04-12-register-burnd-dev.md"
```

---

## STEP 2 — Generate the ebook PDF

**Time:** 2 minutes

The ebook is in two formats already:
- `notes/ebook/burning-tokens.md` — the source markdown (7,400 words)
- `notes/ebook/burning-tokens.html` — styled HTML with embedded fonts, print-ready CSS

**To generate the PDF:**

1. Open `notes/ebook/burning-tokens.html` in **Chrome** (not Firefox — Chrome's PDF engine is cleaner)
2. Press **Ctrl+P** (or Cmd+P on Mac)
3. Destination: **Save as PDF**
4. Layout: Portrait
5. Paper size: A4
6. Margins: Default
7. Scale: Default
8. Options: Background graphics → **ON** (important — preserves the colored accents)
9. Click **Save**
10. Save as `notes/ebook/burning-tokens.pdf` (overwriting if a file already exists)

**Verify:** Open the PDF. It should be ~20-30 pages. The cover page should have "Burning Tokens" in large bold type with the subtitle below it. Each chapter should start on a new page.

**Commit the PDF to git:**

```bash
cd "C:\Users\Garvit Surana\Desktop\Projects\ChangeLife"
git add notes/ebook/burning-tokens.pdf
git commit -m "docs: ebook PDF generated from HTML"
```

---

## STEP 3 — Create the Google Form for ₹399 UPI fulfillment

**Time:** 5 minutes
**Spec:** `notes/launch/google-form-template.md` has every question and setting

**Short version:**

1. Open https://forms.google.com (signed in as `garvitsurana10@gmail.com`)
2. Click "+ Blank"
3. Title: `Burning Tokens — get your ebook`
4. Description: copy from `notes/launch/google-form-template.md`
5. Add 7 questions per the template:
   - Q1: Your name (short answer, required)
   - Q2: Email address (short answer, required, email validation)
   - Q3: UPI transaction ID / UTR (short answer, required)
   - Q4: Amount paid in ₹ (number, required)
   - Q5: How did you hear about Burnd? (multiple choice, optional)
   - Q6: UPI handle for refund (short answer, optional)
   - Q7: Anything else? (long answer, optional)
6. Click the **Responses** tab → click the link icon to get the shareable URL
7. Click **Send** → click the link icon → copy the full form URL (https://forms.gle/XXXXX)
8. Save this URL — you need it in Step 4

**Also copy the confirmation message** from `notes/launch/google-form-template.md` and paste it into Settings → Presentation → Confirmation message.

**Test the form:** Fill it out yourself with test data to make sure all 7 questions work. Delete your test response from the Responses sheet.

---

## STEP 4 — Update the landing page with real UPI + Google Form URL

**Time:** 2 minutes

Open `src/web/src/pages/LandingPage.tsx` in your editor and do TWO find-and-replace operations:

**Replace 1:** Find this string:
```
garvitsurana10@oksbi
```
Replace with your ACTUAL UPI handle. If `garvitsurana10@oksbi` is correct (check your SBI account — open BHIM or your UPI app and look at "My UPI IDs"), leave as-is. Otherwise replace with whatever your actual handle is.

**Replace 2:** Find this string:
```
https://forms.gle/PLACEHOLDER-REPLACE-WITH-REAL-FORM
```
Replace with the Google Form URL from Step 3.

Save the file. Rebuild:

```bash
cd "C:\Users\Garvit Surana\Desktop\Projects\ChangeLife\src\web"
npm run build
```

**Expected: build succeeds, no errors.** The build output goes to `src/web/dist/`.

**Commit:**

```bash
cd "C:\Users\Garvit Surana\Desktop\Projects\ChangeLife"
git add src/web/src/pages/LandingPage.tsx
git commit -m "feat: real UPI handle + Google Form URL on landing page"
```

---

## STEP 5 — Push code to a public GitHub repo

**Time:** 8 minutes

You need a public GitHub repo at `github.com/garvitsurana271/burnd` so:
- The launch posts can link to it
- The landing page's GitHub link works
- Vercel can import from it to deploy
- Users can audit the open-source code

**On github.com:**

1. Go to https://github.com/new (signed in as `garvitsurana271`)
2. Repository name: **`burnd`**
3. Description: `Find what's burning a hole in your AI coding budget. Local-first CLI + dashboard for Claude Code cost control.`
4. Visibility: **Public**
5. Do NOT initialize with README, .gitignore, or license (we already have them)
6. Click **Create repository**

**In your terminal:**

```bash
cd "C:\Users\Garvit Surana\Desktop\Projects\ChangeLife"
git remote add origin https://github.com/garvitsurana271/burnd.git
git branch -M main
git push -u origin main
```

**Expected:** first push succeeds. You'll be prompted for your GitHub credentials (username + personal access token, NOT password — GitHub killed password auth in 2021). If you don't have a PAT, create one at https://github.com/settings/tokens with `repo` scope.

**After the push:** open `https://github.com/garvitsurana271/burnd` in your browser. You should see:
- All the source code
- The README
- The `notes/` folder with the ebook + launch artifacts
- The `src/cli/` and `src/web/` directories
- ~15-20 commits in the commit history

**If you see the repo but the commits look wrong:** check `git status` — you may have uncommitted changes that need to be committed and pushed.

---

## STEP 6 — Sign up for npm and publish the CLI

**Time:** 5 minutes
**Risk:** PUBLIC — once published, you cannot un-publish a name on npm (you can deprecate but not delete). Only proceed if you're ready.

**On npmjs.com:**

1. Go to https://www.npmjs.com/signup
2. Username: `garvitsurana271` (matches GitHub — consistency)
3. Email: `garvitsurana10@gmail.com`
4. Password: something strong, store in password manager
5. Complete the email verification link they send
6. Enable 2FA in your account settings (`https://www.npmjs.com/settings/garvitsurana271/profile` → two-factor authentication → **auth-and-writes**)

**In your terminal:**

```bash
cd "C:\Users\Garvit Surana\Desktop\Projects\ChangeLife\src\cli"
npm login
```

Enter your username + email + password + OTP code when prompted.

Verify you're logged in:
```bash
npm whoami
```

Should print `garvitsurana271`.

**Pre-publish check:**

```bash
npm run typecheck
npm test
npm run build
```

All three must succeed. If any fail, STOP and debug before publishing.

**Publish:**

```bash
npm publish
```

If the package name `burnd` is already taken on npm, the publish will fail. If it fails:
- Check the error message
- Try `npm view burnd` to see who owns the existing package
- If someone else owns it, the fallback is `burnd-cli` — update `src/cli/package.json` `name` field and republish

**Expected:** success message from npm. Your package is now live at `https://www.npmjs.com/package/burnd` (or `burnd-cli` if fallback).

**Test from a different directory to prove it actually works:**

```bash
cd /tmp  # or any directory that is NOT src/cli
npx burnd@latest --version
```

Should print the version. If it does, **the CLI is live on the public npm registry.** That's a real milestone.

---

## STEP 7 — Deploy the landing page to Vercel

**Time:** 8 minutes

You have a Vercel account already on `garvitsurana10@gmail.com`. **Create a NEW project** for burnd — do NOT merge with your existing Vercel projects.

**On vercel.com:**

1. Sign in at https://vercel.com/login
2. Click **Add New... → Project**
3. Under "Import Git Repository", click **Import** next to `garvitsurana271/burnd` (Vercel should automatically see it from your GitHub connection — if not, click "Adjust GitHub App Permissions" and grant access to the new repo)
4. On the Configure Project page:
   - **Project Name:** `burnd` (this is the Vercel project name)
   - **Framework Preset:** Vite
   - **Root Directory:** click **Edit** → navigate to `src/web` → click **Continue**
   - **Build Command:** `npm run build` (should be auto-detected)
   - **Output Directory:** `dist` (should be auto-detected)
   - **Install Command:** `npm install` (should be auto-detected)
   - **Environment Variables:** none needed
5. Click **Deploy**

**Wait 1-3 minutes** for the build to complete. Vercel will show you build logs in real-time.

**Expected outcome:** the build succeeds and Vercel gives you a URL like `burnd.vercel.app` or `burnd-garvitsurana271.vercel.app`. Open it in a browser.

**You should see:** the landing page rendering at the Vercel URL. The hero, the brutal-facts strip, the 8 detectors, the pricing, the buy section.

**Known issue:** clicking "open dashboard" or navigating to /app/insights will fail because there's no `burnd serve` backend attached to the static hosting. The dashboard is a LOCAL tool, not a cloud one. The landing page works; the dashboard links will 404 on Vercel. That's expected for v1 — you explain this in the launch posts.

---

## STEP 8 — Connect burnd.dev to the Vercel project

**Time:** 5 minutes

You now need to point `burnd.dev` (which you registered in Step 1 at Hostinger) to the Vercel deployment from Step 7.

**In Vercel:**

1. Open your burnd project → **Settings → Domains**
2. Type `burnd.dev` in the domain input → click **Add**
3. Vercel will show you DNS records you need to configure (specifically, an A record or a CNAME)

**The exact records you need:**
- **A record** on the root domain (`@`) pointing to `76.76.21.21`
- **CNAME record** on `www` pointing to `cname.vercel-dns.com`

(Vercel shows the exact values on their UI — use those, not the above, if they differ.)

**In Hostinger's DNS panel:**

1. Go to your Hostinger dashboard → **Domains → burnd.dev → DNS / Name Servers → DNS records**
2. Delete any existing A or CNAME records on the root or `www` (Hostinger may have added parking page records — kill those)
3. Add the records Vercel specified
4. Save

**Wait 5-15 minutes** for DNS propagation. You can test with:

```bash
nslookup burnd.dev
```

Should eventually return Vercel's IP address.

**Once propagation completes:** visit `https://burnd.dev` in your browser. **You should see the landing page with the custom domain and a green padlock** (Vercel auto-provisions Let's Encrypt SSL for custom domains).

**If DNS isn't propagating after 30 minutes:** the records probably aren't saved. Go back to Hostinger DNS panel and verify the records are there and correct.

---

## STEP 9 — Final smoke test

**Time:** 5 minutes

**Test 1: npx burnd from a clean directory**

```bash
cd /tmp  # or any dir other than src/cli
npx burnd@latest --version
npx burnd@latest --top 3
```

**Expected:** version prints, top 3 leaks print.

**Test 2: the landing page at https://burnd.dev**

Open `https://burnd.dev` in Chrome and Firefox (different browsers catch different bugs).

**Expected:**
- Hero loads with "Cut your Claude Code spend by 20-40% in a week"
- "Install command" button shows `$ npx burnd`
- Clicking "Buy via UPI" scrolls to the buy section
- The buy section shows your real UPI handle
- The "Open the form" link goes to your Google Form

**Test 3: GitHub repo is public and looks good**

Open `https://github.com/garvitsurana271/burnd`.

**Expected:**
- Repo is public (no lock icon next to the name)
- README is visible
- The 25+ commits are in the history
- The MIT license is detected and shown
- Clicking notes/ebook/burning-tokens.md shows the ebook content

**Test 4: npm package is live**

Open `https://www.npmjs.com/package/burnd` (or `burnd-cli` if you used the fallback).

**Expected:**
- Package page loads
- Shows you as the publisher
- Latest version is 0.0.1
- README is rendered from the package

**If all 4 tests pass, the technical launch is complete.** Everything is live. Now you market.

---

## STEP 10 — Launch posts (the marketing layer)

**Time:** 10-15 minutes for the first posts, then sporadic replies across the day.
**Detailed schedule:** `notes/launch/launch-day-checklist.md` has the hour-by-hour IST timeline.

**The short version — post in this order:**

1. **Twitter thread** from `@GarvitSura5238` — copy from `notes/launch/twitter-thread.md`, post each tweet as a reply to the previous one, 2-3 minutes apart
2. **Reddit r/developersIndia** — copy from `notes/launch/reddit-r-developersindia.md` (this is your home crowd, start here)
3. **Hacker News Show HN** — copy title from `notes/launch/show-hn-post.md`, submit with URL `https://burnd.dev`, then immediately post the body as the first comment. **This is the big one. Reply to every comment in the first hour.**
4. **Reddit r/ClaudeAI** — different body from `notes/launch/reddit-r-claudeai.md` (wait 2 hours after step 2 to cross-post)
5. **Reddit r/SideProject** — different body from `notes/launch/reddit-r-sideproject.md`
6. **Reddit r/IndieHackers** — different body from `notes/launch/reddit-r-indiehackers.md`
7. **ProductHunt** — copy from `notes/launch/producthunt-page.md`, submit with screenshots

**Reply strategy for the first hour:** keep your laptop open, reply to every comment personally (not canned), don't reply to trolls, upvote thoughtful replies.

**First-rupee realistic timeline:**
- Best case: first sale within 30-60 minutes of the Reddit r/developersIndia post landing
- Realistic case: first sale 4-12 hours after the HN post
- Floor case: first sale 24-48 hours after the launch, from a delayed Reddit comment or Twitter discovery

---

## STEP 11 — First-customer email handling

When the Google Form receives its first response:

1. Gmail notifies you (Google Forms sends an email to `garvitsurana10@gmail.com`)
2. Open the form → Responses tab → find the new row
3. Cross-check the transaction ID in your UPI app (SBI Pay / Google Pay / PhonePe — wherever you receive UPI)
4. **If the transaction is confirmed (₹399 received):**
   - Open Gmail → compose new email to the buyer's email
   - Subject: `Burning Tokens — thanks for being customer #1 🔥`
   - Body: copy **Version 1** from `notes/launch/first-customer-email.md`, personalize with their name
   - Attach `notes/ebook/burning-tokens.pdf`
   - Send
   - Highlight the row in the Google Form responses sheet to mark "delivered"
5. **Take a screenshot of the UPI notification** showing the ₹399 credit. Save it. Post it on Twitter with "first rupee is in 🔥 thank you [name redacted if they prefer]" — **only if the customer consents** to being mentioned. If they're quiet about the purchase, don't post about them.
6. **Update this queue file:** at the top, add a note saying "RESOLVED: first sale received at [time], [amount]".

---

## If anything breaks

- **The landing page shows a blank white screen** → check the browser console for errors. Usually means the Vite build didn't include all files. Re-run `npm run build` and redeploy.
- **`npm publish` fails with "you do not have permission to publish burnd"** → the name is taken. Fall back to `burnd-cli` in `src/cli/package.json`.
- **`burnd.dev` doesn't resolve after 30 minutes** → DNS records are probably wrong in Hostinger. Go back to step 8 and re-verify.
- **You can't log in to npm** → check your 2FA code. If you don't have 2FA set up, the login uses just password. If you DO have 2FA, the OTP prompt appears.
- **Gumroad / Stripe problem** → IGNORE. We're not using either. If a launch artifact mentions them, it's a mistake in the artifact.
- **The Google Form is not receiving submissions** → verify the form is published and the URL works. Test by submitting the form yourself from incognito mode.

## What NOT to do in the morning

- **Do not try to add new features.** The launch happens first, feature work comes after.
- **Do not re-read the battle plan** — just execute this queue file.
- **Do not respond to launch posts before posting them.** Post all 7 things, then reply.
- **Do not check your Claude Code bill obsessively.** The point of Burnd is to STOP checking your bill obsessively.
- **Do not undervalue the first ₹399.** It's the proof that matters, not the amount.

---

## When you're done

Take a screenshot of:
1. The live https://burnd.dev landing page
2. The first UPI notification showing ₹399 received (if you get one)
3. Your Reddit / HN / Twitter upvote counts 24 hours after launch
4. Your GitHub stars count

Save these somewhere permanent. They're your first real launch artifacts and you'll want them for the next launch.

Then **tell Claude how the launch went**. Happy, sad, mixed, whatever. Claude updates the session log + memory with the real outcome. The next session starts from wherever you land.

Good luck, Garvit.

---

**Total expected time:** ~60 minutes of active work + however much time you want to spend replying to launch comments.
**Total expected Tier 3 mom-touch:** ZERO. Everything above uses your own email, your own phone, your own UPI, your own school laptop.
**Budget:** ~₹1,500 total (just the domain). Everything else is free.
