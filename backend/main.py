"""
MonsoonSetu Backend — FastAPI Server
Mock endpoints that will later be replaced with real ML model inference.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional
import json

app = FastAPI(
    title="MonsoonSetu API",
    description="Block-Level Monsoon Intelligence for Indian Farmers",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# MOCK DATA (replace with DB + model inference in production)
# ============================================================

DISTRICTS = {
    "beed": {
        "id": "beed", "name": "Beed", "lat": 18.9891, "lon": 75.7601,
        "riskLevel": "high", "falseOnsetFlag": True,
        "predictions": {"onset_7d": 78, "break_7d": 65, "break_14d": 82, "heavy_7d": 22},
        "weeklyForecast": [
            {"week": 1, "label": "Normal Rain", "probability": 72, "riskLevel": "low"},
            {"week": 2, "label": "Dry Spell Likely", "probability": 68, "riskLevel": "moderate"},
            {"week": 3, "label": "Dry Continues", "probability": 55, "riskLevel": "high"},
            {"week": 4, "label": "Revival Expected", "probability": 61, "riskLevel": "low"},
        ],
        "analogYear": {"year": 2015, "similarity": 89,
                       "description": "Similar pattern in 2015 led to 14-day mid-July break in Marathwada."}
    },
    "latur": {
        "id": "latur", "name": "Latur", "lat": 18.4088, "lon": 76.5604,
        "riskLevel": "high", "falseOnsetFlag": False,
        "predictions": {"onset_7d": 74, "break_7d": 62, "break_14d": 79, "heavy_7d": 18},
        "weeklyForecast": [
            {"week": 1, "label": "Light Rain", "probability": 65, "riskLevel": "moderate"},
            {"week": 2, "label": "Dry Spell", "probability": 72, "riskLevel": "high"},
            {"week": 3, "label": "Severe Dry", "probability": 60, "riskLevel": "high"},
            {"week": 4, "label": "Uncertain", "probability": 50, "riskLevel": "moderate"},
        ],
        "analogYear": {"year": 2018, "similarity": 78,
                       "description": "Late onset followed by erratic breaks across Marathwada."}
    },
    "solapur": {
        "id": "solapur", "name": "Solapur", "lat": 17.6599, "lon": 75.9064,
        "riskLevel": "high", "falseOnsetFlag": False,
        "predictions": {"onset_7d": 70, "break_7d": 58, "break_14d": 75, "heavy_7d": 15},
        "weeklyForecast": [
            {"week": 1, "label": "Scattered Rain", "probability": 55, "riskLevel": "moderate"},
            {"week": 2, "label": "Dry", "probability": 70, "riskLevel": "high"},
            {"week": 3, "label": "Very Dry", "probability": 65, "riskLevel": "high"},
            {"week": 4, "label": "Some Relief", "probability": 58, "riskLevel": "moderate"},
        ],
        "analogYear": {"year": 2015, "similarity": 85,
                       "description": "2015 drought hit Solapur hardest — 40% below normal July rain."}
    },
}

CLIMATE_INDICES = {
    "oni": 0.8, "oniStatus": "El Niño (Weak)",
    "dmi": -0.3, "dmiStatus": "Negative IOD",
    "mjoPhase": 6, "mjoAmplitude": 1.4, "mjoStatus": "Suppressive (Phase 6)",
    "lastUpdated": datetime.now().isoformat()
}

SYSTEM_HEALTH = {
    "scraperStatus": {"enso": "ok", "iod": "ok", "mjo": "ok", "lastUpdated": "2 hrs ago"},
    "modelAccuracy": {"onset_f1": 0.72, "break_f1": 0.68, "heavy_f1": 0.65},
    "pipelineHealth": "All systems operational",
    "totalFarmers": 2847, "totalOfficers": 23, "totalAlerts": 156
}

# In-memory stores (replace with PostgreSQL in production)
feedback_store = []
calibration_store = []

# ============================================================
# PYDANTIC MODELS
# ============================================================

class FarmerFeedback(BaseModel):
    village: str
    lat: float
    lon: float
    rain_reported: bool
    date: Optional[str] = None

class OfficerCalibration(BaseModel):
    block: str
    date: str
    actual_rainfall_mm: float
    soil_condition: str  # Wet, Moist, Dry

class FarmerRegistration(BaseModel):
    phone: str
    village: str
    crop: str
    irrigation: str  # yes, no, partial
    sowing_stage: str  # not_yet, recently, weeks_ago
    language: str = "hi"

# ============================================================
# API ENDPOINTS
# ============================================================

@app.get("/")
def root():
    return {"name": "MonsoonSetu API", "version": "1.0.0", "status": "operational"}

@app.get("/api/districts")
def get_districts():
    """Get all district predictions and risk levels."""
    return list(DISTRICTS.values())

@app.get("/api/districts/{district_id}")
def get_district(district_id: str):
    """Get prediction for a specific district."""
    if district_id not in DISTRICTS:
        raise HTTPException(status_code=404, detail="District not found")
    return DISTRICTS[district_id]

@app.get("/api/districts/{district_id}/forecast")
def get_forecast(district_id: str):
    """Get 4-week forecast for a district."""
    if district_id not in DISTRICTS:
        raise HTTPException(status_code=404, detail="District not found")
    return {
        "district": DISTRICTS[district_id]["name"],
        "forecast": DISTRICTS[district_id]["weeklyForecast"],
        "falseOnsetFlag": DISTRICTS[district_id]["falseOnsetFlag"],
        "analogYear": DISTRICTS[district_id]["analogYear"],
    }

@app.get("/api/climate-indices")
def get_climate_indices():
    """Get current ENSO/IOD/MJO values."""
    return CLIMATE_INDICES

@app.get("/api/advisory/{district_id}")
def get_advisory(district_id: str, crop: str = "soybean", irrigation: str = "no"):
    """Get personalized advisory for a farmer's crop and irrigation status."""
    if district_id not in DISTRICTS:
        raise HTTPException(status_code=404, detail="District not found")
    
    district = DISTRICTS[district_id]
    break_risk = district["predictions"]["break_14d"]
    
    # Confidence-branched advisory logic
    if district["falseOnsetFlag"]:
        action = "DELAY_SOWING"
        severity = "CRITICAL"
        headline = "⚠️ पेरणी करू नका — खोटा पावसाळा सुरू!"
        headline_en = "⚠️ Do Not Sow — False Onset Detected!"
        if irrigation == "yes":
            advice = "Sow with caution. Supplement with borewell if rain stops."
        else:
            advice = "DO NOT sow. Wait minimum 7 days for sustained rain confirmation."
    elif break_risk > 60:
        action = "DELAY_SOWING"
        severity = "CRITICAL"
        headline = "⚠️ पेरणी पुढे ढकला"
        headline_en = "⚠️ Delay Sowing — High Break Risk"
        if irrigation == "yes":
            advice = "Sow with caution and monitor daily updates."
        else:
            advice = f"Wait at least 7 days. {break_risk}% chance of dry spell."
    elif break_risk > 40:
        action = "SOW_WITH_CAUTION"
        severity = "MODERATE"
        headline = "⚡ सावधगिरीने पेरणी करा"
        headline_en = "⚡ Sow With Caution"
        advice = "Monitor daily. Consider shorter-duration variety."
    else:
        action = "SOW_NOW"
        severity = "ROUTINE"
        headline = "✅ पेरणीसाठी योग्य वेळ"
        headline_en = "✅ Good Time to Sow"
        advice = "Conditions look favorable. Proceed with planned sowing."
    
    return {
        "action": action,
        "severity": severity,
        "headline": headline,
        "headlineEn": headline_en,
        "explanation": f"Ocean signals: ONI={CLIMATE_INDICES['oni']} ({CLIMATE_INDICES['oniStatus']}). "
                       f"MJO {CLIMATE_INDICES['mjoStatus']}.",
        "confidence": min(95, max(45, 100 - break_risk + 20)),
        "advice": advice,
        "crop": crop,
        "irrigation": irrigation,
        "analogYear": district["analogYear"],
    }

