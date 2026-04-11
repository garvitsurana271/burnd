# Burnd — Domain Verification

**Date checked:** 2026-04-11
**Method:** RDAP lookup (Registration Data Access Protocol — modern WHOIS replacement)
**Checked by:** Claude (autonomous, Week 1 Task 2)

## Results

| TLD | Status | Notes |
|---|---|---|
| **burnd.com** | ❌ TAKEN | Registered 2010-10-12 (16 years ago). Expires 2026-10-12. Nameservers: `NS1.AFTERNIC.COM`, `NS2.AFTERNIC.COM` — **parked on Afternic for sale** (Afternic is a domain reseller marketplace owned by GoDaddy). Owner is a speculative squatter, not an active competitor. Last RDAP update 2025-10-09 indicates the owner is maintaining/listing it actively. Listed price unknown without inquiring. |
| **burnd.dev** | ✅ AVAILABLE | Charleston Road Registry (Google's .dev registry) returned 404 "burnd.dev not found" — the canonical RDAP signal that the domain is unregistered. |
| **burnd.io** | ✅ AVAILABLE | rdap.org returned 404 — domain unregistered. |

## Decision

**Primary domain to register: `burnd.dev`** (Tier 1 decision, no escalation needed).

### Why burnd.dev over the alternatives

1. **`.dev` is the canonical dev-tool TLD in 2026.** Vercel uses `vercel.app` and `vercel.dev`, Cloudflare uses `cloudflare.dev`, Railway is `railway.app`, Bun is `bun.sh` and `bun.dev`. The convention is set: when a developer sees `something.dev`, they immediately understand it's a developer tool. This is free positioning every time the domain is mentioned.
2. **Auto-HTTPS via HSTS preload.** Every `.dev` domain is on the HSTS preload list, meaning browsers REFUSE to load it over HTTP. This forces TLS from day one — no "remember to set up HTTPS" footgun, no insecure dev environments. Firebase Hosting and Vercel both auto-provision Let's Encrypt certs that satisfy this immediately.
3. **`.io` is acceptable but slightly dated.** It was the indie-tool default 2015–2020. Still works, but `.dev` reads more current.
4. **`.com` not pursued.** Buying squatted domains from Afternic is typically $500–$5,000+ for short pronounceable words. Not worth it when `.dev` is free at ~₹1,200/year and is the better TLD anyway.

### Registration priority order (in case .dev fails at the registrar checkout)

1. **burnd.dev** — primary
2. **burnd.io** — fallback if .dev fails for any reason (registrar issue, payment issue, last-minute taken)
3. **STOP** — if both fail. Re-open the naming brainstorm and pick from the design doc Appendix A backup list `{Cinchd, Squelchd, Tampd, Quelld}` per the rejection saga, run them through the same RDAP verification.

## What I'm NOT doing right now

- Not registering yet — that's Task 3 (queued for Garvit because it costs money).
- Not setting up DNS — Week 12, alongside the landing page.
- Not setting up email on the domain — Week 11, alongside Lemon Squeezy setup. Will use Gmail forwarding to `garvitsurana10@gmail.com`.
- Not pursuing burnd.com — the cost-benefit doesn't justify it.

## Registration

> **To be filled in by Garvit after he completes the queued domain registration in `notes/queue/2026-04-12-register-domain.md`.**

(After registration, this section gets the registrar name, exact domain, year-1 cost, expiry date, auto-renew status, etc.)
