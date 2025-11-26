// Cognitive Load Monitor - Content Script for Zoho Cliq
console.log('Cognitive Load Monitor: Content script loaded');

// Message storage for analysis
let messageCache = [];
const MAX_MESSAGES = 100;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Content script received:", request.action);
    
    if (request.action === "analyzeMessages") {
        try {
            const analysis = analyzeCliqMessages();
            sendResponse({ success: true, data: analysis });
        } catch (error) {
            console.error('Analysis error:', error);
            sendResponse({ success: false, error: error.message });
        }
        return true;
    }
    
    if (request.action === "getMessageCount") {
        const messages = extractCliqMessages();
        sendResponse({ success: true, count: messages.length });
        return true;
    }
});

// Main analysis function
function analyzeCliqMessages() {
    const messages = extractCliqMessages();
    
    if (messages.length === 0) {
        // Return demo data if no messages found
        return generateDemoAnalysis();
    }
    
    const analysis = {
        messageCount: messages.length,
        stressLevel: calculateStressLevel(messages),
        productivityScore: calculateProductivityScore(messages),
        sentiment: analyzeSentiment(messages),
        keywords: extractKeywords(messages),
        recommendation: generateRecommendation(messages),
        timestamp: new Date().toISOString(),
        rawMessages: messages.slice(0, 10) // Store first 10 for context
    };
    
    // Cache the analysis
    messageCache = messages.slice(-MAX_MESSAGES);
    
    console.log("Analysis completed:", analysis);
    return analysis;
}

// Extract messages from Zoho Cliq
function extractCliqMessages() {
    const messages = [];
    
    // Comprehensive Zoho Cliq selectors
    const selectors = [
        // Main message containers
        '[data-testid="message-text"]',
        '.message',
        '.msg',
        '.chat-message',
        '.message-container',
        // Text content
        '.text-content',
        '.message-text',
        '[class*="message-text"]',
        '[class*="text-content"]',
        // Specific Cliq elements
        '[data-type="message"]',
        '.cliqtxt',
        // Fallback selectors
        'div[dir="auto"]', // Messages often have this
        '.whitespace-pre-wrap'
    ];

    // Try each selector
    for (const selector of selectors) {
        try {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                console.log(`Found ${elements.length} elements with selector: ${selector}`);
                
                elements.forEach((el, index) => {
                    const text = el.textContent?.trim();
                    if (text && text.length > 10) { // Minimum message length
                        messages.push({
                            text: text,
                            element: el,
                            index: index,
                            timestamp: new Date().toISOString(),
                            selector: selector
                        });
                    }
                });
                
                if (messages.length >= 10) break; // Got enough messages
            }
        } catch (error) {
            console.warn(`Error with selector ${selector}:`, error);
        }
    }

    // If no messages found with specific selectors, try broader approach
    if (messages.length === 0) {
        console.log("Trying broader message detection...");
        
        // Look for divs that likely contain messages
        const allDivs = document.querySelectorAll('div');
        allDivs.forEach(div => {
            const text = div.textContent?.trim();
            if (text && text.length > 20 && text.length < 500) {
                // Heuristic: messages are usually between 20-500 chars
                const lineCount = text.split('\n').length;
                if (lineCount <= 5) { // Messages usually have few lines
                    messages.push({
                        text: text,
                        element: div,
                        timestamp: new Date().toISOString(),
                        heuristic: true
                    });
                }
            }
        });
    }

    // Remove duplicates based on text content
    const uniqueMessages = [];
    const seenTexts = new Set();
    
    messages.forEach(msg => {
        const normalizedText = msg.text.toLowerCase().trim();
        if (!seenTexts.has(normalizedText) && normalizedText.length > 0) {
            seenTexts.add(normalizedText);
            uniqueMessages.push(msg);
        }
    });

    console.log(`Extracted ${uniqueMessages.length} unique messages`);
    return uniqueMessages.slice(-50); // Return last 50 messages
}

