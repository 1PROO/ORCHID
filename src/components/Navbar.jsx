import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo-small.webp';
import { Facebook, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleBookClick = () => {
    setMobileOpen(false);
    navigate('/booking');
  };

  return (
    <nav className="glass-card" style={{ 
      margin: '0.75rem', 
      padding: '0.75rem 1.5rem', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      position: 'sticky',
      top: '0.75rem',
      zIndex: 100,
      flexWrap: 'wrap'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', textDecoration: 'none' }}>
        <img src={logo} alt="ORCHID Logo" style={{ height: '36px', transform: 'scale(1.5)', transformOrigin: 'center' }} />
        <span style={{ 
          fontFamily: 'Inter', fontWeight: 800, fontSize: '1.25rem',
          letterSpacing: '2px',
          background: 'var(--gradient-accent)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>ORCHID</span>
      </Link>

      <div className="nav-desktop" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>خدماتنا</Link>
        <a href="https://www.facebook.com/Orchid.Hands.Of.Care" target="_blank" rel="noreferrer" style={{ 
          color: 'var(--accent)', display: 'flex', alignItems: 'center' 
        }}>
          <Facebook size={22} />
        </a>
        <button onClick={handleBookClick} style={{ 
          background: 'var(--gradient-accent)',
          backgroundSize: '200% 200%',
          animation: 'gradientFlow 4s ease infinite',
          color: '#fff', padding: '0.5rem 1.5rem', 
          borderRadius: '2rem', fontWeight: 700, fontSize: '0.9rem',
          cursor: 'pointer', border: 'none'
        }}>احجز الآن</button>
      </div>

      <button className="nav-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{ display: 'none', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
        aria-label="Toggle Menu"
      >
        {mobileOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="nav-mobile-menu"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{
              width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.75rem',
              paddingTop: '1rem', borderTop: '1px solid var(--border-color)', marginTop: '0.75rem'
            }}
          >
            <Link to="/" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500, padding: '0.5rem 0', fontSize: '1.05rem' }}>الرئيسية</Link>
            <a href="https://www.facebook.com/Orchid.Hands.Of.Care" target="_blank" rel="noreferrer" style={{ 
              color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0'
            }}>
              <Facebook size={20} /> تابعنا على فيسبوك
            </a>
            <button onClick={handleBookClick} style={{ 
              background: 'var(--gradient-accent)', color: '#fff', 
              padding: '0.75rem', borderRadius: '1rem', fontWeight: 700, fontSize: '1rem',
              textAlign: 'center', cursor: 'pointer', border: 'none'
            }}>احجز الآن</button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-menu { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
