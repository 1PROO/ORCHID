import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Send, Loader2 } from 'lucide-react';

const pageVariants = {
  enter: { opacity: 0, x: -30 },
  center: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 30, transition: { duration: 0.2 } }
};

const StepPersonal = ({
  formData = {},
  onUpdateFormData,
  onSubmit,
  onBack,
  isSubmitting = false
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (onUpdateFormData) {
      onUpdateFormData({ [name]: value });
    }
  };

  const handleGenderSelect = (genderValue) => {
    if (onUpdateFormData) {
      onUpdateFormData({ gender: genderValue });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  // Submit button is disabled if mandatory fields (name, gender, phone) are missing or form is submitting
  const isFormValid = Boolean(
    formData.name &&
    formData.name.trim() &&
    formData.gender &&
    formData.phone &&
    formData.phone.trim()
  );

  const isDisabled = isSubmitting || !isFormValid;

  return (
    <motion.div
      key="step-personal"
      variants={pageVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="step-personal-container"
    >
      {/* Header back button */}
      <div className="step-service-header" style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={onBack}
          className="booking-back-btn"
          aria-label="رجوع للتفاصيل"
        >
          <ArrowRight size={16} />
          <span>رجوع للتفاصيل</span>
        </button>
      </div>

      <h3 className="step-service-title" style={{ marginBottom: '1.25rem' }}>
        البيانات <span className="step-service-category-name">الشخصية</span>
      </h3>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
        {/* Full Name */}
        <div>
          <label className="booking-form-label">الاسم بالكامل *</label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleInputChange}
            placeholder="أدخل اسمك بالكامل"
            className="booking-form-input booking-touch-target"
            required
          />
        </div>

        {/* Gender Touch Cards */}
        <div>
          <label className="booking-form-label">الجنس *</label>
          <div className="booking-gender-grid">
            <button
              type="button"
              className={`booking-gender-card booking-touch-target ${
                formData.gender === 'male' || formData.gender === 'ذكر'
                  ? 'booking-gender-card--male-active'
                  : ''
              }`}
              onClick={() => handleGenderSelect('ذكر')}
              aria-pressed={formData.gender === 'male' || formData.gender === 'ذكر'}
            >
              <span style={{ fontSize: '1.25rem' }}>♂</span>
              <span>ذكر</span>
            </button>

            <button
              type="button"
              className={`booking-gender-card booking-touch-target ${
                formData.gender === 'female' || formData.gender === 'أنثى'
                  ? 'booking-gender-card--female-active'
                  : ''
              }`}
              onClick={() => handleGenderSelect('أنثى')}
              aria-pressed={formData.gender === 'female' || formData.gender === 'أنثى'}
            >
              <span style={{ fontSize: '1.25rem' }}>♀</span>
              <span>أنثى</span>
            </button>
          </div>
        </div>

        {/* Phone Input */}
        <div>
          <label className="booking-form-label">رقم الموبايل (واتساب) *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleInputChange}
            placeholder="01xxxxxxxxx"
            className="booking-form-input booking-touch-target"
            required
          />
        </div>

        {/* Notes Input */}
        <div>
          <label className="booking-form-label">ملاحظات إضافية</label>
          <textarea
            name="notes"
            value={formData.notes || ''}
            onChange={handleInputChange}
            placeholder="أي تفاصيل أو ملاحظات خاصة تريد إضافتها..."
            className="booking-form-textarea booking-touch-target"
            rows={3}
          />
        </div>

        {/* Sticky Mobile Action Footer */}
        <div className="booking-sticky-footer">
          <button
            type="button"
            onClick={onBack}
            className="booking-back-btn"
            aria-label="رجوع للتفاصيل"
          >
            <ArrowRight size={16} />
            <span>رجوع</span>
          </button>

          <button
            type="submit"
            disabled={isDisabled}
            className={`booking-primary-btn ${isDisabled ? 'booking-primary-btn--disabled' : ''}`}
            style={{ flex: 1 }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="booking-spin-icon" />
                <span>جاري الإرسال...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>تأكيد الحجز عبر واتساب</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default StepPersonal;
