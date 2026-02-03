from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from pydantic import BaseModel
from typing import List, Optional
from legality import is_slot_legal

app = FastAPI(
    title="ClearSlot Backend",
    description="Proxy service for AviationWeather.gov data, designed for Cloud Run."
)

class LogbookEntry(BaseModel):
    date: str
    hours_pic: float
    to_landings: int
    instruction: float

class PilotProfile(BaseModel):
    licence_type: str
    ratings: List[str]
    total_hours: float
    supervised_solo_hours: float
    microlight_differences_trained: Optional[bool] = False
    xc_done: Optional[bool] = False
    single_seat_constraint: Optional[bool] = False
    logbook: List[LogbookEntry]

class LegalityRequest(BaseModel):
    pilot: PilotProfile
    aircraft: str = "C42"
    date: Optional[str] = None

# Allow CORS for local dev and production
origins = [
    "http://localhost:5173", # Vite local dev
    "http://localhost:4173", # Vite preview
    "https://clearslot.space", # Production domain
    "*" # Allow all for development/Netlify previews (restrict in strict prod if needed)
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
            
            # If JSON requested, return parsed JSON, else return text
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
    # MOCK RESPONSE for now
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
    # STUB: Would call calendar_service.events().insert(...)
    return {"status": "success", "booking_id": "new_evt_123", "message": "Slot booked successfully"}

@app.post("/api/v1/legality/check")
async def check_legality(request: LegalityRequest):
    """
    Check if a pilot is legal to fly a specific aircraft on a given date.
    """
    pilot_dict = request.pilot.dict()
    result = is_slot_legal(pilot_dict, request.aircraft, request.date)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
