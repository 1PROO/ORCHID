import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <section className="hero" style={{ 
      background: 'radial-gradient(circle at top, var(--primary-light) 0%, var(--bg-main) 70%)',
      position: 'relative',
      overflow: 'hidden',
      padding: 'clamp(1rem, 3vw, 2rem) 0'
    }}>
      {/* Cyan glow */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(0, 212, 255, 0.08) 0%, transparent 70%)',
        filter: 'blur(60px)', zIndex: 0
      }} />

      {/* Magenta glow */}
      <div style={{
        position: 'absolute', bottom: '-30%', left: '-10%',
        width: '40vw', height: '40vw',
        background: 'radial-gradient(circle, rgba(224, 64, 251, 0.06) 0%, transparent 70%)',
        filter: 'blur(80px)', zIndex: 0
      }} />

      <motion.div 
        className="container" 
        style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 1rem' }}
        variants={containerVariants} initial="hidden" animate="visible"
      >
        <motion.div variants={itemVariants} style={{ marginBottom: '1.25rem' }}>
          <span style={{ 
            color: 'var(--accent)', letterSpacing: '3px', textTransform: 'uppercase', 
            fontSize: 'clamp(0.7rem, 1.5vw, 0.9rem)', fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 1.25rem',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '2rem',
            background: 'rgba(0, 212, 255, 0.05)'
          }}>
            <Sparkles size={14} />
            ORCHID PREMIUM
          </span>
        </motion.div>
        
        <motion.h1 
          variants={itemVariants}
          style={{ 
            fontSize: 'clamp(1.75rem, 5vw, 4rem)', 
            marginBottom: '1.25rem', lineHeight: 1.25,
            background: 'linear-gradient(to left, #ffffff, #c0c0c0)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            padding: '0 0.5rem'
          }}
        >
          طريقك نحو <span style={{ 
            background: 'var(--gradient-accent)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>صحة أفضل</span><br/> وأداء رياضي متميز
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          style={{ 
            fontSize: 'clamp(0.9rem, 2vw, 1.2rem)', color: 'var(--text-muted)', 
            marginBottom: '2rem', maxWidth: '700px', margin: '0 auto 2rem',
            lineHeight: 1.8, padding: '0 0.5rem'
          }}
        >
          نقدم حلولاً متكاملة ومصممة خصيصاً لك في الجلسات العلاجية، برامج التغذية، والتدريب الشخصي تحت إشراف نخبة من المتخصصين.
        </motion.p>
        
        <motion.div variants={itemVariants}>
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 212, 255, 0.3), 0 0 60px rgba(224, 64, 251, 0.2)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/booking')}
            style={{ 
              padding: 'clamp(0.9rem, 2vw, 1.2rem) clamp(2rem, 5vw, 4rem)', 
              fontSize: 'clamp(0.95rem, 2vw, 1.2rem)', fontWeight: 700, 
              color: '#fff',
              background: 'var(--gradient-accent)',
              backgroundSize: '200% 200%',
              animation: 'gradientFlow 4s ease infinite',
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              border: 'none', borderRadius: '3rem', cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 20px rgba(0, 212, 255, 0.25), 0 4px 20px rgba(224, 64, 251, 0.15)'
            }}
          >
            احجز استشارتك الآن
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
