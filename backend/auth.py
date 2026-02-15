"""Firebase Auth JWT verification and role-based access control for FastAPI.

Provides:
  - `verify_token` — require valid Firebase ID Token
  - `require_club_member(club_slug)` — require membership in a club
  - `require_club_admin(club_slug)` — require admin/instructor role at a club

User documents in Firestore: users/{uid}
  { role: "pilot"|"instructor"|"admin", club_slugs: ["strathaven"], ... }
"""
import firebase_admin
from firebase_admin import auth as firebase_auth
from fastapi import Depends, HTTPException, Request

from backend.db import get_db

_app = None


def _init_firebase():
    """Initialize Firebase Admin SDK (idempotent)."""
    global _app
    if _app is None:
        _app = firebase_admin.initialize_app()
    return _app


def verify_token(request: Request) -> dict:
    """FastAPI dependency: extract and verify a Firebase ID token.

    Returns the decoded token dict containing uid, email, etc.
    Raises HTTPException 401 if the token is missing or invalid.
    """
    _init_firebase()

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or malformed Authorization header"
        )

    token = auth_header.split("Bearer ", 1)[1]
    try:
        decoded = firebase_auth.verify_id_token(token)
        return decoded
    except firebase_admin.exceptions.FirebaseError as e:
        from backend.logger import log_event
        log_event("auth_failure", {"error": str(e), "token_prefix": token[:10]}, level="WARNING")
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    except Exception as e:
        from backend.logger import log_event
        log_event("auth_failure", {"error": str(e)}, level="ERROR")
        raise HTTPException(status_code=401, detail="Token verification failed")


def get_user_profile(uid: str) -> dict:
    """Fetch a user's profile from Firestore (users/{uid}).

    Returns the profile dict, or an empty dict if the document doesn't exist.
    """
    db = get_db()
    doc = db.collection("users").document(uid).get()
    if doc.exists:
        return doc.to_dict()
    return {}


def require_club_member(request: Request, user: dict = Depends(verify_token)) -> dict:
    """Dependency: require authenticated user who is a member of the club in the URL.

    Extracts club_slug from path params. Checks Firestore user profile for
    club_slugs list membership. Returns user dict (with profile merged) on success.
    """
    club_slug = request.path_params.get("club_slug") or request.path_params.get("slug")
    if not club_slug:
        raise HTTPException(status_code=400, detail="No club identifier in URL")

    profile = get_user_profile(user["uid"])
    user_clubs = profile.get("club_slugs", [])

    if club_slug not in user_clubs:
        raise HTTPException(
            status_code=403,
            detail=f"You are not a member of club '{club_slug}'"
        )

    return {**user, "profile": profile}


def require_club_admin(request: Request, user: dict = Depends(verify_token)) -> dict:
    """Dependency: require authenticated user with admin/instructor role at the club.

    Checks both club membership AND role. Admins can manage fleet, news, and
    cancel other members' bookings. Instructors have the same admin privileges.
    """
    club_slug = request.path_params.get("club_slug") or request.path_params.get("slug")
    if not club_slug:
        raise HTTPException(status_code=400, detail="No club identifier in URL")

    profile = get_user_profile(user["uid"])
    user_clubs = profile.get("club_slugs", [])
    role = profile.get("role", "pilot")

    if club_slug not in user_clubs:
        raise HTTPException(
            status_code=403,
            detail=f"You are not a member of club '{club_slug}'"
        )

    if role not in ("admin", "instructor"):
        raise HTTPException(
            status_code=403,
            detail="Admin or instructor role required"
        )

    return {**user, "profile": profile}
