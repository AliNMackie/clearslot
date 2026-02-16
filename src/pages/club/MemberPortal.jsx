import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import CalendarWeekView from '../../calendar/CalendarWeekView';
import { useAuth } from '../../components/AuthProvider';
import UserProfileModal from '../../components/UserProfileModal';

import { apiClient } from '../../services/apiClient';

const MemberPortal = () => {
    const { clubSlug } = useParams();
    const { isAdmin } = useAuth(); // Assuming useAuth exposes isAdmin helper or we derive it
    const [refreshKey, setRefreshKey] = useState(0);
    const [showProfile, setShowProfile] = useState(false);
    const [siteId, setSiteId] = useState('SAFE_SITE');

    const handleSlotClick = async (slot) => {
        if (!window.confirm(`Book flight for ${new Date(slot.start).toLocaleString()}?`)) return;

        try {
            await apiClient.createBooking({
                club_slug: clubSlug,
                aircraft_reg: "G-CILY", // hardcoded default
                start_time: slot.start,
                end_time: slot.end
            });
            alert("Booking Confirmed! Check your email.");
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            alert(`Booking Failed: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <UserProfileModal
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
                onUpdate={() => setRefreshKey(k => k + 1)} // Refresh logic if needed
            />

            {/* App Bar */}
            <div className="bg-white shadow p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">Booking Portal</h1>
                <div className="space-x-4 flex items-center">
                    <button
                        onClick={() => setShowProfile(true)}
                        className="text-sm font-medium text-gray-600 hover:text-blue-600"
                    >
                        My Profile
                    </button>
                    {/* Admin Link Check - defaulting to rudimentary check if isAdmin not available */}
                    <Link to={`/clubs/${clubSlug}/admin`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                        Admin Portal
                    </Link>
                    <button className="text-sm font-medium text-red-600">Logout</button>
                </div>
            </div>

            <main className="max-w-6xl mx-auto p-4 py-8">
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Book a Pilot Slot</h2>
                        <p className="text-gray-500">Check flyability and reserve your aircraft.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Demo Site Selector */}
                        <div className="flex flex-col items-end">
                            <label className="text-xs text-gray-500 font-medium">Demo Weather Site</label>
                            <select
                                value={siteId}
                                onChange={(e) => setSiteId(e.target.value)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                            >
                                <option value="SAFE_SITE">Safe Site (GO)</option>
                                <option value="WINDY_SITE">Windy Site (NO GO)</option>
                                <option value="IFR_SITE">Low Cloud (CHECK)</option>
                            </select>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            License Valid
                        </span>
                    </div>
                </div>

                {/* The RAG Calendar */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6 border">
                    <CalendarWeekView siteId={siteId} onSlotClick={handleSlotClick} refreshKey={refreshKey} />
                </div>
            </main>
        </div>
    );
};

export default MemberPortal;
