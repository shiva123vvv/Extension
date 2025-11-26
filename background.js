// Cognitive Load Monitor - Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("Cognitive Load Monitor installed");
  initializeStorage();
});

// Initialize default storage
function initializeStorage() {
  chrome.storage.local.get(['scanHistory', 'settings'], (result) => {
    if (!result.scanHistory) {
      chrome.storage.local.set({
        scanHistory: [],
        settings: {
          sensitivity: "medium",
          autoScan: false,
          notifications: true
        }
      });
    }
  });
}

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background received:", request);
  
  if (request.action === "analyzeMessages") {
    analyzeCognitiveLoad(request.messages)
      .then(result => {
        sendResponse({ success: true, data: result });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open
  }
});

// AI Analysis Function (Mock - Replace with real API)
async function analyzeCognitiveLoad(messages) {
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      const analysis = {
        stressLevel: calculateStressLevel(messages),
        productivityScore: calculateProductivityScore(messages),
        sentiment: analyzeSentiment(messages),
        keywords: extractKeywords(messages),
        recommendation: generateRecommendation(messages),
        messageCount: messages.length,
        timestamp: new Date().toISOString()
      };
      resolve(analysis);
    }, 1500);
  });
}

// Analysis algorithms
function calculateStressLevel(messages) {
  const stressWords = ['stress', 'overwhelmed', 'busy', 'deadline', 'urgent', 'help', 'tired', 'burnout', 'exhausted'];
  const urgencyWords = ['asap', 'immediately', 'emergency', 'critical', 'important'];
  
  let stressScore = 0;
  let totalWords = 0;
  
  messages.forEach(message => {
    const words = message.text.toLowerCase().split(/\s+/);
    totalWords += words.length;
    
    words.forEach(word => {
      if (stressWords.includes(word)) stressScore += 2;
      if (urgencyWords.includes(word)) stressScore += 3;
      if (word.includes('!')) stressScore += 1; // Exclamation marks indicate urgency
    });
  });
  
  const rawScore = (stressScore / Math.max(totalWords, 1)) * 100;
  return Math.min(100, Math.max(0, rawScore));
}

function calculateProductivityScore(messages) {
  const productiveWords = ['done', 'completed', 'finished', 'achieved', 'progress', 'success', 'accomplished'];
  const blockingWords = ['blocked', 'stuck', 'waiting', 'issue', 'problem', 'cannot'];
  
  let productiveScore = 50; // Start at neutral
  
  messages.forEach(message => {
    const text = message.text.toLowerCase();
    
    productiveWords.forEach(word => {
      if (text.includes(word)) productiveScore += 5;
    });
    
    blockingWords.forEach(word => {
      if (text.includes(word)) productiveScore -= 7;
    });
  });
  
  return Math.min(100, Math.max(0, productiveScore));
}

function analyzeSentiment(messages) {
  const positiveWords = ['good', 'great', 'awesome', 'thanks', 'happy', 'excellent', 'perfect', 'working'];
  const negativeWords = ['bad', 'terrible', 'issue', 'problem', 'sad', 'broken', 'failed', 'wrong'];
  
  let positive = 0;
  let negative = 0;
  
  messages.forEach(message => {
    const words = message.text.toLowerCase().split(/\s+/);
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positive++;
      if (negativeWords.includes(word)) negative++;
    });
  });
  
  if (positive > negative) return 'positive';
  if (negative > positive) return 'negative';
  return 'neutral';
}

function extractKeywords(messages) {
  const commonWords = new Set(['the', 'a', 'is', 'in', 'to', 'for', 'and', 'or', 'but', 'on', 'at', 'by']);
  const wordFrequency = {};
  
  messages.forEach(message => {
    const words = message.text.toLowerCase().match(/\b\w+\b/g) || [];
    
    words.forEach(word => {
      if (word.length > 3 && !commonWords.has(word)) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });
  });
  
  // Return top 5 most frequent words
  return Object.entries(wordFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

function generateRecommendation(messages) {
  const stressLevel = calculateStressLevel(messages);
  const productivityScore = calculateProductivityScore(messages);
  
  if (stressLevel > 70 && productivityScore < 30) {
    return "🚨 High stress and low productivity detected. Consider immediate team support and workload redistribution.";
  } else if (stressLevel > 50) {
    return "⚠️ Elevated stress levels. Recommend regular breaks and check-ins.";
  } else if (productivityScore < 40) {
    return "📉 Productivity below optimal. Review blockers and provide support.";
  } else if (stressLevel < 30 && productivityScore > 70) {
    return "✅ Team is balanced and productive. Maintain current workflow.";
  } else {
    return "📊 Team performance is stable. Continue monitoring.";
  }
}