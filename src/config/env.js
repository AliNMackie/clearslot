// Environment Configuration
// This file centralizes all env var reads so we can opt for a "config object" injection later if needed.

export const config = {
    // Google Cloud Project ID (placeholder for now)
    gcpProjectId: import.meta.env.VITE_GCP_PROJECT_ID || 'clearslot-dev',

    // Future API Base URL for Cloud Run
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.clearslot.space/v1',

    // App Environment
    env: import.meta.env.MODE,
};
