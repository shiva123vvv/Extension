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
        self.last_daily_summary = None
        
    async def send_proactive_alerts(self):
        """Send proactive alerts based on team monitoring"""
        while True:
            try:
                logger.info("🔍 Checking for proactive alerts...")
                
                # Check for various alert conditions
                await self._check_overload_alerts()
                await self._check_stress_alerts()  
                await self._check_burnout_alerts()
                await self._check_imbalance_alerts()
                await self._check_activity_alerts()
                
                # Send daily summary at 9 AM
                await self._check_daily_summary()
                
                # Wait before next check
                await asyncio.sleep(300)  # 5 minutes
                
            except Exception as e:
                logger.error(f"Error in proactive alerts: {e}")
                await asyncio.sleep(60)  # Wait 1 minute on error
    
    async def _check_overload_alerts(self):
        """Check for workload overload situations"""
        overload_users = [
            {"user_id": "user_001", "workload_score": 0.85, "factors": ["high_meeting_density", "multiple_deadlines"]},
            {"user_id": "user_003", "workload_score": 0.92, "factors": ["high_task_volume", "context_switching"]}
        ]
        
        for user in overload_users:
            if self._should_alert(user['user_id'], "OVERLOAD"):
                await self.alert_service.send_alert(
                    user_id=user['user_id'],
                    alert_type="WORKLOAD_OVERLOAD",
                    message=f"🚨 {user['user_id']} is overloaded today (score: {user['workload_score']*100:.1f}%). Consider reassigning tasks.",
                    severity=AlertPriority.HIGH,
                    metadata={
                        "factors": user['factors'],
                        "workload_score": user['workload_score'],
                        "recommendation": "Delegate tasks and reschedule meetings"
                    }
                )
    
    async def _check_stress_alerts(self):
        """Check for high stress levels"""
        high_stress_users = [
            {"user_id": "user_002", "stress_level": 0.78, "indicators": ["late_night_messages", "rapid_responses"]},
            {"user_id": "user_004", "stress_level": 0.81, "indicators": ["extended_hours", "weekend_work"]}
        ]
        
        for user in high_stress_users:
            if self._should_alert(user['user_id'], "STRESS"):
                await self.alert_service.send_alert(
                    user_id=user['user_id'],
                    alert_type="HIGH_STRESS",
                    message=f"😰 High stress detected for {user['user_id']}. Indicators: {', '.join(user['indicators'])}",
                    severity=AlertPriority.MEDIUM,
                    metadata={
                        "stress_level": user['stress_level'],
                        "indicators": user['indicators'],
                        "recommendation": "Take breaks and discuss workload with manager"
                    }
                )
    
    async def _check_burnout_alerts(self):
        """Check for burnout risk"""
        burnout_risk_users = [
            {"user_id": "user_001", "burnout_risk": 0.75, "worked_hours": 65, "factors": ["consistent_overtime"]},
            {"user_id": "user_005", "burnout_risk": 0.82, "worked_hours": 72, "factors": ["weekend_work", "no_breaks"]}
        ]
        
        for user in burnout_risk_users:
            if self._should_alert(user['user_id'], "BURNOUT"):
                await self.alert_service.send_alert(
                    user_id=user['user_id'],
                    alert_type="BURNOUT_RISK",
                    message=f"🔥 {user['user_id']} showing burnout signs ({user['worked_hours']} hours this week). Immediate attention needed.",
                    severity=AlertPriority.HIGH,
                    metadata={
                        "burnout_risk": user['burnout_risk'],
                        "hours_worked": user['worked_hours'],
                        "factors": user['factors'],
                        "recommendation": "Schedule time off and reduce workload immediately"
                    }
                )
    
    async def _check_imbalance_alerts(self):
        """Check for work distribution imbalance"""
        imbalance_data = {
            "team_001": {
                "imbalance_score": 0.78,
                "overloaded": ["user_001", "user_003"],
                "underloaded": ["user_002", "user_004"],
                "impact": "high"
            }
        }
        
        for team_id, data in imbalance_data.items():
            if self._should_alert(team_id, "IMBALANCE"):
                await self.alert_service.send_alert(
                    team_id=team_id,
                    alert_type="WORK_IMBALANCE",
                    message=f"⚖️ Team work imbalance detected. Overloaded: {', '.join(data['overloaded'])}",
                    severity=AlertPriority.MEDIUM,
                    metadata={
                        "imbalance_score": data['imbalance_score'],
                        "overloaded_members": data['overloaded'],
                        "underloaded_members": data['underloaded'],
                        "recommendation": f"Redistribute work from {data['overloaded'][0]} to {data['underloaded'][0]}"
                    }
                )
    
    async def _check_activity_alerts(self):
        """Check for abnormal activity spikes"""
        activity_spikes = [
            {"channel_id": "dev_channel", "increase_percent": 45, "message_count": 156, "time_period": "today"},
            {"channel_id": "design_channel", "increase_percent": 230, "message_count": 89, "time_period": "today"}
        ]
        
        for spike in activity_spikes:
            if self._should_alert(spike['channel_id'], "ACTIVITY_SPIKE"):
                await self.alert_service.send_alert(
                    channel_id=spike['channel_id'],
                    alert_type="ACTIVITY_SPIKE",
                    message=f"📈 Channel #{spike['channel_id']} has {spike['increase_percent']}% activity spike {spike['time_period']}.",
                    severity=AlertPriority.LOW,
                    metadata=spike
                )
    
    async def _check_daily_summary(self):
        """Check if it's time for daily summary"""
        now = datetime.now()
        
        # Send daily summary at 9 AM
        if now.hour == 9 and now.minute < 5:
            if self.last_daily_summary != now.date():
                await self.send_daily_summary("team_001")
                self.last_daily_summary = now.date()
    
    def _should_alert(self, entity_id: str, alert_type: str) -> bool:
        """Check if we should send alert (cooldown check)"""
        key = f"{entity_id}_{alert_type}"
        now = datetime.now()
        
        if key in self.alert_cooldown:
            last_alert = self.alert_cooldown[key]
            # Different cooldown based on alert type
            cooldown_hours = 1 if alert_type in ["OVERLOAD", "BURNOUT"] else 4
            if now - last_alert < timedelta(hours=cooldown_hours):
                return False
        
        self.alert_cooldown[key] = now
        return True
    
    async def send_daily_summary(self, team_id: str):
        """Send daily team summary"""
        try:
            summary = await self._generate_daily_summary(team_id)
            
            await self.alert_service.send_alert(
                team_id=team_id,
                alert_type="DAILY_SUMMARY",
                message=summary,
                severity=AlertPriority.LOW,
                metadata={"summary_type": "daily", "team_id": team_id}
            )
            
            logger.info(f"✅ Daily summary sent for team {team_id}")
            
        except Exception as e:
            logger.error(f"Error sending daily summary: {e}")
    
    async def _generate_daily_summary(self, team_id: str) -> str:
        """Generate daily team summary"""
        return f"""
📊 *Daily Team Summary - {datetime.now().strftime('%Y-%m-%d')}*

*Team Health:* 78% ✅
*Workload Increase:* 12% 📈
*Stress Level:* 34% 😊
*Burnout Risk:* 22% 🟢

*Team Members (8/10 active):*
• 🏆 Top Performer: user_002
• 🤝 Need Support: user_001  
• ⚠️ Burnout Watch: user_005
• 📈 Improving: user_004

*Key Alerts Today:*
🚨 user_001 - Critical workload (92%)
🚨 user_003 - High burnout risk (82%)
⚠️ Team - 45% workload increase vs yesterday

*Recommendations:* 
🎯 Balance workload between user_001 and user_004
🎯 Implement focus time blocks
🎯 Encourage regular breaks

*Quote of the Day:* "Take care of your team, and they'll take care of your customers."

_Generated by Team Cognitive Load Monitor 🤖_
"""