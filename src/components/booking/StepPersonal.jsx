import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Send, Loader2, ShieldCheck } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

const StepPersonal = ({ formData, onUpdateFormData, onSubmit, onBack, isSubmitting }) => {
  const { name = '', gender = '', phone = '', notes = '' } = formData || {};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onUpdateFormData({ [name]: value });
  };

  const handleGenderSelect = (selectedGender) => {
    onUpdateFormData({ gender: selectedGender });
  };

  const isValid = name.trim().length > 0 && gender !== '' && phone.trim().length > 0;

  const isMaleActive = gender === 'ذكر' || gender === 'male';
  const isFemaleActive = gender === 'أنثى' || gender === 'female';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid && !isSubmitting) {
      onSubmit();
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="step-personal-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
      }}
    >
      <div className="booking-summary-preview" style={{
        padding: '16px',
        borderRadius: '16px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
          <ShieldCheck size={20} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>تفاصيل موعدك المحدد:</h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          {formData.service && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>الخدمة:</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                {formData.service} {formData.subType ? `- ${formData.subType}` : ''}
              </span>
            </div>
          )}
          
          {formData.goal && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>الهدف:</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{formData.goal}</span>
            </div>
          )}
          
          {formData.date && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>التاريخ:</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{formData.date}</span>
            </div>
          )}
          
          {formData.time && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>الوقت:</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                {formData.time} {formData.duration ? `(${formData.duration})` : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label className="booking-form-label" htmlFor="name" style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-main)' }}>
            الاسم بالكامل <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="booking-form-input booking-touch-target"
            value={name}
            onChange={handleInputChange}
            placeholder="أدخل اسمك الكامل"
            required
            autoFocus
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label className="booking-form-label" style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-main)' }}>
            الجنس <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div className="booking-gender-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div
              className={`booking-gender-card booking-touch-target ${isMaleActive ? 'booking-gender-card--male-active' : ''}`}
              onClick={() => handleGenderSelect('ذكر')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: isMaleActive ? 'rgba(0, 212, 255, 0.1)' : 'var(--bg-main)',
                border: isMaleActive ? '2px solid #00d4ff' : '1px solid var(--border-color)',
                color: isMaleActive ? '#00d4ff' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: isMaleActive ? 600 : 400,
                transition: 'all 0.2s',
                minHeight: '44px'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>♂</span>
              <span style={{ fontSize: '1rem' }}>ذكر</span>
            </div>
            <div
              className={`booking-gender-card booking-touch-target ${isFemaleActive ? 'booking-gender-card--female-active' : ''}`}
              onClick={() => handleGenderSelect('أنثى')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: isFemaleActive ? 'rgba(224, 64, 251, 0.1)' : 'var(--bg-main)',
                border: isFemaleActive ? '2px solid #e040fb' : '1px solid var(--border-color)',
                color: isFemaleActive ? '#e040fb' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: isFemaleActive ? 600 : 400,
                transition: 'all 0.2s',
                minHeight: '44px'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>♀</span>
              <span style={{ fontSize: '1rem' }}>أنثى</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label className="booking-form-label" htmlFor="phone" style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-main)' }}>
            رقم الموبايل (واتساب) <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            dir="ltr"
            className="booking-form-input booking-touch-target"
            value={phone}
            onChange={handleInputChange}
            placeholder="01xxxxxxxxx"
            required
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s',
              textAlign: 'right'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label className="booking-form-label" htmlFor="notes" style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-main)' }}>
            ملاحظات إضافية <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>(اختياري)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows="2"
            className="booking-form-textarea booking-touch-target"
            value={notes}
            onChange={handleInputChange}
            placeholder="أي تفاصيل أخرى تود إضافتها..."
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s',
              resize: 'vertical'
            }}
          />
        </div>

        <div className="booking-sticky-footer" style={{
          display: 'flex',
          gap: '12px',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={onBack}
            className="booking-back-btn booking-touch-target"
            disabled={isSubmitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px 20px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              fontWeight: 600,
              minHeight: '44px',
              opacity: isSubmitting ? 0.5 : 1
            }}
          >
            <ArrowRight size={20} />
            <span>رجوع</span>
          </button>
          
          <button
            type="submit"
            className={`booking-primary-btn booking-touch-target ${(!isValid || isSubmitting) ? 'booking-primary-btn--disabled' : ''}`}
            disabled={!isValid || isSubmitting}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px 20px',
              borderRadius: '12px',
              background: (!isValid || isSubmitting) ? 'var(--bg-card)' : 'var(--gradient-accent)',
              color: (!isValid || isSubmitting) ? 'var(--text-muted)' : '#fff',
              border: (!isValid || isSubmitting) ? '1px solid var(--border-color)' : 'none',
              cursor: (!isValid || isSubmitting) ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              minHeight: '44px'
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="booking-spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
                <span>جاري الإرسال...</span>
              </>
            ) : (
              <>
                <span>تأكيد وإرسال الحجز عبر واتساب</span>
                <Send size={20} />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default StepPersonal;
