import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { categories } from '../servicesData';
import BookingProgressBar from '../components/booking/BookingProgressBar';
import StepCategory from '../components/booking/StepCategory';
import StepService from '../components/booking/StepService';
import StepDetails from '../components/booking/StepDetails';
import StepPersonal from '../components/booking/StepPersonal';
import StepDone from '../components/booking/StepDone';
import {
  STEPS,
  parseDeepLink,
  generateTelegramPayload,
  generateD1Payload,
  generateWhatsAppUrl,
  canSubmitPersonal,
  TELEGRAM_BOT_TOKEN,
  CLOUDFLARE_D1_URL
} from '../utils/bookingHelpers';
import '../styles/booking.css';

const pageVariants = {
  enter: { opacity: 0, x: -30 },
  center: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 30, transition: { duration: 0.2 } }
};

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(STEPS.CATEGORY);
  const [formData, setFormData] = useState({
    categoryId: '',
    serviceId: '',
    subType: '',
    duration: '',
    date: '',
    time: '',
    name: '',
    phone: '',
    gender: '',
    notes: '',
    weight: '',
    height: '',
    goal: '',
    injuries: '',
    experience: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  const [isKiosk, setIsKiosk] = useState(false);
  const [isIdle, setIsIdle] = useState(false);

  // Detect kiosk mode
  useEffect(() => {
    if (searchParams.get('kiosk') === 'true' || searchParams.get('mode') === 'kiosk') {
      setIsKiosk(true);
      setIsIdle(true);
    }
  }, [searchParams]);

  const handleReset = useCallback(() => {
    setFormData({
      categoryId: '', serviceId: '', subType: '', duration: '', date: '', time: '',
      name: '', phone: '', gender: '', notes: '', weight: '', height: '', goal: '', injuries: '', experience: ''
    });
    setBookingResult(null);
    setStep(STEPS.CATEGORY);
  }, []);

  // Idle and Auto-reset timer logic
  useEffect(() => {
    let timeoutId;
    const events = ['mousemove', 'touchstart', 'keydown', 'click'];
    
    const startTimer = () => {
      clearTimeout(timeoutId);
      
      if (isKiosk && step === STEPS.CATEGORY) {
        timeoutId = setTimeout(() => setIsIdle(true), 60000); // 60s
      } else if (step === STEPS.DONE) {
        timeoutId = setTimeout(() => {
          handleReset();
          if (isKiosk) setIsIdle(true);
        }, 45000); // 45s
      } else if (step > STEPS.CATEGORY && step < STEPS.DONE) {
        timeoutId = setTimeout(() => {
          handleReset();
          if (isKiosk) setIsIdle(true);
        }, 180000); // 3m
      }
    };

    const handleUserInteraction = () => {
      if (!isIdle) {
        startTimer();
      }
    };

    events.forEach(e => window.addEventListener(e, handleUserInteraction));
    startTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(e => window.removeEventListener(e, handleUserInteraction));
    };
  }, [step, isKiosk, isIdle, handleReset]);

  /* Scroll to top on step change */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  /* Parse URL Deep Links */
  useEffect(() => {
    const deepLinkState = parseDeepLink(searchParams, categories);
    if (deepLinkState && (deepLinkState.step !== STEPS.CATEGORY || deepLinkState.formData.categoryId)) {
      setStep(deepLinkState.step);
      setFormData(prev => ({
        ...prev,
        ...deepLinkState.formData
      }));
    }
  }, [searchParams]);

  const selectedCategory = categories.find(c => c.id === formData.categoryId);
  const selectedService = selectedCategory?.services?.find(s => s.id === formData.serviceId);

  const handleSelectCategory = (catId) => {
    setFormData(prev => ({
      ...prev,
      categoryId: catId,
      serviceId: '',
      subType: '',
      duration: '',
      date: '',
      time: ''
    }));
    setStep(STEPS.SERVICE);
  };

  const handleSelectService = (svcId) => {
    const cat = categories.find(c => c.id === formData.categoryId);
    const svc = cat?.services?.find(s => s.id === svcId);
    const autoSubType = (svc && !svc.types) ? svc.name : '';
    setFormData(prev => ({
      ...prev,
      serviceId: svcId,
      subType: autoSubType,
      duration: ''
    }));
    setStep(STEPS.DETAILS);
  };

  const updateFormData = (fields) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const handleStepClick = (stepIdx) => {
    if (stepIdx < step) {
      setStep(stepIdx);
    }
  };

  const handleSubmitPersonal = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!canSubmitPersonal(formData)) return;
    setIsSubmitting(true);

    const telegramPayload = generateTelegramPayload(formData, selectedCategory, selectedService);
    const d1Payload = generateD1Payload(formData, selectedCategory, selectedService);
    const whatsappUrl = generateWhatsAppUrl(formData, selectedCategory, selectedService);

    // 1. Dispatches Telegram POST request
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telegramPayload)
      });
    } catch (err) {
      console.error('Telegram submission error:', err);
    }

    // 2. Dispatches Cloudflare D1 POST request
    try {
      await fetch(CLOUDFLARE_D1_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d1Payload)
      });
    } catch (err) {
      console.error('D1 database submission error:', err);
    }

    setBookingResult({
      formData,
      whatsappUrl,
      selectedCategory,
      selectedService
    });

    setIsSubmitting(false);
    setStep(STEPS.DONE);
  };

  const dismissIdle = () => {
    setIsIdle(false);
    handleReset();
  };

  return (
    <>
      <AnimatePresence>
        {isKiosk && isIdle && (
          <motion.div
            className="kiosk-idle-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissIdle}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'var(--bg-main)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            <h1 
              className="kiosk-idle-logo" 
              style={{ 
                fontSize: '4rem', 
                marginBottom: '1rem', 
                background: 'var(--gradient-accent)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}
            >
              ORCHID
            </h1>
            <h2 
              className="kiosk-idle-title" 
              style={{ 
                fontSize: '3rem', 
                color: 'var(--text-main)', 
                marginBottom: '1rem' 
              }}
            >
              أهلاً بك في أوركيد
            </h2>
            <p 
              className="kiosk-idle-subtitle" 
              style={{ 
                fontSize: '1.5rem', 
                color: 'var(--text-muted)', 
                marginBottom: '4rem' 
              }}
            >
              المركز الأول للعلاج الطبيعي والتغذية
            </p>
            <motion.button 
              className="kiosk-idle-cta"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{
                padding: '1.5rem 3rem',
                fontSize: '2rem',
                borderRadius: '50px',
                background: 'var(--gradient-accent)',
                color: '#fff',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              اضغط لبدء الحجز
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <section className={`booking-section ${isKiosk ? 'kiosk-mode' : ''}`}>
        <div className="container booking-container">
          {/* Header */}
          <motion.div
            className="booking-header"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="booking-badge">
              <Sparkles size={18} color="var(--accent)" />
              <span>ORCHID BOOKING</span>
            </div>
            <h2 className="booking-title">
              احجز <span className="booking-title-gradient">موعدك</span> الآن
            </h2>
            <p className="booking-subtitle">اختر القسم والخدمة لبدء الحجز</p>
          </motion.div>

          {step < STEPS.DONE && (
            <BookingProgressBar
              currentStep={step}
              onStepClick={handleStepClick}
            />
          )}

          <motion.div
            className="glass-card"
            style={{ padding: 'clamp(1.25rem, 3vw, 2.5rem)', overflow: 'hidden' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AnimatePresence mode="wait">
              {step === STEPS.CATEGORY && (
                <motion.div key="step-category" variants={pageVariants} initial="enter" animate="center" exit="exit">
                  <StepCategory onSelectCategory={handleSelectCategory} />
                  {!isKiosk && (
                    <button
                      type="button"
                      onClick={() => navigate('/')}
                      className="booking-home-link-btn"
                    >
                      <ArrowRight size={14} /> العودة للرئيسية
                    </button>
                  )}
                </motion.div>
              )}

              {step === STEPS.SERVICE && (
                <motion.div key="step-service" variants={pageVariants} initial="enter" animate="center" exit="exit">
                  <StepService
                    categoryKey={formData.categoryId}
                    onSelectService={handleSelectService}
                    onBack={() => setStep(STEPS.CATEGORY)}
                  />
                </motion.div>
              )}

              {step === STEPS.DETAILS && (
                <StepDetails
                  key="step-details"
                  categoryKey={formData.categoryId}
                  serviceId={formData.serviceId}
                  formData={formData}
                  onUpdateFormData={updateFormData}
                  onNext={() => setStep(STEPS.PERSONAL)}
                  onBack={() => setStep(STEPS.SERVICE)}
                />
              )}

              {step === STEPS.PERSONAL && (
                <StepPersonal
                  key="step-personal"
                  formData={formData}
                  onUpdateFormData={updateFormData}
                  onSubmit={handleSubmitPersonal}
                  onBack={() => setStep(STEPS.DETAILS)}
                  isSubmitting={isSubmitting}
                />
              )}

              {step === STEPS.DONE && (
                <StepDone
                  key="step-done"
                  bookingResult={bookingResult}
                  onReset={handleReset}
                  onGoHome={() => navigate('/')}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default BookingPage;
