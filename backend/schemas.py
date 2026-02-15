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
class UserProfileUpdate(BaseModel):
    weight_kg: Optional[int] = None
    medical_expiry: Optional[str] = None  # ISO Format YYYY-MM-DD
    license_expiry: Optional[str] = None  # ISO Format YYYY-MM-DD
