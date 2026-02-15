"""Tests for T09 — Role-based access control (require_club_member, require_club_admin)."""
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient


@pytest.fixture(autouse=True)
def mock_firebase_admin():
    """Mock Firebase Admin SDK so tests don't need real credentials."""
    with patch("backend.auth.firebase_admin") as mock_admin:
        mock_admin.exceptions = MagicMock()
        mock_admin.exceptions.FirebaseError = Exception
        import backend.auth
        backend.auth._app = None
        yield mock_admin


@pytest.fixture
def mock_verify_id_token():
    """Mock firebase_admin.auth.verify_id_token to return a valid user."""
    with patch("backend.auth.firebase_auth.verify_id_token") as mock_verify:
        mock_verify.return_value = {
            "uid": "user_pilot_1",
            "email": "pilot@test.com",
        }
        yield mock_verify


@pytest.fixture
def mock_db():
    """Mock Firestore for admin endpoints."""
    with patch("backend.admin.get_db") as mock_admin_db, \
         patch("backend.auth.get_db") as mock_auth_db:
        db_instance = MagicMock()
        mock_admin_db.return_value = db_instance
        mock_auth_db.return_value = db_instance
        yield db_instance


def _set_user_profile(mock_db, role="pilot", club_slugs=None):
    """Helper: configure mock Firestore to return a user profile."""
    club_slugs = club_slugs or []
    profile_doc = MagicMock()
    profile_doc.exists = True
    profile_doc.to_dict.return_value = {
        "role": role,
        "club_slugs": club_slugs,
    }
    mock_db.collection.return_value.document.return_value.get.return_value = profile_doc


def _set_no_user_profile(mock_db):
    """Helper: configure mock Firestore to return no user profile."""
    profile_doc = MagicMock()
    profile_doc.exists = False
    mock_db.collection.return_value.document.return_value.get.return_value = profile_doc


class TestRequireClubAdmin:
    """Test admin-protected endpoints (T10 news/fleet CRUD uses require_club_admin)."""

    def test_non_member_gets_403(self, mock_verify_id_token, mock_db):
        """User not in club_slugs gets 403."""
        _set_user_profile(mock_db, role="admin", club_slugs=["other-club"])

        from backend.main import app
        client = TestClient(app)
        response = client.post(
            "/api/v1/clubs/strathaven/news",
            json={"title": "Test", "body": "Test body"},
            headers={"Authorization": "Bearer valid_token"},
        )
        assert response.status_code == 403
        assert "not a member" in response.json()["detail"]

    def test_pilot_gets_403_on_admin_endpoint(self, mock_verify_id_token, mock_db):
        """Pilot member (not admin) gets 403 on admin endpoints."""
        _set_user_profile(mock_db, role="pilot", club_slugs=["strathaven"])

        from backend.main import app
        client = TestClient(app)
        response = client.post(
            "/api/v1/clubs/strathaven/news",
            json={"title": "Test", "body": "Test body"},
            headers={"Authorization": "Bearer valid_token"},
        )
        assert response.status_code == 403
        assert "Admin or instructor" in response.json()["detail"]

    def test_admin_can_access(self, mock_verify_id_token, mock_db):
        """Admin member can create news."""
        _set_user_profile(mock_db, role="admin", club_slugs=["strathaven"])

        # Mock the news subcollection add
        mock_doc_ref = MagicMock()
        mock_doc_ref.id = "news_123"
        mock_db.collection.return_value.document.return_value.collection.return_value.add.return_value = (None, mock_doc_ref)

        from backend.main import app
        client = TestClient(app)

        # We need to make get_user_profile return the admin profile,
        # but the subcollection .add() also goes through the same mock chain.
        # Re-configure: first call to .collection("users") returns profile,
        # subsequent calls to .collection("clubs") return subcollection.
        def collection_router(name):
            """Route mock calls to the right Firestore collection."""
            coll = MagicMock()
            if name == "users":
                doc = MagicMock()
                user_doc = MagicMock()
                user_doc.exists = True
                user_doc.to_dict.return_value = {
                    "role": "admin",
                    "club_slugs": ["strathaven"],
                }
                doc.get.return_value = user_doc
                coll.document.return_value = doc
            elif name == "clubs":
                doc = MagicMock()
                sub_coll = MagicMock()
                mock_ref = MagicMock()
                mock_ref.id = "news_123"
                sub_coll.add.return_value = (None, mock_ref)
                doc.collection.return_value = sub_coll
                coll.document.return_value = doc
            return coll

        mock_db.collection.side_effect = collection_router

        response = client.post(
            "/api/v1/clubs/strathaven/news",
            json={"title": "New Rule", "body": "All pilots must..."},
            headers={"Authorization": "Bearer valid_token"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "news_123"
        assert data["title"] == "New Rule"

    def test_instructor_can_access(self, mock_verify_id_token, mock_db):
        """Instructor role also has admin access."""
        _set_user_profile(mock_db, role="instructor", club_slugs=["strathaven"])

        def collection_router(name):
            coll = MagicMock()
            if name == "users":
                doc = MagicMock()
                user_doc = MagicMock()
                user_doc.exists = True
                user_doc.to_dict.return_value = {
                    "role": "instructor",
                    "club_slugs": ["strathaven"],
                }
                doc.get.return_value = user_doc
                coll.document.return_value = doc
            elif name == "clubs":
                doc = MagicMock()
                sub_coll = MagicMock()
                mock_ref = MagicMock()
                mock_ref.id = "news_456"
                sub_coll.add.return_value = (None, mock_ref)
                doc.collection.return_value = sub_coll
                coll.document.return_value = doc
            return coll

        mock_db.collection.side_effect = collection_router

        from backend.main import app
        client = TestClient(app)
        response = client.post(
            "/api/v1/clubs/strathaven/news",
            json={"title": "Safety Brief", "body": "Weather lookout..."},
            headers={"Authorization": "Bearer valid_token"},
        )
        assert response.status_code == 200

    def test_no_profile_gets_403(self, mock_verify_id_token, mock_db):
        """User with no Firestore profile gets 403."""
        _set_no_user_profile(mock_db)

        from backend.main import app
        client = TestClient(app)
        response = client.post(
            "/api/v1/clubs/strathaven/news",
            json={"title": "Test", "body": "Test body"},
            headers={"Authorization": "Bearer valid_token"},
        )
        assert response.status_code == 403
