import pytest
import asyncio
from datetime import datetime

from services.alert_service import AlertService, AlertSeverity, AlertType
from ai.stress_detector import StressDetector
from ai.workload_analyzer import WorkloadAnalyzer

@pytest.mark.asyncio
async def test_alert_service():
    """Test alert service functionality"""
    alert_service = AlertService()
    
    # Test sending alert
    await alert_service.send_alert(
        user_id="test_user",
        alert_type=AlertType.HIGH_STRESS,
        message="Test stress alert",
        severity=AlertSeverity.MEDIUM
    )
    
    # Test retrieving alerts
    alerts = await alert_service.get_team_alerts("test_team")
    assert isinstance(alerts, list)

@pytest.mark.asyncio
async def test_stress_detector():
    """Test stress detection"""
    detector = StressDetector()
    
    test_data = {
        "messages_per_hour": 18,
        "avg_response_time_minutes": 1.5,
        "daily_hours": 11,
        "late_night_messages": 4
    }
    
    result = await detector.detect_stress_indicators(test_data)
    
    assert "stress_level" in result
    assert "indicators" in result
    assert isinstance(result["stress_level"], float)
    assert isinstance(result["indicators"], list)

@pytest.mark.asyncio
async def test_workload_analyzer():
    """Test workload analysis"""
    analyzer = WorkloadAnalyzer()
    
    test_data = {
        "meeting_hours_per_day": 5,
        "active_tasks": 8,
        "upcoming_deadlines": 2
    }
    
    result = await analyzer.analyze_workload(test_data)
    
    assert "workload_score" in result
    assert "workload_level" in result
    assert "factors" in result