document.addEventListener('DOMContentLoaded', function() {
    const scanButton = document.getElementById('scan');
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const metricsDiv = document.getElementById('metrics');
    const recommendationDiv = document.getElementById('recommendation');

    scanButton.addEventListener('click', async function() {
        // Reset UI
        scanButton.disabled = true;
        loadingDiv.style.display = 'block';
        resultDiv.style.display = 'none';
        errorDiv.style.display = 'none';
        
        try {
            // Get current active tab
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            
            if (!tab.url.includes('cliq.zoho.com')) {
                throw new Error('Please navigate to Zoho Cliq first');
            }

            // Inject content script and get messages
            const response = await chrome.tabs.sendMessage(tab.id, {action: "getMessages"});
            
            if (!response.success) {
                throw new Error(response.error || 'Failed to extract messages');
            }

            if (response.messages.length === 0) {
                throw new Error('No messages found. Please make sure you are on Zoho Cliq.');
            }

            // Send messages for analysis
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
            showError(error.message);
        } finally {
            scanButton.disabled = false;
            loadingDiv.style.display = 'none';
        }
    });

    function displayResults(data, messageCount) {
        metricsDiv.innerHTML = '';
        
        // Stress Level
        const stressClass = data.stressLevel > 70 ? 'stress-high' : 
                           data.stressLevel > 40 ? 'stress-medium' : 'stress-low';
        
        metricsDiv.innerHTML += `
            <div class="metric ${stressClass}">
                <strong>😰 Stress Level:</strong> ${data.stressLevel.toFixed(1)}%
                <div style="background: #e0e0e0; height: 10px; border-radius: 5px; margin-top: 5px;">
                    <div style="background: ${getStressColor(data.stressLevel)}; width: ${data.stressLevel}%; height: 100%; border-radius: 5px;"></div>
                </div>
            </div>
        `;

        // Productivity Score
        metricsDiv.innerHTML += `
            <div class="metric">
                <strong>📈 Productivity Score:</strong> ${data.productivityScore.toFixed(1)}%
                <div style="background: #e0e0e0; height: 10px; border-radius: 5px; margin-top: 5px;">
                    <div style="background: #4CAF50; width: ${data.productivityScore}%; height: 100%; border-radius: 5px;"></div>
                </div>
            </div>
        `;

        // Sentiment
        const sentimentEmoji = data.sentiment === 'positive' ? '😊' : 
                              data.sentiment === 'negative' ? '😔' : '😐';
        metricsDiv.innerHTML += `
            <div class="metric">
                <strong>${sentimentEmoji} Overall Sentiment:</strong> ${data.sentiment}
            </div>
        `;

        // Message Stats
        metricsDiv.innerHTML += `
            <div class="metric">
                <strong>💬 Messages Analyzed:</strong> ${messageCount}
            </div>
        `;

        // Keywords
        if (data.keywords && data.keywords.length > 0) {
            metricsDiv.innerHTML += `
                <div class="metric">
                    <strong>🔑 Key Topics:</strong> ${data.keywords.slice(0, 5).join(', ')}
                </div>
            `;
        }

        // Recommendation
        recommendationDiv.innerHTML = `
            <strong>💡 Recommendation:</strong> ${data.recommendation}
        `;

        resultDiv.style.display = 'block';
        
        // Save to history
        saveToHistory(data, messageCount);
    }

    function getStressColor(level) {
        if (level > 70) return '#ff4444';
        if (level > 40) return '#ffbb33';
        return '#00C851';
    }

    function showError(message) {
        errorDiv.textContent = `Error: ${message}`;
        errorDiv.style.display = 'block';
    }

    function saveToHistory(analysis, messageCount) {
        chrome.storage.local.get(['scanHistory'], (result) => {
            const history = result.scanHistory || [];
            history.unshift({
                timestamp: new Date().toISOString(),
                analysis: analysis,
                messageCount: messageCount
            });
            
            // Keep only last 50 scans
            const limitedHistory = history.slice(0, 50);
            
            chrome.storage.local.set({scanHistory: limitedHistory});
        });
    }

    // Load previous results if available
    chrome.storage.local.get(['lastScan'], (result) => {
        if (result.lastScan) {
            // Could implement to show last scan results
        }
    });
});