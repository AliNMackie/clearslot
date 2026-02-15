import pytest
from backend.flyability import compute_flyability
from backend.schemas import (
    WeatherForecast,
    PilotProfile,
    AircraftProfile,
    SurfaceCondition,
    FlyabilityResponse
)

# --- Test Data Fixtures ---

@pytest.fixture
def standard_pilot():
    return PilotProfile(total_hours=100, hours_on_type=20)

@pytest.fixture
def aircraft():
    return AircraftProfile(
        max_demonstrated_crosswind_kt=15,
        min_runway_length_m=300
    )

@pytest.fixture
def good_forecast():
    return WeatherForecast(
        wind_speed_kt=5,
        gust_speed_kt=8,
        cloud_base_ft=3000,
        visibility_m=10000,
        precipitation_rate_mm_hr=0
    )

# --- Tests ---

def test_flyability_go(standard_pilot, aircraft, good_forecast):
    """Test a clear GO case."""
    result = compute_flyability(good_forecast, standard_pilot, aircraft, SurfaceCondition.DRY)
    
    assert result.status == "GO"
    assert result.score == 100
    assert "Conditions look good" in result.reasons[0]

def test_flyability_no_go_wind(standard_pilot, aircraft, good_forecast):
    """Test NO_GO due to high wind."""
    bad_wind = good_forecast.model_copy(update={"wind_speed_kt": 35})
    
    result = compute_flyability(bad_wind, standard_pilot, aircraft, SurfaceCondition.DRY)
    
    assert result.status == "NO_GO"
    assert result.score <= 50
    assert any("Wind speed" in r for r in result.reasons)

def test_flyability_check_cloud(standard_pilot, aircraft, good_forecast):
    """Test CHECK status for marginal cloud base."""
    marginal_cloud = good_forecast.model_copy(update={"cloud_base_ft": 1300})  # Between 1000 and 1500 limit
    
    result = compute_flyability(marginal_cloud, standard_pilot, aircraft, SurfaceCondition.DRY)
    
    assert result.status == "CHECK"
    assert result.score < 100
    assert any("Cloud base" in r for r in result.reasons)

def test_flyability_ice_no_go(standard_pilot, aircraft, good_forecast):
    """Test NO_GO if surface is ICE."""
    result = compute_flyability(good_forecast, standard_pilot, aircraft, SurfaceCondition.ICE)
    
    assert result.status == "NO_GO"
    assert result.score == 0
    assert any("Runway surface is ICE" in r for r in result.reasons)
