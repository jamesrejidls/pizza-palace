import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 0', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container" style={{ maxWidth: 600 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, marginTop: 16 }}>{user?.name}</h1>
          <p style={{ color: '#aaa' }}>{user?.email}</p>
          <span style={styles.roleBadge}>{user?.role}</span>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Edit Profile</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
            <div className="form-group">
              <label className="form-label">Default Delivery Address</label>
              <textarea className="form-input" rows={3} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={{ resize: 'none' }} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div style={{ ...styles.card, marginTop: 16 }}>
          <h3 style={styles.cardTitle}>Account Info</h3>
          <div style={styles.infoRow}><span style={{ color: '#666' }}>Email</span><span>{user?.email}</span></div>
          <div style={styles.infoRow}><span style={{ color: '#666' }}>Email Verified</span>
            <span style={{ color: user?.isEmailVerified ? '#22c55e' : '#ef4444' }}>
              {user?.isEmailVerified ? '✓ Verified' : '✗ Not Verified'}
            </span>
          </div>
          <div style={styles.infoRow}><span style={{ color: '#666' }}>Account Type</span>
            <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
          </div>
          <div style={styles.infoRow}><span style={{ color: '#666' }}>Member Since</span>
            <span>{new Date(user?.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  avatar: {
    width: 80, height: 80, borderRadius: '50%',
    background: 'linear-gradient(135deg, #e63946, #ff6b35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 36, fontWeight: 700, margin: '0 auto'
  },
  roleBadge: {
    display: 'inline-block', marginTop: 8,
    background: 'rgba(230,57,70,0.15)', color: '#e63946',
    padding: '4px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600, textTransform: 'capitalize'
  },
  card: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 28 },
  cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 24 },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #222', fontSize: 15 }
};

export default ProfilePage;
