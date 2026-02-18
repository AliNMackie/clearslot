from fastapi.testclient import TestClient
from backend.main import app
from backend.schemas import PilotProfile, AircraftProfile, SurfaceCondition

client = TestClient(app)

# Test Data
pilot_data = {
    "total_hours": 100,
    "hours_on_type": 20,
    "min_vis_m": 3000
}
aircraft_data = {
    "max_demonstrated_crosswind_kt": 15,
    "min_runway_length_m": 300
}

def test_flyability_endpoint_safe():
    """Test the endpoint with a SAFE site ID."""
    response = client.post("/api/v1/flyability/check", json={
        "site_id": "SAFE_SITE",
        "pilot": {
            "licence_type": "NPPL(A)",
            "ratings": ["Microlight"],
            "total_hours": 100.0,
            "hours_on_type": 10.0,
            "supervised_solo_hours": 20.0,
            "logbook": []
        },
        "aircraft": aircraft_data,
        "runway_surface": "dry"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "GO"
    assert data["score"] == 100

def test_flyability_endpoint_windy():
    """Test the endpoint with a WINDY site ID."""
    response = client.post("/api/v1/flyability/check", json={
        "site_id": "WINDY_SITE",
        "pilot": pilot_data,
        "aircraft": aircraft_data,
        "runway_surface": "dry"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "NO_GO"
    assert "Wind speed" in str(data["reasons"])

def test_flyability_endpoint_defaults_time():
    """Test that time is optional."""
    response = client.post("/api/v1/flyability/check", json={
        "site_id": "SAFE_SITE",
        "pilot": pilot_data,
        "aircraft": aircraft_data
    })
    assert response.status_code == 200
