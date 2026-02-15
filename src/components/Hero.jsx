import React from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

const Hero = () => {
    return (
        <section style={{
            paddingTop: '180px',
            paddingBottom: '100px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Video Background Layer */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                overflow: 'hidden'
            }}>
                {/* Overlay to ensure text readability - kept lighter as it was originally */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(245, 250, 255, 0.85)',
                    backdropFilter: 'blur(2px)',
                    zIndex: 1
                }} />

                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                    }}
                >
                    <source src="/hero-bg.mp4" type="video/mp4" />
                </video>
            </div>

            <div className="container flex flex-col items-center relative z-10" style={{ textAlign: 'center' }}>

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
                    <Link to="/clubs/strathaven/app" className="btn btn-primary">
                        View tomorrow’s schedule
                    </Link>
                    <a href="#how-it-works" className="btn btn-ghost">
                        See how ClearSlot works
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Hero;
