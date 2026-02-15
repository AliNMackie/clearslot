"""Seed Firestore with initial club data for development.

Run once with: python -m backend.seed
Requires GOOGLE_CLOUD_PROJECT or GCP_PROJECT_ID env var,
and valid GCP credentials (gcloud auth application-default login).
"""
from backend.db import get_db


def seed():
    db = get_db()

    # --- Pilot Club: Strathaven Airfield (Sportflight Scotland) ---
    club_ref = db.collection("clubs").document("strathaven")
    club_ref.set({
        "name": "Strathaven Airfield",
        "operating_name": "Sportflight Scotland",
        "logo": "✈️",
        "color_gradient": "from-sky-600 to-blue-700",
        "site_id": "STRATHAVEN",  # Unlicensed strip — no ICAO code
        "nearest_icao": "EGPF",   # Glasgow Airport — nearest for METAR weather
        "lat": 55.6786,
        "lng": -3.8611,
        "description": "Strathaven Airfield — home of Sportflight Scotland. NPPL training, experience flights, and club flying in the C42.",
        "website": "https://www.strathavenairfield.co.uk/",
        "calendar_sync": False,
    })
    print("  ✅ clubs/strathaven")

    # Fleet — Strathaven operates C42s
    fleet_ref = club_ref.collection("fleet")
    fleet_ref.document("g-cdef").set({
        "type": "Ikarus C42",
        "registration": "G-CDEF",
        "rate_per_hour": 129,
        "status": "online",
    })
    fleet_ref.document("g-cfab").set({
        "type": "Ikarus C42",
        "registration": "G-CFAB",
        "rate_per_hour": 129,
        "status": "online",
    })
    print("  ✅ clubs/strathaven/fleet (2 aircraft)")

    # News
    news_ref = club_ref.collection("news")
    news_ref.document("welcome").set({
        "title": "Welcome to ClearSlot!",
        "body": "ClearSlot is now live for Strathaven members. Book your slots and check flyability in real time.",
        "tag": "New",
    })
    print("  ✅ clubs/strathaven/news (1 item)")

    # --- Demo Club: AeroClub Glasgow ---
    club_ref2 = db.collection("clubs").document("aeroclub-glasgow")
    club_ref2.set({
        "name": "AeroClub Glasgow",
        "logo": "🛩️",
        "color_gradient": "from-emerald-600 to-teal-700",
        "site_id": "EGPF",
        "nearest_icao": "EGPF",
        "lat": 55.8717,
        "lng": -4.4314,
        "description": "Glasgow's friendly flying club. PPL training and group flying.",
        "website": "",
        "calendar_sync": False,
    })
    print("  ✅ clubs/aeroclub-glasgow")

    print("\n🎉 Seed complete!")


if __name__ == "__main__":
    seed()
