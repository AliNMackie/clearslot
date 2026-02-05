# Architecture v1: Lean Space-Connected MVP

This document defines the architectural constraints for ClearSlot v1.
**Goal:** Deliver a robust, flyable product using standard web technologies, avoiding "Space Tech" over-engineering.

## 1. High-Level Stack
*   **Frontend:** React (Vite) hosted on **Netlify**.
*   **Backend:** Python (FastAPI) containerized on **GCP Cloud Run**.
*   **Database:** **Firestore** (for agile schema v1) or **Cloud SQL** (if strict relational needed). *Recommendation: Firestore for MVP speed.*
*   **Auth:** **Firebase Authentication** (Handles social logins & JWTs easily).

## 2. Space & Data Integration (The "No-Go" List)
We utilize space data, but we do not become a data processing facility.

| Feature | **Over-Engineered (AVOID)** 🛑 | **Lean MVP (DO THIS)** ✅ |
| :--- | :--- | :--- |
| **Weather / MAVIS** | Ingesting raw GRIB/NetCDF files from EUMETSAT. Custom WRF modeling. | **Proxy API:** Call Met Office DataHub/MAVIS JSON endpoints. Cache results for 15 mins. |
| **Flyability Logic** | Neural Networks training on historical weather vs. cancellations. | **Deterministic Rules:** Simple "If Cloud < 1000ft THEN No-Go". Configurable thresholds. |
| **Mapping / Hazards** | Hosting a Geoserver/PostGIS cluster. Custom tile generation. | **OS NGD API:** Query simple vector features by radius. Use standard map libraries (Leaflet/Mapbox). |
| **Infrastructure** | Multi-cloud (AWS + GCP), Kubernetes (GKE), Event Sourcing. | **Serverless:** Single Cloud Run service. REST API. Cron jobs via Cloud Scheduler. |

## 3. Service Design (Antigravity Instructions)
When scaffolding new services, follow these patterns:

*   **Monolithic Logic, Serverless Deploy:** Keep the backend logic in a modular monolith structure within one Cloud Run service initially. Do not fracture into microservices until v2.
*   **Stateless:** The backend must be stateless. Persist all data to the DB.
*   **Secrets:** Access `MAVIS_API_KEY` etc. via Environment Variables (Secrets Manager in production), never hardcoded.
*   **Mocking:** All external Space APIs (MAVIS, OS) **MUST** have a local mock implementation enabled by `MOCK_EXTERNAL_APIS=true` env var.

## 4. Deployment Pipeline
*   **GitHub** -> **Netlify** (Frontend Build & Deploy).
*   **GitHub** -> **Cloud Build** -> **Cloud Run** (Backend Container).
