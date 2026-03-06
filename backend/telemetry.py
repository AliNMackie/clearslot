from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from datetime import datetime, timezone, timedelta
from backend.db import get_db
from backend.schemas import TelemetryPayload, Geofence
from backend.geospatial import is_inside_geofence
from backend.logger import log_event

router = APIRouter()

@router.post("")
async def receive_telemetry(payload: TelemetryPayload):
    """
    Ingest a GNSS telemetry point for an aircraft.
    If the aircraft was 'outside' the geofence for >15 mins and has now re-entered,
    find the active booking and mark it complete.
    """
    db = get_db()
    
    # 1. Find the active confirmed booking for this aircraft
    now = datetime.now(timezone.utc)
    b_query = db.collection("bookings") \
        .where("aircraft_reg", "==", payload.aircraft_reg) \
        .where("status", "==", "confirmed") \
        .where("start_time", "<=", now) \
        .where("end_time", ">=", now) \
        .stream()
        
    bookings = list(b_query)
    if not bookings:
        # No active booking, just record telemetry and return (or ignore)
        return {"status": "ignored", "reason": "No active booking"}
        
    booking_doc = bookings[0]
    booking_data = booking_doc.to_dict()
    club_slug = booking_data.get("club_slug")
    
    # 2. Get the club's Geofence
    club_doc = db.collection("clubs").document(club_slug).get()
    if not club_doc.exists:
        return {"status": "error", "reason": "Club not found"}
        
    club_data = club_doc.to_dict()
    geofence_data = club_data.get("geofence")
    if not geofence_data:
        # Geofence not configured for this club, do nothing
        return {"status": "ignored", "reason": "Geofence not configured"}
        
    geofence = Geofence(**geofence_data)
    
    # 3. Calculate Inside/Outside
    is_inside = is_inside_geofence(payload.lat, payload.lon, geofence)
    current_state = "inside" if is_inside else "outside"
    
    # 4. Check previous state
    # For robustness, we store the aircraft state in a separate 'aircraft_state' collection
    state_ref = db.collection("aircraft_state").document(payload.aircraft_reg)
    state_doc = state_ref.get()
    
    # Default to assuming it's inside if we have no history
    prev_state = "inside"
    last_outside_time = None
    
    if state_doc.exists:
        state_data = state_doc.to_dict()
        prev_state = state_data.get("status", "inside")
        last_outside_time = state_data.get("last_outside_time")
        
    # 5. State Machine Logic
    if current_state == "outside" and prev_state == "inside":
        # Aircraft just left the geofence
        state_ref.set({
            "status": "outside",
            "last_outside_time": now.isoformat(),
            "last_updated": now.isoformat()
        }, merge=True)
        return {"status": "tracked", "state": "outside_transition"}
        
    elif current_state == "inside" and prev_state == "outside":
        # Aircraft just returned
        state_ref.set({
            "status": "inside",
            "last_outside_time": None,
            "last_updated": now.isoformat()
        }, merge=True)
        
        # Check if it was outside long enough (e.g., > 15 minutes)
        if last_outside_time:
            time_left = datetime.fromisoformat(last_outside_time)
            # Ensure time_left has tzinfo
            if time_left.tzinfo is None:
                time_left = time_left.replace(tzinfo=timezone.utc)
            duration_outside = (now - time_left).total_seconds()
            
            if duration_outside > (15 * 60):
                # Auto-Close the booking
                booking_doc.reference.update({
                    "status": "completed",
                    "completed_at": now.isoformat(),
                    "completion_reason": "gnss_auto_close"
                })
                log_event("booking_auto_closed", {
                    "booking_id": booking_doc.id,
                    "aircraft_reg": payload.aircraft_reg,
                    "duration_outside_sec": duration_outside
                })
                return {"status": "auto_closed", "booking_id": booking_doc.id}
                
        return {"status": "tracked", "state": "inside_transition_too_short"}
        
    # No transition, just update timestamp
    state_ref.set({
        "status": current_state,
        "last_updated": now.isoformat()
    }, merge=True)
    
    return {"status": "tracked", "state": current_state}
