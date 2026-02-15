"""Tests for T11 — Per-slot flyability endpoint."""
import pytest
from datetime import datetime
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from backend.schemas import WeatherForecast


@pytest.fixture(autouse=True)
def mock_firebase_admin():
    with patch("backend.auth.firebase_admin") as mock_admin:
        mock_admin.exceptions = MagicMock()
        mock_admin.exceptions.FirebaseError = Exception
        import backend.auth
        backend.auth._app = None
        yield mock_admin


MOCK_FORECAST = WeatherForecast(
    wind_speed_kt=5.0,
    gust_speed_kt=8.0,
    cloud_base_ft=3000.0,
    visibility_m=10000.0,
    precipitation_rate_mm_hr=0.0,
)


class TestFlyabilitySlots:
    """Tests for /api/v1/flyability/slots endpoint."""

    @patch("backend.main.get_forecast", return_value=MOCK_FORECAST)
    def test_returns_array_of_slots(self, mock_forecast):
        """3-hour range with 1-hour slots should return 3 slots."""
        from backend.main import app
        client = TestClient(app)
        resp = client.post("/api/v1/flyability/slots", json={
            "site_id": "SAFE_SITE",
            "start": "2026-06-15T09:00:00",
            "end": "2026-06-15T12:00:00",
            "slot_duration_minutes": 60,
            "pilot": {"total_hours": 100, "hours_on_type": 20},
            "aircraft": {"max_demonstrated_crosswind_kt": 15, "min_runway_length_m": 300},
        })
        assert resp.status_code == 200
        slots = resp.json()
        assert len(slots) == 3
        # Each slot should have GO status with safe weather
        for slot in slots:
            assert slot["status"] == "GO"
            assert slot["score"] == 100
            assert "start" in slot
            assert "end" in slot

    @patch("backend.main.get_forecast", return_value=MOCK_FORECAST)
    def test_start_equals_end_returns_empty(self, mock_forecast):
        """start == end should return empty list, not error."""
        from backend.main import app
        client = TestClient(app)
        resp = client.post("/api/v1/flyability/slots", json={
            "site_id": "SAFE_SITE",
            "start": "2026-06-15T09:00:00",
            "end": "2026-06-15T09:00:00",
            "slot_duration_minutes": 60,
            "pilot": {"total_hours": 100, "hours_on_type": 20},
            "aircraft": {"max_demonstrated_crosswind_kt": 15, "min_runway_length_m": 300},
        })
        assert resp.status_code == 200
        assert resp.json() == []

    @patch("backend.main.get_forecast", return_value=MOCK_FORECAST)
    def test_short_range_single_slot(self, mock_forecast):
        """30-min range with 60-min slot duration → 1 partial slot."""
        from backend.main import app
        client = TestClient(app)
        resp = client.post("/api/v1/flyability/slots", json={
            "site_id": "SAFE_SITE",
            "start": "2026-06-15T09:00:00",
            "end": "2026-06-15T09:30:00",
            "slot_duration_minutes": 60,
            "pilot": {"total_hours": 100, "hours_on_type": 20},
            "aircraft": {"max_demonstrated_crosswind_kt": 15, "min_runway_length_m": 300},
        })
        assert resp.status_code == 200
        slots = resp.json()
        assert len(slots) == 1
        # End should be clamped to request.end, not request.start + 60min
        assert slots[0]["end"] == "2026-06-15T09:30:00"

    @patch("backend.main.get_forecast")
    def test_windy_slot_returns_no_go(self, mock_forecast):
        """Windy weather should produce NO_GO slots."""
        windy = WeatherForecast(
            wind_speed_kt=30.0, gust_speed_kt=40.0,
            cloud_base_ft=3000.0, visibility_m=10000.0,
            precipitation_rate_mm_hr=0.0,
        )
        mock_forecast.return_value = windy

        from backend.main import app
        client = TestClient(app)
        resp = client.post("/api/v1/flyability/slots", json={
            "site_id": "WINDY",
            "start": "2026-06-15T09:00:00",
            "end": "2026-06-15T10:00:00",
            "slot_duration_minutes": 60,
            "pilot": {"total_hours": 100, "hours_on_type": 20},
            "aircraft": {"max_demonstrated_crosswind_kt": 15, "min_runway_length_m": 300},
        })
        assert resp.status_code == 200
        slots = resp.json()
        assert len(slots) == 1
        assert slots[0]["status"] == "NO_GO"
