import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match!');
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await authAPI.register({ name: form.name, email: form.email, password: form.password, phone: form.phone, address: form.address });
      setSuccess(true);
      toast.success('Registration successful! Check your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.successBox}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📧</div>
          <h2 style={styles.title}>Check Your Email!</h2>
          <p style={styles.text}>We've sent a verification link to <strong>{form.email}</strong>. Please verify your email to log in.</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ marginTop: 24 }}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.formBox}>
        <div style={styles.header}>
          <span style={{ fontSize: 40 }}>🍕</span>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join Pizza Palace today</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.grid2}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" type="text" placeholder="John Doe" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" type="tel" placeholder="+91 98765 43210" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Address</label>
            <textarea className="form-input" placeholder="Your default delivery address" rows={2} value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })} style={{ resize: 'none' }} />
          </div>

          <div style={styles.grid2}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input className="form-input" type="password" placeholder="Repeat password" value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
            </div>
          </div>

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating Account...' : 'Create Account 🍕'}
          </button>
        </form>

        <p style={styles.loginPrompt}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#0d0d0d' },
  formBox: { width: '100%', maxWidth: 560, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 20, padding: 40 },
  header: { textAlign: 'center', marginBottom: 32 },
  title: { fontSize: 30, fontFamily: "'Playfair Display', serif", fontWeight: 700, marginTop: 12 },
  subtitle: { color: '#aaa', marginTop: 6 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  loginPrompt: { textAlign: 'center', color: '#666', fontSize: 14, marginTop: 24 },
  link: { color: '#e63946', textDecoration: 'none', fontWeight: 600 },
  successBox: { textAlign: 'center', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 20, padding: 60, maxWidth: 480 },
  text: { color: '#aaa', lineHeight: 1.6 }
};

export default RegisterPage;
