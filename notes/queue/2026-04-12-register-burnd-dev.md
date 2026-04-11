# QUEUE: Register `burnd.dev` domain

**Created:** 2026-04-11 by Claude (Week 1 plan, Task 3)
**Estimated time:** 8 minutes (real time, including waiting for UPI confirmation)
**Cost:** ~₹1,200–₹1,500 (Year 1, includes WHOIS privacy at Hostinger)
**Why:** Burnd needs a registered domain before the CLI can ship with a `--help` URL (Week 9), before the landing page (Week 12), and before launch (Week 16). Doing it Week 1 also locks in the name so nobody else grabs `burnd.dev` while we're building.

## What you're doing in plain words

You're buying the domain `burnd.dev` from **Hostinger India**. It's just like buying anything online: search, add to cart, pay via UPI. Total real time on your phone: ~8 minutes. The Year 1 cost is around ₹1,200–₹1,500 — first-year domain pricing varies a bit week to week.

**The TLD is `.dev`, not `.com`.** I checked: `burnd.com` has been parked by a domain squatter since 2010 and isn't worth buying. `burnd.dev` is free, is the canonical TLD for developer tools in 2026, and forces HTTPS automatically (which is exactly what we want).

## Click-by-click

1. **Open** [https://www.hostinger.in/domain-name-search](https://www.hostinger.in/domain-name-search) on your phone or laptop. (Your phone is fine — UPI works either way.)
2. **Search for** exactly: `burnd.dev`
   - If Hostinger shows it as available → continue.
   - If Hostinger says it's taken → **STOP, tell Claude immediately.** Don't pick a similar variant on your own. The fallback per the design doc is `burnd.io`, not anything else.
3. **Click "Add to cart"** next to `burnd.dev`.
4. On the upsells page, **decline these:**
   - "Premium DNS" → No
   - "Professional Email" → No (we'll use Gmail forwarding)
   - "Web Hosting" → No (we'll use Firebase Hosting)
   - "SSL Certificate" → No (`.dev` enforces HTTPS automatically; Firebase auto-provisions Let's Encrypt)
   - "Website Builder" → No
5. On the upsells page, **ENABLE this one:**
   - "Domain Privacy" / "WHOIS Privacy Protection" → **YES** (it's free at Hostinger and hides your home address from public WHOIS lookups — important because you're 16, and your home address shouldn't be one Google search away)
6. **Cart should now show:**
   - 1 × `burnd.dev` for 1 year
   - WHOIS privacy: enabled (free)
   - Total: roughly ₹1,200–₹1,500 (varies by Hostinger's current promo)
7. **Click "Continue to checkout."** If not signed in, create an account using:
   - Email: `garvitsurana10@gmail.com` (your real one)
   - Password: something you'll remember — store in a password manager if you have one
   - Phone: your real phone (for OTP)
8. **Account details:** use your own name (Garvit Surana). For address, your home address is fine — WHOIS privacy is on, so it's not public.
9. **Payment:** select **UPI**. Hostinger will show a UPI QR code or push a request to your UPI app (Google Pay / PhonePe / Paytm — whichever you use). Approve in your UPI app, enter PIN.
10. **After payment confirms**, you'll get an email confirmation. Check your inbox.
11. **In your Hostinger dashboard**, find the domain under "My Domains" and **toggle Auto-Renew ON.** This is *critical* — auto-renew prevents the domain from accidentally expiring during your board exam lockdown phase (Nov–Feb) when you might forget to pay.
12. (Optional, recommended) **Take screenshots** of: the payment success page, the email confirmation, the dashboard showing the domain. Saves time if anything ever needs disputing.

## Decisions you might be asked to make during checkout

- **"1 year vs multi-year discount?"** Pick **1 year**, unless multi-year is meaningfully cheaper (>30% off). We may migrate registrars in Year 2 if you get an international card and we move to Cloudflare Registrar (which is at-cost, the cheapest long-term option).
- **"Add `.com` / `.net` / `.in` for ₹X extra?"** No. Just the one. We don't need defensive registrations at this stage.
- **"Trustpilot review prompt?"** Skip.
- **"Free trial of [some service]?"** Skip everything.

## Why Hostinger and not GoDaddy / BigRock / Cloudflare

- **Hostinger India** — verified UPI-friendly, free WHOIS privacy, cheapest first-year pricing on `.dev` for Indian customers as of early 2026. Default choice.
- GoDaddy India — also UPI-friendly, free WHOIS privacy, slightly pricier. Use as fallback if Hostinger checkout fails.
- BigRock — UPI-friendly, Indian-HQ, but pricier and less polished UI.
- **Cloudflare Registrar** — at-cost pricing (would be cheapest long-term) BUT requires an international credit/debit card, which you don't have. **Skip for Year 1.** Migrate in Year 2 if you get a card.

## After you're done

Tell Claude exactly: **"queue/2026-04-12-register-burnd-dev done — registered burnd.dev for ₹X, expires DD/MM/2027"** (replace X and the date with the actuals).

Claude will:
1. Verify the domain resolves via a DNS lookup (just checking it exists; not asking you to point it anywhere yet)
2. Append the registration details to `notes/domain-verification.md`
3. Delete this queue file
4. Update the session log with `RESOLVED:` entry
5. Continue with the rest of Week 1 (which is happening in parallel anyway — none of Tasks 4–8 depend on this)

## If something goes wrong

- **Hostinger UPI fails after multiple tries** → switch to GoDaddy India ([https://in.godaddy.com/domains/domain-name-search](https://in.godaddy.com/domains/domain-name-search)). Same flow, slightly pricier (~₹2,000 vs ~₹1,300). Your tradeoff for ₹700 is "use the second-cheapest registrar instead of waiting" — worth it.
- **Both Hostinger AND GoDaddy UPI fail** → tell Claude. Claude will queue an alternative path (probably BigRock or, in last resort, asking mom to use her card for ONE transaction). The mom-touch is the absolute last resort.
- **`burnd.dev` is suddenly showing as taken** → **STOP**, tell Claude immediately, don't improvise. Fall back to `burnd.io` only after Claude confirms via fresh RDAP check.
- **You're nervous about entering bank info on Hostinger** → totally normal. Hostinger India is a legit company (subsidiary of a Lithuanian web-hosting parent), processes thousands of Indian transactions daily, and UPI itself is sandboxed by your UPI app — even if Hostinger were sketchy, your UPI PIN never leaves your app. The only thing they get is the rupee amount and a transaction ID.

## When to do this

**Anytime in the next 7 days.** It's not blocking the rest of Week 1 (Claude is doing the JSONL format study + anonymization spec in parallel). If you want to knock it out tonight in a 10-minute break before bed, do that. If you'd rather wait until Sunday, also fine. The only hard deadline is "before Week 12" which is 11 weeks away.
