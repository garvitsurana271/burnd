// Detector: Agent cost outlier — one agent spending 3x more per session than average.
//
// OpenClaw users can run multiple agents (main, custom agents, etc.). If one
// agent's average session cost is 3x the cross-agent average, that agent has
// a misconfigured system prompt, is routing to expensive models, or is being
// given tasks that far exceed its scope.
//
// Multi-session detector — needs all sessions to compute the cross-agent average.

import type { OpenClawMultiDetector, OpenClawInsight } from './types.js';
import { makeInsightId } from './types.js';

const OUTLIER_MULTIPLIER = 3.0;
const MIN_SESSIONS_PER_AGENT = 3; // Need at least 3 sessions to be meaningful

export const agentCostOutlierDetector: OpenClawMultiDetector = {
  id: 'agent-cost-outlier',

  runMulti(allStats): OpenClawInsight[] {
    if (allStats.length < MIN_SESSIONS_PER_AGENT * 2) return [];

    // Group sessions by agentId.
    const byAgent = new Map<string, { totalCost: number; count: number }>();
    for (const s of allStats) {
      let a = byAgent.get(s.agentId);
      if (!a) {
        a = { totalCost: 0, count: 0 };
        byAgent.set(s.agentId, a);
      }
      a.totalCost += s.totalCostUsd;
      a.count += 1;
    }

    // Need at least 2 agents to compare.
    if (byAgent.size < 2) return [];

    // Compute global average cost per session across all agents.
    const totalCost = allStats.reduce((acc, s) => acc + s.totalCostUsd, 0);
    const globalAvgPerSession = totalCost / allStats.length;

    if (globalAvgPerSession < 0.01) return [];

    const insights: OpenClawInsight[] = [];

    for (const [agentId, data] of byAgent) {
      if (data.count < MIN_SESSIONS_PER_AGENT) continue;

      const agentAvg = data.totalCost / data.count;
      if (agentAvg < globalAvgPerSession * OUTLIER_MULTIPLIER) continue;

      // Find the most expensive session for this agent to use as the example.
      const agentSessions = allStats.filter((s) => s.agentId === agentId);
      const mostExpensive = agentSessions.reduce((a, b) =>
        a.totalCostUsd > b.totalCostUsd ? a : b,
      );

      const excess = data.totalCost - globalAvgPerSession * data.count;
      const savingsEstimateUsd = excess * 0.5; // Conservative: fix 50% of the excess

      insights.push({
        id: makeInsightId('agent-cost-outlier', mostExpensive.sessionId),
        detectorId: 'agent-cost-outlier',
        sessionId: mostExpensive.sessionId,
        agentId,
        title: `Agent "${agentId}" costs ${(agentAvg / globalAvgPerSession).toFixed(1)}x more per session than average`,
        description:
          `Your "${agentId}" agent averages $${agentAvg.toFixed(3)}/session across ${data.count} sessions, ` +
          `vs a $${globalAvgPerSession.toFixed(3)} cross-agent average. ` +
          `This ${OUTLIER_MULTIPLIER}x+ gap suggests misconfigured routing (expensive default model), ` +
          `an overly verbose system prompt re-sent every turn, or tasks that are too broad ` +
          `for what this agent was designed to do.`,
        savingsEstimateUsd,
        effortMinutes: 20,
        fixSteps: [
          `Audit "${agentId}"'s system prompt — trim any redundant context sent every turn.`,
          `Check which model "${agentId}" defaults to — switch to a mid-tier model for routine tasks.`,
          `Review what tasks are being sent to this agent — split complex tasks into smaller scoped sessions.`,
          `Enable caching on "${agentId}"'s system prompt to amortize the repeated context cost.`,
        ],
        configPatch: `# Review agent config for "${agentId}":\nagents:\n  ${agentId}:\n    model: gpt-4o-mini  # downgrade if not doing complex reasoning\n    caching: { systemPrompt: true }`,
      });
    }

    return insights;
  },
};
