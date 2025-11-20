import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional
from enum import Enum

logger = logging.getLogger(__name__)

class AlertSeverity(Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM" 
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class AlertType(Enum):
    HIGH_STRESS = "HIGH_STRESS"
    WORKLOAD_OVERLOAD = "WORKLOAD_OVERLOAD"
    LATE_NIGHT_WORK = "LATE_NIGHT_WORK"
    HIGH_ACTIVITY_SPIKE = "HIGH_ACTIVITY_SPIKE"
    WORK_IMBALANCE = "WORK_IMBALANCE"
    BURNOUT_RISK = "BURNOUT_RISK"
    SLOW_RESPONSE = "SLOW_RESPONSE"
    MESSAGE_DENSITY_SPIKE = "MESSAGE_DENSITY_SPIKE"
    DAILY_SUMMARY = "DAILY_SUMMARY"

class AlertService:
    def __init__(self):
        self.alerts: Dict[str, List] = {}
        self.alert_handlers = []

    async def send_alert(self, 
                        user_id: Optional[str] = None,
                        team_id: Optional[str] = None,
                        channel_id: Optional[str] = None,
                        alert_type: AlertType = AlertType.HIGH_STRESS,
                        message: str = "",
                        severity: AlertSeverity = AlertSeverity.MEDIUM,
                        metadata: Optional[Dict] = None):
        """Send an alert to appropriate channels"""
        
        alert_data = {
            "id": f"alert_{datetime.now().timestamp()}",
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id,
            "team_id": team_id,
            "channel_id": channel_id,
            "type": alert_type.value,
            "severity": severity.value,
            "message": message,
            "metadata": metadata or {},
            "resolved": False
        }

        # Store alert
        key = team_id or channel_id or "global"
        if key not in self.alerts:
            self.alerts[key] = []
        self.alerts[key].append(alert_data)

        # Keep only last 100 alerts per key
        self.alerts[key] = self.alerts[key][-100:]

        # Log the alert
        logger.info(f"🚨 ALERT: {alert_data}")

        # In production, this would send to Cliq channels
        await self._send_to_cliq(alert_data)

    async def _send_to_cliq(self, alert_data: Dict):
        """Send alert to Zoho Cliq"""
        try:
            message = self._format_alert_message(alert_data)
            
            # Determine where to send the alert
            if alert_data.get('channel_id'):
                # Send to specific channel
                await self._send_channel_message(alert_data['channel_id'], message)
            elif alert_data.get('team_id'):
                # Send to team channel or manager
                await self._send_team_alert(alert_data['team_id'], message)
            elif alert_data.get('user_id'):
                # Send DM to user
                await self._send_direct_message(alert_data['user_id'], message)
            else:
                # Send to general alerts channel
                await self._send_channel_message("alerts", message)
                
        except Exception as e:
            logger.error(f"Error sending alert to Cliq: {e}")

    def _format_alert_message(self, alert_data: Dict) -> str:
        """Format alert message for Cliq"""
        severity_emoji = {
            "LOW": "ℹ️",
            "MEDIUM": "⚠️", 
            "HIGH": "🚨",
            "CRITICAL": "🔥"
        }
        
        emoji = severity_emoji.get(alert_data['severity'], "⚠️")
        
        message = f"""{emoji} *Cognitive Load Alert* {emoji}

*Type:* {alert_data['type'].replace('_', ' ').title()}
*Severity:* {alert_data['severity']}
*Message:* {alert_data['message']}
*Time:* {datetime.fromisoformat(alert_data['timestamp']).strftime('%Y-%m-%d %H:%M:%S')}"""

        if alert_data.get('metadata'):
            message += f"\n*Details:* {alert_data['metadata']}"
            
        return message

    async def _send_channel_message(self, channel_id: str, message: str):
        """Send message to Cliq channel"""
        # Integration with Zoho Cliq API would go here
        logger.info(f"📤 Sending to channel {channel_id}: {message}")

    async def _send_team_alert(self, team_id: str, message: str):
        """Send alert to team"""
        # Integration with Zoho Cliq API would go here
        logger.info(f"📤 Sending to team {team_id}: {message}")

    async def _send_direct_message(self, user_id: str, message: str):
        """Send direct message to user"""
        # Integration with Zoho Cliq API would go here
        logger.info(f"📤 Sending DM to user {user_id}: {message}")

    async def get_team_alerts(self, team_id: str, limit: int = 50) -> List[Dict]:
        """Get recent alerts for a team"""
        team_alerts = self.alerts.get(team_id, [])
        channel_alerts = [alert for alerts in self.alerts.values() 
                         for alert in alerts if alert.get('team_id') == team_id]
        
        all_alerts = team_alerts + channel_alerts
        all_alerts.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return all_alerts[:limit]

    async def get_recent_alerts(self, limit: int = 10) -> List[Dict]:
        """Get most recent alerts across all teams"""
        all_alerts = []
        for alerts in self.alerts.values():
            all_alerts.extend(alerts)
        
        all_alerts.sort(key=lambda x: x['timestamp'], reverse=True)
        return all_alerts[:limit]

    async def resolve_alert(self, alert_id: str):
        """Mark an alert as resolved"""
        for alerts in self.alerts.values():
            for alert in alerts:
                if alert['id'] == alert_id:
                    alert['resolved'] = True
                    alert['resolved_at'] = datetime.now().isoformat()
                    logger.info(f"✅ Alert {alert_id} resolved")
                    break