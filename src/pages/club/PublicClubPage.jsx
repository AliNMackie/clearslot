import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import WeatherWidget from '../../components/WeatherWidget';

const PublicClubPage = () => {
    const { clubSlug } = useParams();

    // Mock Branding Logic
    const getBranding = (slug) => {
        if (slug === 'sky-high') return {
            name: 'SkyHigh Microlights',
            color: 'bg-gradient-to-r from-sky-600 to-blue-700',
            logo: '✈️',
            siteId: 'SAFE_SITE' // Demo: Good weather
        };
        if (slug === 'aeroclub-glasgow') return {
            name: 'AeroClub Glasgow',
            color: 'bg-gradient-to-r from-emerald-600 to-teal-700',
            logo: '🦅',
            siteId: 'WINDY_SITE' // Demo: Bad weather
        };
        return {
            name: 'ClearSlot Club',
            color: 'bg-gray-800',
            logo: '🛩️',
            siteId: 'IFR_SITE'
        };
    };

    const branding = getBranding(clubSlug);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Dynamic Hero */}
            <div className={`relative ${branding.color} text-white py-24 px-4 overflow-hidden`}>
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="max-w-6xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <div className="text-center md:text-left">
                        <div className="text-6xl mb-6 filter drop-shadow-lg animate-bounce-slow">{branding.logo}</div>
                        <h1 className="text-5xl font-extrabold mb-6 tracking-tight">{branding.name}</h1>
                        <p className="text-xl opacity-90 mb-8 font-light max-w-lg">
                            Scotland's premier microlight community.
                            Training, touring, and fun flying.
                        </p>
                        <div className="flex gap-4 justify-center md:justify-start">
                            <Link
                                to={`/clubs/${clubSlug}/app`}
                                className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-gray-100 transition transform hover:-translate-y-1"
                            >
                                Member Portal
                            </Link>
                            <button className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition">
                                Learn to Fly
                            </button>
                        </div>
                    </div>

                    {/* Weather Widget Wrapper */}
                    <div className="hidden md:flex justify-end">
                        <div className="w-80 transform rotate-1 hover:rotate-0 transition duration-500">
                            <WeatherWidget siteId={branding.siteId} />
                            {/* Floating decorative card behind */}
                            <div className="-z-10 absolute top-4 -right-4 w-full h-full bg-white/10 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Widget (Visible only on small screens) */}
            <div className="md:hidden px-4 -mt-8 relative z-20">
                <WeatherWidget siteId={branding.siteId} />
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto py-16 px-4 grid md:grid-cols-3 gap-12">
                <div className="md:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest News</h2>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <span className="text-blue-600 text-xs font-bold uppercase tracking-wider">New</span>
                            <h3 className="text-xl font-bold mt-1 mb-2">Summer Fly-out to Oban</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Join us this weekend for our annual trip to Oban.
                                High tide is at 14:00. Briefing at 09:00z in the clubhouse.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition mt-4">
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Maintenance</span>
                            <h3 className="text-xl font-bold mt-1 mb-2">G-CDEF 50hr Check Complete</h3>
                            <p className="text-gray-600 leading-relaxed">
                                The club C42 is back online and ready for booking.
                                Please check the new brake pads during pre-flight.
                            </p>
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Fleet</h2>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">C42</div>
                                    <div>
                                        <div className="font-bold text-gray-900">Ikarus C42</div>
                                        <div className="text-xs text-gray-500">G-CDEF • £95/hr</div>
                                    </div>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">EV</div>
                                    <div>
                                        <div className="font-bold text-gray-900">Eurostar EV97</div>
                                        <div className="text-xs text-gray-500">G-OXYZ • £105/hr</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>
                </div>
            </div>

            {/* ClearSlot Footer */}
            <div className="py-8 text-center border-t bg-white">
                <p className="text-sm text-gray-400">
                    Club Operations powered by <span className="font-bold text-gray-600">ClearSlot</span>.
                </p>
            </div>
        </div>
    );
};

export default PublicClubPage;
