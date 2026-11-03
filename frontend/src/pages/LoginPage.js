import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}! 🍕`);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.heroContent}>
          <div style={styles.emoji}>🍕</div>
          <h1 style={styles.heroTitle}>Pizza Palace</h1>
          <p style={styles.heroSub}>Handcrafted with love, delivered to your door</p>
          <div style={styles.features}>
            {['✨ Build your perfect pizza', '🚀 Fast delivery', '📱 Real-time tracking', '🔒 Secure payments'].map(f => (
              <div key={f} style={styles.feature}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.formBox}>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to your account</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div style={styles.forgotRow}>
              <Link to="/forgot-password" style={styles.forgotLink}>Forgot Password?</Link>
            </div>

            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={styles.divider}><span>or</span></div>

          <div style={styles.demoBox}>
            <p style={styles.demoTitle}>🧪 Demo Accounts</p>
            <button style={styles.demoBtn} onClick={() => setForm({ email: 'user@test.com', password: 'User@123' })}>
              👤 User Login
            </button>
            <button style={styles.demoBtn} onClick={() => setForm({ email: 'admin@pizzapalace.com', password: 'Admin@123' })}>
              🔑 Admin Login
            </button>
          </div>

          <p style={styles.registerPrompt}>
            Don't have an account? <Link to="/register" style={styles.link}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    '@media (max-width: 768px)': { gridTemplateColumns: '1fr' }
  },
  left: {
    background: 'linear-gradient(135deg, #1a0a0a 0%, #2d0a0a 50%, #1a0a0a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    position: 'relative',
    overflow: 'hidden'
  },
  heroContent: { position: 'relative', zIndex: 1, maxWidth: 400 },
  emoji: { fontSize: 72, marginBottom: 16, display: 'block' },
  heroTitle: {
    fontSize: 52,
    fontFamily: "'Playfair Display', serif",
    fontWeight: 900,
    background: 'linear-gradient(135deg, #e63946, #ff6b35)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: 12
  },
  heroSub: { fontSize: 18, color: '#aaa', lineHeight: 1.6, marginBottom: 40 },
  features: { display: 'flex', flexDirection: 'column', gap: 12 },
  feature: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '12px 20px',
    borderRadius: 12,
    color: '#ddd',
    fontSize: 15
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    background: '#0d0d0d'
  },
  formBox: { width: '100%', maxWidth: 420 },
  title: {
    fontSize: 32,
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    marginBottom: 8
  },
  subtitle: { color: '#aaa', marginBottom: 32, fontSize: 15 },
  forgotRow: { textAlign: 'right', marginBottom: 8, marginTop: -8 },
  forgotLink: { color: '#e63946', fontSize: 13, textDecoration: 'none' },
  divider: {
    textAlign: 'center',
    margin: '24px 0',
    color: '#444',
    position: 'relative',
    fontSize: 13
  },
  demoBox: {
    background: '#1a1a1a',
    border: '1px dashed #333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24
  },
  demoTitle: { color: '#aaa', fontSize: 13, marginBottom: 10 },
  demoBtn: {
    display: 'block',
    width: '100%',
    background: '#222',
    border: '1px solid #333',
    color: '#ccc',
    padding: '10px 16px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: 8,
    textAlign: 'left',
    transition: 'all 0.2s'
  },
  registerPrompt: { textAlign: 'center', color: '#666', fontSize: 14 },
  link: { color: '#e63946', textDecoration: 'none', fontWeight: 600 }
};

export default LoginPage;
