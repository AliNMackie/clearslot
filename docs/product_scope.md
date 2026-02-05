# Product Scope: v1 vs. Future

This document delineates the feature set for the initial MVP (v1) versus the roadmap for future development.

## v1 Features (MVP)
**Focus:** Microlight Club Operations & Core Safety

*   **Operator Dashboard:**
    *   Real-time RAG (Red-Amber-Green) status for booking slots.
    *   Visual overview of aircraft and pilot availability.
*   **Flyability Scores:**
    *   Per-slot simple "Flyable" calculation based on MAVIS weather limits (Wind/Cloud/Vis).
*   **Simple Legality Checks:**
    *   Basic currency (90-day) and medical expiry validation before booking.
*   **Mock Weather:**
    *   Integration of static/proxy weather data for robust UI testing and demonstration.

## Later Features (Roadmap)
**Focus:** Advanced Automation & Expanded Operations

*   **GNSS Logging:**
    *   Automated block time recording via device GPS.
*   **Non-Standard Operations:**
    *   Balloon chase functionality and off-field landing coordination.
*   **EO Hazard Geofences:**
    *   Using Earth Observation data to define dynamic hazard zones.
*   **Advanced AI Models:**
    *   Predictive maintenance scheduling and personalized weather routing/minima.
