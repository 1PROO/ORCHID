import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Phone, Download, RefreshCw, CheckCircle2,
  Clock, XCircle, LayoutDashboard, MessageCircle
} from 'lucide-react';

// API BASE URL - قم بتغيير هذا الرابط إلى رابط Cloudflare Worker الفعلي بعد النشر
const API_URL = 'https://orchid-api.ahmedakram19.workers.dev';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('الكل');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const token = sessionStorage.getItem('orchid_admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/orchid-admin');
      return;
    }
    fetchBookings();
  }, [token, navigate]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        sessionStorage.removeItem('orchid_admin_token');
        navigate('/orchid-admin');
        return;
      }
      const data = await res.json();
      if (data.bookings) {
        setBookings(data.bookings);
      } else {
        showToast('فشل جلب البيانات', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('تعذر الاتصال بالخادم (تأكد من تشغيل Cloudflare Worker)', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus, updated_at: new Date().toISOString() } : b));
        showToast(`تم تغيير الحالة إلى "${newStatus}"`);
      } else {
        showToast('حدث خطأ في تحديث الحالة', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('orchid_admin_token');
    navigate('/orchid-admin');
  };

  const exportToCSV = () => {
    if (bookings.length === 0) return;

    // Create CSV headers
    const headers = ['ID', 'الاسم', 'الموبايل', 'القسم', 'الخدمة', 'النوع', 'المدة', 'الموعد', 'الحالة', 'تاريخ الإنشاء', 'تاريخ التحديث'];
    const rows = bookings.map(b => [
      b.id,
      `"${b.name || ''}"`,
      b.phone,
      `"${b.category || ''}"`,
      `"${b.service || ''}"`,
      `"${b.sub_type || ''}"`,
      `"${b.duration || ''}"`,
      `"${b.date ? b.date + ' ' + b.time : ''}"`,
      `"${b.status || ''}"`,
      `"${new Date(b.created_at).toLocaleString('ar-EG')}"`,
      `"${new Date(b.updated_at).toLocaleString('ar-EG')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orchid_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم تصدير البيانات بنجاح في ملف إكسيل');
  };

  // WhatsApp Quick Reply
  const getWhatsAppLink = (b) => {
    const phone = b.phone.startsWith('0') ? '2' + b.phone : b.phone;
    const serviceName = b.sub_type ? b.sub_type : (b.service || "الخدمة");
    const categoryName = b.category === 'therapy' ? 'الجلسات العلاجية' : 'برامج التغذية والتدريب';
    const msg = `أهلاً ${b.name} 👋🏼،\nبخصوص حجزك لخدمة [${serviceName}] في قسم ${categoryName} بمركز ORCHID...\nنحن نتواصل معك لتأكيد الموعد ✨`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const statuses = ['جديد', 'تم التواصل', 'مؤكد', 'مكتمل', 'ملغي'];
  const filteredBookings = filter === 'الكل' ? bookings : bookings.filter(b => b.status === filter);

  const stats = {
    total: bookings.length,
    newP: bookings.filter(b => b.status === 'جديد').length,
    contacted: bookings.filter(b => b.status === 'تم التواصل').length,
    confirmed: bookings.filter(b => b.status === 'مؤكد').length,
  };

  // Status Badge Colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'جديد': return { bg: 'rgba(0, 212, 255, 0.15)', color: 'var(--accent)', border: 'var(--accent)' };
      case 'تم التواصل': return { bg: 'rgba(255, 193, 7, 0.15)', color: '#ffc107', border: '#ffc107' };
      case 'مؤكد': return { bg: 'rgba(37, 211, 102, 0.15)', color: '#25D366', border: '#25D366' };
      case 'مكتمل': return { bg: 'rgba(224, 64, 251, 0.15)', color: 'var(--accent-secondary)', border: 'var(--accent-secondary)' };
      case 'ملغي': return { bg: 'rgba(255, 68, 68, 0.15)', color: '#ff4444', border: '#ff4444' };
      default: return { bg: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '#666' };
    }
  };

  return (
    <section style={{ minHeight: 'calc(100vh - 80px)', padding: 'clamp(1rem, 2vw, 2rem)' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <LayoutDashboard size={28} color="var(--accent)" />
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', margin: 0 }}>لوحة المتابعة - ORCHID</h2>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={fetchBookings} style={{ padding: '0.6rem', borderRadius: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <RefreshCw size={18} className={loading ? "spin-icon" : ""} />
            </button>
            <button onClick={exportToCSV} style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', background: 'rgba(0, 212, 255, 0.1)', border: '1px solid var(--accent)', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <Download size={18} /> Export Data
            </button>
            <button onClick={handleLogout} style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444', color: '#ff4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <LogOut size={18} /> خروج
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'إجمالي الحجوزات', count: stats.total, icon: LayoutDashboard, color: '#fff' },
            { label: 'طلبات جديدة', count: stats.newP, icon: Clock, color: 'var(--accent)' },
            { label: 'تم التواصل', count: stats.contacted, icon: Phone, color: '#ffc107' },
            { label: 'مؤكدة', count: stats.confirmed, icon: CheckCircle2, color: '#25D366' },
          ].map((stat, i) => (
            <motion.div key={i} className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `3px solid ${stat.color}` }}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{stat.label}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: stat.color }}>{stat.count}</div>
              </div>
              <div style={{ opacity: 0.2 }}><stat.icon size={40} color={stat.color} /></div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem', scrollbarWidth: 'none' }}>
          {['الكل', ...statuses].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '0.5rem 1.25rem', borderRadius: '2rem', whiteSpace: 'nowrap', fontWeight: 600, fontSize: '0.9rem',
                background: filter === f ? 'var(--accent)' : 'var(--bg-card)',
                color: filter === f ? '#000' : 'var(--text-muted)',
                border: filter === f ? 'none' : '1px solid var(--border-color)',
                transition: 'all 0.2s', cursor: 'pointer'
              }}>
              {f}
            </button>
          ))}
        </div>

        {/* Table / List */}
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--accent)' }}>
              <RefreshCw size={32} className="spin-icon" style={{ margin: '0 auto' }} />
              <p style={{ marginTop: '1rem' }}>جاري التحميل...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <XCircle size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
              <p>لا يوجد حجوزات مطابقة.</p>
            </div>
          ) : (
            <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>العميل</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>الخدمة</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>البيانات والموعد</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center' }}>الحالة</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center' }}>متابعة سريعة</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => {
                  const sColor = getStatusColor(b.status);
                  const isNew = b.status === 'جديد';

                  return (
                    <motion.tr key={b.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        background: isNew ? 'rgba(0, 212, 255, 0.03)' : 'transparent'
                      }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>{b.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', direction: 'ltr', textAlign: 'right' }}>
                          <a href={`tel:${b.phone}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{b.phone}</a>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{b.gender}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600 }}>
                          {b.category === 'therapy' ? 'الجلسات العلاجية' : (b.category === 'nutrition' ? 'برامج التغذية' : 'التدريب')}
                        </div>
                        <div style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{b.service}</div>
                        {b.sub_type && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.sub_type}</div>}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {b.date ? (
                          <>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>📅 {b.date}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>⏰ {b.time} {b.duration ? `(${b.duration} دقيقة)` : ''}</div>
                          </>
                        ) : (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {b.weight && <span>وزن: {b.weight} كجم | </span>}
                            {b.height && <span>طول: {b.height} سم</span>}
                            {b.goal && <div>الهدف: {b.goal.substring(0, 25)}</div>}
                            {b.experience && <div>الخبرة: {b.experience}</div>}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block', padding: '0.35rem 0.75rem', borderRadius: '1rem',
                          background: sColor.bg, color: sColor.color, border: `1px solid ${sColor.border}`,
                          fontSize: '0.8rem', fontWeight: 700,
                          boxShadow: isNew ? 'var(--neon-glow-cyan)' : 'none',
                          animation: isNew ? 'neonPulse 2s infinite' : 'none'
                        }}>
                          {b.status}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                          آخر تحديث:<br />
                          <span style={{ direction: 'ltr', display: 'inline-block' }}>{new Date(b.updated_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                          <a href={getWhatsAppLink(b)} target="_blank" rel="noreferrer"
                            style={{
                              width: '36px', height: '36px', borderRadius: '50%', background: '#25D366', color: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                              boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)', transition: 'transform 0.2s',
                              textDecoration: 'none'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            title="رسالة سريعة عبر واتساب"
                          >
                            <MessageCircle size={18} />
                          </a>

                          <select
                            value={b.status}
                            onChange={(e) => updateStatus(b.id, e.target.value)}
                            style={{
                              padding: '0.4rem 0.5rem', paddingLeft: '1.5rem', borderRadius: '0.5rem', fontSize: '0.8rem',
                              background: 'var(--bg-card)', border: `1px solid ${sColor.border}`, color: sColor.color,
                              cursor: 'pointer', outline: 'none', fontWeight: 600
                            }}
                          >
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            style={{
              position: 'fixed', bottom: '2rem', left: '50%', zIndex: 1000,
              background: toast.type === 'error' ? 'rgba(255, 68, 68, 0.95)' : 'rgba(0, 212, 255, 0.95)',
              backdropFilter: 'blur(8px)', padding: '0.85rem 1.5rem', borderRadius: '2rem',
              color: toast.type === 'error' ? '#fff' : '#000', fontWeight: 700, fontSize: '0.95rem',
              boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: '0.75rem'
            }}
          >
            {toast.type === 'error' ? <XCircle size={22} /> : <CheckCircle2 size={22} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .spin-icon { animation: spin 1s linear infinite; }
      `}</style>
    </section>
  );
};

export default AdminDashboard;
