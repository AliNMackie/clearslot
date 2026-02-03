import React from 'react';
import { apiClient } from '../services/apiClient';

const Hero = () => {
    // Note: In a real app we might fetch dynamic hero stats here
    return (
        <section style={{
            paddingTop: '180px',
            paddingBottom: '100px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Ambience */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%',
                height: '600px',
                background: 'radial-gradient(circle, rgba(47, 128, 237, 0.15) 0%, rgba(245, 250, 255, 0) 70%)',
                zIndex: -1,
                filter: 'blur(60px)'
            }} />

            <div className="container flex flex-col items-center" style={{ textAlign: 'center' }}>

                {/* Badge */}
                <div className="animate-enter" style={{
                    backgroundColor: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-pill)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '2rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}>
                    <span style={{ fontSize: '1.2rem' }}>🌤️</span>
                    <span className="font-sans text-navy" style={{ fontSize: '0.85rem', fontWeight: 600 }}>ClearSlot.space – flight day planner</span>
                </div>

                {/* Heading */}
                <h1 className="animate-enter delay-100 font-serif" style={{
                    fontSize: 'clamp(3.5rem, 8vw, 6rem)',
                    lineHeight: 1,
                    marginBottom: '2rem',
                    letterSpacing: '-0.03em',
                    color: 'var(--color-navy)'
                }}>
                    Know which slots <br />
                    <span className="italic text-sky">are actually clear.</span>
                </h1>

                {/* Subtext */}
                <p className="animate-enter delay-200 font-sans text-navy" style={{
                    fontSize: '1.125rem',
                    opacity: 0.7,
                    maxWidth: '600px',
                    marginBottom: '3rem',
                    lineHeight: 1.6
                }}>
                    ClearSlot.space reads aviation weather, launch/landing constraints and licensing rules to suggest better times before phones, WhatsApp and email blow up.
                </p>

                {/* CTAs */}
                <div className="animate-enter delay-300 flex items-center gap-4">
                    <button className="btn btn-primary">
                        View tomorrow’s schedule
                    </button>
                    <button className="btn btn-ghost">
                        See how ClearSlot works
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
