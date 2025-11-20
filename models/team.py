from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel

class Team(BaseModel):
    team_id: str
    name: str
    description: str
    manager_id: str
    member_ids: List[str] = []
    is_active: bool = True
    created_at: datetime = datetime.now()

class TeamMetrics(BaseModel):
    team_id: str
    date: str
    overall_health: float
    avg_stress_level: float
    avg_workload: float
    burnout_risk: float
    work_imbalance: float
    collaboration_score: float