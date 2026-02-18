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
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <UserProfileModal
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
                onUpdate={() => setRefreshKey(k => k + 1)}
            />

            {/* Glass/Sticky App Bar */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                            C
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">ClearSlot <span className="text-slate-400 font-normal">Member</span></h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowProfile(true)}
                            className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                        >
                            My Profile
                        </button>
                        {isAdmin && (
                            <Link to={`/clubs/${clubSlug}/admin`} className="hidden sm:block text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                                Admin Portal
                            </Link>
                        )}
                        <button className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors">Logout</button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Book a Pilot Slot</h2>
                        <p className="mt-1 text-slate-500">Check flyability and reserve your aircraft in real-time.</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                        {/* Demo Site Selector */}
                        <div className="flex items-center gap-2 px-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weather Source</label>
                            <select
                                value={siteId}
                                onChange={(e) => setSiteId(e.target.value)}
                                className="border-none bg-transparent text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer hover:text-blue-600"
                            >
                                <option value="SAFE_SITE">Safe Site (GO)</option>
                                <option value="WINDY_SITE">Windy Site (NO GO)</option>
                                <option value="IFR_SITE">Low Cloud (CHECK)</option>
                            </select>
                        </div>
                        <div className="h-6 w-px bg-slate-200 mx-1"></div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                            License Valid
                        </span>
                    </div>
                </div>

                {/* The RAG Calendar */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-1 bg-slate-50 border-b border-slate-200">
                        {/* Optional toolbar area if needed later */}
                    </div>
                    <div className="p-4 sm:p-6">
                        <CalendarWeekView siteId={siteId} onSlotClick={handleSlotClick} refreshKey={refreshKey} />
                    </div>
                </div>

                <div className="mt-6 text-center text-xs text-slate-400">
                    &copy; 2026 ClearSlot Systems. All rights reserved.
                </div>
            </main>
        </div>
    );
};

export default MemberPortal;
