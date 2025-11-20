import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from enum import Enum

logger = logging.getLogger(__name__)

class WorkloadLevel(Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class WorkloadAnalyzer:
    def __init__(self):
        self.workload_thresholds = {
            WorkloadLevel.LOW: 0.3,
            WorkloadLevel.MEDIUM: 0.6,
            WorkloadLevel.HIGH: 0.8,
            WorkloadLevel.CRITICAL: 0.9
        }
        logger.info("Workload analyzer initialized")

    async def analyze_workload(self, user_data: Dict) -> Dict:
        """Analyze workload patterns for a user"""
        workload_score = 0.0
        factors = []
        
        # Meeting density analysis
        meeting_hours = user_data.get('meeting_hours_per_day', 0)
        if meeting_hours > 6:
            workload_score += 0.4
            factors.append("high_meeting_density")
        elif meeting_hours > 4:
            workload_score += 0.25
            factors.append("moderate_meeting_density")
        
        # Task load analysis
        active_tasks = user_data.get('active_tasks', 0)
        if active_tasks > 10:
            workload_score += 0.3
            factors.append("high_task_volume")
        elif active_tasks > 5:
            workload_score += 0.15
            factors.append("moderate_task_volume")
        
        # Deadline pressure
        upcoming_deadlines = user_data.get('upcoming_deadlines', 0)
        if upcoming_deadlines > 3:
            workload_score += 0.2
            factors.append("multiple_deadlines")
        
        # Context switching
        if user_data.get('context_switches_per_hour', 0) > 8:
            workload_score += 0.1
            factors.append("high_context_switching")
            
        workload_level = self._get_workload_level(min(workload_score, 1.0))
        
        return {
            "workload_score": workload_score,
            "workload_level": workload_level.value,
            "factors": factors,
            "recommendations": self._generate_recommendations(factors, workload_level),
            "timestamp": datetime.now().isoformat()
        }

    async def get_team_workload_distribution(self) -> Dict[str, Dict]:
        """Get workload distribution across team members"""
        return {
            "user_001": {
                "workload_score": 0.85,
                "workload_level": "HIGH",
                "factors": ["high_meeting_density", "multiple_deadlines"],
                "suggestions": ["Delegate tasks", "Reschedule meetings"]
            },
            "user_002": {
                "workload_score": 0.45,
                "workload_level": "MEDIUM",
                "factors": ["balanced_schedule"],
                "suggestions": ["Maintain current pace"]
            },
            "user_003": {
                "workload_score": 0.92,
                "workload_level": "CRITICAL",
                "factors": ["high_task_volume", "multiple_deadlines", "high_context_switching"],
                "suggestions": ["Immediate task redistribution", "Focus time blocks"]
            },
            "user_004": {
                "workload_score": 0.35,
                "workload_level": "LOW",
                "factors": ["light_schedule"],
                "suggestions": ["Can take more responsibilities"]
            }
        }

    async def get_team_analysis(self, team_id: str) -> Dict:
        """Get comprehensive team workload analysis"""
        workload_data = await self.get_team_workload_distribution()
        
        # Calculate team-level metrics
        workload_scores = [data['workload_score'] for data in workload_data.values()]
        avg_workload = sum(workload_scores) / len(workload_scores) if workload_scores else 0
        
        # Identify overloaded and underloaded members
        overloaded = [user_id for user_id, data in workload_data.items() 
                     if data['workload_level'] in ['HIGH', 'CRITICAL']]
        underloaded = [user_id for user_id, data in workload_data.items() 
                      if data['workload_level'] == 'LOW']
        
        imbalance_score = len(overloaded) / len(workload_data) if workload_data else 0
        
        return {
            "team_id": team_id,
            "average_workload": avg_workload,
            "overloaded_members": overloaded,
            "underloaded_members": underloaded,
            "workload_imbalance_score": imbalance_score,
            "recommendations": self._generate_team_recommendations(overloaded, underloaded, imbalance_score),
            "detailed_breakdown": workload_data
        }

    async def get_team_health_status(self) -> Dict:
        """Get overall team health status"""
        return {
            "overall_score": 0.72,
            "avg_stress": 0.45,
            "avg_workload": 0.68,
            "burnout_risk": 0.38,
            "active_alerts": 3,
            "recommendations": "Balance workload between user_001 and user_004",
            "timestamp": datetime.now().isoformat()
        }

    async def detect_workload_spikes(self, historical_data: List[Dict]) -> bool:
        """Detect sudden workload spikes"""
        if len(historical_data) < 2:
            return False
            
        recent_avg = sum(item['workload'] for item in historical_data[-3:]) / 3
        previous_avg = sum(item['workload'] for item in historical_data[-6:-3]) / 3
        
        if previous_avg > 0 and (recent_avg / previous_avg) > 1.5:
            return True
            
        return False

    def _get_workload_level(self, score: float) -> WorkloadLevel:
        """Convert workload score to level"""
        if score >= self.workload_thresholds[WorkloadLevel.CRITICAL]:
            return WorkloadLevel.CRITICAL
        elif score >= self.workload_thresholds[WorkloadLevel.HIGH]:
            return WorkloadLevel.HIGH
        elif score >= self.workload_thresholds[WorkloadLevel.MEDIUM]:
            return WorkloadLevel.MEDIUM
        else:
            return WorkloadLevel.LOW

    def _generate_recommendations(self, factors: List[str], level: WorkloadLevel) -> List[str]:
        """Generate personalized recommendations based on workload factors"""
        recommendations = []
        
        if "high_meeting_density" in factors:
            recommendations.append("Consolidate meetings into focused blocks")
        
        if "high_task_volume" in factors:
            recommendations.append("Prioritize and delegate lower-priority tasks")
            
        if "multiple_deadlines" in factors:
            recommendations.append("Request deadline extensions where possible")
            
        if "high_context_switching" in factors:
            recommendations.append("Implement focus time blocks")
            
        if level in [WorkloadLevel.HIGH, WorkloadLevel.CRITICAL]:
            recommendations.append("Discuss workload with manager")
            recommendations.append("Take regular breaks to prevent burnout")
            
        return recommendations if recommendations else ["Maintain current work patterns"]

    def _generate_team_recommendations(self, overloaded: List[str], underloaded: List[str], imbalance_score: float) -> List[str]:
        """Generate team-level workload recommendations"""
        recommendations = []
        
        if imbalance_score > 0.6:
            recommendations.append(f"Redistribute work from {', '.join(overloaded)} to {', '.join(underloaded)}")
            
        if len(overloaded) > len(underloaded):
            recommendations.append("Consider hiring additional team members")
            
        if imbalance_score > 0.8:
            recommendations.append("Urgent workload rebalancing required")
            
        return recommendations if recommendations else ["Team workload is well balanced"]