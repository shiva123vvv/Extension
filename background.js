// Cognitive Load Monitor Pro - Enhanced Background Service Worker
class AdvancedCognitiveAnalyzer {
  constructor() {
    this.realTimeData = {
      messages: [],
      userActivity: [],
      stressTrend: [],
      productivityTrend: []
    };
    this.settings = {};
    this.loadSettings();
  }

  async loadSettings() {
    const result = await chrome.storage.local.get(['settings']);
    this.settings = result.settings || this.getDefaultSettings();
  }

  getDefaultSettings() {
    return {
      sensitivity: "medium",
      autoScan: false,
      notifications: true,
      dataRetentionDays: 30,
      realTimeMonitoring: true,
      stressThreshold: 70,
      productivityThreshold: 30,
      trackTrends: true,
      alertFrequency: "medium"
    };
  }

  async analyzeCognitiveLoad(messages) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const analysis = {
            // Core metrics
            stressLevel: this.calculateStressLevel(messages),
            productivityScore: this.calculateProductivityScore(messages),
            engagementLevel: this.calculateEngagementLevel(messages),
            sentiment: this.analyzeSentiment(messages),
            
            // Advanced metrics
            teamCohesion: this.calculateTeamCohesion(messages),
            communicationEfficiency: this.calculateCommunicationEfficiency(messages),
            workloadDistribution: this.analyzeWorkloadDistribution(messages),
            
            // Detailed analysis
            keywords: this.extractKeywords(messages),
            topics: this.extractTopics(messages),
            patterns: this.identifyPatterns(messages),
            
            // Recommendations
            recommendation: this.generateRecommendation(messages),
            immediateActions: this.suggestImmediateActions(messages),
            longTermStrategies: this.suggestLongTermStrategies(messages),
            
            // Metadata
            messageCount: messages.length,
            analysisPeriod: this.getAnalysisPeriod(messages),
            confidenceScore: this.calculateConfidence(messages),
            timestamp: new Date().toISOString(),
            analysisId: 'analysis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
          };
          
          // Update trends
          this.updateTrends(analysis);
          
