import React from 'react';

// Stub Data for visual prototyping
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOTS = ['09:00', '11:00', '13:00', '15:00', '17:00'];

const CalendarWeekView = () => {
    // Helper to "compute" score for UI demo
    const getSlotStatus = (day, time) => {
        // Deterministic mock logic
        if (day === 'Wed' || day === 'Thu') return { status: 'NO_GO', color: 'bg-red-100 border-red-200 text-red-800' };
        if (day === 'Fri') return { status: 'CHECK', color: 'bg-yellow-100 border-yellow-200 text-yellow-800' };
        return { status: 'GO', color: 'bg-green-100 border-green-200 text-green-800' };
    };

    return (
        <div className="overflow-x-auto">
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
                            const { status, color } = getSlotStatus(day, time);
                            return (
                                <div
                                    key={`${day}-${time}`}
                                    className={`
                                h-16 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition transform hover:scale-105
                                ${color}
                            `}
                                >
                                    <span className="text-xs font-bold">{status}</span>
                                    {/* In real app, clicking opens Booking Modal */}
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
