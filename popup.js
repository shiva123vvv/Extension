// Enhanced Popup Script for Cognitive Load Monitor Pro
class EnhancedPopupManager {
    constructor() {
        this.currentAnalysis = null;
        this.settings = {};
        this.alerts = [];
        this.trends = [];
        this.init();
    }

    async init() {
        await this.loadSettings();
        await this.loadAlerts();
        this.setupEventListeners();
        this.initializeTabs();
        this.updateAlertBadge();
        
        if (this.hasConsent()) {
            this.showLastScan();
            this.startRealTimeUpdates();
        } else {
            this.showConsentDialog();
        }
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Main scan button
        document.getElementById('scan').addEventListener('click', () => {
            this.performScan();
        });

        // Settings
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('clearAlerts').addEventListener('click', () => {
            this.clearAlerts();
        });

        document.getElementById('exportData').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('clearAllData').addEventListener('click', () => {
            this.clearAllData();
        });

        document.getElementById('refreshData').addEventListener('click', (e) => {
            e.preventDefault();
            this.refreshData();
        });

        document.getElementById('viewFullReport').addEventListener('click', () => {
            this.viewFullReport();
        });

        // Real-time message listener
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === "realTimeUpdate") {
                this.handleRealTimeUpdate(request.data);
            }
        });
    }

    initializeTabs() {
        this.switchTab('dashboard');
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Show corresponding content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Load tab-specific data
        switch(tabName) {
            case 'analytics':
                this.loadAnalyticsData();
                break;
            case 'alerts':
                this.loadAlertsData();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
        }
    }

    hasConsent() {
        return localStorage.getItem('cognitiveLoadConsent') === 'true';
    }

    showConsentDialog() {
        const resultElement = document.getElementById('result');
        const scanButton = document.getElementById('scan');
        
        scanButton.disabled = true;
        resultElement.innerHTML = `
            <div class="insight-card info">
                <h3>🔒 Privacy First</h3>
                <p>Before we start, please review how we handle your data:</p>
                <ul>
                    <li>✅ All analysis happens in your browser</li>
                    <li>✅ No messages are sent to external servers</li>
                    <li>✅ Only anonymous metrics are stored</li>
                    <li>✅ You can delete all data anytime</li>
                    <li>✅ Real-time monitoring is optional</li>
                </ul>
                <p>By continuing, you agree to our <a href="privacy.html" target="_blank">Privacy Policy</a> and <a href="terms.html" target="_blank">Terms of Service</a>.</p>
                <div style="margin-top: 15px; text-align: center;">
                    <button id="acceptConsent" class="button" style="margin-right: 10px;">I Understand & Agree</button>
                    <button id="declineConsent" class="button button-secondary">Cancel</button>
                </div>
            </div>
        `;

        document.getElementById('acceptConsent').addEventListener('click', () => {
            localStorage.setItem('cognitiveLoadConsent', 'true');
            localStorage.setItem('consentDate', new Date().toISOString());
            resultElement.innerHTML = '<div class="insight-card info"><p>✅ Consent recorded. You can now scan team chats.</p></div>';
            scanButton.disabled = false;
            this.showLastScan();
            this.startRealTimeUpdates();
        });

        document.getElementById('declineConsent').addEventListener('click', () => {
            resultElement.innerHTML = '<div class="insight-card warning"><p>❌ Consent required to use this extension.</p></div>';
        });
    }

    async performScan() {
        const scanButton = document.getElementById('scan');
        const loadingElement = document.getElementById('loading');
        const resultElement = document.getElementById('result');
        const quickStats = document.getElementById('quickStats');
        const quickActions = document.getElementById('quickActions');

        // Show loading state
        scanButton.disabled = true;
        scanButton.innerHTML = '<span class="real-time-indicator"></span> Scanning...';
        loadingElement.style.display = 'block';
        quickStats.style.display = 'none';
        quickActions.style.display = 'none';
        resultElement.innerHTML = '';

        try {
            // Update analysis details
            document.getElementById('analysisDetails').textContent = 'Connecting to Zoho Cliq...';

            // Get current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url.includes('cliq.zoho.com')) {
                throw new Error('Please navigate to Zoho Cliq first (https://cliq.zoho.com)');
            }
            
            document.getElementById('analysisDetails').textContent = 'Extracting messages...';

            // Send message to content script
            const response = await chrome.tabs.sendMessage(tab.id, { action: "getMessages" });
            
            if (!response.success) {
                throw new Error(response.error || 'Failed to extract messages from Cliq');
            }

            if (response.messages.length === 0) {
                throw new Error('No messages found. Please ensure you\'re in a team chat with messages.');
            }
            
            document.getElementById('analysisDetails').textContent = `Analyzing ${response.messages.length} messages...`;

            // Send for analysis
            const analysis = await chrome.runtime.sendMessage({
                action: "analyzeMessages",
                messages: response.messages
            });
            
            if (!analysis.success) {
                throw new Error(analysis.error || 'Analysis failed');
            }
            
            // Display results
            this.displayResults(analysis.data, response.messages.length);
            
        } catch (error) {
            console.error('Scan error:', error);
            resultElement.innerHTML = `
                <div class="insight-card warning">
                    <h4>❌ Scan Failed</h4>
                    <p>${error.message}</p>
                    ${error.suggestions ? `
                        <div style="margin-top: 10px;">
                            <strong>Suggestions:</strong>
                            <ul>
                                ${error.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
        } finally {
            scanButton.disabled = false;
            scanButton.innerHTML = '<span class="real-time-indicator"></span> 🔍 Scan Team Chat';
            loadingElement.style.display = 'none';
        }
    }

    displayResults(data, messageCount) {
        const resultElement = document.getElementById('result');
        const quickStats = document.getElementById('quickStats');
        const quickActions = document.getElementById('quickActions');

        this.currentAnalysis = data;

        // Update quick stats
        this.updateMetricCard('stress', data.stressLevel);
        this.updateMetricCard('productivity', data.productivityScore);
        this.updateMetricCard('engagement', data.engagementLevel);
        this.updateMetricCard('cohesion', data.teamCohesion);

        quickStats.style.display = 'block';

        // Display main results
        const sentimentEmoji = this.getSentimentEmoji(data.sentiment);
        const urgencyClass = this.getUrgencyClass(data.recommendation.urgency);

        resultElement.innerHTML = `
            <div class="insight-card ${urgencyClass}">
                <h4>💡 ${this.getUrgencyIcon(data.recommendation.urgency)} Recommendation</h4>
                <div style="font-size: 13px; line-height: 1.4; white-space: pre-line;">${data.recommendation.text}</div>
            </div>

            ${data.topics && data.topics.length > 0 ? `
                <div class="insight-card">
                    <h4>🔍 Key Topics</h4>
                    <div class="topics-list">
                        ${data.topics.map(topic => `
                            <span class="topic-tag">
                                ${topic.topic} (${topic.percentage}%)
                            </span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${data.patterns && data.patterns.length > 0 ? `
                <div class="insight-card">
                    <h4>📊 Detected Patterns</h4>
                    <div style="font-size: 13px;">
                        ${data.patterns.map(pattern => this.getPatternDescription(pattern)).join(' • ')}
                    </div>
                </div>
            ` : ''}
        `;

        // Update quick actions
        this.updateQuickActions(data.immediateActions);

        quickActions.style.display = 'grid';

        // Save this scan
        this.saveScanToHistory(data, messageCount);
    }

    updateMetricCard(type, value) {
        const card = document.getElementById(`${type}Card`);
        const valueElement = document.getElementById(`${type}Value`);
        const progressElement = document.getElementById(`${type}Progress`);

        valueElement.textContent = `${value}%`;
        progressElement.style.width = `${value}%`;

        // Update colors based on value and type
        let colorClass = '';
        if (type === 'stress') {
            if (value > 70) colorClass = 'stress-high';
            else if (value > 40) colorClass = 'stress-medium';
            else colorClass = 'stress-low';
            progressElement.style.background = this.getStressColor(value);
        } else {
            if (value > 70) colorClass = 'productivity-high';
            else if (value > 40) colorClass = 'productivity-medium';
            else colorClass = 'productivity-low';
            progressElement.style.background = this.getProductivityColor(value);
        }

        card.className = `metric-card ${colorClass}`;
    }

    getStressColor(value) {
        if (value > 70) return '#e74c3c';
        if (value > 40) return '#f39c12';
        return '#27ae60';
    }

    getProductivityColor(value) {
        if (value > 70) return '#27ae60';
        if (value > 40) return '#f39c12';
        return '#e74c3c';
    }

    getSentimentEmoji(sentiment) {
        switch(sentiment) {
            case 'positive': return '😊';
            case 'negative': return '😔';
            default: return '😐';
        }
    }

    getUrgencyClass(urgency) {
        switch(urgency) {
            case 'critical': return 'critical';
            case 'high': return 'warning';
            default: return 'info';
        }
    }

    getUrgencyIcon(urgency) {
        switch(urgency) {
            case 'critical': return '🚨';
            case 'high': return '⚠️';
            case 'medium': return '📋';
            default: return '💡';
        }
    }

    getPatternDescription(pattern) {
        const patterns = {
            'rapid_messaging': 'Rapid messaging detected',
            'repeated_questions': 'Repeated questions found',
            'late_night_work': 'Late night activity'
        };
        return patterns[pattern] || pattern;
    }

    updateQuickActions(actions) {
        const quickActions = document.getElementById('quickActions');
        quickActions.innerHTML = actions.map(action => `
            <div class="action-item">${action}</div>
        `).join('');
    }

    async loadSettings() {
        const result = await chrome.runtime.sendMessage({ action: "getSettings" });
        if (result.success) {
            this.settings = result.settings;
        }
    }

    async loadAlerts() {
        const result = await chrome.runtime.sendMessage({ action: "getAlerts" });
        if (result.success) {
            this.alerts = result.alerts;
            this.updateAlertBadge();
        }
    }

    updateAlertBadge() {
        const alertCount = document.getElementById('alertCount');
        if (this.alerts.length > 0) {
            alertCount.textContent = this.alerts.length;
            alertCount.style.display = 'inline-flex';
        } else {
            alertCount.style.display = 'none';
        }
    }

    async saveSettings() {
        const settings = {
            realTimeMonitoring: document.getElementById('realTimeMonitoring').checked,
            notifications: document.getElementById('notifications').checked,
            sensitivity: document.getElementById('sensitivity').value,
            anonymousMode: document.getElementById('anonymousMode').checked,
            dataRetentionDays: parseInt(document.getElementById('dataRetention').value)
        };

        const result = await chrome.runtime.sendMessage({
            action: "saveSettings",
            settings: settings
        });

        if (result.success) {
            this.showNotification('Settings saved successfully!', 'success');
        } else {
            this.showNotification('Failed to save settings', 'error');
        }
    }

    loadSettingsData() {
        document.getElementById('realTimeMonitoring').checked = this.settings.realTimeMonitoring !== false;
        document.getElementById('notifications').checked = this.settings.notifications !== false;
        document.getElementById('sensitivity').value = this.settings.sensitivity || 'medium';
        document.getElementById('anonymousMode').checked = this.settings.anonymousMode !== false;
        document.getElementById('dataRetention').value = this.settings.dataRetentionDays || 30;
    }

    loadAlertsData() {
        const alertsContent = document.getElementById('alertsContent');
        
        if (this.alerts.length === 0) {
            alertsContent.innerHTML = `
                <div class="insight-card info">
                    <p>No active alerts. Alerts will appear here when team metrics need attention.</p>
                </div>
            `;
        } else {
            alertsContent.innerHTML = this.alerts.map(alert => `
                <div class="insight-card ${alert.level === 'high' ? 'critical' : 'warning'}">
                    <h4>${this.getAlertIcon(alert.type)} ${alert.type.toUpperCase()} Alert</h4>
                    <p>${alert.message}</p>
                    <small>${new Date(alert.timestamp).toLocaleString()}</small>
                </div>
            `).join('');
        }
    }

    getAlertIcon(type) {
        const icons = {
            'stress': '😰',
            'productivity': '📉',
            'engagement': '💤'
        };
        return icons[type] || '⚠️';
    }

    async clearAlerts() {
        const result = await chrome.runtime.sendMessage({ action: "clearAlerts" });
        if (result.success) {
            this.alerts = [];
            this.updateAlertBadge();
            this.loadAlertsData();
            this.showNotification('Alerts cleared successfully!', 'success');
        }
    }

    async loadAnalyticsData() {
        const result = await chrome.runtime.sendMessage({ action: "getTrends" });
        if (result.success) {
            this.trends = result.trends;
            this.displayAnalytics();
        }
    }

    displayAnalytics() {
        const trendsContent = document.getElementById('trendsContent');
        const topicsContent = document.getElementById('topicsContent');

        if (this.trends.stress.length === 0) {
            trendsContent.innerHTML = '<p>No trend data available yet. Perform a scan to see analytics.</p>';
            topicsContent.innerHTML = '<p>Topics will appear here after analysis.</p>';
            return;
        }

        // Display simple trend analysis
        const stressTrend = this.calculateTrend(this.trends.stress);
        const productivityTrend = this.calculateTrend(this.trends.productivity);

        trendsContent.innerHTML = `
            <div style="font-size: 13px;">
                <p><strong>Stress Trend:</strong> ${stressTrend.direction} ${stressTrend.value}% ${this.getTrendIcon(stressTrend.direction)}</p>
                <p><strong>Productivity Trend:</strong> ${productivityTrend.direction} ${productivityTrend.value}% ${this.getTrendIcon(productivityTrend.direction)}</p>
                <p><strong>Data Points:</strong> ${this.trends.stress.length} scans</p>
            </div>
        `;

        // Display topics from current analysis
        if (this.currentAnalysis && this.currentAnalysis.topics) {
            topicsContent.innerHTML = this.currentAnalysis.topics.map(topic => `
                <div style="margin-bottom: 8px;">
                    <strong>${topic.topic}:</strong> ${topic.percentage}% (${topic.frequency} mentions)
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${topic.percentage}%; background: #3498db;"></div>
                    </div>
                </div>
            `).join('');
        }
    }

    calculateTrend(data) {
        if (data.length < 2) return { direction: 'stable', value: 0 };

        const recent = data.slice(-5); // Last 5 data points
        const first = recent[0].value;
        const last = recent[recent.length - 1].value;
        const change = ((last - first) / first) * 100;

        let direction = 'stable';
        if (change > 5) direction = 'increasing';
        else if (change < -5) direction = 'decreasing';

        return {
            direction: direction,
            value: Math.abs(Math.round(change))
        };
    }

    getTrendIcon(direction) {
        switch(direction) {
            case 'increasing': return '↗️';
            case 'decreasing': return '↘️';
            default: return '➡️';
        }
    }

    handleRealTimeUpdate(data) {
        if (document.getElementById('dashboard').classList.contains('active')) {
            // Update the dashboard with real-time data
            this.updateMetricCard('stress', data.stressLevel);
            this.updateMetricCard('productivity', data.productivityScore);
            
            // Show a subtle notification
            this.showNotification('Real-time update received', 'info');
        }
    }

    startRealTimeUpdates() {
        if (this.settings.realTimeMonitoring) {
            // Real-time updates are handled through the message listener
            console.log('Real-time monitoring active');
        }
    }

    showNotification(message, type = 'info') {
        // Simple notification implementation
        const notification = document.createElement('div');
        notification.className = `insight-card ${type === 'error' ? 'warning' : 'info'}`;
        notification.style.marginTop = '10px';
        notification.innerHTML = `<p>${message}</p>`;
        
        const resultElement = document.getElementById('result');
        resultElement.insertBefore(notification, resultElement.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    async exportData() {
        const result = await chrome.storage.local.get(['scanHistory', 'settings', 'alerts']);
        const dataStr = JSON.stringify(result, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cognitive-load-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Data exported successfully!', 'success');
    }

    async clearAllData() {
        if (confirm('Are you sure you want to clear all stored data? This includes scan history, settings, and alerts.')) {
            await chrome.storage.local.clear();
            localStorage.clear();
            
            // Reset consent to show dialog again
            localStorage.removeItem('cognitiveLoadConsent');
            
            this.showNotification('All data cleared successfully!', 'success');
            setTimeout(() => {
                window.close(); // Close the popup
            }, 2000);
        }
    }

    refreshData() {
        this.loadAlerts();
        this.loadSettings();
        if (this.currentAnalysis) {
            this.loadAnalyticsData();
        }
        this.showNotification('Data refreshed!', 'success');
    }

    viewFullReport() {
        if (this.currentAnalysis) {
            const reportWindow = window.open('', '_blank');
            reportWindow.document.write(`
                <html>
                    <head><title>Cognitive Load Report</title></head>
                    <body>
                        <h1>Cognitive Load Analysis Report</h1>
                        <pre>${JSON.stringify(this.currentAnalysis, null, 2)}</pre>
                    </body>
                </html>
            `);
        } else {
            this.showNotification('No analysis data available. Please perform a scan first.', 'warning');
        }
    }

    showLastScan() {
        chrome.storage.local.get(['lastScan']).then(result => {
            if (result.lastScan) {
                const resultElement = document.getElementById('result');
                resultElement.innerHTML = `
                    <div class="insight-card info">
                        <p>Ready to scan. Last analysis: ${new Date(result.lastScan.timestamp).toLocaleDateString()}</p>
                        <p><small>Analyzed ${result.lastScan.messageCount} messages</small></p>
                    </div>
                `;
            }
        });
    }

    saveScanToHistory(data, messageCount) {
        const scanData = {
            timestamp: new Date().toISOString(),
            data: data,
            messageCount: messageCount
        };
        
        chrome.storage.local.set({ lastScan: scanData });
        
        // Also add to history
        chrome.storage.local.get(['scanHistory']).then(result => {
            const history = result.scanHistory || [];
            history.unshift(scanData);
            // Keep only last 50 scans
            const limitedHistory = history.slice(0, 50);
            chrome.storage.local.set({ scanHistory: limitedHistory });
        });
    }
}

// Initialize the enhanced popup manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new EnhancedPopupManager();
});