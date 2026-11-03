// VerifyEmailPage.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage(res.data.message);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed.');
      }
    };
    verify();
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 20, padding: 60, maxWidth: 480 }}>
        {status === 'loading' && <><div className="spinner" style={{ margin: '0 auto 16px' }} /><p style={{ color: '#aaa' }}>Verifying your email...</p></>}
        {status === 'success' && (
          <>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>Email Verified!</h2>
            <p style={{ color: '#aaa', marginBottom: 24 }}>{message}</p>
            <Link to="/login" className="btn btn-primary">Go to Login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>Verification Failed</h2>
            <p style={{ color: '#aaa', marginBottom: 24 }}>{message}</p>
            <Link to="/login" className="btn btn-secondary">Back to Login</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
