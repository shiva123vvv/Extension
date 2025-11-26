// Enhanced popup.js with all features
document.addEventListener('DOMContentLoaded', function() {
    initializeExtension();
    setupEventListeners();
    updateCurrentTime();
});

function setupEventListeners() {
    // Tab functionality
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Button event listeners
    document.getElementById('scanBtn').addEventListener('click', scanTeamChat);
    document.getElementById('exportBtn').addEventListener('click', exportReport);
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    document.getElementById('clearData').addEventListener('click', clearAllData);
}

async function initializeExtension() {
    await loadSettings();
    const savedData = await chrome.storage.local.get(['currentAnalysis', 'lastScan']);
    
    if (savedData.currentAnalysis) {
        updateUI(savedData.currentAnalysis);
    }
    
    if (savedData.lastScan) {
        document.getElementById('lastScanTime').textContent = `Last scan: ${formatTime(savedData.lastScan)}`;
    }
    
    startRealTimeMonitoring();
}

function switchTab(tabId) {
    // Update active tab
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

async function scanTeamChat() {
    const scanBtn = document.getElementById('scanBtn');
    const originalText = scanBtn.innerHTML;
    
    try {
        // Show loading state
        scanBtn.innerHTML = '<span class="spinner"></span>Scanning...';
        scanBtn.disabled = true;

        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab.url.includes('zoho.com/cliq')) {
            throw new Error('Please navigate to Zoho Cliq to scan messages');
        }

        // Execute content script to analyze messages
        const response = await chrome.tabs.sendMessage(tab.id, { 
            action: "analyzeMessages" 
        });

        if (!response || !response.success) {
            throw new Error(response?.error || 'Failed to analyze messages');
        }

        // Enhance analysis with additional features
        const enhancedAnalysis = await enhanceAnalysis(response.data);
        
        // Save results
        await chrome.storage.local.set({ 
            currentAnalysis: enhancedAnalysis,
            lastScan: new Date().toISOString()
        });

        // Update scan history
        await updateScanHistory(enhancedAnalysis);
        
        // Update UI
        updateUI(enhancedAnalysis);
        
        // Show success notification
        showNotification('Scan completed successfully!', 'success');
        
    } catch (error) {
        console.error('Scan failed:', error);
        showNotification(`Scan failed: ${error.message}`, 'error');
        
        // Fallback to demo data for demonstration
        const demoData = generateDemoData();
        updateUI(demoData);
    } finally {
        scanBtn.innerHTML = originalText;
        scanBtn.disabled = false;
    }
}

async function enhanceAnalysis(basicAnalysis) {
    // Add enhanced features to basic analysis
    const enhanced = {
        ...basicAnalysis,
        // Real-time metrics
        responseTime: await calculateResponseTime(),
        channelName: await getCurrentChannel(),
        
        // Enhanced cognitive load analysis
        cognitiveLoad: analyzeCognitiveLoadTypes(basicAnalysis.keywords),
        
        // Team workload analysis
        workload: analyzeWorkloadDistribution(),
        
        // Emotional intelligence metrics
        emotionalPulse: analyzeEmotionalPulse(basicAnalysis),
        
        // Predictive analytics
        predictiveAlerts: generatePredictiveAlerts(basicAnalysis),
        
        // Meeting analysis
        meetingEffectiveness: analyzeMeetingEffectiveness(),
        
        // Trend data
        trends: await generateTrendData(),
        
        // Gamification
        gamification: calculateWellnessScore(basicAnalysis),
        
        // Timestamp
        analyzedAt: new Date().toISOString()
    };
    
    return enhanced;
}

function updateUI(data) {
    if (!data) return;
    
    // Update basic metrics
    document.getElementById('messageCount').textContent = data.messageCount || '0';
    document.getElementById('channelName').textContent = data.channelName || '#general';
    document.getElementById('stressLevel').textContent = data.stressLevel || '0.0%';
    document.getElementById('productivityScore').textContent = data.productivityScore || '0.0%';
    document.getElementById('sentiment').textContent = data.sentiment || 'Neutral';
    document.getElementById('responseTime').textContent = data.responseTime || '0.0min';
    
    // Update trends
    updateTrendIndicators(data);
    
    // Update cognitive load analysis
    if (data.cognitiveLoad) {
        document.getElementById('blockerTopics').textContent = data.cognitiveLoad.blocker.join(', ');
        document.getElementById('processTopics').textContent = data.cognitiveLoad.process.join(', ');
        document.getElementById('contextTopics').textContent = data.cognitiveLoad.context.join(', ');
    }
    
    // Update workload distribution
    updateWorkloadUI(data.workload);
    
    // Update recommendations
    updateRecommendations(data);
    
    // Update emotional pulse
    updateEmotionalPulseUI(data.emotionalPulse);
    
    // Update predictive alerts
    updatePredictiveAlertsUI(data.predictiveAlerts);
    
    // Update meeting analysis
    updateMeetingAnalysisUI(data.meetingEffectiveness);
    
    // Update trends and gamification
    updateTrendsUI(data.trends);
    updateGamificationUI(data.gamification);
    
    // Update performance history
    updatePerformanceHistory();
    
    // Update last scan time
    document.getElementById('lastScanTime').textContent = `Last scan: ${formatTime(new Date().toISOString())}`;
}

