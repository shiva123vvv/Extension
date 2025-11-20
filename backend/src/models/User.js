import { db } from "../config/db.js";

export function upsertUser({ id, name }) {
  if (!id) return null;
  const existing = db.users.get(id) || {};
  const updated = {
    id,
    name: name || existing.name || `User-${id}`
  };
  db.users.set(id, updated);
  return updated;
}

export function getUser(id) {
  return db.users.get(id) || null;
}

export function getAllUsers() {
  return Array.from(db.users.values());
}
