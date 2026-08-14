import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  Search, 
  Check,
  Calendar,
  Info
} from 'lucide-react';
import { massageCategories } from '../../data/massageData';

const getUpcomingDates = () => {
  const dates = [];
  const today = new Date();
  
  const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    
    let label = '';
    if (i === 0) label = 'اليوم';
    else if (i === 1) label = 'غداً';
    else if (i === 2) label = 'بعد غد';
    else label = dayNames[d.getDay()];

    const dateStr = d.toISOString().split('T')[0];
    const displayDate = `${d.getDate()}/${d.getMonth() + 1}`;
    
    dates.push({
      date: dateStr,
      label,
      displayDate
    });
  }
  return dates;
};

const StepDetails = ({ categoryKey, serviceId, formData, onUpdateFormData, onNext, onBack }) => {
  // Therapy States
  const [activeCatId, setActiveCatId] = useState(massageCategories[0]?.id || 'relaxation');
  const [expandedType, setExpandedType] = useState(null);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [massageSearch, setMassageSearch] = useState('');
  
  const upcomingDates = useMemo(() => getUpcomingDates(), []);

  // Validation
  const isValid = useMemo(() => {
    if (categoryKey === 'therapy') {
      return !!(formData.subType && formData.date && formData.time);
    } else {
      return !!(formData.weight && formData.height && formData.goal && formData.experience);
    }
  }, [categoryKey, formData]);

  const handleSelectMassage = (typeId) => {
    const todayStr = new Date().toISOString().split('T')[0];
    onUpdateFormData({
      subType: typeId,
      duration: formData.duration || '60',
      date: formData.date || todayStr
    });
    // Auto expand if not expanded
    if (expandedType !== typeId) {
      setExpandedType(typeId);
    }
  };

  const toggleExpand = (typeId, e) => {
    e.stopPropagation();
    setExpandedType(prev => prev === typeId ? null : typeId);
  };

  const activeCategory = massageCategories.find(c => c.id === activeCatId);
  const filteredTypes = activeCategory?.types.filter(t => 
    t.name.toLowerCase().includes(massageSearch.toLowerCase()) || 
    t.description.toLowerCase().includes(massageSearch.toLowerCase())
  ) || [];

  const timeSlots = ['10:00 ص', '12:00 م', '02:00 م', '04:00 م', '06:00 م', '08:00 م', '10:00 م'];

  const renderTherapyForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Category Chips */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-main)' }}>
          اختر نوع الجلسة
        </h3>
        <div className="booking-chips-scroll" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
          {massageCategories.map(cat => {
            const Icon = cat.icon || CheckCircle2;
            const isActive = activeCatId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCatId(cat.id);
                  setExpandedType(null);
                  setMassageSearch('');
                }}
                className={`booking-chip ${isActive ? 'booking-chip--active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  borderRadius: '24px',
                  whiteSpace: 'nowrap',
                  background: isActive ? 'var(--gradient-accent)' : 'var(--bg-card)',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  border: isActive ? 'none' : '1px solid var(--border-color)',
                  transition: 'all 0.3s ease',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '400'
                }}
              >
                <Icon size={16} />
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="ابحث عن مساج معين..."
          value={massageSearch}
          onChange={(e) => setMassageSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px 12px 40px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            color: 'var(--text-main)',
            fontSize: '16px',
            outline: 'none'
          }}
        />
      </div>

      {/* Massage Accordion */}
      <div className="massage-accordion" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <AnimatePresence>
          {filteredTypes.map((type) => {
            const isSelected = formData.subType === type.id;
            const isExpanded = expandedType === type.id;
            return (
              <motion.div
                layout
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`massage-accordion-item ${isSelected ? 'massage-accordion-item--active' : ''}`}
                style={{
                  background: isSelected ? 'rgba(0, 212, 255, 0.05)' : 'var(--bg-card)',
                  border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border-color)'}`,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                <div 
                  className="massage-accordion-header"
                  onClick={() => handleSelectMassage(type.id)}
                  style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--text-muted)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isSelected ? 'var(--accent)' : 'transparent'
                    }}>
                      {isSelected && <Check size={14} color="#fff" />}
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: isSelected ? '600' : '500', color: isSelected ? 'var(--accent)' : 'var(--text-main)' }}>
                      {type.name}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => toggleExpand(type.id, e)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                  >
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="massage-accordion-body"
                    >
                      <div style={{ padding: '0 16px 16px 48px', color: 'var(--text-muted)', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <p>{type.description}</p>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px', marginTop: '4px' }}>
                          <CheckCircle2 size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span><strong>مناسب لـ:</strong> {type.suitability}</span>
                        </div>
                        {type.note && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', background: 'rgba(224, 64, 251, 0.05)', padding: '8px 12px', borderRadius: '8px' }}>
                            <Info size={16} color="#e040fb" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span style={{ color: '#e040fb' }}>{type.note}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Duration */}
      {formData.subType && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '8px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '12px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} /> مدة الجلسة
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {['30', '60', '90'].map(dur => (
              <button
                key={dur}
                onClick={() => onUpdateFormData({ duration: dur })}
                className={`booking-picker-btn ${formData.duration === dur ? 'booking-picker-btn--active' : ''}`}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: `1px solid ${formData.duration === dur ? 'var(--accent)' : 'var(--border-color)'}`,
                  background: formData.duration === dur ? 'rgba(0, 212, 255, 0.1)' : 'var(--bg-card)',
                  color: formData.duration === dur ? 'var(--accent)' : 'var(--text-main)',
                  fontWeight: formData.duration === dur ? '600' : '400',
                  transition: 'all 0.2s ease',
                  fontSize: '16px'
                }}
              >
                {dur} دقيقة
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Date */}
      {formData.duration && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} /> تاريخ الجلسة
            </h4>
            <button 
              onClick={() => setShowCustomDate(!showCustomDate)}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '14px', textDecoration: 'underline' }}
            >
              {showCustomDate ? 'عرض الأيام القادمة' : 'تاريخ آخر'}
            </button>
          </div>
          
          {showCustomDate ? (
            <input
              type="date"
              value={formData.date || ''}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => onUpdateFormData({ date: e.target.value })}
              style={{
                width: '100%',
                padding: '14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--accent)',
                borderRadius: '12px',
                color: 'var(--text-main)',
                fontSize: '16px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          ) : (
            <div className="booking-picker-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
              {upcomingDates.map(item => {
                const isActive = formData.date === item.date;
                return (
                  <button
                    key={item.date}
                    onClick={() => onUpdateFormData({ date: item.date })}
                    className={`booking-picker-btn booking-picker-btn--date ${isActive ? 'booking-picker-btn--active' : ''}`}
                    style={{
                      padding: '10px 4px',
                      borderRadius: '12px',
                      border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-color)'}`,
                      background: isActive ? 'rgba(0, 212, 255, 0.1)' : 'var(--bg-card)',
                      color: isActive ? 'var(--accent)' : 'var(--text-main)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: '500', opacity: 0.8 }}>{item.label}</span>
                    <span style={{ fontSize: '15px', fontWeight: '600' }}>{item.displayDate}</span>
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Time */}
      {formData.date && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '8px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '12px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} /> وقت الجلسة
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {timeSlots.map(time => {
              const isActive = formData.time === time;
              return (
                <button
                  key={time}
                  onClick={() => onUpdateFormData({ time })}
                  className={`booking-picker-btn ${isActive ? 'booking-picker-btn--active' : ''}`}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '12px',
                    border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-color)'}`,
                    background: isActive ? 'rgba(0, 212, 255, 0.1)' : 'var(--bg-card)',
                    color: isActive ? 'var(--accent)' : 'var(--text-main)',
                    fontWeight: isActive ? '600' : '400',
                    transition: 'all 0.2s ease',
                    fontSize: '15px'
                  }}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderNutritionForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>الوزن (كجم)</label>
          <input
            type="number"
            placeholder="مثال: 75"
            value={formData.weight || ''}
            onChange={(e) => {
              onUpdateFormData({ weight: e.target.value });
              if (!formData.experience) onUpdateFormData({ experience: 'مبتدئ' });
            }}
            style={{
              width: '100%',
              padding: '14px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              color: 'var(--text-main)',
              fontSize: '16px',
              outline: 'none'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>الطول (سم)</label>
          <input
            type="number"
            placeholder="مثال: 175"
            value={formData.height || ''}
            onChange={(e) => {
              onUpdateFormData({ height: e.target.value });
              if (!formData.experience) onUpdateFormData({ experience: 'مبتدئ' });
            }}
            style={{
              width: '100%',
              padding: '14px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              color: 'var(--text-main)',
              fontSize: '16px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>الهدف الأساسي</label>
        <input
          type="text"
          placeholder="مثال: خسارة الوزن، بناء العضلات..."
          value={formData.goal || ''}
          onChange={(e) => onUpdateFormData({ goal: e.target.value })}
          style={{
            width: '100%',
            padding: '14px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            color: 'var(--text-main)',
            fontSize: '16px',
            outline: 'none'
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>مستوى الخبرة</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {['مبتدئ', 'متوسط', 'متقدم'].map(level => {
            const isActive = formData.experience === level;
            return (
              <button
                key={level}
                onClick={() => onUpdateFormData({ experience: level })}
                style={{
                  padding: '12px 8px',
                  borderRadius: '12px',
                  border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-color)'}`,
                  background: isActive ? 'rgba(0, 212, 255, 0.1)' : 'var(--bg-card)',
                  color: isActive ? 'var(--accent)' : 'var(--text-main)',
                  fontWeight: isActive ? '600' : '400',
                  transition: 'all 0.2s ease',
                  fontSize: '15px'
                }}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>إصابات أو ملاحظات طبية (اختياري)</label>
        <textarea
          placeholder="أدخل أي ملاحظات طبية هنا..."
          value={formData.injuries || ''}
          onChange={(e) => onUpdateFormData({ injuries: e.target.value })}
          rows={3}
          style={{
            width: '100%',
            padding: '14px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            color: 'var(--text-main)',
            fontSize: '16px',
            outline: 'none',
            resize: 'vertical'
          }}
        />
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={onBack}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-main)',
            cursor: 'pointer'
          }}
        >
          <ArrowRight size={20} />
        </button>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
          {categoryKey === 'therapy' ? 'تفاصيل الجلسة' : 'بيانات البرنامج'}
        </h2>
      </div>

      {/* Main Form Content */}
      <div style={{ flex: 1 }}>
        {categoryKey === 'therapy' ? renderTherapyForm() : renderNutritionForm()}
      </div>

      {/* Sticky Footer CTA */}
      <div 
        className="booking-sticky-footer"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 20px',
          background: 'var(--bg-main)',
          borderTop: '1px solid var(--border-color)',
          zIndex: 10
        }}
      >
        <button
          onClick={onNext}
          disabled={!isValid}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '16px',
            background: isValid ? 'var(--gradient-accent)' : 'var(--bg-card)',
            color: isValid ? '#fff' : 'var(--text-muted)',
            border: 'none',
            fontSize: '16px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: isValid ? 1 : 0.7,
            cursor: isValid ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease'
          }}
        >
          التالي
        </button>
      </div>
    </div>
  );
};

export default StepDetails;
