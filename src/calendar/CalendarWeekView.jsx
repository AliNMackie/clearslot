import React, { useState, useEffect } from 'react';

// Stub Data for visual prototyping
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOTS = ['09:00', '11:00', '13:00', '15:00', '17:00'];

const CalendarWeekView = ({ siteId }) => {
    const [flyability, setFlyability] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchFlyability = async () => {
            setLoading(true);
            try {
                // In v2, this would request a range of times
                const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
                const response = await fetch(`${baseUrl}/flyability/check`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        site_id: siteId,
                        pilot: {
                            licence_type: "NPPL(A)",
                            ratings: ["Microlight"],
                            total_hours: 100,
                            supervised_solo_hours: 20,
                            logbook: []
                        },
                        aircraft: {
                            max_demonstrated_crosswind_kt: 15,
                            min_runway_length_m: 300
                        }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    setFlyability(data);
                }
            } catch (err) {
                console.error("Failed to fetch flyability", err);
            } finally {
                setLoading(false);
            }
        };

        if (siteId) {
            fetchFlyability();
        }
    }, [siteId]);


    // Helper to determine slot style based on API response
    const getSlotStyle = (day, time) => {
        if (!flyability || loading) return { status: '...', color: 'bg-gray-50 border-gray-200 text-gray-400' };

        // v1 Hack: Apply the "Current Flyability" to ALL slots to demonstrate the concept (since mock is static)
        const { status } = flyability;

        if (status === 'NO_GO') return { status: 'NO GO', color: 'bg-red-100 border-red-200 text-red-800' };
        if (status === 'CHECK') return { status: 'CHECK', color: 'bg-yellow-100 border-yellow-200 text-yellow-800' };
        return { status: 'GO', color: 'bg-green-100 border-green-200 text-green-800' };
    };

    return (
        <div className="overflow-x-auto">
            {/* Feedback on current logic */}
            {flyability && flyability.reasons.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 text-blue-800 text-sm rounded border border-blue-100">
                    <strong>Note:</strong> {flyability.reasons[0]}
                </div>
            )}

            <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-8 gap-4 mb-4 text-center text-sm font-bold text-gray-500">
                    <div>Time</div>
                    {DAYS.map(d => <div key={d}>{d}</div>)}
                </div>

                {/* Rows */}
                {SLOTS.map(time => (
                    <div key={time} className="grid grid-cols-8 gap-4 mb-4">
                        <div className="flex items-center justify-center text-sm font-medium text-gray-400">
                            {time}
                        </div>
                        {DAYS.map(day => {
                            const { status, color } = getSlotStyle(day, time);
                            return (
                                <div
                                    key={`${day}-${time}`}
                                    className={`
                                h-16 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition transform hover:scale-105
                                ${color}
                            `}
                                >
                                    <span className="text-xs font-bold">{status}</span>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded text-xs text-gray-500 flex gap-4">
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
