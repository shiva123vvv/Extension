import { computeTodayMetrics } from "./metricsService.js";

export function computeAlerts() {
  const metrics = computeTodayMetrics();
  const alerts = [];

  for (const m of metrics.members) {
    if (m.status === "CRITICAL") {
      alerts.push({
        type: "USER_OVERLOADED",
        severity: "HIGH",
        message: `${m.name} is overloaded today (${m.stressScore}/100). Consider reassigning tasks.`,
        userId: m.id
      });
    } else if (m.status === "HIGH") {
      alerts.push({
        type: "USER_HIGH_LOAD",
        severity: "MEDIUM",
        message: `${m.name} has high cognitive load (${m.stressScore}/100).`,
        userId: m.id
      });
    }
  }

  return { metrics, alerts };
}