          resolve(analysis);
        } catch (error) {
          console.error("Analysis error:", error);
          resolve(this.getFallbackAnalysis(messages));
        }
      }, 800);
    });
  }

  calculateStressLevel(messages) {
    const stressWords = [
      'stress', 'stressed', 'overwhelmed', 'overwhelming', 'busy', 'deadline', 
      'urgent', 'emergency', 'help', 'tired', 'exhausted', 'burnout', 'burned out',
      'pressure', 'pressured', 'anxious', 'anxiety', 'worried', 'nervous', 'frustrated'
    ];
    
    const urgencyWords = [
      'asap', 'immediately', 'now', 'quick', 'fast', 'rush', 'hurry',
      'critical', 'important', 'priority', 'deadline', 'late', 'behind'
    ];
    
    let stressScore = 0;
    let totalMessages = messages.length;
    let urgentMessageCount = 0;
    let highStressMessages = 0;
    
    messages.forEach(message => {
      const text = message.text.toLowerCase();
      let messageStress = 0;
      
      // Check for stress words with context
      stressWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          messageStress += matches.length * 2;
          if (['urgent', 'emergency', 'burnout'].includes(word)) {
            messageStress += 3;
          }
        }
      });
      
      // Check for urgency indicators
      urgencyWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) messageStress += matches.length * 3;
      });
      
      // Check for emotional indicators
      const exclamationCount = (text.match(/!/g) || []).length;
      const questionCount = (text.match(/\?/g) || []).length;
      if (exclamationCount > 2) messageStress += exclamationCount;
      if (questionCount > 3) messageStress += questionCount * 0.5;
      
      // Check for ALL CAPS (shouting)
      const capsWords = text.split(/\s+/).filter(word => 
        word.length > 3 && word === word.toUpperCase() && !word.match(/^[A-Z]+$/)
      );
      if (capsWords.length > 0) messageStress += capsWords.length * 2;
      
      // Negative emojis
      const negativeEmojis = (text.match(/😠|😡|💢|😤|😾|🙀|😿|😔|😟|🙁|☹️|😕|😬|🥺|😩|😫/g) || []).length;
      messageStress += negativeEmojis * 2;
      
      if (messageStress > 8) {
        urgentMessageCount++;
        if (messageStress > 15) highStressMessages++;
      }
      
      stressScore += messageStress;
    });
    
    // Calculate base score from words
    const wordScore = (stressScore / Math.max(totalMessages, 1)) * 8;
    
    // Calculate urgency ratio score
    const urgencyRatio = (urgentMessageCount / Math.max(totalMessages, 1)) * 40;
    
    // High stress message penalty
    const highStressPenalty = (highStressMessages / Math.max(totalMessages, 1)) * 30;
    
    // Combine scores with weights
    const rawScore = Math.min(100, wordScore + urgencyRatio + highStressPenalty);
    
    // Apply sensitivity setting
    const sensitivityMultiplier = this.settings.sensitivity === 'high' ? 1.2 : 
                                this.settings.sensitivity === 'low' ? 0.8 : 1;
    
    return Math.round(Math.min(100, rawScore * sensitivityMultiplier) * 10) / 10;
  }

  calculateProductivityScore(messages) {
    const productiveWords = [
      'done', 'completed', 'finished', 'achieved', 'accomplished', 'success',
      'progress', 'moving', 'forward', 'solved', 'resolved', 'fixed',
      'complete', 'ready', 'delivered', 'shipped', 'deployed', 'launched'
    ];
    
    const positiveWords = [
      'great', 'good', 'excellent', 'awesome', 'perfect', 'nice', 'well',
      'smooth', 'easy', 'working', 'functioning', 'stable', 'improved'
    ];
    
    const blockingWords = [
      'blocked', 'stuck', 'waiting', 'pending', 'issue', 'problem', 'error',
      'bug', 'broken', 'failed', 'cannot', 'can\'t', 'wont', 'doesn\'t',
      'difficult', 'hard', 'challenge', 'complicated', 'confused', 'delay'
    ];
    
    let productiveScore = 50; // Start at neutral
    
    messages.forEach(message => {
      const text = message.text.toLowerCase();
      
      // Positive productivity indicators
      productiveWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) productiveScore += matches.length * 4;
      });
      
      positiveWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) productiveScore += matches.length * 2;
      });
      
      // Negative productivity indicators
      blockingWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) productiveScore -= matches.length * 5;
      });
      
      // Check for question patterns that indicate blockers
      const questionCount = (text.match(/\?/g) || []).length;
      if (questionCount > 2) productiveScore -= questionCount * 1.5;
      
      // Positive emojis
      const positiveEmojis = (text.match(/✅|☑️|✔️|👍|🚀|🎉|✨|🌟|💪|🔥/g) || []).length;
      productiveScore += positiveEmojis * 3;
    });
    
    // Normalize score
    const normalizedScore = Math.min(100, Math.max(0, productiveScore));
    return Math.round(normalizedScore * 10) / 10;
  }

  calculateEngagementLevel(messages) {
    if (messages.length < 5) return 50;
    
    const engagementIndicators = [
      '?', // Questions
      '!', // Excitement
      'http', // Links shared
      'idea', 'suggest', 'propose' // Suggestions
    ];
    
    let engagementScore = 0;
    let totalWords = 0;
    
    messages.forEach(message => {
      const text = message.text.toLowerCase();
      totalWords += text.split(/\s+/).length;
      
      engagementIndicators.forEach(indicator => {
        if (text.includes(indicator)) engagementScore += 2;
      });
      
      // Questions indicate engagement
      if (text.includes('?')) engagementScore += 3;
      
      // Longer messages might indicate more thoughtful engagement
      if (text.length > 100) engagementScore += 2;
    });
    
    const avgWordsPerMessage = totalWords / messages.length;
    engagementScore += Math.min(20, avgWordsPerMessage * 2);
    
    return Math.min(100, Math.max(0, engagementScore));
  }

  calculateTeamCohesion(messages) {
    // Simple cohesion calculation based on message patterns
    const questionCount = messages.filter(msg => 
      msg.text.includes('?')
    ).length;
    
    const responseRate = Math.min(1, questionCount / Math.max(messages.length, 1));
    const positiveSentiment = this.analyzeSentiment(messages) === 'positive' ? 1 : 0.5;
    
    return Math.round((responseRate * 60 + positiveSentiment * 40) * 10) / 10;
  }

  calculateCommunicationEfficiency(messages) {
    if (messages.length < 3) return 50;
    
    const avgMessageLength = messages.reduce((sum, msg) => 
      sum + msg.text.length, 0) / messages.length;
    
    const questionRatio = messages.filter(msg => 
      msg.text.includes('?')
    ).length / messages.length;
    
    // Optimal: medium length messages, some questions for clarity
    let efficiency = 50;
    
    if (avgMessageLength > 50 && avgMessageLength < 200) efficiency += 20;
    if (questionRatio > 0.1 && questionRatio < 0.3) efficiency += 15;
    if (this.containsClearActionItems(messages)) efficiency += 15;
    
    return Math.min(100, efficiency);
  }

  containsClearActionItems(messages) {
    const actionWords = ['todo', 'task', 'assign', 'action', 'need to', 'will do'];
    return messages.some(msg => 
      actionWords.some(word => msg.text.toLowerCase().includes(word))
    );
  }

  analyzeWorkloadDistribution(messages) {
    // Simple analysis of workload mentions
    const workloadWords = ['busy', 'overwhelmed', 'too much', 'workload', 'capacity'];
    const workloadMentions = messages.filter(msg =>
      workloadWords.some(word => msg.text.toLowerCase().includes(word))
    ).length;
    
    const ratio = workloadMentions / Math.max(messages.length, 1);
    return Math.round((1 - ratio) * 100); // Inverse - more mentions = worse distribution
  }

  extractTopics(messages) {
    const topics = {
      'meetings': ['meeting', 'call', 'schedule', 'calendar', 'zoom', 'teams'],
      'tasks': ['task', 'todo', 'assign', 'complete', 'finish', 'done'],
      'technical': ['code', 'bug', 'feature', 'deploy', 'technical', 'system'],
      'planning': ['plan', 'strategy', 'roadmap', 'goal', 'objective'],
      'support': ['help', 'support', 'issue', 'problem', 'question'],
      'collaboration': ['team', 'collaborate', 'work together', 'partner']
    };
    
    const topicCounts = {};
    let totalTopicMentions = 0;
    
    Object.entries(topics).forEach(([topic, keywords]) => {
      let count = 0;
      messages.forEach(message => {
        keywords.forEach(keyword => {
          if (message.text.toLowerCase().includes(keyword)) {
            count++;
            totalTopicMentions++;
          }
        });
      });
      topicCounts[topic] = count;
    });
    
    // Convert to percentages and return top topics
    return Object.entries(topicCounts)
      .filter(([_, count]) => count > 0)
      .map(([topic, count]) => ({
        topic,
        percentage: Math.round((count / totalTopicMentions) * 100),
        frequency: count
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);
  }

  identifyPatterns(messages) {
    const patterns = [];
    
    // Check for rapid messaging (potential stress)
    const timePatterns = this.analyzeTimePatterns(messages);
    if (timePatterns.rapidMessaging) patterns.push('rapid_messaging');
    
    // Check for repeated questions
    if (this.hasRepeatedQuestions(messages)) patterns.push('repeated_questions');
    
    // Check for late night activity
    if (timePatterns.lateNightActivity) patterns.push('late_night_work');
    
    return patterns;
  }

  analyzeTimePatterns(messages) {
    if (messages.length < 3) return {};
    
    const messageTimes = messages.map(msg => new Date(msg.timestamp));
    const rapidMessages = messageTimes.filter((time, index) => {
      if (index === 0) return false;
      const prevTime = messageTimes[index - 1];
      return (time - prevTime) < 30000; // 30 seconds
    }).length;
    
    const lateNightMessages = messageTimes.filter(time => {
      const hour = time.getHours();
      return hour >= 22 || hour <= 6; // 10 PM to 6 AM
    }).length;
    
    return {
      rapidMessaging: rapidMessages > messages.length * 0.3,
      lateNightActivity: lateNightMessages > messages.length * 0.2
    };
  }

  hasRepeatedQuestions(messages) {
    const questions = messages.filter(msg => msg.text.includes('?'));
    if (questions.length < 3) return false;
    
    // Simple check for similar questions
    const questionTexts = questions.map(q => q.text.toLowerCase().substring(0, 50));
    const uniqueQuestions = new Set(questionTexts);
    
    return uniqueQuestions.size < questions.length * 0.7;
  }

  generateRecommendation(messages) {
    const stressLevel = this.calculateStressLevel(messages);
    const productivityScore = this.calculateProductivityScore(messages);
    const engagementLevel = this.calculateEngagementLevel(messages);
    const sentiment = this.analyzeSentiment(messages);
    const patterns = this.identifyPatterns(messages);

    let recommendation = "";
    let urgency = "low";
    let category = "general";

    // Critical situation
    if (stressLevel > 80 && productivityScore < 20) {
      recommendation = "🚨 CRITICAL: Team shows extreme stress and very low productivity. Immediate intervention required:\n• Schedule emergency team meeting\n• Consider professional wellness support\n• Redistribute workload immediately\n• Implement mandatory breaks";
      urgency = "critical";
      category = "crisis";
    }
    // High stress scenarios
    else if (stressLevel > 70) {
      recommendation = "⚠️ HIGH STRESS: Team needs stress management:\n• Conduct stress assessment workshop\n• Implement flexible work hours\n• Encourage regular breaks\n• Provide mental health resources";
      urgency = "high";
      category = "stress_management";
    }
    // Low productivity scenarios
    else if (productivityScore < 30) {
      recommendation = "📉 LOW PRODUCTIVITY: Focus on efficiency:\n• Identify and remove workflow blockers\n• Clarify priorities and expectations\n• Provide additional tools/resources\n• Streamline communication processes";
      urgency = "medium";
      category = "productivity";
    }
    // Engagement issues
    else if (engagementLevel < 40) {
      recommendation = "💤 LOW ENGAGEMENT: Boost team participation:\n• Implement regular check-ins\n• Create engaging team activities\n• Encourage open communication\n• Recognize and reward contributions";
      urgency = "medium";
      category = "engagement";
    }
    // Negative sentiment
    else if (sentiment === 'negative') {
      recommendation = "😔 NEGATIVE SENTIMENT: Improve team morale:\n• Facilitate open feedback sessions\n• Address conflicts proactively\n• Organize team building activities\n• Celebrate small wins regularly";
      urgency = "medium";
      category = "morale";
    }
    // Rapid messaging pattern (potential chaos)
    else if (patterns.includes('rapid_messaging')) {
      recommendation = "⚡ RAPID COMMUNICATION: Team might be overwhelmed:\n• Establish communication protocols\n• Use threaded conversations\n• Schedule focused work periods\n• Reduce meeting frequency";
      urgency = "medium";
      category = "communication";
    }
    // Late night work pattern
    else if (patterns.includes('late_night_work')) {
      recommendation = "🌙 LATE NIGHT ACTIVITY: Work-life balance concern:\n• Encourage regular working hours\n• Discuss workload distribution\n• Promote time management techniques\n• Respect offline time boundaries";
      urgency = "medium";
      category = "work_life_balance";
    }
    // Optimal condition
    else if (stressLevel < 30 && productivityScore > 75 && engagementLevel > 70) {
      recommendation = "✅ OPTIMAL PERFORMANCE: Team is thriving!\n• Maintain current positive practices\n• Continue regular recognition\n• Support professional development\n• Foster innovation and creativity";
      urgency = "low";
      category = "excellence";
    }
    // Stable condition
    else {
      recommendation = "📊 STABLE PERFORMANCE: Team is functioning well\n• Continue current support levels\n• Monitor for emerging trends\n• Gather regular feedback\n• Support continuous improvement";
      urgency = "low";
      category = "maintenance";
    }

    return {
      text: recommendation,
      urgency: urgency,
      category: category,
      priority: this.getPriorityLevel(urgency)
    };
  }

  getPriorityLevel(urgency) {
    const priorities = {
      'critical': 1,
      'high': 2,
      'medium': 3,
      'low': 4
    };
    return priorities[urgency] || 4;
  }

  suggestImmediateActions(messages) {
    const actions = [];
    const stressLevel = this.calculateStressLevel(messages);
    const patterns = this.identifyPatterns(messages);

    if (stressLevel > 60) {
      actions.push("Schedule 15-minute team check-in today");
      actions.push("Identify most urgent tasks for delegation");
      actions.push("Send wellness resources to team");
    }

    if (patterns.includes('rapid_messaging')) {
      actions.push("Create dedicated channel for urgent matters");
      actions.push("Set communication response time expectations");
    }

    if (patterns.includes('late_night_work')) {
      actions.push("Send reminder about healthy work hours");
      actions.push("Review workload distribution");
    }

    return actions.length > 0 ? actions : ["Continue current monitoring schedule"];
  }

  suggestLongTermStrategies(messages) {
    const strategies = [];
    const stressLevel = this.calculateStressLevel(messages);
    const productivityScore = this.calculateProductivityScore(messages);

    if (stressLevel > 50) {
      strategies.push("Implement quarterly stress assessment surveys");
      strategies.push("Develop team wellness program");
      strategies.push("Train managers on stress recognition");
    }

    if (productivityScore < 50) {
      strategies.push("Review and optimize workflow processes");
      strategies.push("Provide productivity tool training");
      strategies.push("Establish clear success metrics");
    }

    return strategies.length > 0 ? strategies : ["Maintain current improvement initiatives"];
  }

  getAnalysisPeriod(messages) {
    if (messages.length < 2) return "single moment";
    
    const firstMessage = new Date(messages[0].timestamp);
    const lastMessage = new Date(messages[messages.length - 1].timestamp);
    const duration = lastMessage - firstMessage;
    
    if (duration < 3600000) return "last hour"; // 1 hour
    if (duration < 86400000) return "today"; // 24 hours
    if (duration < 604800000) return "this week"; // 7 days
    return "extended period";
  }

  calculateConfidence(messages) {
    if (messages.length < 5) return 50;
    if (messages.length < 15) return 70;
    if (messages.length < 30) return 85;
    return 95;
  }

  getFallbackAnalysis(messages) {
    return {
      stressLevel: 50,
      productivityScore: 50,
      engagementLevel: 50,
      sentiment: 'neutral',
      teamCohesion: 50,
      communicationEfficiency: 50,
      workloadDistribution: 50,
      keywords: [],
      topics: [],
      patterns: [],
      recommendation: {
        text: "Analysis unavailable. Please try again with more messages.",
        urgency: "low",
        category: "general",
        priority: 4
      },
      immediateActions: ["Retry analysis with more chat data"],
      longTermStrategies: ["Ensure extension has proper permissions"],
      messageCount: messages.length,
      analysisPeriod: "unknown",
      confidenceScore: 0,
      timestamp: new Date().toISOString(),
      analysisId: 'fallback_analysis'
    };
  }

  updateTrends(analysis) {
    const now = new Date();
    
    // Update stress trend (keep last 24 hours)
    this.realTimeData.stressTrend.push({
      timestamp: now,
      value: analysis.stressLevel
    });
    this.realTimeData.stressTrend = this.realTimeData.stressTrend.filter(
      point => now - point.timestamp < 24 * 60 * 60 * 1000
    );
    
    // Update productivity trend
    this.realTimeData.productivityTrend.push({
      timestamp: now,
      value: analysis.productivityScore
    });
    this.realTimeData.productivityTrend = this.realTimeData.productivityTrend.filter(
      point => now - point.timestamp < 24 * 60 * 60 * 1000
    );
    
    // Check for alerts
    this.checkAlerts(analysis);
  }

  checkAlerts(analysis) {
    if (!this.settings.notifications) return;

    const alerts = [];

    // Stress alert
    if (analysis.stressLevel > this.settings.stressThreshold) {
      alerts.push({
        type: 'stress',
        level: 'high',
        message: `Team stress level is high: ${analysis.stressLevel}%`,
        timestamp: new Date().toISOString()
      });
    }

    // Productivity alert
    if (analysis.productivityScore < this.settings.productivityThreshold) {
      alerts.push({
        type: 'productivity',
        level: 'low',
        message: `Team productivity is low: ${analysis.productivityScore}%`,
        timestamp: new Date().toISOString()
      });
    }

    // Send notifications for alerts
    alerts.forEach(alert => {
      this.sendNotification(alert);
    });

    // Store alerts
    if (alerts.length > 0) {
      this.storeAlerts(alerts);
    }
  }

  async sendNotification(alert) {
    if (!this.settings.notifications) return;

    try {
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: `Team Alert: ${alert.type.toUpperCase()}`,
        message: alert.message,
        priority: 2
      });
    } catch (error) {
      console.log('Notification not supported:', error);
    }
  }

  async storeAlerts(alerts) {
    const result = await chrome.storage.local.get(['alerts']);
    const existingAlerts = result.alerts || [];
    const updatedAlerts = [...alerts, ...existingAlerts].slice(0, 50); // Keep last 50 alerts
    
    await chrome.storage.local.set({ alerts: updatedAlerts });
  }
}

