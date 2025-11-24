class ZohoCliqIntegration {
    constructor() {
        this.teamData = new Map();
        this.messageHistory = [];
        this.init();
    }

    init() {
        this.injectDashboard();
        this.startDataCollection();
        this.setupRealTimeUpdates();
    }

    injectDashboard() {
        // Inject cognitive load dashboard into Zoho Cliq interface
        const dashboardHTML = `
            <div id="cognitiveLoadDashboard" style="position: fixed; top: 20px; right: 20px; width: 350px; background: white; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 10000;">
                <div style="padding: 15px; border-bottom: 1px solid #eee;">
                    <h4 style="margin: 0; color: #333;">🧠 Team Cognitive Monitor</h4>
                </div>
                <div id="cognitiveDashboardContent" style="padding: 15px; max-height: 500px; overflow-y: auto;">
                    <!-- Dynamic content from analyzer -->
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', dashboardHTML);
        this.updateDashboard();
    }

    updateDashboard() {
        const dashboardContent = document.getElementById('cognitiveDashboardContent');
        if (!dashboardContent) return;

        const data = cognitiveAnalyzer.generateDashboardData();
        
        dashboardContent.innerHTML = `
            <div style="color: #333;">
                <div style="margin-bottom: 15px;">
                    <strong>Team Health:</strong> 
                    <span style="color: ${this.getHealthColor(data.teamHealth)}">${data.teamHealth}%</span>
                </div>
                
                ${data.alerts.map(alert => `
                    <div style="background: ${this.getAlertColor(alert.urgency)}; padding: 10px; border-radius: 5px; margin: 5px 0; font-size: 12px;">
                        ${alert.message}
                    </div>
                `).join('')}
                
                <div style="margin-top: 15px; font-size: 12px;">
                    <strong>Active Monitoring:</strong> ${this.teamData.size} team members
                </div>
            </div>
        `;
    }

    getHealthColor(score) {
        if (score >= 80) return '#2ed573';
        if (score >= 60) return '#ffa502';
        return '#ff4757';
    }

    getAlertColor(urgency) {
        const colors = {
            HIGH: '#ffcccc',
            MEDIUM: '#fff4cc',
            LOW: '#ccffcc'
        };
        return colors[urgency] || '#cccccc';
    }
}