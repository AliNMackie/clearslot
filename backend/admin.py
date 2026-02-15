"""Admin CRUD endpoints for club news and fleet management (T10).

All endpoints require admin/instructor role via `require_club_admin`.
Data lives in Firestore subcollections: clubs/{slug}/news, clubs/{slug}/fleet.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from backend.auth import require_club_admin
from backend.db import get_db

router = APIRouter(prefix="/api/v1/clubs", tags=["admin"])


# --- Request Models ---

class NewsItem(BaseModel):
    title: str
    body: str
    tag: Optional[str] = "General"

class FleetItem(BaseModel):
    type: str              # e.g. "Ikarus C42"
    registration: str      # e.g. "G-CDEF"
    rate_per_hour: float
    status: str = "online"  # "online" | "maintenance" | "offline"
    permit_expiry: Optional[str] = None  # ISO date string, T12


# --- News CRUD ---

@router.post("/{slug}/news")
async def create_news(slug: str, item: NewsItem, user: dict = Depends(require_club_admin)):
    """Create a news item for a club. Requires admin."""
    db = get_db()
    data = item.model_dump()
    _, doc_ref = db.collection("clubs").document(slug).collection("news").add(data)
    return {"id": doc_ref.id, **data}


@router.put("/{slug}/news/{news_id}")
async def update_news(slug: str, news_id: str, item: NewsItem, user: dict = Depends(require_club_admin)):
    """Update a news item. Requires admin."""
    db = get_db()
    doc_ref = db.collection("clubs").document(slug).collection("news").document(news_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="News item not found")
    data = item.model_dump()
    doc_ref.update(data)
    return {"id": news_id, **data}


@router.delete("/{slug}/news/{news_id}")
async def delete_news(slug: str, news_id: str, user: dict = Depends(require_club_admin)):
    """Delete a news item. Requires admin."""
    db = get_db()
    doc_ref = db.collection("clubs").document(slug).collection("news").document(news_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="News item not found")
    doc_ref.delete()
    return {"status": "deleted", "id": news_id}


# --- Fleet CRUD ---

@router.post("/{slug}/fleet")
async def create_fleet(slug: str, item: FleetItem, user: dict = Depends(require_club_admin)):
    """Add an aircraft to a club's fleet. Requires admin."""
    db = get_db()
    data = item.model_dump()
    doc_id = item.registration.lower().replace(" ", "-")
    db.collection("clubs").document(slug).collection("fleet").document(doc_id).set(data)
    return {"id": doc_id, **data}


@router.put("/{slug}/fleet/{fleet_id}")
async def update_fleet(slug: str, fleet_id: str, item: FleetItem, user: dict = Depends(require_club_admin)):
    """Update an aircraft in the fleet. Requires admin."""
    db = get_db()
    doc_ref = db.collection("clubs").document(slug).collection("fleet").document(fleet_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Aircraft not found")
    data = item.model_dump()
    doc_ref.update(data)
    return {"id": fleet_id, **data}


@router.delete("/{slug}/fleet/{fleet_id}")
async def delete_fleet(slug: str, fleet_id: str, user: dict = Depends(require_club_admin)):
    """Remove an aircraft from the fleet. Requires admin."""
    db = get_db()
    doc_ref = db.collection("clubs").document(slug).collection("fleet").document(fleet_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Aircraft not found")
    doc_ref.delete()
    return {"status": "deleted", "id": fleet_id}
