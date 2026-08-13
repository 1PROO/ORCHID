import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ChevronDown, ChevronUp, CheckCircle2,
  Clock, Calendar, Sparkles, Info, AlertTriangle, Activity
} from 'lucide-react';
import { massageCategories } from '../../data/massageData';

const pageVariants = {
  enter: { opacity: 0, x: -30 },
  center: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 30, transition: { duration: 0.2 } }
};

const TIME_SLOTS = [
  '10:00 ص',
  '12:00 م',
  '02:00 م',
  '04:00 م',
  '06:00 م',
  '08:00 م',
  '10:00 م'
];

const DURATIONS = [30, 60, 90];

const EXPERIENCE_LEVELS = ['مبتدئ', 'متوسط', 'متقدم'];

// Helper to generate upcoming 7 dates formatted in Arabic
function getUpcomingDates() {
  const dates = [];
  const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const monthsAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);

    const dayName = i === 0 ? 'اليوم' : i === 1 ? 'غداً' : daysAr[d.getDay()];
    const dayNum = d.getDate();
    const monthName = monthsAr[d.getMonth()];
    const dateFormatted = `${dayName}، ${dayNum} ${monthName}`;
    const isoDate = d.toISOString().split('T')[0];

    dates.push({
      label: dayName,
      subLabel: `${dayNum} ${monthName}`,
      fullValue: dateFormatted,
      isoDate
    });
  }
  return dates;
}

