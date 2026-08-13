import React, { useState } from 'react';
import { categories } from '../servicesData';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowLeft, Activity, Apple, Dumbbell } from 'lucide-react';

const categoryFilterIcons = {
  all: Sparkles,
  therapy: Activity,
  nutrition: Apple,
  training: Dumbbell,
};

const ServiceShowcase = ({ onBookNow }) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  const filteredCategories = activeCategoryFilter === 'all'
    ? categories
    : categories.filter(c => c.id === activeCategoryFilter);

  return (
    <section id="services" style={{ padding: 'clamp(1.5rem, 4vw, 3.5rem) 0', direction: 'rtl' }}>
      <div className="container">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '1.5rem' }}
        >
          <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2.25rem)', color: 'var(--accent)', marginBottom: '0.5rem', fontFamily: 'Cairo, sans-serif' }}>
            خدماتنا الاحترافية
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            اختر التخصص والخدمة المطلوبة للحجز المباشر
          </p>
        </motion.div>

        {/* Category Tabs Bar for Mobile & Desktop */}
        <div className="service-tabs-bar">
          <button
            type="button"
            onClick={() => setActiveCategoryFilter('all')}
            className={`service-tab-btn ${activeCategoryFilter === 'all' ? 'service-tab-btn--active' : ''}`}
          >
            <span>✨ الكل</span>
          </button>
          {categories.map((cat) => {
            const Icon = categoryFilterIcons[cat.id] || Activity;
            const isActive = activeCategoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`service-tab-btn ${isActive ? 'service-tab-btn--active' : ''}`}
              >
                <Icon size={14} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Filtered Categories & Services Grid */}
        <AnimatePresence mode="wait">
          {filteredCategories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              style={{ marginBottom: 'clamp(2rem, 4vw, 3.5rem)' }}
            >
              <h3
                style={{
                  fontSize: 'clamp(1.15rem, 3vw, 1.6rem)',
                  marginBottom: '1rem',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'Cairo, sans-serif'
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--gradient-accent)',
                    boxShadow: '0 0 8px rgba(0, 212, 255, 0.6)',
                    flexShrink: 0
                  }}
                />
                {category.name}
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 290px), 1fr))',
                  gap: '1rem'
                }}
              >
                {category.services.map((service) => (
                  <motion.div
                    key={service.id}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass-card"
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '1rem',
                      overflow: 'hidden',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)'
                    }}
                  >
                    {service.image && (
                      <div style={{ width: '100%', height: '150px', overflow: 'hidden', position: 'relative' }}>
                        <img
                          src={service.image}
                          alt={service.name}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(10,16,28,0.95) 0%, transparent 60%)'
                          }}
                        />
                      </div>
                    )}
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h4 style={{ fontSize: '1.05rem', color: 'var(--accent-light)', marginBottom: '0.4rem', fontFamily: 'Cairo, sans-serif' }}>
                        {service.name}
                      </h4>
                      <p style={{ color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.85rem', flex: 1, fontSize: '0.85rem' }}>
                        {service.description}
                      </p>

                      {service.types && (
                        <div style={{ marginBottom: '0.85rem' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {service.types.slice(0, 3).map(type => (
                              <span
                                key={type}
                                style={{
                                  fontSize: '0.72rem',
                                  background: 'rgba(0, 212, 255, 0.08)',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '0.5rem',
                                  border: '1px solid rgba(0, 212, 255, 0.15)',
                                  color: 'var(--text-main)',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {type}
                              </span>
                            ))}
                            {service.types.length > 3 && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--accent)', alignSelf: 'center' }}>
                                +{service.types.length - 3} أنواع أخرى
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onBookNow(category.id, service.id);
                        }}
                        style={{
                          marginTop: 'auto',
                          width: '100%',
                          padding: '0.65rem 1rem',
                          borderRadius: '0.75rem',
                          background: 'var(--gradient-accent)',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.4,
                          minHeight: '44px',
                          boxShadow: '0 4px 15px rgba(0, 212, 255, 0.2)',
                          fontFamily: 'Cairo, sans-serif'
                        }}
                      >
                        <span>احجز هذه الخدمة الآن</span>
                        <ArrowLeft size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <style>{`
        .service-tabs-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1.75rem;
          overflow-x: auto;
          padding: 0.25rem 0.5rem 0.5rem;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }

        .service-tabs-bar::-webkit-scrollbar {
          display: none;
        }

        .service-tab-btn {
          padding: 0.5rem 1.1rem;
          border-radius: 2rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          white-space: nowrap;
          min-height: 40px;
          transition: all 0.25s ease;
          font-family: 'Cairo', sans-serif;
        }

        .service-tab-btn--active {
          background: var(--gradient-accent);
          color: #ffffff;
          border-color: transparent;
          font-weight: 700;
          box-shadow: 0 4px 15px rgba(0, 212, 255, 0.25);
        }
      `}</style>
    </section>
  );
};

export default ServiceShowcase;
