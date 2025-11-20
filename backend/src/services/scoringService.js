import { getAlertRule, setDefaultAlertRules } from "../models/AlertRule.js";

setDefaultAlertRules();

function normalize(value, min, max) {
  if (max === min) return 0;
  const v = (value - min) / (max - min);
  return Math.max(0, Math.min(1, v)) * 100;
}

export function computeUserStressScores(perUserStats) {
  if (!perUserStats || perUserStats.length === 0) {
    return { teamScore: 0, members: [] };
  }

  const maxMessages = Math.max(...perUserStats.map(u => u.totalMessages), 1);
  const maxLate = Math.max(...perUserStats.map(u => u.lateNightMessages), 1);
  const maxChannels = Math.max(...perUserStats.map(u => u.channelCount || 1), 1);

  const critical = getAlertRule("criticalThreshold") || 80;
  const high = getAlertRule("highThreshold") || 60;

  const members = perUserStats.map(u => {
    const load = normalize(u.totalMessages, 0, maxMessages);
    const burnout = normalize(u.lateNightMessages, 0, maxLate);
    const contextSpread = normalize(u.channelCount || 1, 1, maxChannels);

    const stressScore = Math.round(load * 0.5 + burnout * 0.3 + contextSpread * 0.2);

    let status = "NORMAL";
    if (stressScore >= critical) status = "CRITICAL";
    else if (stressScore >= high) status = "HIGH";

    return { ...u, stressScore, status };
  });

  const teamScore =
    members.reduce((sum, m) => sum + m.stressScore, 0) / members.length;

  return {
    teamScore: Math.round(teamScore),
    members: members.sort((a, b) => b.stressScore - a.stressScore)
  };
}
