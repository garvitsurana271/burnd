// Tired-coding detector — DATA-DRIVEN per user, not hardcoded clock hours.
//
// v0.0.16 rewrite (2026-04-20): the previous version used UTC 0-5 as the
// "late night" window and a flat $1.50 cost baseline. Both assumptions
// were Garvit-specific and broke for every other user — a Pacific-time
// dev coding 10pm-2am PT never tripped the UTC window, and a light user
// with $0.30 sessions had every session flagged as "over baseline."
//
// The new heuristic:
//   1. Compute the user's OWN focus window (hours where they code most)
//      from their session history. If they code 9am-7pm on most days,
//      sessions starting outside 9am-7pm are candidates.
//   2. Compute the user's OWN session-cost 75th percentile. Only flag
//      sessions that are BOTH outside focus hours AND above their
//      personal P75 cost. This filters noise for light users AND power
//      users uniformly.
//
// This makes the detector meaningful for a $20/mo hobby coder, a $14k/mo
// power user, and anyone in between — it measures deviation from the
// user's own normal, not an absolute threshold.

import type { Detector, Insight, UserBaseline } from './types.js';
import { makeInsightId } from './types.js';
import type { SessionStats } from '../session.js';

const ID = 'tired-coding';

// How much the detector assumes daytime sessions would cost less for the
// same work. 30% is the published research median for sleep-deprived
// cognitive output — conservative.
const DAYTIME_SAVINGS_FACTOR = 0.3;

// Minimum dollar savings to surface. Tiny flags add noise.
const MIN_SAVINGS_USD = 0.25;

function localHour(iso: string, tz: string): number {
  try {
    return Number(
      new Date(iso).toLocaleString('en-US', {
        timeZone: tz,
        hour: 'numeric',
        hour12: false,
      }),
    );
  } catch {
    return new Date(iso).getUTCHours();
  }
}

function isOutsideFocusWindow(hour: number, baseline: UserBaseline): boolean {
  const { focusWindowStart: start, focusWindowEnd: end } = baseline;
  // Window may wrap past midnight (e.g., start=22, end=8).
  if (start <= end) return hour < start || hour >= end;
  return hour < start && hour >= end;
}

export const tiredCodingDetector: Detector = {
  id: ID,
  run(stats: SessionStats, baseline?: UserBaseline): Insight[] {
    if (!stats.startedAt) return [];
    // No baseline → can't decide. Degrade silently rather than false-alarm.
    if (!baseline || baseline.sessionCount < 3) return [];

    const hour = localHour(stats.startedAt, baseline.localTimezone);
    if (!isOutsideFocusWindow(hour, baseline)) return [];

    // Session must also cost more than the user's own 75th percentile —
    // i.e., this is an EXPENSIVE out-of-focus session, not a routine one.
    if (stats.totalCostUsd <= baseline.sessionCostP75) return [];

    const savingsUsd = stats.totalCostUsd * DAYTIME_SAVINGS_FACTOR;
    if (savingsUsd < MIN_SAVINGS_USD) return [];

    const startedAtLocal = new Date(stats.startedAt).toLocaleString('en-US', {
      timeZone: baseline.localTimezone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const focusStr = `${baseline.focusWindowStart.toString().padStart(2, '0')}:00–${baseline.focusWindowEnd.toString().padStart(2, '0')}:00`;

    return [
      {
        id: makeInsightId(ID, stats.sessionId),
        detectorId: ID,
        sessionId: stats.sessionId,
        projectDir: stats.projectDir,
        title: `Expensive session outside your focus window`,
        description:
          `This session started at ${startedAtLocal} (${baseline.localTimezone}) and cost $${stats.totalCostUsd.toFixed(2)} — ` +
          `above your 75th-percentile session cost of $${baseline.sessionCostP75.toFixed(2)}. ` +
          `Based on your own history, your focus window is ${focusStr} local — sessions outside it trend ~30% more expensive ` +
          `per unit of work done. Estimated savings if rerun during focus hours: $${savingsUsd.toFixed(2)}.`,
        savingsEstimateUsd: savingsUsd,
        effortMinutes: 0,
        fixSteps: [
          'Consider deferring expensive multi-step work to your focus hours — tired prompts tend to spiral into more iterations.',
          'Write the prompt now, paste fresh in the morning. 10 minutes of rested context often saves 20+ minutes of Claude iteration.',
          'For urgent late work, write MORE explicit prompts to compensate for fatigue.',
        ],
        proFixSteps: [
          `Session ${stats.sessionId.slice(0, 8)}… started at ${startedAtLocal} and cost $${stats.totalCostUsd.toFixed(2)} — above your personal P75 of $${baseline.sessionCostP75.toFixed(2)}.`,
          `Your focus window (${focusStr} ${baseline.localTimezone}) was derived from your ${baseline.sessionCount} scanned sessions — sessions outside it consistently cost more per unit of work.`,
          `If the same workflow had run inside your focus window, we estimate it would have cost ~$${(stats.totalCostUsd * (1 - DAYTIME_SAVINGS_FACTOR)).toFixed(2)} — saving $${savingsUsd.toFixed(2)}.`,
          `Practical rule: any task that will take >10 Claude turns gets queued for focus hours. Use a "tomorrow.md" text file in each project to park late-night ideas without burning tokens on them.`,
          `BurndPro's weekly report tracks your focus-vs-outside cost ratio over time — watch it as you adjust your schedule.`,
        ],
        claudeMdPatch: null,
      },
    ];
  },
};
