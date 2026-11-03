import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Key, Lock, AlertCircle } from 'lucide-react';
import api from '../api/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter code & new password
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setMessage('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setMessage(res.data.message);
        if (res.data.demoResetCode) {
          setResetCode(res.data.demoResetCode);
        }
        setStep(2);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/auth/reset-password', {
        email,
        resetCode,
        newPassword,
      });
      if (res.data.success) {
        alert('Password has been reset! Please sign in with your new password.');
        navigate('/login');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Reset failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="section animate-fade-in"
      style={{
        backgroundColor: '#f8fafc',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="container" style={{ maxWidth: '460px', width: '100%' }}>
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 'clamp(16px, 4vw, 24px)',
            padding: 'clamp(1.25rem, 5vw, 2.5rem)',
            border: '1px solid #e2e8f0',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          {/* Logo Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                textDecoration: 'none',
                marginBottom: '1rem',
              }}
            >
              <img
                src="/favicon.svg"
                alt="PageHaven Logo"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
                }}
              />
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                Page<span style={{ color: 'var(--primary)' }}>Haven</span>
              </span>
            </Link>

            <h2 className="title-md font-serif">Reset Your Password</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {step === 1
                ? 'Enter your registered email address to receive reset instructions.'
                : 'Enter your verification code and choose a new password.'}
            </p>
          </div>

          {errorMsg && (
            <div
              style={{
                padding: '0.85rem',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                borderRadius: '10px',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
              }}
            >
              <AlertCircle size={16} flexShrink={0} />
              <span>{errorMsg}</span>
            </div>
          )}

          {message && (
            <div
              style={{
                padding: '0.85rem',
                backgroundColor: '#d1fae5',
                color: '#065f46',
                borderRadius: '10px',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
              }}
            >
              {message}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestCode}>
              <div className="form-group">
                <label className="form-label">Registered Email</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    placeholder="user@bookstore.com"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={isLoading}
                style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
              >
                {isLoading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">Reset Verification Code</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="form-input"
                    placeholder="e.g. A9B8C7"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <Key
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    placeholder="••••••••"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={isLoading}
                style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
              >
                {isLoading ? 'Updating...' : 'Set New Password'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem' }}>
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              ← Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
