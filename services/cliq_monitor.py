import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import aiohttp

from models.user import User
from models.team import Team
from models.metrics import CognitiveMetrics

logger = logging.getLogger(__name__)

class CliqMonitor:
    def __init__(self, alert_service, stress_detector, workload_analyzer, message_analyzer):
        self.alert_service = alert_service
        self.stress_detector = stress_detector
        self.workload_analyzer = workload_analyzer
        self.message_analyzer = message_analyzer
        self.is_running = False
        self.monitoring_task = None
        
        # In-memory storage (replace with database in production)
        self.user_metrics: Dict[str, CognitiveMetrics] = {}
        self.team_metrics: Dict[str, Dict] = {}
        self.message_history: Dict[str, List] = {}
        self.activity_data: Dict[str, List] = {}

    async def start_monitoring(self):
        """Start monitoring Cliq for cognitive load indicators"""
        self.is_running = True
        self.monitoring_task = asyncio.create_task(self._monitoring_loop())
        logger.info("Cliq monitoring started")

    async def stop_monitoring(self):
        """Stop monitoring"""
        self.is_running = False
        if self.monitoring_task:
            self.monitoring_task.cancel()
        logger.info("Cliq monitoring stopped")

    async def _monitoring_loop(self):
        """Main monitoring loop"""
        while self.is_running:
            try:
                # Monitor various aspects
                await self._analyze_team_activity()
                await self._check_message_density()
                await self._detect_late_night_work()
                await self._analyze_response_patterns()
                await self._update_cognitive_metrics()
                
                await asyncio.sleep(60)  # Check every minute
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(30)

    async def _analyze_team_activity(self):
        """Analyze overall team activity patterns"""
        # Simulate analyzing team channels
        team_activity = {
            "dev_team": {
                "message_count": 145,
                "active_members": 8,
                "response_time_avg": 12.5,
                "stress_indicators": 3
            },
            "design_team": {
                "message_count": 89,
                "active_members": 5, 
                "response_time_avg": 25.3,
                "stress_indicators": 1
            }
        }
        
        for team_id, activity in team_activity.items():
            # Check for abnormal patterns
            if activity['message_count'] > 100 and activity['stress_indicators'] > 2:
                await self.alert_service.send_alert(
                    team_id=team_id,
                    alert_type="HIGH_STRESS_ACTIVITY",
                    message=f"High-stress activity detected in {team_id}",
                    severity="MEDIUM"
                )

    async def _check_message_density(self):
        """Check message density across channels"""
        channel_density = {
            "general": {"current": 45, "previous": 32, "trend": "up"},
            "urgent": {"current": 23, "previous": 8, "trend": "up"},
            "random": {"current": 12, "previous": 15, "trend": "down"}
        }
        
        for channel, density in channel_density.items():
            increase_ratio = density['current'] / density['previous'] if density['previous'] > 0 else 1
            if increase_ratio > 2.0:  # 100% increase
                await self.alert_service.send_alert(
                    channel_id=channel,
                    alert_type="MESSAGE_DENSITY_SPIKE",
                    message=f"Message density in #{channel} increased by {increase_ratio:.1f}x",
                    severity="LOW"
                )

    async def _detect_late_night_work(self):
        """Detect late-night work patterns"""
        late_night_workers = [
            {"user_id": "user_001", "late_night_messages": 8, "last_message": "02:30"},
            {"user_id": "user_005", "late_night_messages": 5, "last_message": "01:15"}
        ]
        
        for worker in late_night_workers:
            if worker['late_night_messages'] >= 5:
                await self.alert_service.send_alert(
                    user_id=worker['user_id'],
                    alert_type="LATE_NIGHT_WORK",
                    message=f"Late-night work detected: {worker['late_night_messages']} messages after 10 PM",
                    severity="MEDIUM"
                )

    async def _analyze_response_patterns(self):
        """Analyze response time patterns for stress indicators"""
        response_data = {
            "user_001": {"avg_response_time": 5.2, "trend": "decreasing"},
            "user_002": {"avg_response_time": 45.8, "trend": "increasing"},
            "user_003": {"avg_response_time": 120.5, "trend": "increasing"}
        }
        
        for user_id, data in response_data.items():
            if data['avg_response_time'] > 60 and data['trend'] == "increasing":
                await self.alert_service.send_alert(
                    user_id=user_id,
                    alert_type="SLOW_RESPONSE",
                    message=f"Response time increasing: {data['avg_response_time']} minutes average",
                    severity="LOW"
                )

    async def _update_cognitive_metrics(self):
        """Update cognitive load metrics for teams and users"""
        # Simulate metric updates
        for team_id in ["dev_team", "design_team", "management_team"]:
            self.team_metrics[team_id] = {
                "team_id": team_id,
                "cognitive_load": 0.65,
                "stress_level": 0.42,
                "workload_score": 0.78,
                "burnout_risk": 0.31,
                "work_imbalance": 0.55,
                "last_updated": datetime.now().isoformat()
            }

    async def get_team_metrics(self, team_id: str) -> Dict:
        """Get cognitive metrics for a specific team"""
        return self.team_metrics.get(team_id, {
            "team_id": team_id,
            "cognitive_load": 0.0,
            "stress_level": 0.0,
            "workload_score": 0.0,
            "burnout_risk": 0.0,
            "work_imbalance": 0.0,
            "last_updated": datetime.now().isoformat()
        })

    async def get_user_activity_report(self, user_id: str) -> Dict:
        """Get detailed activity report for a user"""
        return {
            "user_id": user_id,
            "daily_messages": 23,
            "avg_response_time": 12.5,
            "active_hours": 9.2,
            "late_night_activity": 3,
            "weekend_work": 4.5,
            "stress_score": 0.68,
            "recommendations": ["Take more breaks", "Delegate some tasks"]
        }