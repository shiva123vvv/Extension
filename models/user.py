from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel

class User(BaseModel):
    user_id: str
    name: str
    email: str
    team_id: str
    role: str
    is_active: bool = True
    created_at: datetime = datetime.now()
    
class UserActivity(BaseModel):
    user_id: str
    date: str
    messages_sent: int = 0
    messages_received: int = 0
    response_time_avg: float = 0.0
    active_hours: float = 0.0
    late_night_activity: int = 0
    meeting_hours: float = 0.0
    focus_time: float = 0.0
    
class UserPreferences(BaseModel):
    user_id: str
    alert_preferences: Dict = {}
    working_hours: Dict = {}
    notification_settings: Dict = {}