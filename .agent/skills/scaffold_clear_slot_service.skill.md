---
name: Scaffold ClearSlot Service
description: Scaffolds a Cloud Run service (Python/TS) for ClearSlot API endpoints.
---

# Skill: Scaffold ClearSlot Service

**Purpose:** Given a high-level spec for an API endpoint, scaffold a Cloud Run service in Python or TypeScript.

## Instructions

When asked to scaffold a service, follow these steps:

1.  **Framework Choice:**
    *   Default to **Python (FastAPI)** for backend/data services.
    *   Use **TypeScript (Express/Node)** only if explicitly requested for frontend-facing BFF (Backend for Frontend) layers.

2.  **Scaffolding Steps:**
    *   **Structure:** Create the standard directory structure:
        ```text
        /service-name
          /src
          Dockerfile
          requirements.txt (or package.json)
          main.py (or index.ts)
        ```
    *   **Route Handlers:** Generate route handlers for the specified endpoints.
    *   **Schemas:** Define Pydantic models (Python) or Zod schemas (TS) for request/response bodies.
    *   **Stubs:** Create stub functions for business logic. Do not implement complex logic initially; return mock data or simple success responses.

3.  **Space Data Hooks:**
    *   Include placeholders/hooks for **MAVIS** (Met Office) and **OS** (Ordnance Survey) configuration.
    *   **Default:** Use mock data sources initially.
    *   **Env Vars:** Define necessary environment variables (e.g., `MAVIS_API_KEY`, `OS_MAPS_KEY`) in a `.env.example` file.

## Example Output Structure (Python)

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class RequestModel(BaseModel):
    # ... fields
    pass

@app.post("/api/v1/resource")
async def create_resource(data: RequestModel):
    # TODO: Connect to Real MAVIS API
    # For now, return mock
    return {"status": "mock_success", "data": data}
```
