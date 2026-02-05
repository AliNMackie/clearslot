import React from 'react';
import { apiClient } from '../services/apiClient';

const Hero = () => {
    return (
        <section style={{
            paddingTop: '180px',
            paddingBottom: '120px',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#0f172a' // Fallback Navy
        }}>
            {/* Mesh Gradient Background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.3) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(14, 165, 233, 0.3) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(15, 23, 42, 1) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(15, 23, 42, 1) 0px, transparent 50%)',
                zIndex: 0
            }} />

            {/* Subtle animated pattern overlay */}
            <div style={{
                position: 'absolute', inset: 0, opacity: 0.1,
                backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
                backgroundSize: '30px 30px',
                zIndex: 1
            }} />

            <div className="container flex flex-col items-center relative z-10" style={{ textAlign: 'center' }}>

                {/* Badge */}
                <div className="animate-enter" style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '2rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                    <span style={{ fontSize: '1.2rem' }}>🌤️</span>
                    <span className="font-sans text-white" style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.02em' }}>
                        ClearSlot.space – Flight day decision support
                    </span>
                </div>

                {/* Heading */}
                <h1 className="animate-enter delay-100 font-serif" style={{
                    fontSize: 'clamp(3.5rem, 8vw, 6.5rem)',
                    lineHeight: 1,
                    marginBottom: '2rem',
                    letterSpacing: '-0.03em',
                    color: 'white',
                    textShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                    Know which slots <br />
                    <span className="italic text-sky-400">are actually clear.</span>
                </h1>

                {/* Subtext */}
                <p className="animate-enter delay-200 font-sans text-slate-300" style={{
                    fontSize: '1.25rem',
                    maxWidth: '640px',
                    marginBottom: '3.5rem',
                    lineHeight: 1.6,
                    fontWeight: 300
                }}>
                    ClearSlot.space reads aviation weather, launch constraints, and licensing rules to suggest usable flying times—before your inbox blows up.
                </p>

                {/* CTAs */}
                <div className="animate-enter delay-300 flex flex-col sm:flex-row items-center gap-4">
                    <button className="bg-sky-500 hover:bg-sky-400 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-sky-500/25 transition transform hover:-translate-y-0.5">
                        View tomorrow’s schedule
                    </button>
                    <button className="px-8 py-4 text-white font-semibold hover:text-sky-300 transition flex items-center gap-2">
                        How it works <span aria-hidden="true">→</span>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
