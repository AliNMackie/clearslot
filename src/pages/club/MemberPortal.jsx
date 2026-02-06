import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import CalendarWeekView from '../../calendar/CalendarWeekView';

const MemberPortal = () => {
    const { clubSlug } = useParams();
    const [siteId, setSiteId] = useState("SAFE_SITE");

    return (
        <div className="min-h-screen bg-gray-50">
            {/* App Bar */}
            <div className="bg-white shadow p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">Booking Portal</h1>
                <div className="space-x-4">
                    <Link to={`/clubs/${clubSlug}/admin`} className="text-sm font-medium text-gray-600 hover:text-gray-900">Admin</Link>
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
                    <CalendarWeekView siteId={siteId} />
                </div>
            </main>
        </div>
    );
};

export default MemberPortal;
