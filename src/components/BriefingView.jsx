import React, { useState, useEffect } from 'react';
import { ArrowRight, Calendar, Cloud, Wind } from 'lucide-react';
import { apiClient } from '../services/apiClient';

const BriefingView = () => {
    const [briefing, setBriefing] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBriefing = async () => {
            try {
                const data = await apiClient.getBriefing();
                setBriefing(data);
            } catch (err) {
                console.error("Failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBriefing();
    }, []);

    if (loading || !briefing) {
        return (
            <section className="container text-center py-12">
                Loading briefing...
            </section>
        );
    }

    const { currentSlot, recommendedWindow } = briefing;

    return (
        <section className="container" style={{ padding: '4rem 1.5rem' }}>
            <div style={{
                backgroundColor: 'var(--color-sky-blue)',
                borderRadius: 'var(--radius-card-2xl)',
                padding: 'clamp(2rem, 5vw, 4rem)',
                position: 'relative',
                overflow: 'hidden',
                color: 'white'
            }}>
                {/* Background Pattern */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                    opacity: 0.2,
                    pointerEvents: 'none'
                }} />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left: Heading & Status */}
                    <div className="animate-enter">
                        <h2 className="font-serif" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 1.1, marginBottom: '2rem' }}>
                            Your flight <br />
                            <span className="italic text-sunlight">window this week</span>
                        </h2>

                        <div style={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)',
                            padding: '1.5rem',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            marginBottom: '2rem'
                        }}>
                            <div className="flex items-start gap-3">
                                <div style={{
                                    backgroundColor: 'var(--color-sunlight)',
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    marginTop: '6px'
                                }} />
                                <div>
                                    <p className="font-bold text-lg mb-1">You’re currently booked for {currentSlot.time}</p>
                                    <p style={{ opacity: 0.9 }}>This slot looks <span style={{ color: 'var(--color-sunlight)', fontWeight: 'bold' }}>{currentSlot.status}</span> due to {currentSlot.reason}.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="btn btn-white">
                                Move to best slot
                            </button>
                            <button className="btn btn-ghost" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                                Keep current time
                            </button>
                        </div>
                    </div>

                    {/* Right: Recommendation Card */}
                    <div className="animate-enter delay-200" style={{
                        backgroundColor: 'white',
                        borderRadius: '32px',
                        padding: '2rem',
                        color: 'var(--color-navy)',
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)'
                    }}>
                        <div className="flex items-center gap-2 mb-6">
                            <span style={{ fontSize: '1.5rem' }}>✨</span>
                            <h3 className="font-serif text-2xl italic">Best window detected</h3>
                        </div>

                        <div className="flex items-center justify-between p-4 mb-6" style={{
                            backgroundColor: 'var(--color-cloud)',
                            borderRadius: '16px'
                        }}>
                            <div className="flex items-center gap-3">
                                <Calendar className="text-sky" />
                                <div>
                                    <p className="font-bold">{recommendedWindow.label}</p>
                                    <p className="text-sm opacity-60">{recommendedWindow.time}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-sky font-bold text-xl">{recommendedWindow.score}</span>
                                <p className="text-xs opacity-50 uppercase">Flyability</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {recommendedWindow.details.map((detail, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    {detail.type === 'wind' ? <Wind className="text-sky" size={20} /> : <Cloud className="text-sky" size={20} />}
                                    <p className="text-sm">{detail.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default BriefingView;
