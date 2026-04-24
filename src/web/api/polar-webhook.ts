import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'crypto';
import nodemailer from 'nodemailer';

// ── Key generation (mirrors cli/src/license.ts exactly) ─────────────────────
const SECRET = 'burnd-pro-v1-garvit-2026';

function generateKey(email: string, monthStr: string): string {
  const payload = email.toLowerCase().trim() + ':' + monthStr;
  const hash = createHmac('sha256', SECRET).update(payload).digest('hex').slice(0, 16).toUpperCase();
  return `BURND-${hash.slice(0, 4)}-${hash.slice(4, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}`;
}

function currentMonthStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ── Polar webhook signature verification ─────────────────────────────────────
function verifySignature(body: string, signature: string, secret: string): boolean {
  try {
    const expected = createHmac('sha256', secret).update(body).digest('hex');
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// ── Email via Gmail SMTP ──────────────────────────────────────────────────────
async function sendKeyEmail(toEmail: string, key: string, month: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'garvitsurana10@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: '"Garvit @ Burnd" <garvitsurana10@gmail.com>',
    to: toEmail,
    subject: 'Your BurndPro license key',
    text: [
      `Hi,`,
      ``,
      `Thanks for subscribing to BurndPro! Here's your license key:`,
      ``,
      `  ${key}`,
      ``,
      `Activate it by running:`,
      `  npx getburnd pro activate ${toEmail} ${key}`,
      ``,
      `Then run \`npx getburnd\` to see your full Pro dashboard.`,
      ``,
      `This key is valid for ${month}. You'll get a fresh key each month automatically.`,
      ``,
      `Questions? Just reply to this email.`,
      ``,
      `— Garvit`,
    ].join('\n'),
    html: `
      <div style="font-family:monospace;background:#09090f;color:#e4e4e7;padding:32px;max-width:560px;border-radius:12px;margin:0 auto;">
        <p style="color:#6b7280;font-size:12px;margin:0 0 24px;">BurndPro · your license key</p>
        <p style="margin:0 0 12px;">Hi,</p>
        <p style="margin:0 0 16px;">Thanks for subscribing to BurndPro! Here's your license key:</p>
        <div style="background:#111118;border:1px solid #27272a;border-radius:8px;padding:16px 20px;margin:20px 0;">
          <span style="color:#6366f1;font-size:20px;letter-spacing:3px;font-weight:bold;">${key}</span>
        </div>
        <p style="margin:0 0 8px;">Activate it by running:</p>
        <div style="background:#111118;border:1px solid #27272a;border-radius:8px;padding:12px 16px;margin:0 0 20px;">
          <code style="color:#a3a3a3;font-size:13px;">npx getburnd pro activate ${toEmail} ${key}</code>
        </div>
        <p style="margin:0 0 24px;">Then run <code style="color:#a3a3a3;">npx getburnd</code> to see your full Pro dashboard.</p>
        <p style="color:#6b7280;font-size:12px;margin:0;">
          Key valid for ${month} · renewed automatically each month<br/>
          Questions? Just reply to this email — I read every one.
        </p>
        <p style="margin:16px 0 0;">— Garvit</p>
      </div>
    `,
  });
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = JSON.stringify(req.body);
    const signature = (
      req.headers['webhook-signature'] ??
      req.headers['x-polar-signature'] ??
      ''
    ) as string;
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET ?? '';

    if (webhookSecret && signature) {
      if (!verifySignature(rawBody, signature, webhookSecret)) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const event = req.body as { type: string; data: Record<string, unknown> };
    console.log('Polar webhook event:', event.type);

    if (event.type !== 'subscription.created' && event.type !== 'order.created') {
      return res.status(200).json({ ok: true, skipped: event.type });
    }

    const data = event.data as Record<string, unknown>;
    const email =
      ((data.user as Record<string, unknown>)?.email as string) ??
      ((data.customer as Record<string, unknown>)?.email as string) ??
      null;

    if (!email) {
      console.error('No email in payload:', JSON.stringify(data));
      return res.status(400).json({ error: 'No customer email in payload' });
    }

    const month = currentMonthStr();
    const key = generateKey(email, month);

    await sendKeyEmail(email, key, month);
    console.log(`Key sent to ${email}: ${key}`);

    return res.status(200).json({ ok: true, email, month });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: String(err) });
  }
}
