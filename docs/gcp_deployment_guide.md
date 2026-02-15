# Deployment Guide (Week 3 Update)

This guide covers deploying the Backend to Google Cloud Run and the Frontend to Netlify.

## Backend Deployment (GCP)

### 1. Enable Services
Ensure required APIs are active:
```powershell
gcloud services enable cloudbuild.googleapis.com run.googleapis.com
```

### 2. Deploy Cloud Run Service
Run from project root:
```powershell
gcloud run deploy clearslot-backend `
  --source ./backend `
  --region europe-west2 `
  --allow-unauthenticated `
  --set-env-vars PYTHONPATH=/app `
  --project clearslot-486319
```
*Note the URL provided at the end (e.g., `https://clearslot-backend-xyz.a.run.app`).*

### 3. Deploy Firestore Rules
Upload the security rules to secure your database:
```powershell
firebase deploy --only firestore:rules
```
*Requires Firebase CLI installed and logged in.*

---

## Frontend Deployment (Netlify)

### 1. Prerequisites
Ensure all dependencies are installed. The `firebase` SDK is now included in `package.json`.
```powershell
npm install
```

### 2. Environment Variables
Configure these in your Netlify Site Settings "Environment variables":

| Variable | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://clearslot-backend-xyz.a.run.app/api/v1` | Backend URL from Step 2 |
| `VITE_FIREBASE_API_KEY` | *(Your Firebase Web API Key)* | From Firebase Console |
| `VITE_FIREBASE_AUTH_DOMAIN` | `clearslot-486319.firebaseapp.com` | From Firebase Console |
| `VITE_FIREBASE_PROJECT_ID` | `clearslot-486319` | From Firebase Console |

### 3. Build & Deploy
We have included a `netlify.toml` file that handles SPA routing redirects.
Connect your repository to Netlify and it will auto-detect the build settings:
- **Build command:** `vite build`
- **Publish directory:** `dist`

## Verification
After deployment:
1.  Visit your Netlify URL.
2.  Navigate to `/clubs/strathaven` (should load branding).
3.  Test Login (should redirect to valid Firebase Auth flow).
4.  Admin Portal (requires `admin` role in Firestore user document).

