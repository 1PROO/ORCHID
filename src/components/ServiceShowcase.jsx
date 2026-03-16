import React from 'react';
import { categories } from '../servicesData';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const ServiceShowcase = ({ onBookNow }) => {
  return (
    <section id="services" style={{ padding: 'clamp(2rem, 5vw, 4rem) 0' }}>
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 5vw, 4rem)' }}
        >
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: 'var(--accent)', marginBottom: '1rem' }}>خدماتنا الاحترافية</h2>
          <div style={{ width: '60px', height: '3px', background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', margin: '0 auto' }}></div>
        </motion.div>

        {categories.map((category) => (
          <div key={category.id} style={{ marginBottom: 'clamp(2.5rem, 5vw, 5rem)' }}>
            <motion.h3 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ 
                fontSize: 'clamp(1.25rem, 3vw, 2rem)', 
                marginBottom: '1.5rem', 
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <span style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                background: 'var(--accent)',
                boxShadow: '0 0 8px rgba(212, 175, 55, 0.5)',
                flexShrink: 0
              }}></span>
              {category.name}
            </motion.h3>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', 
                gap: 'clamp(1rem, 2vw, 2rem)' 
              }}
            >
              {category.services.map((service) => (
                <motion.div 
                  key={service.id}
                  variants={cardVariants}
                  whileHover={{ y: -6, boxShadow: '0 12px 30px rgba(0,0,0,0.5)' }}
                  className="glass-card" 
                  style={{ 
                    padding: 'clamp(1.25rem, 3vw, 2rem)', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'box-shadow 0.3s ease'
                  }}
                >
                  <h4 style={{ 
                    fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', 
                    color: 'var(--accent-light)', 
                    marginBottom: '0.75rem' 
                  }}>{service.name}</h4>

                  <p style={{ 
                    color: 'var(--text-muted)', 
                    lineHeight: 1.7, 
                    marginBottom: '1rem', 
                    flex: 1,
                    fontSize: 'clamp(0.85rem, 1.5vw, 1rem)'
                  }}>{service.description}</p>
                  
                  {service.types && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>الأنواع:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {service.types.map(type => (
                          <span key={type} style={{ 
                            fontSize: '0.8rem', 
                            background: 'var(--bg-main)', 
                            padding: '0.2rem 0.6rem', 
                            borderRadius: '0.75rem', 
                            border: '1px solid var(--border-color)',
                            whiteSpace: 'nowrap'
                          }}>{type}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {service.indications && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>يستخدم في:</strong>
                      <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {service.indications.map(item => (
                          <li key={item} style={{ 
                            fontSize: '0.85rem', 
                            color: 'var(--text-muted)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.4rem', 
                            marginBottom: '0.2rem' 
                          }}>
                            <span style={{ color: 'var(--accent)', fontSize: '0.6rem' }}>●</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <motion.div 
                    onClick={(e) => { e.preventDefault(); onBookNow(category.id, service.id); }} 
                    whileHover={{ x: -5 }}
                    style={{ 
                      marginTop: 'auto', 
                      color: 'var(--accent)', 
                      fontWeight: 700, 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-color)',
                      fontSize: '0.95rem',
                      transition: 'color 0.2s'
                    }}
                  >
                    احجز الآن ←
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServiceShowcase;
