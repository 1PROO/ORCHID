import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { categories } from '../servicesData';
import { 
  ArrowRight, Activity, Apple, Dumbbell, Send, Loader2, 
  ChevronRight, Sparkles, CheckCircle2, MessageCircle 
} from 'lucide-react';

/* ─── category meta ─── */
const categoryMeta = {
  therapy:   { icon: Activity,  label: 'الجلسات العلاجية', desc: 'مساج، حجامة، إبر صينية، فوطة نارية', gradient: 'linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)' },
  nutrition: { icon: Apple,     label: 'برامج التغذية',    desc: 'تغذية رياضية، علاج نحافة، علاج سمنة',  gradient: 'linear-gradient(135deg, #0a1a28 0%, #0d2a3c 100%)' },
  training:  { icon: Dumbbell,  label: 'التدريب',          desc: 'تدريب شخصي، لياقة عامة',               gradient: 'linear-gradient(135deg, #1a0a28 0%, #2a0d3c 100%)' },
};

const STEPS = { CATEGORY: 0, SERVICE: 1, DETAILS: 2, PERSONAL: 3, DONE: 4 };
const stepLabels = ['القسم', 'الخدمة', 'التفاصيل', 'بياناتك'];

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
  const [formData, setFormData] = useState({
    categoryId: '', serviceId: '', subType: '', duration: '',
    date: '', time: '', name: '', phone: '', gender: '', notes: '',
    weight: '', height: '', goal: '', injuries: '', experience: ''
  });
  const [loading, setLoading] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');

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
  const selectedService  = selectedCategory?.services.find(s => s.id === formData.serviceId);

  const selectCategory = (catId) => {
    setFormData({ ...formData, categoryId: catId, serviceId: '', subType: '', duration: '' });
    setStep(STEPS.SERVICE);
  };

  const selectService = (svcId) => {
    const cat = categories.find(c => c.id === formData.categoryId);
    const svc = cat?.services.find(s => s.id === svcId);
    const autoSubType = (svc && !svc.types) ? svc.name : '';
    setFormData({ ...formData, serviceId: svcId, subType: autoSubType, duration: '' });
    setStep(STEPS.DETAILS);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    const ts = new Date().toLocaleString('ar-EG', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit', hour12:true });
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
    await sendToTelegram(text);
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)', direction: 'ltr' }}>
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
                flex: 1, height: '2px', minWidth: '20px', maxWidth: '60px',
                background: step > idx ? 'var(--gradient-accent)' : 'var(--border-color)',
                margin: '0 0.25rem', marginBottom: '1.5rem', transition: 'background 0.3s'
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const pageVariants = {
    enter: { opacity: 0, x: -30 },
    center: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 30, transition: { duration: 0.2 } }
  };

  return (
    <section style={{ minHeight: 'calc(100vh - 80px)', padding: 'clamp(1rem, 3vw, 2rem) 0', background: 'var(--bg-main)' }}>
      <div className="container" style={{ maxWidth: '750px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Sparkles size={18} color="var(--accent)" />
            <span style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>ORCHID BOOKING</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            احجز <span style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>موعدك</span> الآن
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>اختر القسم والخدمة لبدء الحجز</p>
        </motion.div>

        {step < STEPS.DONE && <ProgressBar />}

        <motion.div className="glass-card" style={{ padding: 'clamp(1.25rem, 3vw, 2.5rem)', overflow: 'hidden' }}
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
                        <img src={svc.image} alt={svc.name} style={{
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
                    <img src={selectedService.image} alt={selectedService.name} style={{
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
                      {selectedService.types ? (
                        <div>
                          <label style={labelStyle}>نوع الجلسة</label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 140px), 1fr))', gap: '0.5rem' }}>
                            {selectedService.types.map(t => (
                              <motion.div key={t} whileTap={{ scale: 0.95 }}
                                onClick={() => setFormData({ ...formData, subType: t })}
                                style={{
                                  padding: '0.6rem 0.5rem', textAlign: 'center', borderRadius: '0.6rem', cursor: 'pointer',
                                  fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)',
                                  background: formData.subType === t ? 'rgba(0, 212, 255, 0.12)' : 'transparent',
                                  border: formData.subType === t ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                                  color: formData.subType === t ? 'var(--accent)' : 'var(--text-main)',
                                  fontWeight: formData.subType === t ? 700 : 400, transition: 'all 0.2s'
                                }}>
                                {t}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {selectedService.durations && (
                        <div>
                          <label style={labelStyle}>المدة</label>
                          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${selectedService.durations.length}, 1fr)`, gap: '0.5rem' }}>
                            {selectedService.durations.map(d => (
                              <motion.div key={d} whileTap={{ scale: 0.95 }}
                                onClick={() => setFormData({ ...formData, duration: String(d) })}
                                style={{
                                  textAlign: 'center', padding: '0.65rem', borderRadius: '0.6rem', cursor: 'pointer',
                                  background: formData.duration == d ? 'rgba(0, 212, 255, 0.12)' : 'transparent',
                                  border: formData.duration == d ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                                  color: formData.duration == d ? 'var(--accent)' : 'var(--text-main)',
                                  fontWeight: formData.duration == d ? 700 : 400, transition: 'all 0.2s', fontSize: '0.95rem'
                                }}>
                                {d} دقيقة
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '0.75rem' }}>
                        <div>
                          <label style={labelStyle}>التاريخ المفضل</label>
                          <input type="date" name="date" required value={formData.date} onChange={handleInputChange} onInvalid={handleInvalid} onInput={setArabicValidation} style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>الساعة المفضلة</label>
                          <input type="time" name="time" required value={formData.time} onChange={handleInputChange} onInvalid={handleInvalid} onInput={setArabicValidation} style={inputStyle} />
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
                            <motion.div key={lvl} whileTap={{ scale: 0.95 }}
                              onClick={() => setFormData({ ...formData, experience: lvl })}
                              style={{
                                textAlign: 'center', padding: '0.6rem', borderRadius: '0.6rem', cursor: 'pointer',
                                background: formData.experience === lvl ? 'rgba(0, 212, 255, 0.12)' : 'transparent',
                                border: formData.experience === lvl ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                                color: formData.experience === lvl ? 'var(--accent)' : 'var(--text-main)',
                                fontWeight: formData.experience === lvl ? 700 : 400, transition: 'all 0.2s', fontSize: '0.9rem'
                              }}>
                              {lvl}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <motion.button type="button" onClick={goToPersonal}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  disabled={!canProceedToPersonal()}
                  style={{
                    width: '100%', marginTop: '1.5rem', padding: '0.9rem',
                    borderRadius: '0.75rem', fontWeight: 700, fontSize: '1rem',
                    background: canProceedToPersonal() ? 'var(--gradient-accent)' : 'var(--bg-card)',
                    color: canProceedToPersonal() ? '#fff' : 'var(--text-muted)',
                    cursor: canProceedToPersonal() ? 'pointer' : 'not-allowed',
                    border: canProceedToPersonal() ? 'none' : '1px solid var(--border-color)',
                    transition: 'all 0.3s'
                  }}>
                  التالي — بياناتك الشخصية
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
                        <motion.div key={g.label} whileTap={{ scale: 0.95 }}
                          onClick={() => setFormData({ ...formData, gender: g.label })}
                          style={{
                            textAlign: 'center', padding: '0.75rem', borderRadius: '0.6rem', cursor: 'pointer',
                            background: formData.gender === g.label ? g.bg : 'transparent',
                            border: formData.gender === g.label ? `2px solid ${g.color}` : '1px solid var(--border-color)',
                            color: formData.gender === g.label ? g.color : 'var(--text-main)',
                            fontWeight: formData.gender === g.label ? 700 : 400, transition: 'all 0.2s', fontSize: '1rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                          }}>
                          <span style={{ fontSize: '1.2rem' }}>{g.icon}</span> {g.label}
                        </motion.div>
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
                    onClick={() => { setStep(STEPS.CATEGORY); setWhatsappUrl(''); setFormData({ categoryId:'',serviceId:'',subType:'',duration:'',date:'',time:'',name:'',phone:'',gender:'',notes:'',weight:'',height:'',goal:'',injuries:'',experience:'' }); }}
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
      `}</style>
    </section>
  );
};

export default BookingPage;