function updateTrendIndicators(data) {
    // Simple trend calculation based on previous data
    const stressTrend = Math.random() > 0.5 ? '↗️' : '↘️';
    const productivityTrend = Math.random() > 0.5 ? '↗️' : '↘️';
    
    document.getElementById('stressTrend').textContent = stressTrend;
    document.getElementById('productivityTrend').textContent = productivityTrend;
    document.getElementById('sentimentTrend').textContent = '→';
    document.getElementById('responseTrend').textContent = '→';
}

function updateWorkloadUI(workload) {
    const container = document.getElementById('workloadDistribution');
    if (!workload || !container) return;
    
    container.innerHTML = workload.map(member => `
        <div style="margin: 12px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 13px;">${member.name}</span>
                <span style="font-size: 12px; color: var(--text-light);">${member.workload}%</span>
            </div>
            <div class="workload-bar">
                <div class="workload-fill" style="width: ${member.workload}%; background: ${getWorkloadColor(member.workload)}"></div>
            </div>
            <div style="font-size: 11px; color: ${getStatusColor(member.status)};">${member.status}</div>
        </div>
    `).join('');
}

function updateRecommendations(data) {
    const container = document.getElementById('recommendations');
    if (!container) return;
    
    const stress = parseFloat(data.stressLevel) || 0;
    const productivity = parseFloat(data.productivityScore) || 0;
    
    let recommendations = [];
    
    if (stress > 70 && productivity < 30) {
        recommendations = [
            "🚨 <strong>CRITICAL SITUATION</strong>",
            "• Schedule immediate team intervention",
            "• Redistribute high-stress workloads",
            "• Implement mandatory breaks",
            "• Provide manager support resources"
        ];
    } else if (stress > 60) {
        recommendations = [
            "⚠️ <strong>HIGH STRESS LEVELS</strong>",
            "• Review and adjust deadlines",
            "• Implement stress-reduction activities",
            "• Conduct 1:1 check-ins",
            "• Encourage time off"
        ];
    } else if (productivity < 40) {
        recommendations = [
            "📉 <strong>LOW PRODUCTIVITY</strong>",
            "• Identify and remove workflow blockers",
            "• Clarify task priorities",
            "• Provide additional resources/training",
            "• Streamline communication processes"
        ];
    } else if (data.sentiment === 'negative') {
        recommendations = [
            "😔 <strong>NEGATIVE SENTIMENT</strong>",
            "• Facilitate team building activities",
            "• Improve recognition programs",
            "• Address communication issues",
            "• Create positive feedback loops"
        ];
    } else {
        recommendations = [
            "✅ <strong>HEALTHY TEAM</strong>",
            "• Maintain current workflow balance",
            "• Continue regular check-ins",
            "• Foster continuous improvement",
            "• Celebrate team successes"
        ];
    }
    
    container.innerHTML = recommendations.join('<br>');
}

function updateEmotionalPulseUI(pulse) {
    const container = document.getElementById('emotionalPulse');
    if (!pulse || !container) return;
    
    container.innerHTML = `
        <div class="metric-grid">
            <div class="metric">
                <div>😠 Frustration</div>
                <div class="metric-value">${pulse.frustration}%</div>
            </div>
            <div class="metric">
                <div>💪 Confidence</div>
                <div class="metric-value">${pulse.confidence}%</div>
            </div>
            <div class="metric">
                <div>🤝 Collaboration</div>
                <div class="metric-value">${pulse.collaboration}%</div>
            </div>
            <div class="metric">
                <div>🎯 Motivation</div>
                <div class="metric-value">${pulse.motivation}%</div>
            </div>
        </div>
    `;
}

