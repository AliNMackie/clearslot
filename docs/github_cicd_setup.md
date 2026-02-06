# GitHub CI/CD Setup Guide

To enable the automated deployment pipeline, you need to create a Service Account in GCP and add its key to GitHub.

## 1. Create Service Account (GCP)
Run these commands in your local terminal (where you are already authenticated):

```powershell
# 1. Create the Service Account
gcloud iam service-accounts create github-deployer --display-name="GitHub Actions Deployer"

# 2. Grant Permissions (Cloud Run Admin + Storage Admin + Service Account User)
gcloud projects add-iam-policy-binding clearslot-486319 --member="serviceAccount:github-deployer@clearslot-486319.iam.gserviceaccount.com" --role="roles/run.admin"
gcloud projects add-iam-policy-binding clearslot-486319 --member="serviceAccount:github-deployer@clearslot-486319.iam.gserviceaccount.com" --role="roles/storage.admin"
gcloud projects add-iam-policy-binding clearslot-486319 --member="serviceAccount:github-deployer@clearslot-486319.iam.gserviceaccount.com" --role="roles/iam.serviceAccountUser"
gcloud projects add-iam-policy-binding clearslot-486319 --member="serviceAccount:github-deployer@clearslot-486319.iam.gserviceaccount.com" --role="roles/artifactregistry.admin"

# 3. Generate Key JSON
gcloud iam service-accounts keys create gcp-key.json --iam-account=github-deployer@clearslot-486319.iam.gserviceaccount.com
```

## 2. Add Secret to GitHub
1.  Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2.  Click **New repository secret**.
3.  **Name:** `GCP_SA_KEY`
4.  **Value:** Copy the entire content of the `gcp-key.json` file you just generated.
5.  Click **Add secret**.

## 3. Trigger Deployment
Simply commit and push your changes to the `main` branch.
The flow defined in `.github/workflows/deploy-backend.yml` will pick up changes to `backend/` and deploy them.

*Note: After the first successful deploy, remember to update `VITE_API_BASE_URL` in Netlify with the new Cloud Run URL.*
