import React from 'react';
import { categories } from '../servicesData';
import { motion } from 'framer-motion';

const ServiceShowcase = () => {
  return (
    <section id="services" className="section-padding">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--accent)', marginBottom: '1rem' }}>خدماتنا الاحترافية</h2>
          <div style={{ width: '80px', height: '4px', background: 'var(--accent)', margin: '0 auto' }}></div>
        </div>

        {categories.map((category, catIdx) => (
          <div key={category.id} style={{ marginBottom: '5rem' }}>
            <h3 style={{ 
              fontSize: '2rem', 
              marginBottom: '2rem', 
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent)' }}></span>
              {category.name}
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '2rem' 
            }}>
              {category.services.map((service, serIdx) => (
                <motion.div 
                  key={service.id}
                  whileHover={{ y: -10 }}
                  className="glass-card" 
                  style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <h4 style={{ fontSize: '1.5rem', color: 'var(--accent-light)', marginBottom: '1rem' }}>{service.name}</h4>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>{service.description}</p>
                  
                  {service.types && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>الأنواع:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {service.types.map(type => (
                          <span key={type} style={{ fontSize: '0.85rem', background: 'var(--bg-main)', padding: '0.25rem 0.75rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>{type}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {service.indications && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>يستخدم في:</strong>
                      <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {service.indications.map(item => (
                          <li key={item} style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ color: 'var(--accent)' }}>•</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <a href="#booking" style={{ 
                    marginTop: 'auto', 
                    color: 'var(--accent)', 
                    fontWeight: 700, 
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    احجز الآن ←
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServiceShowcase;
