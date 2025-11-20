import os
from typing import Dict, Any

class Settings:
    """Application settings"""
    
    # API Settings
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Zoho Cliq Integration
    CLIQ_BOT_TOKEN: str = os.getenv("CLIQ_BOT_TOKEN", "")
    CLIQ_WEBHOOK_URL: str = os.getenv("CLIQ_WEBHOOK_URL", "")
    CLIQ_API_BASE: str = "https://cliq.zoho.com/api/v2"
    
    # Alert Thresholds
    ALERT_THRESHOLDS: Dict[str, float] = {
        "stress_level": 0.7,
        "workload_score": 0.8,
        "burnout_risk": 0.6,
        "late_night_hours": 3,
        "message_spike_ratio": 2.0,
        "response_time_increase": 2.0
    }
    
    # Monitoring Intervals (seconds)
    MONITORING_INTERVAL: int = 60
    METRICS_UPDATE_INTERVAL: int = 300
    ALERT_CHECK_INTERVAL: int = 300
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cognitive_monitor.db")
    
    # Feature Flags
    ENABLE_STRESS_DETECTION: bool = True
    ENABLE_WORKLOAD_ANALYSIS: bool = True
    ENABLE_REAL_TIME_ALERTS: bool = True

settings = Settings()