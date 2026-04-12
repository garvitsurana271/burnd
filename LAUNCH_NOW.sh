#!/usr/bin/env bash
# ============================================================
# BURND LAUNCH SCRIPT — run this ONE TIME to go live
# Run from: C:\Users\Garvit Surana\Desktop\Projects\ChangeLife
# Time: ~10-15 minutes (most of it is waiting for installs)
# ============================================================
set -e

GH="/c/Program Files/GitHub CLI/gh.exe"
REPO_ROOT="C:/Users/Garvit Surana/Desktop/Projects/ChangeLife"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║          BURND LAUNCH — 4 steps to live              ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ─── STEP 1: GitHub auth + create public repo ───────────────
echo "▶ STEP 1/4 — GitHub login + create public repo"
echo "  A browser window will open. Log in as garvitsurana271."
echo ""
"$GH" auth login --web --git-protocol https
echo ""
echo "  Creating public repo: garvitsurana271/burnd"
"$GH" repo create garvitsurana271/burnd \
  --public \
  --description "Find what's burning a hole in your AI coding budget. Local-first cost-control for Claude Code." \
  --homepage "https://getburnd.vercel.app" \
  --push \
  --source "$REPO_ROOT" \
  --remote origin 2>/dev/null || true

cd "$REPO_ROOT"
git push -u origin main 2>/dev/null || git push origin main
echo "  ✓ Code is live at github.com/garvitsurana271/burnd"
echo ""

# ─── STEP 2: npm publish ────────────────────────────────────
echo "▶ STEP 2/4 — npm account + publish package"
echo "  If you don't have an npm account yet, this will create one."
echo "  Username: garvitsurana271   Email: garvitsurana10@gmail.com"
echo ""
cd "$REPO_ROOT/src/cli"
npm adduser
npm publish --access public
echo "  ✓ Package live at npmjs.com/package/burnd"
echo "  ✓ 'npx burnd' now works for everyone"
echo ""

# ─── STEP 3: Vercel deploy ──────────────────────────────────
echo "▶ STEP 3/4 — Vercel deploy"
echo "  A browser window will open. Log in with garvitsurana10@gmail.com."
echo ""
cd "$REPO_ROOT"
vercel login
vercel --prod --yes \
  --name getburnd \
  --build-env NODE_ENV=production \
  2>&1
echo "  ✓ Dashboard live at https://getburnd.vercel.app"
echo ""

# ─── STEP 4: Smoke test ─────────────────────────────────────
echo "▶ STEP 4/4 — Smoke test"
echo ""
echo "  Open these in your browser and verify:"
echo "  1. https://getburnd.vercel.app          → landing page loads"
echo "  2. https://getburnd.vercel.app/app       → dashboard (will show no data — that's fine)"
echo "  3. Run in a new terminal: npx burnd       → should print top leaks"
echo ""
echo "  If all 3 work, you're live. Start posting:"
echo "  → Twitter thread first (notes/launch/twitter-thread.md)"
echo "  → Then r/developersIndia (notes/launch/reddit-r-developersindia.md)"
echo "  → Then HN Show HN at 11:00 IST (notes/launch/show-hn-post.md)"
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   burnd is live. Time to get your first rupee. 🔥    ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
