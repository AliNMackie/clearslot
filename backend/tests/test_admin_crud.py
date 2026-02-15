"""Tests for T10 — Admin CRUD (news & fleet management)."""
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient


@pytest.fixture(autouse=True)
def mock_firebase_admin():
    with patch("backend.auth.firebase_admin") as mock_admin:
        mock_admin.exceptions = MagicMock()
        mock_admin.exceptions.FirebaseError = Exception
        import backend.auth
        backend.auth._app = None
        yield mock_admin


@pytest.fixture
def mock_verify_id_token():
    with patch("backend.auth.firebase_auth.verify_id_token") as mock_verify:
        mock_verify.return_value = {"uid": "admin_1", "email": "admin@test.com"}
        yield mock_verify


def _make_db_router(role="admin", clubs=None, item_exists=True):
    """Create a collection_router for mocked Firestore."""
    clubs = clubs or ["strathaven"]

    def collection_router(name):
        coll = MagicMock()
        if name == "users":
            doc = MagicMock()
            user_doc = MagicMock()
            user_doc.exists = True
            user_doc.to_dict.return_value = {"role": role, "club_slugs": clubs}
            doc.get.return_value = user_doc
            coll.document.return_value = doc
        elif name == "clubs":
            doc = MagicMock()
            sub_coll = MagicMock()
            # add()
            mock_ref = MagicMock()
            mock_ref.id = "item_new"
            sub_coll.add.return_value = (None, mock_ref)
            # get() for update/delete
            item_doc_ref = MagicMock()
            item_doc = MagicMock()
            item_doc.exists = item_exists
            item_doc_ref.get.return_value = item_doc
            sub_coll.document.return_value = item_doc_ref
            doc.collection.return_value = sub_coll
            # set() for fleet create (uses document id)
            coll.document.return_value = doc
        return coll

    return collection_router


@pytest.fixture
def admin_db():
    with patch("backend.admin.get_db") as mock_admin_db, \
         patch("backend.auth.get_db") as mock_auth_db:
        db = MagicMock()
        mock_admin_db.return_value = db
        mock_auth_db.return_value = db
        yield db


class TestNewsCRUD:
    def test_create_news(self, mock_verify_id_token, admin_db):
        admin_db.collection.side_effect = _make_db_router("admin", ["strathaven"])
        from backend.main import app
        client = TestClient(app)
        resp = client.post(
            "/api/v1/clubs/strathaven/news",
            json={"title": "Important Notice", "body": "Runway closed."},
            headers={"Authorization": "Bearer tok"},
        )
        assert resp.status_code == 200
        assert resp.json()["title"] == "Important Notice"

    def test_update_news(self, mock_verify_id_token, admin_db):
        admin_db.collection.side_effect = _make_db_router("admin", ["strathaven"], item_exists=True)
        from backend.main import app
        client = TestClient(app)
        resp = client.put(
            "/api/v1/clubs/strathaven/news/news_1",
            json={"title": "Updated", "body": "New content."},
            headers={"Authorization": "Bearer tok"},
        )
        assert resp.status_code == 200
        assert resp.json()["title"] == "Updated"

    def test_delete_news(self, mock_verify_id_token, admin_db):
        admin_db.collection.side_effect = _make_db_router("admin", ["strathaven"], item_exists=True)
        from backend.main import app
        client = TestClient(app)
        resp = client.delete(
            "/api/v1/clubs/strathaven/news/news_1",
            headers={"Authorization": "Bearer tok"},
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "deleted"

    def test_update_news_not_found(self, mock_verify_id_token, admin_db):
        admin_db.collection.side_effect = _make_db_router("admin", ["strathaven"], item_exists=False)
        from backend.main import app
        client = TestClient(app)
        resp = client.put(
            "/api/v1/clubs/strathaven/news/missing",
            json={"title": "x", "body": "y"},
            headers={"Authorization": "Bearer tok"},
        )
        assert resp.status_code == 404


class TestFleetCRUD:
    def test_create_fleet(self, mock_verify_id_token, admin_db):
        admin_db.collection.side_effect = _make_db_router("admin", ["strathaven"])
        from backend.main import app
        client = TestClient(app)
        resp = client.post(
            "/api/v1/clubs/strathaven/fleet",
            json={"type": "Ikarus C42", "registration": "G-ABCD", "rate_per_hour": 95.0},
            headers={"Authorization": "Bearer tok"},
        )
        assert resp.status_code == 200
        assert resp.json()["registration"] == "G-ABCD"

    def test_delete_fleet(self, mock_verify_id_token, admin_db):
        admin_db.collection.side_effect = _make_db_router("admin", ["strathaven"], item_exists=True)
        from backend.main import app
        client = TestClient(app)
        resp = client.delete(
            "/api/v1/clubs/strathaven/fleet/g-abcd",
            headers={"Authorization": "Bearer tok"},
        )
        assert resp.status_code == 200

    def test_non_admin_cannot_create(self, mock_verify_id_token, admin_db):
        admin_db.collection.side_effect = _make_db_router("pilot", ["strathaven"])
        from backend.main import app
        client = TestClient(app)
        resp = client.post(
            "/api/v1/clubs/strathaven/fleet",
            json={"type": "C42", "registration": "G-XXXX", "rate_per_hour": 80.0},
            headers={"Authorization": "Bearer tok"},
        )
        assert resp.status_code == 403
