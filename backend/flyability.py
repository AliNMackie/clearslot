from pydantic import BaseModel
from typing import List, Optional, Literal
from enum import Enum

# --- Data Models ---

class WeatherForecast(BaseModel):
    wind_speed_kt: float
    gust_speed_kt: float
    cloud_base_ft: float
    visibility_m: float
    precipitation_rate_mm_hr: float

class PilotProfile(BaseModel):
    total_hours: float
    hours_on_type: float
    # Personal Minima (Optional - if set, they override club defaults)
    min_vis_m: Optional[float] = None
    max_wind_kt: Optional[float] = None
    max_gust_kt: Optional[float] = None

class AircraftProfile(BaseModel):
    max_demonstrated_crosswind_kt: float
    min_runway_length_m: float

class SurfaceCondition(str, Enum):
    DRY = "dry"
    WET = "wet"
    SOFT = "soft"
    ICE = "ice"

class FlyabilityResponse(BaseModel):
    status: Literal["GO", "CHECK", "NO_GO"]
    score: int # 0-100
    reasons: List[str]
    advisory_note: str = "Decision Support Only using MAVIS-data. PIC retains final authority."


# --- Core Logic ---

def compute_flyability(
    forecast: WeatherForecast,
    pilot: PilotProfile,
    aircraft: AircraftProfile,
    runway_surface: SurfaceCondition
) -> FlyabilityResponse:
    """
    Pure function to determine flyability status based on deterministic rules.
    NO ML/Black-box logic allowed.
    """
    reasons = []
    score = 100
    status = "GO"

    # --- 1. Wind Checks ---
    # Default limits (Microlight focus)
    LIMIT_WIND_KT = 20.0
    LIMIT_GUST_KT = 25.0
    
    # Use pilot personal minima if stricter (or if they exist)
    if pilot.max_wind_kt:
        LIMIT_WIND_KT = min(LIMIT_WIND_KT, pilot.max_wind_kt)

    if forecast.wind_speed_kt > LIMIT_WIND_KT:
        status = "NO_GO"
        reasons.append(f"Wind speed {forecast.wind_speed_kt}kt exceeds limit ({LIMIT_WIND_KT}kt).")
        score -= 50
    elif forecast.wind_speed_kt > (LIMIT_WIND_KT * 0.8): # Within 20% of limit
        if status != "NO_GO": status = "CHECK"
        reasons.append(f"Wind speed {forecast.wind_speed_kt}kt is near limit.")
        score -= 20

    if forecast.gust_speed_kt > LIMIT_GUST_KT:
        status = "NO_GO"
        reasons.append(f"Gusts {forecast.gust_speed_kt}kt exceed limit ({LIMIT_GUST_KT}kt).")
        score -= 50
    
    # --- 2. Cloud Base Checks ---
    LIMIT_CLOUD_BASE_FT = 1500.0 # Standard circuit height + margin
    
    if forecast.cloud_base_ft < LIMIT_CLOUD_BASE_FT:
        if forecast.cloud_base_ft < 1000:
            status = "NO_GO"
            reasons.append(f"Cloud base {forecast.cloud_base_ft}ft is below absolute min (1000ft).")
            score = 0
        else:
            if status != "NO_GO": status = "CHECK"
            reasons.append(f"Cloud base {forecast.cloud_base_ft}ft is marginal (<{LIMIT_CLOUD_BASE_FT}ft).")
            score -= 30

    # --- 3. Visibility Checks ---
    LIMIT_VIS_M = 5000.0 # VFR minimums often 5km
    
    if forecast.visibility_m < LIMIT_VIS_M:
         if forecast.visibility_m < 3000:
            status = "NO_GO"
            reasons.append(f"Visibility {forecast.visibility_m}m is below safe min (3000m).")
            score = 0
         else:
            if status != "NO_GO": status = "CHECK"
            reasons.append(f"Visibility {forecast.visibility_m}m is marginal (<{LIMIT_VIS_M}m).")
            score -= 30

    # --- 4. Surface Checks ---
    if runway_surface == SurfaceCondition.ICE:
        status = "NO_GO"
        reasons.append("Runway surface is ICE.")
        score = 0
    elif runway_surface == SurfaceCondition.SOFT:
        if status != "NO_GO": status = "CHECK"
        reasons.append("Runway is SOFT. Check takeoff performance.")
        score -= 10
        
    
    # helper: Clamp score
    score = max(0, min(100, score))
    
    if status == "GO" and len(reasons) == 0:
        reasons.append("Conditions look good within defined limits.")

    return FlyabilityResponse(
        status=status,
        score=score,
        reasons=reasons
    )