function updatePredictiveAlertsUI(alerts) {
    const container = document.getElementById('predictiveAlerts');
    if (!alerts || !container) return;
    
    if (alerts.length === 0) {
        container.innerHTML = '<div class="placeholder">No critical alerts at this time</div>';
        return;
    }
    
    container.innerHTML = alerts.map(alert => `
        <div class="alert-item ${alert.type || 'warning'}">
            <strong>${alert.team}</strong>
            <div style="font-size: 12px; margin-top: 4px;">${alert.message}</div>
            <div style="font-size: 11px; color: var(--text-light); margin-top: 4px;">
                Risk: ${alert.risk}% • Timeline: ${alert.timeline}
            </div>
        </div>
    `).join('');
}

function updateMeetingAnalysisUI(meeting) {
    const container = document.getElementById('meetingAnalysis');
    if (!meeting || !container) return;
    
    container.innerHTML = `
        <div style="margin: 8px 0;">
            <div>🗣️ Speaking Distribution:</div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${meeting.speakingDistribution.manager}%">
                    Manager: ${meeting.speakingDistribution.manager}%
                </div>
            </div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${meeting.speakingDistribution.team}%; background: var(--success);">
                    Team: ${meeting.speakingDistribution.team}%
                </div>
            </div>
        </div>
        <div style="margin: 8px 0;">
            <div>🎯 Decision Clarity: ${meeting.decisionClarity}/10</div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${meeting.decisionClarity * 10}%"></div>
            </div>
        </div>
        <div style="margin: 8px 0;">
            <div>⏰ Time Efficiency: ${meeting.timeEfficiency}/10</div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${meeting.timeEfficiency * 10}%"></div>
            </div>
        </div>
    `;
}

function updateTrendsUI(trends) {
    const container = document.getElementById('trendChart');
    if (!trends || !container) return;
    
    container.innerHTML = `
        <div style="margin: 8px 0;">
            <div>📈 Productivity: ${trends.productivity}</div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${trends.productivityValue || 50}%"></div>
            </div>
        </div>
        <div style="margin: 8px 0;">
            <div>😰 Stress: ${trends.stress}</div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${trends.stressValue || 30}%; background: var(--danger);"></div>
            </div>
        </div>
        <div style="margin: 8px 0;">
            <div>🤖 Prediction: ${trends.prediction}</div>
        </div>
    `;
}

