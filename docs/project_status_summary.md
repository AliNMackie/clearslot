# Project Status & Transition Plan

## ✅ Completed Work
We have successfully built and deployed the core "Flyability" feature set and the initial Club Portal structure.

1.  **Backend Engine (Cloud Run)**
    *   **Logic:** `Flyability` engine calculates scores based on wind/cloud/visibility.
    *   **API:** `/api/v1/flyability/check` is live and reachable.
    *   **Architecture:** Modular design (`weather.py`, `flyability.py`, `schemas.py`) ready for expansion.
    *   **Deployment:** Fully automated CI/CD pipeline via GitHub Actions.

2.  **Frontend (Netlify)**
    *   **Public Landing Page:** `/clubs/:clubSlug` dynamic landing page.
    *   **Member Portal:** `/clubs/:clubSlug/app` with calendar integration.
    *   **Visuals:** `WeatherWidget` displaying live (mock) status (GO/NO-GO).

---

## 🚧 Mock Data Audit (Technical Debt)
The following components are currently using "Dummy Data" and need to be connected to real data sources for production use.

### 1. Weather Data (Critical)
*   **Location:** `backend/integrations/weather.py`
*   **Current State:** Returns hardcoded data for `SAFE_SITE`, `WINDY_SITE`, `IFR_SITE`.
*   **Action:** Implement real API call to MAVIS (or MetOffice/OpenWeather) in `get_forecast()`.

### 2. Club Branding & Meta
*   **Location:** `src/pages/club/PublicClubPage.jsx`
*   **Current State:** `getBranding(slug)` function has hardcoded `if/else` logic for "SkyHigh" and "AeroClub".
*   **Action:** Move this to a Backend Database (`Club` table) and fetch via API (`GET /api/v1/clubs/:slug`).

### 3. Recent News & Fleet
*   **Location:** `src/pages/club/PublicClubPage.jsx`
*   **Current State:** Hardcoded HTML in the React component.
*   **Action:** Create Backend endpoints (`/api/v1/clubs/:slug/news`, `/fleet`) and fetch dynamically.

### 4. Member Portal "Demo Mode"
*   **Location:** `src/pages/club/MemberPortal.jsx`
*   **Current State:** Has a "Demo Weather Site" dropdown for testing purposes.
*   **Action:** Remove dropdown. Fetch the *actual* site ID associated with the club from the backend.

### 5. User Permissions
*   **Location:** `MemberPortal.jsx` generic access.
*   **action:** Ensure the logged-in user is actually a member of the club they are trying to view (Backend permission check).

### 6. Authentication System (Missing)
*   **Current State:** ❌ No login page, no session management, no user database.
*   **Impact:** Anyone can access `/clubs/sky-high/app` if they guess the URL. Admin routes are unprotected.
*   **Action:** Implement Auth provider (e.g., Supabase Auth, Firebase, or Clerk) to handle Sign Up / Login for Pilots and Club Admins.

---

## 📋 Recommended Next Steps
1.  **Database Setup:** Create the `clubs` and `branding` tables in Supabase/Postgres.
2.  **Weather Integration:** Get an API Key for a real weather provider and replace the mock function.
3.  **Admin UI:** Build the form for Club Admins to update their "News" and "Fleet" so it appears on the public page.
