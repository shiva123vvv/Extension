import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import numpy as np

logger = logging.getLogger(__name__)

class StressDetector:
    def __init__(self):
        self.stress_indicators = {
            "message_frequency": 0.3,
            "response_time": 0.25,
            "working_hours": 0.2,
            "message_tone": 0.15,
            "weekend_activity": 0.1
        }
        logger.info("Stress detection model initialized")

    async def detect_stress_indicators(self, user_data: Dict) -> Dict:
        """Detect stress indicators from user activity data"""
        stress_score = 0.0
        indicators = []
        
        # Analyze message frequency
        if user_data.get('messages_per_hour', 0) > 15:
            stress_score += 0.3
            indicators.append("high_message_frequency")
        
        # Analyze response time
        if user_data.get('avg_response_time_minutes', 0) < 2:
            stress_score += 0.25
            indicators.append("rapid_responses")
        
        # Analyze working hours
        if user_data.get('daily_hours', 0) > 10:
            stress_score += 0.2
            indicators.append("extended_hours")
        
        # Analyze late night work
        if user_data.get('late_night_messages', 0) > 3:
            stress_score += 0.15
            indicators.append("late_night_work")
            
        # Analyze weekend activity
        if user_data.get('weekend_hours', 0) > 4:
            stress_score += 0.1
            indicators.append("weekend_work")
        
        return {
            "stress_level": min(stress_score, 1.0),
            "indicators": indicators,
            "confidence": 0.85,
            "timestamp": datetime.now().isoformat()
        }

    async def analyze_message_stress(self, message_text: str) -> float:
        """Analyze message text for stress indicators"""
        stress_keywords = {
            "urgent": 0.3, "asap": 0.4, "emergency": 0.5, "critical": 0.4,
            "deadline": 0.3, "pressure": 0.4, "overwhelmed": 0.6, "stressed": 0.7,
            "help": 0.3, "now": 0.2, "immediately": 0.3
        }
        
        text_lower = message_text.lower()
        stress_score = 0.0
        
        for keyword, weight in stress_keywords.items():
            if keyword in text_lower:
                stress_score += weight
        
        # Cap at 1.0 and apply minimum threshold
        return min(stress_score, 1.0)

    async def get_team_stress_levels(self) -> Dict[str, Dict]:
        """Get stress levels for all team members"""
        # Simulated data - in production, this would come from actual monitoring
        return {
            "user_001": {
                "stress_level": 0.78,
                "indicators": ["late_night_work", "high_message_frequency"],
                "trend": "increasing"
            },
            "user_002": {
                "stress_level": 0.45,
                "indicators": ["normal_pattern"],
                "trend": "stable"
            },
            "user_003": {
                "stress_level": 0.82,
                "indicators": ["rapid_responses", "extended_hours", "weekend_work"],
                "trend": "increasing"
            },
            "user_004": {
                "stress_level": 0.32,
                "indicators": ["normal_pattern"],
                "trend": "stable"
            }
        }

    async def get_team_burnout_risk(self) -> Dict[str, Dict]:
        """Calculate burnout risk for team members"""
        return {
            "user_001": {
                "burnout_risk": 0.75,
                "factors": ["65_hours_week", "consistent_late_nights"],
                "recommendations": ["Take time off", "Reduce workload"]
            },
            "user_002": {
                "burnout_risk": 0.35,
                "factors": ["balanced_schedule"],
                "recommendations": ["Maintain current pace"]
            },
            "user_003": {
                "burnout_risk": 0.82,
                "factors": ["72_hours_week", "weekend_work", "high_stress"],
                "recommendations": ["Immediate break needed", "Workload redistribution"]
            }
        }

    async def calculate_burnout_risk(self, user_data: Dict) -> float:
        """Calculate comprehensive burnout risk score"""
        risk_factors = []
        
        # Work hour analysis
        weekly_hours = user_data.get('weekly_hours', 0)
        if weekly_hours > 60:
            risk_factors.append(0.9)
        elif weekly_hours > 50:
            risk_factors.append(0.7)
        elif weekly_hours > 40:
            risk_factors.append(0.4)
        
        # Weekend work analysis
        weekend_ratio = user_data.get('weekend_work_ratio', 0)
        if weekend_ratio > 0.5:
            risk_factors.append(0.8)
        elif weekend_ratio > 0.3:
            risk_factors.append(0.5)
            
        # Response time analysis (too fast can indicate stress)
        avg_response = user_data.get('avg_response_time_minutes', 0)
        if avg_response < 5:
            risk_factors.append(0.6)
            
        # Late night work
        if user_data.get('late_night_sessions', 0) > 3:
            risk_factors.append(0.7)
            
        if not risk_factors:
            return 0.1
            
        return sum(risk_factors) / len(risk_factors)

    def _is_late_night(self, timestamp: str) -> bool:
        """Check if timestamp is during late night hours"""
        try:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            return 22 <= dt.hour or dt.hour <= 5  # 10 PM to 5 AM
        except:
            return False