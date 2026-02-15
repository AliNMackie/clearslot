
import firebase_admin
from firebase_admin import credentials, firestore
import os

# Initialize Firestore
if not firebase_admin._apps:
    # Use default credentials (should work if GOOGLE_APPLICATION_CREDENTIALS is set or in cloud shell)
    # For local emulator, ensure FIRESTORE_EMULATOR_HOST is set or creds are available.
    app = firebase_admin.initialize_app()

db = firestore.client()

clubs = [
    {
        "slug": "strathaven",
        "name": "Strathaven Airfield",
        "logo": "✈️",
        "theme": {
            "primary": "#1e3a8a", # heavy blue
            "secondary": "#fbbf24", # amber
            "accent": "#10b981", # emerald
            "background": "bg-gray-50", 
            "hero_gradient": "bg-gradient-to-r from-blue-900 to-slate-800"
        },
        "site_id": "SAFE_SITE",
        "welcome_message": "Welcome to Scotland's oldest airfield. Home of sport aviation."
    },
    {
        "slug": "sky-high",
        "name": "SkyHigh Microlights",
        "logo": "🌤️",
        "theme": {
            "primary": "#0ea5e9", # sky blue
            "secondary": "#f472b6", # pink
            "accent": "#facc15", # yellow
            "background": "bg-sky-50",
            "hero_gradient": "bg-gradient-to-r from-sky-400 to-blue-500"
        },
        "site_id": "SAFE_SITE", # Use safe for demo
        "welcome_message": "Reach for the skies with SkyHigh at Cumbernauld."
    },
    {
        "slug": "aeroclub-glasgow",
        "name": "AeroClub Glasgow",
        "logo": "🦅",
        "theme": {
            "primary": "#047857", # emerald
            "secondary": "#1f2937", # gray
            "accent": "#dc2626", # red
            "background": "bg-stone-50",
            "hero_gradient": "bg-gradient-to-r from-emerald-800 to-stone-900"
        },
        "site_id": "WINDY_SITE", # Use windy for demo
        "welcome_message": "Glasgow's premier flying club. Excellence in aviation."
    }
]

def seed_clubs():
    print("Seeding clubs...")
    collection = db.collection("clubs")
    for club in clubs:
        slug = club["slug"]
        print(f"  - {slug}")
        collection.document(slug).set(club, merge=True)
    print("Done.")

if __name__ == "__main__":
    seed_clubs()
