# GCP Deployment Guide (Backend)

This guide will take you through deploying the `backend/` folder to Google Cloud Run.

## Prerequisites
1.  You have the Google Cloud SDK (`gcloud`) installed.
2.  You are logged in: `gcloud auth login`
3.  The correct project is selected: `gcloud config set project clearslot-486319`

## Step-by-Step Deployment

### 1. Enable Required Services (One-time setup)
Run these commands to verify the necessary APIs are active:
```powershell
gcloud services enable cloudbuild.googleapis.com run.googleapis.com
```

### 2. Deploy to Cloud Run
We will use the "source deploy" feature, which uploads your code and builds the container properly in the cloud.

**Run this command from the project root:**

```powershell
gcloud run deploy clearslot-backend `
  --source ./backend `
  --region europe-west2 `
  --allow-unauthenticated `
  --set-env-vars PYTHONPATH=/app `
  --project clearslot-486319
```

*   `--source ./backend`: Tells GCP to upload only the backend folder.
*   `--region europe-west2`: Deploys to London (closest to your UK user base).
*   `--allow-unauthenticated`: Makes the API public (required for your Netlify frontend to reach it).

### 3. Get the URL
Once the command finishes, it will print a URL like:
`https://clearslot-backend-xyz.a.run.app`

### 4. Update Frontend Config
Copy that URL and update your Netlify Environment Variable `VITE_API_BASE_URL` as described in the `deployment_checklist.md`.
