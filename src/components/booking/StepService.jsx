import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, Activity, Apple, Dumbbell, Clock, Tag, Sparkles, Search } from 'lucide-react';
import { categories } from '../../servicesData';

const categoryIcons = {
  therapy: Activity,
  nutrition: Apple,
  training: Dumbbell,
};

const pageVariants = {
  enter: { opacity: 0, x: -30 },
  center: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 30, transition: { duration: 0.2 } }
};

const StepService = ({ categoryKey, onSelectService, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const category = categories.find(c => c.id === categoryKey);
  const CategoryIcon = categoryIcons[categoryKey] || Activity;

  if (!category) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>لم يتم العثور على هذا القسم.</p>
        <button onClick={onBack} className="booking-back-btn">
          <ArrowRight size={16} /> العودة للأقسام
        </button>
      </div>
    );
  }

  const filteredServices = category.services.filter(svc =>
    svc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    svc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div key="step-service" variants={pageVariants} initial="enter" animate="center" exit="exit">
      {/* Back Button Header */}
      <div className="step-service-header">
        <button onClick={onBack} className="booking-back-btn" aria-label="تغيير القسم">
          <ArrowRight size={16} />
          <span>تغيير القسم</span>
        </button>
      </div>

      {/* Section Title */}
      <h3 className="step-service-title">
        اختر الخدمة من <span className="step-service-category-name">{category.name}</span>
      </h3>

      {/* Instant Search Bar */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search
          size={18}
          color="var(--text-muted)"
          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 ابحث عن خدمة بالتحديد..."
          className="booking-form-input"
          style={{ paddingRight: '2.5rem' }}
        />
      </div>

      {/* Service Scrollable List */}
      <div className="service-list-container">
        {filteredServices.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem 0', fontSize: '0.9rem' }}>
            لا توجد خدمة تطابق نتائج البحث.
          </p>
        ) : (
          filteredServices.map((svc, idx) => {
            let badgeText = null;
            let BadgeIcon = null;

            if (svc.durations && svc.durations.length > 0) {
              badgeText = `${svc.durations.join('/')} دقيقة`;
              BadgeIcon = Clock;
            } else if (svc.types && svc.types.length > 0) {
              badgeText = `${svc.types.length} أنواع متاحة`;
              BadgeIcon = Tag;
            } else if (svc.features || svc.indications || svc.focus || svc.includes) {
              badgeText = 'برنامج مخصص';
              BadgeIcon = Sparkles;
            }

            return (
              <motion.div
                key={svc.id}
                className="service-row-item"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectService && onSelectService(svc.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectService && onSelectService(svc.id);
                  }
                }}
              >
                {/* Thumbnail Image with Fallback */}
                {svc.image ? (
                  <img
                    src={svc.image}
                    alt={svc.name}
                    className="service-row-thumb"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div
                  className="service-row-thumb"
                  style={{
                    display: svc.image ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CategoryIcon size={24} color="var(--accent)" />
                </div>

                {/* Service Info */}
                <div className="service-row-info">
                  <div className="service-row-title-row">
                    <h4 className="service-row-title">{svc.name}</h4>
                  </div>
                  <p className="service-row-desc">{svc.description}</p>
                  {badgeText && (
                    <div className="service-row-badges">
                      <span className="service-badge">
                        {BadgeIcon && <BadgeIcon size={12} />}
                        <span>{badgeText}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* RTL Navigation Chevron */}
                <div className="service-row-action" aria-hidden="true">
                  <ChevronLeft size={18} />
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default StepService;
