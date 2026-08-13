import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, MessageCircle, RefreshCw, Home, ClipboardList } from 'lucide-react';

const pageVariants = {
  enter: { opacity: 0, x: -30 },
  center: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 30, transition: { duration: 0.2 } }
};

const StepDone = ({
  bookingResult,
  formData: propFormData,
  whatsappUrl: propWhatsappUrl,
  selectedCategory: propSelectedCategory,
  selectedService: propSelectedService,
  onReset,
  onGoHome
}) => {
  const formData = bookingResult?.formData || propFormData || {};
  const whatsappUrl = bookingResult?.whatsappUrl || propWhatsappUrl || '';
  const selectedCategory = bookingResult?.selectedCategory || propSelectedCategory;
  const selectedService = bookingResult?.selectedService || propSelectedService;

  const categoryName = selectedCategory?.name || (
    formData.categoryId === 'therapy' ? 'الجلسات العلاجية' :
    formData.categoryId === 'nutrition' ? 'برامج التغذية' :
    formData.categoryId === 'training' ? 'التدريب' : formData.categoryId
  );

  const serviceName = selectedService?.name || formData.serviceId;

  const genderLabel = (formData.gender === 'male' || formData.gender === 'ذكر')
    ? 'ذكر'
    : (formData.gender === 'female' || formData.gender === 'أنثى')
    ? 'أنثى'
    : formData.gender;

  return (
    <motion.div
      key="step-done"
      variants={pageVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="step-done-container"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <CheckCircle2 size={64} className="step-done-icon" />
      </motion.div>

      <h3 className="step-done-title">تم الإرسال بنجاح! 🎉</h3>
      <p className="step-done-subtitle">
        تم إرسال بيانات حجزك. سيتم التواصل معك قريباً عبر واتساب لتأكيد الموعد.
      </p>

      {/* Structured Arabic Booking Summary Card */}
      <div className="booking-summary-card">
        <div className="booking-summary-header">
          <ClipboardList size={18} />
          <span>ملخص تفاصيل الحجز</span>
        </div>

        {categoryName && (
          <div className="booking-summary-row">
            <span className="booking-summary-label">القسم:</span>
            <span className="booking-summary-value">{categoryName}</span>
          </div>
        )}

        {serviceName && (
          <div className="booking-summary-row">
            <span className="booking-summary-label">الخدمة:</span>
            <span className="booking-summary-value">{serviceName}</span>
          </div>
        )}

        {formData.categoryId === 'therapy' ? (
          <>
            {formData.subType && (
              <div className="booking-summary-row">
                <span className="booking-summary-label">النوع:</span>
                <span className="booking-summary-value">{formData.subType}</span>
              </div>
            )}
            {formData.duration && (
              <div className="booking-summary-row">
                <span className="booking-summary-label">المدة:</span>
                <span className="booking-summary-value">{formData.duration} دقيقة</span>
              </div>
            )}
            {formData.date && (
              <div className="booking-summary-row">
                <span className="booking-summary-label">التاريخ:</span>
                <span className="booking-summary-value">{formData.date}</span>
              </div>
            )}
            {formData.time && (
              <div className="booking-summary-row">
                <span className="booking-summary-label">الوقت:</span>
                <span className="booking-summary-value">{formData.time}</span>
              </div>
            )}
          </>
        ) : (
          <>
            {formData.weight && (
              <div className="booking-summary-row">
                <span className="booking-summary-label">الوزن:</span>
                <span className="booking-summary-value">{formData.weight} كجم</span>
              </div>
            )}
            {formData.height && (
              <div className="booking-summary-row">
                <span className="booking-summary-label">الطول:</span>
                <span className="booking-summary-value">{formData.height} سم</span>
              </div>
            )}
            {formData.goal && (
              <div className="booking-summary-row">
                <span className="booking-summary-label">الهدف:</span>
                <span className="booking-summary-value">{formData.goal}</span>
              </div>
            )}
            {formData.experience && (
              <div className="booking-summary-row">
                <span className="booking-summary-label">الخبرة:</span>
                <span className="booking-summary-value">{formData.experience}</span>
              </div>
            )}
            {formData.injuries && (
              <div className="booking-summary-row">
                <span className="booking-summary-label">الإصابات:</span>
                <span className="booking-summary-value">{formData.injuries}</span>
              </div>
            )}
          </>
        )}

        {formData.name && (
          <div className="booking-summary-row">
            <span className="booking-summary-label">الاسم:</span>
            <span className="booking-summary-value">{formData.name}</span>
          </div>
        )}

        {genderLabel && (
          <div className="booking-summary-row">
            <span className="booking-summary-label">الجنس:</span>
            <span className="booking-summary-value">{genderLabel}</span>
          </div>
        )}

        {formData.phone && (
          <div className="booking-summary-row">
            <span className="booking-summary-label">رقم الموبايل:</span>
            <span className="booking-summary-value">{formData.phone}</span>
          </div>
        )}

        {formData.notes && (
          <div className="booking-summary-row">
            <span className="booking-summary-label">ملاحظات:</span>
            <span className="booking-summary-value">{formData.notes}</span>
          </div>
        )}
      </div>

      {/* Primary WhatsApp Direct Link Button */}
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="booking-whatsapp-btn"
        >
          <MessageCircle size={18} />
          <span>متابعة الحجز عبر واتساب</span>
        </a>
      )}

      {/* Action Buttons */}
      <div className="booking-actions-row">
        <button
          type="button"
          onClick={onReset}
          className="booking-reset-btn"
        >
          <RefreshCw size={16} />
          <span>حجز موعد جديد</span>
        </button>

        <button
          type="button"
          onClick={onGoHome}
          className="booking-home-btn"
        >
          <Home size={16} />
          <span>العودة للرئيسية</span>
        </button>
      </div>
    </motion.div>
  );
};

export default StepDone;
