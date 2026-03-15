import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ServiceShowcase from './components/ServiceShowcase';
import BookingWizard from './components/BookingWizard';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main>
        <Hero />
        <ServiceShowcase />
        <BookingWizard />
      </main>
      <footer style={{ 
        padding: '3rem 0', 
        textAlign: 'center', 
        background: 'var(--primary)', 
        color: 'white',
        marginTop: '4rem'
      }}>
        <div className="container">
          <h2 style={{ 
            fontFamily: 'Inter', 
            fontWeight: 800, 
            letterSpacing: '2px', 
            color: 'var(--accent)',
            marginBottom: '1rem' 
          }}>ORCHID</h2>
          <p style={{ opacity: 0.8 }}>جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
