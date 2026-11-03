import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useAdminTheme } from '../../context/AdminThemeContext';

const AdminSettings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useAdminTheme();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState('profile');

  // Profile state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Site Settings state
  const [settings, setSettings] = useState({
    websiteName: 'Online Bookstore',
    logoUrl: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    currency: 'USD',
    currencySymbol: '$',
    shippingFee: 5.99,
    freeShippingThreshold: 50,
    taxRate: 7.5,
    lowStockAlertThreshold: 5,
    notificationPreferences: {
      orderCreated: true,
      userRegistered: true,
      lowStock: true,
      reviewSubmitted: true,
      paymentFailed: true,
    },
  });

  const [loading, setLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showNotification = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 5000);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/settings');
      if (res.data?.success && res.data.data) {
        setSettings((prev) => ({
          ...prev,
          ...res.data.data,
          notificationPreferences: {
            ...prev.notificationPreferences,
            ...(res.data.data.notificationPreferences || {}),
          },
        }));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await api.put('/auth/profile', {
        name: profileForm.name,
        phone: profileForm.phone,
      });

      if (res.data?.success) {
        showNotification('success', 'Admin profile updated successfully');
        // Update auth state in localStorage
        const updatedUser = { ...user, ...res.data.data };
        localStorage.setItem('bookstore_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('error', 'New password and confirm password do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showNotification('error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setSavingPassword(true);
      const res = await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (res.data?.success) {
        showNotification('success', 'Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const res = await api.put('/admin/settings', settings);
      if (res.data?.success) {
        showNotification('success', 'Store settings and configurations saved successfully');
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>System Settings & Preferences</h2>
          <p>Manage administrative account credentials, store configurations, financial rates, and notifications</p>
        </div>
        {loading && <div className="admin-loading-spinner" title="Loading current settings..." />}
      </div>

      {msg.text && (
        <div className={`alert-banner ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          <span>{msg.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{msg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs" style={{ marginBottom: '24px' }}>
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Admin Profile
        </button>
        <button
          className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          🏪 Website & Branding
        </button>
        <button
          className={`tab-btn ${activeTab === 'commerce' ? 'active' : ''}`}
          onClick={() => setActiveTab('commerce')}
        >
          💰 Currency, Shipping & Tax
        </button>
        <button
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notification Alerts
        </button>
        <button
          className={`tab-btn ${activeTab === 'theme' ? 'active' : ''}`}
          onClick={() => setActiveTab('theme')}
        >
          🎨 Appearance & Theme
        </button>
      </div>

      {/* 1. Admin Profile Tab */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          <div className="admin-card">
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>
              👤 Personal Information
            </h3>
            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Read-only)</label>
                <input
                  type="email"
                  className="form-control"
                  value={profileForm.email}
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                  Email changes require security verification
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Role</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-purple" style={{ textTransform: 'uppercase', padding: '6px 12px' }}>
                    {user?.role || 'admin'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                    Permissions verified via JWT
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingProfile}
                style={{ width: '100%', marginTop: '12px' }}
              >
                {savingProfile ? 'Updating...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          <div className="admin-card">
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>
              🔒 Security & Password
            </h3>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Minimum 6 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-enter new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <div style={{ padding: '12px', background: 'var(--admin-hover)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                🛡️ Passwords are encrypted with bcrypt salts. Never reuse passwords across services.
              </div>

              <button
                type="submit"
                className="btn btn-warning"
                disabled={savingPassword}
                style={{ width: '100%' }}
              >
                {savingPassword ? 'Changing Password...' : 'Change Admin Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. General Website Settings */}
      {activeTab === 'general' && (
        <div className="admin-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>
            🏪 Website Information & Identity
          </h3>
          <form onSubmit={handleSettingsSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Website Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.websiteName}
                  onChange={(e) => setSettings({ ...settings, websiteName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Brand Logo URL</label>
                <input
                  type="url"
                  className="form-control"
                  value={settings.logoUrl || ''}
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Customer Support Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={settings.contactEmail || ''}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  placeholder="support@bookstore.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Support Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  value={settings.contactPhone || ''}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  placeholder="+1 (800) 123-4567"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Storefront Physical / Mailing Address</label>
              <textarea
                className="form-control"
                rows="3"
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="123 Literary Way, Suite 400, New York, NY 10001"
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" disabled={savingSettings} style={{ marginTop: '16px' }}>
              {savingSettings ? 'Saving...' : '💾 Save General Settings'}
            </button>
          </form>
        </div>
      )}

      {/* 3. Commerce & Financials */}
      {activeTab === 'commerce' && (
        <div className="admin-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>
            💰 Currency, Shipping & Financial Controls
          </h3>
          <form onSubmit={handleSettingsSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Currency Code</label>
                <select
                  className="form-control"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                >
                  <option value="USD">USD (United States Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="GBP">GBP (British Pound)</option>
                  <option value="INR">INR (Indian Rupee)</option>
                  <option value="CAD">CAD (Canadian Dollar)</option>
                  <option value="AUD">AUD (Australian Dollar)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Currency Symbol</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.currencySymbol}
                  onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                  maxLength="4"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Standard Shipping Fee ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  value={settings.shippingFee}
                  onChange={(e) => setSettings({ ...settings, shippingFee: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Free Shipping Threshold ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                  Orders equal or above this ship free
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  className="form-control"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Low Stock Threshold (Units)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="100"
                  className="form-control"
                  value={settings.lowStockAlertThreshold}
                  onChange={(e) => setSettings({ ...settings, lowStockAlertThreshold: parseInt(e.target.value, 10) || 5 })}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                  Books at or below this count trigger warnings
                </span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={savingSettings} style={{ marginTop: '20px' }}>
              {savingSettings ? 'Saving...' : '💾 Save Commerce Settings'}
            </button>
          </form>
        </div>
      )}

      {/* 4. Notification Preferences */}
      {activeTab === 'notifications' && (
        <div className="admin-card">
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700 }}>
            🔔 Administrative Notification Channels
          </h3>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', marginBottom: '24px' }}>
            Choose which system events automatically trigger alert notices in the Admin Notification Center.
          </p>

          <form onSubmit={handleSettingsSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { key: 'orderCreated', label: 'New Customer Order Placed', desc: 'Receive real-time notification whenever an order is submitted' },
                { key: 'lowStock', label: 'Low Stock & Inventory Depleted Alerts', desc: 'Notify inventory managers when a book reaches the threshold or sells out' },
                { key: 'userRegistered', label: 'New User Account Registration', desc: 'Alert when a new shopper creates an account' },
                { key: 'reviewSubmitted', label: 'Customer Product Reviews Submitted', desc: 'Alert for moderation when shoppers leave reviews and star ratings' },
                { key: 'paymentFailed', label: 'Payment Failures & Stripe Webhook Issues', desc: 'Notify admins immediately when a transaction encounters errors' },
              ].map(({ key, label, desc }) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--admin-hover)',
                    border: '1px solid var(--admin-border)',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: '4px' }}>{label}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>{desc}</span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.notificationPreferences?.[key] !== false}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notificationPreferences: {
                            ...settings.notificationPreferences,
                            [key]: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              ))}
            </div>

            <button type="submit" className="btn btn-primary" disabled={savingSettings} style={{ marginTop: '24px' }}>
              {savingSettings ? 'Saving...' : '💾 Save Notification Preferences'}
            </button>
          </form>
        </div>
      )}

      {/* 5. Theme Settings */}
      {activeTab === 'theme' && (
        <div className="admin-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>
            🎨 Admin Dashboard Appearance
          </h3>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', marginBottom: '24px' }}>
            Toggle between Light and Dark display mode. Your preference is persisted in your browser's local storage.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <div
              onClick={() => theme !== 'light' && toggleTheme()}
              style={{
                cursor: 'pointer',
                padding: '24px',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                color: '#1e293b',
                border: theme === 'light' ? '3px solid #4f46e5' : '1px solid #cbd5e1',
                boxShadow: theme === 'light' ? '0 0 0 4px rgba(79, 70, 229, 0.15)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.8rem' }}>☀️</span>
                {theme === 'light' && <span className="badge badge-success">Active</span>}
              </div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem' }}>Light Enterprise Mode</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                Crisp high-contrast theme suited for bright daylight working environments.
              </p>
            </div>

            <div
              onClick={() => theme !== 'dark' && toggleTheme()}
              style={{
                cursor: 'pointer',
                padding: '24px',
                borderRadius: 'var(--radius-md)',
                background: '#0f172a',
                color: '#f8fafc',
                border: theme === 'dark' ? '3px solid #6366f1' : '1px solid #334155',
                boxShadow: theme === 'dark' ? '0 0 0 4px rgba(99, 102, 241, 0.25)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.8rem' }}>🌙</span>
                {theme === 'dark' && <span className="badge badge-purple">Active</span>}
              </div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#f8fafc' }}>Dark Enterprise Mode</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                Modern low-glare dark palette designed for extended monitoring and nighttime usage.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
