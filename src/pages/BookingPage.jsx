import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { categories } from '../servicesData';
import { massageCategories } from '../data/massageData';
import {
  ArrowRight, Activity, Apple, Dumbbell, Send, Loader2,
  ChevronRight, Sparkles, CheckCircle2, MessageCircle,
  Calendar, Clock, Sun, Moon
} from 'lucide-react';

/* ─── Arabic calendar & time slots helpers ─── */
const arabicWeekdays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const arabicMonths = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const getUpcomingDays = (count = 14) => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;
    const weekday = arabicWeekdays[d.getDay()];

    let displayDayName = weekday;
    if (i === 0) displayDayName = 'اليوم';
    else if (i === 1) displayDayName = 'غداً';

    days.push({
      isoDate,
      fullFormatted: `${isoDate} (${weekday})`,
      dayNumber: d.getDate(),
      monthName: arabicMonths[d.getMonth()],
      displayDayName,
      weekday,
      isToday: i === 0,
      isTomorrow: i === 1,
    });
  }
  return days;
};

const DAY_TIME_SLOTS = [
  '11:00 ص',
  '12:00 م',
  '01:00 م',
  '02:00 م',
  '03:00 م',
  '04:00 م',
];

const NIGHT_TIME_SLOTS = [
  '05:00 م',
  '06:00 م',
  '07:00 م',
  '08:00 م',
  '09:00 م',
  '10:00 م',
];

const getTodayISO = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/* ─── category meta ─── */
const categoryMeta = {
  therapy: { icon: Activity, label: 'الجلسات العلاجية', desc: 'مساج، حجامة، إبر صينية، فوطة نارية', gradient: 'linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)' },
  nutrition: { icon: Apple, label: 'برامج التغذية', desc: 'تغذية رياضية، علاج نحافة، علاج سمنة', gradient: 'linear-gradient(135deg, #0a1a28 0%, #0d2a3c 100%)' },
  training: { icon: Dumbbell, label: 'التدريب', desc: 'تدريب شخصي، لياقة عامة', gradient: 'linear-gradient(135deg, #1a0a28 0%, #2a0d3c 100%)' },
};

const STEPS = { CATEGORY: 0, SERVICE: 1, DETAILS: 2, PERSONAL: 3, DONE: 4 };
const stepLabels = ['القسم', 'الخدمة', 'التفاصيل', 'بياناتك'];

const MASSAGE_CATEGORY_SHORT_LABELS = {
  relaxation: 'استرخاء',
  therapeutic: 'علاجي',
  head_face: 'الرأس والوجه',
  extremities: 'القدمين والأطراف',
  sports_recovery: 'رياضي واستشفاء',
  full_body: 'الجسم بالكامل',
  body_shaping: 'تنسيق القوام',
  cellulite_skincare: 'السيلوليت',
  full_body_care: 'عناية وتقشير',
  vip_experiences: 'تجارب VIP'
};

