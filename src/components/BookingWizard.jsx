import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { categories } from '../servicesData';
import { Calendar, Clock, User, Phone, MessageSquare, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

const BookingWizard = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: null,
    service: null,
    subType: '',
    duration: '',
    date: '',
    time: '',
    name: '',
    phone: '',
    notes: '',
    // Form fields for programs
    weight: '',
    height: '',
    goal: '',
    injuries: '',
    experience: ''
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSelectCategory = (cat) => {
    setFormData({ ...formData, category: cat, service: null });
    nextStep();
  };

  const handleSelectService = (ser) => {
    setFormData({ ...formData, service: ser });
    nextStep();
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getWhatsAppURL = () => {
    const phone = "201018973646"; // Replace with actual number
    let text = `*حجز جديد من الموقع*\n\n`;
    text += `*القسم:* ${formData.category.name}\n`;
    text += `*الخدمة:* ${formData.service.name}\n`;
    
    if (formData.category.id === 'therapy') {
      text += `*النوع:* ${formData.subType}\n`;
      text += `*المدة:* ${formData.duration} دقيقة\n`;
      text += `*التاريخ:* ${formData.date}\n`;
      text += `*الوقت:* ${formData.time}\n`;
    } else {
      text += `*الوزن:* ${formData.weight}\n`;
      text += `*الطول:* ${formData.height}\n`;
      text += `*الهدف:* ${formData.goal}\n`;
      text += `*الإصابات:* ${formData.injuries}\n`;
      text += `*الخبرة:* ${formData.experience}\n`;
    }
    
    text += `*الاسم:* ${formData.name}\n`;
    text += `*الموبايل:* ${formData.phone}\n`;
    if (formData.notes) text += `*ملاحظات:* ${formData.notes}\n`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    window.open(getWhatsAppURL(), '_blank');
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem' }}>اختر القسم</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {categories.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => handleSelectCategory(cat)}
                  className="glass-card"
                  style={{ padding: '2rem', textAlign: 'center', transition: 'transform 0.2s' }}
                >
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>{cat.name}</div>
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem' }}>اختر الخدمة</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {formData.category.services.map(ser => (
                <button 
                  key={ser.id} 
                  onClick={() => handleSelectService(ser)}
                  className="glass-card"
                  style={{ padding: '1.5rem', textAlign: 'right', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontWeight: 600 }}>{ser.name}</span>
                  <ChevronLeft size={20} color="var(--accent)" />
                </button>
              ))}
              <button onClick={prevStep} style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>رجوع</button>
            </div>
          </motion.div>
        );
      case 3:
        if (formData.category.id === 'therapy') {
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 style={{ textAlign: 'center', marginBottom: '2rem' }}>تفاصيل الجلسة</h3>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>نوع الجلسة</label>
                  <select name="subType" required onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                    <option value="">اختر النوع...</option>
                    {formData.service.types?.map(t => <option key={t} value={t}>{t}</option>)}
                    {!formData.service.types && <option value={formData.service.name}>{formData.service.name}</option>}
                  </select>
                </div>
                {formData.service.durations && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>المدة</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {formData.service.durations.map(d => (
                        <label key={d} style={{ flex: 1, textAlign: 'center', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', cursor: 'pointer', background: formData.duration == d ? 'var(--accent)' : 'transparent', color: formData.duration == d ? 'var(--bg-main)' : 'inherit', fontWeight: formData.duration == d ? 'bold' : 'normal' }}>
                          <input type="radio" name="duration" value={d} onChange={handleInputChange} style={{ display: 'none' }} />
                          {d} دقيقة
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>التاريخ</label>
                    <input type="date" name="date" required onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>الساعة</label>
                    <input type="time" name="time" required onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>الاسم بالكامل</label>
                  <input type="text" name="name" required placeholder="أدخل اسمك" onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>رقم الموبايل</label>
                  <input type="tel" name="phone" required placeholder="01xxxxxxxxx" onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} />
                </div>
                <button type="submit" style={{ background: 'var(--accent)', color: 'var(--bg-main)', padding: '1rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>تأكيد الحجز عبر واتساب</button>
                <button type="button" onClick={prevStep} style={{ color: 'var(--text-muted)' }}>رجوع</button>
              </form>
            </motion.div>
          );
        } else {
          // Programs Form
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 style={{ textAlign: 'center', marginBottom: '2rem' }}>استمارة البيانات</h3>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input type="number" name="weight" placeholder="الوزن (كجم)" required onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} />
                  <input type="number" name="height" placeholder="الطول (سم)" required onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} />
                </div>
                <input type="text" name="goal" placeholder="الهدف (تنشيف، تضخيم، صحة عامة...)" required onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} />
                <textarea name="injuries" placeholder="هل توجد إصابات سابقة؟" onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', minHeight: '80px' }}></textarea>
                <select name="experience" required onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                  <option value="">المستوى الرياضي...</option>
                  <option value="مبتدئ">مبتدئ</option>
                  <option value="متوسط">متوسط</option>
                  <option value="متقدم">متقدم</option>
                </select>
                <input type="text" name="name" required placeholder="الاسم بالكامل" onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} />
                <input type="tel" name="phone" required placeholder="رقم الموبايل" onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} />
                <button type="submit" style={{ background: 'var(--accent)', color: 'var(--bg-main)', padding: '1rem', borderRadius: '0.5rem', fontWeight: 700 }}>إرسال البيانات عبر واتساب</button>
                <button type="button" onClick={prevStep} style={{ color: 'var(--text-muted)' }}>رجوع</button>
              </form>
            </motion.div>
          );
        }
      default:
        return null;
    }
  };

  return (
    <section id="booking" className="section-padding" style={{ backgroundColor: 'var(--bg-main)' }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="glass-card" style={{ padding: '3rem' }}>
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default BookingWizard;
