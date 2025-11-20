import logging
import asyncio
from datetime import datetime
from typing import Dict, List, Optional
import re

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
            "burnout": self._handle_burnout,
            "report": self._handle_report
        }

    async def handle_webhook(self, data: Dict):
        """Handle incoming webhooks from Zoho Cliq"""
        try:
            event_type = data.get('type', '')
            logger.info(f"Processing Cliq webhook type: {event_type}")
            
            if event_type == 'message_created':
                await self._handle_message(data)
            elif event_type == 'bot_mention':
                await self._handle_mention(data)
            elif event_type == 'interactive_message':
                await self._handle_interaction(data)
            else:
                logger.warning(f"Unhandled webhook type: {event_type}")
                
        except Exception as e:
            logger.error(f"Error handling webhook: {e}")

    async def _handle_message(self, data: Dict):
        """Handle new message events"""
        try:
            message = data.get('message', {})
            user_id = message.get('user_id')
            channel_id = message.get('channel_id')
            text = message.get('text', '').lower()

            # Analyze message for stress indicators
            if text:
                stress_level = await self.stress_detector.analyze_message_stress(text)
                
                if stress_level > 0.7:
                    await self.alert_service.send_alert(
                        user_id=user_id,
                        alert_type="HIGH_STRESS_MESSAGE",
                        message=f"High stress detected in message from user {user_id}",
                        severity="MEDIUM",
                        metadata={"stress_level": stress_level, "message_preview": text[:100]}
                    )
                    
        except Exception as e:
            logger.error(f"Error handling message: {e}")

    async def _handle_mention(self, data: Dict):
        """Handle bot mention events"""
        try:
            message = data.get('message', {})
            text = message.get('text', '')
            channel_id = message.get('channel_id')
            user_id = message.get('user_id')

            logger.info(f"Bot mentioned by {user_id} in channel {channel_id}")

            # Extract command
            command = self._extract_command(text)
            
            if command in self.command_handlers:
                await self.command_handlers[command](channel_id, user_id, text)
            else:
                await self._send_message(channel_id, "❓ Unknown command. Type `@bot help` for available commands.")
                
        except Exception as e:
            logger.error(f"Error handling mention: {e}")
            await self._send_message(channel_id, "😵 Error processing command. Please try again.")

    async def _handle_interaction(self, data: Dict):
        """Handle interactive message actions"""
        try:
            # Handle button clicks, dropdown selections, etc.
            interaction = data.get('interaction', {})
            action = interaction.get('action')
            user_id = interaction.get('user_id')
            
            logger.info(f"Interaction received: {action} from {user_id}")
            
        except Exception as e:
            logger.error(f"Error handling interaction: {e}")

    def _extract_command(self, text: str) -> str:
        """Extract command from bot mention text"""
        # Remove bot mention and get first word as command
        words = re.sub(r'<@.*?>', '', text).strip().lower().split()
        if words and words[0] in self.command_handlers:
            return words[0]
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
• `report` - Generate team health report

*Examples:*
@bot workload
@bot alerts
@bot status team_alpha

*What I Monitor:*
✅ Stress levels
✅ Workload distribution  
✅ Burnout risk
✅ Activity patterns
✅ Work-life balance
"""
        await self._send_message(channel_id, help_text)

    async def _handle_status(self, channel_id: str, user_id: str, text: str):
        """Handle status command"""
        try:
            # Extract team ID if provided
            team_id = self._extract_team_id(text) or "default_team"
            
            team_health = {
                "overall_score": 0.72,
                "avg_stress": 0.45,
                "avg_workload": 0.68,
                "burnout_risk": 0.38,
                "active_alerts": 3,
                "recommendations": ["Balance workload between user_001 and user_004"]
            }
            
            status_message = f"""
🏥 *Team Health Status - {team_id}*

*Overall Health:* {team_health['overall_score']*100:.1f}% ✅
*Stress Level:* {team_health['avg_stress']*100:.1f}% 🟡
*Workload:* {team_health['avg_workload']*100:.1f}% 🟠
*Burnout Risk:* {team_health['burnout_risk']*100:.1f}% 🟢