/* ─── Arabic validation helper ─── */
const setArabicValidation = (e) => {
  e.target.setCustomValidity('');
};
const handleInvalid = (e) => {
  e.target.setCustomValidity('يرجى ملء هذا الحقل');
};

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [step, setStep] = useState(STEPS.CATEGORY);
  const [activeMassageCatId, setActiveMassageCatId] = useState(massageCategories[0].id);
  const [formData, setFormData] = useState({
    categoryId: '', serviceId: '', subType: '', duration: '',
    date: '', time: '', name: '', phone: '', gender: '', notes: '',
    weight: '', height: '', goal: '', injuries: '', experience: ''
  });
  const [loading, setLoading] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const upcomingDays = React.useMemo(() => getUpcomingDays(6), []);
  const todayISO = React.useMemo(() => getTodayISO(), []);

  const handleCustomDateChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setFormData(prev => ({ ...prev, date: '' }));
      return;
    }
    const parts = val.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const weekday = arabicWeekdays[d.getDay()] || '';
    setFormData(prev => ({ ...prev, date: `${val} (${weekday})` }));
  };

  /* scroll to top on step change */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  useEffect(() => {
    const cat = searchParams.get('category');
    const svc = searchParams.get('service');
    if (cat && svc) {
      setFormData(prev => ({ ...prev, categoryId: cat, serviceId: svc }));
      setStep(STEPS.DETAILS);
    } else if (cat) {
      setFormData(prev => ({ ...prev, categoryId: cat }));
      setStep(STEPS.SERVICE);
    }
  }, [searchParams]);

  const selectedCategory = categories.find(c => c.id === formData.categoryId);
  const selectedService = selectedCategory?.services.find(s => s.id === formData.serviceId);

  const selectCategory = (catId) => {
    setFormData(prev => ({ ...prev, categoryId: catId, serviceId: '', subType: '', duration: '' }));
    setStep(STEPS.SERVICE);
  };

  const selectService = (svcId) => {
    const cat = categories.find(c => c.id === formData.categoryId);
    const svc = cat?.services.find(s => s.id === svcId);
    let autoSubType = (svc && !svc.types) ? svc.name : '';
    let autoDuration = '';

    if (svcId === 'massage') {
      autoSubType = `${massageCategories[0].title} - ${massageCategories[0].types[0].name}`;
      autoDuration = '60';
    } else if (svc?.types && svc.types.length > 0) {
      autoSubType = svc.types[0];
    }
    if (svc?.durations && svc.durations.length > 0 && !autoDuration) {
      autoDuration = String(svc.durations[0]);
    }

    const defaultDate = upcomingDays[0]?.fullFormatted || '';
    const defaultTime = '06:00 م';

    setFormData(prev => ({
      ...prev,
      serviceId: svcId,
      subType: autoSubType,
      duration: autoDuration,
      date: prev.date || defaultDate,
      time: prev.time || defaultTime
    }));
    setStep(STEPS.DETAILS);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const canProceedToPersonal = () => {
    if (formData.categoryId === 'therapy') {
      return formData.subType && formData.date && formData.time;
    }
    return formData.weight && formData.height && formData.goal && formData.experience;
  };

  const goToPersonal = () => {
    if (canProceedToPersonal()) setStep(STEPS.PERSONAL);
  };

  const generateMessageText = () => {
    const ts = new Date().toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    let t = `✨ *حجز جديد من الموقع* ✨\n⏰ *وقت الطلب:* ${ts}\n────────────────\n`;
    t += `📂 *القسم:* ${selectedCategory?.name || ''}\n🔧 *الخدمة:* ${selectedService?.name || ''}\n`;
    if (formData.categoryId === 'therapy') {
      t += `🎯 *النوع:* ${formData.subType}\n`;
      if (formData.duration) t += `⏳ *المدة:* ${formData.duration} دقيقة\n`;
      t += `📅 *التاريخ:* ${formData.date}\n🕒 *الوقت:* ${formData.time}\n`;
    } else {
      if (formData.weight) t += `⚖️ *الوزن:* ${formData.weight} كجم\n`;
      if (formData.height) t += `📏 *الطول:* ${formData.height} سم\n`;
      if (formData.goal) t += `🎯 *الهدف:* ${formData.goal}\n`;
      if (formData.injuries) t += `🤕 *الإصابات:* ${formData.injuries}\n`;
      if (formData.experience) t += `💪 *الخبرة:* ${formData.experience}\n`;
    }
    t += `────────────────\n`;
    t += `👤 *الاسم:* ${formData.name}\n`;
    t += `🚻 *الجنس:* ${formData.gender}\n`;
    t += `📞 *الموبايل:* ${formData.phone}\n`;
    if (formData.notes) t += `📝 *ملاحظات:* ${formData.notes}\n`;
    return t;
  };

  const sendToTelegram = async (text) => {
    try {
      await fetch(`https://api.telegram.org/bot8527231978:AAF9kejexwsPrJpjLfzs-aJQtEp6EtPG7MQ/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: '-1003743097936', text })
      });
    } catch (err) { console.error('Telegram error:', err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.gender) return;
    setLoading(true);

    const text = generateMessageText();

    // 1. إرسال إلى تليجرام
    await sendToTelegram(text);

    // 2. إرسال إلى قاعدة بيانات (Cloudflare Worker D1)
    try {
      // TODO: يجب تغيير هذا الرابط بعد نشر الـ Worker على Cloudflare
      const API_URL = 'https://orchid-api.ahmedakram19.workers.dev/api/bookings';
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } catch (err) {
      console.error('Database connection error:', err);
      // الخطأ هنا لن يوقف العملية، لضمان استمرار الحجز عن طريق تليجرام دائمًا
    }

    setLoading(false);
    const phone = "201030558700";
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    setWhatsappUrl(waUrl);
    setStep(STEPS.DONE);
  };

  /* ─── styles ─── */
  const inputStyle = {
    width: '100%', padding: '0.85rem 1rem', borderRadius: '0.75rem',
    border: '1px solid var(--border-color)', background: 'var(--bg-card)',
    color: 'var(--text-main)', fontSize: '1rem', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  };
  const labelStyle = { display: 'block', marginBottom: '0.4rem', color: 'var(--accent-light)', fontSize: '0.9rem', fontWeight: 600 };

  /* ─── progress bar ─── */
  const ProgressBar = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', width: '100%', maxWidth: '420px', margin: '0 auto clamp(1.2rem, 3vw, 2rem)', direction: 'ltr' }}>
      {stepLabels.map((label, idx) => {
        const isActive = step >= idx;
        const isCurrent = step === idx;
        return (
          <React.Fragment key={idx}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{
                width: 'clamp(28px, 5vw, 36px)', height: 'clamp(28px, 5vw, 36px)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? 'var(--gradient-accent)' : 'var(--bg-card)',
                color: isActive ? '#fff' : 'var(--text-muted)',
                border: isCurrent ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                fontWeight: 700, fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
                boxShadow: isCurrent ? '0 0 12px rgba(0, 212, 255, 0.4)' : 'none',
                transition: 'all 0.3s'
              }}>
                {isActive && step > idx ? <CheckCircle2 size={16} /> : idx + 1}
              </div>
              <span style={{
                fontSize: 'clamp(0.55rem, 1.3vw, 0.75rem)',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: isCurrent ? 700 : 400, whiteSpace: 'nowrap'
              }}>{label}</span>
            </div>
            {idx < stepLabels.length - 1 && (
              <div style={{
                flex: 1, height: '2px', minWidth: '15px', maxWidth: '50px',
                background: step > idx ? 'var(--gradient-accent)' : 'var(--border-color)',
                margin: '0 0.2rem', marginBottom: '1.25rem', transition: 'background 0.3s'
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const pageVariants = {
    enter: { opacity: 0, y: 15 },
    center: { opacity: 1, y: 0, transition: { duration: 0.25 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.15 } }
  };

  return (
    <section style={{ minHeight: 'calc(100vh - 80px)', padding: 'clamp(1rem, 3vw, 2rem) 0', background: 'var(--bg-main)' }}>
      <div className="container" style={{ maxWidth: '750px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 'clamp(1.2rem, 3vw, 2rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <Sparkles size={18} color="var(--accent)" />
            <span style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>ORCHID BOOKING</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            احجز <span style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>موعدك</span> الآن
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>اختر القسم والخدمة لبدء الحجز</p>
        </motion.div>

        {step < STEPS.DONE && <ProgressBar />}

        <motion.div className="glass-card booking-card"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          <AnimatePresence mode="wait">

            {/* ══════ STEP 0: CATEGORY ══════ */}
            {step === STEPS.CATEGORY && (
              <motion.div key="cat" variants={pageVariants} initial="enter" animate="center" exit="exit">
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1.25rem', textAlign: 'center' }}>اختر القسم المناسب لك</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {Object.entries(categoryMeta).map(([id, meta], idx) => {
                    const Icon = meta.icon;
                    return (
                      <motion.div key={id}
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                        whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(0, 212, 255, 0.15), 0 0 25px rgba(224, 64, 251, 0.1)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => selectCategory(id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 'clamp(0.75rem, 2vw, 1.25rem)',
                          padding: 'clamp(1rem, 2.5vw, 1.5rem)', background: meta.gradient,
                          borderRadius: '1rem', border: '1px solid var(--border-color)',
                          cursor: 'pointer', transition: 'all 0.3s'
                        }}>
                        <div style={{
                          width: 'clamp(48px, 8vw, 60px)', height: 'clamp(48px, 8vw, 60px)',
                          borderRadius: '1rem', background: 'rgba(0, 212, 255, 0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          <Icon size={26} color="var(--accent)" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'var(--text-main)', marginBottom: '0.2rem' }}>{meta.label}</h4>
                          <p style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)', color: 'var(--text-muted)', lineHeight: 1.4 }}>{meta.desc}</p>
                        </div>
                        <ChevronRight size={20} color="var(--text-muted)" />
                      </motion.div>
                    );
                  })}
                </div>
                <button onClick={() => navigate('/')} style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem', margin: '1.5rem auto 0',
                  color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', background: 'none', border: 'none'
                }}>
                  <ArrowRight size={14} /> العودة للرئيسية
                </button>
              </motion.div>
            )}

            {/* ══════ STEP 1: SERVICE ══════ */}
            {step === STEPS.SERVICE && selectedCategory && (
              <motion.div key="svc" variants={pageVariants} initial="enter" animate="center" exit="exit">
                <button onClick={() => { setStep(STEPS.CATEGORY); setFormData({ ...formData, categoryId: '', serviceId: '' }); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1rem', color: 'var(--accent)', fontSize: '0.9rem', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 600 }}>
                  <ArrowRight size={16} /> تغيير القسم
                </button>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>
                  اختر الخدمة من <span style={{ color: 'var(--accent)' }}>{selectedCategory.name}</span>
                </h3>
                <div style={{ display: 'grid', gap: '0.85rem' }}>
                  {selectedCategory.services.map((svc, idx) => (
                    <motion.div key={svc.id}
                      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
                      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0, 212, 255, 0.15)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => selectService(svc.id)}
                      style={{
                        position: 'relative', borderRadius: '1rem', overflow: 'hidden',
                        cursor: 'pointer', transition: 'all 0.3s',
                        border: '1px solid var(--border-color)',
                        height: 'clamp(130px, 20vw, 160px)'
                      }}>
                      {/* Background Image */}
                      {svc.image && (
                        <img src={svc.image} alt={svc.name} loading="lazy" width={600} height={160} style={{
                          position: 'absolute', inset: 0, width: '100%', height: '100%',
                          objectFit: 'cover', transition: 'transform 0.5s ease'
                        }} />
                      )}
                      {/* Gradient Overlay */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: svc.image
                          ? 'linear-gradient(135deg, rgba(5,10,20,0.85) 0%, rgba(5,10,20,0.55) 50%, rgba(5,10,20,0.75) 100%)'
                          : 'linear-gradient(135deg, #0a1628, #0d1f3c)',
                      }} />
                      {/* Content */}
                      <div style={{
                        position: 'relative', zIndex: 1, height: '100%',
                        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                        padding: 'clamp(1rem, 2.5vw, 1.5rem)'
                      }}>
                        <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: '#fff', fontWeight: 700, marginBottom: '0.3rem', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{svc.name}</div>
                        <div style={{ fontSize: 'clamp(0.72rem, 1.3vw, 0.82rem)', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{svc.description.substring(0, 90)}...</div>
                      </div>
                      {/* Arrow */}
                      <div style={{
                        position: 'absolute', top: '50%', left: 'clamp(0.75rem, 2vw, 1.25rem)',
                        transform: 'translateY(-50%)',
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'rgba(0, 212, 255, 0.15)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(0, 212, 255, 0.3)'
                      }}>
                        <ChevronRight size={16} color="var(--accent)" style={{ transform: 'scaleX(-1)' }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ══════ STEP 2: DETAILS ══════ */}
            {step === STEPS.DETAILS && selectedService && (
              <motion.div key="details" variants={pageVariants} initial="enter" animate="center" exit="exit">
                <button onClick={() => { setStep(STEPS.SERVICE); setFormData({ ...formData, serviceId: '' }); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1rem', color: 'var(--accent)', fontSize: '0.9rem', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 600 }}>
                  <ArrowRight size={16} /> تغيير الخدمة
                </button>

                {/* Service Hero Banner */}
                <div style={{
                  position: 'relative', borderRadius: '0.85rem', overflow: 'hidden',
                  marginBottom: '1.25rem', height: 'clamp(80px, 14vw, 100px)'
                }}>
                  {selectedService.image && (
                    <img src={selectedService.image} alt={selectedService.name} loading="lazy" width={750} height={100} style={{
                      position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'
                    }} />
                  )}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: selectedService.image
                      ? 'linear-gradient(135deg, rgba(5,10,20,0.88) 0%, rgba(5,10,20,0.5) 100%)'
                      : 'linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(224, 64, 251, 0.05))'
                  }} />
                  <div style={{
                    position: 'relative', zIndex: 1, height: '100%',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0 clamp(0.75rem, 2vw, 1.25rem)'
                  }}>
                    {(() => { const I = categoryMeta[formData.categoryId]?.icon || Activity; return <I size={20} color="var(--accent)" />; })()}
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 500 }}>{selectedCategory?.name}</div>
                      <div style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: '#fff', fontWeight: 700 }}>{selectedService?.name}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '1.25rem' }}>
                  {formData.categoryId === 'therapy' && (
                    <>
                      {selectedService.id === 'massage' ? (
                        <div style={{ marginBottom: '1.25rem' }}>
                          <label style={{ ...labelStyle, fontSize: '1rem', marginBottom: '0.75rem' }}>اختر قسم ونوع المساج المطلوب:</label>
                          
                          {/* Symmetrical 3-Column Tabs for Massage Categories */}
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '0.4rem', 
                            marginBottom: '1.25rem',
                            width: '100%'
                          }}>
                            {massageCategories.map(cat => {
                              const isActive = activeMassageCatId === cat.id;
                              const shortLabel = MASSAGE_CATEGORY_SHORT_LABELS[cat.id] || cat.badge || cat.title.replace(/^قسم (مساج )?/, '');
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  className="touch-chip"
                                  onClick={() => {
                                    setActiveMassageCatId(cat.id);
                                    const firstType = cat.types[0];
                                    if (firstType) {
                                      setFormData(prev => ({ ...prev, subType: `${cat.title} - ${firstType.name}` }));
                                    }
                                  }}
                                  style={{
                                    padding: '0.65rem 0.25rem',
                                    borderRadius: '0.75rem',
                                    border: isActive ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                                    background: isActive ? 'var(--gradient-accent)' : 'var(--bg-card)',
                                    color: isActive ? '#fff' : 'var(--text-main)',
                                    fontSize: 'clamp(0.74rem, 2vw, 0.85rem)',
                                    fontWeight: isActive ? 700 : 500,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.25rem',
                                    minHeight: '68px',
                                    boxShadow: isActive ? '0 0 12px rgba(0, 212, 255, 0.3)' : 'none',
                                    width: '100%'
                                  }}
                                >
                                  <span style={{ fontSize: '1.15rem' }}>{cat.icon}</span>
                                  <span style={{ 
                                    lineHeight: 1.25, 
                                    textAlign: 'center',
                                    whiteSpace: 'normal',
                                    wordBreak: 'break-word',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                  }}>
                                    {shortLabel}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Selected Category Types Grid */}
                          {(() => {
                            const activeCat = massageCategories.find(c => c.id === activeMassageCatId) || massageCategories[0];
                            return (
                              <div>
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between',
                                  marginBottom: '1rem',
                                  paddingBottom: '0.5rem',
                                  borderBottom: '1px solid var(--border-color)'
                                }}>
                                  <h4 style={{ color: 'var(--accent)', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span>{activeCat.icon}</span> {activeCat.title}
                                  </h4>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(0, 212, 255, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
                                    {activeCat.types.length} أنواع متاحة
                                  </span>
                                </div>

                                <div style={{ display: 'grid', gap: '0.85rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', width: '100%' }}>
                                  {activeCat.types.map(t => {
                                    const fullTypeName = `${activeCat.title} - ${t.name}`;
                                    const isSelected = formData.subType === fullTypeName || formData.subType === t.name;
                                    return (
                                      <div
                                        key={t.id}
                                        onClick={() => setFormData(prev => ({ ...prev, subType: fullTypeName }))}
                                        style={{
                                          borderRadius: '0.85rem',
                                          overflow: 'hidden',
                                          border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                                          background: isSelected ? 'rgba(0, 212, 255, 0.08)' : 'var(--bg-card)',
                                          boxShadow: isSelected ? '0 0 20px rgba(0, 212, 255, 0.2)' : 'none',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          transition: 'all 0.3s ease'
                                        }}
                                      >
                                        {t.image && (
                                          <div style={{ width: '100%', height: '140px', overflow: 'hidden', position: 'relative' }}>
                                            <img src={t.image} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{
                                              position: 'absolute', inset: 0,
                                              background: 'linear-gradient(to top, rgba(10,22,40,0.9) 0%, transparent 60%)'
                                            }} />
                                            {isSelected && (
                                              <div style={{
                                                position: 'absolute', top: '8px', left: '8px',
                                                background: 'var(--accent)', color: '#fff',
                                                padding: '0.25rem 0.75rem', borderRadius: '1rem',
                                                fontSize: '0.75rem', fontWeight: 700,
                                                display: 'flex', alignItems: 'center', gap: '0.3rem'
                                              }}>
                                                <CheckCircle2 size={14} /> تم الاختيار
                                              </div>
                                            )}
                                          </div>
                                        )}
                                        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                          <h5 style={{ color: isSelected ? 'var(--accent)' : 'var(--text-main)', fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                            {t.name}
                                          </h5>
                                          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '0.75rem', flex: 1 }}>
                                            {t.description}
                                          </p>
                                          {t.suitability && (
                                            <p style={{ color: 'var(--accent-light)', fontSize: '0.78rem', lineHeight: 1.5, marginBottom: '0.75rem', background: 'rgba(0,212,255,0.05)', padding: '0.4rem 0.6rem', borderRadius: '0.5rem' }}>
                                              💡 {t.suitability}
                                            </p>
                                          )}
                                          {t.note && (
                                            <p style={{ color: '#ffb74d', fontSize: '0.78rem', lineHeight: 1.5, marginBottom: '0.75rem', background: 'rgba(255,183,77,0.1)', borderRight: '3px solid #ffb74d', padding: '0.4rem 0.6rem', borderRadius: '0.3rem' }}>
                                              ⚠️ {t.note}
                                            </p>
                                          )}
                                          <button
                                            type="button"
                                            style={{
                                              marginTop: 'auto',
                                              width: '100%',
                                              padding: '0.55rem',
                                              borderRadius: '0.5rem',
                                              border: isSelected ? 'none' : '1px solid var(--border-color)',
                                              background: isSelected ? 'var(--gradient-accent)' : 'transparent',
                                              color: isSelected ? '#fff' : 'var(--accent)',
                                              fontWeight: 700,
                                              fontSize: '0.85rem',
                                              cursor: 'pointer',
                                              transition: 'all 0.2s'
                                            }}
                                          >
                                            {isSelected ? '✓ تم تحديد هذا النوع' : 'اختر هذا النوع'}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ) : selectedService.types ? (
                        <div>
                          <label style={labelStyle}>نوع الجلسة</label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                            {selectedService.types.map(t => (
                              <button key={t} type="button" className="touch-chip"
                                onClick={() => setFormData(prev => ({ ...prev, subType: t }))}
                                style={{
                                  padding: '0.7rem 0.5rem', textAlign: 'center', borderRadius: '0.6rem', cursor: 'pointer',
                                  fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)',
                                  background: formData.subType === t ? 'rgba(0, 212, 255, 0.14)' : 'var(--bg-card)',
                                  border: formData.subType === t ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                                  color: formData.subType === t ? 'var(--accent)' : 'var(--text-main)',
                                  fontWeight: formData.subType === t ? 700 : 400
                                }}>
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {selectedService.durations && (
                        <div>
                          <label style={labelStyle}>المدة</label>
                          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${selectedService.durations.length}, 1fr)`, gap: '0.5rem' }}>
                            {selectedService.durations.map(d => (
                              <button key={d} type="button" className="touch-chip"
                                onClick={() => setFormData(prev => ({ ...prev, duration: String(d) }))}
                                style={{
                                  textAlign: 'center', padding: '0.7rem 0.5rem', borderRadius: '0.6rem', cursor: 'pointer',
                                  background: formData.duration == d ? 'rgba(0, 212, 255, 0.14)' : 'var(--bg-card)',
                                  border: formData.duration == d ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                                  color: formData.duration == d ? 'var(--accent)' : 'var(--text-main)',
                                  fontWeight: formData.duration == d ? 700 : 400, fontSize: '0.95rem'
                                }}>
                                {d} دقيقة
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ─── Smart Date & Time Selection ─── */}
                      <div className="smart-selection-box" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem',
                        padding: '1.1rem',
                        borderRadius: '1rem',
                        border: '1px solid var(--border-color)',
                        background: 'rgba(255, 255, 255, 0.02)'
                      }}>

                        {/* 1. Date Picker */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.7rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                            <label style={{ ...labelStyle, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
                              <Calendar size={16} color="var(--accent)" /> اختر اليوم المناسب:
                            </label>
                            {formData.date && (
                              <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700, background: 'rgba(0, 212, 255, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
                                ✓ {formData.date}
                              </span>
                            )}
                          </div>

                          {/* Days Grid - 3 columns, perfectly responsive */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '0.5rem',
                            width: '100%'
                          }}>
                            {upcomingDays.map((day) => {
                              const isSelected = formData.date === day.fullFormatted || formData.date === day.isoDate;
                              return (
                                <button
                                  key={day.isoDate}
                                  type="button"
                                  className="day-card-btn"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, date: day.fullFormatted }));
                                    setShowCustomDate(false);
                                  }}
                                  style={{
                                    padding: '0.75rem 0.35rem',
                                    borderRadius: '0.85rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                                    background: isSelected
                                      ? 'linear-gradient(135deg, rgba(0, 212, 255, 0.22) 0%, rgba(224, 64, 251, 0.18) 100%)'
                                      : 'var(--bg-card)',
                                    boxShadow: isSelected ? '0 0 16px rgba(0, 212, 255, 0.35)' : 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.2rem',
                                    width: '100%'
                                  }}
                                >
                                  <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: isSelected ? 700 : 600,
                                    color: isSelected ? 'var(--accent)' : (day.isToday || day.isTomorrow ? 'var(--accent-light)' : 'var(--text-muted)')
                                  }}>
                                    {day.displayDayName}
                                  </span>
                                  <span style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 800,
                                    color: isSelected ? '#fff' : 'var(--text-main)',
                                    lineHeight: 1.2
                                  }}>
                                    {day.dayNumber}
                                  </span>
                                  <span style={{
                                    fontSize: '0.7rem',
                                    color: isSelected ? '#fff' : 'var(--text-muted)'
                                  }}>
                                    {day.monthName}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Custom Date Option Toggle */}
                          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                            <button
                              type="button"
                              onClick={() => setShowCustomDate(!showCustomDate)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent)',
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.2rem 0',
                                textDecoration: 'underline'
                              }}
                            >
                              <Calendar size={13} />
                              {showCustomDate ? 'إخفاء التقويم المخصص' : 'هل تريد تاريخاً لاحقاً؟ اختر من التقويم...'}
                            </button>
                          </div>

                          {showCustomDate && (
                            <div style={{ marginTop: '0.6rem' }}>
                              <input
                                type="date"
                                min={todayISO}
                                onChange={handleCustomDateChange}
                                style={inputStyle}
                              />
                            </div>
                          )}
                        </div>

                        {/* Divider */}
                        <div style={{ height: '1px', background: 'var(--border-color)', opacity: 0.6 }} />

                        {/* 2. Time Slot Picker */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                            <label style={{ ...labelStyle, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
                              <Clock size={16} color="var(--accent)" /> اختر الساعة المفضلة:
                            </label>
                            {formData.time && (
                              <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700, background: 'rgba(0, 212, 255, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
                                ✓ {formData.time}
                              </span>
                            )}
                          </div>

                          {/* Daytime slots - 3 columns, perfectly fills 100% width */}
                          <div style={{ marginBottom: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
                              <Sun size={14} color="#f59e0b" />
                              <span>الفترة النهارية</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem', width: '100%' }}>
                              {DAY_TIME_SLOTS.map(slot => {
                                const isSelected = formData.time === slot;
                                return (
                                  <button
                                    key={slot}
                                    type="button"
                                    className="time-slot-btn"
                                    onClick={() => {
                                      setFormData(prev => ({ ...prev, time: slot }));
                                      setShowCustomTime(false);
                                    }}
                                    style={{
                                      padding: '0.65rem 0.3rem',
                                      borderRadius: '0.6rem',
                                      border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                                      background: isSelected ? 'var(--gradient-accent)' : 'var(--bg-card)',
                                      color: isSelected ? '#fff' : 'var(--text-main)',
                                      fontWeight: isSelected ? 700 : 500,
                                      fontSize: '0.88rem',
                                      cursor: 'pointer',
                                      boxShadow: isSelected ? '0 0 12px rgba(0, 212, 255, 0.3)' : 'none',
                                      textAlign: 'center',
                                      width: '100%'
                                    }}
                                  >
                                    {slot}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Evening slots - 3 columns, perfectly fills 100% width */}
                          <div style={{ marginBottom: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
                              <Moon size={14} color="#818cf8" />
                              <span>الفترة المسائية</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem', width: '100%' }}>
                              {NIGHT_TIME_SLOTS.map(slot => {
                                const isSelected = formData.time === slot;
                                return (
                                  <button
                                    key={slot}
                                    type="button"
                                    className="time-slot-btn"
                                    onClick={() => {
                                      setFormData(prev => ({ ...prev, time: slot }));
                                      setShowCustomTime(false);
                                    }}
                                    style={{
                                      padding: '0.65rem 0.3rem',
                                      borderRadius: '0.6rem',
                                      border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                                      background: isSelected ? 'var(--gradient-accent)' : 'var(--bg-card)',
                                      color: isSelected ? '#fff' : 'var(--text-main)',
                                      fontWeight: isSelected ? 700 : 500,
                                      fontSize: '0.88rem',
                                      cursor: 'pointer',
                                      boxShadow: isSelected ? '0 0 12px rgba(0, 212, 255, 0.3)' : 'none',
                                      textAlign: 'center',
                                      width: '100%'
                                    }}
                                  >
                                    {slot}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Custom Time Option Toggle */}
                          <div style={{ marginTop: '0.35rem' }}>
                            <button
                              type="button"
                              onClick={() => setShowCustomTime(!showCustomTime)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent)',
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.2rem 0',
                                textDecoration: 'underline'
                              }}
                            >
                              <Clock size={13} />
                              {showCustomTime ? 'إخفاء خيار الوقت المخصص' : 'هل تفضل ساعة محددة أخرى؟ اختر وقتاً مخصصاً...'}
                            </button>
                            {showCustomTime && (
                              <div style={{ marginTop: '0.6rem' }}>
                                <input
                                  type="time"
                                  name="time"
                                  value={formData.time.includes('ص') || formData.time.includes('م') ? '' : formData.time}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (!val) return;
                                    const [hStr, mStr] = val.split(':');
                                    let h = parseInt(hStr, 10);
                                    const period = h >= 12 ? 'م' : 'ص';
                                    if (h === 0) h = 12;
                                    else if (h > 12) h -= 12;
                                    const formatted = `${String(h).padStart(2, '0')}:${mStr} ${period}`;
                                    setFormData(prev => ({ ...prev, time: formatted }));
                                  }}
                                  style={inputStyle}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </>
                  )}

                  {(formData.categoryId === 'nutrition' || formData.categoryId === 'training') && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '0.75rem' }}>
                        <div>
                          <label style={labelStyle}>الوزن (كجم)</label>
                          <input type="number" name="weight" required value={formData.weight} onChange={handleInputChange} onInvalid={handleInvalid} onInput={setArabicValidation} placeholder="75" style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>الطول (سم)</label>
                          <input type="number" name="height" required value={formData.height} onChange={handleInputChange} onInvalid={handleInvalid} onInput={setArabicValidation} placeholder="175" style={inputStyle} />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>ما هو هدفك؟</label>
                        <input type="text" name="goal" required value={formData.goal} onChange={handleInputChange} onInvalid={handleInvalid} onInput={setArabicValidation} placeholder="تنشيف، تضخيم، إلخ" style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>إصابات أو أمراض سابقة</label>
                        <textarea name="injuries" value={formData.injuries} onChange={handleInputChange} placeholder="اكتب هنا إن وُجد..." style={{ ...inputStyle, minHeight: '65px', resize: 'vertical' }} />
                      </div>
                      <div>
                        <label style={labelStyle}>الخبرة الرياضية</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                          {['مبتدئ', 'متوسط', 'متقدم'].map(lvl => (
                            <button key={lvl} type="button" className="touch-chip"
                              onClick={() => setFormData(prev => ({ ...prev, experience: lvl }))}
                              style={{
                                textAlign: 'center', padding: '0.65rem 0.5rem', borderRadius: '0.6rem', cursor: 'pointer',
                                background: formData.experience === lvl ? 'rgba(0, 212, 255, 0.14)' : 'var(--bg-card)',
                                border: formData.experience === lvl ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                                color: formData.experience === lvl ? 'var(--accent)' : 'var(--text-main)',
                                fontWeight: formData.experience === lvl ? 700 : 400, fontSize: '0.9rem'
                              }}>
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Validation helper guide */}
                {!canProceedToPersonal() && formData.categoryId === 'therapy' && (
                  <div style={{
                    marginTop: '1.25rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.6rem',
                    background: 'rgba(255, 183, 77, 0.08)',
                    border: '1px solid rgba(255, 183, 77, 0.3)',
                    color: '#ffb74d',
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    <span>⚠️ لاستكمال الحجز:</span>
                    <span>
                      {!formData.subType ? 'يرجى اختيار نوع الجلسة' : !formData.date ? 'يرجى تحديد اليوم' : !formData.time ? 'يرجى اختيار الساعة' : ''}
                    </span>
                  </div>
                )}

                <motion.button type="button" onClick={goToPersonal}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  disabled={!canProceedToPersonal()}
                  style={{
                    width: '100%', marginTop: '1.25rem', padding: '0.9rem',
                    borderRadius: '0.75rem', fontWeight: 700, fontSize: '1rem',
                    background: canProceedToPersonal() ? 'var(--gradient-accent)' : 'var(--bg-card)',
                    color: canProceedToPersonal() ? '#fff' : 'var(--text-muted)',
                    cursor: canProceedToPersonal() ? 'pointer' : 'not-allowed',
                    border: canProceedToPersonal() ? 'none' : '1px solid var(--border-color)',
                    transition: 'all 0.3s'
                  }}>
                  {canProceedToPersonal() ? '✓ التالي — بياناتك الشخصية' : 'التالي — بياناتك الشخصية'}
                </motion.button>
              </motion.div>
            )}

            {/* ══════ STEP 3: PERSONAL ══════ */}
            {step === STEPS.PERSONAL && (
              <motion.div key="personal" variants={pageVariants} initial="enter" animate="center" exit="exit">
                <button onClick={() => setStep(STEPS.DETAILS)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1rem', color: 'var(--accent)', fontSize: '0.9rem', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 600 }}>
                  <ArrowRight size={16} /> رجوع للتفاصيل
                </button>

                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>البيانات الشخصية</h3>

                <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>الاسم بالكامل *</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} onInvalid={handleInvalid} onInput={setArabicValidation} placeholder="أدخل اسمك" style={inputStyle} />
                  </div>

                  {/* Gender */}
                  <div>
                    <label style={labelStyle}>الجنس *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                      {[{ label: 'ذكر', icon: '♂', color: '#00d4ff', bg: 'rgba(0, 212, 255, 0.12)' }, { label: 'أنثى', icon: '♀', color: '#e040fb', bg: 'rgba(224, 64, 251, 0.12)' }].map(g => (
                        <button key={g.label} type="button" className="touch-chip"
                          onClick={() => setFormData(prev => ({ ...prev, gender: g.label }))}
                          style={{
                            textAlign: 'center', padding: '0.75rem', borderRadius: '0.6rem', cursor: 'pointer',
                            background: formData.gender === g.label ? g.bg : 'var(--bg-card)',
                            border: formData.gender === g.label ? `2px solid ${g.color}` : '1px solid var(--border-color)',
                            color: formData.gender === g.label ? g.color : 'var(--text-main)',
                            fontWeight: formData.gender === g.label ? 700 : 400, fontSize: '1rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                          }}>
                          <span style={{ fontSize: '1.2rem' }}>{g.icon}</span> {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>رقم الموبايل (واتساب) *</label>
                    <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} onInvalid={handleInvalid} onInput={setArabicValidation} placeholder="01xxxxxxxxx" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>ملاحظات إضافية</label>
                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="أي تفاصيل إضافية..." style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} />
                  </div>

                  <motion.button type="submit" disabled={loading || !formData.gender}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(0, 212, 255, 0.3), 0 0 25px rgba(224, 64, 251, 0.2)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: '100%', padding: '1rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '1.05rem',
                      background: (loading || !formData.gender) ? 'var(--bg-card)' : 'var(--gradient-accent)',
                      backgroundSize: '200% 200%', animation: (!loading && formData.gender) ? 'gradientFlow 4s ease infinite' : 'none',
                      color: (loading || !formData.gender) ? 'var(--text-muted)' : '#fff',
                      cursor: (loading || !formData.gender) ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      opacity: loading ? 0.7 : 1, transition: 'all 0.3s', border: 'none',
                      boxShadow: (!loading && formData.gender) ? '0 4px 15px rgba(0, 212, 255, 0.2), 0 4px 15px rgba(224, 64, 251, 0.1)' : 'none'
                    }}>
                    {loading ? <><Loader2 size={18} className="spin-icon" /> جاري الإرسال...</> : <><Send size={18} /> إرسال الحجز عبر واتساب</>}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ══════ STEP 4: DONE ══════ */}
            {step === STEPS.DONE && (
              <motion.div key="done" variants={pageVariants} initial="enter" animate="center" exit="exit"
                style={{ textAlign: 'center', padding: '2rem 0' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                  <CheckCircle2 size={64} color="var(--accent)" style={{ marginBottom: '1rem' }} />
                </motion.div>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>تم الإرسال بنجاح! 🎉</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
                  تم إرسال بيانات حجزك. سيتم التواصل معك قريباً عبر واتساب لتأكيد الموعد.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {/* WhatsApp Button */}
                  <motion.a href={whatsappUrl} target="_blank" rel="noreferrer"
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600,
                      background: '#25D366', border: 'none', textDecoration: 'none',
                      color: '#fff', cursor: 'pointer', fontSize: '0.9rem',
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)'
                    }}>
                    <MessageCircle size={18} /> فتح واتساب
                  </motion.a>

                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setStep(STEPS.CATEGORY);
                      setWhatsappUrl('');
                      setShowCustomDate(false);
                      setShowCustomTime(false);
                      setFormData({ categoryId: '', serviceId: '', subType: '', duration: '', date: '', time: '', name: '', phone: '', gender: '', notes: '', weight: '', height: '', goal: '', injuries: '', experience: '' });
                    }}
                    style={{
                      padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600,
                      background: 'rgba(0, 212, 255, 0.1)', border: '1px solid var(--accent)',
                      color: 'var(--accent)', cursor: 'pointer', fontSize: '0.9rem'
                    }}>حجز جديد</motion.button>

                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/')}
                    style={{
                      padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600,
                      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                      color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.9rem'
                    }}>العودة للرئيسية</motion.button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .spin-icon { animation: spin 1s linear infinite; }
        input:focus, select:focus, textarea:focus {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.15), 0 0 0 3px rgba(224, 64, 251, 0.05) !important;
        }

        /* Touch & Mobile UX perfection */
        .touch-chip, .time-slot-btn, .day-card-btn {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
          -webkit-user-select: none;
          outline: none;
          transition: transform 0.1s ease, border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .touch-chip:active, .time-slot-btn:active, .day-card-btn:active {
          transform: scale(0.95);
        }
        @media (max-width: 600px) {
          .booking-card {
            padding: 1.1rem 0.75rem !important;
            border-radius: 1.15rem !important;
          }
          .smart-selection-box {
            padding: 0.85rem 0.6rem !important;
            gap: 1rem !important;
          }
          .day-card-btn {
            padding: 0.65rem 0.25rem !important;
          }
          .day-card-btn span:nth-child(2) {
            font-size: 1.15rem !important;
          }
          .time-slot-btn {
            padding: 0.6rem 0.2rem !important;
            font-size: 0.82rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default BookingPage;
