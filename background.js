// Cognitive Load Monitor - Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("Cognitive Load Monitor installed");
  initializeStorage();
});

// Initialize default storage
function initializeStorage() {
  chrome.storage.local.get(['scanHistory', 'settings', 'privacySettings'], (result) => {
    const defaults = {
      scanHistory: [],
      settings: {
        sensitivity: "medium",
        autoScan: false,
        notifications: true,
        dataRetentionDays: 30
      },
      privacySettings: {
        storeRawMessages: false,
        anonymousMode: true,
        maxHistorySize: 50
      }
    };
    
    // Only set defaults if they don't exist
    if (!result.scanHistory) {
      chrome.storage.local.set(defaults);
    }
  });
}

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background received:", request.action);
  
  if (request.action === "analyzeMessages") {
    analyzeCognitiveLoad(request.messages)
      .then(result => {
        sendResponse({ success: true, data: result });
      })
      .catch(error => {
        console.error("Analysis error:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === "getSettings") {
    chrome.storage.local.get(['settings'], (result) => {
      sendResponse({ success: true, settings: result.settings });
    });
    return true;
  }
  
  if (request.action === "saveSettings") {
    chrome.storage.local.set({ settings: request.settings }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// AI Analysis Function
async function analyzeCognitiveLoad(messages) {
  return new Promise((resolve) => {
    // Simulate AI processing time
    setTimeout(() => {
      try {
        const analysis = {
          stressLevel: calculateStressLevel(messages),
          productivityScore: calculateProductivityScore(messages),
          sentiment: analyzeSentiment(messages),
          keywords: extractKeywords(messages),
          recommendation: generateRecommendation(messages),
          messageCount: messages.length,
          timestamp: new Date().toISOString(),
          analysisId: 'analysis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        };
        
        resolve(analysis);
      } catch (error) {
        reject(error);
      }
    }, 1000);
  });
}

// Enhanced stress level calculation
function calculateStressLevel(messages) {
  const stressWords = [
    'stress', 'stressed', 'overwhelmed', 'overwhelming', 'busy', 'deadline', 
    'urgent', 'emergency', 'help', 'tired', 'exhausted', 'burnout', 'burned out',
    'pressure', 'pressured', 'anxious', 'anxiety', 'worried', 'nervous'
  ];
  
  const urgencyWords = [
    'asap', 'immediately', 'now', 'quick', 'fast', 'rush', 'hurry',
    'critical', 'important', 'priority', 'deadline'
  ];
  
  let stressScore = 0;
  let totalMessages = messages.length;
  let urgentMessageCount = 0;
  
  messages.forEach(message => {
    const text = message.text.toLowerCase();
    let messageStress = 0;
    
    // Check for stress words
    stressWords.forEach(word => {
      if (text.includes(word)) {
        messageStress += 2;
        if (word === 'urgent' || word === 'emergency') messageStress += 3;
      }
    });
    
    // Check for urgency indicators
    urgencyWords.forEach(word => {
      if (text.includes(word)) messageStress += 3;
    });
    
    // Check for excessive punctuation
    const exclamationCount = (text.match(/!/g) || []).length;
    const questionCount = (text.match(/\?/g) || []).length;
    if (exclamationCount > 2) messageStress += exclamationCount;
    if (questionCount > 3) messageStress += questionCount;
    
    // Check for ALL CAPS (shouting)
    const capsWords = text.split(/\s+/).filter(word => word.length > 3 && word === word.toUpperCase());
    if (capsWords.length > 0) messageStress += capsWords.length * 2;
    
    if (messageStress > 5) urgentMessageCount++;
    
    stressScore += messageStress;
  });
  
  // Calculate base score from words
  const wordScore = (stressScore / Math.max(totalMessages, 1)) * 10;
  
  // Calculate urgency ratio score
  const urgencyRatio = (urgentMessageCount / Math.max(totalMessages, 1)) * 50;
  
  // Combine scores
  const rawScore = Math.min(100, wordScore + urgencyRatio);
  
  return Math.round(rawScore * 10) / 10;
}

// Enhanced productivity score calculation
function calculateProductivityScore(messages) {
  const productiveWords = [
    'done', 'completed', 'finished', 'achieved', 'accomplished', 'success',
    'progress', 'moving', 'forward', 'solved', 'resolved', 'fixed',
    'complete', 'ready', 'delivered', 'shipped', 'deployed'
  ];
  
  const positiveWords = [
    'great', 'good', 'excellent', 'awesome', 'perfect', 'nice', 'well',
    'smooth', 'easy', 'working', 'functioning', 'stable'
  ];
  
  const blockingWords = [
    'blocked', 'stuck', 'waiting', 'pending', 'issue', 'problem', 'error',
    'bug', 'broken', 'failed', 'cannot', 'can\'t', 'wont', 'doesn\'t',
    'difficult', 'hard', 'challenge', 'complicated', 'confused'
  ];
  
  let productiveScore = 50; // Start at neutral
  
  messages.forEach(message => {
    const text = message.text.toLowerCase();
    
    // Positive productivity indicators
    productiveWords.forEach(word => {
      if (text.includes(word)) productiveScore += 4;
    });
    
    positiveWords.forEach(word => {
      if (text.includes(word)) productiveScore += 2;
    });
    
    // Negative productivity indicators
    blockingWords.forEach(word => {
      if (text.includes(word)) productiveScore -= 5;
    });
    
    // Check for question patterns that indicate blockers
    if ((text.match(/\?/g) || []).length > 2) {
      productiveScore -= 3;
    }
  });
  
  // Normalize score
  const normalizedScore = Math.min(100, Math.max(0, productiveScore));
  return Math.round(normalizedScore * 10) / 10;
}

// Sentiment analysis
function analyzeSentiment(messages) {
  const positiveWords = [
    'good', 'great', 'excellent', 'awesome', 'amazing', 'perfect', 'nice',
    'happy', 'pleased', 'satisfied', 'thanks', 'thank you', 'appreciate',
    'love', 'fantastic', 'wonderful', 'smooth', 'easy', 'working'
  ];
  
  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'sucks', 'hate', 'angry',
    'mad', 'frustrated', 'frustrating', 'annoying', 'disappointed',
    'sad', 'unhappy', 'broken', 'failed', 'issue', 'problem'
  ];
  
  let positiveCount = 0;
  let negativeCount = 0;
  let totalSentimentWords = 0;
  
  messages.forEach(message => {
    const text = message.text.toLowerCase();
    const words = text.split(/\s+/);
    
    words.forEach(word => {
      if (positiveWords.includes(word)) {
        positiveCount++;
        totalSentimentWords++;
      } else if (negativeWords.includes(word)) {
        negativeCount++;
        totalSentimentWords++;
      }
    });
  });
  
  if (totalSentimentWords === 0) return 'neutral';
  
  const positiveRatio = positiveCount / totalSentimentWords;
  const negativeRatio = negativeCount / totalSentimentWords;
  
  if (positiveRatio > negativeRatio + 0.1) return 'positive';
  if (negativeRatio > positiveRatio + 0.1) return 'negative';
  return 'neutral';
}

// Keyword extraction
function extractKeywords(messages) {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ]);
  
  const wordFrequency = {};
  let totalWords = 0;
  
  // Count word frequencies
  messages.forEach(message => {
    const words = message.text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    
    words.forEach(word => {
      if (!commonWords.has(word)) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        totalWords++;
      }
    });
  });
  
  // Convert to weighted scores (frequency relative to total words)
  const weightedWords = Object.entries(wordFrequency).map(([word, count]) => ({
    word,
    score: (count / totalWords) * 1000
  }));
  
  // Sort by score and return top keywords
  return weightedWords
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(item => item.word);
}

// Recommendation engine
function generateRecommendation(messages) {
  const stressLevel = calculateStressLevel(messages);
  const productivityScore = calculateProductivityScore(messages);
  const sentiment = analyzeSentiment(messages);
  
  if (stressLevel > 75 && productivityScore < 25) {
    return "🚨 CRITICAL: High stress and very low productivity detected. Immediate intervention needed. Consider: 1) Emergency team meeting 2) Workload redistribution 3) Professional support resources";
  } else if (stressLevel > 65) {
    return "⚠️ HIGH STRESS: Team shows significant stress signals. Recommendations: 1) Schedule team breaks 2) Review deadlines 3) Implement stress-reduction activities 4) Manager check-ins";
  } else if (productivityScore < 35) {
    return "📉 LOW PRODUCTIVITY: Team efficiency needs improvement. Suggestions: 1) Identify and remove blockers 2) Clarify priorities 3) Provide additional resources 4) Streamline processes";
  } else if (stressLevel > 50 && productivityScore < 50) {
    return "⚖️ MODERATE CONCERN: Balance needed between stress and productivity. Consider: 1) Workload assessment 2) Skill development 3) Process optimization 4) Regular feedback";
  } else if (stressLevel < 30 && productivityScore > 70 && sentiment === 'positive') {
    return "✅ OPTIMAL: Team is in great condition! Maintain: 1) Current workflow balance 2) Positive environment 3) Regular recognition 4) Continuous improvement";
  } else if (sentiment === 'negative') {
    return "😔 NEGATIVE SENTIMENT: Team morale needs attention. Focus on: 1) Open communication 2) Conflict resolution 3) Team building 4) Positive reinforcement";
  } else {
    return "📊 STABLE: Team performance is within normal ranges. Continue monitoring and maintain current support levels.";
  }
}

// Clean up old data periodically
function cleanupOldData() {
  chrome.storage.local.get(['scanHistory', 'settings'], (result) => {
    const retentionDays = result.settings?.dataRetentionDays || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    if (result.scanHistory) {
      const filteredHistory = result.scanHistory.filter(scan => 
        new Date(scan.timestamp) > cutoffDate
      );
      
      if (filteredHistory.length !== result.scanHistory.length) {
        chrome.storage.local.set({ scanHistory: filteredHistory });
        console.log(`Cleaned up ${result.scanHistory.length - filteredHistory.length} old scans`);
      }
    }
  });
}

// Run cleanup once a day
setInterval(cleanupOldData, 24 * 60 * 60 * 1000);