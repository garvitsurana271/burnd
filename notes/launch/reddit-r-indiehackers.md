# Reddit — r/IndieHackers

**Best time:** Tuesday-Thursday afternoon EST
**Tone:** revenue-focused, honest about the numbers, lean into the bootstrapped angle
**Flair:** "Launched" or similar

## Title

```
I'm 16 and I can't legally sign up for Stripe — here's how I'm launching my first SaaS via UPI direct (₹399 ebook launch + free CLI)
```

## Body

```
r/IndieHackers,

This post is half about the product, half about the weird legal situation of trying to launch a software business as a minor in India. Hopefully someone finds the latter useful.

## The quick version

I'm Garvit, 16, in my senior year of high school in Guwahati, India. I built a local-first CLI + dashboard called Burnd that finds leaks in your Claude Code spend. The product is real — it runs on my own $13,631 of Claude Code history and finds $76 of waste via 8 detectors. The CLI is free and open-source. There's an optional companion ebook priced at ₹399 (~$4.50 USD) that walks through all 8 patterns with real data.

Source: https://github.com/garvitsurana271/burnd
Landing: https://burnd.vercel.app

## The age / legal situation (the part r/IndieHackers will care about)

Every standard indie-maker payment rail requires the seller to be 18+:

- **Stripe:** 18+ in India, requires PAN + business KYC
- **Lemon Squeezy:** 18+, requires govt ID upload
- **Paddle:** 18+, requires business registration in some jurisdictions
- **Gumroad:** 18+ for sellers, payouts via PayPal which has its own age rules in India
- **Razorpay Business mode:** 18+, requires PAN + business KYC
- **Ko-fi / Buy Me a Coffee:** 16+ in some jurisdictions but payouts go through Stripe
- **PayPal (India):** essentially unusable for a minor personal account

The "obvious" workaround — put your parent's name on the account — is legal but asks your parent to act as a merchant-of-record for a business they don't run. In my case that's my mom, who is very supportive but working full-time and should absolutely not be the one answering customer emails or dealing with chargebacks. So I'm trying to build a launch path that requires ZERO parent involvement until the revenue is high enough that the mom-as-LS-seller setup is worth her 15 minutes of one-time signup.

The answer I landed on: **UPI direct, India first, international second**.

## The UPI direct flow

UPI is universal in India. Every Indian has a UPI handle linked to their bank account. Minors can have UPI handles (on minor savings accounts). UPI is instant, free, and has no 18+ requirement because it's just a bank transfer, not a merchant transaction.

So the checkout is:

1. Buyer opens my landing page (burnd.dev)
2. Clicks "Buy via UPI"
3. Sees my UPI ID (like `garvitsurana10@oksbi`) and the amount (₹399)
4. Pays from their own UPI app — Google Pay, PhonePe, Paytm, BHIM, whatever
5. Fills a Google Form with their transaction ID + email address
6. I email them the ebook PDF within a few hours (manually, for now)

This is how a surprising number of Indian indie creators actually sell courses, templates, and ebooks. Zero platform fees, zero KYC, zero age requirement. Legally it's just a person-to-person bank transfer for a digital good.

## The international workaround

For international buyers, I ask them to email me. Case-by-case:
- **Wise:** they send me INR directly, slow but real
- **PayPal friends-and-family:** works if they trust me enough to not flag
- **Bitcoin:** if they really want, I have a wallet
- **"I'll wait until you turn 18"** — the honest answer for everyone else

I'm hoping international buyers are <10% of volume at launch. If they're >50%, I'm going to have to accelerate the mom-as-LS-registered-seller path much sooner than I'd like.

## The revenue plan

**Phase 1 (now — till I turn 18):** The ebook at ₹399 is the only paid product. Target: first 50 sales at ₹399 = ₹19,950 (~$240). That's not life-changing money but it's a first rupee, and the unit economics work because it's pure profit (no platform fees, no refunds infrastructure, no customer-support cost — I email the PDF and I'm done).

**Phase 2 (after first 50 sales):** Raise ebook to ₹599. Use some of the revenue to run Instamojo or Razorpay through my mom's account (one-time signup, then I operate it). Launch the $9/mo SaaS tier with cloud sync, weekly email reports, historical trend analysis. This is where real MRR comes from.

**Phase 3 (after I turn 18 — 2027):** Migrate to Stripe/Lemon Squeezy directly under my own name. Drop the mom dependency.

## What I learned from building this

- **Local-first is a killer feature for privacy-conscious buyers.** My initial design had Firebase as the dashboard backend. I flipped it: the CLI runs its own HTTP server locally, and Firebase became an optional post-v2 upgrade. Now "your data never leaves your machine" is literally true by default, which is a much stronger positioning than "your data is encrypted in transit."
- **The ebook is often a better first product than the SaaS.** The SaaS has infrastructure, auth, billing, support — all of which I can't legally set up yet. The ebook has zero infrastructure. I write it once and I deliver it by email. It's also a much clearer proof of competence than a dashboard someone might glance at for 30 seconds.
- **The 16yo angle cuts both ways.** It's great for the hook (social proof of unusual builder) but I have to be careful not to lean on it too hard. People get skeptical fast if it feels like the whole pitch is "I'm young." So I frame it once at the top and let the actual product data carry the rest.

## Numbers I'd love to share back with r/IndieHackers

First-rupee target: ₹399 (one sale) within 24 hours of launching this post + the HN post + the Twitter thread.

Realistic first-week target: 5-15 sales = ₹2,000 - ₹6,000 (~$25-75).

Ambitious first-month target: 50 sales = ₹19,950 (~$240). If I hit this I'll post an update.

Honest first-month floor: 0 sales. I might just not find my audience and that's fine — the CLI + ebook are permanent artifacts I can keep marketing, and the dashboard will be useful to ME whether or not anyone else buys.

## Ask

If you use Claude Code and have ever wondered where your API money goes: please try `npx burnd` on your own data and tell me what you find. The CLI + dashboard are free forever. The ebook is ₹399 if you want it, but the free CLI covers the main use case.

Also: if you have experience running a micro-SaaS or productized service in India (especially with minor / under-18 founders), I'd love to hear your war stories. I'm pretty sure I'm going to make at least 3 mistakes in the next 2 months that someone here has already made and could warn me about.

Thanks r/IndieHackers.

— Garvit
```

## What to reply to

r/IndieHackers will generate questions about:
- The under-18 legal status (answer honestly, don't hide it)
- Indian payment infrastructure (this is your differentiation — explain it well)
- Whether you should just incorporate (answer: too much overhead for pre-revenue, will do after hitting ₹50k/mo)
- Whether the ebook + free CLI combo dilutes the product (answer: no, the CLI is top-of-funnel marketing for the ebook which is top-of-funnel marketing for the SaaS)

Don't reply to:
- "You should use Stripe Atlas" (legal but way too expensive for pre-revenue)
- "Why not just have your parent sign up?" (answered in the post — respect people's ability to read)
