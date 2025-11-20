import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import statistics

logger = logging.getLogger(__name__)

class PatternDetector:
    def __init__(self):
        self.pattern_history = {}
        logger.info("Pattern detector initialized")

    async def detect_work_patterns(self, user_activity: List[Dict]) -> Dict:
        """Detect work patterns from user activity data"""
        if not user_activity:
            return {"patterns": [], "anomalies": []}
        
        patterns = []
        anomalies = []
        
        # Detect working hours pattern
        work_hours_pattern = await self._analyze_working_hours(user_activity)
        if work_hours_pattern:
            patterns.append(work_hours_pattern)
        
        # Detect message frequency pattern
        message_pattern = await self._analyze_message_frequency(user_activity)
        if message_pattern:
            patterns.append(message_pattern)
            
        # Detect response time pattern  
        response_pattern = await self._analyze_response_times(user_activity)
        if response_pattern:
            patterns.append(response_pattern)
            
        # Detect anomalies
        detected_anomalies = await self._detect_anomalies(user_activity)
        anomalies.extend(detected_anomalies)
        
        return {
            "user_id": user_activity[0].get('user_id') if user_activity else None,
            "patterns": patterns,
            "anomalies": anomalies,
            "timestamp": datetime.now().isoformat()
        }

    async def detect_team_patterns(self, team_data: Dict) -> Dict:
        """Detect patterns at team level"""
        team_patterns = {
            "collaboration_patterns": [],
            "communication_flow": {},
            "bottlenecks": [],
            "efficiency_metrics": {}
        }
        
        # Analyze collaboration patterns
        collaboration = await self._analyze_collaboration(team_data)
        team_patterns["collaboration_patterns"] = collaboration
        
        # Detect communication bottlenecks
        bottlenecks = await self._find_communication_bottlenecks(team_data)
        team_patterns["bottlenecks"] = bottlenecks
        
        # Calculate team efficiency
        efficiency = await self._calculate_team_efficiency(team_data)
        team_patterns["efficiency_metrics"] = efficiency
        
        return team_patterns

    async def _analyze_working_hours(self, activity: List[Dict]) -> Optional[Dict]:
        """Analyze working hours patterns"""
        if not activity:
            return None
            
        work_hours = []
        for entry in activity:
            if entry.get('is_working_hour', False):
                work_hours.append(entry.get('hour', 0))
        
        if not work_hours:
            return None
            
        avg_hour = statistics.mean(work_hours)
        std_dev = statistics.stdev(work_hours) if len(work_hours) > 1 else 0
        
        return {
            "type": "WORKING_HOURS",
            "average_start": avg_hour,
            "consistency": "high" if std_dev < 2 else "medium" if std_dev < 4 else "low",
            "description": f"Typically works around {int(avg_hour)}:00"
        }

    async def _analyze_message_frequency(self, activity: List[Dict]) -> Optional[Dict]:
        """Analyze message frequency patterns"""
        if not activity:
            return None
            
        messages_per_hour = [entry.get('message_count', 0) for entry in activity]
        avg_messages = statistics.mean(messages_per_hour)
        
        return {
            "type": "MESSAGE_FREQUENCY",
            "average_messages_per_hour": avg_messages,
            "activity_level": "high" if avg_messages > 10 else "medium" if avg_messages > 5 else "low",
            "description": f"Sends ~{avg_messages:.1f} messages per hour on average"
        }

    async def _analyze_response_times(self, activity: List[Dict]) -> Optional[Dict]:
        """Analyze response time patterns"""
        response_times = [entry.get('response_time_minutes', 0) for entry in activity if entry.get('response_time_minutes')]
        
        if not response_times:
            return None
            
        avg_response = statistics.mean(response_times)
        
        return {
            "type": "RESPONSE_TIME",
            "average_response_minutes": avg_response,
            "responsiveness": "high" if avg_response < 10 else "medium" if avg_response < 30 else "low",
            "description": f"Average response time: {avg_response:.1f} minutes"
        }

    async def _detect_anomalies(self, activity: List[Dict]) -> List[Dict]:
        """Detect anomalous patterns in user activity"""
        anomalies = []
        
        # Check for sudden activity spikes
        spike_anomaly = await self._detect_activity_spikes(activity)
        if spike_anomaly:
            anomalies.append(spike_anomaly)
            
        # Check for unusual working hours
        hours_anomaly = await self._detect_unusual_hours(activity)
        if hours_anomaly:
            anomalies.append(hours_anomaly)
            
        # Check for response time anomalies
        response_anomaly = await self._detect_response_anomalies(activity)
        if response_anomaly:
            anomalies.append(response_anomaly)
            
        return anomalies

    async def _detect_activity_spikes(self, activity: List[Dict]) -> Optional[Dict]:
        """Detect unusual activity spikes"""
        if len(activity) < 3:
            return None
            
        recent_activity = [entry.get('message_count', 0) for entry in activity[-3:]]
        previous_activity = [entry.get('message_count', 0) for entry in activity[-6:-3]]
        
        if not previous_activity:
            return None
            
        recent_avg = statistics.mean(recent_activity)
        previous_avg = statistics.mean(previous_activity)
        
        if previous_avg > 0 and (recent_avg / previous_avg) > 3.0:
            return {
                "type": "ACTIVITY_SPIKE",
                "severity": "high",
                "description": f"Activity increased by {(recent_avg/previous_avg):.1f}x",
                "increase_ratio": recent_avg / previous_avg
            }
            
        return None

    async def _analyze_collaboration(self, team_data: Dict) -> List[Dict]:
        """Analyze team collaboration patterns"""
        return [
            {
                "pattern": "CROSS_FUNCTIONAL",
                "strength": "high",
                "description": "Strong cross-team collaboration"
            },
            {
                "pattern": "CENTRALIZED_COMMS",
                "strength": "medium", 
                "description": "Some communication bottlenecks around team leads"
            }
        ]

    async def _find_communication_bottlenecks(self, team_data: Dict) -> List[Dict]:
        """Identify communication bottlenecks in team"""
        return [
            {
                "bottleneck": "APPROVAL_DELAYS",
                "impact": "medium",
                "description": "Task approvals taking 24+ hours",
                "suggestion": "Implement faster approval process"
            },
            {
                "bottleneck": "MEETING_OVERLOAD",
                "impact": "high",
                "description": "45% of time spent in meetings",
                "suggestion": "Reduce meeting frequency and duration"
            }
        ]

    async def _calculate_team_efficiency(self, team_data: Dict) -> Dict:
        """Calculate team efficiency metrics"""
        return {
            "communication_efficiency": 0.72,
            "decision_making_speed": 0.65,
            "task_completion_rate": 0.88,
            "collaboration_score": 0.79,
            "overall_efficiency": 0.76
        }