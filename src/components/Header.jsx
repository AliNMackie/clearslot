import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <header className="glass" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      padding: '1rem 0'
    }}>
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ cursor: 'pointer' }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'var(--color-sky-blue)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-serif)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            fontStyle: 'italic',
            transition: 'transform 0.3s ease',
            transform: hovered ? 'rotate(12deg)' : 'rotate(3deg)'
          }}>
            C
          </div>
          <span className="font-sans" style={{
            fontWeight: 700,
            color: 'var(--color-navy)',
            letterSpacing: '-0.02em'
          }}>
            ClearSlot.space
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          <a href="#how-it-works" className="font-sans text-navy" style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.8 }}>How it works</a>
          <Link to="/clubs/strathaven/app" className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Member Login
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
