import { config } from '../config/env';

/**
 * Service Layer: API Client
 * 
 * Currently serves mock data for local development and Netlify demo.
 * In the future, this will be swapped to fetch data from the GCP Cloud Run endpoints.
 * 
 * TODO: Replace mock returns with fetch(`${config.apiBaseUrl}/...`)
 */

// MOCK DATA structure kept for reference/fallback
const MOCK_BOOKINGS = [
    {
        id: 1,
        status: 'green',
        statusLabel: 'Clear',
        time: '09:00 - 11:00',
        pilot: 'Student: J. Smith',
        asset: 'G-CLER (C152)',
        type: 'Instruction',
        instructor: 'Instr. A',
        reason: 'Wind calm, Vis 10km+'
    }
];

const MOCK_SUGGESTIONS = {
    2: [
        { day: 'Wed', time: '06:00 - 08:30', reason: 'Perfect sunrise window (<4kt)', score: 'Excellent' },
        { day: 'Thu', time: '18:00 - 20:00', reason: 'Sunset clear, light winds', score: 'Good' },
        { day: 'Fri', time: '06:30 - 09:00', reason: 'Good visibility, low gusts', score: 'Good' }
    ],
    3: [
        { day: 'Wed', time: '09:00 - 10:30', reason: 'Best wind window (<8kt)', score: 'Excellent' },
        { day: 'Wed', time: '14:00 - 15:30', reason: 'Cloud base higher (3000ft)', score: 'Good' }
    ]
};

const MOCK_BRIEFING = {
    currentSlot: {
        time: '16:00',
        status: 'marginal', // 'clear', 'marginal', 'no-go'
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

export const apiClient = {
    /**
     * Get the schedule for "Tomorrow"
     */
    getBookings: async () => {
        // Simulating Agentic Data Generation based on "Real" Weather
        return new Promise((resolve) => {
            setTimeout(() => {
                const results = [];
                const hours = [9, 11, 14, 16, 18];

                hours.forEach((hour, i) => {
                    // Mock Flyability Score Calculation
                    // In production, these come from MAVIS API
                    const windGusts = 10 + Math.floor(Math.random() * 20); // 10-30kt
                    const cloudBase = 1200 + Math.floor(Math.random() * 3000); // 1200-4200ft

                    // surface condition simulation
                    const isWetGrass = Math.random() > 0.6;
                    const runwayState = isWetGrass ? 'Soft/Wet' : 'Firm';

                    let status = 'green';
                    let reason = 'Good to fly';

                    // Agent Logic: Determine Go/No-Go
                    if (windGusts > 25 || cloudBase < 1500) {
                        status = 'red';
                        reason = `Weather limits: Gusts ${windGusts}kt, Cloud ${cloudBase}ft`;
                    } else if (windGusts > 15 || cloudBase < 2400 || isWetGrass) {
                        status = 'amber';
                        reason = isWetGrass ? 'Runway Soft/Wet - Check Performance' : `Marginal: Gusts ${windGusts}kt`;
                    }

                    results.push({
                        id: i + 1,
                        time: `${hour}:00 - ${hour + 2}:00`,
                        asset: Math.random() > 0.5 ? 'G-C42A (School)' : 'G-C42B (Club)',
                        type: 'Training',
                        instructor: Math.random() > 0.5 ? 'Capt. Reynolds' : 'Self-Fly',
                        pilot: ['Student Pilot', 'Member Pilot', 'Visiting Pilot'][Math.floor(Math.random() * 3)],
                        status: status,
                        statusLabel: status === 'green' ? 'GO' : (status === 'amber' ? 'CHECK' : 'NO-GO'),
                        reason: reason,
                        runway: runwayState
                    });
                });

                resolve(results);
            }, 500);
        });
    },

    /**
     * Get alternate slot suggestions for a booking
     */
    getSuggestions: async (bookingId) => {
        // TODO: Calls GET /api/v1/suggestions/{bookingId}
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_SUGGESTIONS[bookingId] || []), 600);
        });
    },

    /**
     * Get briefing for the current user/passenger
     */
    getBriefing: async () => {
        // TODO: Calls GET /api/v1/briefing/me
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_BRIEFING), 400);
        })
    },

    // --- Phase 4: Legality Rules Engine Stub ---
    checkLegality: async (pilotProfile, date, aircraft = 'C42') => {
        // Mock legality for now to allow purely offline demo if needed
        return new Promise((resolve) => {
            // 50/50 chance of random issue if backend offline
            const randomIssue = Math.random() > 0.9;
            resolve({
                legal: !randomIssue,
                reason: randomIssue ? "Recency: <3 landings in 90 days" : null
            });
        });
    }
};
