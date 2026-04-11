# npm publish checklist — burnd CLI

> 5 steps, ~5 minutes total. Do this AFTER `burnd.dev` is registered and the GitHub repo is public (so the README links work).

## Pre-flight

- [ ] `npm whoami` returns `garvitsurana271` (you're logged in)
- [ ] `npm run typecheck` passes (clean exit)
- [ ] `npm test` shows 49/49 passing
- [ ] `npm run build` succeeds and produces `dist/index.js`
- [ ] `./dist/index.js` has a shebang line `#!/usr/bin/env node` at the top
- [ ] `./dist/index.js` is executable (chmod 755) — the build script does this automatically

## Dry-run check

```bash
npm pack --dry-run
```

This prints what would be published without actually publishing. You should see:

- `dist/` files (all the compiled JS + d.ts files)
- `README.md`
- `LICENSE`
- `package.json`

You should NOT see:

- `src/` (the TypeScript source)
- `__tests__/` (the test files)
- `node_modules/` (the installed deps)
- `.git/` or anything else

If you see anything unexpected, check the `files` field in `package.json` — only what's listed there (plus README.md, LICENSE, package.json by default) should be published.

## Check the package size

```bash
npm pack
ls -lh *.tgz
```

Expected size: ~20-40 KB. Anything over 100 KB is a sign you accidentally included node_modules or source maps. Delete the tarball after checking (it's just for inspection):

```bash
rm burnd-*.tgz
```

## Publish

```bash
npm publish
```

Expected output:
```
+ burnd@0.0.1
```

If you get an error:

**"403 Forbidden — you do not have permission to publish burnd"**
→ Someone else owns the `burnd` name on npm. Fallback: change `package.json` `name` to `burnd-cli` and republish. Update all docs that reference `npx burnd` to `npx burnd-cli`.

**"402 Payment Required"**
→ The package is private by default. The `publishConfig: { access: "public" }` in package.json should prevent this, but if it happens, run `npm publish --access public` explicitly.

**"One-time password required"**
→ You have 2FA enabled (good). Enter the OTP from your auth app.

**"This package requires 2FA"**
→ Enable 2FA in your npm account settings: https://www.npmjs.com/settings/garvitsurana271/profile → Enable two-factor authentication → auth-and-writes

## Verify the publish

```bash
cd /tmp
npx burnd@latest --version
```

Should print `burnd 0.0.1`.

```bash
npx burnd@latest --help
```

Should print the help text.

```bash
npx burnd@latest --top 3
```

Should scan your `~/.claude/projects/` and print the top 3 leaks. **This is the real test — proves the published package actually works against real data.**

## After publish

- [ ] Visit `https://www.npmjs.com/package/burnd` — the package page should exist
- [ ] Star your own package on npm (small thing but looks less dead)
- [ ] Take a screenshot of the npm page for launch posts
- [ ] Update the landing page's install command if you used a fallback name (burnd-cli)

## If you need to publish an update

Burnd uses semver. Bump the version in `package.json` before re-publishing:

```bash
npm version patch   # 0.0.1 -> 0.0.2 (bug fixes)
npm version minor   # 0.0.1 -> 0.1.0 (new features)
npm version major   # 0.0.1 -> 1.0.0 (breaking changes)
```

Then:

```bash
npm publish
```

Remember: you can NOT un-publish a name that's been live for >72 hours. Deprecate instead:

```bash
npm deprecate burnd@0.0.1 "Please upgrade to 0.0.2"
```

## If something goes catastrophically wrong

- **If you accidentally published with secrets in it:** IMMEDIATELY run `npm unpublish burnd@0.0.1` (only works within 72 hours of publish). Then rotate the leaked secret. Then publish a clean version.
- **If the CLI crashes on first run for users:** publish a patch version (0.0.2) with the fix within 24 hours. This is the most important post-launch task.
- **If someone reports the cost calculation is off:** verify against Anthropic's actual pricing page (the rates in pricing.ts are approximate for early 2026). Fix and publish a patch version.
