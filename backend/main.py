"""
BreathIQ - Epidemiological Intelligence Platform
FastAPI Backend - Epidemic Detection System

LEGAL NOTICE:
This system processes AGGREGATED regional data only.
NO personal data, GPS, postal codes, or identification collected.
Data is quasi-anonymized at regional level (13 French regions).
GDPR compliance: Data access is logged and audited.
"""

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import hashlib
import redis
import json
import logging
from contextlib import contextmanager

# Local imports
from models import Base, EpidemiologicalAggregate, EpidemicAlert, DataAuditLog, engine, SessionLocal
from schemas import DeclarationSchema, AlertSchema
from detection import detect_epidemic_anomaly

# ============================================================================
# LOGGING & CONFIGURATION
# ============================================================================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Redis cache (local development: localhost:6379)
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# ============================================================================
# FASTAPI APP INITIALIZATION
# ============================================================================

app = FastAPI(
    title="BreathIQ Epidemiological Detection API",
    version="1.0.0",
    description="Early epidemic detection system using anonymous regional data aggregation",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# CORS Configuration (allow React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://breathiq.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"]
)

# ============================================================================
# SECURITY MIDDLEWARE - Forbidden Data Validation
# ============================================================================

FORBIDDEN_FIELDS = {
    'gps', 'latitude', 'longitude', 'postal_code', 'zipcode',
    'nom', 'name', 'prenom', 'first_name', 'last_name',
    'date_naissance', 'date_birth', 'dob', 'ssn', 'insee_number',
    'address', 'email', 'phone', 'telephone', 'mobile'
}

@app.middleware("http")
async def validate_no_sensitive_data(request: Request, call_next):
    """
    Security middleware: Reject requests containing forbidden sensitive fields.
    Logs all validation failures for audit.
    """
    if request.method == "POST" and request.url.path == "/api/v1/declare":
        try:
            body = await request.body()
            if body:
                payload = json.loads(body)
                
                # Check for forbidden fields
                found_forbidden = FORBIDDEN_FIELDS.intersection(set(payload.keys()))
                if found_forbidden:
                    # Log security violation
                    logger.warning(
                        f"SECURITY VIOLATION: Attempt to include forbidden fields: {found_forbidden} "
                        f"from IP: {request.client.host if request.client else 'unknown'}"
                    )
                    raise HTTPException(
                        status_code=400,
                        detail=f"Forbidden fields detected. The following fields are not allowed: {', '.join(found_forbidden)}. "
                               "This system only collects ANONYMOUS regional data."
                    )
        except json.JSONDecodeError:
            pass  # Not JSON, skip validation
    
    response = await call_next(request)
    return response

# ============================================================================
# DEPENDENCY: Database Session
# ============================================================================

