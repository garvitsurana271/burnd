// Alert webhook — fires after a scan when any session exceeds the
// configured threshold. POSTs a JSON payload to the user's webhook URL.
// Works with Slack incoming webhooks, Discord webhooks, or any HTTP endpoint.

import { readConfig } from '../config.js';
import type { SessionStats } from '../session.js';

export interface WebhookPayload {
  event: 'cost_alert';
  session: {
    sessionId: string;
    projectDir: string;
    totalCostUsd: number;
    assistantTurnCount: number;
  };
  threshold: number;
  message: string;
}

export async function fireAlertWebhooks(allStats: SessionStats[]): Promise<void> {
  const config = readConfig();
  if (!config.webhookUrl || !config.alertThresholdUsd) return;

  const overThreshold = allStats.filter(
    (s) => s.totalCostUsd >= config.alertThresholdUsd!,
  );
  if (overThreshold.length === 0) return;

  // Only alert on the most expensive session to avoid spam.
  const worst = overThreshold.sort((a, b) => b.totalCostUsd - a.totalCostUsd)[0]!;

  const payload: WebhookPayload = {
    event: 'cost_alert',
    session: {
      sessionId: worst.sessionId.slice(0, 8) + '…',
      projectDir: worst.projectDir.split('-').slice(-1)[0] ?? worst.projectDir,
      totalCostUsd: worst.totalCostUsd,
      assistantTurnCount: worst.assistantTurnCount,
    },
    threshold: config.alertThresholdUsd,
    message: `🔥 Burnd alert: session on "${worst.projectDir.split('-').slice(-1)[0]}" cost $${worst.totalCostUsd.toFixed(2)} — above your $${config.alertThresholdUsd} threshold.`,
  };

  // Also format as Slack-compatible text field.
  const slackPayload = {
    text: payload.message,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Burnd Cost Alert* 🔥\nSession \`${payload.session.sessionId}\` on *${payload.session.projectDir}* cost *$${worst.totalCostUsd.toFixed(2)}* (${worst.assistantTurnCount} turns).\nThreshold: $${config.alertThresholdUsd}\n\nRun \`npx getburnd serve\` to see the full breakdown.`,
        },
      },
    ],
  };

  try {
    await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(slackPayload),
    });
  } catch {
    // Webhook failures are non-fatal — don't break the scan.
  }
}
