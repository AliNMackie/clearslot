import React from 'react';
import { useParams, Link } from 'react-router-dom';

const PublicClubPage = () => {
    const { clubSlug } = useParams();

    // STUB: Branding would come from API based on clubSlug
    const branding = {
        name: clubSlug === 'sky-high' ? 'SkyHigh Microlights' : 'AeroClub Glasgow',
        color: 'bg-sky-600',
        logo: '✈️'
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <div className={`relative ${branding.color} text-white py-20 px-4`}>
                <div className="max-w-4xl mx-auto text-center">
                    <div className="text-6xl mb-4">{branding.logo}</div>
                    <h1 className="text-4xl font-bold mb-4">Welcome to {branding.name}</h1>
                    <p className="text-xl opacity-90 mb-8">
                        Experience the freedom of flight.
                    </p>
                    <Link
                        to={`/clubs/${clubSlug}/app`}
                        className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition"
                    >
                        Member Login / Book Service
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto py-12 px-4 grid md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-2xl font-bold mb-4">About Us</h2>
                    <p className="text-gray-600">
                        We are a friendly grass-roots club operating modern fixed-wing microlights.
                        Join us for trial flights or full NPPL training.
                    </p>
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-4">Fleet</h2>
                    <ul className="text-gray-600 space-y-2">
                        <li>• C42 Ikarus (G-CDEF)</li>
                        <li>• Eurostar EV97 (G-OXYZ)</li>
                    </ul>
                </div>
            </div>

            {/* ClearSlot Badge */}
            <div className="py-8 text-center border-t">
                <p className="text-sm text-gray-400">
                    Powered by <span className="font-bold text-gray-600">ClearSlot</span>.
                    Modern club management.
                </p>
            </div>
        </div>
    );
};

export default PublicClubPage;
