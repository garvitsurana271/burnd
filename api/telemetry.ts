// POST /api/telemetry
// Accepts anonymous usage events from the getburnd CLI.
// What we collect (opt-in, disclosed to user in CLI prompt):
//   - event name (e.g. "scan", "email_captured")
//   - CLI version
//   - OS platform (win32 / linux / darwin)
//   - which detector IDs fired (not dollar amounts, not paths, not session IDs)
//   - Pro status (boolean)
//   - run count tier (1, 2, 3-5, 6-10, 10+)
//
// What we DO NOT collect:
//   - actual cost / dollar amounts
//   - project names or paths
//   - session IDs
//   - any file content
//
// Storage: logged to Vercel function logs for now. When we have enough volume
// to justify it, upgrade to Upstash Redis list (RPUSH events) or Firestore.
// The log format is structured JSON so it can be parsed out of Vercel log
// exports easily.

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface TelemetryPayload {
  event: string;
  version: string;
  platform: string;
  detectorIds: string[];
  isPro: boolean;
  runCountTier: string;
  installId: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const payload = req.body as Partial<TelemetryPayload>;

  // Minimal validation — just make sure it looks like a CLI ping.
  if (!payload.event || !payload.version) {
    return res.status(400).json({ error: 'missing fields' });
  }

  // Sanitize: strip anything that shouldn't be here.
  const safe: TelemetryPayload = {
    event: String(payload.event).slice(0, 64),
    version: String(payload.version).slice(0, 32),
    platform: String(payload.platform ?? 'unknown').slice(0, 32),
    detectorIds: (Array.isArray(payload.detectorIds) ? payload.detectorIds : [])
      .map((id) => String(id).slice(0, 64))
      .slice(0, 20),
    isPro: Boolean(payload.isPro),
    runCountTier: String(payload.runCountTier ?? 'unknown').slice(0, 8),
    // UUID v4 format — length 36. Older CLI versions won't send one; tag those
    // as 'legacy' so we can still count them separately.
    installId: String(payload.installId ?? 'legacy').slice(0, 36),
  };

  // Structured log — Vercel stores these. Parseable later with:
  //   vercel logs getburnd --since=24h | grep '"t":"telemetry"' \
  //     | jq -r .installId | sort -u | wc -l    (= unique installs)
  console.log(JSON.stringify({
    t: 'telemetry',
    ts: new Date().toISOString(),
    ...safe,
  }));

  return res.status(200).json({ ok: true });
}
