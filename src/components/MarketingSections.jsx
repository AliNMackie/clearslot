import React from 'react';
import { Check, Database, Map as MapIcon, CloudRain, Shield, Calendar, Bell, LineChart } from 'lucide-react';
import dashboardImg from '../assets/dashboard-illustration.webp';

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
            <div style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
                borderRadius: '32px',
                padding: '3rem',
                border: '1px solid rgba(255,255,255,0.8)',
                boxShadow: '0 20px 40px -10px rgba(27, 42, 58, 0.05)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4rem',
                alignItems: 'center'
            }}>
                <div className="col-span-1 hidden md:block">
                    {/* Abstract Visual Representation of Scoring */}
                    <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                        padding: '3rem',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        border: '1px solid rgba(0,0,0,0.03)'
                    }}>
                        <div className="flex justify-between items-end mb-8">
                            <span className="font-serif text-2xl text-navy font-bold">Digital Maturity</span>
                            <span className="font-mono text-5xl font-bold text-sky" style={{ letterSpacing: '-0.05em' }}>85<span className="text-xl opacity-40 ml-1 text-navy">/100</span></span>
                        </div>

                        {/* Fake Progress Bars */}
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm font-bold uppercase tracking-widest text-navy mb-2">Online Booking</div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[95%] shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm font-bold uppercase tracking-widest text-navy mb-2">Safety Checks</div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-sky-500 w-[80%] shadow-[0_0_10px_rgba(14,165,233,0.5)]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm font-bold uppercase tracking-widest text-navy mb-2">Ops Visibility</div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-navy w-[60%]"></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Current Status</div>
                            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold border border-green-200">Modernised Operation</span>
                        </div>
                    </div>
                </div>

                <div className="col-span-1 md:col-span-1">
                    <h3 className="font-serif text-navy mb-6" style={{ fontSize: '3rem', lineHeight: 1 }}>
                        How we score <br /><span className="italic text-sky">each club.</span>
                    </h3>
                    <p className="text-navy text-lg opacity-70 mb-10 leading-relaxed font-light">
                        Not all clubs are created equal. We analyze the automation level of your operation—from bookings to safety checks:
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition hover:shadow-md cursor-default">
                            <div className="w-4 h-4 mt-1 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)] shrink-0"></div>
                            <div>
                                <div className="font-bold text-navy text-lg mb-1">Modernised (80-100)</div>
                                <div className="text-slate-500 leading-snug">Fully digital, real-time safety checks, high efficiency.</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-sm transition cursor-default">
                            <div className="w-4 h-4 mt-1 rounded-full bg-yellow-400 shrink-0"></div>
                            <div>
                                <div className="font-bold text-navy text-lg mb-1">In Transition (50-79)</div>
                                <div className="text-slate-500 leading-snug">Digital booking, but manual safety/dispatch.</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-sm transition cursor-default">
                            <div className="w-4 h-4 mt-1 rounded-full bg-slate-300 shrink-0"></div>
                            <div>
                                <div className="font-bold text-navy text-lg mb-1">Legacy-Heavy (0-49)</div>
                                <div className="text-slate-500 leading-snug">Paper diaries, phone bookings, manual calcs.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const CTA = () => {
    return (
        <section className="container" style={{ paddingBottom: '8rem' }}>
            <div className="relative overflow-hidden rounded-[40px]" style={{
                background: 'var(--color-navy)',
                padding: '5rem 2rem',
                textAlign: 'center',
                color: 'white'
            }}>
                {/* Background Decor */}
                <div style={{
                    position: 'absolute', top: -100, left: 0, right: 0, height: '400px',
                    background: 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.15) 0%, transparent 60%)',
                    pointerEvents: 'none'
                }} />
                <div style={{
                    position: 'absolute', bottom: -50, right: -50, width: '200px', height: '200px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }} />

                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="font-serif mb-6" style={{ fontSize: '3.5rem', lineHeight: 1 }}>
                        Plan the flying, <span className="italic text-sky">not the inbox.</span>
                    </h2>
                    <p className="text-xl opacity-80 mb-10 font-light">
                        Join the pilot waitlist or register your club as a beta partner today.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button className="bg-white text-navy px-10 py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:scale-105 transition transform shadow-[0_10px_30px_rgba(255,255,255,0.2)]">
                            Get Early Access
                        </button>
                        <button className="px-10 py-4 rounded-full font-bold text-sm tracking-widest uppercase border border-white/20 hover:bg-white/5 transition text-white">
                            View Demo
                        </button>
                    </div>

                    <div className="mt-12 text-sm opacity-40 font-mono">
                        CURRENTLY ACCEPTING UK CLUBS FOR Q2 2026
                    </div>
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
