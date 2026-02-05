# Project Context: ClearSlot.space

**Current State (06 Feb 2026)**

*   **Platform:** Decision-support "flight day planner" and Club Portal for UK microlight/GA clubs.
*   **Stack:** React (Netlify) + Python/FastAPI (Cloud Run) + Firestore/Mock DB.
*   **Core Concept:** **Decision Support, NOT Auto-Dispatch.** The system calculates "Flyability" (GO/CHECK/NO_GO) but the human pilot/instructor *always* makes the final call.

## Club Portal v1 Direction

We are evolving the proto-CRM into a full Club Portal without rewriting the core.

1.  **Public Branding:** `/clubs/:clubSlug` (Co-branded landing pages).
2.  **Member Portal:** `/clubs/:clubSlug/app` (Authenticated RAG Calendar).
    *   **Feature:** `computeFlyability` determines slot status.
3.  **Admin Portal:** `/clubs/:clubSlug/admin` (Management & Exports).
4.  **Integration:** Google Calendar Sync (wrapping existing booking model).
5.  **Analytics:** `ClubOperationalScore` (Digital maturity rating).

## Architectural Guidelines & Constraints

### 1. "Refactor & Extend" > "Build New"
*   **Do not** introduce competing calendar/CRM models. Use the existing data structures.
*   **Refactor** existing components into `src/calendar/`, `src/crm/` rather than creating duplicates.
*   **Backend:** Keep logic in `backend/` modular (e.g., `analytics/`, `integrations/`).

### 2. Tech Stack Consistency
*   **Frontend:** React on Netlify.
*   **Backend:** Python (FastAPI/Uvicorn) on Google Cloud Run.
*   **Data:** MAVIS (Weather), OS Maps (Terrain), Local DB/Firestore (Data).

### 3. Decision Support Rule
*   **Never** implement auto-approval logic that bypasses human confirmation.
*   Flyability scores are **advisory**. UI must reflect this (e.g., "Check" amber status).

### 4. Development Workflow
Before writing code, explicitly state:
1.  **Which existing modules** are being touched.
2.  **How it fits** into the Club Portal v1 concept.
3.  **Conflict Check:** Ensure no contradiction with previous data models or rules.
