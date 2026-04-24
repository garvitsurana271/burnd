// POST /api/dodo-webhook
// Receives payment events from Dodo Payments and delivers license keys.
//
// Flow:
//   1. Customer pays on Dodo checkout
//   2. Dodo POSTs a signed event here
//   3. We verify the signature
//   4. We generate the BURND-XXXX-XXXX-XXXX-XXXX key for their email
//   5. We send it via Resend transactional email
//
// Register this URL in Dodo dashboard:
//   Settings → Webhooks → Add endpoint → https://getburnd.vercel.app/api/dodo-webhook
// Subscribe to events: payment.succeeded, subscription.active
//
// Env vars needed in Vercel:
//   DODO_WEBHOOK_SECRET  — from Dodo Settings → Webhooks → Signing secret
//   RESEND_API_KEY       — from resend.com
//   RESEND_FROM_EMAIL    — e.g. "Burnd <keys@getburnd.vercel.app>" or a verified domain

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac } from 'node:crypto';
import nodemailer from 'nodemailer';

const DODO_WEBHOOK_SECRET = process.env['DODO_WEBHOOK_SECRET'] ?? '';
const DODO_WEBHOOK_SECRET_TEST = process.env['DODO_WEBHOOK_SECRET_TEST'] ?? '';

// Gmail SMTP path — free, works for any recipient, used while we don't have
// a verified Resend domain. Replace with Resend once `RESEND_FROM_EMAIL` is
// backed by a verified domain.
const GMAIL_USER = process.env['GMAIL_USER'] ?? '';
const GMAIL_APP_PASSWORD = process.env['GMAIL_APP_PASSWORD'] ?? '';

// Resend is kept wired for the email-capture / weekly-digest path but the
// webhook no longer uses it (free tier rejects non-owner recipients).
const RESEND_API_KEY = process.env['RESEND_API_KEY'] ?? '';
const RESEND_FROM_EMAIL = process.env['RESEND_FROM_EMAIL'] ?? 'Burnd <onboarding@resend.dev>';

// Live product IDs (from Dodo live mode).
const PRODUCT_MONTHLY = process.env['DODO_PRODUCT_MONTHLY'] ?? '';
const PRODUCT_LIFETIME = process.env['DODO_PRODUCT_LIFETIME'] ?? '';

// Test product IDs (from Dodo test mode). Lets us run smoke-tests against the
// same production webhook endpoint without disrupting live flow.
const PRODUCT_MONTHLY_TEST = process.env['DODO_PRODUCT_MONTHLY_TEST'] ?? '';
const PRODUCT_LIFETIME_TEST = process.env['DODO_PRODUCT_LIFETIME_TEST'] ?? '';

const SECRET_KEY = 'burnd-pro-v1-garvit-2026'; // must match license.ts

// ── Key generation (mirrors license.ts generateKey) ───────────────────────

function generateKey(email: string, monthStr: string): string {
  const payload = email.toLowerCase().trim() + ':' + monthStr;
  const hash = createHmac('sha256', SECRET_KEY).update(payload).digest('hex').slice(0, 16).toUpperCase();
  return `BURND-${hash.slice(0, 4)}-${hash.slice(4, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}`;
}

function currentMonthStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ── Webhook signature verification ────────────────────────────────────────
// Dodo uses the Standard Webhooks spec (https://www.standardwebhooks.com).
// Three headers are sent:
//   webhook-id         — unique event ID
//   webhook-timestamp  — unix seconds
//   webhook-signature  — space-separated list of `v1,<base64-signature>` tuples
//                        (multiple signatures allow key rotation)
//
// The secret format is `whsec_<base64-encoded-raw-secret>`. We strip the
// prefix and base64-decode to get the raw HMAC key.
//
// Signed content = `${webhook-id}.${webhook-timestamp}.${raw-body}`
// Compute HMAC-SHA256 with the raw key, base64-encode, and look for a match
// in the header's signature list.

function verifySignature(
  payload: string,
  id: string,
  timestamp: string,
  sigHeader: string,
  secret: string,
): boolean {
  if (!secret || !id || !timestamp || !sigHeader) return !secret;
  try {
    // Strip `whsec_` prefix and base64-decode to get the raw HMAC key.
    const rawSecret = secret.startsWith('whsec_')
      ? Buffer.from(secret.slice(6), 'base64')
      : Buffer.from(secret);

    const signedContent = `${id}.${timestamp}.${payload}`;
    const expected = createHmac('sha256', rawSecret).update(signedContent).digest('base64');

    // Header may contain multiple signatures separated by spaces:
    //   "v1,abc... v1,def..."
    // We match any version-1 signature.
    const signatures = sigHeader.split(' ').map((tuple) => {
      const [version, sig] = tuple.split(',');
      return { version, sig };
    });

    return signatures.some(({ version, sig }) => version === 'v1' && sig === expected);
  } catch (err) {
    console.error('[dodo-webhook] signature verification error:', err);
    return false;
  }
}

