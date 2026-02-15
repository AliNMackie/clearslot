from fastapi import APIRouter, Depends, HTTPException
from backend.auth import verify_token, get_user_profile
from backend.db import get_db
from backend.schemas import UserProfileUpdate

router = APIRouter(prefix="/api/v1/users", tags=["users"])

@router.get("/me")
async def get_current_user_profile(user: dict = Depends(verify_token)):
    """Return the authenticated user's profile (role, club_slugs)."""
    profile = get_user_profile(user["uid"])
    return {
        "uid": user["uid"],
        "email": user.get("email"),
        "role": profile.get("role", "pilot"),
        "club_slugs": profile.get("club_slugs", []),
        "weight_kg": profile.get("weight_kg"),
        "medical_expiry": profile.get("medical_expiry"),
        "license_expiry": profile.get("license_expiry"),
    }

@router.put("/me/profile")
async def update_user_profile(update_data: UserProfileUpdate, user: dict = Depends(verify_token)):
    """Update the authenticated user's profile fields."""
    db = get_db()
    
    # Filter out None values to avoid overwriting with nulls
    data_to_update = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not data_to_update:
        return {"status": "no_change", "message": "No fields provided to update"}

    # Update Firestore
    doc_ref = db.collection("users").document(user["uid"])
    doc_ref.set(data_to_update, merge=True)
    
    from backend.logger import log_event
    log_event("profile_updated", {"uid": user["uid"], "fields": list(data_to_update.keys())})

    return {"status": "success", "updated": data_to_update}
