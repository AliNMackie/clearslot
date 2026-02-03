import React, { useState, useEffect } from 'react';
import { Clock, User, Plane, Anchor, Info, ArrowRight } from 'lucide-react';
import { apiClient } from '../services/apiClient';

const OperatorView = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await apiClient.getBookings();
                setBookings(data);
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
            case 'amber': return '#F2994A'; // Or Sunlight Yellow #F2C94C
            case 'red': return '#EB5757';
            default: return '#ccc';
        }
    };

    const handleSuggest = (booking) => {
        setSelectedBooking(booking);
        setModalOpen(true);
    };

    if (loading) {
        return <div className="container text-center py-12 opacity-50">Loading schedule...</div>;
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
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: getStatusColor(booking.status),
                                    boxShadow: `0 0 0 4px ${getStatusColor(booking.status)}20`
                                }} />
                                <div>
                                    <div className="font-sans text-navy" style={{ fontWeight: 700, fontSize: '1rem' }}>
                                        {booking.statusLabel}
                                    </div>
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
                                        <Plane size={16} opacity={0.5} /> {/* Or generic icon */}
                                        {booking.asset}
                                    </div>
                                    <div className="text-navy" style={{ opacity: 0.6, fontSize: '0.85rem', paddingLeft: '24px' }}>
                                        {booking.reason}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Action */}
                            <div>
                                {(booking.status === 'amber' || booking.status === 'red') ? (
                                    <button
                                        onClick={() => handleSuggest(booking)}
                                        className="btn btn-ghost"
                                        style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                                    >
                                        Suggest new times
                                    </button>
                                ) : (
                                    <div style={{ width: '140px' }} /> /* Spacer */
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {modalOpen && (
                <SuggestionsModal
                    booking={selectedBooking}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </section>
    );
};

const SuggestionsModal = ({ booking, onClose }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (booking) {
            const fetchSuggestions = async () => {
                setLoading(true);
                const data = await apiClient.getSuggestions(booking.id);
                setSuggestions(data);
                setLoading(false);
            };
            fetchSuggestions();
        }
    }, [booking]);

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
                    {loading ? (
                        <div className="p-8 text-center opacity-50">Checking clouds and wind...</div>
                    ) : suggestions.length === 0 ? (
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
