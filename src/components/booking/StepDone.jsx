import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, MessageCircle, RefreshCw, Home, ClipboardList, Copy, Check } from 'lucide-react';

const StepDone = ({
  bookingResult,
  formData: propFormData,
  whatsappUrl: propWhatsappUrl,
  selectedCategory: propSelectedCategory,
  selectedService: propSelectedService,
  onReset,
  onGoHome
}) => {
  const [copied, setCopied] = useState(false);

  const formData = bookingResult?.formData || propFormData || {};
  const whatsappUrl = bookingResult?.whatsappUrl || propWhatsappUrl || '';
  const selectedCategory = bookingResult?.selectedCategory || propSelectedCategory;
  const selectedService = bookingResult?.selectedService || propSelectedService;

  const genderLabel = (formData.gender === 'male' || formData.gender === 'ذكر') ? 'ذكر'
    : (formData.gender === 'female' || formData.gender === 'أنثى') ? 'أنثى'
    : formData.gender || 'غير محدد';

  const categoryName = selectedCategory?.name || (
    formData.categoryId === 'therapy' ? 'الجلسات العلاجية' :
    formData.categoryId === 'nutrition' ? 'برامج التغذية' :
    formData.categoryId === 'training' ? 'التدريب' : formData.categoryId
  );

  const serviceName = selectedService?.name || formData.serviceId || 'غير محدد';

  const getSummaryText = () => {
    let text = `*ملخص تفاصيل الحجز*\n\n`;
    text += `القسم: ${categoryName}\n`;
    text += `الخدمة: ${serviceName}\n`;

    if (formData.categoryId === 'therapy') {
      text += `النوع: ${formData.type === 'package' ? 'باقة' : 'جلسة مفردة'}\n`;
      text += `المدة: ${formData.duration || ''}\n`;
      text += `التاريخ: ${formData.date || ''}\n`;
      text += `الوقت: ${formData.time || ''}\n`;
    } else if (formData.categoryId === 'nutrition' || formData.categoryId === 'training') {
      if (formData.weight) text += `الوزن: ${formData.weight} كغ\n`;
      if (formData.height) text += `الطول: ${formData.height} سم\n`;
      if (formData.goal) text += `الهدف: ${formData.goal}\n`;
      if (formData.experience) text += `الخبرة السابقة: ${formData.experience === 'yes' ? 'نعم' : 'لا'}\n`;
      if (formData.injuries) text += `الإصابات: ${formData.injuries === 'yes' ? 'نعم' : 'لا'}\n`;
      if (formData.injuriesDetails) text += `تفاصيل الإصابات: ${formData.injuriesDetails}\n`;
    }

    text += `\n*البيانات الشخصية:*\n`;
    text += `الاسم: ${formData.name || ''}\n`;
    text += `الجنس: ${genderLabel}\n`;
    text += `الموبايل: ${formData.phone || ''}\n`;
    if (formData.notes) text += `ملاحظات: ${formData.notes}\n`;

    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getSummaryText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="step-done-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1rem',
        maxWidth: '600px',
        margin: '0 auto',
        gap: '2rem'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="step-done-icon"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 212, 255, 0.1)',
            marginBottom: '1rem'
          }}
        >
          <CheckCircle2 size={64} style={{ color: 'var(--accent, #00d4ff)' }} />
        </motion.div>
        
        <h2 className="step-done-title" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main, #ffffff)', marginBottom: '0.5rem' }}>
          تم الإرسال بنجاح! 🎉
        </h2>
        
        <p className="step-done-subtitle" style={{ fontSize: '1.1rem', color: 'var(--text-muted, #8899aa)', lineHeight: 1.6 }}>
          تم إرسال بيانات حجزك. سيتم التواصل معك قريباً عبر واتساب لتأكيد الموعد.
        </p>
      </div>

      <div
        className="booking-summary-card"
        style={{
          width: '100%',
          backgroundColor: 'var(--bg-card, #0e0e1a)',
          borderRadius: '16px',
          border: '1px solid var(--border-color, rgba(0, 212, 255, 0.15))',
          padding: '1.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}
      >
        <div
          className="booking-summary-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid var(--border-color, rgba(0, 212, 255, 0.15))',
            paddingBottom: '1rem'
          }}
        >
          <ClipboardList size={24} style={{ color: 'var(--accent, #00d4ff)' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main, #ffffff)', margin: 0 }}>
            ملخص تفاصيل الحجز
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="booking-summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="booking-summary-label" style={{ color: 'var(--text-muted, #8899aa)' }}>القسم</span>
            <span className="booking-summary-value" style={{ color: 'var(--text-main, #ffffff)', fontWeight: 500 }}>{categoryName}</span>
          </div>
          <div className="booking-summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="booking-summary-label" style={{ color: 'var(--text-muted, #8899aa)' }}>الخدمة</span>
            <span className="booking-summary-value" style={{ color: 'var(--text-main, #ffffff)', fontWeight: 500 }}>{serviceName}</span>
          </div>

          {formData.categoryId === 'therapy' && (
            <>
              <div className="booking-summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="booking-summary-label" style={{ color: 'var(--text-muted, #8899aa)' }}>النوع</span>
                <span className="booking-summary-value" style={{ color: 'var(--text-main, #ffffff)', fontWeight: 500 }}>{formData.type === 'package' ? 'باقة' : 'جلسة مفردة'}</span>
              </div>
              {formData.duration && (
                <div className="booking-summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="booking-summary-label" style={{ color: 'var(--text-muted, #8899aa)' }}>المدة</span>
                  <span className="booking-summary-value" style={{ color: 'var(--text-main, #ffffff)', fontWeight: 500 }}>{formData.duration}</span>
                </div>
              )}
              {formData.date && (
                <div className="booking-summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="booking-summary-label" style={{ color: 'var(--text-muted, #8899aa)' }}>التاريخ</span>
                  <span className="booking-summary-value" style={{ color: 'var(--text-main, #ffffff)', fontWeight: 500 }}>{formData.date}</span>
                </div>
              )}
              {formData.time && (
                <div className="booking-summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="booking-summary-label" style={{ color: 'var(--text-muted, #8899aa)' }}>الوقت</span>
                  <span className="booking-summary-value" style={{ color: 'var(--text-main, #ffffff)', fontWeight: 500 }}>{formData.time}</span>
                </div>
              )}
            </>
          )}

          {(formData.categoryId === 'nutrition' || formData.categoryId === 'training') && (
            <>
              {formData.weight && (
                <div className="booking-summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="booking-summary-label" style={{ color: 'var(--text-muted, #8899aa)' }}>الوزن</span>
                  <span className="booking-summary-value" style={{ color: 'var(--text-main, #ffffff)', fontWeight: 500 }}>{formData.weight} كغ</span>
                </div>
              )}
              {formData.height && (
                <div className="booking-summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="booking-summary-label" style={{ color: 'var(--text-muted, #8899aa)' }}>الطول</span>
                  <span className="booking-summary-value" style={{ color: 'var(--text-main, #ffffff)', fontWeight: 500 }}>{formData.height} سم</span>
                </div>
              )}
              {formData.goal && (
                <div className="booking-summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="booking-summary-label" style={{ color: 'var(--text-muted, #8899aa)' }}>الهدف</span>
                  <span className="booking-summary-value" style={{ color: 'var(--text-main, #ffffff)', fontWeight: 500 }}>{formData.goal}</span>
                </div>
              )}
              {formData.experience && (
                <div className="booking-summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="booking-summary-label" style={{ color: 'var(--text-muted, #8899aa)' }}>الخبرة السابقة</span>
                  <span className="booking-summary-value" style={{ color: 'var(--text-main, #ffffff)', fontWeight: 500 }}>{formData.experience === 'yes' ? 'نعم' : 'لا'}</span>
                </div>
              )}
              {formData.injuries && (
                <div className="booking-summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="booking-summary-label" style={{ color: 'var(--text-muted, #8899aa)' }}>الإصابات</span>
                  <span className="booking-summary-value" style={{ color: 'var(--text-main, #ffffff)', fontWeight: 500 }}>{formData.injuries === 'yes' ? 'نعم' : 'لا'}</span>
                </div>
              )}
            </>
          )}

          <div style={{ height: '1px', backgroundColor: 'var(--border-color, rgba(0, 212, 255, 0.15))', margin: '0.5rem 0' }}></div>

          <div className="booking-summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="booking-summary-label" style={{ color: 'var(--text-muted, #8899aa)' }}>الاسم</span>
            <span className="booking-summary-value" style={{ color: 'var(--text-main, #ffffff)', fontWeight: 500 }}>{formData.name}</span>
          </div>
          <div className="booking-summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="booking-summary-label" style={{ color: 'var(--text-muted, #8899aa)' }}>الجنس</span>
            <span className="booking-summary-value" style={{ color: 'var(--text-main, #ffffff)', fontWeight: 500 }}>{genderLabel}</span>
          </div>
          <div className="booking-summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="booking-summary-label" style={{ color: 'var(--text-muted, #8899aa)' }}>رقم الموبايل</span>
            <span className="booking-summary-value" style={{ color: 'var(--text-main, #ffffff)', fontWeight: 500 }}>{formData.phone}</span>
          </div>
          {formData.notes && (
            <div className="booking-summary-row" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span className="booking-summary-label" style={{ color: 'var(--text-muted, #8899aa)' }}>ملاحظات</span>
              <span className="booking-summary-value" style={{ color: 'var(--text-main, #ffffff)', fontWeight: 500, backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px' }}>{formData.notes}</span>
            </div>
          )}
        </div>
        
        <button
          onClick={handleCopy}
          style={{
            marginTop: '1.5rem',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--text-main, #ffffff)',
            border: '1px solid var(--border-color, rgba(0, 212, 255, 0.15))',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            minHeight: '44px'
          }}
        >
          {copied ? <Check size={18} style={{ color: '#25D366' }} /> : <Copy size={18} />}
          {copied ? 'تم النسخ بنجاح' : 'نسخ تفاصيل الحجز'}
        </button>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="booking-whatsapp-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '1rem',
              backgroundColor: '#25D366',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '1.1rem',
              transition: 'all 0.2s ease',
              minHeight: '54px'
            }}
          >
            <MessageCircle size={24} />
            متابعة الحجز عبر واتساب
          </a>
        )}

        <div
          className="booking-actions-row"
          style={{
            display: 'flex',
            gap: '1rem',
            width: '100%'
          }}
        >
          <button
            onClick={onReset}
            className="booking-reset-btn"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.875rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-main, #ffffff)',
              border: '1px solid var(--border-color, rgba(0, 212, 255, 0.15))',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              minHeight: '48px'
            }}
          >
            <RefreshCw size={20} />
            حجز موعد جديد
          </button>
          
          <button
            onClick={onGoHome}
            className="booking-home-btn"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.875rem',
              backgroundColor: 'transparent',
              color: 'var(--text-main, #ffffff)',
              border: '1px solid transparent',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              minHeight: '48px'
            }}
          >
            <Home size={20} />
            العودة للرئيسية
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default StepDone;