*Active Alerts:* {team_health['active_alerts']} 🚨
*Recommendations:* {team_health['recommendations'][0]}

_Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M')}_
"""
            await self._send_message(channel_id, status_message)
            
        except Exception as e:
            logger.error(f"Error handling status command: {e}")
            await self._send_message(channel_id, "😵 Error getting status. Please try again.")

    async def _handle_alerts(self, channel_id: str, user_id: str, text: str):
        """Handle alerts command"""
        try:
            alerts = [
                {"message": "User_001 is overloaded today. Reassign tasks.", "severity": "HIGH"},
                {"message": "Team workload increased 45% compared to yesterday.", "severity": "MEDIUM"},
                {"message": "3 members showing signs of burnout (late-night messages).", "severity": "HIGH"}
            ]
            
            if not alerts:
                await self._send_message(channel_id, "✅ No active alerts. Team is healthy!")
                return

            alerts_text = "🚨 *Recent Alerts*\n\n"
            for i, alert in enumerate(alerts, 1):
                severity_emoji = "🔴" if alert['severity'] == "HIGH" else "🟡" if alert['severity'] == "MEDIUM" else "🟢"
                alerts_text += f"{i}. {severity_emoji} {alert['message']}\n"
                
            alerts_text += f"\n_Showing {len(alerts)} most recent alerts_"
            await self._send_message(channel_id, alerts_text)
            
        except Exception as e:
            logger.error(f"Error handling alerts command: {e}")
            await self._send_message(channel_id, "😵 Error retrieving alerts.")

    async def _handle_workload(self, channel_id: str, user_id: str, text: str):
        """Handle workload command"""
        try:
            workload_data = {
                "user_001": {"workload_level": "HIGH", "score": 0.85},
                "user_002": {"workload_level": "LOW", "score": 0.35},
                "user_003": {"workload_level": "CRITICAL", "score": 0.92},
                "user_004": {"workload_level": "MEDIUM", "score": 0.55}
            }
            
            workload_text = "📊 *Team Workload Distribution*\n\n"
            for user_id, data in workload_data.items():
                emoji = self._get_workload_emoji(data['workload_level'])
                workload_text += f"• {emoji} {user_id}: {data['workload_level']} ({data['score']*100:.1f}%)\n"
                
            workload_text += "\n💡 *Recommendation:* Balance workload between user_001 and user_002"
            await self._send_message(channel_id, workload_text)
            
        except Exception as e:
            logger.error(f"Error handling workload command: {e}")
            await self._send_message(channel_id, "😵 Error analyzing workload.")

    async def _handle_stress(self, channel_id: str, user_id: str, text: str):
        """Handle stress command"""
        try:
            stress_data = {
                "user_001": {"stress_level": 0.78, "trend": "increasing"},
                "user_002": {"stress_level": 0.45, "trend": "stable"},
                "user_003": {"stress_level": 0.82, "trend": "increasing"},
                "user_004": {"stress_level": 0.32, "trend": "stable"}
            }
            
            stress_text = "😰 *Team Stress Levels*\n\n"
            for user_id, data in stress_data.items():
                level = data['stress_level']
                level_emoji = "🔴" if level > 0.7 else "🟡" if level > 0.4 else "🟢"
                trend_emoji = "📈" if data['trend'] == "increasing" else "➡️" if data['trend'] == "stable" else "📉"
                stress_text += f"• {level_emoji} {user_id}: {level*100:.1f}% {trend_emoji}\n"
                
            stress_text += "\n⚠️ *High stress detected in 2 members*"
            await self._send_message(channel_id, stress_text)
            
        except Exception as e:
            logger.error(f"Error handling stress command: {e}")
            await self._send_message(channel_id, "😵 Error analyzing stress levels.")

    async def _handle_burnout(self, channel_id: str, user_id: str, text: str):
        """Handle burnout command"""
        try:
            burnout_data = {
                "user_001": {"burnout_risk": 0.75, "hours_worked": 65},
                "user_002": {"burnout_risk": 0.35, "hours_worked": 42},
                "user_003": {"burnout_risk": 0.82, "hours_worked": 72},
                "user_004": {"burnout_risk": 0.28, "hours_worked": 38}
            }
            
            burnout_text = "🔥 *Team Burnout Risk Assessment*\n\n"
            for user_id, data in burnout_data.items():
                risk = data['burnout_risk']
                if risk > 0.7:
                    burnout_text += f"• 🔥 {user_id}: HIGH RISK ({risk*100:.1f}%) - {data['hours_worked']}h/week\n"
                elif risk > 0.4:
                    burnout_text += f"• ⚠️ {user_id}: Medium Risk ({risk*100:.1f}%) - {data['hours_worked']}h/week\n"
                else:
                    burnout_text += f"• ✅ {user_id}: Low Risk ({risk*100:.1f}%) - {data['hours_worked']}h/week\n"
                    
            burnout_text += "\n🚨 *2 members at high burnout risk*"
            await self._send_message(channel_id, burnout_text)
            
        except Exception as e:
            logger.error(f"Error handling burnout command: {e}")
            await self._send_message(channel_id, "😵 Error analyzing burnout risk.")

    async def _handle_report(self, channel_id: str, user_id: str, text: str):
        """Handle report command"""
        try:
            report_text = """
