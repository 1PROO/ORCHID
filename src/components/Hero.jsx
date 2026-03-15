import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
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
      overflow: 'hidden'
    }}>
      {/* Decorative background glow */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0
      }}></div>

      <motion.div 
        className="container" 
        style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} style={{ marginBottom: '1rem' }}>
          <span style={{ 
            color: 'var(--accent)', 
            letterSpacing: '4px', 
            textTransform: 'uppercase', 
            fontSize: '1rem', 
            fontWeight: 600,
            display: 'inline-block',
            padding: '0.5rem 1.5rem',
            border: '1px solid var(--accent)',
            borderRadius: '2rem',
            background: 'rgba(212, 175, 55, 0.05)'
          }}>
            ORCHID PREMIUM
          </span>
        </motion.div>
        
        <motion.h1 
          variants={itemVariants}
          style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', 
            marginBottom: '1.5rem', 
            lineHeight: 1.2,
            background: 'linear-gradient(to left, #ffffff, #a0a0a0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}
        >
          طريقك نحو <span style={{ color: 'var(--accent)', WebkitTextFillColor: 'var(--accent)' }}>صحة أفضل</span><br/> وأداء رياضي متميز
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          style={{ 
            fontSize: 'clamp(1rem, 2vw, 1.25rem)', 
            color: 'var(--text-muted)', 
            marginBottom: '3rem', 
            maxWidth: '800px', 
            margin: '0 auto 3rem',
            lineHeight: 1.8
          }}
        >
          نقدم حلولاً متكاملة ومصممة خصيصاً لك في الجلسات العلاجية، برامج التغذية، والتدريب الشخصي تحت إشراف نخبة من المتخصصين.
        </motion.p>
        
        <motion.div variants={itemVariants}>
          <motion.a 
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            href="#booking" 
            className="glass-card" 
            style={{ 
              padding: '1.2rem 4rem', 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              color: 'var(--bg-main)',
              background: 'linear-gradient(135deg, var(--accent) 0%, #b89326 100%)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              border: 'none',
              borderRadius: '3rem'
            }}
          >
            احجز استشارتك الآن
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
