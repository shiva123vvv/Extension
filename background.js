// Background service worker for Cognitive Load Monitor
chrome.runtime.onInstalled.addListener(() => {
  console.log("Cognitive Load Monitor installed");
  initializeStorage();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background received message:", request);
  
  if (request.action === "analyzeMessages") {
    analyzeCognitiveLoad(request.messages)
      .then(result => sendResponse({success: true, data: result}))
      .catch(error => sendResponse({success: false, error: error.message}));
    return true; // Keep message channel open for async response
  }
});

// Initialize storage with default values
function initializeStorage() {
  chrome.storage.local.get(['scanHistory', 'settings'], (result) => {
    if (!result.scanHistory) {
      chrome.storage.local.set({scanHistory: []});
    }
    if (!result.settings) {
      chrome.storage.local.set({
        settings: {
          sensitivity: "medium",
          scanInterval: 30,
          notifyChanges: true
        }
      });
    }
  });
}

// AI Analysis Function (Mock - Replace with actual AI API)
async function analyzeCognitiveLoad(messages) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const analysis = {
        stressLevel: calculateStressLevel(messages),
        productivityScore: calculateProductivityScore(messages),
        sentiment: analyzeSentiment(messages),
        keywords: extractKeywords(messages),
        recommendation: generateRecommendation(messages)
      };
      resolve(analysis);
    }, 1000);
  });
}

// Mock analysis functions (Replace with real AI logic)
function calculateStressLevel(messages) {
  const stressKeywords = ['stress', 'overwhelmed', 'busy', 'deadline', 'urgent', 'help'];
  let stressCount = 0;
  
  messages.forEach(msg => {
    stressKeywords.forEach(keyword => {
      if (msg.text.toLowerCase().includes(keyword)) stressCount++;
    });
  });
  
  return Math.min(100, (stressCount / messages.length) * 100);
}

function calculateProductivityScore(messages) {
  const productiveKeywords = ['done', 'completed', 'progress', 'achieved', 'finished'];
  let productiveCount = 0;
  
  messages.forEach(msg => {
    productiveKeywords.forEach(keyword => {
      if (msg.text.toLowerCase().includes(keyword)) productiveCount++;
    });
  });
  
  return Math.min(100, (productiveCount / messages.length) * 100);
}

function analyzeSentiment(messages) {
  const positiveWords = ['good', 'great', 'awesome', 'thanks', 'happy'];
  const negativeWords = ['bad', 'terrible', 'issue', 'problem', 'sad'];
  
  let positive = 0, negative = 0;
  
  messages.forEach(msg => {
    positiveWords.forEach(word => {
      if (msg.text.toLowerCase().includes(word)) positive++;
    });
    negativeWords.forEach(word => {
      if (msg.text.toLowerCase().includes(word)) negative++;
    });
  });
  
  return positive > negative ? 'positive' : positive < negative ? 'negative' : 'neutral';
}

function extractKeywords(messages) {
  const commonWords = ['the', 'a', 'is', 'in', 'to', 'for'];
  const words = messages.flatMap(msg => 
    msg.text.toLowerCase().split(/\W+/).filter(word => 
      word.length > 3 && !commonWords.includes(word)
    )
  );
  
  return [...new Set(words)].slice(0, 10);
}

function generateRecommendation(messages) {
  const stressLevel = calculateStressLevel(messages);
  
  if (stressLevel > 70) {
    return "High stress detected. Consider workload redistribution and breaks.";
  } else if (stressLevel > 40) {
    return "Moderate stress levels. Monitor team workload.";
  } else {
    return "Team appears balanced. Maintain current pace.";
  }
}