// Initialize the advanced analyzer
const analyzer = new AdvancedCognitiveAnalyzer();

// Enhanced background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("Cognitive Load Monitor Pro installed");
  initializeStorage();
  setupPeriodicTasks();
});

// Initialize default storage
async function initializeStorage() {
  const result = await chrome.storage.local.get(['scanHistory', 'settings', 'privacySettings', 'alerts']);
  
  const defaults = {
    scanHistory: [],
    settings: analyzer.getDefaultSettings(),
    privacySettings: {
      storeRawMessages: false,
      anonymousMode: true,
      maxHistorySize: 100,
      autoDeleteDays: 30
    },
    alerts: [],
    trends: {
      stress: [],
      productivity: [],
      engagement: []
    }
  };
  
  // Only set defaults if they don't exist
  if (!result.scanHistory) {
    await chrome.storage.local.set(defaults);
  }
  
  // Load settings into analyzer
  analyzer.settings = result.settings || defaults.settings;
}

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background received:", request.action);
  
  switch (request.action) {
    case "analyzeMessages":
      handleAnalyzeMessages(request, sendResponse);
      break;
      
    case "getSettings":
      chrome.storage.local.get(['settings']).then(result => {
        sendResponse({ success: true, settings: result.settings });
      });
      break;
      
    case "saveSettings":
      handleSaveSettings(request, sendResponse);
      break;
      
    case "getTrends":
      handleGetTrends(request, sendResponse);
      break;
      
    case "newMessage":
      handleNewMessage(request, sendResponse);
      break;
      
    case "getAlerts":
      handleGetAlerts(request, sendResponse);
      break;
      
    case "clearAlerts":
      handleClearAlerts(request, sendResponse);
      break;
  }
  
  return true;
});

