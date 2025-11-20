import { db } from "../config/db.js";

export function upsertChannel({ id, name }) {
  if (!id) return null;
  const existing = db.channels.get(id) || {};
  const updated = {
    id,
    name: name || existing.name || `Channel-${id}`
  };
  db.channels.set(id, updated);
  return updated;
}

export function getChannel(id) {
  return db.channels.get(id) || null;
}

export function getAllChannels() {
  return Array.from(db.channels.values());
}
