# First-customer email template

**When to send:** Right after a buyer pays ₹399 via UPI and submits the Google Form with their transaction ID + email address.
**Who from:** garvitsurana10@gmail.com
**Response time target:** Within 12 hours. Ideally within 1 hour if you're awake.

**Three versions below. Use version 1 for the first 10 customers personally. After that, switch to version 2 (templated). Version 3 is for anyone who emails you without going through the form (fallback/international).**

---

## Version 1 — first 10 customers (personal, no template feeling)

**Subject:** Burning Tokens — thanks for being customer #N 🔥

**Body:**

```
Hey [Name from Google Form],

Burning Tokens is attached. You were my #N buyer — genuinely means a lot given this launched yesterday / this morning / this hour.

Two quick things:

1. If the book is useful, the best possible thing you can do is run `npx burnd` on your own data and tell me what you find. If there's a leak pattern I didn't cover in the book, I want to know — I'll add it to v1.1 and you get the update free.

2. If the book is NOT useful, tell me why. I've been working on this for weeks and I want to know where it falls short. I won't get defensive. Honest feedback from customer #1-10 is the most valuable thing I can get right now.

Happy to answer any questions about the patterns in the book, or about running Burnd on your own data, or about anything else really.

Thanks for trusting me with ₹399 — I'm 16 and this is my first real revenue, I'm not going to forget it.

— Garvit

---

P.S. If you're on Twitter/X and feel like telling one other developer, that would genuinely make my week. No pressure though — the purchase alone is already more than I was hoping for on launch day.
```

**Personalization rules for version 1:**
- Use their actual first name (extract from the form)
- Write the buyer number ("customer #3", "customer #7") in the subject line — people LOVE this
- Look up their email domain for context (is this a developer at a startup? a student? a freelancer?) and reference it in the reply IF you can do so without being creepy
- Send from your own Gmail, not a no-reply address
- Attach the PDF (not a link — people don't trust download links)

---

## Version 2 — after customer #10, templated but still personal

**Subject:** Burning Tokens (your PDF is attached)

**Body:**

```
Hey [Name],

Burning Tokens is attached. Thanks for buying!

Quick links:

→ Run `npx burnd` on your own data to see the patterns in action: https://getburnd.vercel.app
→ GitHub (report bugs, suggest detectors): https://github.com/garvitsurana271/burnd
→ If you find a leak pattern the book doesn't cover, I want to know — reply to this email

If the book helps you save even ₹4,000 (~10× what you paid), consider sharing it with one other developer. That's the best thing you can do to help me ship v2.

Any questions, reply to this email. I read everything.

— Garvit
```

---

## Version 3 — international buyers who emailed directly (no form)

**Subject:** Re: buy burning tokens — here's how international payment works

**Body:**

```
Hi [Name],

Thanks for reaching out! I'm 16 and in India, which means I can't legally sign up for Stripe / Lemon Squeezy / Gumroad as a seller under my own name yet. So international payment is manual for now. Three options:

**Option 1: Wise (best)**
I can send you my Wise recipient details. You send me $4.50 USD (or equivalent in your currency). Takes 1-3 business days. After I confirm receipt, I email you the PDF.

**Option 2: PayPal friends-and-family**
If you have PayPal and are comfortable sending friends-and-family (not a business transaction), I can accept that. Same amount, usually instant. PayPal-F&F is for trust-based transactions between people who know each other, so only use this if you're comfortable.

**Option 3: Wait**
I'll turn 18 in [X months] and set up a real merchant-of-record account. If you're not in a rush, you can wait — I'll email you when the normal checkout is live.

Let me know which option works for you. If you have another idea (Bitcoin, bank wire, crypto, whatever), I'm open to it.

Also — since you're emailing me directly, here's a small thing: tell me where you heard about Burnd and what made you want to buy the book. This helps me a lot at this early stage.

Thanks for your patience and for caring about a 16-year-old Indian builder enough to DM me about international payment. That's genuinely cool.

— Garvit
```

---

## Subject-line variations (if the first one isn't landing)

- `Burning Tokens — your PDF is attached (thanks customer #N!)`
- `Re: your Burning Tokens order — attached`
- `Your Burnd ebook is ready, [Name]`
- `Burning Tokens (attached) + a small ask`

## Anti-patterns to avoid

- **Do not send from a no-reply address.** Send from garvitsurana10@gmail.com. Personal gmail is a feature, not a bug, at this stage.
- **Do not use HTML email with logos and headers.** Plain text. People trust plain text.
- **Do not bcc anyone.** Each email is individual.
- **Do not ask for a review before they've read the book.** Asking for a share is fine; asking for a review is premature.
- **Do not send 3 follow-up emails if they don't reply.** One is enough. Their purchase was the transaction; everything else is a bonus.

## If a customer reports a problem with the book

**They say:** "I can't open the PDF" / "The download link is dead"
**You say:** "Sorry about that — here's a fresh link: [re-attach]. If it still doesn't work, tell me what device/app you're using and I'll convert to a different format."

**They say:** "The information in chapter X is wrong" / "Your numbers don't match what I see"
**You say:** "Thank you — can you send me the specific line? I want to fix it in v1.1 and credit you. I'll email the update to every existing buyer for free."

**They say:** "I want a refund"
**You say:** "No problem. Refunding ₹399 to your UPI ID now. Reply with your UPI handle and it's done within the hour. If you feel like sharing what went wrong, that would help me, but zero obligation."

## If a customer turns into a referrer

(Some customers will tell other people about the book without you asking. When you hear about one of these sales:)

**You say:** "Hey, quick thanks — [new customer] told me you recommended Burning Tokens to them. I really appreciate it. If you ever want to write a short quote I can put on the landing page, I'd love that. And if there's anything you need from me (another copy for a friend, a specific question answered, anything), just reply."

Referral customers are your most valuable asset. Treat them like gold.
