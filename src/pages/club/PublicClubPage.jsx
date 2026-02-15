import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import WeatherWidget from '../../components/WeatherWidget';
import { apiClient } from '../../services/apiClient';
import { useClub } from '../../components/ClubProvider';
import Skeleton from '../../components/Skeleton';

const PublicClubPage = () => {
    const { clubSlug } = useParams();
    const { branding, loading: brandingLoading } = useClub();
    const [news, setNews] = useState([]);
    const [fleet, setFleet] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [n, f] = await Promise.all([
                    apiClient.getClubNews(clubSlug),
                    apiClient.getClubFleet(clubSlug)
                ]);
                setNews(n);
                setFleet(f);
            } catch (error) {
                console.error("Failed to load club data", error);
            } finally {
                setDataLoading(false);
            }
        };
        loadData();
    }, [clubSlug]);

    if (brandingLoading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading club details...</div>;
    }

    // Default theme fallback if branding fields missing
    const theme = branding.theme || {
        primary: '#1e3a8a',
        background: 'bg-gray-50',
        hero_gradient: 'bg-gradient-to-r from-blue-900 to-slate-800'
    };

    return (
        <div className={`min-h-screen ${theme.background || 'bg-gray-50'} font-sans`}>
            {/* Dynamic Hero */}
            <div className={`relative ${theme.hero_gradient} text-white py-24 px-4 overflow-hidden`}>
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="max-w-6xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <div className="text-center md:text-left">
                        <div className="text-6xl mb-6 filter drop-shadow-lg animate-bounce-slow">{branding.logo}</div>
                        <h1 className="text-5xl font-extrabold mb-6 tracking-tight">{branding.name}</h1>
                        <p className="text-xl opacity-90 mb-8 font-light max-w-lg">
                            {branding.welcome_message || "Scotland's premier microlight community. Training, touring, and fun flying."}
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
                            <WeatherWidget siteId={branding.siteId || 'SAFE_SITE'} />
                            {/* Floating decorative card behind */}
                            <div className="-z-10 absolute top-4 -right-4 w-full h-full bg-white/10 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Widget (Visible only on small screens) */}
            <div className="md:hidden px-4 -mt-8 relative z-20">
                <WeatherWidget siteId={branding.siteId || 'SAFE_SITE'} />
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto py-16 px-4 grid md:grid-cols-3 gap-12">
                <div className="md:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest News</h2>
                        {dataLoading ? (
                            <div className="space-y-4">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <Skeleton className="h-4 w-20 mb-2" />
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full mt-1" />
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <Skeleton className="h-4 w-20 mb-2" />
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>
                        ) : (
                            news.length === 0 ? <p className="text-gray-500 italic">No recent news.</p> : (
                                <div className="space-y-4">
                                    {news.map(item => (
                                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                            <span className="text-blue-600 text-xs font-bold uppercase tracking-wider">{item.tag || "Update"}</span>
                                            <h3 className="text-xl font-bold mt-1 mb-2">{item.title}</h3>
                                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                                {item.body}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </section>
                </div>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Fleet</h2>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            {dataLoading ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-10 h-10 rounded-full" />
                                        <div className="flex-1">
                                            <Skeleton className="h-4 w-1/2 mb-1" />
                                            <Skeleton className="h-3 w-1/3" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-10 h-10 rounded-full" />
                                        <div className="flex-1">
                                            <Skeleton className="h-4 w-1/2 mb-1" />
                                            <Skeleton className="h-3 w-1/3" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                fleet.length === 0 ? <p className="text-gray-500 italic">Fleet info unavailable.</p> : (
                                    <ul className="space-y-4">
                                        {fleet.map(aircraft => (
                                            <li key={aircraft.id} className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${aircraft.status === 'offline' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {aircraft.type.slice(0, 3)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{aircraft.type}</div>
                                                    <div className="text-xs text-gray-500">{aircraft.registration} • £{aircraft.rate_per_hour}/hr</div>
                                                    {aircraft.status === 'offline' && <div className="text-xs text-red-500 font-bold">Offline</div>}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )
                            )}
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