def get_db():
    """FastAPI dependency: Provides database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def hash_ip_address(ip: str) -> str:
    """Hash IP address for audit logs (privacy-preserving)"""
    return hashlib.sha256(ip.encode()).hexdigest()[:16]

def log_data_access(db: Session, action: str, region_code: str, user_ip: str):
    """Log data access for GDPR compliance"""
    audit_entry = DataAuditLog(
        action=action,
        region_code=region_code,
        user_ip_hash=hash_ip_address(user_ip),
        timestamp=datetime.utcnow()
    )
    db.add(audit_entry)
    db.commit()
    logger.info(f"AUDIT: {action} for region {region_code}")

def get_epidemiological_week() -> int:
    """Calculate ISO week number (1-52)"""
    now = datetime.utcnow()
    start_of_year = datetime(now.year, 1, 1)
    days = (now - start_of_year).days
    return max(1, (days // 7) + 1)

def get_epidemiological_year() -> int:
    """Get current epidemiological year"""
    return datetime.utcnow().year

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/health", tags=["System"])
async def health_check():
    """
    Health check endpoint (for load balancers / monitoring)
    """
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "legal_notice": "This system processes ANONYMOUS AGGREGATED regional data only. RGPD compliant."
    }

@app.get("/legal", tags=["Legal"])
async def legal_notice():
    """
    Legal notice & data protection information
    """
    return {
        "legal_notice": "BreathIQ - Epidemiological Intelligence Platform",
        "data_processed": "ANONYMOUS regional aggregates only (no personal data)",
        "collection_level": "Regional (13 French regions maximum)",
        "collection_frequency": "Epidemiological week (1-52)",
        "no_collection": [
            "❌ GPS / Precise location",
            "❌ Postal codes / Addresses",
            "❌ Names / Identification",
            "❌ Exact dates",
            "❌ Individual case records"
        ],
        "gdpr_status": "QUASI-ANONYMOUS data (regional aggregation)",
        "audit_logs": "All access logged and hashed for compliance",
        "disclaimer": "⚠️ This system provides EARLY WARNING SIGNALS ONLY. "
                     "Data is NOT validated by official health authorities. "
                     "Always consult official sources (Santé Publique France, ARS, ANSM).",
        "contact": "breathiq@example.com"
    }

@app.post("/api/v1/declare", response_model=AlertSchema, tags=["Epidemic Detection"])
async def declare_case(
    declaration: DeclarationSchema,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    🦠 ANONYMOUS EPIDEMIC DECLARATION ENDPOINT
    
    Receive anonymous healthcare worker declaration of unusual syndrome activity.
    
    **AUTHORIZED FIELDS ONLY:**
    - ✅ region_code: French region code (2 digits, 13 regions)
    - ✅ syndrome_type: grippal / respiratoire / diarrheique / febrile
    - ✅ epidemiological_week: 1-52 (NOT exact date)
    - ✅ epidemiological_year: 2026, 2027...
    - ✅ patient_count: 1-5, 6-20, 21-50, 50+
    
    **FORBIDDEN FIELDS:**
    - ❌ GPS / Latitude / Longitude
    - ❌ Postal code / Address
    - ❌ Name / Identification
    - ❌ Date of birth / Medical history
    - ❌ Any personal identifier
    
    **RESPONSE:**
    - Alert level: normal | jaune | orange | rouge
    - Intensity: Z-score (number of standard deviations from baseline)
    - Message: Contextual alert message
    - Baseline: Historical comparison data
    """
    
    try:
        # Log this declaration for audit trail
        client_ip = request.client.host if request.client else "unknown"
        log_data_access(db, "DECLARATION_RECEIVED", declaration.region_code, client_ip)
        
        # ─────────────────────────────────────────────────────────────────
        # 1. STORE THE AGGREGATED DECLARATION
        # ─────────────────────────────────────────────────────────────────
        
        aggregate = EpidemiologicalAggregate(
            region_code=declaration.region_code,
            region_name=declaration.region_name,
            syndrome_type=declaration.syndrome_type,
            epidemiological_week=declaration.epidemiological_week,
            epidemiological_year=declaration.epidemiological_year,
            patient_count=declaration.patient_count
        )
        db.add(aggregate)
        db.flush()  # Ensure it's in the session before detection
        
        # ─────────────────────────────────────────────────────────────────
        # 2. DETECT EPIDEMIC ANOMALY (Z-score based)
        # ─────────────────────────────────────────────────────────────────
        
        alert = detect_epidemic_anomaly(db, declaration)
        
        # ─────────────────────────────────────────────────────────────────
        # 3. APPLY CONFIDENTIALITY THRESHOLD
        # ─────────────────────────────────────────────────────────────────
        
        # Only generate alerts if minimum 5 declarations per region/syndrome/week
        min_threshold = 5
        count_same_group = db.query(EpidemiologicalAggregate).filter(
            EpidemiologicalAggregate.region_code == declaration.region_code,
            EpidemiologicalAggregate.syndrome_type == declaration.syndrome_type,
            EpidemiologicalAggregate.epidemiological_week == declaration.epidemiological_week,
            EpidemiologicalAggregate.epidemiological_year == declaration.epidemiological_year
        ).count()
        
        if count_same_group < min_threshold and alert.alert_level != 'normal':
            logger.info(
                f"Alert suppressed: Only {count_same_group}/{min_threshold} declarations. "
                f"Confidentiality threshold not met."
            )
            alert.alert_level = 'normal'
            alert.message = f"Insufficient data for alert (n={count_same_group}, need n≥{min_threshold})"
        
        # ─────────────────────────────────────────────────────────────────
        # 4. STORE ALERT IF NOT NORMAL
        # ─────────────────────────────────────────────────────────────────
        
        if alert.alert_level != 'normal':
            epidemic_alert = EpidemicAlert(
                region_code=declaration.region_code,
                alert_level=alert.alert_level,
                syndrome_type=declaration.syndrome_type,
                message=alert.message,
                intensity=alert.intensity
            )
            db.add(epidemic_alert)
            logger.warning(f"ALERT GENERATED: {alert.alert_level.upper()} - {alert.message}")
        
        db.commit()
        
        # ─────────────────────────────────────────────────────────────────
        # 5. CACHE BASELINE FOR NEXT QUERIES
        # ─────────────────────────────────────────────────────────────────
        
        cache_key = f"baseline:{declaration.region_code}:{declaration.syndrome_type}"
        redis_client.setex(cache_key, 3600, json.dumps({
            "baseline_mean": alert.baseline_mean,
            "intensity": alert.intensity,
            "cached_at": datetime.utcnow().isoformat()
        }))
        
        # ─────────────────────────────────────────────────────────────────
        # 6. ADD LEGAL NOTICE TO RESPONSE
        # ─────────────────────────────────────────────────────────────────
        
        alert.disclaimer = (
            "⚠️ This is an EARLY WARNING SIGNAL ONLY. Data is NOT validated by official authorities. "
            "Always consult Santé Publique France, ARS, or ANSM for official guidance."
        )
        
        return alert
    
    except Exception as e:
        logger.error(f"Error processing declaration: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error processing declaration")

