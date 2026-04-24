// POST /api/subscribe
// Accepts { email, version, platform, detectorIds, isPro }
// Adds the email to the Resend audience for the weekly Burnd digest.
// The Resend API key lives as RESEND_API_KEY in Vercel env vars — never
// exposed to the CLI (the CLI just calls this endpoint).

import type { VercelRequest, VercelResponse } from '@vercel/node';

const RESEND_API_KEY = process.env['RESEND_API_KEY'] ?? '';
const RESEND_AUDIENCE_ID = process.env['RESEND_AUDIENCE_ID'] ?? '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const { email, version, platform, detectorIds, isPro } = req.body as {
    email?: string;
    version?: string;
    platform?: string;
    detectorIds?: string[];
    isPro?: boolean;
  };

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'invalid email' });
  }

  if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID) {
    // Env vars not configured yet — log and return success so the CLI
    // still shows the confirmation message.
    console.log('[subscribe] env not configured, skipping Resend call', { email });
    return res.status(200).json({ ok: true, note: 'env not configured' });
  }

  try {
    const resendRes = await fetch(
      `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          unsubscribed: false,
          data: {
            cli_version: version ?? 'unknown',
            platform: platform ?? 'unknown',
            top_detectors: (detectorIds ?? []).slice(0, 5).join(','),
            is_pro: String(isPro ?? false),
            subscribed_at: new Date().toISOString().slice(0, 10),
          },
        }),
      },
    );

    if (!resendRes.ok) {
      const body = await resendRes.text();
      console.error('[subscribe] Resend error', resendRes.status, body);
      // Don't surface Resend errors to the user — subscription is best-effort.
      return res.status(200).json({ ok: true, note: 'resend error, logged' });
    }

    console.log('[subscribe] subscribed', email);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[subscribe] fetch error', err);
    return res.status(200).json({ ok: true, note: 'network error, logged' });
  }
}