const StepDetails = ({
  categoryKey,
  serviceId,
  formData = {},
  onUpdateFormData,
  onNext,
  onBack
}) => {
  const activeCategory = categoryKey || formData.categoryId || 'therapy';
  const isTherapy = activeCategory === 'therapy';

  // Category chip selection state (default to first category in massageCategories)
  const [activeCatId, setActiveCatId] = useState(massageCategories[0]?.id || 'relaxation');
  // Accordion expanded state map (type.id -> boolean)
  const [expandedTypes, setExpandedTypes] = useState({});
  // Show manual date input flag
  const [showCustomDate, setShowCustomDate] = useState(false);

  const currentMassageCat = massageCategories.find(c => c.id === activeCatId) || massageCategories[0];

  const toggleAccordion = (typeId, e) => {
    e.stopPropagation();
    setExpandedTypes(prev => ({
      ...prev,
      [typeId]: !prev[typeId]
    }));
  };

  const handleSelectType = (type) => {
    if (onUpdateFormData) {
      onUpdateFormData({
        subType: type.name,
        subTypeId: type.id
      });
    }
    // Automatically expand selected item details if collapsed
    setExpandedTypes(prev => ({
      ...prev,
      [type.id]: true
    }));
  };

  const handleUpdate = (fields) => {
    if (onUpdateFormData) {
      onUpdateFormData(fields);
    }
  };

  // Mandatory fields validation
  const isTherapyValid = Boolean(formData.subType && formData.date && formData.time);
  const isNutritionTrainingValid = Boolean(
    formData.weight &&
    formData.height &&
    formData.goal &&
    formData.experience
  );
  const isValid = isTherapy ? isTherapyValid : isNutritionTrainingValid;

  const upcomingDates = getUpcomingDates();

  return (
    <motion.div
      key="step-details"
      variants={pageVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="step-details-container"
    >
      {/* Back button header */}
      <div className="step-service-header" style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={onBack}
          className="booking-back-btn"
          aria-label="العودة لخطوة اختيار الخدمة"
        >
          <ArrowRight size={16} />
          <span>رجوع</span>
        </button>
      </div>

      <h3 className="step-service-title" style={{ marginBottom: '1.25rem' }}>
        تفاصيل <span className="step-service-category-name">الحجز</span>
      </h3>

      {isTherapy ? (
        <div className="step-details-therapy-flow" style={{ display: 'grid', gap: '1.5rem' }}>
          
          {/* 1. Category Chips Bar (Scroll-Snap) */}
          <div>
            <label className="booking-form-label" style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>
              اختر قسم المساج المطلوب:
            </label>
            <div className="booking-chips-scroll">
              {massageCategories.map((cat) => {
                const isActive = activeCatId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCatId(cat.id)}
                    className={`booking-chip ${isActive ? 'booking-chip--active' : ''}`}
                    aria-pressed={isActive}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.title.replace('قسم ', '')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Massage Types Accordion List */}
          <div>
            <div className="massage-category-header">
              <h4 className="massage-category-title">
                <span>{currentMassageCat.icon}</span>
                <span>{currentMassageCat.title}</span>
              </h4>
              <span className="massage-category-count">
                {currentMassageCat.types.length} أنواع
              </span>
            </div>

            <div className="massage-accordion" style={{ display: 'grid', gap: '0.75rem' }}>
              {currentMassageCat.types.map((type) => {
                const isSelected = formData.subType === type.name || formData.subTypeId === type.id;
                const isExpanded = Boolean(expandedTypes[type.id]);

                return (
                  <div
                    key={type.id}
                    className={`massage-accordion-item ${isSelected ? 'massage-accordion-item--active' : ''}`}
                  >
                    {/* Accordion Header / Tappable row */}
                    <div
                      className="massage-accordion-header booking-touch-target"
                      onClick={() => handleSelectType(type)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectType(type);
                        }
                      }}
                    >
                      <div className="massage-item-header">
                        <span className={`massage-radio-circle ${isSelected ? 'massage-radio-circle--selected' : ''}`} />
                        <span className={`massage-item-title ${isSelected ? 'massage-item-title--selected' : ''}`}>
                          {type.name}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isSelected && (
                          <span className="massage-accordion-badge">
                            محدد
                          </span>
                        )}
                        <button
                          type="button"
                          className="massage-toggle-btn booking-touch-target"
                          onClick={(e) => toggleAccordion(type.id, e)}
                          aria-label={isExpanded ? 'طي التفاصيل' : 'عرض التفاصيل'}
                        >
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Accordion Body Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="massage-accordion-body"
                        >
                          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: '0.75rem 0' }}>
                            {type.description}
                          </p>

                          {type.suitability && (
                            <div className="massage-suitability-box">
                              <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                              <span><strong>الملائمة:</strong> {type.suitability}</span>
                            </div>
                          )}

                          {type.note && (
                            <div className="massage-note-box">
                              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                              <span>{type.note}</span>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleSelectType(type)}
                            className={`massage-select-type-btn booking-touch-target ${
                              isSelected ? 'massage-select-type-btn--selected' : ''
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <CheckCircle2 size={16} />
                                <span>تم تحديد هذا النوع</span>
                              </>
                            ) : (
                              <span>اختر هذا النوع</span>
                            )}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Duration Picker (30, 60, 90 mins) */}
          <div>
            <label className="booking-form-label" style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>
              المدة المطلوبة للجلسة:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {DURATIONS.map((dur) => {
                const isDurSelected = String(formData.duration) === String(dur);
                return (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => handleUpdate({ duration: String(dur) })}
                    className={`booking-picker-btn booking-touch-target ${
                      isDurSelected ? 'booking-picker-btn--active' : ''
                    }`}
                  >
                    <Clock size={14} style={{ marginLeft: '4px' }} />
                    <span>{dur} دقيقة</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Touch-Friendly Date Picker */}
          <div>
            <div className="massage-item-content-header">
              <label className="booking-form-label" style={{ fontSize: '0.95rem', margin: 0 }}>
                التاريخ المفضل *
              </label>
              <button
                type="button"
                className="booking-date-toggle-btn booking-touch-target"
                onClick={() => setShowCustomDate(!showCustomDate)}
              >
                {showCustomDate ? 'عرض الأيام المقترحة' : 'تاريخ آخر'}
              </button>
            </div>

            {showCustomDate ? (
              <input
                type="date"
                name="date"
                value={formData.date || ''}
                onChange={(e) => handleUpdate({ date: e.target.value })}
                className="booking-form-input booking-touch-target"
              />
            ) : (
              <div className="booking-picker-grid">
                {upcomingDates.map((item) => {
                  const isDateSelected = formData.date === item.fullValue || formData.date === item.isoDate;
                  return (
                    <button
                      key={item.isoDate}
                      type="button"
                      onClick={() => handleUpdate({ date: item.fullValue })}
                      className={`booking-picker-btn booking-picker-btn--date booking-touch-target ${
                        isDateSelected ? 'booking-picker-btn--active' : ''
                      }`}
                    >
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.label}</span>
                      <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>{item.subLabel}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. Touch-Friendly Time Slot Picker */}
          <div>
            <label className="booking-form-label" style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>
              الوقت المفضل *
            </label>
            <div className="booking-picker-grid">
              {TIME_SLOTS.map((slot) => {
                const isTimeSelected = formData.time === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handleUpdate({ time: slot })}
                    className={`booking-picker-btn booking-touch-target ${
                      isTimeSelected ? 'booking-picker-btn--active' : ''
                    }`}
                  >
                    <span>{slot}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Nutrition & Training Flow: Single column stacked inputs */
        <div className="step-details-nutrition-flow" style={{ display: 'grid', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '0.75rem' }}>
            <div>
              <label className="booking-form-label">الوزن (كجم) *</label>
              <input
                type="number"
                name="weight"
                value={formData.weight || ''}
                onChange={(e) => handleUpdate({ weight: e.target.value })}
                placeholder="75"
                className="booking-form-input booking-touch-target"
                required
              />
            </div>
            <div>
              <label className="booking-form-label">الطول (سم) *</label>
              <input
                type="number"
                name="height"
                value={formData.height || ''}
                onChange={(e) => handleUpdate({ height: e.target.value })}
                placeholder="175"
                className="booking-form-input booking-touch-target"
                required
              />
            </div>
          </div>

          <div>
            <label className="booking-form-label">ما هو هدفك من البرنامج؟ *</label>
            <input
              type="text"
              name="goal"
              value={formData.goal || ''}
              onChange={(e) => handleUpdate({ goal: e.target.value })}
              placeholder="مثال: تنشيف، زيادة كتلة عضلية، تحسين لياقة..."
              className="booking-form-input booking-touch-target"
              required
            />
          </div>

          <div>
            <label className="booking-form-label">مستوى الخبرة / اللياقة *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {EXPERIENCE_LEVELS.map((lvl) => {
                const isExpSelected = formData.experience === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleUpdate({ experience: lvl })}
                    className={`booking-picker-btn booking-touch-target ${
                      isExpSelected ? 'booking-picker-btn--active' : ''
                    }`}
                  >
                    <span>{lvl}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="booking-form-label">إصابات أو حالات صحية سابقة (إن وجدت)</label>
            <textarea
              name="injuries"
              value={formData.injuries || ''}
              onChange={(e) => handleUpdate({ injuries: e.target.value })}
              placeholder="اكتب هنا أي تفاصيل تخص العمليات أو الإصابات..."
              className="booking-form-textarea booking-touch-target"
              rows={3}
            />
          </div>
        </div>
      )}

      {/* Navigation Buttons Row */}
      <div className="booking-next-row">
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className={`booking-primary-btn ${!isValid ? 'booking-primary-btn--disabled' : ''}`}
          style={{ flex: 1 }}
        >
          <span>التالي — بياناتك الشخصية</span>
        </button>
      </div>
    </motion.div>
  );
};

export default StepDetails;
