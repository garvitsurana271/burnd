// Skill firing detector.
//
// Claude Code can have user-installed "skills" that the agent invokes
// via the `Skill` tool. If a skill is invoked many times in a single
// session but produces little output, it might be misconfigured (e.g.,
// firing on every message instead of when needed).
//
// We flag sessions where Skill was called 5+ times AND those calls
// account for more than 20% of the session's tool usage. The fix is
// usually a tweaked skill description or a more specific trigger.

import type { Detector, Insight } from './types.js';
import { makeInsightId } from './types.js';
import type { SessionStats } from '../session.js';

const ID = 'skill-firing';
const MIN_SKILL_CALLS = 5;
const SHARE_THRESHOLD = 0.2;

export const skillFiringDetector: Detector = {
  id: ID,
  run(stats: SessionStats): Insight[] {
    const skill = stats.toolStats.get('Skill');
    if (!skill || skill.callCount < MIN_SKILL_CALLS) return [];

    let totalCalls = 0;
    for (const t of stats.toolStats.values()) totalCalls += t.callCount;
    if (totalCalls === 0) return [];

    const share = skill.callCount / totalCalls;
    if (share < SHARE_THRESHOLD) return [];

    // Estimated savings: if half the skill calls were unnecessary,
    // each one cost ~$0.05 in agent overhead (it has to load the skill,
    // process it, then continue).
    const wastedUsd = (skill.callCount / 2) * 0.05;
    if (wastedUsd < 0.05) return [];

    return [
      {
        id: makeInsightId(ID, stats.sessionId),
        detectorId: ID,
        sessionId: stats.sessionId,
        projectDir: stats.projectDir,
        title: `Skill is firing too often — ${skill.callCount} calls (${(share * 100).toFixed(0)}% of tools), wasting ~$${wastedUsd.toFixed(2)}`,
        description:
          `In this session, the Skill tool was invoked ${skill.callCount} times — ` +
          `${(share * 100).toFixed(0)}% of all tool calls. Heavy skill firing usually means ` +
          `a skill description is too broad and the agent is invoking it on every message instead ` +
          `of when actually needed. Tightening the skill's description or trigger conditions ` +
          `could save approximately $${wastedUsd.toFixed(2)} on this session.`,
        savingsEstimateUsd: wastedUsd,
        effortMinutes: 10,
        fixSteps: [
          'Identify which skill was firing most often (the dashboard\'s Sessions view will show the skill name from tool_use.input).',
          'Open that skill\'s SKILL.md file and read its description.',
          'Make the description more specific — say exactly when the skill should fire and when it should NOT.',
          'Test by re-running a similar workflow and checking that the skill fires less often.',
        ],
        detailedFixSteps: [
          `The Skill tool fired ${skill.callCount} times — ${(share * 100).toFixed(0)}% of all tool calls. Each unnecessary invocation loads the full skill content into context and adds overhead. At ~$0.05/call, that's $${wastedUsd.toFixed(2)} from over-triggering.`,
          `To identify the offending skill: open this session in your Claude Code history and search for "tool_use" with name "Skill". The \`input.skill\` field tells you exactly which skill fired each time.`,
          `The most common root cause: the skill description uses broad trigger words ("whenever", "always", "for any") that the agent matches too eagerly. Replace with specific conditions: "Only invoke when the user explicitly says X" or "Use only when Y is needed."`,
          `Add a "When NOT to use:" section to the skill's markdown. This is the most effective way to reduce false-positive firing — explicit exclusions work better than vague positive triggers.`,
          `After updating: run a similar session and check the Skill call count in Burnd. Target: Skill calls should be under 10% of total tool calls. At ${skill.callCount} calls right now, you want to get it under ${Math.ceil(totalCalls * 0.1)}.`,
        ],
        claudeMdPatch: null, // Skill firing is fixed in the skill's own SKILL.md, not in CLAUDE.md.
      },
    ];
  },
};
