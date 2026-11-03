import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import api from '../../api/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscount: 0,
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 100,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await api.get(`/coupons?${params.toString()}`);
      if (res.data.success) {
        setCoupons(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const openAddModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 15,
      minOrderAmount: 25,
      maxDiscount: 20,
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usageLimit: 100,
      isActive: true,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscount: coupon.maxDiscount || 0,
      expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit || 100,
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      if (editingCoupon) {
        const res = await api.put(`/coupons/${editingCoupon._id}`, formData);
        if (res.data.success) {
          setModalOpen(false);
          fetchCoupons();
        }
      } else {
        const res = await api.post('/coupons', formData);
        if (res.data.success) {
          setModalOpen(false);
          fetchCoupons();
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Are you sure you want to delete coupon code "${coupon.code}"?`)) return;
    try {
      const res = await api.delete(`/coupons/${coupon._id}`);
      if (res.data.success) {
        fetchCoupons();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      const updatedVal = !coupon.isActive;
      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, isActive: updatedVal } : c))
      );
      await api.put(`/coupons/${coupon._id}`, { isActive: updatedVal });
    } catch (err) {
      fetchCoupons();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <h1>Discounts & Coupon Management</h1>
          <p className="admin-view-subtitle">
            Configure promotional promo codes, percentage or fixed deductions, basket size thresholds, and expiration controls.
          </p>
        </div>
        <div className="admin-view-actions">
          <button className="admin-btn admin-btn-secondary" onClick={fetchCoupons}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="admin-btn admin-btn-primary" onClick={openAddModal}>
            <Plus size={16} /> Create Coupon
          </button>
        </div>
      </div>

      {/* Table Panel */}
      <div className="admin-panel">
        <div className="admin-table-controls">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Coupons' },
              { id: 'active', label: 'Active & Valid' },
              { id: 'expired', label: 'Expired' },
              { id: 'inactive', label: 'Disabled' },
            ].map((f) => (
              <button
                key={f.id}
                className={`admin-date-pill ${statusFilter === f.id ? 'active' : ''}`}
                onClick={() => setStatusFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Coupons Table */}
        <div className="admin-table-wrapper">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <LoadingSpinner text="Retrieving store coupons..." />
            </div>
          ) : (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Promo Code</th>
                  <th>Discount Rate</th>
                  <th>Rules / Thresholds</th>
                  <th>Usage Counter</th>
                  <th>Expiration Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length > 0 ? (
                  coupons.map((c) => {
                    const isExpired = new Date(c.expiryDate) < new Date();
                    return (
                      <tr key={c._id}>
                        {/* Code */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontWeight: 800,
                                fontSize: 14,
                                padding: '3px 8px',
                                backgroundColor: 'var(--admin-primary-light)',
                                color: 'var(--admin-primary)',
                                borderRadius: 'var(--admin-radius-sm)',
                                letterSpacing: '0.5px',
                              }}
                            >
                              {c.code}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginTop: 4 }}>
                            {c.description || 'No description'}
                          </div>
                        </td>

                        {/* Rate */}
                        <td>
                          <span style={{ fontWeight: 800, fontSize: 15 }}>
                            {c.discountType === 'percentage'
                              ? `${c.discountValue}% OFF`
                              : `$${c.discountValue.toFixed(2)} FLAT`}
                          </span>
                        </td>

                        {/* Rules */}
                        <td style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                          <div>
                            Min Order: <strong>${(c.minOrderAmount || 0).toFixed(2)}</strong>
                          </div>
                          {c.maxDiscount > 0 && (
                            <div style={{ color: 'var(--admin-text-subtle)' }}>
                              Max Cap: ${c.maxDiscount.toFixed(2)}
                            </div>
                          )}
                        </td>

                        {/* Usage Counter */}
                        <td>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>
                            {c.timesUsed || 0} / {c.usageLimit || '∞'}
                          </div>
                          <div
                            style={{
                              width: 80,
                              height: 5,
                              backgroundColor: 'var(--admin-border)',
                              borderRadius: 3,
                              overflow: 'hidden',
                              marginTop: 4,
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(100, ((c.timesUsed || 0) / (c.usageLimit || 1)) * 100)}%`,
                                height: '100%',
                                backgroundColor: 'var(--admin-primary)',
                              }}
                            />
                          </div>
                        </td>

                        {/* Expiry */}
                        <td style={{ fontSize: 12.5, whiteSpace: 'nowrap' }}>
                          <div style={{ color: isExpired ? 'var(--admin-danger)' : 'var(--admin-text-main)' }}>
                            {new Date(c.expiryDate).toLocaleDateString()}
                          </div>
                          {isExpired && (
                            <span style={{ fontSize: 11, color: 'var(--admin-danger)', fontWeight: 600 }}>
                              Expired
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td>
                          <button
                            className={`admin-status-pill ${
                              !c.isActive ? 'neutral' : isExpired ? 'danger' : 'success'
                            }`}
                            style={{ cursor: 'pointer', border: 'none' }}
                            onClick={() => handleToggleStatus(c)}
                          >
                            {!c.isActive ? 'Disabled' : isExpired ? 'Expired' : 'Active'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button
                              className="admin-btn admin-btn-secondary admin-btn-icon"
                              title="Edit Coupon"
                              onClick={() => openEditModal(c)}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="admin-btn admin-btn-secondary admin-btn-icon"
                              style={{ color: 'var(--admin-danger)' }}
                              title="Delete Coupon"
                              onClick={() => handleDelete(c)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                      No discount coupons found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Coupon Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promotional Coupon'}
              </h3>
              <button
                className="admin-modal-close-btn"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                {errorMsg && (
                  <div
                    style={{
                      padding: 10,
                      backgroundColor: 'var(--admin-danger-bg)',
                      color: 'var(--admin-danger)',
                      borderRadius: 'var(--admin-radius-md)',
                      marginBottom: 16,
                      fontSize: 13,
                    }}
                  >
                    {errorMsg}
                  </div>
                )}

                <div className="admin-form-group">
                  <label className="admin-form-label">Coupon Code (Uppercase) *</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    style={{ width: '100%', textTransform: 'uppercase', fontWeight: 700 }}
                    placeholder="e.g. BOOKWORM25"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Description for Readers</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    style={{ width: '100%' }}
                    placeholder="e.g. 25% discount for orders over $50"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Discount Type *</label>
                    <select
                      className="admin-form-select"
                      style={{ width: '100%' }}
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    >
                      <option value="percentage">Percentage (%) Discount</option>
                      <option value="fixed">Fixed Dollar ($) Deduction</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      Discount Value ({formData.discountType === 'percentage' ? '%' : '$'}) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className="admin-form-input"
                      style={{ width: '100%', fontWeight: 700 }}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Minimum Order Basket ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="admin-form-input"
                      style={{ width: '100%' }}
                      placeholder="0.00"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Max Discount Cap ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="admin-form-input"
                      style={{ width: '100%' }}
                      placeholder="0 = No Cap"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Expiration Date *</label>
                    <input
                      type="date"
                      required
                      className="admin-form-input"
                      style={{ width: '100%' }}
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Usage Limit (Max Redeems)</label>
                    <input
                      type="number"
                      min="1"
                      className="admin-form-input"
                      style={{ width: '100%' }}
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-switch-label">
                    <div
                      className={`admin-switch-track ${formData.isActive ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    >
                      <div className="admin-switch-thumb" />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Coupon Active & Redeemable</span>
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Publish Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;
