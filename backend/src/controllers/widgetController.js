import { computeTodayMetrics } from "../services/metricsService.js";

export function getTeamSummaryWidget(req, res) {
  const metrics = computeTodayMetrics();
  return res.json({
    teamScore: metrics.teamScore,
    members: metrics.members
  });
}
