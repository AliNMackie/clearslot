import React from 'react';
import { Check, Database, Map as MapIcon, CloudRain, Shield, Calendar, Bell, LineChart } from 'lucide-react';

const BentoGrid = () => {
    return (
        <section className="container" style={{ padding: '6rem 1.5rem' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

                {/* Left: Text Content */}
                <div>
                    <h2 className="font-serif text-navy" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1, marginBottom: '3rem' }}>
                        Less weekend admin, <br />
                        <span className="italic text-sky">more clear slots.</span>
                    </h2>

                    <div className="flex flex-col gap-8">
                        {[
                            "Colour-coded flyability for every aircraft or balloon slot.",
                            "Automated nudges before marginal bookings become cancellations.",
                            "Simple 'legal to fly?' indicator based on your rules."
                        ].map((text, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div style={{
                                    minWidth: '56px',
                                    height: '56px',
                                    borderRadius: '16px',
                                    backgroundColor: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                                }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-sky-blue)' }} />
                                </div>
                                <p className="font-sans text-navy" style={{ fontSize: '1.2rem', paddingTop: '0.75rem', opacity: 0.9 }}>{text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: UI Simulator */}
                <div className="animate-enter delay-200" style={{
                    backgroundColor: 'var(--color-navy)',
                    borderRadius: '40px',
                    padding: '2rem',
                    position: 'relative',
                    minHeight: '500px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Mock Window */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        {/* Window Bar */}
                        <div className="flex items-center gap-2 p-4" style={{ borderBottom: '1px solid #eee', padding: '1rem' }}>
                            <div className="flex gap-1" style={{ gap: '6px' }}>
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
                            </div>
                            <div style={{ margin: '0 auto', background: '#f3f4f6', height: 8, width: '30%', borderRadius: 4 }} />
                        </div>

                        {/* Window Content */}
                        <div style={{ padding: '1.5rem', flex: 1, background: '#f9fafb', display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1, background: '#eff6ff', borderRadius: 12, padding: '1rem' }}>
                                <div style={{ width: '50%', height: 16, background: '#bfdbfe', borderRadius: 4, marginBottom: 16 }} />
                                <div style={{ width: '100%', height: 80, background: 'rgba(255,255,255,0.8)', borderRadius: 8, marginBottom: 8 }} />
                                <div style={{ width: '100%', height: 80, background: 'rgba(255,255,255,0.8)', borderRadius: 8 }} />
                            </div>
                            <div style={{ width: '30%', background: 'white', borderRadius: 12, padding: '1rem' }} className="hidden sm:block">
                                <div style={{ width: '100%', height: '100%', background: '#f3f4f6', borderRadius: 8 }} />
                            </div>
                        </div>
                    </div>

                    {/* Footer Strip */}
                    <div className="glass" style={{
                        marginTop: '1.5rem',
                        borderRadius: '16px',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(255,255,255,0.1)',
                        borderColor: 'rgba(255,255,255,0.1)'
                    }}>
                        <div className="flex gap-2">
                            <span style={{ background: 'rgba(27,42,58,0.5)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: 99, fontSize: '0.75rem', fontFamily: 'monospace' }}>Slot scored</span>
                            <span style={{ background: 'rgba(27,42,58,0.5)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: 99, fontSize: '0.75rem', fontFamily: 'monospace' }}>Briefing ready</span>
                        </div>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <Check size={14} />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

const FeaturesGrid = () => {
    return (
        <section className="container" style={{ paddingBottom: '6rem' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1 */}
                <div className="feature-card card-base md:col-span-2">
                    <div className="relative z-10" style={{ maxWidth: '500px' }}>
                        <h3 className="font-serif text-navy" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                            Green / Amber / Red <br /> <span className="italic text-sky">at a glance.</span>
                        </h3>
                        <p className="text-navy" style={{ opacity: 0.7, fontSize: '1.125rem' }}>
                            Instant visual confirmation for every booking on your schedule.
                        </p>
                    </div>
                </div>

                {/* Card 2 - Dark */}
                <div className="feature-card feature-card--dark">
                    <Shield size={48} className="text-sky" style={{ marginBottom: '1.5rem' }} />
                    <h3 className="font-serif" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Combines weather & recency.</h3>
                    <p style={{ opacity: 0.7 }}>Licensing rules, weather constraints and aircraft limits in one place.</p>
                </div>

                {/* Card 3 */}
                <div className="feature-card card-base">
                    <div style={{
                        width: 48, height: 48, borderRadius: '50%', background: '#eff6ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '1.5rem', color: 'var(--color-sky-blue)'
                    }}>
                        <Calendar size={24} />
                    </div>
                    <h3 className="font-serif text-navy" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Works with your calendar.</h3>
                    <p className="text-navy" style={{ opacity: 0.7 }}>Integrates with your existing booking tools seamlessly.</p>
                </div>
            </div>
        </section>
    );
};

const DataSources = () => {
    const sources = [
        { icon: <CloudRain />, title: "Weather / flyability", source: "Met Office MAVIS / Aviation APIs", result: "Flyability score for aircraft & balloons" },
        { icon: <MapIcon />, title: "Maps / terrain", source: "Topo + Satellite APIs", result: "Launch/landing site context & obstacles" },
        { icon: <Database />, title: "Ground condition", source: "Recent precip + Manual inputs", result: "Usable launch/runway flags" },
        { icon: <Shield />, title: "Regulations", source: "CAA rules + Operator SOPs", result: "'Legal to fly?' indicator" },
        { icon: <Calendar />, title: "Bookings", source: "Club booking systems", result: "One source of truth" },
        { icon: <Bell />, title: "Comms", source: "SMS / Messaging APIs", result: "Nudges for pilots & crew" },
        { icon: <LineChart />, title: "Analytics", source: "Flight + Weather history", result: "Revenue impact & rescue stats" },
    ];

    return (
        <section className="container" style={{ paddingBottom: '6rem' }}>
            <h2 className="font-serif text-navy text-center mb-12" style={{ fontSize: '3rem' }}>How ClearSlot scores each slot</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sources.map((item, i) => (
                    <div key={i} className="data-source-card">
                        <div className="flex items-center gap-4 mb-4">
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%', background: '#eff6ff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-sky-blue)'
                            }}>
                                {React.cloneElement(item.icon, { size: 20 })}
                            </div>
                            <h3 className="font-bold text-navy text-lg">{item.title}</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div className="uppercase tracking-tight" style={{ fontSize: '0.75rem', opacity: 0.5, fontWeight: 'bold' }}>Source</div>
                            <div className="font-sans text-navy" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.source}</div>

                            <div style={{ height: 1, backgroundColor: '#f3f4f6', margin: '0.5rem 0' }} />

                            <div className="uppercase tracking-tight" style={{ fontSize: '0.75rem', opacity: 0.5, fontWeight: 'bold' }}>Result</div>
                            <div className="text-navy" style={{ fontSize: '0.9rem', opacity: 0.8 }}>{item.result}</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const CTA = () => {
    return (
        <section className="container" style={{ paddingBottom: '6rem' }}>
            <div style={{
                backgroundColor: 'var(--color-sky-blue)',
                borderRadius: '64px',
                padding: '6rem 2rem',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 2px, transparent 2px)',
                    backgroundSize: '40px 40px',
                    opacity: 0.3,
                    pointerEvents: 'none'
                }} />

                <div className="relative z-10 text-white">
                    <h2 className="font-serif mb-8" style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', lineHeight: 1 }}>
                        Plan the flying, <br />
                        <span className="italic">not the inbox.</span>
                    </h2>

                    <div className="flex justify-center mb-8">
                        <button className="btn btn-white" style={{ fontSize: '1.25rem', padding: '1rem 3rem', color: 'var(--color-sky-blue)' }}>
                            Pilot ClearSlot for a month
                        </button>
                    </div>

                    <p className="uppercase tracking-tight" style={{ fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.6 }}>
                        For planning only — Built on real weather & data sources
                    </p>
                </div>
            </div>
        </section>
    );
};

const MarketingSections = () => {
    return (
        <>
            <BentoGrid />
            <FeaturesGrid />
            <DataSources />
            <CTA />
        </>
    );
};

export default MarketingSections;
