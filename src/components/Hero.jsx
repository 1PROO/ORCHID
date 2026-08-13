import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Activity, Apple, Dumbbell, Zap } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const quickCategories = [
    { id: 'therapy', label: 'جلسات علاج ومساج', icon: Activity, color: '#00d4ff' },
    { id: 'nutrition', label: 'برامج التغذية', icon: Apple, color: '#00e676' },
    { id: 'training', label: 'التدريب الشخصي', icon: Dumbbell, color: '#e040fb' },
  ];

  return (
    <section className="hero-section">
      {/* Glow overlays */}
      <div className="hero-glow-cyan" />
      <div className="hero-glow-magenta" />

      <motion.div
        className="container hero-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="hero-badge-wrapper">
          <span className="hero-badge">
            <Sparkles size={14} />
            ORCHID PREMIUM CARE
          </span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="hero-title">
          طريقك نحو <span className="hero-title-accent">صحة أفضل</span>
          <br /> وأداء رياضي متميز
        </motion.h1>

        <motion.p variants={itemVariants} className="hero-desc">
          حلول متكاملة في الجلسات العلاجية والمساج والتغذية والتدريب تحت إشراف متخصصين.
        </motion.p>

        {/* Primary CTA Button */}
        <motion.div variants={itemVariants} className="hero-cta-wrapper">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/booking')}
            className="hero-main-cta"
          >
            <Zap size={18} />
            <span>ابدأ الحجز الفوري الآن</span>
          </motion.button>
        </motion.div>

        {/* Quick Category Direct Shortcuts */}
        <motion.div variants={itemVariants} className="hero-quick-shortcuts">
          <span className="hero-shortcuts-label">أو اختر القسم مباشرة للبدء:</span>
          <div className="hero-shortcuts-grid">
            {quickCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/booking?category=${cat.id}`)}
                  className="hero-shortcut-chip"
                >
                  <Icon size={16} color={cat.color} />
                  <span>{cat.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        .hero-section {
          background: radial-gradient(circle at top, var(--primary-light) 0%, var(--bg-main) 70%);
          position: relative;
          overflow: hidden;
          padding: clamp(1.5rem, 4vw, 3.5rem) 0 clamp(1rem, 3vw, 2.5rem);
          direction: rtl;
        }

        .hero-glow-cyan {
          position: absolute;
          top: -20%;
          right: -10%;
          width: 50vw;
          height: 50vw;
          background: radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }

        .hero-glow-magenta {
          position: absolute;
          bottom: -30%;
          left: -10%;
          width: 40vw;
          height: 40vw;
          background: radial-gradient(circle, rgba(224, 64, 251, 0.08) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        .hero-container {
          text-align: center;
          position: relative;
          z-index: 1;
          max-width: 800px;
        }

        .hero-badge-wrapper {
          margin-bottom: 1rem;
        }

        .hero-badge {
          color: var(--accent);
          letter-spacing: 2px;
          text-transform: uppercase;
          font-size: clamp(0.7rem, 1.5vw, 0.85rem);
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 1rem;
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 2rem;
          background: rgba(0, 212, 255, 0.06);
          backdrop-filter: blur(8px);
        }

        .hero-title {
          font-size: clamp(1.85rem, 5.5vw, 3.5rem);
          margin-bottom: 1rem;
          line-height: 1.25;
          font-family: 'Cairo', sans-serif;
          font-weight: 800;
          color: #ffffff;
        }

        .hero-title-accent {
          background: var(--gradient-accent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-desc {
          font-size: clamp(0.9rem, 2vw, 1.15rem);
          color: var(--text-muted);
          margin: 0 auto 1.5rem;
          line-height: 1.7;
          max-width: 600px;
        }

        .hero-cta-wrapper {
          margin-bottom: 1.75rem;
        }

        .hero-main-cta {
          padding: 0.9rem 2.5rem;
          font-size: clamp(1rem, 2vw, 1.15rem);
          font-weight: 700;
          color: #fff;
          background: var(--gradient-accent);
          background-size: 200% 200%;
          animation: gradientFlow 4s ease infinite;
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          border: none;
          border-radius: 3rem;
          cursor: pointer;
          font-family: 'Cairo', sans-serif;
          box-shadow: 0 6px 25px rgba(0, 212, 255, 0.3), 0 4px 20px rgba(224, 64, 251, 0.2);
          min-height: 52px;
        }

        .hero-quick-shortcuts {
          margin-top: 1rem;
        }

        .hero-shortcuts-label {
          display: block;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 0.6rem;
          font-weight: 500;
        }

        .hero-shortcuts-grid {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .hero-shortcut-chip {
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          min-height: 40px;
          transition: all 0.25s ease;
          font-family: 'Cairo', sans-serif;
        }

        .hero-shortcut-chip:hover {
          border-color: var(--accent);
          background: rgba(0, 212, 255, 0.1);
        }
      `}</style>
    </section>
  );
};

export default Hero;
