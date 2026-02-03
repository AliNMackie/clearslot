import React from 'react';
import { Check, Database, Map as MapIcon, CloudRain, Shield, Calendar, Bell, LineChart, ExternalLink } from 'lucide-react';

const BentoGrid = () => {
    return (
        <section className="container" style={{ padding: '6rem 1.5rem' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

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
                            <div key={i} className="flex items-start gap-6">
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
                                <p className="font-sans text-navy text-lg" style={{ paddingTop: '0.75rem', opacity: 0.9 }}>{text}</p>
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
                        <div className="flex items-center gap-2 p-4 border-b border-gray-100">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            <div style={{ marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#F3F4F6', height: '8px', width: '30%', borderRadius: '4px' }} />
                        </div>

                        {/* Window Content */}
                        <div className="p-6 flex-1 bg-gray-50 flex gap-4">
                            <div className="flex-1 bg-blue-50 rounded-xl p-4">
                                <div className="w-1/2 h-4 bg-blue-200 rounded mb-4" />
                                <div className="w-full h-24 bg-white/80 rounded-lg mb-2" />
                                <div className="w-full h-24 bg-white/80 rounded-lg" />
                            </div>
                            <div className="w-1/3 bg-white rounded-xl p-4 hidden sm:block">
                                <div className="w-full h-full bg-gray-100 rounded-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Footer Strip */}
                    <div className="glass mt-6 rounded-2xl p-4 flex items-center justify-between" style={{
                        background: 'rgba(255,255,255,0.1)',
                        borderColor: 'rgba(255,255,255,0.1)'
                    }}>
                        <div className="flex gap-2">
                            <div className="px-3 py-1 rounded-full bg-navy/50 text-white text-xs font-mono">Slot scored</div>
                            <div className="px-3 py-1 rounded-full bg-navy/50 text-white text-xs font-mono">Briefing ready</div>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
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
                <div className="col-span-1 md:col-span-2 bg-white rounded-[48px] p-12 relative overflow-hidden min-h-[300px] flex flex-col justify-center">
                    <div className="relative z-10 max-w-lg">
                        <h3 className="font-serif text-4xl mb-4 text-navy">Green / Amber / Red <br /> <span className="italic text-sky">at a glance.</span></h3>
                        <p className="text-navy opacity-70 text-lg">Instant visual confirmation for every booking on your schedule.</p>
                    </div>
                </div>

                {/* Card 2 - Dark */}
                <div className="bg-navy rounded-[40px] p-10 text-white flex flex-col justify-between min-h-[350px]">
                    <Shield size={48} className="text-sky mb-6" />
                    <div>
                        <h3 className="font-serif text-3xl mb-3">Combines weather & recency.</h3>
                        <p className="opacity-70">Licensing rules, weather constraints and aircraft limits in one place.</p>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white rounded-[40px] p-10 flex flex-col justify-between min-h-[350px]">
                    <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-sky mb-6 group hover:translate-x-1 transition-transform">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h3 className="font-serif text-3xl mb-3">Works with your calendar.</h3>
                        <p className="text-navy opacity-70">Integrates with your existing booking tools seamlessly.</p>
                    </div>
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
                    <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-sky-50 text-sky flex items-center justify-center">
                                {React.cloneElement(item.icon, { size: 20 })}
                            </div>
                            <h3 className="font-bold text-navy text-lg">{item.title}</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="text-xs uppercase tracking-wide opacity-50 font-bold">Source</div>
                            <div className="text-sm font-semibold text-navy">{item.source}</div>
                            <div className="h-px bg-gray-100 my-2" />
                            <div className="text-xs uppercase tracking-wide opacity-50 font-bold">Result</div>
                            <div className="text-sm text-navy opacity-80">{item.result}</div>
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
            <div className="bg-sky rounded-[64px] p-12 md:p-24 text-center relative overflow-hidden">
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
                        <button className="btn btn-white text-sky px-8 py-4 text-lg">
                            Pilot ClearSlot for a month
                        </button>
                    </div>

                    <p className="text-xs font-bold tracking-widest opacity-60 uppercase">
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
