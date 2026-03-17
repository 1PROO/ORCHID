import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, LogIn } from 'lucide-react';

const AdminLoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Auto-login via URL: /orchid-admin?token=orchid-admin-secret-2026
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken === 'orchid-admin-secret-2026') {
      sessionStorage.setItem('orchid_admin_token', urlToken);
      navigate('/orchid-admin/dashboard', { replace: true });
    }
    // Also redirect if already logged in
    const existing = sessionStorage.getItem('orchid_admin_token');
    if (existing === 'orchid-admin-secret-2026') {
      navigate('/orchid-admin/dashboard', { replace: true });
    }
  }, [searchParams, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!password) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }
    
    if (password !== 'orchid-admin-secret-2026') {
      setError('كلمة المرور غير صحيحة');
      return;
    }

    sessionStorage.setItem('orchid_admin_token', password);
    navigate('/orchid-admin/dashboard');
  };

  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--bg-main)' }}>
      <motion.div className="glass-card" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        
        <Lock size={48} color="var(--accent)" style={{ marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>دخول الإدارة</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>أدخل كلمة المرور للوصول للوحة التحكم</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="كلمة المرور"
              style={{
                width: '100%', padding: '0.85rem 1rem', borderRadius: '0.75rem',
                border: error ? '1px solid #ff4444' : '1px solid var(--border-color)', 
                background: 'var(--bg-main)', color: 'var(--text-main)', 
                fontSize: '1rem', outline: 'none', textAlign: 'center', letterSpacing: '3px'
              }}
            />
            {error && <div style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</div>}
          </div>

          <motion.button type="submit"
            whileHover={{ scale: 1.02, boxShadow: 'var(--neon-glow-cyan)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%', padding: '0.9rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '1rem',
              background: 'var(--gradient-accent)', color: '#fff', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer'
            }}>
            <LogIn size={18} /> دخول
          </motion.button>
        </form>
      </motion.div>
    </section>
  );
};

export default AdminLoginPage;
