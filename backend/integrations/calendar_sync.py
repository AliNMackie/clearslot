import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from google.auth import default
from typing import Optional
from datetime import datetime
from backend.logger import log_event

# --- Scopes ---
SCOPES = ['https://www.googleapis.com/auth/calendar']

def get_calendar_service():
    """
    Initializes the Google Calendar API service.
    In Cloud Run, this uses the attached Service Account automatically.
    """
    try:
        # 1. Try to use default credentials (Cloud Run SA)
        credentials, _ = default(scopes=SCOPES)
        return build('calendar', 'v3', credentials=credentials)
    except Exception as e:
        print(f"⚠️ Failed to get default credentials: {e}")
        # 2. Fallback to local service account key if it exists (for local dev)
        key_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        if key_path and os.path.exists(key_path):
            credentials = service_account.Credentials.from_service_account_file(
                key_path, scopes=SCOPES
            )
            return build('calendar', 'v3', credentials=credentials)
        raise e

async def sync_booking_to_calendar(booking_data: dict, calendar_id: str):
    """
    Syncs a booking to the Google Calendar.
    Uses 'extendedProperties' to match events with ClearSlot booking IDs.
    """
    service = get_calendar_service()
    booking_id = booking_data.get('id')
    
    # Prepare event data
    event_body = {
        'summary': f"Flight: {booking_data.get('aircraft_reg')}",
        'description': f"Pilot: {booking_data.get('pilot_uid')}\nNotes: {booking_data.get('notes', '')}",
        'start': {
            'dateTime': booking_data.get('start_time').isoformat() if hasattr(booking_data.get('start_time'), 'isoformat') else booking_data.get('start_time'),
            'timeZone': 'UTC',
        },
        'end': {
            'dateTime': booking_data.get('end_time').isoformat() if hasattr(booking_data.get('end_time'), 'isoformat') else booking_data.get('end_time'),
            'timeZone': 'UTC',
        },
        'extendedProperties': {
            'private': {
                'booking_id': booking_id
            }
        }
    }

    # 1. Check if event already exists
    events_result = service.events().list(
        calendarId=calendar_id,
        privateExtendedProperty=f"booking_id={booking_id}"
    ).execute()
    
    existing_events = events_result.get('items', [])

    if existing_events:
        # Update existing
        event_id = existing_events[0]['id']
        service.events().patch(
            calendarId=calendar_id,
            eventId=event_id,
            body=event_body
        ).execute()
        log_event("calendar_sync_updated", {"booking_id": booking_id, "event_id": event_id})
    else:
        # Insert new
        event = service.events().insert(
            calendarId=calendar_id,
            body=event_body
        ).execute()
        log_event("calendar_sync_created", {"booking_id": booking_id, "event_id": event['id']})

    return True

async def delete_booking_from_calendar(booking_id: str, calendar_id: str):
    """
    Removes a booking from the Google Calendar by searching for its booking_id.
    """
    service = get_calendar_service()
    
    events_result = service.events().list(
        calendarId=calendar_id,
        privateExtendedProperty=f"booking_id={booking_id}"
    ).execute()
    
    existing_events = events_result.get('items', [])
    
    for event in existing_events:
        service.events().delete(
            calendarId=calendar_id,
            eventId=event['id']
        ).execute()
    
    log_event("calendar_sync_deleted", {"booking_id": booking_id})
    return True


import asyncio
from datetime import timedelta, timezone
from backend.db import get_db

async def start_calendar_reconciliation(app):
    """
    Background worker that runs every 30 minutes to reconcile Google Calendar
    events with Firestore bookings. Detects events deleted in GCal that still exist
    in Firestore and flags them as sync_conflicts.
    """
    while True:
        try:
            print("🗓️ Running Google Calendar Reconciliation...")
            db = get_db()
            service = get_calendar_service()
            
            # We only look ahead to avoid downloading years of history
            now = datetime.now(timezone.utc)
            time_min = now.isoformat()
            time_max = (now + timedelta(days=30)).isoformat()
            
            # Fetch all clubs that have a calendar configured
            clubs = db.collection("clubs").stream()
            
            for club in clubs:
                club_data = club.to_dict()
                calendar_id = club_data.get("calendar_id")
                club_slug = club.id
                
                if not calendar_id:
                    continue
                    
                print(f"  Reconciling club: {club_slug} (Cal: {calendar_id})")
                
                # 1. Fetch all GCal events for the window
                try:
                    events_result = service.events().list(
                        calendarId=calendar_id,
                        timeMin=time_min,
                        timeMax=time_max,
                        singleEvents=True,
                        orderBy='startTime'
                    ).execute()
                    gcal_events = events_result.get('items', [])
                except Exception as e:
                    print(f"  ⚠️ Skipping {club_slug} due to GCal fetch error: {e}")
                    continue
                    
                # Extract ClearSlot booking IDs from extendedProperties
                gcal_booking_ids = set()
                for e in gcal_events:
                    props = e.get('extendedProperties', {}).get('private', {})
                    bid = props.get('booking_id')
                    if bid:
                        gcal_booking_ids.add(bid)
                        
                # 2. Fetch all CONFIRMED Firestore bookings for the same window
                # Note: We must fetch using the same time bounds
                fs_bookings = (
                    db.collection("bookings")
                    .where("club_slug", "==", club_slug)
                    .where("status", "==", "confirmed")
                    .where("start_time", ">=", now)
                    .where("start_time", "<=", now + timedelta(days=30))
                    .stream()
                )
                
                fs_docs = {doc.id: doc.to_dict() for doc in fs_bookings}
                
                # 3. Diffing Logic: What exists in Firestore but is missing in GCal?
                active_fs_ids = set(fs_docs.keys())
                missing_in_gcal = active_fs_ids - gcal_booking_ids
                
                if missing_in_gcal:
                    print(f"  ⚠️ Found {len(missing_in_gcal)} split-brain bookings in {club_slug}!")
                    
                    for bid in missing_in_gcal:
                        # Safety: Do not delete! Change status to sync_conflict
                        booking_ref = db.collection("bookings").document(bid)
                        booking_data = fs_docs[bid]
                        
                        booking_ref.update({"status": "sync_conflict"})
                        log_event("calendar_sync_conflict", {"booking_id": bid, "club": club_slug})
                        
                        # Create Admin Notification
                        db.collection("admin_notifications").add({
                            "club_slug": club_slug,
                            "type": "sync_conflict",
                            "message": f"Event missing in Google Calendar for booking {bid} ({booking_data.get('aircraft_reg', 'Unknown')}). Automatically flagged.",
                            "booking_id": bid,
                            "timestamp": datetime.utcnow(),
                            "resolved": False
                        })
                        print(f"    -> Flagged booking {bid} as sync_conflict.")
            
            print("✅ GCal Reconciliation complete.")
            
        except Exception as e:
            print(f"⚠️ GCal Reconciliation worker crashed: {e}")
            
        # Run every 30 minutes
        await asyncio.sleep(1800)
