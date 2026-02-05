# Space & Geo Assets Connection

This document outlines the specific space and geospatial assets integrated into the ClearSlot platform for versions v1 and v2. We strictly adhere to these sources and do not introduce hypothetical sensors or unverified data streams.

## Core Assets & Data Sources

### 1. MAVIS via Met Office DataHub
*   **Source:** Met Office DataHub (API context: "MAVIS").
*   **Purpose:**
    *   **Flyability:** Provides authoritative, real-time, and forecasted weather data (METARs, TAFs) critical for "Go/No-Go" decisions.
    *   **Safety:** Delivers granular wind, cloud base, and visibility metrics to calculate per-slot flyability scores for microlight operations.

### 2. OS NGD (National Geographic Database) & OS Maps
*   **Source:** Ordnance Survey (OS) APIs.
*   **Purpose:**
    *   **Field/Landing Safety:** Detailed topographic and distinct surface data to assess landing strips and airfield environments.
    *   **Situational Awareness:** High-fidelity mapping for pilot planning and hazard awareness around airfields and operational zones.

### 3. GNSS (Global Navigation Satellite System) Logs
*   **Source:** Device-native logs (tablets/smartphones used by pilots).
*   **Purpose:**
    *   **Logging:** Automated flight time recording (block-off to block-on).
    *   **Verification:** Validating landing/take-off locations against booked slots to confirm usage and adherence to club rules.

---
**Rule:** Use ONLY these defined assets. Do not invent new satellite constellations or hypothetical IoT sensors.