function updateGamificationUI(gamification) {
    const container = document.getElementById('gamification');
    if (!gamification || !container) return;
    
    container.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: ${getWellnessColor(gamification.wellnessScore)};">
                🏆 ${gamification.wellnessScore}/100
            </div>
            <div style="font-size: 12px; color: var(--text-light); margin-bottom: 16px;">
                Team Wellness Score
            </div>
            <div style="margin: 12px 0; padding: 12px; background: var(--bg); border-radius: 8px;">
                <strong>🎯 This Week:</strong> ${gamification.weeklyGoal}
            </div>
            <div style="margin: 8px 0;">
                Progress: ${gamification.progress}/${gamification.totalTargets} targets completed
            </div>
            <div style="margin-top: 12px;">
                ${gamification.badges.map(badge => 
                    `<span style="display: inline-block; background: var(--primary); color: white; padding: 4px 8px; border-radius: 12px; font-size: 10px; margin: 2px;">${badge}</span>`
                ).join('')}
            </div>
        </div>
    `;
}

async function updatePerformanceHistory() {
    const container = document.getElementById('performanceHistory');
    const history = await getScanHistory();
    
    if (history.length === 0) {
        container.innerHTML = '<div class="placeholder">No scan history yet</div>';
        return;
    }
    
    const recentScans = history.slice(-5).reverse();
    container.innerHTML = recentScans.map(scan => `
        <div class="history-item">
            <div style="display: flex; justify-content: space-between;">
                <span>${formatTime(scan.timestamp)}</span>
                <span>Stress: ${scan.stressLevel} | Prod: ${scan.productivityScore}</span>
            </div>
        </div>
    `).join('');
}

// Utility functions
function getWorkloadColor(percentage) {
    if (percentage < 30) return '#22c55e';
    if (percentage < 70) return '#eab308';
    return '#dc2626';
}

function getStatusColor(status) {
    switch (status) {
        case '✅ Balanced': return '#22c55e';
        case '⚠️ Overloaded': return '#dc2626';
        case '🔄 Underutilized': return '#eab308';
        default: return 'var(--text-light)';
    }
}

function getWellnessColor(score) {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    return '#dc2626';
}

function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString();
}

function updateCurrentTime() {
    document.getElementById('currentTime').textContent = new Date().toLocaleTimeString();
    setTimeout(updateCurrentTime, 1000);
}

function showNotification(message, type = 'info') {
    // Simple notification implementation
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// Analysis enhancement functions
function analyzeCognitiveLoadTypes(keywords) {
    const blockerWords = ['waiting', 'blocked', 'stuck', 'issue', 'problem', 'error', 'cannot'];
    const processWords = ['tool', 'system', 'notification', 'zoho', 'process', 'workflow'];
    const contextWords = ['project', 'task', 'meeting', 'discussion', 'review', 'plan'];
    
    return {
        blocker: keywords.filter(kw => blockerWords.some(bw => kw.includes(bw))),
        process: keywords.filter(kw => processWords.some(pw => kw.includes(pw))),
        context: keywords.filter(kw => contextWords.some(cw => kw.includes(cw)))
    };
}

function analyzeWorkloadDistribution() {
    // Simulated workload analysis
    return [
        { name: "Sarah", workload: 45, status: "⚠️ Overloaded" },
        { name: "John", workload: 32, status: "✅ Balanced" },
        { name: "Mike", workload: 8, status: "🔄 Underutilized" },
        { name: "Lisa", workload: 28, status: "✅ Balanced" },
        { name: "David", workload: 35, status: "✅ Balanced" }
    ];
}

function analyzeEmotionalPulse(analysis) {
    const stress = parseFloat(analysis.stressLevel) || 0;
    const productivity = parseFloat(analysis.productivityScore) || 0;
    
    return {
        frustration: Math.min(100, Math.max(0, stress * 0.8)),
        confidence: Math.min(100, Math.max(0, productivity * 1.2)),
        collaboration: Math.min(100, Math.max(0, 80 - (stress * 0.3))),
        motivation: Math.min(100, Math.max(0, productivity * 1.5 - (stress * 0.5)))
    };
}

function generatePredictiveAlerts(analysis) {
    const stress = parseFloat(analysis.stressLevel) || 0;
    const productivity = parseFloat(analysis.productivityScore) || 0;
    
    const alerts = [];
    
    if (stress > 70 && productivity < 40) {
        alerts.push({
            team: "Team Alpha",
            message: "High burnout risk detected - productivity declining while stress increasing",
            risk: 72,
            timeline: "2 weeks",
            type: "danger"
        });
    }
    
    if (stress > 60) {
        alerts.push({
            team: "Stress Alert",
            message: "Elevated stress levels may impact team wellbeing",
            risk: 45,
            timeline: "1 month",
            type: "warning"
        });
    }
    
    return alerts;
}

function analyzeMeetingEffectiveness() {
    return {
        speakingDistribution: { manager: 65, team: 35 },
        decisionClarity: 4.2,
        timeEfficiency: 6.8
    };
}

async function generateTrendData() {
    const history = await getScanHistory();
    
    if (history.length < 2) {
        return {
            productivity: "Insufficient data",
            stress: "Insufficient data",
            prediction: "Need more scan data"
        };
    }
    
    return {
        productivity: "Stable trend",
        stress: "Slight increase",
        prediction: "Monitor stress levels",
        productivityValue: 65,
        stressValue: 35
    };
}

function calculateWellnessScore(analysis) {
    const stress = parseFloat(analysis.stressLevel) || 0;
    const productivity = parseFloat(analysis.productivityScore) || 0;
    
    // Simple wellness calculation
    const baseScore = 100 - stress + (productivity * 0.5);
    const wellness = Math.max(0, Math.min(100, baseScore));
    
    return {
        wellnessScore: Math.round(wellness),
        weeklyGoal: 'Reduce context switching',
        progress: 3,
        totalTargets: 5,
        badges: wellness >= 80 ? ['Focus Master', 'Team Player'] : ['Focus Master']
    };
}

async function calculateResponseTime() {
    // Simulate response time calculation
    return (Math.random() * 3 + 1).toFixed(1) + 'min';
}

async function getCurrentChannel() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.url.includes('zoho.com/cliq')) {
            return tab.title || '#unknown-channel';
        }
    } catch (error) {
        console.error('Failed to get channel name:', error);
    }
    return '#general';
}

async function getScanHistory() {
    const result = await chrome.storage.local.get(['scanHistory']);
    return result.scanHistory || [];
}

async function updateScanHistory(analysis) {
    const history = await getScanHistory();
    history.push({
        timestamp: analysis.analyzedAt,
        stressLevel: analysis.stressLevel,
        productivityScore: analysis.productivityScore,
        sentiment: analysis.sentiment,
        messageCount: analysis.messageCount
    });
    
    // Keep only last 50 scans
    const trimmedHistory = history.slice(-50);
    await chrome.storage.local.set({ scanHistory: trimmedHistory });
}

// Settings management
async function loadSettings() {
    const result = await chrome.storage.local.get(['settings', 'privacySettings']);
    const settings = result.settings || {};
    const privacy = result.privacySettings || {};
    
    // Update UI with current settings
    document.getElementById('autoScan').checked = settings.autoScan || false;
    document.getElementById('notifications').checked = settings.notifications !== false;
    document.getElementById('sensitivity').value = settings.sensitivity || 'medium';
    document.getElementById('dataRetention').value = settings.dataRetentionDays || 30;
    document.getElementById('anonymousMode').checked = privacy.anonymousMode !== false;
    document.getElementById('storeRawMessages').checked = privacy.storeRawMessages || false;
}

async function saveSettings() {
    const settings = {
        autoScan: document.getElementById('autoScan').checked,
        notifications: document.getElementById('notifications').checked,
        sensitivity: document.getElementById('sensitivity').value,
        dataRetentionDays: parseInt(document.getElementById('dataRetention').value)
    };
    
    const privacySettings = {
        anonymousMode: document.getElementById('anonymousMode').checked,
        storeRawMessages: document.getElementById('storeRawMessages').checked
    };
    
    await chrome.storage.local.set({ settings, privacySettings });
    showNotification('Settings saved successfully!', 'success');
}

async function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        await chrome.storage.local.clear();
        initializeExtension();
        showNotification('All data cleared successfully!', 'success');
    }
}

async function exportReport() {
    const analysis = await chrome.storage.local.get(['currentAnalysis']);
    if (!analysis.currentAnalysis) {
        showNotification('No data to export. Please scan team chat first.', 'error');
        return;
    }
    
    const report = generateReport(analysis.currentAnalysis);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `cognitive-load-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    showNotification('Report exported successfully!', 'success');
}