@app.post("/api/feedback")
def submit_feedback(feedback: FarmerFeedback):
    """Submit farmer rain/no-rain feedback."""
    entry = {
        "id": f"FB-{len(feedback_store) + 1:03d}",
        "village": feedback.village,
        "lat": feedback.lat,
        "lon": feedback.lon,
        "rainReported": feedback.rain_reported,
        "date": feedback.date or date.today().isoformat(),
        "timestamp": datetime.now().isoformat()
    }
    feedback_store.append(entry)
    return {"status": "recorded", "message": "Thank you! Your feedback helps improve predictions.", "entry": entry}

@app.post("/api/calibration")
def submit_calibration(cal: OfficerCalibration):
    """Submit officer ground-truth calibration data."""
    entry = {
        "id": f"CAL-{len(calibration_store) + 1:02d}",
        "block": cal.block,
        "date": cal.date,
        "actualRainfallMm": cal.actual_rainfall_mm,
        "soilCondition": cal.soil_condition,
        "timestamp": datetime.now().isoformat()
    }
    calibration_store.append(entry)
    return {"status": "recorded", "message": "Observation recorded. Model bias updated.", "entry": entry}

@app.get("/api/system/health")
def get_system_health():
    """Get system health status for SysAdmin dashboard."""
    return SYSTEM_HEALTH

@app.get("/api/feedback/history")
def get_feedback_history():
    """Get recent farmer feedback entries."""
    return feedback_store[-20:] if feedback_store else []

@app.get("/api/calibration/history")
def get_calibration_history():
    """Get recent officer calibration entries."""
    return calibration_store[-10:] if calibration_store else []

# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
