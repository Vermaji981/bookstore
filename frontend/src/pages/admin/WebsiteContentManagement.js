import React, { useState, useEffect } from 'react';
import {
  Save,
  Plus,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import api from '../../api/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const WebsiteContentManagement = () => {
  const [activeTab, setActiveTab] = useState('hero'); // 'hero' | 'promo' | 'about' | 'contact' | 'subscribers'
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/settings');
      if (res.data.success) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await api.put('/admin/settings', settings);
      if (res.data.success) {
        setSettings(res.data.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save website content');
    } finally {
      setSaving(false);
    }
  };

  // Add promo banner item
  const handleAddPromoBanner = () => {
    const updated = [
      ...(settings.promotionalBanners || []),
      {
        title: 'New Seasonal Promotion',
        subtitle: 'Special offer for bookstore readers',
        badge: 'Special',
        link: '/books',
        bgColor: '#4f46e5',
        isActive: true,
      },
    ];
    setSettings({ ...settings, promotionalBanners: updated });
  };

  const handleRemovePromoBanner = (idx) => {
    const updated = settings.promotionalBanners.filter((_, i) => i !== idx);
    setSettings({ ...settings, promotionalBanners: updated });
  };

  const handlePromoChange = (idx, field, val) => {
    const updated = [...settings.promotionalBanners];
    updated[idx] = { ...updated[idx], [field]: val };
    setSettings({ ...settings, promotionalBanners: updated });
  };

  if (loading || !settings) {
    return <LoadingSpinner text="Retrieving live website content configurations..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <h1>Website Content Management System (CMS)</h1>
          <p className="admin-view-subtitle">
            Customize storefront banners, promotional offers, About Us narrative, and public contact information in real-time.
          </p>
        </div>
        <div className="admin-view-actions">
          {saveSuccess && (
            <span style={{ color: 'var(--admin-success)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle size={16} /> Live Website Updated!
            </span>
          )}
          <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={15} /> {saving ? 'Publishing...' : 'Publish Content Changes'}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--admin-border)', paddingBottom: 10, flexWrap: 'wrap' }}>
        {[
          { id: 'hero', label: 'Homepage Hero Banner' },
          { id: 'promo', label: 'Promotional Banners' },
          { id: 'about', label: 'About Us Content' },
          { id: 'contact', label: 'Contact & Store Details' },
          { id: 'footer', label: 'Footer Content' },
          { id: 'subscribers', label: `Newsletter Subscribers (${settings.newsletterSubscribers?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`admin-date-pill ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Hero Banner Tab */}
      {activeTab === 'hero' && (
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h3 className="admin-panel-title">Homepage Hero Banner</h3>
              <p className="admin-panel-subtitle">Primary showcase section featured at the top of the homepage</p>
            </div>
          </div>
          <div className="admin-panel-body">
            <div className="admin-form-group">
              <label className="admin-form-label">Hero Badge / Tagline Pill</label>
              <input
                type="text"
                className="admin-form-input"
                style={{ width: '100%' }}
                value={settings.heroBanner?.badge || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    heroBanner: { ...settings.heroBanner, badge: e.target.value },
                  })
                }
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Hero Headline Title *</label>
              <input
                type="text"
                className="admin-form-input"
                style={{ width: '100%' }}
                value={settings.heroBanner?.title || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    heroBanner: { ...settings.heroBanner, title: e.target.value },
                  })
                }
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Subtitle Description *</label>
              <textarea
                rows="3"
                className="admin-form-textarea"
                style={{ width: '100%' }}
                value={settings.heroBanner?.subtitle || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    heroBanner: { ...settings.heroBanner, subtitle: e.target.value },
                  })
                }
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Call to Action (CTA) Button Text</label>
                <input
                  type="text"
                  className="admin-form-input"
                  style={{ width: '100%' }}
                  value={settings.heroBanner?.ctaText || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      heroBanner: { ...settings.heroBanner, ctaText: e.target.value },
                    })
                  }
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">CTA Link URL</label>
                <input
                  type="text"
                  className="admin-form-input"
                  style={{ width: '100%' }}
                  value={settings.heroBanner?.ctaLink || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      heroBanner: { ...settings.heroBanner, ctaLink: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Background / Cover Image URL</label>
              <input
                type="text"
                className="admin-form-input"
                style={{ width: '100%' }}
                value={settings.heroBanner?.bgImage || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    heroBanner: { ...settings.heroBanner, bgImage: e.target.value },
                  })
                }
              />
              {settings.heroBanner?.bgImage && (
                <div style={{ marginTop: 10 }}>
                  <img
                    src={settings.heroBanner.bgImage}
                    alt="Hero Preview"
                    style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 'var(--admin-radius-md)' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Promotional Banners Tab */}
      {activeTab === 'promo' && (
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h3 className="admin-panel-title">Promotional Cards & Banners</h3>
              <p className="admin-panel-subtitle">Highlight special genre discounts, author spotlights, and seasonal events</p>
            </div>
            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={handleAddPromoBanner}>
              <Plus size={14} /> Add Promotional Banner
            </button>
          </div>
          <div className="admin-panel-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(settings.promotionalBanners || []).map((promo, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 16,
                    border: '1px solid var(--admin-border)',
                    borderRadius: 'var(--admin-radius-md)',
                    backgroundColor: 'var(--admin-bg-alt)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontWeight: 700 }}>Banner #{idx + 1}</span>
                    <button
                      className="admin-btn admin-btn-secondary admin-btn-icon"
                      style={{ color: 'var(--admin-danger)' }}
                      onClick={() => handleRemovePromoBanner(idx)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Banner Title</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        style={{ width: '100%' }}
                        value={promo.title}
                        onChange={(e) => handlePromoChange(idx, 'title', e.target.value)}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Badge Label</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        style={{ width: '100%' }}
                        value={promo.badge}
                        onChange={(e) => handlePromoChange(idx, 'badge', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Subtitle Description</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      style={{ width: '100%' }}
                      value={promo.subtitle}
                      onChange={(e) => handlePromoChange(idx, 'subtitle', e.target.value)}
                    />
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Destination Link</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        style={{ width: '100%' }}
                        value={promo.link}
                        onChange={(e) => handlePromoChange(idx, 'link', e.target.value)}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Accent Color</label>
                      <input
                        type="color"
                        className="admin-form-input"
                        style={{ width: '100%', height: 40, padding: 4 }}
                        value={promo.bgColor || '#4f46e5'}
                        onChange={(e) => handlePromoChange(idx, 'bgColor', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. About Us Tab */}
      {activeTab === 'about' && (
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h3 className="admin-panel-title">About Us & Company Narrative</h3>
              <p className="admin-panel-subtitle">Content displayed on the public /about page</p>
            </div>
          </div>
          <div className="admin-panel-body">
            <div className="admin-form-group">
              <label className="admin-form-label">Section Heading</label>
              <input
                type="text"
                className="admin-form-input"
                style={{ width: '100%' }}
                value={settings.aboutUsContent?.heading || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    aboutUsContent: { ...settings.aboutUsContent, heading: e.target.value },
                  })
                }
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Our Story</label>
              <textarea
                rows="4"
                className="admin-form-textarea"
                style={{ width: '100%' }}
                value={settings.aboutUsContent?.story || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    aboutUsContent: { ...settings.aboutUsContent, story: e.target.value },
                  })
                }
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Our Mission</label>
              <textarea
                rows="3"
                className="admin-form-textarea"
                style={{ width: '100%' }}
                value={settings.aboutUsContent?.mission || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    aboutUsContent: { ...settings.aboutUsContent, mission: e.target.value },
                  })
                }
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Our Vision</label>
              <textarea
                rows="3"
                className="admin-form-textarea"
                style={{ width: '100%' }}
                value={settings.aboutUsContent?.vision || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    aboutUsContent: { ...settings.aboutUsContent, vision: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Contact Details Tab */}
      {activeTab === 'contact' && (
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h3 className="admin-panel-title">Public Contact & Support Information</h3>
              <p className="admin-panel-subtitle">Customer care coordinates displayed across header, footer, and /contact page</p>
            </div>
          </div>
          <div className="admin-panel-body">
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Official Support Email</label>
                <input
                  type="email"
                  className="admin-form-input"
                  style={{ width: '100%' }}
                  value={settings.contactEmail || ''}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Customer Helpline Phone</label>
                <input
                  type="text"
                  className="admin-form-input"
                  style={{ width: '100%' }}
                  value={settings.contactPhone || ''}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Physical Bookstore Address</label>
              <input
                type="text"
                className="admin-form-input"
                style={{ width: '100%' }}
                value={settings.contactAddress || ''}
                onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Working / Operating Hours</label>
              <input
                type="text"
                className="admin-form-input"
                style={{ width: '100%' }}
                value={settings.workingHours || ''}
                onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Footer Content Tab */}
      {activeTab === 'footer' && (
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h3 className="admin-panel-title">Footer Content & Copyright</h3>
              <p className="admin-panel-subtitle">Text rendered in the global store footer</p>
            </div>
          </div>
          <div className="admin-panel-body">
            <div className="admin-form-group">
              <label className="admin-form-label">Footer Store Biography</label>
              <textarea
                rows="3"
                className="admin-form-textarea"
                style={{ width: '100%' }}
                value={settings.footerContent?.bio || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    footerContent: { ...settings.footerContent, bio: e.target.value },
                  })
                }
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Copyright Notice</label>
              <input
                type="text"
                className="admin-form-input"
                style={{ width: '100%' }}
                value={settings.footerContent?.copyrightText || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    footerContent: { ...settings.footerContent, copyrightText: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. Newsletter Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h3 className="admin-panel-title">
                Newsletter Subscribers ({settings.newsletterSubscribers?.length || 0})
              </h3>
              <p className="admin-panel-subtitle">Readers subscribed to bookstore updates, promos, and new releases</p>
            </div>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Subscriber Email Address</th>
                  <th>Subscription Date</th>
                </tr>
              </thead>
              <tbody>
                {settings.newsletterSubscribers && settings.newsletterSubscribers.length > 0 ? (
                  settings.newsletterSubscribers.map((sub, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{sub.email}</td>
                      <td style={{ fontSize: 12, color: 'var(--admin-text-subtle)' }}>
                        {new Date(sub.subscribedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '40px' }}>
                      No newsletter subscribers yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteContentManagement;
