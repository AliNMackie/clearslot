from pydantic import BaseModel
from typing import Optional

# --- Data Models ---

class CalendarEvent(BaseModel):
    summary: str
    start: str # ISO format
    end: str   # ISO format
    description: Optional[str] = None
    attendees: Optional[list] = []

# --- Interface ---

async def sync_booking_to_calendar(booking_data: dict, calendar_id: str):
    """
    Syncs a booking to the club's Google Calendar.
    
    TODO:
    1. Authenticate using stored refresh token for the club.
    2. Check if event exists (by extendedProperty booking_id).
    3. Insert or Update event via Google Calendar API.
    """
    print(f"[STUB] Syncing booking {booking_data.get('id')} to Calendar {calendar_id}")
    return True

async def delete_booking_from_calendar(booking_id: str, calendar_id: str):
    """
    Removes a booking from the Google Calendar.
    """
    print(f"[STUB] Removing booking {booking_id} from Calendar {calendar_id}")
    return True
