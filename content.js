// Content script for Zoho Cliq
console.log("Cognitive Load Monitor content script loaded");

// Function to extract messages from Zoho Cliq
function extractCliqMessages() {
  const messages = [];
  
  // Zoho Cliq specific selectors (may need adjustment)
  const messageSelectors = [
    '.message-text',
    '.chat-message',
    '[data-testid="message-text"]'
  ];
  
  let messageElements = [];
  
  // Try different selectors for Zoho Cliq
  messageSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      messageElements = Array.from(elements);
    }
  });
  
  // Extract message data
  messageElements.forEach((element, index) => {
    const text = element.textContent?.trim();
    if (text && text.length > 0) {
      messages.push({
        id: index,
        text: text,
        timestamp: new Date().toISOString(),
        length: text.length
      });
    }
  });
  
  console.log(`Extracted ${messages.length} messages from Cliq`);
  return messages.slice(-50); // Return last 50 messages
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received:", request);
  
  if (request.action === "getMessages") {
    try {
      const messages = extractCliqMessages();
      sendResponse({success: true, messages: messages});
    } catch (error) {
      console.error("Error extracting messages:", error);
      sendResponse({success: false, error: error.message});
    }
  }
  
  return true; // Keep message channel open
});

// Optional: Auto-scan periodically
setInterval(() => {
  const messages = extractCliqMessages();
  if (messages.length > 0) {
    chrome.runtime.sendMessage({
      action: "autoScan",
      messages: messages
    });
  }
}, 60000); // Scan every minute