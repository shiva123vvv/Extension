export const db = {
  users: new Map(),          // key: userId -> { id, name }
  channels: new Map(),       // key: channelId -> { id, name }
  messageStats: [],          // array of { userId, channelId, ts, textLength, isLateNight }
  dailySummaries: new Map(), // key: dateString -> { teamScore, members[] }
  alertRules: new Map()      // key: ruleId -> { ... }
};
