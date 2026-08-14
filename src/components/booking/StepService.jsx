import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ArrowRight, 
  Clock, 
  Tag, 
  Sparkles,
  Activity,
  Apple,
  Dumbbell
} from 'lucide-react';
import { categories } from '../../servicesData';

// Map category to icon
const getCategoryIcon = (key) => {
  switch (key) {
    case 'therapy': return <Activity size={24} />;
    case 'nutrition': return <Apple size={24} />;
    case 'training': return <Dumbbell size={24} />;
    default: return <Sparkles size={24} />;
  }
};

const StepService = ({ categoryKey, onSelectService, onBack }) => {
  const category = categories[categoryKey];

  if (!category) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>القسم غير موجود.</p>
        <button className="booking-back-btn" onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', minHeight: '44px' }}>
          <ArrowRight size={20} />
          العودة
        </button>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const getBadges = (service) => {
    const badges = [];
    if (service.durations && service.durations.length > 0) {
      const minDuration = Math.min(...service.durations.map(d => parseInt(d.time || d.duration || 0)));
      if (minDuration > 0) {
        badges.push({ id: 'duration', icon: <Clock size={12} />, text: `تبدأ من ${minDuration} دقيقة` });
      }
    } else if (service.duration) {
      badges.push({ id: 'duration', icon: <Clock size={12} />, text: service.duration });
    }
    
    if (service.types && service.types.length > 0) {
      badges.push({ id: 'types', icon: <Tag size={12} />, text: `${service.types.length} أنواع` });
    }
    
    if (!service.types && !service.durations && (service.focus || service.features || service.includes)) {
       badges.push({ id: 'custom', icon: <Sparkles size={12} />, text: 'برنامج مخصص' });
    }
    return badges;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Header */}
      <div className="step-service-header" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button 
          className="booking-back-btn" 
          onClick={onBack}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            alignSelf: 'flex-start', 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-muted)', 
            cursor: 'pointer', 
            padding: 0,
            minHeight: '44px'
          }}
        >
          <ArrowRight size={20} />
          <span>تغيير القسم</span>
        </button>
        
        <h2 className="step-service-title" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          اختر الخدمة من 
          <span className="step-service-category-name" style={{ color: 'var(--accent)' }}>
            {category.name}
          </span>
          <span style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center' }}>
            {getCategoryIcon(categoryKey)}
          </span>
        </h2>
      </div>

      {/* Services List */}
      <motion.div 
        className="service-list-container"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        {category.services && category.services.map((service) => (
          <motion.div 
            key={service.id}
            variants={itemVariants}
            whileTap={{ scale: 0.98 }}
            className="service-row-item"
            onClick={() => onSelectService(service)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              padding: '1rem', 
              background: 'var(--bg-card)', 
              borderRadius: '16px', 
              border: '1px solid var(--border-color)', 
              cursor: 'pointer',
              minHeight: '44px'
            }}
          >
            {/* Thumbnail */}
            <div 
              className="service-row-thumb"
              style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                flexShrink: 0,
                background: 'var(--glass-bg)'
              }}
            >
              {service.image ? (
                <img 
                  src={service.image} 
                  alt={service.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                  {getCategoryIcon(categoryKey)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="service-row-info" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div className="service-row-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="service-row-title" style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                  {service.name}
                </h3>
              </div>
              
              <p className="service-row-desc" style={{ 
                margin: 0, 
                fontSize: '0.875rem', 
                color: 'var(--text-muted)', 
                display: '-webkit-box', 
                WebkitLineClamp: 1, 
                WebkitBoxOrient: 'vertical', 
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {service.description}
              </p>

              <div className="service-row-badges" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                {getBadges(service).map(badge => (
                  <span 
                    key={badge.id}
                    className="service-badge"
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.25rem', 
                      fontSize: '0.75rem', 
                      padding: '0.125rem 0.5rem', 
                      borderRadius: '999px', 
                      background: 'var(--glass-bg)', 
                      color: 'var(--accent)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    {badge.icon}
                    {badge.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Icon */}
            <div className="service-row-action" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <ChevronLeft size={20} />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default StepService;
