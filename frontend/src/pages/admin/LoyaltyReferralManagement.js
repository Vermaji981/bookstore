import React, { useState, useEffect } from 'react';
import {
  Award,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  TrendingUp,
  X,
  History,
} from 'lucide-react';
import api from '../../api/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const LoyaltyReferralManagement = () => {
  const [data, setData] = useState({ users: [], transactions: [], stats: { totalIssued: 0, totalRedeemed: 0, tiers: {} } });
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('members'); // 'members' | 'ledger'
  const [searchTerm, setSearchTerm] = useState('');

  // Adjust Points Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pointsChange, setPointsChange] = useState(100);
  const [adjustReason, setAdjustReason] = useState('Customer courtesy credit');
  const [submitting, setSubmitting] = useState(false);

  const fetchLoyaltySummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/loyalty/admin/summary');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load loyalty summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyaltySummary();
  }, []);

  const openAdjustModal = (u) => {
    setSelectedUser(u);
    setPointsChange(100);
    setAdjustReason('Customer courtesy credit');
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);

    try {
      const res = await api.post('/loyalty/admin/adjust', {
        userId: selectedUser._id,
        points: pointsChange,
        description: adjustReason,
      });

      if (res.data.success) {
        setAdjustModalOpen(false);
        fetchLoyaltySummary();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to adjust points');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = (data.users || []).filter((u) => {
    const s = searchTerm.toLowerCase();
    return searchTerm === '' || u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.referralCode?.toLowerCase().includes(s);
  });

  return (
    <div className="admin-page animate-fade-in">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--admin-text)' }}>
            Loyalty Rewards & Referral Program
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Monitor points in circulation, manage tiers (Bronze, Silver, Gold, Platinum), and inspect audit ledgers.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchLoyaltySummary} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="admin-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>
            Total Points Issued
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
              {data.stats?.totalIssued || 0}
            </span>
            <Award size={28} color="var(--primary)" />
          </div>
        </div>

        <div className="admin-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>
            Points Redeemed
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>
              {data.stats?.totalRedeemed || 0}
            </span>
            <Sparkles size={28} color="#10b981" />
          </div>
        </div>

        <div className="admin-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>
            Outstanding Liability
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>
              ${(((data.stats?.totalIssued || 0) - (data.stats?.totalRedeemed || 0)) * 0.05).toFixed(2)}
            </span>
            <TrendingUp size={28} color="#f59e0b" />
          </div>
        </div>

        <div className="admin-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>
            Top Active Earners
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--admin-text)' }}>
              {data.users?.length || 0}
            </span>
            <Users size={28} color="var(--admin-text-muted)" />
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="admin-card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveSubTab('members')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeSubTab === 'members' ? 'var(--primary)' : 'transparent',
                color: activeSubTab === 'members' ? 'white' : 'var(--admin-text-muted)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              Member Accounts ({data.users?.length || 0})
            </button>
            <button
              onClick={() => setActiveSubTab('ledger')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeSubTab === 'ledger' ? 'var(--primary)' : 'transparent',
                color: activeSubTab === 'ledger' ? 'white' : 'var(--admin-text-muted)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              Points Audit Ledger ({data.transactions?.length || 0})
            </button>
          </div>

          {activeSubTab === 'members' && (
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
              <input
                type="text"
                placeholder="Search member or referral code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input"
                style={{ paddingLeft: '34px', width: '100%' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Tab 1: Member Accounts */}
      {activeSubTab === 'members' && (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px 20px' }}>
              <LoadingSpinner text="Loading member accounts..." />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-text-muted)' }}>
              <Award size={40} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <p style={{ fontWeight: 600, color: 'var(--admin-text)' }}>No Members Found</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Loyalty Tier</th>
                    <th>Current Balance</th>
                    <th>Dollar Equivalent</th>
                    <th>Referral Code</th>
                    <th>Member Since</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--admin-text)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>{u.email}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '3px 9px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            backgroundColor:
                              u.loyaltyTier === 'Platinum'
                                ? '#e0e7ff'
                                : u.loyaltyTier === 'Gold'
                                ? '#fef3c7'
                                : u.loyaltyTier === 'Silver'
                                ? '#f1f5f9'
                                : '#ffedd5',
                            color:
                              u.loyaltyTier === 'Platinum'
                                ? '#4338ca'
                                : u.loyaltyTier === 'Gold'
                                ? '#92400e'
                                : u.loyaltyTier === 'Silver'
                                ? '#475569'
                                : '#9a3412',
                          }}
                        >
                          {u.loyaltyTier || 'Bronze'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>
                          {u.loyaltyPoints || 0} pts
                        </strong>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#10b981' }}>
                          ${((u.loyaltyPoints || 0) * 0.05).toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                          {u.referralCode || '—'}
                        </code>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openAdjustModal(u)}
                        >
                          Adjust Points
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Audit Ledger */}
      {activeSubTab === 'ledger' && (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px 20px' }}>
              <LoadingSpinner text="Loading audit ledger..." />
            </div>
          ) : (data.transactions || []).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-text-muted)' }}>
              <History size={40} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <p style={{ fontWeight: 600, color: 'var(--admin-text)' }}>No Point Transactions Recorded</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Points</th>
                    <th>Balance After</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{tx.user?.name || 'Customer'}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{tx.user?.email}</div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            tx.type === 'earned'
                              ? 'badge-success'
                              : tx.type === 'redeemed'
                              ? 'badge-danger'
                              : 'badge-primary'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: tx.points > 0 ? '#10b981' : '#dc2626' }}>
                          {tx.points > 0 ? `+${tx.points}` : tx.points}
                        </strong>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{tx.balanceAfter} pts</span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--admin-text)' }}>{tx.description}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Adjust Points Modal */}
      {adjustModalOpen && selectedUser && (
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
              width: '460px',
              maxWidth: '95vw',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                Adjust Points: {selectedUser.name}
              </h3>
              <button
                type="button"
                onClick={() => setAdjustModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginBottom: '16px' }}>
              Current balance: <strong>{selectedUser.loyaltyPoints || 0} points</strong>. Use positive numbers to credit points, or negative numbers to deduct points.
            </p>

            <form onSubmit={handleAdjustSubmit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Points Adjustment (+ / -) *</label>
                <input
                  type="number"
                  required
                  value={pointsChange}
                  onChange={(e) => setPointsChange(Number(e.target.value))}
                  className="admin-input"
                  style={{ width: '100%', fontSize: '1rem', fontWeight: 700 }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Reason / Administrative Audit Note *</label>
                <textarea
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  rows="2"
                  placeholder="e.g. Compensation for shipping delay or promotional bonus"
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm"
                >
                  {submitting ? 'Updating...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyReferralManagement;
