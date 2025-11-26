document.addEventListener('DOMContentLoaded', function() {
    const scanButton = document.getElementById('scan');
    const resultElement = document.getElementById('result');
    const loadingElement = document.getElementById('loading');
    const clearDataLink = document.getElementById('clearData');
    
    // Initialize the popup
    initializePopup();

    scanButton.addEventListener('click', async function() {
        if (!hasConsent()) {
            showConsentDialog();
            return;
        }
        
        await performScan();
    });

    clearDataLink.addEventListener('click', function(e) {
        e.preventDefault();
        clearAllData();
    });

    function initializePopup() {
        if (!hasConsent()) {
            showConsentDialog();
        } else {
            // Show last scan if available
            loadLastScan();
        }
    }

    function hasConsent() {
        return localStorage.getItem('cognitiveLoadConsent') === 'true';
    }

    function showConsentDialog() {
        scanButton.disabled = true;
        resultElement.innerHTML = `
            <div class="consent-dialog">
                <h3>🔒 Privacy First</h3>
                <p>Before we start, please review how we handle your data:</p>
                <ul>
                    <li>✅ All analysis happens in your browser</li>
                    <li>✅ No messages are sent to external servers</li>
                    <li>✅ Only anonymous metrics are stored</li>
                    <li>✅ You can delete all data anytime</li>
                </ul>
                <p>By continuing, you agree to our <a href="privacy.html" target="_blank">Privacy Policy</a> and <a href="terms.html" target="_blank">Terms of Service</a>.</p>
                <div style="margin-top: 15px; text-align: center;">
                    <button id="acceptConsent" style="background: #27ae60; color: white; padding: 10px 20px; border: none; border-radius: 5px; margin-right: 10px; cursor: pointer;">I Understand & Agree</button>
                    <button id="declineConsent" style="background: #95a5a6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
                </div>
            </div>
        `;

        document.getElementById('acceptConsent').addEventListener('click', function() {
            localStorage.setItem('cognitiveLoadConsent', 'true');
            localStorage.setItem('consentDate', new Date().toISOString());
            resultElement.innerHTML = '<div class="metric"><p>✅ Consent recorded. You can now scan team chats.</p></div>';
            scanButton.disabled = false;
        });

        document.getElementById('declineConsent').addEventListener('click', function() {
            resultElement.innerHTML = '<div class="error">❌ Consent required to use this extension.</div>';
        });
    }

    async function performScan() {
        // Show loading state
        scanButton.disabled = true;
        scanButton.textContent = "Scanning...";
        loadingElement.style.display = 'block';
        resultElement.innerHTML = '';
        
        try {
            // Get current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url.includes('cliq.zoho.com')) {
                throw new Error('Please navigate to Zoho Cliq first (https://cliq.zoho.com)');
            }
            
            // Send message to content script
            const response = await chrome.tabs.sendMessage(tab.id, { action: "getMessages" });
            
            if (!response.success) {
                throw new Error(response.error || 'Failed to extract messages from Cliq');
            }

            if (response.messages.length === 0) {
                throw new Error('No messages found. Please ensure you\'re in a team chat with messages.');
            }
            
            // Send for analysis
            const analysis = await chrome.runtime.sendMessage({
                action: "analyzeMessages",
                messages: response.messages
            });
            
            if (!analysis.success) {
                throw new Error(analysis.error || 'Analysis failed');
            }
            
            // Display results
            displayResults(analysis.data, response.messages.length);
            
        } catch (error) {
            console.error('Scan error:', error);
            resultElement.innerHTML = `<div class="error">❌ ${error.message}</div>`;
        } finally {
            scanButton.disabled = false;
            scanButton.textContent = "🔍 Scan Team Chat";
            loadingElement.style.display = 'none';
        }
    }

    function displayResults(data, messageCount) {
        const stressColor = data.stressLevel > 70 ? '#e74c3c' : data.stressLevel > 40 ? '#f39c12' : '#27ae60';
        const productivityColor = data.productivityScore > 70 ? '#27ae60' : data.productivityScore > 40 ? '#f39c12' : '#e74c3c';
        const stressClass = data.stressLevel > 70 ? 'stress-high' : data.stressLevel > 40 ? 'stress-medium' : 'stress-low';
        
        resultElement.innerHTML = `
            <div class="result">
                <h3 style="margin-top: 0; color: #2c3e50;">📊 Analysis Results</h3>
                <p style="color: #7f8c8d; margin-bottom: 20px;">Based on ${messageCount} messages</p>
                
                <div class="metric ${stressClass}">
                    <strong>😰 Stress Level:</strong> 
                    <span style="color: ${stressColor}; font-weight: bold; float: right;">${data.stressLevel.toFixed(1)}%</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${data.stressLevel}%; background: ${stressColor};"></div>
                    </div>
                </div>
                
                <div class="metric">
                    <strong>📈 Productivity Score:</strong> 
                    <span style="color: ${productivityColor}; font-weight: bold; float: right;">${data.productivityScore.toFixed(1)}%</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${data.productivityScore}%; background: ${productivityColor};"></div>
                    </div>
                </div>
                
                <div class="metric">
                    <strong>😊 Overall Sentiment:</strong> 
                    <span style="float: right; font-weight: bold;">${getSentimentEmoji(data.sentiment)} ${data.sentiment}</span>
                </div>
                
                ${data.keywords && data.keywords.length > 0 ? `
                    <div class="metric">
                        <strong>🔑 Key Topics:</strong> 
                        <div style="margin-top: 5px;">${data.keywords.join(', ')}</div>
                    </div>
                ` : ''}
                
                <div class="metric" style="background: #e8f4fd; border-left-color: #3498db;">
                    <strong>💡 Recommendation:</strong>
                    <div style="margin-top: 8px; font-size: 14px;">${data.recommendation}</div>
                </div>
                
                <div style="margin-top: 15px; font-size: 11px; color: #95a5a6; text-align: center;">
                    Analysis completed at ${new Date().toLocaleTimeString()}
                </div>
            </div>
        `;

        // Save this scan
        saveScanToHistory(data, messageCount);
    }

    function getSentimentEmoji(sentiment) {
        switch(sentiment) {
            case 'positive': return '😊';
            case 'negative': return '😔';
            default: return '😐';
        }
    }

    function loadLastScan() {
        chrome.storage.local.get(['lastScan'], (result) => {
            if (result.lastScan) {
                resultElement.innerHTML = `
                    <div class="metric">
                        <p>Ready to scan. Last analysis: ${new Date(result.lastScan.timestamp).toLocaleDateString()}</p>
                    </div>
                `;
            }
        });
    }

    function saveScanToHistory(data, messageCount) {
        const scanData = {
            timestamp: new Date().toISOString(),
            data: data,
            messageCount: messageCount
        };
        
        chrome.storage.local.set({ lastScan: scanData });
        
        // Also add to history
        chrome.storage.local.get(['scanHistory'], (result) => {
            const history = result.scanHistory || [];
            history.unshift(scanData);
            // Keep only last 20 scans
            const limitedHistory = history.slice(0, 20);
            chrome.storage.local.set({ scanHistory: limitedHistory });
        });
    }

    function clearAllData() {
        if (confirm('Are you sure you want to clear all stored data? This includes scan history and settings.')) {
            localStorage.clear();
            chrome.storage.local.clear(() => {
                resultElement.innerHTML = '<div class="metric"><p>✅ All data cleared successfully.</p></div>';
                // Reset consent to show dialog again
                localStorage.removeItem('cognitiveLoadConsent');
                setTimeout(() => {
                    initializePopup();
                }, 2000);
            });
        }
    }
});