// Content Script for Zoho Cliq
console.log("Cognitive Load Monitor: Content script loaded");

class CliqMessageExtractor {
  constructor() {
    this.messageSelectors = [
      '.message-text',
      '.msg-text',
      '[data-testid*="message"]',
      '.chat-message',
      '.message-content'
    ];
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

    // Extract message data
    messageElements.forEach((element, index) => {
      const text = this.cleanText(element.textContent);
      if (text && text.length > 2) { // Filter out very short messages
        messages.push({
          id: `msg-${index}-${Date.now()}`,
          text: text,
          timestamp: new Date().toISOString(),
          length: text.length,
          element: this.getElementInfo(element)
        });
      }
    });

    console.log(`Extracted ${messages.length} valid messages`);
    return messages.slice(-30); // Return last 30 messages
  }

  findMessagesByHeuristics() {
    // Heuristic approach to find messages
    const potentialElements = document.querySelectorAll('div, span, p');
    const messageElements = [];
    
    potentialElements.forEach(element => {
      const text = element.textContent?.trim();
      if (text && text.length > 10 && text.length < 500) {
        // Likely a message based on length and content
        if (this.looksLikeMessage(text)) {
          messageElements.push(element);
        }
      }
    });
    
    return messageElements;
  }

  looksLikeMessage(text) {
    // Simple heuristic to identify chat messages
    const messageIndicators = [
      /^[A-Za-z]/ // Starts with letter
    ];
    
    const nonMessageIndicators = [
      /^(http|www)/, // URLs
      /^\d+$/, // Only numbers
      /^[^a-zA-Z0-9]*$/, // Only special characters
    ];
    
    return messageIndicators.some(indicator => indicator.test(text)) &&
           !nonMessageIndicators.some(indicator => indicator.test(text));
  }

  cleanText(text) {
    if (!text) return '';
    return text.trim()
              .replace(/\s+/g, ' ')
              .replace(/[\r\n]+/g, ' ')
              .substring(0, 500); // Limit length
  }

  getElementInfo(element) {
    const classes = element.className ? Array.from(element.classList).slice(0, 3) : [];
    const id = element.id || 'no-id';
    return { classes, id };
  }
}

// Initialize message extractor
const extractor = new CliqMessageExtractor();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received request:", request);
  
  if (request.action === "getMessages") {
    try {
      const messages = extractor.extractMessages();
      
      if (messages.length === 0) {
        sendResponse({
          success: false,
          error: "No messages found. Please ensure you're on Zoho Cliq chat page.",
          suggestions: [
            "Refresh the page",
            "Navigate to a team chat",
            "Wait for messages to load"
          ]
        });
      } else {
        sendResponse({
          success: true,
          messages: messages,
          source: "Zoho Cliq",
          timestamp: new Date().toISOString()
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
  
  return true; // Keep message channel open for async response
});

// Auto-scan functionality (optional)
let autoScanInterval = null;

function startAutoScan() {
  if (autoScanInterval) clearInterval(autoScanInterval);
  
  autoScanInterval = setInterval(() => {
    const messages = extractor.extractMessages();
    if (messages.length > 0) {
      chrome.runtime.sendMessage({
        action: "autoScan",
        messages: messages,
        timestamp: new Date().toISOString()
      });
    }
  }, 30000); // Scan every 30 seconds
}

function stopAutoScan() {
  if (autoScanInterval) {
    clearInterval(autoScanInterval);
    autoScanInterval = null;
  }
}

// Listen for auto-scan control
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startAutoScan") {
    startAutoScan();
    sendResponse({ success: true });
  } else if (request.action === "stopAutoScan") {
    stopAutoScan();
    sendResponse({ success: true });
  }
});

console.log("Cognitive Load Monitor content script ready");