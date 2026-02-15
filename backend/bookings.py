from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from backend.auth import verify_token
from backend.db import get_db
from backend.integrations.calendar_sync import sync_booking_to_calendar, delete_booking_from_calendar

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

# --- Data Models ---

class BookingRequest(BaseModel):
    club_slug: str
    aircraft_reg: str
    instructor_id: Optional[str] = None
    start_time: datetime
    end_time: datetime
    notes: Optional[str] = None
    # pilot_id is derived from auth token — not sent by client

class BookingResponse(BaseModel):
    id: str
    club_slug: str
    aircraft_reg: str
    pilot_uid: str
    instructor_id: Optional[str] = None
    start_time: datetime
    end_time: datetime
    notes: Optional[str] = None
    status: str  # 'confirmed', 'cancelled'

# --- Endpoints ---

@router.get("/{club_slug}", response_model=List[BookingResponse])
async def list_bookings(club_slug: str):
    """
    List all confirmed bookings for a specific club.
    Public endpoint — no auth required (so the calendar grid can load).
    """
    db = get_db()
    docs = (
        db.collection("bookings")
        .where("club_slug", "==", club_slug)
        .where("status", "==", "confirmed")
        .order_by("start_time")
        .stream()
    )
    results = []
    for doc in docs:
        data = doc.to_dict()
        # Firestore timestamps → Python datetime
        if hasattr(data.get("start_time"), "isoformat"):
            pass  # already datetime-compatible
        results.append(BookingResponse(id=doc.id, **data))
    return results


@router.post("/", response_model=BookingResponse)
async def create_booking(booking: BookingRequest, user: dict = Depends(verify_token)):
    """
    Create a new booking. Requires authentication.
    Checks for overlapping bookings on the same aircraft.
    Triggers Google Calendar Sync (Stub).
    """
    db = get_db()

    # 1. Overlap check — same aircraft, overlapping time, confirmed
    existing = (
        db.collection("bookings")
        .where("aircraft_reg", "==", booking.aircraft_reg)
        .where("status", "==", "confirmed")
        .where("start_time", "<", booking.end_time)
        .stream()
    )
    for doc in existing:
        data = doc.to_dict()
        existing_end = data.get("end_time")
        if existing_end and existing_end > booking.start_time:
            raise HTTPException(
                status_code=409,
                detail=f"Aircraft {booking.aircraft_reg} is already booked for an overlapping time slot."
            )

    # 2. Persist to Firestore
    booking_data = {
        **booking.model_dump(),
        "pilot_uid": user["uid"],
        "status": "confirmed",
        "created_at": datetime.utcnow(),
    }
    _, doc_ref = db.collection("bookings").add(booking_data)

    # 3. Build response (exclude internal fields)
    response_data = BookingResponse(id=doc_ref.id, **{
        k: v for k, v in booking_data.items() if k != "created_at"
    })

    # 4. Sync to Google Calendar (stub — fire-and-forget, never block booking)
    try:
        from backend.logger import log_event
        log_event("booking_created", {"booking_id": doc_ref.id, "club": booking.club_slug, "aircraft": booking.aircraft_reg, "pilot": user["uid"]})
        await sync_booking_to_calendar(response_data.model_dump(), "primary")
    except Exception as e:
        print(f"⚠️ Calendar sync failed (non-blocking): {e}")

    return response_data


@router.put("/{booking_id}/cancel")
async def cancel_booking(booking_id: str, user: dict = Depends(verify_token)):
    """
    Cancel an existing booking. Requires authentication.
    Only the booking owner or a club admin can cancel.
    """
    db = get_db()
    doc_ref = db.collection("bookings").document(booking_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking_data = doc.to_dict()

    # Only the pilot who made the booking can cancel it
    # (TODO: also allow club admins once roles are implemented in T09)
    if booking_data.get("pilot_uid") != user["uid"]:
        raise HTTPException(status_code=403, detail="You can only cancel your own bookings")

    doc_ref.update({"status": "cancelled"})
    
    from backend.logger import log_event
    log_event("booking_cancelled", {"booking_id": booking_id, "pilot": user["uid"]})

    try:
        await delete_booking_from_calendar(booking_id, "primary")
    except Exception as e:
        print(f"⚠️ Calendar delete failed (non-blocking): {e}")

    return {"status": "success", "message": "Booking cancelled"}