📈 *Team Health Report - Weekly Summary*

*Overall Score:* 72/100 ✅
*Trend:* Improving 📈

*Key Metrics:*
• Workload Balance: 65/100 🟡
• Stress Levels: 58/100 🟢  
• Burnout Risk: 42/100 🟢
• Collaboration: 78/100 ✅

*Top Concerns:*
1. User_001 - Critical workload (92%)
2. User_003 - High burnout risk (82%)
3. Team - 45% workload increase

*Recommendations:*
🎯 Redistribute tasks from User_001 to User_002
🎯 Implement no-meeting Wednesdays
🎯 Encourage time off for high-risk members

_Report generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}_
""".format(datetime=datetime)
            
            await self._send_message(channel_id, report_text)
            
        except Exception as e:
            logger.error(f"Error handling report command: {e}")
            await self._send_message(channel_id, "😵 Error generating report.")

    def _extract_team_id(self, text: str) -> Optional[str]:
        """Extract team ID from command text"""
        words = text.lower().split()
        for i, word in enumerate(words):
            if word in ["team", "for"] and i + 1 < len(words):
                return words[i + 1]
        return None

    def _get_workload_emoji(self, workload_level: str) -> str:
        """Get emoji for workload level"""
        emoji_map = {
            "CRITICAL": "🔴",
            "HIGH": "🟠", 
            "MEDIUM": "🟡",
            "LOW": "🟢"
        }
        return emoji_map.get(workload_level, "⚪")

    async def _send_message(self, channel_id: str, message: str):
        """Send message to Cliq channel"""
        # In production, this would integrate with Zoho Cliq API
        logger.info(f"📤 Would send to channel {channel_id}:\n{message}")
        
        # Simulate API call to Zoho Cliq
        # Example implementation:
        # try:
        #     async with aiohttp.ClientSession() as session:
        #         data = {
        #             "text": message,
        #             "broadcast": True,
        #             "channel_id": channel_id
        #         }
        #         headers = {
        #             "Authorization": f"Bearer {settings.CLIQ_BOT_TOKEN}",
        #             "Content-Type": "application/json"
        #         }
        #         async with session.post(
        #             f"{settings.CLIQ_API_BASE}/channels/message",
        #             json=data,
        #             headers=headers
        #         ) as response:
        #             if response.status == 200:
        #                 logger.info(f"✅ Message sent to channel {channel_id}")
        #             else:
        #                 logger.error(f"❌ Failed to send message: {response.status}")
        # except Exception as e:
        #     logger.error(f"Error sending message to Cliq: {e}")