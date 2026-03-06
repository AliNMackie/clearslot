import { auth } from '../config/firebase';
import { config } from '../config/env';

// Strip trailing /api/v1 if present since our fetch URLs include the full path
const API_BASE = (config.apiBaseUrl || 'http://localhost:8080/api/v1').replace(/\/api\/v1\/?$/, '');

/**
 * Fetches the Day-Grid data (bookings + fleet) for a specific club and date
 * from the secure backend proxy endpoint.
 * 
 * This replaces direct Firestore client reads. All data now flows through
 * the FastAPI backend which enforces JWT auth + club membership.
 */
export const getDayGrid = async (clubSlug, date) => {
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;

    const token = await auth.currentUser?.getIdToken();
    if (!token) {
        throw new Error('Not authenticated');
    }

    const response = await fetch(
        `${API_BASE}/api/v1/clubs/${clubSlug}/grid?date=${dateStr}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Grid fetch failed: ${response.status}`);
    }

    return response.json();
};

/**
 * Resolves raw reservations onto a 15-minute grid for the UI.
 * Returns an object keyed by aircraft_reg, containing arrays of slot data.
 */
export const resolveGridData = (bookings, fleetRegs, date, weather_advisories = []) => {
    const grid = {};

    const START_MIN = 8 * 60;
    const END_MIN = 20 * 60;
    const SLOT_DURATION = 15;

    fleetRegs.forEach(reg => {
        grid[reg] = [];
        for (let m = START_MIN; m < END_MIN; m += SLOT_DURATION) {
            const slotTime = new Date(date);
            slotTime.setHours(Math.floor(m / 60), m % 60, 0, 0);

            // Match weather advisory for this hour (or fallback to dummy for demo if missing)
            const hour = slotTime.getHours();
            const advisory = weather_advisories.find(a => a.hour === hour) || {
                status: hour === 9 || hour === 14 ? 'Red' : (hour === 11 || hour === 16 ? 'Amber' : 'Green'),
                flyability_score: hour === 9 ? 20 : (hour === 11 ? 60 : 95),
                primary_constraint: hour === 9 ? 'Crosswind: 25kts' : (hour === 11 ? 'Cloud Base: 800ft' : 'Clear'),
                raw_weather_payload: { wind: '25kts', clouds: hour === 11 ? '800ft' : 'Clear' }
            };

            grid[reg].push({
                time: slotTime,
                timeString: slotTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isBooked: false,
                booking: null,
                status: advisory.status,
                flyability_score: advisory.flyability_score,
                primary_constraint: advisory.primary_constraint,
                raw_weather_payload: advisory.raw_weather_payload
            });
        }
    });

    bookings.forEach(booking => {
        const reg = booking.aircraft_reg;
        if (!grid[reg]) return;

        const bookingStartMs = new Date(booking.start_time).getTime();
        const bookingEndMs = new Date(booking.end_time).getTime();

        grid[reg].forEach(slot => {
            const slotStart = slot.time.getTime();
            if (slotStart >= bookingStartMs && slotStart < bookingEndMs) {
                slot.isBooked = true;
                slot.booking = booking;
            }
        });
    });

    return grid;
};
