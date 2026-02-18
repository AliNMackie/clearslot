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
        hours_on_type: 10,
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

    const getStatusStyles = (status) => {
        if (status === 'NO_GO') return {
            card: 'border-red-100 bg-red-50/50 hover:border-red-200',
            badge: 'bg-red-100 text-red-700',
            icon: 'text-red-500',
            label: 'No Fly'
        };
        if (status === 'CHECK') return {
            card: 'border-amber-100 bg-amber-50/50 hover:border-amber-200 hover:shadow-amber-100/50',
            badge: 'bg-amber-100 text-amber-700',
            icon: 'text-amber-500',
            label: 'Check'
        };
        if (status === 'GO') return {
            card: 'border-slate-100 bg-white hover:border-emerald-200 hover:shadow-emerald-100/50 hover:-translate-y-0.5',
            badge: 'bg-emerald-100 text-emerald-700',
            icon: 'text-emerald-500',
            label: 'Go'
        };
        return {
            card: 'border-slate-100 bg-slate-50 opacity-50',
            badge: 'bg-slate-100 text-slate-500',
            icon: 'text-slate-400',
            label: 'Unknown'
        };
    };

    // Group slots by Day
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
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
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-5 gap-6 mb-6">
                {days.map((day, i) => (
                    <div key={day} className="text-center">
                        <div className="font-semibold text-slate-700">{day}</div>
                        <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
                            {/* Ideally dynamic date here, but static day name for now is fine */}
                            Upcoming
                        </div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="space-y-4">
                            {/* Mobile Header Skeleton */}
                            <Skeleton className="h-6 w-24 md:hidden mb-2" />
                            <Skeleton className="h-32 w-full rounded-2xl" />
                            <Skeleton className="h-32 w-full rounded-2xl" />
                            <Skeleton className="h-32 w-full rounded-2xl" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-6">
                    {days.map((day, i) => (
                        <div key={day} className="space-y-3">
                            {/* Mobile Day Header */}
                            <div className="md:hidden flex items-center gap-4 pb-2 border-b border-slate-100 mb-4">
                                <span className="font-bold text-lg text-slate-900">{day}</span>
                                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Upcoming</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3">
                                {slotsByDay[i] ? slotsByDay[i].map((slot, idx) => {
                                    const timeLabel = new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    const styles = getStatusStyles(slot.status);
                                    const isClickable = slot.status === 'GO' || slot.status === 'CHECK';

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => isClickable && onSlotClick && onSlotClick(slot)}
                                            className={`
                                                group relative p-4 rounded-xl border transition-all duration-200 ease-out
                                                flex flex-col gap-3
                                                ${styles.card}
                                                ${isClickable ? 'cursor-pointer shadow-sm' : 'cursor-not-allowed'}
                                            `}
                                            title={slot.reasons.join(", ")}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="text-lg font-bold text-slate-700 tracking-tight">
                                                    {timeLabel}
                                                </div>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${styles.badge}`}>
                                                    {styles.label}
                                                </span>
                                            </div>

                                            {/* Score Bar */}
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${slot.status === 'GO' ? 'bg-emerald-500' : slot.status === 'CHECK' ? 'bg-amber-400' : 'bg-red-400'}`}
                                                    style={{ width: `${slot.score}%` }}
                                                ></div>
                                            </div>

                                            {/* Reasons / Action */}
                                            <div className="min-h-[1.25rem] flex items-end">
                                                {isClickable ? (
                                                    <div className="text-sm font-medium text-blue-600 opacity-0 transform translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
                                                        Book Flight &rarr;
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-slate-400 line-clamp-1 italic">
                                                        {slot.reasons[0] || "Conditions unsuitable"}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                                        <p className="text-sm text-slate-400 font-medium">No slots available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Legend */}
            <div className="mt-10 flex flex-wrap justify-center gap-8 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></span>
                    <span className="text-sm font-medium text-slate-600">Perfect Conditions</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-200"></span>
                    <span className="text-sm font-medium text-slate-600">Marginal (Instructor Req)</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-red-400 shadow-sm shadow-red-200"></span>
                    <span className="text-sm font-medium text-slate-600">Unsafe / No-Go</span>
                </div>
            </div>
        </div>
    );
};

export default CalendarWeekView;
