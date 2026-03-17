import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Phone, Download, RefreshCw, CheckCircle2,
  Clock, XCircle, LayoutDashboard, MessageCircle, Trash2
} from 'lucide-react';
import Pusher from 'pusher-js';

// API BASE URL
const API_URL = 'https://orchid-api.ahmedakram19.workers.dev/api/bookings';

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

    // Real-time updates with Pusher
    const pusher = new Pusher('c5a1bdf3dd3a80627a6b', {
      cluster: 'us3'
    });

    const channel = pusher.subscribe('bookings-channel');
    channel.bind('new-booking', (data) => {
      console.log('Real-time update received:', data);
      fetchBookings(true);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [token, navigate]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBookings = async (silent = false) => {
    if (!silent) setLoading(true);
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
        setBookings(prev => {
          // Check for new bookings to notify the admin
          if (silent && prev.length > 0) {
            const currentIds = new Set(prev.map(b => b.id));
            const newBookings = data.bookings.filter(b => !currentIds.has(b.id));

            if (newBookings.length > 0) {
              showToast(`🚨 تم استلام ${newBookings.length === 1 ? 'حجز جديد!' : newBookings.length + ' حجوزات جديدة!'}`, 'success');
              try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.volume = 0.5;
                audio.play().catch(() => {});
              } catch (e) {}
            }
          }
          return data.bookings;
        });
      } else if (!silent) {
        showToast('فشل جلب البيانات', 'error');
      }
    } catch (err) {
      console.error(err);
      if (!silent) showToast('تعذر الاتصال بالخادم', 'error');
    } finally {
      if (!silent) setLoading(false);
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

  const deleteBooking = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل نهائياً؟')) return;
    
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setBookings(bookings.filter(b => b.id !== id));
        showToast('تم حذف العميل بنجاح');
      } else {
        showToast('حدث خطأ أثناء الحذف', 'error');
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
    showToast('تم تصدير البيانات بنجاح');
  };

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'الكل': return { bg: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '#8899aa' };
      case 'جديد': return { bg: 'rgba(0, 212, 255, 0.15)', color: 'var(--accent)', border: 'var(--accent)' };
      case 'تم التواصل': return { bg: 'rgba(255, 193, 7, 0.15)', color: '#ffc107', border: '#ffc107' };
      case 'مؤكد': return { bg: 'rgba(37, 211, 102, 0.15)', color: '#25D366', border: '#25D366' };
      case 'مكتمل': return { bg: 'rgba(224, 64, 251, 0.15)', color: 'var(--accent-secondary)', border: 'var(--accent-secondary)' };
      case 'ملغي': return { bg: 'rgba(255, 68, 68, 0.15)', color: '#ff4444', border: '#ff4444' };
      default: return { bg: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '#666' };
    }
  };

  const getCategoryLabel = (cat) => {
    if (cat === 'therapy') return 'الجلسات العلاجية';
    if (cat === 'nutrition') return 'برامج التغذية';
    return 'التدريب';
  };

  /* ─── Mobile Card View for each booking ─── */
  const BookingCard = ({ b }) => {
    const sColor = getStatusColor(b.status);
    const isNew = b.status === 'جديد';

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{
          padding: '1rem', marginBottom: '0.75rem',
          borderRight: `3px solid ${sColor.border}`,
          background: isNew ? 'rgba(0, 212, 255, 0.03)' : undefined
        }}
      >
        {/* Row 1: Name + Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem', marginBottom: '0.15rem' }}>{b.name}</div>
            <a href={`tel:${b.phone}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.85rem', direction: 'ltr', display: 'inline-block' }}>{b.phone}</a>
            {b.gender && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}> · {b.gender}</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <span style={{
              padding: '0.3rem 0.65rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700,
              background: sColor.bg, color: sColor.color, border: `1px solid ${sColor.border}`,
              whiteSpace: 'nowrap',
              boxShadow: isNew ? 'var(--neon-glow-cyan)' : 'none',
              animation: isNew ? 'neonPulse 2s infinite' : 'none'
            }}>
              {b.status}
            </span>
            <button onClick={() => deleteBooking(b.id)} style={{ background: 'none', border: 'none', color: '#ff4444', padding: '4px', cursor: 'pointer', opacity: 0.7 }}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Row 2: Service info */}
        <div style={{ marginBottom: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem' }}>
          <div style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.15rem' }}>{getCategoryLabel(b.category)}</div>
          <div style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{b.service}</div>
          {b.sub_type && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.sub_type}</div>}
        </div>

        {/* Row 3: Date/Details */}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          {b.date ? (
            <span>📅 {b.date} · ⏰ {b.time} {b.duration ? `(${b.duration} دقيقة)` : ''}</span>
          ) : (
            <>
              {b.weight && <span>وزن: {b.weight} كجم · </span>}
              {b.height && <span>طول: {b.height} سم</span>}
              {b.goal && <div>🎯 {b.goal.substring(0, 40)}</div>}
              {b.experience && <div>💪 {b.experience}</div>}
            </>
          )}
        </div>

        {/* Row 4: Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href={getWhatsAppLink(b)} target="_blank" rel="noreferrer"
            style={{
              width: '36px', height: '36px', borderRadius: '50%', background: '#25D366', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)', textDecoration: 'none', flexShrink: 0
            }}
            title="واتساب"
          >
            <MessageCircle size={18} />
          </a>

          <select
            value={b.status}
            onChange={(e) => updateStatus(b.id, e.target.value)}
            style={{
              flex: 1, padding: '0.45rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.8rem',
              background: 'var(--bg-card)', border: `1px solid ${sColor.border}`, color: sColor.color,
              cursor: 'pointer', outline: 'none', fontWeight: 600, minWidth: '100px'
            }}
          >
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {new Date(b.updated_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <section style={{ minHeight: '100vh', padding: 'clamp(0.75rem, 2vw, 2rem)', background: 'var(--bg-main)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <LayoutDashboard size={24} color="var(--accent)" />
              <h2 className="admin-title" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', color: 'var(--text-main)', margin: 0, whiteSpace: 'nowrap' }}>لوحة المتابعة</h2>
              <div className="live-indicator" style={{ 
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'rgba(37, 211, 102, 0.1)', padding: '2px 8px', borderRadius: '10px',
                fontSize: '0.7rem', color: '#25D366', fontWeight: 700,
                border: '1px solid rgba(37, 211, 102, 0.2)'
              }}>
                <span className="pulse-dot"></span>
                LIVE
              </div>
            </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={fetchBookings} className="admin-btn" style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <RefreshCw size={16} className={loading ? "spin-icon" : ""} />
            </button>
            <button onClick={exportToCSV} className="admin-btn" style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(0, 212, 255, 0.1)', border: '1px solid var(--accent)', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.8rem' }}>
              <Download size={14} /> <span className="hide-on-small">Export</span>
            </button>
            <button onClick={handleLogout} className="admin-btn" style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444', color: '#ff4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.8rem' }}>
              <LogOut size={14} /> <span className="hide-on-small">خروج</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="admin-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'إجمالي', count: stats.total, icon: LayoutDashboard, color: '#fff' },
            { label: 'جديدة', count: stats.newP, icon: Clock, color: 'var(--accent)' },
            { label: 'تم التواصل', count: stats.contacted, icon: Phone, color: '#ffc107' },
            { label: 'مؤكدة', count: stats.confirmed, icon: CheckCircle2, color: '#25D366' },
          ].map((stat, i) => (
            <motion.div key={i} className="glass-card" style={{ padding: 'clamp(0.65rem, 1.5vw, 1.25rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `3px solid ${stat.color}` }}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.65rem, 1.2vw, 0.85rem)', marginBottom: '0.25rem' }}>{stat.label}</div>
                <div style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: 800, color: stat.color }}>{stat.count}</div>
              </div>
              <div className="hide-on-small" style={{ opacity: 0.15 }}><stat.icon size={32} color={stat.color} /></div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="filter-scroll-container" style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem', scrollbarWidth: 'none' }}>
          {['الكل', ...statuses].map(f => {
            const sColor = getStatusColor(f);
            const active = filter === f;
            return (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`filter-badge ${active ? 'active' : ''}`}
                style={{
                  '--badge-color': sColor.color,
                  '--badge-bg': sColor.bg,
                  '--badge-border': sColor.border,
                }}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--accent)' }}>
            <RefreshCw size={32} className="spin-icon" style={{ margin: '0 auto' }} />
            <p style={{ marginTop: '1rem' }}>جاري التحميل...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <XCircle size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <p>لا يوجد حجوزات مطابقة.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="admin-desktop-table glass-card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '750px', borderCollapse: 'collapse', textAlign: 'right' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>العميل</th>
                    <th style={{ padding: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>الخدمة</th>
                    <th style={{ padding: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>البيانات والموعد</th>
                    <th style={{ padding: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>الحالة</th>
                    <th style={{ padding: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>إجراءات</th>
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
                        <td style={{ padding: '0.85rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.15rem' }}>{b.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', direction: 'ltr', textAlign: 'right' }}>
                            <a href={`tel:${b.phone}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{b.phone}</a>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{b.gender}</div>
                        </td>
                        <td style={{ padding: '0.85rem' }}>
                          <div style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600 }}>{getCategoryLabel(b.category)}</div>
                          <div style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{b.service}</div>
                          {b.sub_type && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.sub_type}</div>}
                        </td>
                        <td style={{ padding: '0.85rem' }}>
                          {b.date ? (
                            <>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>📅 {b.date}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>⏰ {b.time} {b.duration ? `(${b.duration} دقيقة)` : ''}</div>
                            </>
                          ) : (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {b.weight && <span>وزن: {b.weight} كجم | </span>}
                              {b.height && <span>طول: {b.height} سم</span>}
                              {b.goal && <div>🎯 {b.goal.substring(0, 30)}</div>}
                              {b.experience && <div>💪 {b.experience}</div>}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block', padding: '0.3rem 0.65rem', borderRadius: '1rem',
                            background: sColor.bg, color: sColor.color, border: `1px solid ${sColor.border}`,
                            fontSize: '0.75rem', fontWeight: 700,
                            boxShadow: isNew ? 'var(--neon-glow-cyan)' : 'none',
                            animation: isNew ? 'neonPulse 2s infinite' : 'none'
                          }}>
                            {b.status}
                          </span>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                            {new Date(b.updated_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', alignItems: 'center' }}>
                            <a href={getWhatsAppLink(b)} target="_blank" rel="noreferrer"
                              style={{
                                width: '34px', height: '34px', borderRadius: '50%', background: '#25D366', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)', textDecoration: 'none'
                              }}
                              title="واتساب"
                            >
                              <MessageCircle size={16} />
                            </a>
                            <select
                              value={b.status}
                              onChange={(e) => updateStatus(b.id, e.target.value)}
                              style={{
                                padding: '0.35rem 0.4rem', borderRadius: '0.5rem', fontSize: '0.75rem',
                                background: 'var(--bg-card)', border: `1px solid ${sColor.border}`, color: sColor.color,
                                cursor: 'pointer', outline: 'none', fontWeight: 600
                              }}
                            >
                              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <button onClick={() => deleteBooking(b.id)} style={{ background: 'none', border: 'none', color: '#ff4444', padding: '4px', cursor: 'pointer', opacity: 0.7 }} title="حذف">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="admin-mobile-cards">
              {filteredBookings.map((b) => (
                <BookingCard key={b.id} b={b} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            style={{
              position: 'fixed', bottom: '1.5rem', left: '50%', zIndex: 1000,
              background: toast.type === 'error' ? 'rgba(255, 68, 68, 0.95)' : 'rgba(0, 212, 255, 0.95)',
              backdropFilter: 'blur(8px)', padding: '0.75rem 1.25rem', borderRadius: '2rem',
              color: toast.type === 'error' ? '#fff' : '#000', fontWeight: 700, fontSize: '0.85rem',
              boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: '0.5rem',
              maxWidth: '90vw'
            }}
          >
            {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .spin-icon { animation: spin 1s linear infinite; }

        .filter-scroll-container::-webkit-scrollbar { display: none; }

        .filter-badge {
          padding: 0.5rem 1.1rem;
          border-radius: 2rem;
          white-space: nowrap;
          font-weight: 600;
          font-size: clamp(0.75rem, 1.5vw, 0.9rem);
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-muted);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .filter-badge:hover {
          border-color: var(--badge-border);
          background: var(--badge-bg);
          color: var(--badge-color);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .filter-badge.active {
          background: var(--badge-color) !important;
          color: #000 !important;
          border-color: transparent !important;
          box-shadow: 0 0 15px var(--badge-color);
          transform: translateY(-2px);
        }

        .filter-badge:hover:not(.active) {
          border-color: var(--badge-color);
          box-shadow: 0 0 10px var(--badge-bg);
        }

        /* Desktop: show table, hide cards */
        .admin-desktop-table { display: block; }
        .admin-mobile-cards { display: none; }

        /* Mobile: hide table, show cards */
        @media (max-width: 768px) {
          .admin-desktop-table { display: none !important; }
          .admin-mobile-cards { display: block !important; }
          .admin-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .hide-on-small { display: none !important; }
        }

        @media (max-width: 400px) {
          .admin-stats { grid-template-columns: repeat(2, 1fr) !important; gap: 0.5rem !important; }
        }

        .live-indicator {
          animation: fadeIn 1s ease-in;
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          background-color: #25D366;
          border-radius: 50%;
          display: inline-block;
          animation: pulse-animation 2s infinite;
        }

        @keyframes pulse-animation {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(37, 211, 102, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </section>
  );
};

export default AdminDashboard;
