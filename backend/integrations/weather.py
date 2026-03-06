"""Weather data integration.

Provides get_forecast() which reads from a Firestore cache.
A background worker (start_weather_updater) fetches new data every 15 mins and stores it.
"""
import os
import time
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional

import httpx

from backend.schemas import WeatherForecast
from backend.db import get_db

CACHE_TTL = 900  # 15 minutes

def get_forecast(site_id: str, t0: datetime, t1: datetime, mock: Optional[bool] = None) -> WeatherForecast:
    """Fetch weather forecast for a site and time range from Firestore Cache."""
    if mock is None:
        mock = os.environ.get("MOCK_EXTERNAL_APIS", "true").lower() == "true"

    if mock:
        return _get_mock_forecast(site_id, t0)

    # Read strictly from Firestore Cache for <200ms latency
    db = get_db()
    
    # We store the latest weather by site_id
    doc_ref = db.collection("weather_cache").document(site_id)
    doc = doc_ref.get()
    
    if doc.exists:
        data = doc.to_dict()
        last_updated = data.get("updated_at")
        
        # We can still return it even if slightly stale, but ideally the background worker keeps it fresh
        forecast_data = data.get("forecast", {})
        if forecast_data:
            return WeatherForecast(**forecast_data)
            
    # Fallback if cache is completely empty 
    print(f"⚠️ Cache miss in Firestore for {site_id}, fetching on-demand.")
    forecast = _fetch_aviation_weather(str(site_id))
    
    # Fire and forget a write to cache so next time it's fast
    _update_firestore_cache(site_id, forecast)
    return forecast


# --- Background Worker ---

async def start_weather_updater(app):
    """Background task to fetch weather every 15 mins for active sites."""
    # This could run forever while the app is alive
    while True:
        try:
            print("☁️ Running background weather fetch for all sites...")
            db = get_db()
            
            # Fetch all distinct site_ids from the active clubs
            clubs_ref = db.collection("clubs").stream()
            sites_to_update = set()
            for club in clubs_ref:
                club_data = club.to_dict()
                icao = club_data.get("nearest_icao")
                if icao:
                    sites_to_update.add(icao)
            
            if not sites_to_update:
                print("⚠️ No icao codes found in clubs collection.")
            
            for site in sites_to_update:
                try:
                    forecast = _fetch_aviation_weather(site)
                    _update_firestore_cache(site, forecast)
                except Exception as site_err:
                    print(f"⚠️ Failed to update weather for {site}: {site_err}")
            
            print(f"✅ Background weather fetch complete for {len(sites_to_update)} sites.")
        except Exception as e:
            print(f"⚠️ Background weather worker error: {e}")
            
        await asyncio.sleep(CACHE_TTL)
        

def _update_firestore_cache(site_id: str, forecast: WeatherForecast):
    """Save the forecast to Firestore so endpoints can read quickly."""
    try:
        db = get_db()
        db.collection("weather_cache").document(site_id).set({
            "updated_at": datetime.now(timezone.utc),
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=24),
            "forecast": forecast.model_dump()
        })
    except Exception as e:
        print(f"⚠️ Failed to write weather cache to Firestore: {e}")


def _fetch_aviation_weather(icao: str) -> WeatherForecast:
    """Fetch and parse METAR data from AviationWeather.gov."""
    try:
        resp = httpx.get(
            "https://aviationweather.gov/api/data/metar",
            params={"ids": icao, "format": "json"},
            timeout=5.0,
        )
        resp.raise_for_status()
        data = resp.json()

        if not data:
            return _get_default_forecast()

        obs = data[0]
        return WeatherForecast(
            wind_speed_kt=float(obs.get("wspd", 0)),
            gust_speed_kt=float(obs.get("wgst", 0) or 0),
            cloud_base_ft=_extract_cloud_base(obs),
            visibility_m=_vis_sm_to_m(obs.get("visib", 10)),
            precipitation_rate_mm_hr=0.0,
        )
    except Exception as e:
        print(f"⚠️ AviationWeather.gov fetch failed for {icao}: {type(e).__name__} {e}")
        return _get_default_forecast()


def _extract_cloud_base(obs: dict) -> float:
    clouds = obs.get("clouds", [])
    for c in clouds:
        cover = c.get("cover", "")
        if cover in ("BKN", "OVC", "SCT"):
            base = c.get("base")
            if base is not None:
                try:
                    return float(base) * 100
                except (TypeError, ValueError):
                    continue
    return 5000.0


def _vis_sm_to_m(vis_sm) -> float:
    try:
        return float(vis_sm) * 1609.34
    except (TypeError, ValueError):
        return 9999.0


def _get_default_forecast() -> WeatherForecast:
    return WeatherForecast(
        wind_speed_kt=10.0,
        gust_speed_kt=15.0,
        cloud_base_ft=2500.0,
        visibility_m=8000.0,
        precipitation_rate_mm_hr=0.0,
    )


def _get_mock_forecast(site_id: str, t: datetime) -> WeatherForecast:
    if "SAFE" in site_id:
        return WeatherForecast(
            wind_speed_kt=5.0, gust_speed_kt=8.0, cloud_base_ft=4000.0,
            visibility_m=9999.0, precipitation_rate_mm_hr=0.0
        )
    if "WINDY" in site_id:
        return WeatherForecast(
            wind_speed_kt=25.0, gust_speed_kt=35.0, cloud_base_ft=3000.0,
            visibility_m=9999.0, precipitation_rate_mm_hr=0.0
        )
    if "IFR" in site_id:
        return WeatherForecast(
            wind_speed_kt=10.0, gust_speed_kt=15.0, cloud_base_ft=800.0,
            visibility_m=4000.0, precipitation_rate_mm_hr=2.0
        )
    return WeatherForecast(
        wind_speed_kt=10.0, gust_speed_kt=15.0, cloud_base_ft=2500.0,
        visibility_m=8000.0, precipitation_rate_mm_hr=0.0
    )