// ── Email delivery via Resend ──────────────────────────────────────────────

async function sendLicenseKey(
  toEmail: string,
  toName: string,
  licenseKey: string,
  plan: 'monthly' | 'lifetime',
): Promise<void> {
  const planLabel = plan === 'lifetime' ? 'Lifetime' : 'Monthly';
  const renewNote = plan === 'monthly'
    ? '<p style="color:#6b7280;font-size:13px;margin-top:8px;">Your key is valid for this billing period. We\'ll email a fresh key each month automatically.</p>'
    : '<p style="color:#6b7280;font-size:13px;margin-top:8px;">This is a lifetime key — it never expires.</p>';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#09090f;color:#e2e8f0;font-family:'JetBrains Mono',monospace,sans-serif;margin:0;padding:40px 24px;">
  <div style="max-width:520px;margin:0 auto;">
    <div style="font-size:22px;font-weight:700;color:#ffffff;margin-bottom:4px;">burnd</div>
    <div style="font-size:12px;color:#6366f1;margin-bottom:32px;letter-spacing:0.1em;text-transform:uppercase;">BurndPro ${planLabel} — License Key</div>

    <p style="color:#94a3b8;font-size:14px;margin-bottom:24px;">
      Hi ${toName || 'there'},<br><br>
      Your BurndPro ${planLabel} license key is below. Activate it in your terminal in about 10 seconds.
    </p>

    <div style="background:#111118;border:1px solid rgba(99,102,241,0.3);border-radius:10px;padding:20px 24px;margin-bottom:24px;">
      <div style="font-size:11px;color:#6366f1;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:10px;">Your license key</div>
      <div style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.08em;">${licenseKey}</div>
      ${renewNote}
    </div>

    <div style="background:#111118;border:1px solid #1e1e2e;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <div style="font-size:11px;color:#6b7280;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:10px;">Activate in terminal</div>
      <div style="font-size:13px;color:#6366f1;">npx -y getburnd pro activate ${toEmail} ${licenseKey}</div>
    </div>

    <p style="color:#6b7280;font-size:13px;">
      Then run <span style="color:#6366f1;">npx -y getburnd</span> as usual — Pro features activate automatically.<br><br>
      Questions? Reply to this email or ping <a href="mailto:garvitsurana10@gmail.com" style="color:#6366f1;">garvitsurana10@gmail.com</a>.
    </p>

    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #1e1e2e;font-size:11px;color:#374151;">
      getburnd.vercel.app · Built by Garvit Surana
    </div>
  </div>
</body>
</html>`;

  // Prefer Gmail SMTP if configured (no-domain-needed path). Fall back to
  // Resend if Gmail env vars aren't set — useful for local dev or if we
  // eventually verify a Resend domain and want to switch back.
  if (GMAIL_USER && GMAIL_APP_PASSWORD) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: GMAIL_USER,
        // Gmail strips spaces from App Passwords silently; be defensive.
        pass: GMAIL_APP_PASSWORD.replace(/\s/g, ''),
      },
    });

    await transporter.sendMail({
      from: `Burnd <${GMAIL_USER}>`,
      to: toEmail,
      subject: `Your BurndPro ${planLabel} key — activate in 10 seconds`,
      html,
      replyTo: 'garvitsurana10@gmail.com',
    });
    return;
  }

  // Resend fallback — only works when the recipient matches the verified
  // sender domain, or when you're on a paid plan. Kept for future migration
  // when `getburnd.app` (or similar) is verified at Resend.
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: [toEmail],
      subject: `Your BurndPro ${planLabel} key — activate in 10 seconds`,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
}

// ── Main handler ───────────────────────────────────────────────────────────

// Disable Vercel's default JSON body parsing — we need the raw body bytes for
// signature verification (JSON.stringify would re-serialize and lose byte-for-byte
// fidelity, breaking the HMAC).
export const config = { api: { bodyParser: false } };

async function readRawBody(req: VercelRequest): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  // Read raw body bytes for signature verification.
  const rawBody = await readRawBody(req);
  const webhookId = String(req.headers['webhook-id'] ?? '');
  const webhookTimestamp = String(req.headers['webhook-timestamp'] ?? '');
  const sigHeader = String(req.headers['webhook-signature'] ?? '');

  // Try live secret first, then test secret. Track which one validated so we
  // can tag downstream logic (e.g., log which mode fired).
  let modeValidated: 'live' | 'test' | 'none' = 'none';
  if (DODO_WEBHOOK_SECRET && verifySignature(rawBody, webhookId, webhookTimestamp, sigHeader, DODO_WEBHOOK_SECRET)) {
    modeValidated = 'live';
  } else if (DODO_WEBHOOK_SECRET_TEST && verifySignature(rawBody, webhookId, webhookTimestamp, sigHeader, DODO_WEBHOOK_SECRET_TEST)) {
    modeValidated = 'test';
  } else if (!DODO_WEBHOOK_SECRET && !DODO_WEBHOOK_SECRET_TEST) {
    // No secrets configured at all — accept (dev mode). Production should always have at least one.
    modeValidated = 'live';
  } else {
    console.error('[dodo-webhook] signature verification failed', {
      hasId: !!webhookId,
      hasTs: !!webhookTimestamp,
      hasSig: !!sigHeader,
      bodyLen: rawBody.length,
    });
    return res.status(401).json({ error: 'invalid signature' });
  }

  // Parse JSON body now that signature is verified.
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'invalid json' });
  }

  // Parse event.
  const event = body as {
    type?: string;
    data?: {
      payment_id?: string;
      subscription_id?: string;
      customer?: { email?: string; name?: string };
      product_id?: string;
      product_cart?: Array<{ product_id?: string; quantity?: number }> | null;
    };
  };

  const eventType = event.type ?? '';
  const customer = event.data?.customer;
  const subscriptionId = event.data?.subscription_id ?? '';
  const email = customer?.email?.toLowerCase().trim() ?? '';
  const name = customer?.name ?? '';

  // Dodo can put product info in different places depending on event type:
  //   - Lifetime (one-time payment): `data.product_cart[0].product_id`
  //   - Monthly (subscription): NO product_id at payment.succeeded time — instead
  //     the event carries `subscription_id`, and the product is resolved through
  //     the subscription. Since we only sell ONE subscription product (Monthly),
  //     presence of subscription_id = Monthly plan.
  const cartProductId = event.data?.product_cart?.[0]?.product_id ?? '';
  const lifetimeIds = [PRODUCT_LIFETIME, PRODUCT_LIFETIME_TEST].filter(Boolean);
  const monthlyIds = [PRODUCT_MONTHLY, PRODUCT_MONTHLY_TEST].filter(Boolean);

  console.log(
    '[dodo-webhook] event', eventType,
    'mode', modeValidated,
    'cart_product', cartProductId || 'none',
    'subscription', subscriptionId ? 'yes' : 'no',
    'email', email ? '***' : 'none',
  );

  // Only handle successful payments + subscription activations.
  if (eventType !== 'payment.succeeded' && eventType !== 'subscription.active') {
    return res.status(200).json({ ok: true, note: 'event ignored' });
  }

  if (!email) {
    console.error('[dodo-webhook] no customer email in payload');
    return res.status(200).json({ ok: true, note: 'no email' });
  }

  // Deduplicate: Dodo fires BOTH payment.succeeded AND subscription.active for
  // the same Monthly purchase. We only want to send one email. Handle the
  // subscription side via `subscription.active` only — ignore payment.succeeded
  // for subscriptions (they have subscription_id, no product_cart).
  if (eventType === 'payment.succeeded' && subscriptionId && !cartProductId) {
    console.log('[dodo-webhook] skipping payment.succeeded for subscription (will handle via subscription.active)');
    return res.status(200).json({ ok: true, note: 'deferred to subscription.active' });
  }

  let plan: 'monthly' | 'lifetime';
  let licenseKey: string;

  if (subscriptionId || eventType === 'subscription.active') {
    // Subscription payment → Monthly plan (our only subscription product).
    plan = 'monthly';
    licenseKey = generateKey(email, currentMonthStr());
  } else if (lifetimeIds.includes(cartProductId)) {
    plan = 'lifetime';
    licenseKey = generateKey(email, 'lifetime');
  } else if (monthlyIds.includes(cartProductId)) {
    // Fallback — shouldn't normally hit this path since Monthly is a subscription.
    plan = 'monthly';
    licenseKey = generateKey(email, currentMonthStr());
  } else {
    console.error('[dodo-webhook] unknown product:', { cartProductId, subscriptionId, configured: { monthlyIds, lifetimeIds } });
    return res.status(200).json({ ok: true, note: 'unknown product' });
  }

  try {
    await sendLicenseKey(email, name, licenseKey, plan);
    console.log('[dodo-webhook] key delivered to', email, 'plan:', plan, 'mode:', modeValidated);
    return res.status(200).json({ ok: true, mode: modeValidated });
  } catch (err) {
    console.error('[dodo-webhook] email send failed:', err);
    // Return 500 so Dodo retries.
    return res.status(500).json({ error: 'email delivery failed' });
  }
}
