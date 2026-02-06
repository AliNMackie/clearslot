# Deployment Cheat Sheet

To ensure a "Green Pass" on first deploy, you MUST set these Environment Variables in your hosting providers.

## 1. Google Cloud Run (Backend)
**Service Name:** `clearslot-backend`
**Project:** `clearslot-486319`

| Variable | Value (Example/Action) |
| :--- | :--- |
| `PYTHONPATH` | `/app` (Defined in Dockerfile, but good to know) |
| `GCP_PROJECT_ID` | `clearslot-486319` |

*Note: The Dockerfile is already configured to expose port 8080.*

## 2. Netlify (Frontend)
**Site:** `clearslot-space`

| Variable | Value | Notes |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://[YOUR-CLOUD-RUN-URL]/api/v1` | **CRITICAL:** You must deploy Backend first to get this URL. |
| `VITE_GCP_PROJECT_ID`| `clearslot-486319` | |
| `VITE_GOOGLE_MAPS_API_KEY` | `[YOUR_KEY]` | Ensure this key is restricted to your Netlify domain. |

## 3. Order of Operations
1.  **Deploy Backend** to Cloud Run.
2.  Copy the **Service URL** (e.g., `https://clearslot-backend-xyz.a.run.app`).
3.  Go to **Netlify** -> Site Settings -> Environment Variables.
4.  Set `VITE_API_BASE_URL` to `[Service URL]/api/v1`.
5.  **Trigger a new deploy** in Netlify (Clear cache & deploy site).
