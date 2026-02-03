import React, { useState, useEffect } from 'react';
import { Clock, User, Plane, Anchor, Info, ArrowRight, AlertTriangle, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import { apiClient } from '../services/apiClient';

// Dynamic import for code splitting the heavy Map library
// Dynamic import for code splitting the heavy Map library
const MapContainer = React.lazy(() => import('./MapContainer'));

const OperatorView = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [suggestions, setSuggestions] = useState([]);
    const [legalityCache, setLegalityCache] = useState({});

    // Helper to generate a compliant Pilot Profile from a name string
    const generateMockProfile = (pilotName) => {
        const isStudent = pilotName.includes("Student");
        return {
            licence_type: isStudent ? "NPPL(A)" : "PPL(A)",
            ratings: ["Microlight", "SEP"],
            total_hours: isStudent ? 15 : 150, // Student fails 32h min
            supervised_solo_hours: isStudent ? 2 : 20, // Student fails 10h min
            microlight_differences_trained: true,
            xc_done: !isStudent,
            single_seat_constraint: false,
            logbook: [
                // Add valid recent experience for non-students
                { date: new Date().toISOString(), hours_pic: isStudent ? 1 : 10, to_landings: 20, instruction: 1 }
            ]
        };
    };

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await apiClient.getBookings();
                setBookings(data);

                // Check legality for each booking immediately
                data.forEach(async (booking) => {
                    const profile = generateMockProfile(booking.pilot);
                    const result = await apiClient.checkLegality(profile, new Date().toISOString());
                    setLegalityCache(prev => ({
                        ...prev,
                        [booking.id]: result
                    }));
                });
            } catch (err) {
                console.error("Failed to load bookings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'green': return '#27AE60';
            case 'amber': return '#F2994A';
            case 'red': return '#EB5757';
            default: return '#ccc';
        }
    };

    const handleSuggest = async (bookingId) => {
        const data = await apiClient.getSuggestions(bookingId);
        setSuggestions(data);
        const booking = bookings.find(b => b.id === bookingId);
        setSelectedBooking(booking);
        setModalOpen(true);
    };

    const StatusBadge = ({ booking }) => {
        const legality = legalityCache[booking.id];
        let displayStatus = booking.status;
        let displayLabel = booking.statusLabel;

        if (legality && !legality.legal) {
            displayStatus = 'red';
            displayLabel = legality.reason || 'Legal Issue';
        }

        const colors = {
            green: 'bg-green-100 text-green-700',
            amber: 'bg-yellow-100 text-yellow-700',
            red: 'bg-red-100 text-red-700'
        };

        const icons = {
            green: <CheckCircle size={14} />,
            amber: <AlertTriangle size={14} />,
            red: <XCircle size={14} />
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit ${colors[displayStatus] || colors.green}`}>
                {icons[displayStatus]}
                {displayLabel}
            </span>
        );
    };

    if (loading) {
        return <div className="container text-center py-12 opacity-50">Loading schedule & checking legality...</div>;
    }

    return (
        <section className="container" style={{ paddingBottom: '4rem' }}>
            <div className="animate-enter delay-200" style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-card-xl)',
                padding: '2rem',
                boxShadow: '0 20px 40px -10px rgba(27, 42, 58, 0.05)'
            }}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="font-serif text-navy" style={{ fontSize: '2rem' }}>Tomorrow's Schedule</h2>
                    <div className="flex gap-2">
                        <span className="text-navy" style={{ opacity: 0.5, fontSize: '0.9rem', fontWeight: 600 }}>TUE 4 FEB</span>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {bookings.map((booking, idx) => (
                        <div
                            key={booking.id}
                            className="flex flex-col md:flex-row items-start md:items-center justify-between animate-enter"
                            style={{
                                animationDelay: `${(idx + 1) * 100}ms`,
                                padding: '1.5rem',
                                border: '1px solid rgba(27, 42, 58, 0.05)',
                                borderRadius: 'var(--radius-card-lg)',
                                backgroundColor: booking.status === 'red' ? 'rgba(235, 87, 87, 0.03)' : 'white',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {/* Left: Status & Time */}
                            <div className="flex items-center gap-4 mb-4 md:mb-0" style={{ minWidth: '200px' }}>
                                <StatusBadge booking={booking} />
                                <div>
                                    <div className="text-navy" style={{ opacity: 0.6, fontSize: '0.85rem' }}>
                                        {booking.time}
                                    </div>
                                </div>
                            </div>

                            {/* Middle: Details */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 md:mb-0">
                                <div>
                                    <div className="flex items-center gap-2 text-navy" style={{ fontWeight: 600 }}>
                                        <User size={16} opacity={0.5} />
                                        {booking.pilot}
                                    </div>
                                    <div className="text-navy" style={{ opacity: 0.6, fontSize: '0.85rem', paddingLeft: '24px' }}>
                                        {booking.type} • {booking.instructor || 'Self-Fly'}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-navy" style={{ fontWeight: 600 }}>
                                        <Plane size={16} opacity={0.5} />
                                        {booking.asset}
                                    </div>
                                    <div className="text-navy" style={{ opacity: 0.6, fontSize: '0.85rem', paddingLeft: '24px' }}>
                                        {/* Show reason if provided or from backend */}
                                        {(!legalityCache[booking.id] || legalityCache[booking.id]?.legal) ? booking.reason : (
                                            <span className="text-red-500 font-medium">Legality Check Failed</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Action */}
                            <div>
                                {(booking.status === 'amber' || booking.status === 'red' || (legalityCache[booking.id] && !legalityCache[booking.id].legal)) ? (
                                    <button
                                        onClick={() => handleSuggest(booking.id)}
                                        className="btn btn-ghost"
                                        style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                                    >
                                        Suggest new times
                                    </button>
                                ) : (
                                    <div style={{ width: '140px' }} />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Map Section */}
            <div className="mt-8 animate-enter delay-300">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 p-1">
                    <div className="p-4 flex justify-between items-center">
                        <h3 className="font-serif text-xl text-navy ml-2">Situational Awareness</h3>
                        <div className="flex gap-2 text-sm bg-gray-100 p-1 rounded-xl">
                            <button className="px-3 py-1 bg-white shadow-sm rounded-lg font-medium text-navy">Satellite</button>
                            <button className="px-3 py-1 text-gray-500 hover:text-navy">Charts</button>
                        </div>
                    </div>
                    {/* Lazy load Map to avoid blocking initial render if needed, though useJsApiLoader handles script loading well */}
                    <div className="h-[400px] w-full bg-gray-50 rounded-2xl overflow-hidden relative">
                        {/* We import MapContainer dynamically or use straight import if performance allows. Using direct import for MVP. */}
                        <React.Suspense fallback={<div className="w-full h-full flex items-center justify-center text-gray-400">Loading Map...</div>}>
                            <MapContainer activeOverlay="circuit" />
                        </React.Suspense>
                    </div>
                </div>
            </div>

            {modalOpen && (
                <SuggestionsModal
                    booking={selectedBooking}
                    suggestions={suggestions}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </section>
    );
};

const SuggestionsModal = ({ booking, suggestions = [], onClose }) => {
    // Note: We now receive 'suggestions' as a prop from the parent

    if (!booking) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(27, 42, 58, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'var(--color-cloud)',
                width: '100%',
                maxHeight: '90vh',
                maxWidth: '600px',
                borderRadius: '30px', /* >=30px requested */
                padding: '2.5rem',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflowY: 'auto'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <h2 className="font-serif text-navy" style={{ fontSize: '2.5rem', lineHeight: 1.1, marginBottom: '2rem' }}>
                    Find a clearer <br />
                    <span className="italic text-sky">slot in the week</span>
                </h2>

                {/* Summary Strip */}
                <div className="flex items-center gap-4 mb-8" style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(27,42,58,0.1)' }}>
                    <div className="text-navy" style={{ fontWeight: 600 }}>{booking.pilot}</div>
                    <div className="text-navy" style={{ opacity: 0.4 }}>|</div>
                    <div className="text-navy" style={{ opacity: 0.7 }}>{booking.asset}</div>
                    <div className="text-navy" style={{ opacity: 0.4 }}>|</div>
                    <div className="text-navy" style={{ opacity: 0.7, textDecoration: 'line-through' }}>{booking.time}</div>
                </div>

                {/* Suggestions */}
                <div className="flex flex-col gap-4 mb-8">
                    {suggestions.length === 0 ? (
                        <div className="p-4 text-center">No better slots found in the next 3 days.</div>
                    ) : (
                        suggestions.map((slot, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4" style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                            }}>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-serif italic text-sky" style={{ fontSize: '1.2rem' }}>{slot.day}</span>
                                        <span className="font-sans text-navy" style={{ fontWeight: 700 }}>{slot.time}</span>
                                    </div>
                                    <div className="text-navy" style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.25rem' }}>
                                        {slot.reason}
                                    </div>
                                </div>
                                <div className="mt-4 sm:mt-0">
                                    <button className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                                        Select
                                    </button>
                                </div>
                            </div>
                        )))}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6" style={{ borderTop: '1px solid rgba(27,42,58,0.1)' }}>
                    <button className="btn btn-primary flex-1">Move booking</button>
                    <button className="btn btn-ghost flex-1" onClick={onClose}>Keep original slot</button>
                </div>

            </div>
        </div>
    );
};

export default OperatorView;