// Enhanced stress level calculation
function calculateStressLevel(messages) {
    if (messages.length === 0) return "0.0";
    
    const stressWords = [
        'stress', 'stressed', 'overwhelmed', 'overwhelming', 'busy', 'deadline', 
        'urgent', 'emergency', 'help', 'tired', 'exhausted', 'burnout', 'burned out',
        'pressure', 'pressured', 'anxious', 'anxiety', 'worried', 'nervous', 'frustrated'
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
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = text.match(regex);
            if (matches) {
                messageStress += matches.length * 2;
                if (word === 'urgent' || word === 'emergency') messageStress += 3;
            }
        });
        
        // Check for urgency indicators
        urgencyWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = text.match(regex);
            if (matches) messageStress += matches.length * 3;
        });
        
        // Check for excessive punctuation
        const exclamationCount = (text.match(/!/g) || []).length;
        const questionCount = (text.match(/\?/g) || []).length;
        if (exclamationCount > 2) messageStress += exclamationCount;
        if (questionCount > 3) messageStress += questionCount;
        
        // Check for ALL CAPS (shouting)
        const capsWords = text.split(/\s+/).filter(word => 
            word.length > 3 && word === word.toUpperCase() && !word.match(/^[A-Z]+$/)
        );
        if (capsWords.length > 0) messageStress += capsWords.length * 2;
        
        if (messageStress > 5) urgentMessageCount++;
        stressScore += Math.min(messageStress, 20); // Cap per message
    });
    
    // Calculate base score from words
    const wordScore = (stressScore / Math.max(totalMessages, 1)) * 10;
    
    // Calculate urgency ratio score
    const urgencyRatio = (urgentMessageCount / Math.max(totalMessages, 1)) * 50;
    
    // Combine scores
    const rawScore = Math.min(100, wordScore + urgencyRatio);
    
    return Math.round(rawScore * 10) / 10 + '%';
}

// Enhanced productivity score calculation
function calculateProductivityScore(messages) {
    if (messages.length === 0) return "50.0";
    
    const productiveWords = [
        'done', 'completed', 'finished', 'achieved', 'accomplished', 'success',
        'progress', 'moving', 'forward', 'solved', 'resolved', 'fixed',
        'complete', 'ready', 'delivered', 'shipped', 'deployed', 'working'
    ];
    
    const positiveWords = [
        'great', 'good', 'excellent', 'awesome', 'perfect', 'nice', 'well',
        'smooth', 'easy', 'working', 'functioning', 'stable', 'thanks', 'thank you'
    ];
    
    const blockingWords = [
        'blocked', 'stuck', 'waiting', 'pending', 'issue', 'problem', 'error',
        'bug', 'broken', 'failed', 'cannot', 'can\'t', 'wont', 'doesn\'t',
        'difficult', 'hard', 'challenge', 'complicated', 'confused', 'help'
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
        if (questionCount > 2) {
            productiveScore -= 3;
        }
        
        // Time-related stress indicators
        if (text.includes('late') || text.includes('delay') || text.includes('behind')) {
            productiveScore -= 4;
        }
    });
    
    // Normalize score based on message count
    const normalizedScore = productiveScore / Math.max(messages.length / 10, 1);
    const finalScore = Math.min(100, Math.max(0, normalizedScore));
    
    return Math.round(finalScore * 10) / 10 + '%';
}

// Sentiment analysis
function analyzeSentiment(messages) {
    if (messages.length === 0) return 'neutral';
    
    const positiveWords = [
        'good', 'great', 'excellent', 'awesome', 'amazing', 'perfect', 'nice',
        'happy', 'pleased', 'satisfied', 'thanks', 'thank you', 'appreciate',
        'love', 'fantastic', 'wonderful', 'smooth', 'easy', 'working', 'yay', 'woohoo'
    ];
    
    const negativeWords = [
        'bad', 'terrible', 'awful', 'horrible', 'sucks', 'hate', 'angry',
        'mad', 'frustrated', 'frustrating', 'annoying', 'disappointed',
        'sad', 'unhappy', 'broken', 'failed', 'issue', 'problem', 'ugh', 'damn'
    ];
    
    let positiveCount = 0;
    let negativeCount = 0;
    let totalSentimentWords = 0;
    
    messages.forEach(message => {
        const text = message.text.toLowerCase();
        const words = text.split(/\s+/);
        
        words.forEach(word => {
            const cleanWord = word.replace(/[^\w]/g, '');
            if (positiveWords.includes(cleanWord)) {
                positiveCount++;
                totalSentimentWords++;
            } else if (negativeWords.includes(cleanWord)) {
                negativeCount++;
                totalSentimentWords++;
            }
        });
    });
    
    if (totalSentimentWords === 0) return 'neutral';
    
    const positiveRatio = positiveCount / totalSentimentWords;
    const negativeRatio = negativeCount / totalSentimentWords;
    
    if (positiveRatio > negativeRatio + 0.2) return 'positive';
    if (negativeRatio > positiveRatio + 0.2) return 'negative';
    return 'neutral';
}

