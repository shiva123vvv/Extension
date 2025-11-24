// Background service worker for continuous monitoring
class BackgroundMonitor {
    constructor() {
        this.teamState = new Map();
        this.alertHistory = [];
        this.init();
    }

    init() {
        this.setupAlarms();
        this.setupMessageListeners();
        this.startPeriodicAnalysis();
    }

    setupAlarms() {
        // Check for burnout risks every 30 minutes
        chrome.alarms.create('burnoutCheck', { periodInMinutes: 30 });
        // Team health analysis every hour
        chrome.alarms.create('teamHealthCheck', { periodInMinutes: 60 });

        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === 'burnoutCheck') {
                this.checkBurnoutRisks();
            } else if (alarm.name === 'teamHealthCheck') {
                this.analyzeTeamHealth();
            }
        });
    }

    async checkBurnoutRisks() {
        // Get data from content script
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab && tab.url.includes('zoho.com')) {
            chrome.tabs.sendMessage(tab.id, { action: 'GET_BURNOUT_DATA' }, (response) => {
                if (response && response.burnoutData) {
                    this.processBurnoutData(response.burnoutData);
                }
            });
        }
    }

    processBurnoutData(data) {
        data.forEach(userData => {
            if (userData.burnoutRisk > 70) {
                this.sendCriticalAlert(userData);
            }
        });
    }

    sendCriticalAlert(userData) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: '🚨 Burnout Alert',
            message: `${userData.user} shows critical burnout risk (${userData.burnoutRisk}%)`,
            priority: 2,
            buttons: [{ title: 'View Details' }]
        });
    }
}

// Initialize background monitor
const backgroundMonitor = new BackgroundMonitor();