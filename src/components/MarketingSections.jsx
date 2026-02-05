import React from 'react';
import { Check, Database, Map as MapIcon, CloudRain, Shield, Calendar, Bell, LineChart } from 'lucide-react';
import dashboardImg from '../assets/dashboard-illustration.png';

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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <img
                        src={dashboardImg}
                        alt="ClearSlot Dashboard Interface"
                        style={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '600px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 20px 40px rgba(27, 42, 58, 0.15))'
                        }}
                    />
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

const ClubScoringExplainer = () => {
    return (
        <section className="container" style={{ paddingBottom: '6rem' }}>
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                <h3 className="font-serif text-2xl text-navy mb-4">How ClearSlot scores each club</h3>
                <p className="text-navy text-lg opacity-80 max-w-3xl">
                    ClearSlot rates each club's digital maturity on a scale of 0-100.
                    We analyze how much of your operation is automated—from online bookings to real-time safety checks—versus relying on manual spreadsheets.
                    Clubs are categorized as <strong>'Modernised'</strong>, <strong>'In Transition'</strong>, or <strong>'Legacy-Heavy'</strong>,
                    giving members transparency on the operational efficiency of their flying base.
                </p>
                <div className="flex gap-4 mt-6">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">Modernised (80-100)</span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">In Transition (50-79)</span>
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-bold">Legacy-Heavy (0-49)</span>
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
            <ClubScoringExplainer />
            <CTA />
        </>
    );
};

export default MarketingSections;
