import React from 'react';
import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <nav className="glass-card" style={{ 
      margin: '1rem', 
      padding: '0.75rem 2rem', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      position: 'sticky',
      top: '1rem',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <img src={logo} alt="Logo" style={{ height: '40px' }} />
        <span style={{ 
          fontFamily: 'Inter', 
          fontWeight: 800, 
          fontSize: '1.5rem',
          letterSpacing: '2px',
          color: 'var(--accent)'
        }}>ORCHID</span>
      </div>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <a href="#services" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>خدماتنا</a>
        <a href="#booking" style={{ 
          backgroundColor: 'var(--primary)', 
          color: 'white', 
          padding: '0.5rem 1.5rem', 
          borderRadius: '2rem',
          textDecoration: 'none',
          fontWeight: 600
        }}>احجز الآن</a>
      </div>
    </nav>
  );
};

export default Navbar;
