"""Tests for backend.bookings — Firestore-backed booking CRUD."""
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from datetime import datetime


@pytest.fixture(autouse=True)
def mock_firebase():
    """Mock Firebase Admin SDK (required for auth middleware)."""
    with patch("backend.auth.firebase_admin") as mock_admin:
        mock_admin.exceptions = MagicMock()
        mock_admin.exceptions.FirebaseError = Exception
        import backend.auth
        backend.auth._app = None
        yield mock_admin


@pytest.fixture(autouse=True)
def mock_google_auth():
    """Mock Google Auth credits to prevent DefaultCredentialsError."""
    with patch("google.auth.default", return_value=(MagicMock(), "test-project")):
        yield


@pytest.fixture
def mock_auth_token():
    """Mock a valid Firebase token for authenticated requests."""
    with patch("backend.auth.firebase_auth.verify_id_token") as mock_verify:
        mock_verify.return_value = {
            "uid": "pilot_123",
            "email": "pilot@strathaven.co.uk",
        }
        yield mock_verify


@pytest.fixture
def mock_firestore(mock_get_db):
    """Mock Firestore client for booking operations."""
    # Reuse the global mock_get_db fixture
    return mock_get_db


@pytest.fixture
def client():
    """Create a TestClient for the FastAPI app."""
    from backend.main import app
    return TestClient(app)


class TestListBookings:
    def test_list_bookings_filters_club(self, client, mock_firestore):
        """Only returns bookings for the requested club slug."""
        # Mock Firestore stream results
        mock_doc = MagicMock()
        mock_doc.id = "bk_1"
        mock_doc.to_dict.return_value = {
            "club_slug": "strathaven",
            "aircraft_reg": "G-CDEF",
            "pilot_uid": "pilot_123",
            "start_time": datetime(2026, 3, 1, 9, 0),
            "end_time": datetime(2026, 3, 1, 11, 0),
            "status": "confirmed",
        }

        mock_query = MagicMock()
        mock_query.where.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.stream.return_value = [mock_doc]
        
        # When chaining wheres, we need to ensure the final call returns the stream
        mock_firestore.collection.return_value = mock_query

        response = client.get("/api/v1/bookings/strathaven")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["club_slug"] == "strathaven"


class TestCreateBooking:
    def test_create_booking_no_auth(self, client, mock_firestore):
        """Creating a booking without auth should return 401."""
        response = client.post("/api/v1/bookings/", json={
            "club_slug": "strathaven",
            "aircraft_reg": "G-CDEF",
            "start_time": "2026-03-01T09:00:00",
            "end_time": "2026-03-01T11:00:00",
        })
        assert response.status_code == 401

    def test_create_booking_success(self, client, mock_firestore, mock_auth_token):
        """Authenticated booking creation should persist and return 200."""
        # Mock no overlaps
        mock_query = MagicMock()
        mock_query.where.return_value = mock_query
        mock_query.stream.return_value = []
        mock_firestore.collection.return_value = mock_query

        # Mock add (returns tuple of (timestamp, doc_ref))
        mock_doc_ref = MagicMock()
        mock_doc_ref.id = "bk_new_1"
        mock_query.add.return_value = (None, mock_doc_ref)

        # Mock get_user_profile to return an instructor (bypasses recency check)
        with patch("backend.auth.get_user_profile") as mock_get_profile:
            mock_get_profile.return_value = {"role": "instructor"}

            response = client.post(
                "/api/v1/bookings/",
                json={
                    "club_slug": "strathaven",
                    "aircraft_reg": "G-CDEF",
                    "start_time": "2026-03-01T09:00:00",
                    "end_time": "2026-03-01T11:00:00",
                },
                headers={"Authorization": "Bearer valid_token"},
            )
            assert response.status_code == 200
        data = response.json()
        assert data["id"] == "bk_new_1"
        assert data["pilot_uid"] == "pilot_123"
        assert data["status"] == "confirmed"

    def test_overlap_detection(self, client, mock_firestore, mock_auth_token):
        """Booking for an already-booked aircraft should return 409."""
        # Mock existing overlapping booking
        mock_existing = MagicMock()
        mock_existing.to_dict.return_value = {
            "end_time": datetime(2026, 3, 1, 11, 0),  # Overlaps with requested 09:00-11:00
        }

        mock_query = MagicMock()
        mock_query.where.return_value = mock_query
        mock_query.stream.return_value = [mock_existing]
        mock_firestore.collection.return_value = mock_query

        # Mock get_user_profile to return an instructor (bypasses recency check)
        with patch("backend.auth.get_user_profile") as mock_get_profile:
            mock_get_profile.return_value = {"role": "instructor"}
            
            # Setup db mock for this test
            mock_query.stream.return_value = [mock_existing]
            mock_firestore.collection.return_value = mock_query

            response = client.post(
                "/api/v1/bookings/",
                json={
                    "club_slug": "strathaven",
                    "aircraft_reg": "G-CDEF",
                    "start_time": "2026-03-01T09:00:00",
                    "end_time": "2026-03-01T11:00:00",
                },
                headers={"Authorization": "Bearer valid_token"},
            )
            assert response.status_code == 409
            assert "already booked" in response.json()["detail"]


class TestCancelBooking:
    def test_cancel_booking(self, client, mock_firestore, mock_auth_token):
        """Cancelling your own booking should set status to cancelled."""
        # Simplified Mock: Return a "Super Doc" that works for both Booking and Club lookups
        mock_super_doc = MagicMock()
        mock_super_doc.exists = True
        mock_super_doc.to_dict.return_value = {
            "pilot_uid": "pilot_123",
            "status": "confirmed",
            "club_slug": "strathaven",
            "calendar_id": "primary" # Added for club lookup
        }

        # Configure global firestore mock chain
        # db.collection(...).document(...).get() -> mock_super_doc
        mock_firestore.collection.return_value.document.return_value.get.return_value = mock_super_doc

        response = client.put(
            "/api/v1/bookings/bk_1/cancel",
            headers={"Authorization": "Bearer valid_token"},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "success"

    def test_cancel_other_users_booking(self, client, mock_firestore, mock_auth_token):
        """Cancelling someone else's booking should return 403."""
        mock_doc = MagicMock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {"pilot_uid": "other_user_456", "status": "confirmed"}

        # db.collection(...).document(...).get() -> mock_doc
        mock_firestore.collection.return_value.document.return_value.get.return_value = mock_doc

        response = client.put(
            "/api/v1/bookings/bk_1/cancel",
            headers={"Authorization": "Bearer valid_token"},
        )
        assert response.status_code == 403
