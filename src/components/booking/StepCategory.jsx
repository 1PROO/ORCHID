import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Apple, Dumbbell, ChevronLeft, Zap } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'therapy',
    icon: Activity,
    label: 'الجلسات العلاجية والمساج',
    desc: 'مساج استرخائي، علاجي، حجامة، إبر صينية',
    gradient: 'linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)',
    popular: true
  },
  {
    id: 'nutrition',
    icon: Apple,
    label: 'برامج التغذية العلاجية',
    desc: 'تغذية رياضية، علاج نحافة، علاج سمنة',
    gradient: 'linear-gradient(135deg, #0a1a28 0%, #0d2a3c 100%)'
  },
  {
    id: 'training',
    icon: Dumbbell,
    label: 'التدريب الرياضي الشخصي',
    desc: 'تدريب شخصي، برنامج لياقة متكامل',
    gradient: 'linear-gradient(135deg, #1a0a28 0%, #2a0d3c 100%)'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const StepCategory = ({ onSelectCategory }) => {
  return (
    <motion.div
      className="step-category-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Quick Express Banner */}
      <motion.div
        variants={cardVariants}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelectCategory && onSelectCategory('therapy')}
        style={{
          background: 'rgba(0, 212, 255, 0.1)',
          border: '1px solid var(--accent)',
          borderRadius: '1rem',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'var(--gradient-accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: '#fff'
          }}>
            <Zap size={18} />
          </div>
          <div>
            <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'Cairo, sans-serif' }}>
              ⚡ حجز مساج سريع
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              اضغط هنا للانتقال المباشر لاختيار نوع الجلسة
            </div>
          </div>
        </div>
        <ChevronLeft size={18} color="var(--accent)" />
      </motion.div>

      <h3 className="step-category-title">أو اختر القسم المناسب:</h3>
      
      <div className="step-category-grid">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.id}
              variants={cardVariants}
              whileTap={{ scale: 0.97 }}
              className="category-tap-target"
              style={{ background: cat.gradient, position: 'relative' }}
              onClick={() => onSelectCategory && onSelectCategory(cat.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectCategory && onSelectCategory(cat.id);
                }
              }}
            >
              <div className="category-icon-wrapper">
                <Icon size={24} color="var(--accent)" />
              </div>
              <div className="category-text-content">
                <h4 className="category-label">{cat.label}</h4>
                <p className="category-desc">{cat.desc}</p>
              </div>
              <ChevronLeft size={20} className="category-chevron" />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default StepCategory;
