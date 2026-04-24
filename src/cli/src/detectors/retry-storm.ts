// API retry storm detector.
//
// When Claude Code hits API errors and retries, each retry costs tokens
// for the partial response that was generated before the error. If a
// session has many retries, that's wasted spend.
//
// We use the apiErrorCount and apiRetryCount fields populated by the
// session aggregator from `system` records with subtype === 'api_error'
// (documented in notes/jsonl-format.md).

import type { Detector, Insight } from './types.js';
import { makeInsightId } from './types.js';
import type { SessionStats } from '../session.js';

const ID = 'retry-storm';
const MIN_RETRIES = 5;
// Estimated cost per retry — typical partial-response retry burns about
// 200 input tokens + 100 output tokens at Opus rates ≈ $0.01.
const USD_PER_RETRY = 0.01;

export const retryStormDetector: Detector = {
  id: ID,
  run(stats: SessionStats): Insight[] {
    if (stats.apiRetryCount < MIN_RETRIES) return [];

    const wastedUsd = stats.apiRetryCount * USD_PER_RETRY;

    return [
      {
        id: makeInsightId(ID, stats.sessionId),
        detectorId: ID,
        sessionId: stats.sessionId,
        projectDir: stats.projectDir,
        title: `API retry storm — ${stats.apiRetryCount} retries wasted ~$${wastedUsd.toFixed(2)}`,
        description:
          `Claude Code hit ${stats.apiErrorCount} API errors in this session and retried ` +
          `${stats.apiRetryCount} times. Each retry burns tokens for the partial response ` +
          `that was generated before the error. Most API retry storms are caused by ` +
          `temporary network issues, rate limiting, or hitting the context window limit ` +
          `repeatedly. Estimated wasted spend: $${wastedUsd.toFixed(2)}.`,
        savingsEstimateUsd: wastedUsd,
        effortMinutes: 5,
        fixSteps: [
          'Check whether the retries cluster around a specific moment (likely a transient issue).',
          'If the retries are spread across the session, consider running shorter sessions to reduce context-window pressure.',
          'If you see "rate_limit_error" frequently, slow down your usage or upgrade your Anthropic API tier.',
          'Subscribe to Anthropic\'s status page (status.anthropic.com) so you can pause work during outages.',
        ],
        proFixSteps: [
          `This session logged ${stats.apiErrorCount} API errors and ${stats.apiRetryCount} retries — $${wastedUsd.toFixed(2)} in partial-response tokens thrown away. Each retry regenerates tokens for an incomplete response.`,
          `Diagnosis by error type: (a) "overloaded_error" = Anthropic under capacity — retry storms happen at peak hours (8–10 AM PST). Schedule heavy sessions for off-peak. (b) "rate_limit_error" = you're hitting requests-per-minute limits — shorten your sessions or add pauses. (c) "context_window" errors = session too long — break into smaller focused sessions.`,
          `Immediate mitigation: when Claude Code starts retrying, interrupt (Ctrl+C) and start a fresh session with a summary of where you left off. A fresh session costs ~$0.01 to warm up vs $${(wastedUsd * 0.5).toFixed(2)}+ in retry waste.`,
          `Add this to your workflow: if a session has been running for more than 2 hours and you start seeing errors, save your progress and open a new session. Long-running sessions accumulate context that increases error probability.`,
          `If retry storms are recurring across sessions: check your Anthropic API dashboard for your current usage tier and request limits. Upgrading from Tier 1 ($100 spend) to Tier 2 ($500 spend) significantly increases rate limits.`,
        ],
        claudeMdPatch: null, // API retries are infrastructure issues — no CLAUDE.md directive applies.
      },
    ];
  },
};
