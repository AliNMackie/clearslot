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
            {/* Dashboard Container - Rebuilt with Inline Styles for safety */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(12px)',
                borderRadius: '40px',
                padding: '2.5rem',
                border: '1px solid rgba(255,255,255,0.8)',
                boxShadow: '0 20px 50px -10px rgba(27, 42, 58, 0.05)'
            }}>

                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', color: 'rgba(27,42,58,0.4)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                            Operational Overview
                        </div>
                        <h2 className="font-serif text-navy" style={{ fontSize: '2.5rem', lineHeight: 1 }}>
                            Tomorrow's <span style={{ fontStyle: 'italic', color: 'var(--color-sky-blue)' }}>Flight Deck</span>
                        </h2>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {/* Date Pill */}
                        <div style={{ background: 'white', padding: '0.6rem 1.25rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                            <Clock size={18} color="var(--color-sky-blue)" />
                            <span style={{ fontWeight: 700, color: 'var(--color-navy)' }}>Tue, Feb 4</span>
                        </div>
                        {/* Weather Pill */}
                        <div style={{ background: 'var(--color-navy)', color: 'white', padding: '0.6rem 1.25rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 10px 20px -5px rgba(27,42,58,0.3)' }}>
                            <Info size={18} color="var(--color-sky-blue)" />
                            <span style={{ fontWeight: 500 }}>QNH 1012 • Vis 10km+</span>
                        </div>
                    </div>
                </div>

                {/* Cards List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {bookings.map((booking, idx) => (
                        <div
                            key={booking.id}
                            className="booking-card" // We can try to rely on some base styles, but mainly inline
                            style={{
                                display: 'flex',
                                flexDirection: 'row', // Force row layou
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'white',
                                borderRadius: '24px',
                                padding: '1.5rem',
                                position: 'relative',
                                overflow: 'hidden', // For the stripe
                                boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                                border: '1px solid rgba(27, 42, 58, 0.03)',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                flexWrap: 'wrap', // Allow wrap on tiny screens
                                gap: '1.5rem'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 12px 24px -5px rgba(0,0,0,0.06)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.02)';
                            }}
                        >
                            {/* Status Stripe */}
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: '12px',
                                bottom: '12px',
                                width: '6px',
                                borderTopRightRadius: '99px',
                                borderBottomRightRadius: '99px',
                                background: getStatusColor(booking.status)
                            }} />

                            {/* Left: Time & Badge */}
                            <div style={{ minWidth: '160px', paddingLeft: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(booking.status) }} />
                                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-navy)', opacity: 0.8 }}>{booking.time}</span>
                                </div>
                                <StatusBadge booking={booking} />
                            </div>

                            {/* Middle: Info */}
                            <div style={{ flex: 1, display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                {/* Pilot */}
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', minWidth: '200px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-cloud)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(27,42,58,0.4)' }}>
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-navy)', lineHeight: 1.2 }}>{booking.pilot}</div>
                                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(27,42,58,0.5)', marginTop: '0.25rem', fontWeight: 600 }}>
                                            {booking.instructor ? (
                                                <span style={{ color: '#D97706', background: '#FEF3C7', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>TRAINING</span>
                                            ) : 'SELF-FLY'}
                                            • {booking.type}
                                        </div>
                                    </div>
                                </div>

                                {/* Asset */}
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', minWidth: '220px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-cloud)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(27,42,58,0.4)' }}>
                                        <Plane size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-navy)', lineHeight: 1.2 }}>{booking.asset}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'rgba(27,42,58,0.6)', marginTop: '0.25rem' }}>
                                            {(!legalityCache[booking.id] || legalityCache[booking.id]?.legal) ? (
                                                booking.reason
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#E11D48', fontWeight: 500 }}>
                                                    <AlertTriangle size={14} />
                                                    <span>CHECK FAILED</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Action */}
                            <div style={{ minWidth: '140px', display: 'flex', justifyContent: 'flex-end' }}>
                                {(booking.status === 'amber' || booking.status === 'red' || (legalityCache[booking.id] && !legalityCache[booking.id].legal)) && (
                                    <button
                                        onClick={() => handleSuggest(booking.id)}
                                        style={{
                                            padding: '0.6rem 1.2rem',
                                            borderRadius: '12px',
                                            background: 'var(--color-cloud)',
                                            color: 'var(--color-navy)',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'var(--color-navy)';
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'var(--color-cloud)';
                                            e.currentTarget.style.color = 'var(--color-navy)';
                                        }}
                                    >
                                        <span>Find new time</span>
                                        <ArrowRight size={14} />
                                    </button>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
            </div>

            {/* Map Section */}
            <div className="mt-8">
                <div style={{
                    background: 'white',
                    borderRadius: '32px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    border: '1px solid rgba(27,42,58,0.05)'
                }}>
                    <div style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(47, 128, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-sky-blue)' }}>
                                <Anchor size={20} />
                            </div>
                            <div>
                                <h3 className="font-serif text-navy" style={{ fontSize: '1.25rem', margin: 0 }}>Strathaven Overlay</h3>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(27,42,58,0.4)', marginTop: '0.25rem' }}>SATELLITE • LIVE WEATHER</div>
                            </div>
                        </div>

                        <div style={{ background: '#F3F4F6', padding: '4px', borderRadius: '12px', display: 'flex' }}>
                            <button style={{ padding: '6px 16px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-navy)' }}>Sat</button>
                            <button style={{ padding: '6px 16px', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(27,42,58,0.5)' }}>Map</button>
                        </div>
                    </div>

                    <div style={{ height: '450px', width: '100%', background: '#F9FAFB', position: 'relative' }}>
                        <React.Suspense fallback={<div className="w-full h-full flex items-center justify-center text-slate-400 font-mono text-sm">Initializing Setup...</div>}>
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
