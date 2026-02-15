"""Tests for backend.auth — Firebase JWT verification middleware."""
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient


# We need to mock Firebase before importing auth module
@pytest.fixture(autouse=True)
def mock_firebase_admin():
    """Mock Firebase Admin SDK so tests don't need real credentials."""
    with patch("backend.auth.firebase_admin") as mock_admin:
        mock_admin.exceptions = MagicMock()
        mock_admin.exceptions.FirebaseError = Exception
        # Reset the module-level _app so it re-initializes
        import backend.auth
        backend.auth._app = None
        yield mock_admin


@pytest.fixture
def mock_verify_id_token():
    """Mock firebase_admin.auth.verify_id_token."""
    with patch("backend.auth.firebase_auth.verify_id_token") as mock_verify:
        yield mock_verify


class TestVerifyToken:
    """Tests for the verify_token FastAPI dependency."""

    def test_missing_auth_header(self, mock_verify_id_token):
        """Request with no Authorization header should return 401."""
        from backend.main import app
        client = TestClient(app)

        response = client.post("/api/v1/bookings/", json={
            "club_slug": "strathaven",
            "aircraft_reg": "G-CDEF",
            "start_time": "2026-03-01T09:00:00",
            "end_time": "2026-03-01T11:00:00",
        })

        assert response.status_code == 401
        assert "Missing" in response.json()["detail"]

    def test_invalid_token(self, mock_verify_id_token):
        """Request with an invalid/expired token should return 401."""
        mock_verify_id_token.side_effect = Exception("Invalid token")

        from backend.main import app
        client = TestClient(app)

        response = client.post(
            "/api/v1/bookings/",
            json={
                "club_slug": "strathaven",
                "aircraft_reg": "G-CDEF",
                "start_time": "2026-03-01T09:00:00",
                "end_time": "2026-03-01T11:00:00",
            },
            headers={"Authorization": "Bearer garbage_token_123"},
        )

        assert response.status_code == 401

    def test_valid_token(self, mock_verify_id_token):
        """Request with a valid Firebase token should pass through with user info."""
        mock_verify_id_token.return_value = {
            "uid": "test_user_123",
            "email": "pilot@strathaven.co.uk",
        }

        from backend.main import app
        # We need to also mock Firestore for the booking creation
        with patch("backend.bookings.get_db") as mock_db:
            mock_collection = MagicMock()
            mock_db.return_value.collection.return_value = mock_collection

            # Mock stream() for overlap check — no overlaps
            mock_collection.where.return_value.where.return_value.where.return_value.stream.return_value = []

            # Mock add() for creating the booking
            mock_doc_ref = MagicMock()
            mock_doc_ref.id = "bk_test_1"
            mock_collection.add.return_value = (None, mock_doc_ref)

            client = TestClient(app)
            response = client.post(
                "/api/v1/bookings/",
                json={
                    "club_slug": "strathaven",
                    "aircraft_reg": "G-CDEF",
                    "start_time": "2026-03-01T09:00:00",
                    "end_time": "2026-03-01T11:00:00",
                },
                headers={"Authorization": "Bearer valid_token_abc"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["pilot_uid"] == "test_user_123"
            assert data["status"] == "confirmed"
