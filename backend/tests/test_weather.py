import pytest
from datetime import datetime
from backend.integrations.weather import get_forecast
from backend.schemas import WeatherForecast

def test_get_mock_forecast_safe():
    """Test that safe site returns good weather."""
    t0 = datetime.now()
    forecast = get_forecast("SAFE_SITE", t0, t0, mock=True)
    assert isinstance(forecast, WeatherForecast)
    assert forecast.wind_speed_kt == 5.0
    assert forecast.cloud_base_ft == 4000.0

def test_get_mock_forecast_windy():
    """Test that windy site returns high wind."""
    t0 = datetime.now()
    forecast = get_forecast("WINDY_SITE", t0, t0, mock=True)
    assert forecast.wind_speed_kt == 25.0
    assert forecast.gust_speed_kt == 35.0

def test_get_mock_forecast_ifr():
    """Test that IFR site returns low visibility/cloud."""
    t0 = datetime.now()
    forecast = get_forecast("IFR_SITE", t0, t0, mock=True)
    assert forecast.cloud_base_ft < 1000
    assert forecast.visibility_m == 4000.0

def test_real_forecast_raises_error():
    """Test that non-mock call raises NotImplementedError for now."""
    t0 = datetime.now()
    with pytest.raises(NotImplementedError):
        get_forecast("REAL_SITE", t0, t0, mock=False)
