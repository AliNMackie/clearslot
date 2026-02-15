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
