import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Apple, Dumbbell, ChevronLeft, Sparkles } from 'lucide-react';

const categories = [
  { 
    id: 'therapy', 
    icon: Activity, 
    label: 'الجلسات العلاجية والمساج', 
    desc: 'مساج استرخائي، علاجي، حجامة، إبر صينية', 
    emoji: '🧖',
    badge: 'الأكثر طلباً' 
  },
  { 
    id: 'nutrition', 
    icon: Apple, 
    label: 'برامج التغذية العلاجية', 
    desc: 'تغذية رياضية، علاج نحافة، علاج سمنة', 
    emoji: '🥗' 
  },
  { 
    id: 'training', 
    icon: Dumbbell, 
    label: 'التدريب الرياضي الشخصي', 
    desc: 'تدريب شخصي، برنامج لياقة متكامل', 
    emoji: '💪' 
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

const StepCategory = ({ onSelectCategory }) => {
  return (
    <div className="step-category-container" style={{ direction: 'rtl', padding: '1rem' }}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="step-category-title" style={{ 
          fontSize: '1.5rem', 
          fontWeight: '700', 
          textAlign: 'center', 
          marginBottom: '2rem',
          color: 'var(--text-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <Sparkles size={24} color="var(--accent)" />
          اختر القسم المناسب لك
        </h2>
      </motion.div>

      <motion.div 
        className="step-category-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <motion.button
              key={cat.id}
              className="category-tap-target"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectCategory(cat.id)}
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                backgroundImage: 'linear-gradient(145deg, rgba(14,14,26,1) 0%, rgba(20,20,35,1) 100%)',
                border: '1px solid var(--border-color)',
                borderRadius: '1.25rem',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
                textAlign: 'right',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              }}
            >
              {cat.badge && (
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '1.5rem',
                  background: 'var(--gradient-accent)',
                  color: '#fff',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  borderBottomLeftRadius: '0.5rem',
                  borderBottomRightRadius: '0.5rem',
                  boxShadow: '0 2px 10px rgba(0, 212, 255, 0.3)'
                }}>
                  {cat.badge}
                </div>
              )}

              <div className="category-icon-wrapper" style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '1rem',
                background: 'rgba(0, 212, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon size={28} color="var(--accent)" />
              </div>

              <div className="category-text-content" style={{ flexGrow: 1 }}>
                <h3 className="category-label" style={{
                  margin: 0,
                  fontSize: '1.15rem',
                  fontWeight: '700',
                  color: 'var(--text-main)',
                  marginBottom: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {cat.label} <span>{cat.emoji}</span>
                </h3>
                <p className="category-desc" style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  lineHeight: '1.4'
                }}>
                  {cat.desc}
                </p>
              </div>

              <div className="category-chevron" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}>
                <ChevronLeft size={24} />
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
};

export default StepCategory;
