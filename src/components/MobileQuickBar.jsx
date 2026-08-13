import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, MessageCircle, PhoneCall } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileQuickBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide quick bar on booking page or admin routes to prevent overlap
  if (location.pathname.startsWith('/booking') || location.pathname.startsWith('/orchid-admin')) {
    return null;
  }

  const phone = '201030558700';

  return (
    <div className="mobile-quick-bar-wrapper">
      <div className="mobile-quick-bar-container">
        {/* Call Direct */}
        <motion.a
          href={`tel:${phone}`}
          whileTap={{ scale: 0.9 }}
          className="mobile-quick-icon-btn"
          aria-label="اتصل بنا"
        >
          <PhoneCall size={20} />
          <span className="mobile-quick-btn-label">اتصال</span>
        </motion.a>

        {/* Primary Booking Action */}
        <motion.button
          onClick={() => navigate('/booking')}
          whileTap={{ scale: 0.96 }}
          className="mobile-quick-main-btn"
        >
          <Calendar size={18} />
          <span>احجز موعدك الآن</span>
        </motion.button>

        {/* WhatsApp Direct */}
        <motion.a
          href={`https://wa.me/${phone}?text=${encodeURIComponent('السلام عليكم، أريد الاستفسار عن حجز جلسة في أوركيد')}`}
          target="_blank"
          rel="noreferrer"
          whileTap={{ scale: 0.9 }}
          className="mobile-quick-icon-btn mobile-quick-wa"
          aria-label="واتساب"
        >
          <MessageCircle size={20} />
          <span className="mobile-quick-btn-label">واتساب</span>
        </motion.a>
      </div>

      <style>{`
        .mobile-quick-bar-wrapper {
          position: fixed;
          bottom: 12px;
          left: 12px;
          right: 12px;
          z-index: 999;
          display: none;
        }

        @media (max-width: 768px) {
          .mobile-quick-bar-wrapper {
            display: block;
          }
        }

        .mobile-quick-bar-container {
          background: rgba(10, 16, 28, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(0, 212, 255, 0.25);
          border-radius: 2rem;
          padding: 0.4rem 0.6rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 212, 255, 0.15);
        }

        .mobile-quick-main-btn {
          flex: 1;
          height: 44px;
          border-radius: 1.5rem;
          background: var(--gradient-accent);
          color: #ffffff;
          border: none;
          font-weight: 700;
          font-size: 0.92rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          cursor: pointer;
          font-family: 'Cairo', sans-serif;
          box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
        }

        .mobile-quick-icon-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-main);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          flex-shrink: 0;
        }

        .mobile-quick-wa {
          background: rgba(37, 211, 102, 0.15);
          border-color: rgba(37, 211, 102, 0.3);
          color: #25D366;
        }

        .mobile-quick-btn-label {
          font-size: 0.6rem;
          margin-top: 1px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default MobileQuickBar;
