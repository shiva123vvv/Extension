import { getAllMessageStats } from "../models/MessageStat.js";
import { getTodayStart } from "../utils/timeWindow.js";
import { getAllUsers } from "../models/User.js";
import { getAllChannels } from "../models/Channel.js";
import { computeUserStressScores } from "./scoringService.js";

export function computeTodayMetrics() {
  const todayStart = getTodayStart();
  const allMessages = getAllMessageStats().filter(m => m.ts >= todayStart);

  const users = getAllUsers();
  const channels = getAllChannels();

  const userChannelMap = new Map(); // key userId -> Set(channelId)
  const statsMap = new Map();       // key userId -> { totalMessages, lateNightMessages, totalLength }

  for (const msg of allMessages) {
    const uId = msg.userId;
    if (!statsMap.has(uId)) {
      statsMap.set(uId, {
        totalMessages: 0,
        lateNightMessages: 0,
        totalLength: 0
      });
    }

    const s = statsMap.get(uId);
    s.totalMessages += 1;
    if (msg.isLateNight) s.lateNightMessages += 1;
    s.totalLength += msg.textLength || 0;

    if (!userChannelMap.has(uId)) {
      userChannelMap.set(uId, new Set());
    }
    userChannelMap.get(uId).add(msg.channelId || "direct");
  }

  const perUserStats = [];

  for (const user of users) {
    const s = statsMap.get(user.id) || {
      totalMessages: 0,
      lateNightMessages: 0,
      totalLength: 0
    };

    const chSet = userChannelMap.get(user.id) || new Set();
    const channelCount = chSet.size || 1;

    const totalMessages = s.totalMessages;
    const avgLength = totalMessages === 0 ? 0 : s.totalLength / totalMessages;

    perUserStats.push({
      id: user.id,
      name: user.name,
      totalMessages,
      lateNightMessages: s.lateNightMessages,
      avgLength,
      channelCount
    });
  }

  const scores = computeUserStressScores(perUserStats);
  return {
    ...scores,
    allMessagesCount: allMessages.length,
    usersCount: users.length,
    channelsCount: channels.length
  };
}
