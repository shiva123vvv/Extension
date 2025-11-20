import { db } from "../config/db.js";
import { isLateNight } from "../utils/timeWindow.js";

export function recordMessage({ userId, channelId, ts, text }) {
  if (!userId) return;

  const date = ts ? new Date(ts) : new Date();

  const entry = {
    userId,
    channelId: channelId || "direct",
    ts: date.getTime(),
    textLength: text ? text.length : 0,
    isLateNight: isLateNight(date)
  };

  db.messageStats.push(entry);
}

export function getAllMessageStats() {
  return db.messageStats;
}