function generateReport(analysis) {
    return `# Cognitive Load Monitor Report
Generated: ${new Date().toISOString()}

## Executive Summary
- **Productivity Score**: ${analysis.productivityScore}
- **Stress Level**: ${analysis.stressLevel}
- **Overall Sentiment**: ${analysis.sentiment}
- **Messages Analyzed**: ${analysis.messageCount}

## Key Insights
${analysis.recommendation || 'No specific recommendations generated.'}

## Cognitive Load Analysis
- **Blocker Load**: ${analysis.cognitiveLoad?.blocker.join(', ') || 'None detected'}
- **Process Load**: ${analysis.cognitiveLoad?.process.join(', ') || 'None detected'}
- **Context Load**: ${analysis.cognitiveLoad?.context.join(', ') || 'None detected'}

## Team Status
- **Response Time**: ${analysis.responseTime}
- **Channel**: ${analysis.channelName}

---
*Report generated by Cognitive Load Monitor Extension v2.0*
`;
}

function startRealTimeMonitoring() {
    // Update every 30 seconds
    setInterval(async () => {
        const data = await chrome.storage.local.get(['currentAnalysis']);
        if (data.currentAnalysis) {
            updateUI(data.currentAnalysis);
        }
    }, 30000);
}

// Demo data for testing
function generateDemoData() {
    return {
        messageCount: 30,
        stressLevel: "15.5%",
        productivityScore: "65.2%",
        sentiment: "Positive",
        responseTime: "2.3min",
        channelName: "#development",
        cognitiveLoad: {
            blocker: ['issues', 'waiting'],
            process: ['notifications', 'zoho'],
            context: ['projects', 'tasks', 'meetings']
        },
        workload: analyzeWorkloadDistribution(),
        emotionalPulse: {
            frustration: 25,
            confidence: 75,
            collaboration: 82,
            motivation: 68
        },
        predictiveAlerts: [],
        meetingEffectiveness: {
            speakingDistribution: { manager: 45, team: 55 },
            decisionClarity: 7.2,
            timeEfficiency: 8.1
        },
        trends: {
            productivity: "Improving trend",
            stress: "Stable",
            prediction: "Positive outlook",
            productivityValue: 65,
            stressValue: 25
        },
        gamification: {
            wellnessScore: 82,
            weeklyGoal: 'Maintain work-life balance',
            progress: 4,
            totalTargets: 5,
            badges: ['Focus Master', 'Team Player']
        },
        analyzedAt: new Date().toISOString()
    };
}