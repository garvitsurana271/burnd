// POST /api/intent
// Captures purchase intent from /buy interstitial.
// Sends:
//   1. Notification email to garvitsurana10@gmail.com so he can follow up within hours.
//   2. Confirmation email to the buyer so they know we got it.
//   3. Best-effort add to Resend audience for retargeting.
//
// Why a custom intent endpoint instead of /api/subscribe? Subscribe is for
// digest/newsletter audience. Intent is for "this person clicked Buy and
// is willing to pay right now" — strictly higher priority. We want Garvit
// to see those land in his inbox immediately, not in a weekly audience export.

import type { VercelRequest, VercelResponse } from '@vercel/node';

const RESEND_API_KEY = process.env['RESEND_API_KEY'] ?? '';
const RESEND_AUDIENCE_ID = process.env['RESEND_AUDIENCE_ID'] ?? '';
const NOTIFY_TO = 'garvitsurana10@gmail.com';
// Use Resend's verified sandbox domain until a custom domain is verified.
// Once buy.html lives in prod and we want polish, swap this for noreply@<verified-domain>.
const FROM = 'Burnd <onboarding@resend.dev>';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const { email, plan, ref } = (req.body ?? {}) as {
    email?: string;
    plan?: 'monthly' | 'lifetime' | string;
    ts?: number;
    ref?: string | null;
  };

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'invalid email' });
  }

  const planLabel = plan === 'monthly' ? 'Pro Monthly · $8.99/mo' : 'Pro Lifetime · $89';
  const stamp = new Date().toISOString();

  if (!RESEND_API_KEY) {
    // Env not configured yet — don't fail loudly. Log so we can recover later
    // from Vercel logs if intent submissions happened during the gap.
    console.log('[intent] no RESEND_API_KEY, intent captured in log only:', {
      email, plan, ref, stamp,
    });
    return res.status(200).json({ ok: true, note: 'env not configured, logged' });
  }

  const notifyHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width:560px; margin:0 auto; padding:24px; background:#09090f; color:#F5E8D4;">
      <div style="font-family: monospace; font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color:#f59e0b; margin-bottom:14px;">Burnd · purchase intent</div>
      <h2 style="font-family: 'Instrument Serif', Georgia, serif; font-style:italic; font-weight:400; font-size:30px; margin:0 0 18px;">Someone wants to pay.</h2>
      <table style="font-family: monospace; font-size:13px; line-height:1.6; color:#F5E8D4cc;">
        <tr><td style="padding-right:18px; color:#F5E8D480;">EMAIL</td><td>${escapeHtml(email)}</td></tr>
        <tr><td style="padding-right:18px; color:#F5E8D480;">PLAN</td><td>${escapeHtml(planLabel)}</td></tr>
        <tr><td style="padding-right:18px; color:#F5E8D480;">REF</td><td>${escapeHtml(ref || '(direct)')}</td></tr>
        <tr><td style="padding-right:18px; color:#F5E8D480;">TIME</td><td>${stamp}</td></tr>
      </table>
      <div style="margin-top:24px; padding:14px 16px; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.3); border-radius:6px;">
        <div style="font-family: monospace; font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:#f59e0b; margin-bottom:6px;">Next step</div>
        <div style="font-size:14px; line-height:1.55;">Reply within a few hours with a Dodo checkout link or UPI handle. They are expecting it.</div>
      </div>
    </div>
  `;

  const confirmHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width:560px; margin:0 auto; padding:24px; background:#09090f; color:#F5E8D4;">
      <div style="font-family: monospace; font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color:#f59e0b; margin-bottom:14px;">Burnd · founding member</div>
      <h2 style="font-family: 'Instrument Serif', Georgia, serif; font-style:italic; font-weight:400; font-size:30px; margin:0 0 14px;">Got your reservation.</h2>
      <p style="font-size:15px; line-height:1.6; color:#F5E8D4cc; margin:0 0 14px;">
        Hi — thanks for grabbing ${escapeHtml(planLabel)}. I'll send you a checkout link plus your founding-member license key within a few hours, straight from this email thread.
      </p>
      <p style="font-size:15px; line-height:1.6; color:#F5E8D4cc; margin:0 0 14px;">
        We're swapping live payment processor links onto the site over the next 24 hours. Until that lands, anyone willing to pay reaches us directly so nothing falls through the cracks. Your founding price holds either way.
      </p>
      <p style="font-size:14px; line-height:1.55; color:#F5E8D480; margin:18px 0 0;">
        — Garvit (Burnd, solo)
      </p>
    </div>
  `;

  const tasks: Promise<unknown>[] = [];

  // 1. Notification to Garvit
  tasks.push(
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [NOTIFY_TO],
        subject: `Burnd intent · ${planLabel} · ${email}`,
        html: notifyHtml,
        reply_to: email,
      }),
    })
      .then(async (r) => {
        if (!r.ok) console.error('[intent] notify resend failed', r.status, await r.text());
      })
      .catch((e) => console.error('[intent] notify fetch error', e)),
  );

  // 2. Confirmation to the buyer
  tasks.push(
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject: 'Burnd · your founding-member reservation',
        html: confirmHtml,
        reply_to: NOTIFY_TO,
      }),
    })
      .then(async (r) => {
        if (!r.ok) console.error('[intent] confirm resend failed', r.status, await r.text());
      })
      .catch((e) => console.error('[intent] confirm fetch error', e)),
  );

  // 3. Best-effort audience add (so we can retarget later)
  if (RESEND_AUDIENCE_ID) {
    tasks.push(
      fetch(`https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          unsubscribed: false,
          data: {
            source: 'buy_interstitial',
            plan: plan ?? 'unknown',
            ref: ref ?? '',
            captured_at: stamp,
          },
        }),
      }).catch((e) => console.error('[intent] audience add error', e)),
    );
  }

  // Don't await — let Vercel handle them. But also don't return until at
  // least the notify call has had a chance to fire, otherwise serverless
  // shutdown can drop it. Wait briefly via Promise.race vs timeout.
  await Promise.race([
    Promise.allSettled(tasks),
    new Promise((resolve) => setTimeout(resolve, 4000)),
  ]);

  return res.status(200).json({ ok: true });
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
