# ClearSlot Backend Service
# CI/CD Trigger v10 (Nuclear Artifact Permissions)

from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from pydantic import BaseModel
from typing import List, Optional
from backend.legality import is_slot_legal
from backend.flyability import compute_flyability
from backend.schemas import (
    WeatherForecast,
    PilotProfile,
    AircraftProfile,
    SurfaceCondition,
    FlyabilityResponse
)
from backend.bookings import router as bookings_router
from backend.admin import router as admin_router
from backend.analytics.scoring import compute_club_operational_score, ClubMetrics
from backend.auth import verify_token, get_user_profile
from backend.db import get_db

app = FastAPI(
    title="ClearSlot Backend",
    description="Proxy service for AviationWeather.gov data, designed for Cloud Run."
)

# --- Observability ---
from backend.logger import get_logger
import time
from fastapi import Request

logger = get_logger("main")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.2f}ms")
        return response
    except Exception as e:
        process_time = (time.time() - start_time) * 1000
        logger.error(f"Request failed: {request.method} {request.url.path} - {str(e)} - {process_time:.2f}ms")
        raise

app.include_router(bookings_router)
app.include_router(admin_router)

class LogbookEntry(BaseModel):
    date: str
    hours_pic: float
    to_landings: int
    instruction: float

class LegalityPilotProfile(BaseModel):
    licence_type: str
    ratings: List[str]
    total_hours: float
    supervised_solo_hours: float
    microlight_differences_trained: Optional[bool] = False
    xc_done: Optional[bool] = False
    single_seat_constraint: Optional[bool] = False
    logbook: List[LogbookEntry]

class LegalityRequest(BaseModel):
    pilot: LegalityPilotProfile
    aircraft: str = "C42"
    date: Optional[str] = None

# Allow CORS for local dev and production
origins = [
    "http://localhost:5173",    # Vite local dev
    "http://localhost:4173",    # Vite preview
    "https://clearslot.space",  # Production domain
    "https://clearslot-space.netlify.app",  # Netlify deploy previews
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AVIATION_WEATHER_API = "https://aviationweather.gov/api/data"

@app.get("/")
async def root():
    return {"status": "ok", "service": "ClearSlot Backend"}

@app.get("/api/v1/weather/metar")
async def get_metar(ids: str, format: str = "json", hours: int = 0, taf: bool = False):
    """
    Proxy for METARs (Current Observations).
    Example: /api/v1/weather/metar?ids=EGLL&format=json&hours=12&taf=true
    """
    async with httpx.AsyncClient() as client:
        params = {"ids": ids, "format": format, "taf": str(taf).lower()}
        if hours > 0:
            params["hours"] = hours
            
        try:
            response = await client.get(f"{AVIATION_WEATHER_API}/metar", params=params)
            response.raise_for_status()
            
            if format == "json":
                return response.json()
            return response.text
            
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"Upstream API error: {e.response.text}")
        except Exception as e:
             raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/weather/taf")
async def get_taf(ids: str, format: str = "json", metar: bool = False, time: str = "valid", date: str = None):
    """
    Proxy for TAFs (Forecasts).
    Example: /api/v1/weather/taf?ids=EGLL&format=json&metar=true&time=valid
    """
    async with httpx.AsyncClient() as client:
        params = {"ids": ids, "format": format}
        if metar:
            params["metar"] = str(metar).lower()
        if time:
            params["time"] = time
        if date:
            params["date"] = date
        
        try:
            response = await client.get(f"{AVIATION_WEATHER_API}/taf", params=params)
            response.raise_for_status()
            
            if format == "json":
                return response.json()
            return response.text
            
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"Upstream API error: {e.response.text}")
        except Exception as e:
             raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/airport/info")
async def get_station_info(ids: str = None, bbox: str = None, format: str = "json"):
    """
    Proxy for Station Info (Lat/Lon/Elev).
    Example: /api/v1/airport/info?ids=EGLL&format=json
    """
    async with httpx.AsyncClient() as client:
        params = {"format": format}
        if ids:
            params["ids"] = ids
        if bbox:
            params["bbox"] = bbox
        
        try:
            response = await client.get(f"{AVIATION_WEATHER_API}/stationinfo", params=params)
            response.raise_for_status()
            
            if format == "json":
                return response.json()
            return response.text
            
        except httpx.HTTPStatusError as e:
             raise HTTPException(status_code=e.response.status_code, detail=f"Upstream API error: {e.response.text}")
        except Exception as e:
             raise HTTPException(status_code=500, detail=str(e))

# --- Phase 6: Smart Calendar & Booking ---

