import { db } from "../config/db.js";

export function saveDailySummary(dateKey, summary) {
  db.dailySummaries.set(dateKey, summary);
}

export function getDailySummary(dateKey) {
  return db.dailySummaries.get(dateKey) || null;
}
