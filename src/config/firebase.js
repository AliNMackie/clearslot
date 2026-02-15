// Firebase SDK Configuration
// Reads from Vite env vars — set these in .env:
//   VITE_FIREBASE_API_KEY
//   VITE_FIREBASE_AUTH_DOMAIN
//   VITE_GCP_PROJECT_ID (already exists)

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'clearslot-486319.firebaseapp.com',
    projectId: import.meta.env.VITE_GCP_PROJECT_ID || 'clearslot-486319',
};

let app;
let auth;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
} catch (error) {
    console.warn("Firebase initialization failed (likely missing env vars). App will run in degraded mode.", error);
    auth = null;
}

export { auth };
