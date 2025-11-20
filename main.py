from fastapi import FastAPI, BackgroundTasks, HTTPException, Request
from contextlib import asynccontextmanager
import asyncio
import logging
import uvicorn

from bots.cliq_bot import CliqBot
from services.cliq_monitor import CliqMonitor
from services.calendar_monitor import CalendarMonitor
from services.email_monitor import EmailMonitor
from services.zoho_analytics import ZohoAnalytics
from services.alert_service import AlertService
from ai.stress_detector import StressDetector
from ai.workload_analyzer import WorkloadAnalyzer
from ai.pattern_detector import PatternDetector
from ai.message_analyzer import MessageAnalyzer
from config.settings import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global services
cliq_bot = None
cliq_monitor = None
calendar_monitor = None
email_monitor = None
zoho_analytics = None
alert_service = None
stress_detector = None
workload_analyzer = None
pattern_detector = None
message_analyzer = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global cliq_bot, cliq_monitor, calendar_monitor, email_monitor, zoho_analytics
    global alert_service, stress_detector, workload_analyzer, pattern_detector, message_analyzer
    
    logger.info("🚀 Starting Team Cognitive Load Monitor...")
    
    try:
        # Initialize AI services
        stress_detector = StressDetector()
        workload_analyzer = WorkloadAnalyzer()
        pattern_detector = PatternDetector()
        message_analyzer = MessageAnalyzer()
        alert_service = AlertService()
        
        # Initialize data services
        zoho_analytics = ZohoAnalytics()
        
        # Initialize monitors
        cliq_monitor = CliqMonitor(alert_service, stress_detector, workload_analyzer, message_analyzer)
        calendar_monitor = CalendarMonitor(alert_service, workload_analyzer)
        email_monitor = EmailMonitor(alert_service, stress_detector)
        
        # Initialize Cliq bot
        cliq_bot = CliqBot(alert_service, workload_analyzer, stress_detector)
        
        # Start monitoring in background
        asyncio.create_task(cliq_monitor.start_monitoring())
        asyncio.create_task(calendar_monitor.start_monitoring())
        asyncio.create_task(email_monitor.start_monitoring())
        
        logger.info("✅ All services started successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to start services: {e}")
        raise
    
    yield
    
    # Shutdown
    await cliq_monitor.stop_monitoring()
    await calendar_monitor.stop_monitoring()
    await email_monitor.stop_monitoring()
    logger.info("🛑 Services stopped")

app = FastAPI(
    title="Team Cognitive Load Monitor",
    description="AI-powered team wellbeing and workload monitoring system",
    version="2.0.0",
    lifespan=lifespan
)

@app.get("/")
async def root():
    return {
        "message": "Team Cognitive Load Monitor API", 
        "status": "running",
        "version": "2.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "cliq_monitor": cliq_monitor.is_running if cliq_monitor else False,
            "calendar_monitor": calendar_monitor.is_running if calendar_monitor else False,
            "email_monitor": email_monitor.is_running if email_monitor else False,
            "alert_service": alert_service is not None
        }
    }

@app.post("/webhook/cliq")
async def cliq_webhook(request: Request):
    """Webhook endpoint for Zoho Cliq events"""
    try:
        data = await request.json()
        await cliq_bot.handle_webhook(data)
        return {"status": "processed", "message": "Webhook received successfully"}
    except Exception as e:
        logger.error(f"Error processing Cliq webhook: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/metrics/team/{team_id}")
async def get_team_metrics(team_id: str):
    """Get cognitive load metrics for a team"""
    try:
        metrics = await cliq_monitor.get_team_metrics(team_id)
        return {
            "team_id": team_id,
            "metrics": metrics,
            "timestamp": asyncio.get_event_loop().time()
        }
    except Exception as e:
        logger.error(f"Error getting team metrics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/alerts/team/{team_id}")
async def get_team_alerts(team_id: str, limit: int = 20):
    """Get recent alerts for a team"""
    try:
        alerts = await alert_service.get_team_alerts(team_id, limit)
        return {
            "team_id": team_id,
            "alerts": alerts,
            "total": len(alerts)
        }
    except Exception as e:
        logger.error(f"Error getting team alerts: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/analysis/workload/{team_id}")
async def get_workload_analysis(team_id: str):
    """Get detailed workload analysis for a team"""
    try:
        analysis = await workload_analyzer.get_team_analysis(team_id)
        return analysis
    except Exception as e:
        logger.error(f"Error getting workload analysis: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG
    )