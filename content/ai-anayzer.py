class CognitiveLoadAnalyzer {
    constructor() {
        this.teamMetrics = new Map();
        this.burnoutPredictions = new Map();
        this.stressPatterns = new Map();
        this.init();
    }

    init() {
        this.startMessageMonitoring();
        this.startBehaviorAnalysis();
        this.startPredictiveModeling();
    }

    // REAL-TIME MESSAGE ANALYSIS
    startMessageMonitoring() {
        // Monitor Zoho Cliq messages
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && this.isMessageNode(node)) {
                        this.analyzeMessage(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    analyzeMessage(messageElement) {
        const messageData = this.extractMessageData(messageElement);
        const user = messageData.user;
        const content = messageData.content;
        const timestamp = messageData.timestamp;

        // AI Analysis
        const stressScore = this.calculateStressScore(content);
        const workloadIndicator = this.detectWorkloadPatterns(content, timestamp);
        const sentiment = this.analyzeSentiment(content);
        
        this.updateUserMetrics(user, {
            stressScore,
            workloadIndicator,
            sentiment,
            messageCount: 1,
            lastActivity: timestamp
        });

        this.checkAlerts(user);
    }

    // STRESS DETECTION ALGORITHM
    calculateStressScore(message) {
        const stressIndicators = {
            urgencyWords: ['urgent', 'asap', 'emergency', 'immediately', 'deadline'],
            negativeEmotions: ['stress', 'overwhelm', 'tired', 'exhausted', 'burnout'],
            workloadWords: ['too much', 'overload', 'swamped', 'drowning'],
            timePressure: ['late', 'behind', 'delay', 'missed']
        };

        let score = 0;
        const lowerMessage = message.toLowerCase();

        Object.values(stressIndicators).forEach(words => {
            words.forEach(word => {
                if (lowerMessage.includes(word)) score += 2;
            });
        });

        // Message length analysis
        if (message.length > 200) score += 1; // Long messages indicate complexity
        if (message.split('!').length > 3) score += 2; // Multiple exclamations

        return Math.min(score, 10);
    }

    // WORKLOAD PATTERN DETECTION
    detectWorkloadPatterns(message, timestamp) {
        const hour = new Date(timestamp).getHours();
        const patterns = {
            lateNightWork: hour >= 22 || hour <= 4,
            earlyMorningWork: hour >= 4 && hour <= 7,
            weekendWork: new Date(timestamp).getDay() === 0 || new Date(timestamp).getDay() === 6,
            highFrequency: this.calculateMessageFrequency(timestamp)
        };

        return patterns;
    }

    // BURNOUT PREDICTION ENGINE
    predictBurnout(user) {
        const userData = this.teamMetrics.get(user);
        if (!userData) return null;

        const burnoutFactors = {
            sustainedStress: this.calculateSustainedStress(userData),
            workLifeImbalance: this.calculateWorkLifeBalance(userData),
            communicationChanges: this.analyzeCommunicationPatterns(userData),
            productivityTrend: this.calculateProductivityTrend(userData)
        };

        const burnoutScore = (
            burnoutFactors.sustainedStress * 0.4 +
            burnoutFactors.workLifeImbalance * 0.3 +
            burnoutFactors.communicationChanges * 0.2 +
            burnoutFactors.productivityTrend * 0.1
        );

        return {
            score: burnoutScore,
            riskLevel: this.getRiskLevel(burnoutScore),
            predictedDate: this.calculateBurnoutDate(burnoutScore, userData),
            recommendations: this.generateRecommendations(burnoutFactors)
        };
    }

    // REAL-TIME ALERTS SYSTEM
    checkAlerts(user) {
        const userData = this.teamMetrics.get(user);
        const burnoutPrediction = this.predictBurnout(user);

        if (burnoutPrediction && burnoutPrediction.riskLevel === 'HIGH') {
            this.triggerAlert({
                type: 'BURNOUT_RISK',
                user: user,
                message: `🚨 ${user} shows high burnout risk (${Math.round(burnoutPrediction.score)}%)`,
                urgency: 'HIGH',
                actions: ['REDISTRIBUTE_TASKS', 'SUGGEST_BREAK']
            });
        }

        // Team workload spike detection
        if (this.detectTeamWorkloadSpike()) {
            this.triggerAlert({
                type: 'TEAM_OVERLOAD',
                message: `📊 Team workload increased by ${this.calculateWorkloadIncrease()}%`,
                urgency: 'MEDIUM',
                actions: ['REVIEW_PRIORITIES', 'DEFER_NON_URGENT']
            });
        }
    }

    // COGNITIVE HEALTH SCORING
    calculateCognitiveHealth(user) {
        const data = this.teamMetrics.get(user);
        const factors = {
            stressManagement: Math.max(0, 10 - data.avgStressScore),
            workBalance: this.calculateWorkBalanceScore(data),
            communicationHealth: this.calculateCommunicationHealth(data),
            recoveryPatterns: this.analyzeRecoveryPatterns(data)
        };

        return {
            overallScore: Object.values(factors).reduce((a, b) => a + b, 0) / Object.values(factors).length,
            breakdown: factors,
            trend: this.calculateHealthTrend(data)
        };
    }

    // VISUALIZATION DATA GENERATOR
    generateDashboardData() {
        const teamData = Array.from(this.teamMetrics.entries()).map(([user, data]) => ({
            user,
            stressScore: data.avgStressScore,
            workload: data.workloadScore,
            cognitiveHealth: this.calculateCognitiveHealth(user).overallScore,
            burnoutRisk: this.predictBurnout(user)?.score || 0,
            activityPattern: this.getActivityPattern(data),
            lastAlert: data.lastAlert
        }));

        return {
            teamOverview: teamData,
            teamHealth: this.calculateTeamHealth(teamData),
            alerts: this.getActiveAlerts(),
            trends: this.calculateTeamTrends(),
            recommendations: this.generateTeamRecommendations(teamData)
        };
    }
}

// Initialize the analyzer
const cognitiveAnalyzer = new CognitiveLoadAnalyzer();