@app.get("/api/v1/alerts", response_model=List[AlertSchema], tags=["Epidemic Detection"])
async def get_active_alerts(
    region_code: Optional[str] = None,
    min_level: str = "jaune",
    request: Request = None,
    db: Session = Depends(get_db)
):
    """
    Get active epidemic alerts (not yet notified).
    
    **Query Parameters:**
    - region_code: Filter by French region (optional)
    - min_level: Minimum alert level (normal, jaune, orange, rouge)
    
    **Returns:** List of active alerts sorted by recency
    """
    
    try:
        # Log access
        client_ip = request.client.host if request.client else "unknown"
        log_data_access(db, "ALERTS_QUERIED", region_code or "ALL", client_ip)
        
        # Define severity order
        severity_order = {'normal': 0, 'jaune': 1, 'orange': 2, 'rouge': 3}
        min_severity = severity_order.get(min_level, 1)
        
        # Query alerts
        query = db.query(EpidemicAlert).filter(
            EpidemicAlert.notified == False
        )
        
        if region_code:
            query = query.filter(EpidemicAlert.region_code == region_code)
        
        alerts = query.order_by(EpidemicAlert.detected_at.desc()).all()
        
        # Convert to schemas
        result = [
            AlertSchema(
                alert_level=alert.alert_level,
                intensity=alert.intensity,
                message=alert.message,
                region_code=alert.region_code,
                region_name="",  # Fetch from aggregates if needed
                syndrome_type=alert.syndrome_type,
                current_count=0,
                baseline_mean=0.0,
                disclaimer="⚠️ Early warning signal only. Not validated by official authorities."
            )
            for alert in alerts
            if severity_order.get(alert.alert_level, 0) >= min_severity
        ]
        
        return result
    
    except Exception as e:
        logger.error(f"Error fetching alerts: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching alerts")

