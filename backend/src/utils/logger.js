export function log(...args) {
  console.log("[TEAM-LOAD]", ...args);
}

export function logError(...args) {
  console.error("[TEAM-LOAD][ERROR]", ...args);
}
