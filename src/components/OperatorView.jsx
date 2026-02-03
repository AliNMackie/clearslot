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
        <section className="container mx-auto px-4 pb-16">
            {/* Dashboard Container */}
            <div className="bg-slate-50/50 backdrop-blur-sm rounded-[2.5rem] p-8 border border-white/40 shadow-xl">

                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <div className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">Operational Overview</div>
                        <h2 className="font-serif text-navy text-4xl leading-tight">
                            Tomorrow's <span className="italic text-sky">Flight Deck</span>
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Date Pill */}
                        <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                            <Clock size={18} className="text-sky" />
                            <span className="text-navy font-bold tracking-tight">Tue, Feb 4</span>
                        </div>
                        {/* Weather Summary Mockup */}
                        <div className="bg-navy px-5 py-2.5 rounded-2xl shadow-lg shadow-navy/20 flex items-center gap-3 text-white">
                            <Info size={18} className="text-sky" />
                            <span className="font-medium">QNH 1012 • Vis 10km+</span>
                        </div>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="space-y-4">
                    {bookings.map((booking, idx) => (
                        <div
                            key={booking.id}
                            className="group relative bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-sky/20 transition-all duration-300 ease-out hover:-translate-y-0.5"
                            style={{ animationDelay: `${(idx + 1) * 75}ms` }}
                        >
                            {/* Status Stripe */}
                            <div className={`absolute left-0 top-4 bottom-4 w-1.5 rounded-r-full ${booking.status === 'green' ? 'bg-green-500' :
                                    booking.status === 'amber' ? 'bg-amber-400' : 'bg-rose-500'
                                }`} />

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-4">

                                {/* Time & Status Column */}
                                <div className="min-w-[180px]">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-2 h-2 rounded-full ${booking.status === 'green' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
                                                booking.status === 'amber' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                                            }`} />
                                        <span className="font-mono text-sm font-bold text-navy/70">{booking.time}</span>
                                    </div>
                                    <StatusBadge booking={booking} />
                                </div>

                                {/* Main Info: Pilot & Asset */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Pilot Info */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-navy/40 group-hover:bg-sky/10 group-hover:text-sky transition-colors">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-navy text-lg leading-none mb-1.5">{booking.pilot}</div>
                                            <div className="text-xs font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                                {booking.instructor ? (
                                                    <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Training</span>
                                                ) : 'Self-Fly'}
                                                <span>•</span>
                                                <span>{booking.type}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Asset Info */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-navy/40 group-hover:bg-sky/10 group-hover:text-sky transition-colors">
                                            <Plane size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-navy text-lg leading-none mb-1.5">{booking.asset}</div>
                                            <div className="text-sm font-medium text-slate-500">
                                                {/* Reasoning Text */}
                                                {(!legalityCache[booking.id] || legalityCache[booking.id]?.legal) ? (
                                                    booking.reason
                                                ) : (
                                                    <div className="flex items-center gap-1 text-rose-500">
                                                        <AlertTriangle size={12} />
                                                        <span>Legality Check Failed</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Area */}
                                <div className="md:text-right">
                                    {(booking.status === 'amber' || booking.status === 'red' || (legalityCache[booking.id] && !legalityCache[booking.id].legal)) && (
                                        <button
                                            onClick={() => handleSuggest(booking.id)}
                                            className="px-4 py-2 rounded-xl bg-slate-50 text-navy font-semibold text-sm hover:bg-navy hover:text-white transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2 group/btn"
                                        >
                                            <span>Find new time</span>
                                            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Map Section */}
            <div className="mt-8 animate-enter delay-300">
                <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
                    <div className="p-6 flex justify-between items-center border-b border-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-sky/10 flex items-center justify-center text-sky">
                                <Anchor size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-navy text-lg leading-none">Strathaven Overlay</h3>
                                <div className="text-xs text-slate-400 font-medium mt-1">SATELLITE • LIVE WEATHER</div>
                            </div>
                        </div>

                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button className="px-4 py-1.5 bg-white shadow-sm rounded-lg text-xs font-bold text-navy">Sat</button>
                            <button className="px-4 py-1.5 text-slate-400 hover:text-navy text-xs font-bold transition-colors">Map</button>
                        </div>
                    </div>

                    <div className="h-[450px] w-full bg-slate-50 relative">
                        <React.Suspense fallback={<div className="w-full h-full flex items-center justify-center text-slate-400 font-mono text-sm animate-pulse">Initializing Setup...</div>}>
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
