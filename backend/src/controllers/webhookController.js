import { upsertUser } from "../models/User.js";
import { upsertChannel } from "../models/Channel.js";
import { recordMessage } from "../models/MessageStat.js";
import { computeTodayMetrics } from "../services/metricsService.js";
import { computeAlerts } from "../services/alertService.js";
import { log } from "../utils/logger.js";

export function handleWebhook(req, res) {
  const body = req.body || {};
  const { type } = body;

  if (type === "message") {
    const userId = body.user_id;
    const userName = body.user_name;
    const channelId = body.channel_id;
    const channelName = body.channel_name;
    const text = body.text;
    const ts = body.ts;

    upsertUser({ id: userId, name: userName });
    upsertChannel({ id: channelId, name: channelName });
    recordMessage({ userId, channelId, ts, text });

    return res.json({ ok: true });
  }

  if (type === "scheduler") {
    const { metrics, alerts } = computeAlerts();
    log("Scheduler metrics:", metrics);
    log("Scheduler alerts:", alerts);
    return res.json({ ok: true, metrics, alerts });
  }

  return res.status(400).json({ ok: false, error: "Unknown webhook type" });
}

export function handleTeamHealthCommand(req, res) {
  const metrics = computeTodayMetrics();

  let text = `Team Cognitive Load Summary\n\n`;
  text += `Team Stress Index: ${metrics.teamScore}/100\n`;
  text += `Members analysed: ${metrics.usersCount}, Messages today: ${metrics.allMessagesCount}\n\n`;
  text += `Top members:\n`;

  metrics.members.slice(0, 5).forEach((m, i) => {
    text += `${i + 1}. ${m.name} – ${m.stressScore}/100 (${m.status}) | msgs: ${
      m.totalMessages
    }, late-night: ${m.lateNightMessages}\n`;
  });

  res.json({ text });
}

export function handleMyLoadCommand(req, res) {
  const body = req.body || {};
  const userId = body.source_user_id;
  const metrics = computeTodayMetrics();

  const me = metrics.members.find(m => m.id === userId);

  if (!me) {
    return res.json({
      text: "No data for you yet today. Start chatting and I'll track your load."
    });
  }

  let text = `Your Cognitive Load Today\n\n`;
  text += `Name: ${me.name}\n`;
  text += `Stress Score: ${me.stressScore}/100 (${me.status})\n`;
  text += `Messages: ${me.totalMessages}\n`;
  text += `Late-night messages: ${me.lateNightMessages}\n`;
  text += `Avg. message length: ${Math.round(me.avgLength)} chars\n`;

  res.json({ text });
}
