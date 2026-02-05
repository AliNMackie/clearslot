from pydantic import BaseModel
from typing import Literal

# --- Data Models ---

class ClubMetrics(BaseModel):
    # Inputs for the score
    portal_adoption_rate: float # 0.0 to 1.0 (Members using the portal)
    rag_usage_percent: float    # % of bookings checked against flyability
    calendar_sync_active: bool  # Is 2-way sync enabled?

class ClubOperationalScore(BaseModel):
    score: int # 0-100
    band: Literal["Legacy-Heavy", "In Transition", "Modernised"]
    explanation: str

# --- Core Logic ---

def compute_club_operational_score(metrics: ClubMetrics) -> ClubOperationalScore:
    """
    Calculates the 'ClearSlot Rating' for a club based on their digital adoption.
    """
    score = 0
    
    # 1. Base Score for Syncing
    if metrics.calendar_sync_active:
        score += 40
        
    # 2. Portal Adoption (up to 40 pts)
    score += int(metrics.portal_adoption_rate * 40)
    
    # 3. Safety/RAG Usage (up to 20 pts)
    score += int(metrics.rag_usage_percent * 20)
    
    # helper: Clamp
    score = max(0, min(100, score))
    
    # Banding
    if score >= 80:
        band = "Modernised"
        explanation = "Fully digital operation with real-time safety checks."
    elif score >= 50:
        band = "In Transition"
        explanation = "Moving away from spreadsheets, but some manual processes remain."
    else:
        band = "Legacy-Heavy"
        explanation = "Reliant on paper/spreadsheets. High manual workload."
        
    return ClubOperationalScore(
        score=score,
        band=band,
        explanation=explanation
    )