@app.get("/api/v1/map/heatmap", tags=["Visualization"])
async def get_heatmap_data(
    request: Request = None,
    db: Session = Depends(get_db)
):
    """
    Get heatmap data for Mapbox visualization.
    
    Returns latest epidemiological data aggregated by region for display on map.
    
    **Response Format:**
    [{
        region_code: "84",
        region_name: "Auvergne-Rhône-Alpes",
        syndrome_type: "grippal",
        patient_count: 45,
        alert_level: "rouge",
        intensity: 2.8,
        week: 20,
        year: 2026
    }, ...]
    """
    
    try:
        # Log access
        client_ip = request.client.host if request.client else "unknown"
        log_data_access(db, "HEATMAP_QUERIED", "ALL_REGIONS", client_ip)
        
        # Get latest week data for all regions
        query = """
        SELECT 
            ea.region_code,
            ea.region_name,
            ea.syndrome_type,
            ea.patient_count,
            ea.epidemiological_week,
            ea.epidemiological_year,
            CASE 
                WHEN ea.patient_count > (
                    SELECT AVG(patient_count) * 3 
                    FROM epidemiological_aggregates 
                    WHERE region_code = ea.region_code 
                    AND syndrome_type = ea.syndrome_type
                ) THEN 'rouge'
                WHEN ea.patient_count > (
                    SELECT AVG(patient_count) * 2 
                    FROM epidemiological_aggregates 
                    WHERE region_code = ea.region_code 
                    AND syndrome_type = ea.syndrome_type
                ) THEN 'orange'
                WHEN ea.patient_count > (
                    SELECT AVG(patient_count) * 1.5 
                    FROM epidemiological_aggregates 
                    WHERE region_code = ea.region_code 
                    AND syndrome_type = ea.syndrome_type
                ) THEN 'jaune'
                ELSE 'normal'
            END as alert_level,
            ROUND(
                CAST((ea.patient_count - (
                    SELECT AVG(patient_count) 
                    FROM epidemiological_aggregates 
                    WHERE region_code = ea.region_code 
                    AND syndrome_type = ea.syndrome_type
                )) AS NUMERIC) / 
                NULLIF((
                    SELECT STDDEV_POP(patient_count) 
                    FROM epidemiological_aggregates 
                    WHERE region_code = ea.region_code 
                    AND syndrome_type = ea.syndrome_type
                ), 0), 2
            ) as intensity
        FROM epidemiological_aggregates ea
        WHERE (ea.epidemiological_year, ea.epidemiological_week) IN (
            SELECT epidemiological_year, epidemiological_week 
            FROM epidemiological_aggregates 
            ORDER BY epidemiological_year DESC, epidemiological_week DESC 
            LIMIT 1
        )
        ORDER BY alert_level DESC, patient_count DESC
        """
        
        results = db.execute(text(query)).mappings().all()
        
        heatmap_data = [
            {
                "region_code": row['region_code'],
                "region_name": row['region_name'],
                "syndrome_type": row['syndrome_type'],
                "patient_count": row['patient_count'],
                "alert_level": row['alert_level'],
                "intensity": float(row['intensity']) if row['intensity'] else 0.0,
                "week": row['epidemiological_week'],
                "year": row['epidemiological_year']
            }
            for row in results
        ]
        
        return {
            "data": heatmap_data,
            "timestamp": datetime.utcnow().isoformat(),
            "disclaimer": "Data is aggregated at regional level and may not reflect official epidemiological reports."
        }
    
    except Exception as e:
        logger.error(f"Error fetching heatmap data: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating heatmap")

@app.post("/api/v1/alerts/{alert_id}/mark-notified", tags=["Epidemic Detection"])
async def mark_alert_notified(
    alert_id: int,
    db: Session = Depends(get_db)
):
    """
    Mark an alert as notified (acknowledged by health authority).
    """
    try:
        alert = db.query(EpidemicAlert).filter(EpidemicAlert.id == alert_id).first()
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        alert.notified = True
        db.commit()
        
        logger.info(f"Alert {alert_id} marked as notified")
        return {"status": "success", "message": "Alert marked as notified"}
    
    except Exception as e:
        logger.error(f"Error marking alert as notified: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating alert")

# ============================================================================
# STARTUP / SHUTDOWN EVENTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup"""
    Base.metadata.create_all(bind=engine)
    logger.info("✅ BreathIQ backend started successfully")
    logger.info("📚 API Documentation: http://localhost:8000/api/docs")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🛑 BreathIQ backend shutting down")

# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║        BreathIQ - Epidemiological Detection System         ║
    ║              Early Epidemic Warning Platform               ║
    ╚═══════════════════════════════════════════════════════════╝
    
    🚀 Starting backend server...
    📖 Docs: http://localhost:8000/api/docs
    ⚖️  Legal: http://localhost:8000/legal
    🏥 Declare case: POST http://localhost:8000/api/v1/declare
    
    """)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
