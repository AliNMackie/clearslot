import { config } from '../config/env';
import { auth } from '../config/firebase';

/**
 * Service Layer: API Client
 *
 * Connects to the real backend API (Cloud Run or localhost).
 * Attaches Firebase auth token to requests when the user is logged in.
 *
 * Endpoints that don't have a backend route yet keep mock data (getSuggestions, getBriefing).
 */

// --- Fetch helper with auth ---

async function fetchWithAuth(path, options = {}) {
    const url = `${config.apiBaseUrl}${path}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };

    // Attach Firebase token if user is logged in
    const user = auth ? auth.currentUser : null;
    if (user) {
        try {
            const token = await user.getIdToken();
            headers['Authorization'] = `Bearer ${token}`;
        } catch (e) {
            console.warn('Could not get auth token:', e);
        }
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`API ${response.status}: ${body || response.statusText}`);
    }

    return response.json();
}

// Booking routes now live at /api/v1/bookings (consistent with other endpoints)
const bookingsBaseUrl = `${config.apiBaseUrl}/bookings`;

async function fetchBookings(path, options = {}) {
    const url = `${bookingsBaseUrl}${path}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };

    const user = auth ? auth.currentUser : null;
    if (user) {
        try {
            const token = await user.getIdToken();
            headers['Authorization'] = `Bearer ${token}`;
        } catch (e) {
            console.warn('Could not get auth token:', e);
        }
    }

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        let errorMessage = text || response.statusText;
        try {
            const json = JSON.parse(text);
            if (json.detail) {
                errorMessage = json.detail; // Clean message from backend
            }
        } catch (e) {
            // Not JSON, use raw text
        }
        throw new Error(errorMessage);
    }
    return response.json();
}

// --- Mock data kept for endpoints not yet on backend ---

const MOCK_SUGGESTIONS = {
    2: [
        { day: 'Wed', time: '06:00 - 08:30', reason: 'Perfect sunrise window (<4kt)', score: 'Excellent' },
        { day: 'Thu', time: '18:00 - 20:00', reason: 'Sunset clear, light winds', score: 'Good' },
        { day: 'Fri', time: '06:30 - 09:00', reason: 'Good visibility, low gusts', score: 'Good' }
    ],
};

const MOCK_BRIEFING = {
    currentSlot: {
        time: '16:00',
        status: 'marginal',
        reason: 'gusting winds'
    },
    recommendedWindow: {
        label: 'Saturday Morning',
        time: '09:30 – 11:00',
        score: '94%',
        details: [
            { type: 'wind', text: 'Lighter winds (5-8kt) suitable for landing.' },
            { type: 'cloud', text: 'Cloud base > 3000ft (Scatter).' }
        ]
    }
};

// --- API Client ---

export const apiClient = {
    /**
     * Get bookings for a club from Firestore (via backend)
     */
    getBookings: async (clubSlug = 'strathaven') => {
        return fetchBookings(`/${clubSlug}`);
    },

    /**
     * Create a new booking
     */
    createBooking: async (booking) => {
        return fetchBookings('/', {
            method: 'POST',
            body: JSON.stringify(booking),
        });
    },

    /**
     * Cancel a booking
     */
    cancelBooking: async (bookingId) => {
        return fetchBookings(`/${bookingId}/cancel`, {
            method: 'PUT',
        });
    },

    /**
     * Check flyability for a site
     */
    checkFlyability: async (siteId, pilot, aircraft, surface = 'dry') => {
        return fetchWithAuth('/flyability/check', {
            method: 'POST',
            body: JSON.stringify({
                site_id: siteId,
                pilot: pilot,
                aircraft: aircraft,
                runway_surface: surface,
            }),
        });
    },

    /**
     * Get user profile (me)
     */
    getUserProfile: async () => {
        return fetchWithAuth('/users/me');
    },

    /**
     * Update user profile (weight, expiry)
     */
    updateUserProfile: async (data) => {
        return fetchWithAuth('/users/me/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Check pilot legality against the backend
     */
    checkLegality: async (pilotProfile, date, aircraft = 'C42') => {
        return fetchWithAuth('/legality/check', {
            method: 'POST',
            body: JSON.stringify({
                pilot: pilotProfile,
                aircraft: aircraft,
                date: date,
            }),
        });
    },

    /**
     * Get club branding from Firestore
     */
    getClub: async (slug) => {
        return fetchWithAuth(`/clubs/${slug}`);
    },

    /**
     * Get club fleet list
     */
    getClubFleet: async (slug) => {
        return fetchWithAuth(`/clubs/${slug}/fleet`);
    },

    /**
     * Get club news
     */
    getClubNews: async (slug) => {
        return fetchWithAuth(`/clubs/${slug}/news`);
    },

    /**
     * Get alternate slot suggestions (still mock — no backend endpoint yet)
     */
    getSuggestions: async (bookingId) => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_SUGGESTIONS[bookingId] || []), 300);
        });
    },

    /**
     * Get briefing for the current user (still mock — no backend endpoint yet)
     */
    getBriefing: async () => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_BRIEFING), 300);
        });
    },

    // --- T10: Admin CRUD ---

    createNews: async (slug, item) => fetchWithAuth(`/clubs/${slug}/news`, {
        method: 'POST', body: JSON.stringify(item),
    }),

    updateNews: async (slug, newsId, item) => fetchWithAuth(`/clubs/${slug}/news/${newsId}`, {
        method: 'PUT', body: JSON.stringify(item),
    }),

    deleteNews: async (slug, newsId) => fetchWithAuth(`/clubs/${slug}/news/${newsId}`, {
        method: 'DELETE',
    }),

    createFleet: async (slug, item) => fetchWithAuth(`/clubs/${slug}/fleet`, {
        method: 'POST', body: JSON.stringify(item),
    }),

    updateFleet: async (slug, fleetId, item) => fetchWithAuth(`/clubs/${slug}/fleet/${fleetId}`, {
        method: 'PUT', body: JSON.stringify(item),
    }),

    deleteFleet: async (slug, fleetId) => fetchWithAuth(`/clubs/${slug}/fleet/${fleetId}`, {
        method: 'DELETE',
    }),

    // --- T11: Per-slot flyability ---

    getFlyabilitySlots: async (siteId, start, end, pilot, aircraft, durationMinutes = 60) => {
        return fetchWithAuth('/flyability/slots', {
            method: 'POST',
            body: JSON.stringify({
                site_id: siteId,
                start, end,
                slot_duration_minutes: durationMinutes,
                pilot, aircraft,
            }),
        });
    },
};
