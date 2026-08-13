import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Apple, Dumbbell, ChevronLeft } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'therapy',
    icon: Activity,
    label: 'العلاج والتأهيل',
    desc: 'مساج، حجامة، إبر صينية، فوطة نارية',
    gradient: 'linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)'
  },
  {
    id: 'nutrition',
    icon: Apple,
    label: 'التغذية العلاجية',
    desc: 'تغذية رياضية، علاج نحافة، علاج سمنة',
    gradient: 'linear-gradient(135deg, #0a1a28 0%, #0d2a3c 100%)'
  },
  {
    id: 'training',
    icon: Dumbbell,
    label: 'التدريب الرياضي',
    desc: 'تدريب شخصي، لياقة عامة',
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
      <h3 className="step-category-title">اختر القسم المناسب لك</h3>
      <div className="step-category-grid">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.id}
              variants={cardVariants}
              whileTap={{ scale: 0.98 }}
              className="category-tap-target"
              style={{ background: cat.gradient }}
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
                <Icon size={26} color="var(--accent)" />
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
