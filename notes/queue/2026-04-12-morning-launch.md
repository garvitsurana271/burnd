# QUEUE: Morning Launch Routine — Burnd

> **Read this first thing when you wake up.** This is the complete click-by-click morning routine to take Burnd from "built overnight" to "live on the internet generating real revenue." Total time: ~45 minutes of focused work. You can pause between any two steps.

---

## LAUNCH COSTS: ₹0

No money spent until after first rupee comes in. Domain registration is deferred — you launch on `getburnd.vercel.app` (free Vercel subdomain). Register `burnd.dev` later using revenue from the first few sales.

## CHECKOUT: No Google Form

The checkout is built directly into the landing page at `getburnd.vercel.app/#buy`. Buyers fill out name + email + UPI transaction ID on YOUR site. Submissions go to your Gmail via FormSubmit.co (free, no signup). You verify the UPI receipt and email the PDF. Professional-looking, zero Google branding.

---

## TL;DR — what you're doing

1. Verify everything from overnight is still working (5 min)
2. Verify your UPI handle works for receiving payments (2 min)
3. Generate the ebook PDF from the HTML (2 min)
4. Update the landing page with your correct UPI handle if different from default (2 min)
5. Set up a GitHub repo for burnd under `garvitsurana271/burnd` and push the code (8 min)
6. Sign up for npm and publish `burnd` CLI (5 min)
7. Deploy the landing page + dashboard to Vercel as a new project (8 min)
8. Final smoke test: open getburnd.vercel.app + test the checkout form (5 min)
9. Post the launch artifacts (Twitter, HN, Reddit, PH) using the pre-written files (10-15 min spread across the day)

**First-rupee path:** After step 9, you wait. Realistic timeline for first ₹399 sale = 2-24 hours after the first Reddit India / Twitter post gains any traction.

**After first rupee lands:** THEN register `burnd.dev` via Hostinger UPI (~₹1,200) using the revenue, connect DNS to Vercel, and upgrade from the free subdomain. Instructions for that are in `notes/queue/2026-04-12-register-burnd-dev.md` (existing file, unchanged).

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

## STEP 1 — Verify your UPI handle

**Time:** 2 minutes

The landing page shows `garvitsurana10@oksbi` as the UPI ID for receiving ₹399 payments. Verify this is YOUR actual UPI handle:

1. Open your UPI app (SBI Pay, Google Pay, PhonePe — whatever you use for SBI)
2. Go to "My UPI IDs" or "Profile"
3. Check that `garvitsurana10@oksbi` is one of your registered IDs
4. If it's different (e.g., `garvitsurana10@sbi` or `garvit@oksbi` or a different bank), note it down — you'll update the landing page in Step 3

**If you don't have a UPI handle at all:** you can create one in any UPI app linked to your savings account. Takes 5 minutes.

**Quick test (optional but reassuring):** Send ₹1 to your own UPI handle from a different UPI app (e.g., send from PhonePe to your SBI UPI handle). If it goes through, the handle works. You'll get ₹1 back in your own account.

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

## STEP 3 — Update the landing page with your correct UPI handle (if different)

**Time:** 2 minutes (skip entirely if `garvitsurana10@oksbi` is correct)

The checkout form is built directly into the landing page — NO Google Form needed. Buyers fill out name + email + transaction ID on your site. FormSubmit.co relays submissions to your Gmail (free, no signup, no branding).

**Only do this if your UPI handle is different from `garvitsurana10@oksbi`:**

Open `src/web/src/pages/LandingPage.tsx` in your editor. Find all instances of:
```
garvitsurana10@oksbi
```
Replace with your actual UPI handle.

Save the file. Rebuild:

```bash
cd "C:\Users\Garvit Surana\Desktop\Projects\ChangeLife\src\web"
npm run build
```

**Commit (only if you changed the UPI handle):**

```bash
cd "C:\Users\Garvit Surana\Desktop\Projects\ChangeLife"
git add src/web/src/pages/LandingPage.tsx
git commit -m "feat: real UPI handle on landing page"
```

---

## STEP 4 — Push code to a public GitHub repo

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

## STEP 5 — Sign up for npm and publish the CLI

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
npx getburnd@latest --version
```

Should print the version. If it does, **the CLI is live on the public npm registry.** That's a real milestone.

---

## STEP 6 — Deploy the landing page to Vercel

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

**Expected outcome:** the build succeeds and Vercel gives you a URL like `getburnd.vercel.app` or `burnd-garvitsurana271.vercel.app`. Open it in a browser.

**You should see:** the landing page rendering at the Vercel URL. The hero, the brutal-facts strip, the 8 detectors, the pricing, the buy section with the inline checkout form.

**Known issue:** clicking "open dashboard" or navigating to /app/insights will show an error state (with a "burnd serve isn't running" hint) because there's no `burnd serve` backend on Vercel. The dashboard is a LOCAL tool, not a cloud one. The landing page works perfectly; the /app/* routes are local-only by design. This is expected and the error state now has a beautiful UI explaining what to do.

**Custom domain comes LATER:** After your first ₹399 sale lands, use the revenue to register `burnd.dev` via Hostinger UPI. Full instructions for the domain + DNS setup are in `notes/queue/2026-04-12-register-burnd-dev.md` and `DEPLOY_INSTRUCTIONS.md`. For now, `getburnd.vercel.app` is your launch URL. Many successful indie products launched on Vercel subdomains.

---

## STEP 7 — Final smoke test

**Time:** 5 minutes

**Test 1: npx getburnd from a clean directory**

```bash
cd /tmp  # or any dir other than src/cli
npx getburnd@latest --version
npx getburnd@latest --top 3
```

**Expected:** version prints, top 3 leaks print.

**Test 2: the landing page at https://burnd.dev**

Open `https://burnd.dev` in Chrome and Firefox (different browsers catch different bugs).

**Expected:**
- Hero loads with "Cut your Claude Code spend by 20-40% in a week"
- "Install command" button shows `$ npx getburnd`
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

## STEP 8 — Launch posts (the marketing layer)

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

## STEP 9 — First-customer email handling

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