async function handleAnalyzeMessages(request, sendResponse) {
  try {
    const analysis = await analyzer.analyzeCognitiveLoad(request.messages);
    
    // Store the analysis
    const result = await chrome.storage.local.get(['scanHistory']);
    const history = result.scanHistory || [];
    history.unshift({
      timestamp: new Date().toISOString(),
      data: analysis,
      messageCount: request.messages.length
    });
    
    // Keep only last 50 scans
    const limitedHistory = history.slice(0, 50);
    await chrome.storage.local.set({ scanHistory: limitedHistory });
    
    sendResponse({ success: true, data: analysis });
  } catch (error) {
    console.error("Analysis error:", error);
    sendResponse({ 
      success: false, 
      error: error.message,
      fallback: analyzer.getFallbackAnalysis(request.messages)
    });
  }
}

async function handleSaveSettings(request, sendResponse) {
  try {
    analyzer.settings = request.settings;
    await chrome.storage.local.set({ settings: request.settings });
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

async function handleGetTrends(request, sendResponse) {
  const result = await chrome.storage.local.get(['scanHistory']);
  const history = result.scanHistory || [];
  
  // Process trends from history
  const trends = {
    stress: history.map(scan => ({
      timestamp: scan.timestamp,
      value: scan.data.stressLevel
    })),
    productivity: history.map(scan => ({
      timestamp: scan.timestamp,
      value: scan.data.productivityScore
    })),
    engagement: history.map(scan => ({
      timestamp: scan.timestamp,
      value: scan.data.engagementLevel || 50
    }))
  };
  
  sendResponse({ success: true, trends });
}

async function handleNewMessage(request, sendResponse) {
  if (analyzer.settings.realTimeMonitoring) {
    // Add to real-time data buffer
    analyzer.realTimeData.messages.push(request.message);
    
    // Keep only last 100 messages
    if (analyzer.realTimeData.messages.length > 100) {
      analyzer.realTimeData.messages.shift();
    }
    
    // Analyze if we have enough recent messages
    const recentMessages = analyzer.realTimeData.messages.filter(msg => {
      const messageTime = new Date(msg.timestamp);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return messageTime > fiveMinutesAgo;
    });
    
    if (recentMessages.length >= 5) {
      const quickAnalysis = await analyzer.analyzeCognitiveLoad(recentMessages);
      
      // Send real-time update to popup if open
      chrome.runtime.sendMessage({
        action: "realTimeUpdate",
        data: quickAnalysis
      }).catch(() => {
        // Popup might not be open, which is fine
      });
    }
  }
  
  sendResponse({ success: true });
}

async function handleGetAlerts(request, sendResponse) {
  const result = await chrome.storage.local.get(['alerts']);
  sendResponse({ success: true, alerts: result.alerts || [] });
}

async function handleClearAlerts(request, sendResponse) {
  await chrome.storage.local.set({ alerts: [] });
  sendResponse({ success: true });
}

// Setup periodic tasks
function setupPeriodicTasks() {
  // Clean up old data every 6 hours
  setInterval(cleanupOldData, 6 * 60 * 60 * 1000);
  
  // Periodic health check (if real-time monitoring is enabled)
  setInterval(async () => {
    if (analyzer.settings.realTimeMonitoring) {
      await performPeriodicHealthCheck();
    }
  }, 30 * 60 * 1000); // Every 30 minutes
}

async function performPeriodicHealthCheck() {
  // This could be extended to check system health, storage, etc.
  console.log("Performing periodic health check...");
}

// Clean up old data periodically
async function cleanupOldData() {
  const result = await chrome.storage.local.get(['scanHistory', 'settings', 'alerts']);
  const retentionDays = result.settings?.dataRetentionDays || 30;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  let cleanedCount = 0;
  
  // Clean scan history
  if (result.scanHistory) {
    const filteredHistory = result.scanHistory.filter(scan => 
      new Date(scan.timestamp) > cutoffDate
    );
    cleanedCount += result.scanHistory.length - filteredHistory.length;
    await chrome.storage.local.set({ scanHistory: filteredHistory });
  }
  
  // Clean old alerts (keep only from last 7 days)
  if (result.alerts) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const filteredAlerts = result.alerts.filter(alert =>
      new Date(alert.timestamp) > weekAgo
    );
    await chrome.storage.local.set({ alerts: filteredAlerts });
  }
  
  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} old records`);
  }
}

// Handle extension lifecycle
chrome.runtime.onStartup.addListener(() => {
  console.log("Cognitive Load Monitor Pro starting up...");
  initializeStorage();
});

chrome.runtime.onSuspend.addListener(() => {
  console.log("Cognitive Load Monitor Pro suspending...");
});