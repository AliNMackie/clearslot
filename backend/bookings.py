from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

from backend.auth import verify_token
from backend.db import get_db
from backend.integrations.calendar_sync import sync_booking_to_calendar, delete_booking_from_calendar

router = APIRouter(prefix="/api/v1/bookings", tags=["bookings"])

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
    
    # --- Validation ---
    if booking.end_time <= booking.start_time:
         raise HTTPException(status_code=400, detail="End time must be after start time")
         
    if booking.start_time < datetime.utcnow() - timedelta(minutes=15):
         # Allow 15 min grace period for "just missed it" or clock skew
         raise HTTPException(status_code=400, detail="Cannot book slots in the past")

    # --- T19: Advanced Booking Constraints ---
    MAX_ACTIVE_BOOKINGS = 3
    CLUB_RECENCY_DAYS = 60
    
    # 0. Get User Profile (to check for instructor role exemption)
    from backend.auth import get_user_profile
    profile = get_user_profile(user["uid"])
    user_role = profile.get("role", "pilot")
    
    # Constraint A: Max Active Bookings
    # Count confirmed bookings in the future for this user
    future_bookings = (
        db.collection("bookings")
        .where("pilot_uid", "==", user["uid"])
        .where("status", "==", "confirmed")
        .where("start_time", ">", datetime.utcnow())
        .stream()
    )
    active_count = sum(1 for _ in future_bookings)
    
    if active_count >= MAX_ACTIVE_BOOKINGS:
        raise HTTPException(
            status_code=403,
            detail=f"Booking limit reached. You can only have {MAX_ACTIVE_BOOKINGS} active bookings at a time."
        )

    # Constraint B: 90-Day (now 60-Day) Club Recency
    # Skip for instructors or admins
    if user_role not in ("instructor", "admin"):
        # Check for ANY confirmed booking in the last 60 days
        cutoff_date = datetime.utcnow() - timedelta(days=CLUB_RECENCY_DAYS)
        
        recent_bookings = (
            db.collection("bookings")
            .where("pilot_uid", "==", user["uid"])
            .where("status", "==", "confirmed")
            .where("start_time", ">", cutoff_date)
            .where("start_time", "<", datetime.utcnow()) # Must be in the past/completed
            .limit(1)
            .stream()
        )
        
        has_recent = any(True for _ in recent_bookings)
        
        # If no recent bookings found, check if they are a "New" member? 
        # For now, strict rule: Must have flown. 
        # (MVP Handling: If they have NEVER flown, they likely need an instructor booking anyway, which we can allow if we add an 'instructor_id' check)
        
        # EXCEPTION: If this new booking HAS an instructor attached, allow it.
        if not has_recent and not booking.instructor_id:
             raise HTTPException(
                status_code=403,
                detail=f"Recency check failed. You haven't flown in {CLUB_RECENCY_DAYS} days. Please book with an instructor."
            )

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
        # Fix: Ensure existing_end is timezone-naive or compatible
        if existing_end:
            if hasattr(existing_end, 'tzinfo') and existing_end.tzinfo:
                existing_end = existing_end.replace(tzinfo=None)
                
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
        
        # Get club calendar_id
        club_doc = db.collection("clubs").document(booking.club_slug).get()
        cal_id = "primary"
        if club_doc.exists:
            cal_id = club_doc.to_dict().get("calendar_id", "primary")
            
        await sync_booking_to_calendar(response_data.model_dump(), cal_id)
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
        # Get club calendar_id
        club_doc = db.collection("clubs").document(booking_data.get("club_slug")).get()
        cal_id = "primary"
        if club_doc.exists:
            cal_id = club_doc.to_dict().get("calendar_id", "primary")
            
        await delete_booking_from_calendar(booking_id, cal_id)
    except Exception as e:
        print(f"⚠️ Calendar delete failed (non-blocking): {e}")

    return {"status": "success", "message": "Booking cancelled"}
