# Google Form — Burning Tokens Fulfillment

**Purpose:** Collect payment confirmation from Indian buyers who paid ₹399 via UPI. You manually send the PDF once you confirm the transaction in your UPI app.

**Google Forms URL:** https://forms.google.com (signed in as garvitsurana10@gmail.com)

## Form metadata

**Title:**
```
Burning Tokens — get your ebook
```

**Description:**
```
Thanks for buying Burning Tokens! Fill this form so I can email you the PDF.

Total time: 60 seconds
Delivery time: within 12 hours (usually within 1 hour if I'm awake)

If you haven't paid yet:
1. Send ₹399 via UPI to: garvitsurana10@oksbi
2. Note down the transaction ID (it's in your UPI app's history)
3. Come back here and fill this form
```

## Form questions (in order)

### Q1 — Your name (short answer, required)

**Question:** `What's your name?`
**Help text:** `First name is fine — this is how I'll address you in the email.`
**Validation:** Text, required

### Q2 — Email address (short answer, required)

**Question:** `Your email address`
**Help text:** `I'll email the PDF to this address. Double-check the spelling.`
**Validation:** Response validation → Regex → `^[\w.+-]+@[\w-]+(\.[\w-]+)+$` → Error text: "Please enter a valid email address"

### Q3 — UPI transaction ID (short answer, required)

**Question:** `UPI transaction ID / UTR number`
**Help text:** `From your UPI app after you sent ₹399 to garvitsurana10@oksbi. It looks like a 12-digit number or a longer reference code.`
**Validation:** Text, required

### Q4 — Payment amount (short answer, required)

**Question:** `Amount paid (in ₹)`
**Help text:** `Should be 399. If you paid more or less, let me know why in the notes field below.`
**Validation:** Number, required

### Q5 — How did you hear about Burnd? (multiple choice, optional)

**Question:** `How did you hear about Burnd? (optional — helps me know what's working)`
**Options:**
- r/developersIndia
- r/ClaudeAI
- r/SideProject
- r/IndieHackers
- Twitter / X
- Hacker News
- ProductHunt
- A friend told me
- Google / search
- Other (please specify below)

### Q6 — UPI handle for refund (optional)

**Question:** `Your UPI handle (optional — only needed if I have to refund you)`
**Help text:** `Leave blank unless you want a refund for any reason. Your money, zero questions asked.`

### Q7 — Anything else? (long answer, optional)

**Question:** `Anything else?`
**Help text:** `Feedback, questions, suggestions, notes about the payment, a hello — whatever. Optional but I read every response.`
**Validation:** Long answer, optional

## Form settings

- **Collect email addresses:** OFF (already asking in Q2)
- **Limit to 1 response:** OFF (someone might buy multiple copies for different emails)
- **Shuffle question order:** OFF
- **Show progress bar:** ON
- **Confirmation message:**

```
Thanks! I got your details. You'll receive the Burning Tokens PDF at the email address you provided within 12 hours (usually within 1 hour if Garvit is awake).

If you don't hear back within 24 hours, something went wrong — email garvitsurana10@gmail.com with the subject "burning tokens not received" and I'll sort it out.

In the meantime, you can run `npx burnd` on your own data right now for free: https://burnd.dev

— Garvit
```

## After form creation

- Copy the form's "Send" link — it'll look like https://forms.gle/ABC123
- Replace the placeholder in `src/web/src/pages/LandingPage.tsx` (search for `forms.gle/PLACEHOLDER-REPLACE-WITH-REAL-FORM`)
- Commit and redeploy the landing page

## Response workflow

Google Forms will email you at garvitsurana10@gmail.com every time someone submits. When you get a notification:

1. Open the form's Responses tab
2. Find the row with the new submission
3. Cross-check the transaction ID in your UPI app (SBI Pay, Google Pay, PhonePe — wherever you check UPI activity)
4. If the transaction is confirmed:
   - Open Gmail, compose a new email to the buyer
   - Subject and body from `first-customer-email.md`
   - Attach `notes/ebook/burning-tokens.pdf` (generate from the HTML using browser Ctrl+P → Save as PDF, save once, reuse)
   - Send
5. Mark the row as "delivered" by highlighting it yellow in the sheet

### If the transaction ID is NOT in your UPI app

- Wait 10 minutes (bank-to-bank UPI sometimes has a short delay)
- If still not there, reply to the buyer asking for a screenshot of their UPI payment confirmation
- If they can't provide one, refund ₹0 (there's nothing to refund) and don't send the PDF

### If someone sent the wrong amount

- More than ₹399: thank them, send the PDF, offer to refund the difference
- Less than ₹399: reply explaining and asking them to send the balance

### If someone submits the form with a transaction ID you already processed

- It's a duplicate — they probably filled the form twice out of anxiety
- Send them a friendly "already sent the PDF on [date] — check your inbox or spam folder"

## Security notes

- Do NOT publish the form's "edit" link anywhere — only the "send" link
- Check the form for spam submissions occasionally (usually captcha catches them but not always)
- If you see more than 5 responses claiming the same UPI transaction ID, someone is trying to abuse the flow — ignore them

## Scale considerations

Google Forms handles up to ~10,000 responses per form comfortably. If you scale past that, migrate to a more proper tool (Tally, Airtable form, etc). Not a concern for v1.
