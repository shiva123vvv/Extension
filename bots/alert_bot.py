import logging
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from enum import Enum

logger = logging.getLogger(__name__)

class AlertPriority(Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM" 
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class AlertBot:
    def __init__(self, alert_service):
        self.alert_service = alert_service
        self.alert_cooldown = {}  # Prevent alert spam
        
    async def send_proactive_alerts(self):
        """Send proactive alerts based on team monitoring"""
        try:
            # Check for overload alerts
            await self._check_overload_alerts()
            
            # Check for stress alerts  
            await self._check_stress_alerts()
            
            # Check for burnout alerts
            await self._check_burnout_alerts()
            
            # Check for work imbalance alerts
            await self._check_imbalance_alerts()
            
            # Check for activity spike alerts
            await self._check_activity_alerts()
            
        except Exception as e:
            logger.error(f"Error sending proactive alerts: {e}")
    
    async def _check_overload_alerts(self):
        """Check for workload overload situations"""
        # This would query workload analyzer
        overload_users = [
            {"user_id": "user_001", "workload_score": 0.85, "factors": ["high_meeting_density"]},
            {"user_id": "user_003", "workload_score": 0.92, "factors": ["multiple_deadlines"]}
        ]
        
        for user in overload_users:
            if self._should_alert(user['user_id'], "OVERLOAD"):
                await self.alert_service.send_alert(
                    user_id=user['user_id'],
                    alert_type="WORKLOAD_OVERLOAD",
                    message=f"{user['user_id']} is overloaded today (score: {user['workload_score']*100:.1f}%). Consider reassigning tasks.",
                    severity=AlertPriority.HIGH,
                    metadata={"factors": user['factors']}
                )
    
    async def _check_stress_alerts(self):
        """Check for high stress levels"""
        high_stress_users = [
            {"user_id": "user_002", "stress_level": 0.78, "indicators": ["late_night_messages"]},
            {"user_id": "user_004", "stress_level": 0.81, "indicators": ["rapid_response"]}
        ]
        
        for user in high_stress_users:
            if self._should_alert(user['user_id'], "STRESS"):
                await self.alert_service.send_alert(
                    user_id=user['user_id'],
                    alert_type="HIGH_STRESS",
                    message=f"High stress detected for {user['user_id']}. Indicators: {', '.join(user['indicators'])}",
                    severity=AlertPriority.MEDIUM,
                    metadata={"stress_level": user['stress_level']}
                )
    
    async def _check_burnout_alerts(self):
        """Check for burnout risk"""
        burnout_risk_users = [
            {"user_id": "user_001", "burnout_risk": 0.75, "worked_hours": 65},
            {"user_id": "user_005", "burnout_risk": 0.82, "worked_hours": 72}
        ]
        
        for user in burnout_risk_users:
            if self._should_alert(user['user_id'], "BURNOUT"):
                await self.alert_service.send_alert(
                    user_id=user['user_id'],
                    alert_type="BURNOUT_RISK",
                    message=f"{user['user_id']} showing burnout signs ({user['worked_hours']} hours this week).",
                    severity=AlertPriority.HIGH,
                    metadata={"burnout_risk": user['burnout_risk']}
                )
    
    async def _check_imbalance_alerts(self):
        """Check for work distribution imbalance"""
        imbalance_data = {
            "team_001": {
                "imbalance_score": 0.78,
                "overloaded": ["user_001", "user_003"],
                "underloaded": ["user_002", "user_004"]
            }
        }
        
        for team_id, data in imbalance_data.items():
            if self._should_alert(team_id, "IMBALANCE"):
                await self.alert_service.send_alert(
                    team_id=team_id,
                    alert_type="WORK_IMBALANCE",
                    message=f"Team work imbalance detected. Overloaded: {', '.join(data['overloaded'])}",
                    severity=AlertPriority.MEDIUM,
                    metadata=data
                )
    
    async def _check_activity_alerts(self):
        """Check for abnormal activity spikes"""
        activity_spikes = [
            {"channel_id": "dev_channel", "increase_percent": 45, "message_count": 156},
            {"channel_id": "design_channel", "increase_percent": 230, "message_count": 89}
        ]
        
        for spike in activity_spikes:
            if self._should_alert(spike['channel_id'], "ACTIVITY_SPIKE"):
                await self.alert_service.send_alert(
                    channel_id=spike['channel_id'],
                    alert_type="ACTIVITY_SPIKE",
                    message=f"Channel #{spike['channel_id']} has {spike['increase_percent']}% activity spike today.",
                    severity=AlertPriority.LOW,
                    metadata=spike
                )
    
    def _should_alert(self, entity_id: str, alert_type: str) -> bool:
        """Check if we should send alert (cooldown check)"""
        key = f"{entity_id}_{alert_type}"
        now = datetime.now()
        
        if key in self.alert_cooldown:
            last_alert = self.alert_cooldown[key]
            if now - last_alert < timedelta(hours=1):  # 1 hour cooldown
                return False
        
        self.alert_cooldown[key] = now
        return True
    
    async def send_daily_summary(self, team_id: str):
        """Send daily team summary"""
        summary = await self._generate_daily_summary(team_id)
        
        await self.alert_service.send_alert(
            team_id=team_id,
            alert_type="DAILY_SUMMARY",
            message=summary,
            severity=AlertPriority.LOW
        )
    
    async def _generate_daily_summary(self, team_id: str) -> str:
        """Generate daily team summary"""
        return f"""
📊 *Daily Team Summary - {datetime.now().strftime('%Y-%m-%d')}*

*Team Health:* 78% ✅
*Workload Increase:* 12% 📈
*Stress Level:* 34% 😊
*Active Members:* 8/10

*Top Performer:* user_002 🏆
*Need Support:* user_001 🤝
*Burnout Watch:* user_005 ⚠️

*Recommendation:* Balance workload between user_001 and user_004
"""