@app.get("/api/v1/calendar/events")
async def list_calendar_events(days: int = 7):
    """
    List upcoming calendar slots from Google Calendar.
    (Stub: In production, this uses google-api-python-client with Service Account)
    """
    from datetime import datetime, timedelta
    mock_start = datetime.now().replace(hour=9, minute=0, second=0, microsecond=0)
    events = []
    for i in range(5):
        start = mock_start + timedelta(days=i)
        events.append({
            "id": f"evt_{i}",
            "summary": "C42 Club Booking",
            "start": start.isoformat(),
            "end": (start + timedelta(hours=2)).isoformat(),
            "status": "confirmed"
        })
    return events

@app.post("/api/v1/calendar/book")
async def book_slot(booking: dict):
    """
    Create a new booking in the Google Calendar.
    Requires: 'pilot_id', 'aircraft', 'start_time', 'end_time'
    """
    return {"status": "success", "booking_id": "new_evt_123", "message": "Slot booked successfully"}

@app.post("/api/v1/legality/check")
async def check_legality(request: LegalityRequest):
    """
    Check if a pilot is legal to fly a specific aircraft on a given date.
    """
    pilot_dict = request.pilot.model_dump()
    result = is_slot_legal(pilot_dict, request.aircraft, request.date)
    return result

from datetime import datetime
from backend.integrations.weather import get_forecast

class FlyabilityContextRequest(BaseModel):
    site_id: str
    time: Optional[datetime] = None
    pilot: PilotProfile
    aircraft: AircraftProfile
    runway_surface: SurfaceCondition = SurfaceCondition.DRY

@app.post("/api/v1/flyability/check")
async def check_flyability_endpoint(request: FlyabilityContextRequest):
    """
    Check if conditions are safe for a flight.
    Backend fetches weather for the given site_id.
    Uses MOCK_EXTERNAL_APIS env var to toggle between mock and real weather.
    """
    t0 = request.time or datetime.now()
    
    forecast = get_forecast(request.site_id, t0, t0)
    
    result = compute_flyability(
        forecast=forecast,
        pilot=request.pilot,
        aircraft=request.aircraft,
        runway_surface=request.runway_surface
    )
    
    return {
        **result.model_dump(),
        "weather": forecast.model_dump()
    }


class SlotsRequest(BaseModel):
    site_id: str
    start: datetime
    end: datetime
    slot_duration_minutes: int = 60
    pilot: PilotProfile
    aircraft: AircraftProfile
    runway_surface: SurfaceCondition = SurfaceCondition.DRY


@app.post("/api/v1/flyability/slots")
async def flyability_slots(request: SlotsRequest):
    """T11: Per-slot flyability across a time range.

    Divides [start, end) into slots of slot_duration_minutes and evaluates
    each with the existing flyability engine + real weather.
    """
    from datetime import timedelta

    if request.start >= request.end:
        return []

    duration = timedelta(minutes=request.slot_duration_minutes)
    slots = []
    current = request.start

    while current < request.end:
        slot_end = min(current + duration, request.end)
        forecast = get_forecast(request.site_id, current, slot_end)
        result = compute_flyability(
            forecast=forecast,
            pilot=request.pilot,
            aircraft=request.aircraft,
            runway_surface=request.runway_surface,
        )
        slots.append({
            "start": current.isoformat(),
            "end": slot_end.isoformat(),
            "status": result.status,
            "score": result.score,
            "reasons": result.reasons,
        })
        current = slot_end

    return slots

@app.post("/api/v1/club/score")
async def calculate_club_score(metrics: ClubMetrics):
    """
    Calculate the operational score for a club.
    """
    return compute_club_operational_score(metrics)

# --- User Profile (T09) ---

@app.get("/api/v1/users/me")
async def get_current_user_profile(user: dict = Depends(verify_token)):
    """Return the authenticated user's profile (role, club_slugs)."""
    profile = get_user_profile(user["uid"])
    return {
        "uid": user["uid"],
        "email": user.get("email"),
        "role": profile.get("role", "pilot"),
        "club_slugs": profile.get("club_slugs", []),
    }

# --- Club Branding (T08) ---

@app.get("/api/v1/clubs/{slug}")
async def get_club(slug: str):
    """Get club branding and config by slug."""
    db = get_db()
    doc = db.collection("clubs").document(slug).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Club not found")
    return {"slug": slug, **doc.to_dict()}

@app.get("/api/v1/clubs/{slug}/fleet")
async def get_club_fleet(slug: str):
    """List all aircraft for a club."""
    db = get_db()
    docs = db.collection("clubs").document(slug).collection("fleet").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@app.get("/api/v1/clubs/{slug}/news")
async def get_club_news(slug: str):
    """List news items for a club."""
    db = get_db()
    docs = db.collection("clubs").document(slug).collection("news").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
