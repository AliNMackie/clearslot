import { config } from '../config/env';

/**
 * Service Layer: API Client
 * 
 * Currently serves mock data for local development and Netlify demo.
 * In the future, this will be swapped to fetch data from the GCP Cloud Run endpoints.
 * 
 * TODO: Replace mock returns with fetch(`${config.apiBaseUrl}/...`)
 */

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
    },
    {
        id: 2,
        status: 'amber',
        statusLabel: 'Borderline',
        time: '11:30 - 13:00',
        pilot: 'Hirer: M. Doe',
        asset: 'G-BLLN (Balloon)',
        type: 'Self-Fly Hire',
        reason: 'Gusts 15kt, Cloudbase 2000ft'
    },
    {
        id: 3,
        status: 'red',
        statusLabel: 'No-go',
        time: '14:00 - 15:30',
        pilot: 'Student: K. Jones',
        asset: 'G-CLER (C152)',
        type: 'Instruction',
        reason: 'Crosswind out of limits (18kt)'
    },
    {
        id: 4,
        status: 'green',
        statusLabel: 'Clear',
        time: '16:00 - 17:00',
        pilot: 'Exper: P. White',
        asset: 'G-WXYZ (PA28)',
        type: 'Experience',
        reason: 'Conditions improve'
    },
    {
        id: 5,
        status: 'red',
        statusLabel: 'Local Only',
        time: '17:30 - 19:00',
        pilot: 'Member: R. Alpha',
        asset: 'G-BLLN (Balloon)',
        type: 'Club Fly',
        reason: 'Thermals active, wait for sunset'
    }
];

const MOCK_SUGGESTIONS = {
    // Suggestions for Booking ID 2 (Balloon - Borderline)
    2: [
        { day: 'Wed', time: '06:00 - 08:30', reason: 'Perfect sunrise window (<4kt)', score: 'Excellent' },
        { day: 'Thu', time: '18:00 - 20:00', reason: 'Sunset clear, light winds', score: 'Good' },
        { day: 'Fri', time: '06:30 - 09:00', reason: 'Good visibility, low gusts', score: 'Good' }
    ],
    // Suggestions for Booking ID 3 (C152 - No-go)
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
        // TODO: Calls GET /api/v1/schedule/tomorrow
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_BOOKINGS), 500); // Simulate network delay
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
    }

};
