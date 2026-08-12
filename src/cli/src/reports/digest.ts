// Weekly email digest — sends a "your Claude spend last week" summary via Resend.
// Pro-only feature. Triggered by `burnd digest` CLI command.
//
// The email includes:
//   - Last 7 days spend vs prior 7 days (trend %)
//   - Top 3 leaks by savings estimate
//   - Call-to-action to open the dashboard
//
// Uses Resend API (https://resend.com) — user provides their own API key via
// `burnd config set resendApiKey <key>`. No Burnd-side infrastructure required.

import { readConfig } from '../config.js';
import type { Snapshot } from '../snapshot.js';

interface ResendEmailPayload {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
}

function buildDigestHtml(snapshot: Snapshot): string {
  const t = snapshot.totals;
  const daily = snapshot.dailySpend;
  const last7 = daily.slice(-7).reduce((acc, d) => acc + d.totalCostUsd, 0);
  const prev7 = daily.slice(-14, -7).reduce((acc, d) => acc + d.totalCostUsd, 0);
  const trendPct = prev7 > 0 ? ((last7 - prev7) / prev7) * 100 : 0;
  const trendLabel =
    trendPct > 5
      ? `↑ ${trendPct.toFixed(0)}% vs last week (spending more)`
      : trendPct < -5
      ? `↓ ${Math.abs(trendPct).toFixed(0)}% vs last week (nice!)`
      : `≈ flat vs last week`;

  const trendColor = trendPct > 5 ? '#f97316' : trendPct < -5 ? '#22c55e' : '#94a3b8';

  // Top 3 insights.
  const top3 = snapshot.insights.slice(0, 3);
  const insightRows = top3
    .map(
      (ins) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #1e1e2e;color:#e2e8f0;font-size:13px;">${ins.title}</td>
      <td style="padding:8px 0;border-bottom:1px solid #1e1e2e;color:#fbbf24;font-family:monospace;font-size:12px;text-align:right;">
        save $${ins.savingsEstimateUsd.toFixed(2)}
      </td>
    </tr>`,
    )
    .join('');

  const sessionsThisWeek = daily.slice(-7).reduce((acc, d) => acc + d.sessionCount, 0);

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Burnd Weekly Digest</title></head>
<body style="margin:0;padding:0;background:#09090f;font-family:'Inter',system-ui,sans-serif;color:#94a3b8;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">

    <!-- Header -->
    <div style="margin-bottom:32px;">
      <div style="font-family:monospace;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#475569;margin-bottom:8px;">
        Burnd · Weekly Digest
      </div>
      <h1 style="margin:0;font-size:22px;font-weight:700;color:#f1f5f9;line-height:1.3;">
        Your Claude spend last 7 days
      </h1>
    </div>

    <!-- Spend summary -->
    <div style="background:#111118;border:1px solid #1e1e2e;border-radius:8px;padding:20px 24px;margin-bottom:20px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:0 0 16px;">
            <div style="font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#475569;margin-bottom:4px;">spend this week</div>
            <div style="font-family:monospace;font-size:28px;font-weight:700;color:#f1f5f9;">$${last7.toFixed(2)}</div>
            <div style="font-family:monospace;font-size:11px;color:${trendColor};margin-top:4px;">${trendLabel}</div>
          </td>
          <td style="padding:0 0 16px;text-align:right;vertical-align:top;">
            <div style="font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#475569;margin-bottom:4px;">sessions</div>
            <div style="font-family:monospace;font-size:28px;font-weight:700;color:#f1f5f9;">${sessionsThisWeek}</div>
            <div style="font-family:monospace;font-size:11px;color:#475569;margin-top:4px;">
              ${sessionsThisWeek > 0 ? `$${(last7 / sessionsThisWeek).toFixed(2)}/session` : 'no sessions'}
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="border-top:1px solid #1e1e2e;padding-top:16px;">
            <div style="font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#475569;margin-bottom:4px;">fixable waste detected</div>
            <div style="font-family:monospace;font-size:20px;font-weight:700;color:#fbbf24;">$${t.potentialSavingsUsd.toFixed(2)}</div>
            <div style="font-family:monospace;font-size:11px;color:#475569;margin-top:4px;">${snapshot.insights.length} leaks across all sessions</div>
          </td>
        </tr>
      </table>
    </div>

    ${
      top3.length > 0
        ? `
    <!-- Top leaks -->
    <div style="background:#111118;border:1px solid #1e1e2e;border-radius:8px;padding:20px 24px;margin-bottom:20px;">
      <div style="font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#475569;margin-bottom:12px;">
        Top leaks to fix this week
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${insightRows}
      </table>
    </div>`
        : ''
    }

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="http://localhost:4711" style="display:inline-block;background:#6366f1;color:#fff;font-family:monospace;font-size:12px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:6px;">
        Open Burnd Dashboard →
      </a>
      <div style="margin-top:8px;font-family:monospace;font-size:10px;color:#334155;">
        Run <code style="background:#111118;padding:2px 4px;border-radius:3px;">burnd serve</code> first
      </div>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #1e1e2e;padding-top:16px;font-family:monospace;font-size:10px;color:#334155;text-align:center;">
      Burnd · Claude Code Cost Tracker · sent by <code>burnd digest</code><br>
      Unsubscribe: run <code>burnd config set digestEmail ""</code>
    </div>

  </div>
</body>
</html>`;
}

export async function sendWeeklyDigest(snapshot: Snapshot): Promise<void> {
  const config = readConfig();

  if (!config.resendApiKey) {
    process.stdout.write(
      '  ✗ No Resend API key configured.\n  Run: burnd config set resendApiKey <key>\n',
    );
    return;
  }
  if (!config.digestEmail) {
    process.stdout.write(
      '  ✗ No digest email configured.\n  Run: burnd config set digestEmail <email>\n',
    );
    return;
  }

  const html = buildDigestHtml(snapshot);

  const payload: ResendEmailPayload = {
    from: 'Burnd <digest@getburnd.com>',
    to: config.digestEmail,
    subject: `Burnd digest — $${snapshot.dailySpend.slice(-7).reduce((a, d) => a + d.totalCostUsd, 0).toFixed(2)} spent this week`,
    html,
  };

  process.stdout.write(`  Sending digest to ${config.digestEmail}...\n`);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    process.stdout.write(`  ✓ Digest sent to ${config.digestEmail}\n`);
  } else {
    const err = await res.text();
    process.stdout.write(`  ✗ Resend API error ${res.status}: ${err}\n`);
  }
}
