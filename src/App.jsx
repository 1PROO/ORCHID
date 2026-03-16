import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import { Facebook } from 'lucide-react';
import './App.css';

function App() {
  const location = useLocation();

  return (
    <div className="App">
      <Navbar />
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/booking" element={<BookingPage />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer style={{ 
        padding: 'clamp(1.5rem, 4vw, 3rem) 0', 
        textAlign: 'center', 
        background: 'var(--primary)', 
        color: 'white',
        marginTop: '2rem'
      }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <h2 style={{ 
            fontFamily: 'Inter', 
            fontWeight: 800, 
            letterSpacing: '2px', 
            background: 'var(--gradient-accent)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: 'clamp(1.25rem, 3vw, 1.75rem)'
          }}>ORCHID</h2>
          <a href="https://www.facebook.com/Orchid.Hands.Of.Care" target="_blank" rel="noreferrer" style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontSize: '0.9rem' }}>
            <Facebook size={20} /> <span style={{ color: 'var(--text-muted)' }}>تابعنا على فيسبوك</span>
          </a>
          <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
