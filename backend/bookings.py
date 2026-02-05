from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

# --- Data Models ---

class BookingRequest(BaseModel):
    club_slug: str
    aircraft_reg: str
    instructor_id: Optional[str] = None
    start_time: datetime
    end_time: datetime
    pilot_id: str
    notes: Optional[str] = None

class BookingResponse(BookingRequest):
    id: str
    status: str # 'confirmed', 'cancelled'

from integrations.calendar_sync import sync_booking_to_calendar, delete_booking_from_calendar

# --- In-Memory Mock Database ---
mock_bookings_db = []

# --- Endpoints ---

@router.get("/{club_slug}", response_model=List[BookingResponse])
async def list_bookings(club_slug: str):
    """
    List all bookings for a specific club.
    """
    return [b for b in mock_bookings_db if b.club_slug == club_slug]

@router.post("/", response_model=BookingResponse)
async def create_booking(booking: BookingRequest):
    """
    Create a new booking.
    Triggers Google Calendar Sync (Stub).
    """
    # 1. Validation (Overlaps, Flyability check would happen here or in frontend)
    
    # 2. Persist
    new_booking = BookingResponse(
        **booking.dict(),
        id=f"bk_{len(mock_bookings_db) + 1}",
        status="confirmed"
    )
    mock_bookings_db.append(new_booking)
    
    # 3. Sync to Google Calendar
    await sync_booking_to_calendar(new_booking.dict(), "primary")
    
    return new_booking

@router.put("/{booking_id}/cancel")
async def cancel_booking(booking_id: str):
    """
    Cancel an existing booking.
    """
    for b in mock_bookings_db:
        if b.id == booking_id:
            b.status = "cancelled"
            await delete_booking_from_calendar(b.id, "primary")
            return {"status": "success", "message": "Booking cancelled"}
    
    raise HTTPException(status_code=404, detail="Booking not found")
