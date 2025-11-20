import { db } from "../config/db.js";

export function setDefaultAlertRules() {
  if (db.alertRules.size > 0) return;

  db.alertRules.set("criticalThreshold", { id: "criticalThreshold", value: 80 });
  db.alertRules.set("highThreshold", { id: "highThreshold", value: 60 });
}

export function getAlertRule(id) {
  const rule = db.alertRules.get(id);
  return rule ? rule.value : null;
}
