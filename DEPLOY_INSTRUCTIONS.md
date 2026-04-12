# Deploy Instructions — burnd.dev → Vercel

Two paths: GUI (recommended, ~8 min) or CLI (faster once you know it, ~3 min).

## Path A — Vercel Dashboard (recommended first time)

1. Go to https://vercel.com/new
2. Click **Import** next to `garvitsurana271/burnd` in the repo list
   - If you don't see the repo, click "Adjust GitHub App Permissions" and grant access
3. On the Configure Project screen:
   - **Project Name:** `getburnd` (must be unique in your account — this gives you `getburnd.vercel.app`)
   - **Framework Preset:** leave as `Other` or `Vite` (the vercel.json overrides build settings anyway)
   - **Root Directory:** leave as `./` (root). The `vercel.json` at the repo root handles the `src/web` subdirectory build.
   - **Build Command:** leave empty — vercel.json provides this
   - **Output Directory:** leave empty — vercel.json provides this
   - **Install Command:** leave empty — vercel.json provides this
   - **Environment Variables:** none
4. Click **Deploy**
5. Wait 1-3 minutes. Vercel will show build logs. Expected final line: `✓ Deployment completed`.
6. Once deployed, Vercel gives you `getburnd.vercel.app`. Open it — you should see the landing page.

## Path B — Vercel CLI (faster once set up)

```bash
# Install Vercel CLI globally (one-time)
npm install -g vercel

# From the repo root
cd "C:\Users\Garvit Surana\Desktop\Projects\ChangeLife"
vercel login    # opens a browser to auth — use garvitsurana10@gmail.com

# First deploy (interactive — answer prompts)
vercel

# Subsequent deploys
vercel --prod
```

When prompted:
- "Set up and deploy" → Y
- "Which scope" → your account (garvitsurana10@gmail.com)
- "Link to existing project?" → N (this is a new project)
- "What's your project's name?" → `getburnd`
- "In which directory is your code located?" → `.` (the repo root — vercel.json handles the subdirectory)
- Vercel auto-detects the `vercel.json` and uses its settings.

## Connect burnd.dev to the Vercel project

After the project is deployed at `getburnd.vercel.app`:

1. In Vercel dashboard → your `getburnd` project → **Settings → Domains**
2. Add domain: `burnd.dev` and `www.burnd.dev`
3. Vercel will show DNS records you need to add at Hostinger

## Hostinger DNS setup

In Hostinger dashboard → Domains → burnd.dev → DNS / Name Servers:

Add these records (replace the existing parking records first):

| Type | Name | Value | TTL |
|---|---|---|---|
| A | @ | `76.76.21.21` | Auto |
| CNAME | www | `cname.vercel-dns.com` | Auto |

(Vercel may show slightly different values — use whatever Vercel displays in their UI if it differs.)

Save. Wait 5-15 minutes for DNS propagation.

Test propagation:

```bash
nslookup burnd.dev
# expected: 76.76.21.21 (or Vercel's latest IP)
```

Once the DNS resolves to Vercel, the custom domain is live at `https://burnd.dev` with automatic Let's Encrypt SSL.

## After deploy — verify these

- [ ] `https://burnd.dev` loads the landing page (not the parking page from Hostinger)
- [ ] `https://www.burnd.dev` also loads the landing page (CNAME record working)
- [ ] Browser shows a green padlock (SSL cert is live)
- [ ] The hero "Cut your Claude Code spend by 20-40% in a week" is visible
- [ ] The "Install command" button shows `$ npx burnd`
- [ ] The buy section shows the real UPI handle and Google Form URL (NOT the placeholders)
- [ ] Opening `https://burnd.dev/app/insights` loads the dashboard shell (it may say "error — burnd serve is not running" because the dashboard needs a local CLI backend — that's expected; the landing page is the sellable surface, the dashboard is the local-tool surface)

## Known quirks

- **The /app/* routes will show an error** because `burnd serve` is not running on Vercel. This is EXPECTED. The dashboard is a local tool; Vercel only hosts the marketing landing page.
- The landing page still renders because it has no API calls — it's pure presentation.
- If you want the /app/* routes to do something sensible on Vercel, the landing page could link to `npx burnd serve` install instructions when someone clicks them. v0.2 feature.

## Redeploying after changes

Any `git push` to the `main` branch auto-triggers a Vercel rebuild (Vercel's GitHub integration). You don't need to manually redeploy.

If you want to redeploy without a push:

```bash
vercel --prod
```

## Rolling back a bad deploy

In Vercel dashboard → Deployments → find the last good deploy → click the `...` menu → Promote to Production. Takes 30 seconds.
