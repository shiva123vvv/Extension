// Content Script for Zoho Cliq - Enhanced Version
console.log("Cognitive Load Monitor Pro: Content script loaded");

class AdvancedCliqMessageExtractor {
  constructor() {
    this.messageSelectors = [
      // Zoho Cliq specific selectors
      '[data-testid="message-text"]',
      '.zc-message-text',
      '.message-body',
      '.msg-body',
      '.chat-bubble',
      '.conversation-message',
      '.message__content',
      '.msg-content',
      // Generic selectors
      '.message-text',
      '.msg-text',
      '[data-testid*="message"]',
      '.chat-message',
      '.message-content',
      '[class*="message"]',
      '[class*="msg"]'
    ];
    
    this.observedElements = new Set();
    this.messageCallbacks = [];
    this.isMonitoring = false;
  }

  initialize() {
    this.injectStyles();
    this.startObservation();
    this.addRealTimeListeners();
  }

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .cognitive-load-indicator {
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(52, 152, 219, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        z-index: 10000;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .stress-high { background: rgba(231, 76, 60, 0.9); }
      .stress-medium { background: rgba(243, 156, 18, 0.9); }
      .stress-low { background: rgba(39, 174, 96, 0.9); }
    `;
    document.head.appendChild(style);
  }

  startObservation() {
    // Initial scan
    this.scanForMessages();
    
    // Observe DOM changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              this.scanNodeForMessages(node);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.observer = observer;
  }

  scanNodeForMessages(node) {
    if (node.querySelector && !this.observedElements.has(node)) {
      this.observedElements.add(node);
      
      for (const selector of this.messageSelectors) {
        const elements = node.querySelectorAll(selector);
        elements.forEach(element => {
          if (this.isNewMessage(element)) {
            this.processNewMessage(element);
          }
        });
      }
    }
  }

  isNewMessage(element) {
    const text = element.textContent?.trim();
    return text && text.length > 2 && !element.dataset.cognitiveLoadProcessed;
  }

  processNewMessage(element) {
    element.dataset.cognitiveLoadProcessed = 'true';
    
    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: this.cleanText(element.textContent),
      timestamp: new Date().toISOString(),
      length: element.textContent?.length || 0,
      element: this.getElementInfo(element),
      urgency: this.detectUrgency(element.textContent),
      type: this.detectMessageType(element.textContent)
    };

    // Notify callbacks
    this.messageCallbacks.forEach(callback => callback(message));
    
    // Send to background for real-time analysis
    chrome.runtime.sendMessage({
      action: "newMessage",
      message: message
    });
  }

  detectUrgency(text) {
    const urgentPatterns = [
      /asap/gi, /urgent/gi, /emergency/gi, /important/gi,
      /deadline/gi, /critical/gi, /now/gi, /immediately/gi
    ];
    
    const exclamationCount = (text.match(/!/g) || []).length;
    const questionCount = (text.match(/\?/g) || []).length;
    const capsWords = text.split(/\s+/).filter(word => 
      word.length > 3 && word === word.toUpperCase()
    ).length;

    let urgencyScore = 0;
    urgentPatterns.forEach(pattern => {
      urgencyScore += (text.match(pattern) || []).length * 3;
    });
    
    urgencyScore += exclamationCount * 2;
    urgencyScore += questionCount;
    urgencyScore += capsWords * 2;

    if (urgencyScore >= 8) return 'high';
    if (urgencyScore >= 4) return 'medium';
    return 'low';
  }

  detectMessageType(text) {
    const lowerText = text.toLowerCase();
    
    if (/(http|www|\.com|\.org)/.test(lowerText)) return 'link';
    if (/(meeting|call|schedule|calendar)/.test(lowerText)) return 'meeting';
    if (/(task|todo|assign|complete)/.test(lowerText)) return 'task';
    if (/(question|\?)/.test(lowerText)) return 'question';
    if (/(thanks|thank you|appreciate)/.test(lowerText)) return 'appreciation';
    if (/(problem|issue|error|bug|broken)/.test(lowerText)) return 'problem';
    
    return 'general';
  }

  extractMessages() {
    console.log("Extracting messages from Zoho Cliq...");
    
    let messages = [];
    let messageElements = [];

    // Try different selectors to find messages
    for (const selector of this.messageSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`Found ${elements.length} elements with selector: ${selector}`);
        messageElements = Array.from(elements);
        break;
      }
    }

    // If no specific selectors found, try general approach
    if (messageElements.length === 0) {
      messageElements = this.findMessagesByHeuristics();
    }

    // Extract message data with enhanced information
    messageElements.forEach((element, index) => {
      const text = this.cleanText(element.textContent);
      if (text && text.length > 2) {
        messages.push({
          id: `msg-${index}-${Date.now()}`,
          text: text,
          timestamp: new Date().toISOString(),
          length: text.length,
          element: this.getElementInfo(element),
          urgency: this.detectUrgency(text),
          type: this.detectMessageType(text),
          hasEmoji: this.containsEmoji(text),
          wordCount: text.split(/\s+/).length
        });
      }
    });

    console.log(`Extracted ${messages.length} valid messages`);
    return messages.slice(-50); // Return last 50 messages
  }

  containsEmoji(text) {
    const emojiRegex = /[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/gu;
    return emojiRegex.test(text);
  }

  findMessagesByHeuristics() {
    const potentialElements = document.querySelectorAll('div, span, p');
    const messageElements = [];
    
    potentialElements.forEach(element => {
      const text = element.textContent?.trim();
      if (text && text.length > 10 && text.length < 500) {
        if (this.looksLikeMessage(text) && this.isVisible(element)) {
          messageElements.push(element);
        }
      }
    });
    
    return messageElements;
  }

  isVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.offsetParent !== null;
  }

  looksLikeMessage(text) {
    const messageIndicators = [
      /^[A-Za-z]/,
      /^[\p{Emoji}]/u
    ];
    
    const nonMessageIndicators = [
      /^(http|www)/,
      /^\d+$/,
      /^[^a-zA-Z0-9\p{Emoji}]*$/u,
    ];
    
    return messageIndicators.some(indicator => indicator.test(text)) &&
           !nonMessageIndicators.some(indicator => indicator.test(text));
  }

  cleanText(text) {
    if (!text) return '';
    return text.trim()
              .replace(/\s+/g, ' ')
              .replace(/[\r\n]+/g, ' ')
              .substring(0, 500);
  }

  getElementInfo(element) {
    const classes = element.className ? Array.from(element.classList).slice(0, 3) : [];
    const id = element.id || 'no-id';
    const tagName = element.tagName.toLowerCase();
    return { classes, id, tagName };
  }

  addRealTimeListeners() {
    // Listen for keyboard events to detect user activity
    document.addEventListener('keydown', (event) => {
      if (event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) {
        chrome.runtime.sendMessage({
          action: "userTyping",
          timestamp: new Date().toISOString()
        });
      }
    });

    // Listen for message send events
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (type === 'click') {
        const wrappedListener = function(event) {
          if (this.textContent?.includes('Send') || 
              this.getAttribute('aria-label')?.includes('send')) {
            chrome.runtime.sendMessage({
              action: "messageSent",
              timestamp: new Date().toISOString()
            });
          }
          listener.call(this, event);
        };
        return originalAddEventListener.call(this, type, wrappedListener, options);
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  onNewMessage(callback) {
    this.messageCallbacks.push(callback);
  }

  showRealTimeIndicator(stressLevel) {
    let indicator = document.getElementById('cognitive-load-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'cognitive-load-indicator';
      indicator.className = 'cognitive-load-indicator';
      document.body.appendChild(indicator);
    }

    let stressClass = 'stress-low';
    if (stressLevel > 70) stressClass = 'stress-high';
    else if (stressLevel > 40) stressClass = 'stress-medium';

    indicator.className = `cognitive-load-indicator ${stressClass}`;
    indicator.textContent = `Team Stress: ${stressLevel}%`;
    indicator.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
      indicator.style.display = 'none';
    }, 5000);
  }
}

// Initialize enhanced message extractor
const extractor = new AdvancedCliqMessageExtractor();
extractor.initialize();

// Enhanced message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received request:", request);
  
  switch (request.action) {
    case "getMessages":
      handleGetMessages(request, sendResponse);
      break;
      
    case "startRealTimeMonitoring":
      extractor.isMonitoring = true;
      sendResponse({ success: true });
      break;
      
    case "stopRealTimeMonitoring":
      extractor.isMonitoring = false;
      sendResponse({ success: true });
      break;
      
    case "showStressIndicator":
      extractor.showRealTimeIndicator(request.stressLevel);
      sendResponse({ success: true });
      break;
      
    case "getConversationStats":
      const stats = getConversationStats();
      sendResponse({ success: true, stats });
      break;
  }
  
  return true;
});

function handleGetMessages(request, sendResponse) {
  try {
    const messages = extractor.extractMessages();
    
    if (messages.length === 0) {
      sendResponse({
        success: false,
        error: "No messages found. Please ensure you're on Zoho Cliq chat page.",
        suggestions: [
          "Refresh the page",
          "Navigate to a team chat",
          "Wait for messages to load",
          "Check if you're in an active conversation"
        ]
      });
    } else {
      sendResponse({
        success: true,
        messages: messages,
        source: "Zoho Cliq",
        timestamp: new Date().toISOString(),
        conversationStats: getConversationStats()
      });
    }
  } catch (error) {
    console.error("Error extracting messages:", error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

function getConversationStats() {
  const messages = extractor.extractMessages();
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  const recentMessages = messages.filter(msg => 
    new Date(msg.timestamp) > oneHourAgo
  );
  
  const messageTypes = {};
  const urgencies = {};
  
  messages.forEach(msg => {
    messageTypes[msg.type] = (messageTypes[msg.type] || 0) + 1;
    urgencies[msg.urgency] = (urgencies[msg.urgency] || 0) + 1;
  });
  
  return {
    totalMessages: messages.length,
    recentMessages: recentMessages.length,
    messageTypes,
    urgencies,
    activeParticipants: estimateActiveParticipants(messages),
    averageResponseTime: estimateAverageResponseTime(messages)
  };
}

function estimateActiveParticipants(messages) {
  // Simple estimation based on unique message patterns
  const uniquePatterns = new Set();
  messages.forEach(msg => {
    const pattern = msg.text.substring(0, 20).toLowerCase();
    uniquePatterns.add(pattern);
  });
  return Math.min(uniquePatterns.size, 10); // Cap at 10 for estimation
}

function estimateAverageResponseTime(messages) {
  if (messages.length < 2) return 0;
  
  let totalGap = 0;
  let gapCount = 0;
  
  for (let i = 1; i < messages.length; i++) {
    const prevTime = new Date(messages[i-1].timestamp);
    const currTime = new Date(messages[i].timestamp);
    const gap = currTime - prevTime;
    
    if (gap < 300000) { // Only count gaps less than 5 minutes as responses
      totalGap += gap;
      gapCount++;
    }
  }
  
  return gapCount > 0 ? Math.round(totalGap / gapCount / 1000) : 0; // Return in seconds
}

console.log("Cognitive Load Monitor Pro content script ready");