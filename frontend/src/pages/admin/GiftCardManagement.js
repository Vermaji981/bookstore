import React, { useState, useEffect } from 'react';
import {
  Gift,
  Plus,
  RefreshCw,
  Search,
  CheckCircle,
  Copy,
  Sparkles,
  X,
  Calendar,
} from 'lucide-react';
import api from '../../api/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const GiftCardManagement = () => {
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  // Issue Gift Card Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    initialBalance: 50,
    recipientEmail: '',
    recipientName: '',
    message: 'A literary gift from PageHaven Bookstore!',
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchGiftCards = async () => {
    setLoading(true);
    try {
      const res = await api.get('/giftcards/admin/all');
      if (res.data.success) {
        setGiftCards(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load gift cards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGiftCards();
  }, []);

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const segment = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `PAGE-${segment(4)}-${segment(4)}-${segment(4)}`;
  };

  const handleOpenIssueModal = () => {
    setFormData({
      code: generateRandomCode(),
      initialBalance: 50,
      recipientEmail: '',
      recipientName: '',
      message: 'A literary gift from PageHaven Bookstore!',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.put(`/giftcards/admin/${id}/toggle`);
      if (res.data.success) {
        fetchGiftCards();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.post('/giftcards', formData);
      if (res.data.success) {
        setModalOpen(false);
        fetchGiftCards();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to issue gift card');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const filteredCards = giftCards.filter((c) => {
    const search = searchTerm.toLowerCase();
    return (
      searchTerm === '' ||
      c.code.toLowerCase().includes(search) ||
      c.recipientEmail?.toLowerCase().includes(search) ||
      c.recipientName?.toLowerCase().includes(search)
    );
  });

  // Calculate quick stats
  const totalActive = giftCards.filter((c) => c.isActive && new Date(c.expiryDate) > new Date()).length;
  const totalBalance = giftCards.reduce((acc, c) => acc + (c.currentBalance || 0), 0);
  const totalInitial = giftCards.reduce((acc, c) => acc + (c.initialBalance || 0), 0);
  const totalRedeemed = Math.max(0, totalInitial - totalBalance);

  return (
    <div className="admin-page animate-fade-in">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--admin-text)' }}>
            Gift Card Management
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Issue 16-character encrypted gift voucher codes, manage recipient balances, and track redemption activity.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={fetchGiftCards} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={handleOpenIssueModal} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Issue New Gift Card
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="admin-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>
            Active Gift Cards
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>{totalActive}</span>
            <Gift size={28} color="#10b981" />
          </div>
        </div>

        <div className="admin-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>
            Outstanding Balance
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>${totalBalance.toFixed(2)}</span>
            <Sparkles size={28} color="var(--primary)" />
          </div>
        </div>

        <div className="admin-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>
            Total Redeemed Volume
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284c7' }}>${totalRedeemed.toFixed(2)}</span>
            <CheckCircle size={28} color="#0284c7" />
          </div>
        </div>

        <div className="admin-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>
            Total Cards Created
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--admin-text)' }}>{giftCards.length}</span>
            <Calendar size={28} color="var(--admin-text-muted)" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="admin-card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ position: 'relative', maxWidth: '360px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
          <input
            type="text"
            placeholder="Search by code, recipient name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input"
            style={{ paddingLeft: '34px', width: '100%' }}
          />
        </div>
      </div>

      {/* Gift Cards Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 20px' }}>
            <LoadingSpinner text="Loading gift cards..." />
          </div>
        ) : filteredCards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-text-muted)' }}>
            <Gift size={40} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
            <p style={{ fontWeight: 600, margin: '0 0 4px', color: 'var(--admin-text)' }}>No Gift Cards Found</p>
            <p style={{ fontSize: '0.85rem' }}>Click "Issue New Gift Card" to create your first voucher.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr>
                  <th>Voucher Code</th>
                  <th>Recipient</th>
                  <th>Remaining / Initial</th>
                  <th>Expiration Date</th>
                  <th>Times Used</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.map((card) => {
                  const isExpired = new Date(card.expiryDate) < new Date();
                  const percentLeft = Math.round((card.currentBalance / card.initialBalance) * 100);

                  return (
                    <tr key={card._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <code style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary)' }}>
                            {card.code}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(card.code)}
                            title="Copy Code"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)', padding: '2px' }}
                          >
                            <Copy size={13} color={copiedCode === card.code ? '#10b981' : undefined} />
                          </button>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                          Created: {new Date(card.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>
                          {card.recipientName || 'Bookstore Customer'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                          {card.recipientEmail || 'General Distribution'}
                        </div>
                      </td>
                      <td style={{ minWidth: '150px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                          <strong style={{ color: card.currentBalance > 0 ? '#10b981' : '#dc2626' }}>
                            ${Number(card.currentBalance).toFixed(2)}
                          </strong>
                          <span style={{ color: 'var(--admin-text-muted)' }}>
                            of ${Number(card.initialBalance).toFixed(2)}
                          </span>
                        </div>
                        <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${percentLeft}%`,
                              background: card.currentBalance > 0 ? 'var(--primary)' : '#94a3b8',
                              borderRadius: '4px',
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <span style={{ color: isExpired ? '#dc2626' : 'var(--admin-text)', fontSize: '0.85rem', fontWeight: isExpired ? 700 : 500 }}>
                          {new Date(card.expiryDate).toLocaleDateString()}
                        </span>
                        {isExpired && <span style={{ display: 'block', fontSize: '0.72rem', color: '#dc2626' }}>Expired</span>}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{card.usageHistory?.length || 0} orders</span>
                      </td>
                      <td>
                        <span className={`badge ${card.isActive && !isExpired ? 'badge-success' : 'badge-danger'}`}>
                          {!card.isActive ? 'Disabled' : isExpired ? 'Expired' : 'Active'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className={`btn ${card.isActive ? 'btn-danger' : 'btn-secondary'} btn-sm`}
                          onClick={() => handleToggleStatus(card._id)}
                        >
                          {card.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Issue Gift Card Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            className="admin-card"
            style={{
              width: '520px',
              maxWidth: '95vw',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                Issue Digital Gift Voucher
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div style={{ padding: '8px 12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>Gift Card Code *</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, code: generateRandomCode() })}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    🎲 Regenerate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="admin-input"
                  style={{ width: '100%', fontFamily: 'monospace', letterSpacing: '0.04em' }}
                />
              </div>

              <div className="form-row-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Initial Credit Value ($) *</label>
                  <input
                    type="number"
                    min="5"
                    max="1000"
                    step="5"
                    required
                    value={formData.initialBalance}
                    onChange={(e) => setFormData({ ...formData, initialBalance: Number(e.target.value) })}
                    className="admin-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="admin-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="form-row-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Recipient Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Eleanor Vance"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    className="admin-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Recipient Email</label>
                  <input
                    type="email"
                    placeholder="eleanor@example.com"
                    value={formData.recipientEmail}
                    onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                    className="admin-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Personal Gift Note</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows="2"
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm"
                >
                  {submitting ? 'Generating...' : 'Issue Gift Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftCardManagement;
