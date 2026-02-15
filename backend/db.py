"""Firestore client singleton.

Provides a single shared Firestore client instance for the entire backend.
Uses Application Default Credentials (ADC) in production (Cloud Run)
and local credentials (gcloud auth) during development.
"""
import os
from google.cloud import firestore

_client = None


def get_db() -> firestore.Client:
    """Return a cached Firestore client instance."""
    global _client
    if _client is None:
        project = os.environ.get("GCP_PROJECT_ID", "clearslot-486319")
        _client = firestore.Client(project=project)
    return _client
