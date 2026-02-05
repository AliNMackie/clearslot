import React from 'react';

const AdminDiary = () => {
    // Mock Bookings
    const bookings = [
        { id: 1, pilot: "John Smith", type: "Member Hire", time: "09:00 - 11:00", aircraft: "G-CDEF" },
        { id: 2, pilot: "Sarah Connor", type: "Training", time: "11:30 - 13:00", aircraft: "G-CDEF" },
        { id: 3, pilot: "Admin Block", type: "Maintenance", time: "14:00 - 17:00", aircraft: "G-OXYZ" },
    ];

    return (
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b">
                    <tr>
                        <th className="p-3 font-medium">Time</th>
                        <th className="p-3 font-medium">Aircraft</th>
                        <th className="p-3 font-medium">Pilot / Info</th>
                        <th className="p-3 font-medium">Type</th>
                        <th className="p-3 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {bookings.map(b => (
                        <tr key={b.id} className="hover:bg-gray-50">
                            <td className="p-3">{b.time}</td>
                            <td className="p-3 font-medium">{b.aircraft}</td>
                            <td className="p-3">{b.pilot}</td>
                            <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${b.type === 'Maintenance' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {b.type}
                                </span>
                            </td>
                            <td className="p-3 text-right">
                                <button className="text-gray-400 hover:text-red-500">Cancel</button>
                            </td>
                        </tr>
                    ))}
                    {bookings.length === 0 && (
                        <tr><td colSpan="5" className="p-4 text-center text-gray-500">No bookings found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDiary;
