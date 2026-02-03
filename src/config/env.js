// Environment Configuration
// This file centralizes all env var reads so we can opt for a "config object" injection later if needed.

export const config = {
    // Google Cloud Project ID (placeholder for now)
    gcpProjectId: import.meta.env.VITE_GCP_PROJECT_ID || 'clearslot-dev',

    // Future API Base URL for Cloud Run
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
    GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',

    // App Environment
    env: import.meta.env.MODE,
};
