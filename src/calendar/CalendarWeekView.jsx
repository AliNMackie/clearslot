import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import Skeleton from '../components/Skeleton';

const CalendarWeekView = ({ siteId, onSlotClick, refreshKey }) => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [weekStart, setWeekStart] = useState(new Date());

    // Pilot/Aircraft mockup for flyability checks (in a real app, from context)
    const mockPilot = {
        licence_type: "NPPL(A)",
        ratings: ["Microlight"],
        total_hours: 100,
        supervised_solo_hours: 20,
        logbook: []
    };
    const mockAircraft = {
        max_demonstrated_crosswind_kt: 15,
        min_runway_length_m: 300
    };

    useEffect(() => {
        const fetchSlots = async () => {
            setLoading(true);
            try {
                // Determine start of week (Monday) from today
                // Simple logic: if today is Monday, use today. Else find previous Monday.
                const d = new Date(weekStart);
                const day = d.getDay();
                const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                const monday = new Date(d.setDate(diff));
                monday.setHours(9, 0, 0, 0); // Start at 09:00

                const endFriday = new Date(monday);
                endFriday.setDate(monday.getDate() + 5); // Sat
                endFriday.setHours(18, 0, 0, 0);

                const data = await apiClient.getFlyabilitySlots(
                    siteId,
                    monday.toISOString(),
                    endFriday.toISOString(),
                    mockPilot,
                    mockAircraft,
                    120 // 2 hour slots
                );

                setSlots(data);
            } catch (err) {
                console.error("Failed to fetch slots", err);
            } finally {
                setLoading(false);
            }
        };

        if (siteId) {
            fetchSlots();
        }
    }, [siteId, weekStart, refreshKey]);

    const getStatusColor = (status) => {
        if (status === 'NO_GO') return 'bg-red-100 border-red-200 text-red-800';
        if (status === 'CHECK') return 'bg-yellow-100 border-yellow-200 text-yellow-800';
        if (status === 'GO') return 'bg-green-100 border-green-200 text-green-800';
        return 'bg-gray-50 border-gray-200 text-gray-400';
    };

    // Group slots by Day
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const slotsByDay = {};
    if (slots.length > 0) {
        slots.forEach(slot => {
            const d = new Date(slot.start);
            // simple index mapping 1=Mon, 5=Fri
            const idx = d.getDay() - 1;
            if (idx >= 0 && idx < 5) {
                if (!slotsByDay[idx]) slotsByDay[idx] = [];
                slotsByDay[idx].push(slot);
            }
        });
    }

    return (
        <div className="w-full">
            {/* Desktop Header - Hidden on Mobile */}
            <div className="hidden md:grid grid-cols-5 gap-4 mb-4">
                {days.map((day, i) => (
                    <div key={day} className="text-center font-bold text-gray-500 pb-2 border-b">
                        {day}
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="h-8 w-full md:w-20 mx-auto mb-2 md:hidden" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4">
                    {days.map((day, i) => (
                        <div key={day} className="space-y-3">
                            {/* Mobile Day Header */}
                            <div className="md:hidden font-bold text-lg text-gray-900 border-b pb-1 mb-2">
                                {day}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-2 md:gap-3">
                                {slotsByDay[i] ? slotsByDay[i].map((slot, idx) => {
                                    const timeLabel = new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    const isClickable = slot.status === 'GO' || slot.status === 'CHECK';
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => isClickable && onSlotClick && onSlotClick(slot)}
                                            className={`p-3 rounded-lg border text-center transition hover:shadow-md ${getStatusColor(slot.status)} ${isClickable ? 'cursor-pointer active:scale-95' : 'cursor-not-allowed opacity-75'}`}
                                            title={slot.reasons.join(", ")}
                                        >
                                            <div className="text-xs font-bold opacity-70 mb-1">{timeLabel}</div>
                                            <div className="font-bold">{slot.status.replace("_", " ")}</div>
                                            <div className="text-xs mt-1">{slot.score}/100</div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center text-sm text-gray-300 py-4 col-span-full">No slots</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-gray-500 justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-200 rounded"></div> <span>GO: Safe Limits</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-200 rounded"></div> <span>CHECK: Marginal</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-200 rounded"></div> <span>NO GO: Unsafe</span>
                </div>
            </div>
        </div>
    );
};

export default CalendarWeekView;
