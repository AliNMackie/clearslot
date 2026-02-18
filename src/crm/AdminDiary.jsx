import React from 'react';

const AdminDiary = () => {
    // Mock Bookings
    const bookings = [
        { id: 1, pilot: "John Smith", type: "Member Hire", time: "09:00 - 11:00", aircraft: "G-CDEF" },
        { id: 2, pilot: "Sarah Connor", type: "Training", time: "11:30 - 13:00", aircraft: "G-CDEF" },
        { id: 3, pilot: "Admin Block", type: "Maintenance", time: "14:00 - 17:00", aircraft: "G-OXYZ" },
    ];

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-200">
                        <th className="pb-3 pl-2 font-semibold text-xs text-slate-500 uppercase tracking-wider">Time</th>
                        <th className="pb-3 font-semibold text-xs text-slate-500 uppercase tracking-wider">Aircraft</th>
                        <th className="pb-3 font-semibold text-xs text-slate-500 uppercase tracking-wider">Pilot</th>
                        <th className="pb-3 font-semibold text-xs text-slate-500 uppercase tracking-wider">Type</th>
                        <th className="pb-3 pr-2 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {bookings.map(b => (
                        <tr key={b.id} className="group hover:bg-slate-50 transition-colors">
                            <td className="py-3 pl-2 text-sm font-medium text-slate-900">{b.time}</td>
                            <td className="py-3 text-sm font-mono text-slate-600 font-bold">{b.aircraft}</td>
                            <td className="py-3 text-sm text-slate-600">
                                <span className="font-medium text-slate-900">{b.pilot}</span>
                            </td>
                            <td className="py-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${b.type === 'Training' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                    b.type === 'Maintenance' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                        'bg-sky-50 text-sky-700 border-sky-100'
                                    }`}>
                                    {b.type}
                                </span>
                            </td>
                            <td className="py-3 pr-2 text-right">
                                <button className="text-xs font-medium text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                                    Cancel
                                </button>
                            </td>
                        </tr>
                    ))}
                    {bookings.length === 0 && (
                        <tr><td colSpan="5" className="py-8 text-center text-slate-400 italic">No bookings found for this period.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDiary;
