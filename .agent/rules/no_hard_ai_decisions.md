# Rule: No Hard AI Decisions

**The app is decision support only.**

## Requirements

1.  **Never auto-confirm or dispatch a flight based purely on model output.**
    *   The system must never automatically authorize a flight or booking without human oversight or explicit rule-based validation that includes pilot judgment.
2.  **Always expose reasons and confidence, keep the human pilot/CFI as PIC.**
    *   Any system recommendation (e.g., "Flyable") must be accompanied by the raw data (METARs, TAFs) and a clear statement that the Pilot in Command (PIC) is responsible for the final decision.
