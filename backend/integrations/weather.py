from datetime import datetime
from backend.schemas import WeatherForecast

def get_forecast(site_id: str, t0: datetime, t1: datetime, mock: bool = False) -> WeatherForecast:
    """
    Fetch weather forecast for a site and time range.
    
    Args:
        site_id: MAVIS Site ID
        t0: Start time
        t1: End time
        mock: If True, returns deterministic mock data
        
    Returns:
        WeatherForecast object
    """
    if mock:
        return _get_mock_forecast(site_id, t0)
    
    # TODO: Implement real MAVIS API call
    raise NotImplementedError("Real MAVIS API integration not yet implemented. Use mock=True.")

def _get_mock_forecast(site_id: str, t: datetime) -> WeatherForecast:
    """
    Deterministic mock generator based on site_id and time.
    """
    
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
            cloud_base_ft=800.0, # Below 1000ft min
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