// Keyword extraction
function extractKeywords(messages) {
    if (messages.length === 0) return ['team', 'work', 'project'];
    
    const commonWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
        'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
        'what', 'when', 'where', 'why', 'how', 'if', 'then', 'else', 'so', 'because'
    ]);
    
    const wordFrequency = {};
    let totalWords = 0;
    
    // Count word frequencies
    messages.forEach(message => {
        const words = message.text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
        
        words.forEach(word => {
            if (!commonWords.has(word)) {
                wordFrequency[word] = (wordFrequency[word] || 0) + 1;
                totalWords++;
            }
        });
    });
    
    // Convert to weighted scores (frequency relative to total words)
    const weightedWords = Object.entries(wordFrequency)
        .filter(([word, count]) => count > 1) // Only words that appear more than once
        .map(([word, count]) => ({
            word,
            score: (count / totalWords) * 1000
        }));
    
    // Sort by score and return top keywords
    const topKeywords = weightedWords
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map(item => item.word);
    
    return topKeywords.length > 0 ? topKeywords : ['discussion', 'team', 'work'];
}

// Recommendation engine
function generateRecommendation(messages) {
    const stressLevel = parseFloat(calculateStressLevel(messages)) || 0;
    const productivityScore = parseFloat(calculateProductivityScore(messages)) || 0;
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

// Generate demo data when no messages are found
function generateDemoAnalysis() {
    console.log("No messages found, generating demo analysis");
    
    const demoMessages = [
        "Can we move the deadline to next week? I'm feeling overwhelmed with current tasks",
        "Just finished the authentication module, everything is working perfectly!",
        "Having issues with the database connection, need help troubleshooting",
        "Great work on the latest deployment team! Everything went smoothly",
        "When will the design assets be ready? We're blocked on the frontend",
        "I'll be out tomorrow for a doctor's appointment",
        "The new feature is complete and ready for testing",
        "Can someone help me with the API integration? I'm stuck",
        "Thanks for the quick response on the bug fix!",
        "Let's schedule a meeting to discuss the project timeline"
    ];
    
    return {
        messageCount: demoMessages.length,
        stressLevel: "35.5%",
        productivityScore: "65.8%",
        sentiment: "neutral",
        keywords: ['deadline', 'help', 'working', 'issues', 'meeting', 'project'],
        recommendation: "⚖️ MODERATE CONCERN: Balance needed between stress and productivity. Consider: 1) Workload assessment 2) Skill development 3) Process optimization 4) Regular feedback",
        timestamp: new Date().toISOString(),
        isDemo: true
    };
}

// Auto-refresh when new messages might be added
function setupAutoRefresh() {
    // Observe DOM changes for new messages
    const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && (
                        node.querySelector?.('.message') || 
                        node.querySelector?.('.msg') ||
                        node.textContent?.length > 20
                    )) {
                        shouldUpdate = true;
                    }
                });
            }
        });
        
        if (shouldUpdate) {
            console.log("New messages detected, updating cache");
            extractCliqMessages(); // Update cache
        }
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAutoRefresh);
} else {
    setupAutoRefresh();
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateStressLevel,
        calculateProductivityScore,
        analyzeSentiment,
        extractKeywords,
        generateRecommendation
    };
}