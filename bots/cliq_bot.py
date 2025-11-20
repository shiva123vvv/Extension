import logging
import asyncio
from datetime import datetime
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class CliqBot:
    def __init__(self, alert_service, workload_analyzer, stress_detector):
        self.alert_service = alert_service
        self.workload_analyzer = workload_analyzer
        self.stress_detector = stress_detector
        self.command_handlers = {
            "help": self._handle_help,
            "status": self._handle_status,
            "alerts": self._handle_alerts,
            "workload": self._handle_workload,
            "stress": self._handle_stress,
            "burnout": self._handle_burnout
        }

    async def handle_webhook(self, data: Dict):
        """Handle incoming webhooks from Zoho Cliq"""
        try:
            event_type = data.get('type', '')
            
            if event_type == 'message_created':
                await self._handle_message(data)
            elif event_type == 'bot_mention':
                await self._handle_mention(data)
            elif event_type == 'interactive_message':
                await self._handle_interaction(data)
                
        except Exception as e:
            logger.error(f"Error handling webhook: {e}")

    async def _handle_message(self, data: Dict):
        """Handle new message events"""
        message = data.get('message', {})
        user_id = message.get('user_id')
        channel_id = message.get('channel_id')
        text = message.get('text', '').lower()

        # Analyze message for stress indicators
        stress_level = await self.stress_detector.analyze_message_stress(text)
        
        if stress_level > 0.7:
            await self.alert_service.send_alert(
                user_id=user_id,
                alert_type="HIGH_STRESS_MESSAGE",
                message=f"High stress detected in message from user {user_id}",
                severity="MEDIUM"
            )

    async def _handle_mention(self, data: Dict):
        """Handle bot mention events"""
        message = data.get('message', {})
        text = message.get('text', '')
        channel_id = message.get('channel_id')
        user_id = message.get('user_id')

        # Extract command
        command = self._extract_command(text)
        
        if command in self.command_handlers:
            await self.command_handlers[command](channel_id, user_id, text)
        else:
            await self._send_message(channel_id, "Unknown command. Type `help` for available commands.")

    async def _handle_interaction(self, data: Dict):
        """Handle interactive message actions"""
        # Handle button clicks, dropdown selections, etc.
        pass

    def _extract_command(self, text: str) -> str:
        """Extract command from bot mention text"""
        words = text.lower().split()
        for word in words:
            if word in self.command_handlers:
                return word
        return "help"

    async def _handle_help(self, channel_id: str, user_id: str, text: str):
        """Handle help command"""
        help_text = """
🤖 *Team Cognitive Load Monitor Bot*

*Available Commands:*
• `help` - Show this help message
• `status` - Show team health status
• `alerts` - Show recent alerts
• `workload` - Show workload analysis
• `stress` - Show stress levels
• `burnout` - Show burnout risk assessment

*Examples:*
@bot workload
@bot alerts
@bot status
"""
        await self._send_message(channel_id, help_text)

    async def _handle_status(self, channel_id: str, user_id: str, text: str):
        """Handle status command"""
        try:
            team_health = await self.workload_analyzer.get_team_health_status()
            
            status_message = f"""
🏥 *Team Health Status*

*Overall Health:* {team_health.get('overall_score', 0)*100:.1f}%
*Stress Level:* {team_health.get('avg_stress', 0)*100:.1f}%
*Workload:* {team_health.get('avg_workload', 0)*100:.1f}%
*Burnout Risk:* {team_health.get('burnout_risk', 0)*100:.1f}%

*Active Alerts:* {team_health.get('active_alerts', 0)}
*Recommendations:* {team_health.get('recommendations', 'All systems normal')}
"""
            await self._send_message(channel_id, status_message)
            
        except Exception as e:
            logger.error(f"Error handling status command: {e}")
            await self._send_message(channel_id, "Error getting status. Please try again.")

    async def _handle_alerts(self, channel_id: str, user_id: str, text: str):
        """Handle alerts command"""
        try:
            alerts = await self.alert_service.get_recent_alerts(limit=5)
            
            if not alerts:
                await self._send_message(channel_id, "✅ No active alerts. Team is healthy!")
                return

            alerts_text = "🚨 *Recent Alerts*\n\n"
            for alert in alerts:
                alerts_text += f"• {alert['message']} ({alert['severity']})\n"
                
            await self._send_message(channel_id, alerts_text)
            
        except Exception as e:
            logger.error(f"Error handling alerts command: {e}")
            await self._send_message(channel_id, "Error retrieving alerts.")

    async def _handle_workload(self, channel_id: str, user_id: str, text: str):
        """Handle workload command"""
        try:
            workload_data = await self.workload_analyzer.get_team_workload_distribution()
            
            workload_text = "📊 *Team Workload Distribution*\n\n"
            for user_id, data in workload_data.items():
                workload_level = data.get('workload_level', 'UNKNOWN')
                emoji = self._get_workload_emoji(workload_level)
                workload_text += f"• {emoji} {user_id}: {workload_level}\n"
                
            await self._send_message(channel_id, workload_text)
            
        except Exception as e:
            logger.error(f"Error handling workload command: {e}")
            await self._send_message(channel_id, "Error analyzing workload.")

    async def _handle_stress(self, channel_id: str, user_id: str, text: str):
        """Handle stress command"""
        try:
            stress_data = await self.stress_detector.get_team_stress_levels()
            
            stress_text = "😰 *Team Stress Levels*\n\n"
            for user_id, data in stress_data.items():
                stress_level = data.get('stress_level', 0)
                level_emoji = "🔴" if stress_level > 0.7 else "🟡" if stress_level > 0.4 else "🟢"
                stress_text += f"• {level_emoji} {user_id}: {stress_level*100:.1f}%\n"
                
            await self._send_message(channel_id, stress_text)
            
        except Exception as e:
            logger.error(f"Error handling stress command: {e}")
            await self._send_message(channel_id, "Error analyzing stress levels.")

    async def _handle_burnout(self, channel_id: str, user_id: str, text: str):
        """Handle burnout command"""
        try:
            burnout_data = await self.stress_detector.get_team_burnout_risk()
            
            burnout_text = "🔥 *Team Burnout Risk Assessment*\n\n"
            for user_id, data in burnout_data.items():
                risk_level = data.get('burnout_risk', 0)
                if risk_level > 0.7:
                    burnout_text += f"• 🔥 {user_id}: HIGH RISK ({risk_level*100:.1f}%)\n"
                elif risk_level > 0.4:
                    burnout_text += f"• ⚠️ {user_id}: Medium Risk ({risk_level*100:.1f}%)\n"
                else:
                    burnout_text += f"• ✅ {user_id}: Low Risk ({risk_level*100:.1f}%)\n"
                    
            await self._send_message(channel_id, burnout_text)
            
        except Exception as e:
            logger.error(f"Error handling burnout command: {e}")
            await self._send_message(channel_id, "Error analyzing burnout risk.")

    def _get_workload_emoji(self, workload_level: str) -> str:
        """Get emoji for workload level"""
        emoji_map = {
            "CRITICAL": "🔴",
            "HIGH": "🟠", 
            "MEDIUM": "🟡",
            "LOW": "🟢",
            "UNKNOWN": "⚪"
        }
        return emoji_map.get(workload_level, "⚪")

    async def _send_message(self, channel_id: str, message: str):
        """Send message to Cliq channel"""
        # This would integrate with Zoho Cliq API
        logger.info(f"Would send to channel {channel_id}: {message}")
        
        # Simulate API call
        # await self._make_cliq_api_call("messages.send", {
        #     "channel_id": channel_id,
        #     "text": message
        # })