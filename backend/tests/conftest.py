import os
import pytest

@pytest.fixture(autouse=True)
def set_testing_env():
    """Set TESTING env var to prevent real GCP connections."""
    os.environ["TESTING"] = "true"
    os.environ["MOCK_EXTERNAL_APIS"] = "true"
    yield
    if "TESTING" in os.environ:
        del os.environ["TESTING"]

@pytest.fixture(autouse=True)
def mock_get_db():
    """ Globally mock get_db to return a MagicMock client. """
    from unittest.mock import patch, MagicMock
    with patch("backend.db.get_db") as mock_db:
        mock_client = MagicMock()
        mock_db.return_value = mock_client
        yield mock_client
