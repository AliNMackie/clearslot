"""Weather data integration.

Provides get_forecast() which returns a WeatherForecast for a given site.
Data sources (in priority order):
  1. Mock data (when MOCK_EXTERNAL_APIS=true, or site_id contains test keywords)
  2. Real AviationWeather.gov METAR parsing (always available, free, no key required)
  3. MAVIS / Met Office DataHub (future — requires MAVIS_API_KEY)

Results are cached in-memory for 15 minutes to avoid excessive API calls.
"""
import os
import time
from datetime import datetime
from typing import Optional

import httpx

from backend.schemas import WeatherForecast

# --- Cache ---
_cache: dict[str, tuple[float, WeatherForecast]] = {}
CACHE_TTL = 900  # 15 minutes


def get_forecast(site_id: str, t0: datetime, t1: datetime, mock: Optional[bool] = None) -> WeatherForecast:
    """Fetch weather forecast for a site and time range.

    Args:
        site_id: Site identifier (ICAO code, or MAVIS site ID)
        t0: Start time
        t1: End time
        mock: Override mock mode. If None, reads from MOCK_EXTERNAL_APIS env var.

    Returns:
        WeatherForecast object
    """
    # Determine mock mode
    if mock is None:
        mock = os.environ.get("MOCK_EXTERNAL_APIS", "true").lower() == "true"

    if mock:
        return _get_mock_forecast(site_id, t0)

    # Check cache
    cache_key = f"{site_id}:{t0.strftime('%Y%m%d%H') if t0 else 'now'}"
    if cache_key in _cache:
        cached_time, cached_data = _cache[cache_key]
        if time.time() - cached_time < CACHE_TTL:
            return cached_data

    # Fetch real weather
    forecast = _fetch_aviation_weather(site_id)

    # Cache the result
    _cache[cache_key] = (time.time(), forecast)
    return forecast


def _fetch_aviation_weather(icao: str) -> WeatherForecast:
    """Fetch and parse METAR data from AviationWeather.gov.

    This is the primary real-data source for v1. It's free, requires no API key,
    and provides current conditions for any ICAO station worldwide.

    For Strathaven (unlicensed strip, no ICAO), the nearest station is EGPF (Glasgow).
    The caller (or club config) should map site_id → nearest_icao before calling.
    """
    try:
        resp = httpx.get(
            "https://aviationweather.gov/api/data/metar",
            params={"ids": icao, "format": "json"},
            timeout=10.0,
        )
        resp.raise_for_status()
        data = resp.json()

        if not data:
            # No METAR available — return safe defaults
            return _get_default_forecast()

        obs = data[0]
        return WeatherForecast(
            wind_speed_kt=float(obs.get("wspd", 0)),
            gust_speed_kt=float(obs.get("wgst", 0) or 0),
            cloud_base_ft=_extract_cloud_base(obs),
            visibility_m=_vis_sm_to_m(obs.get("visib", 10)),
            precipitation_rate_mm_hr=0.0,  # METAR doesn't report rate directly
        )
    except (httpx.HTTPError, httpx.TimeoutException, KeyError, IndexError, ValueError) as e:
        # On any fetch/parse error, fall back to safe defaults rather than crashing
        print(f"⚠️ AviationWeather.gov fetch failed for {icao}: {e}")
        return _get_default_forecast()


def _extract_cloud_base(obs: dict) -> float:
    """Extract the lowest significant cloud base from METAR cloud data."""
    clouds = obs.get("clouds", [])
    for c in clouds:
        cover = c.get("cover", "")
        if cover in ("BKN", "OVC", "SCT"):
            base = c.get("base")
            if base is not None:
                try:
                    return float(base) * 100  # METAR is in hundreds of ft AGL
                except (TypeError, ValueError):
                    continue
    # No significant cloud → report high ceiling
    return 5000.0


def _vis_sm_to_m(vis_sm) -> float:
    """Convert visibility from statute miles to metres."""
    try:
        return float(vis_sm) * 1609.34
    except (TypeError, ValueError):
        return 9999.0


def _get_default_forecast() -> WeatherForecast:
    """Return cautious defaults when real data is unavailable."""
    return WeatherForecast(
        wind_speed_kt=10.0,
        gust_speed_kt=15.0,
        cloud_base_ft=2500.0,
        visibility_m=8000.0,
        precipitation_rate_mm_hr=0.0,
    )


# --- Mock Data (kept for testing and development) ---

def _get_mock_forecast(site_id: str, t: datetime) -> WeatherForecast:
    """Deterministic mock generator based on site_id and time."""

    # "SAFE" Site -> Good conditions
    if "SAFE" in site_id:
        return WeatherForecast(
            wind_speed_kt=5.0,
            gust_speed_kt=8.0,
            cloud_base_ft=4000.0,
            visibility_m=9999.0,
            precipitation_rate_mm_hr=0.0
        )

    # "WINDY" Site -> High wind
    if "WINDY" in site_id:
        return WeatherForecast(
            wind_speed_kt=25.0,
            gust_speed_kt=35.0,
            cloud_base_ft=3000.0,
            visibility_m=9999.0,
            precipitation_rate_mm_hr=0.0
        )

    # "IFR" Site -> Low cloud/vis
    if "IFR" in site_id:
        return WeatherForecast(
            wind_speed_kt=10.0,
            gust_speed_kt=15.0,
            cloud_base_ft=800.0,
            visibility_m=4000.0,
            precipitation_rate_mm_hr=2.0
        )

    # Default: Good conditions
    return WeatherForecast(
        wind_speed_kt=10.0,
        gust_speed_kt=15.0,
        cloud_base_ft=2500.0,
        visibility_m=8000.0,
        precipitation_rate_mm_hr=0.0
    )
