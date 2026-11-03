import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  DollarSign,
  RotateCcw,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import api from '../../api/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { StatCard } from '../../components/admin/charts/AdminCharts';

const PaymentManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Refund Modal State
  const [refundModalItem, setRefundModalItem] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/payment/admin/transactions?${params.toString()}`);
      if (res.data.success) {
        setTransactions(res.data.data.transactions || []);
        setSummary(res.data.data.summary);
        if (res.data.data.pagination) {
          setTotalPages(res.data.data.pagination.pages || 1);
          setTotalCount(res.data.data.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleProcessRefund = async (e) => {
    e.preventDefault();
    if (!refundModalItem) return;
    setSubmittingRefund(true);
    try {
      const res = await api.post('/payment/admin/refund', {
        orderId: refundModalItem.orderId,
        amount: refundModalItem.amount,
        reason: refundReason || 'Authorized refund from Payment Center',
      });
      if (res.data.success) {
        setRefundModalItem(null);
        setRefundReason('');
        fetchTransactions();
        alert('Refund successfully processed via payment gateway.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process refund');
    } finally {
      setSubmittingRefund(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <h1>Payment & Gateway Reconciliation</h1>
          <p className="admin-view-subtitle">
            Verified financial transactions, Stripe payment intents, dispute handling, and merchant settlement logs.
          </p>
        </div>
        <div className="admin-view-actions">
          <button className="admin-btn admin-btn-secondary" onClick={fetchTransactions}>
            <RefreshCw size={15} /> Refresh Records
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      {summary && (
        <div className="admin-stats-grid">
          <StatCard
            label="Gross Transaction Volume"
            value={`$${summary.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            subtext={`${summary.totalSuccessfulCount} successful checkouts`}
            icon={DollarSign}
            color="#10b981"
            bgColor="rgba(16, 185, 129, 0.12)"
          />

          <StatCard
            label="Net Settled Revenue"
            value={`$${summary.netRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            subtext="After refunds and chargebacks"
            icon={ShieldCheck}
            color="#4f46e5"
            bgColor="rgba(79, 70, 229, 0.12)"
          />

          <StatCard
            label="Total Refunded Amount"
            value={`$${summary.totalRefundedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            subtext={`${summary.totalRefundedCount} orders refunded`}
            icon={RotateCcw}
            color="#ef4444"
            bgColor="rgba(239, 68, 68, 0.12)"
          />

          <StatCard
            label="Payment Security"
            value="PCI-DSS Ready"
            subtext="Stripe Webhook Verified"
            icon={CreditCard}
            color="#06b6d4"
            bgColor="rgba(6, 182, 212, 0.12)"
          />
        </div>
      )}

      {/* Table & Filtering */}
      <div className="admin-panel">
        <div className="admin-table-controls">
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260 }}>
            <div className="admin-search-wrapper" style={{ width: '100%' }}>
              <Search className="admin-search-icon" />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search by Transaction ID, Stripe Reference, or Customer email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-secondary">
              Search
            </button>
          </form>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['all', 'succeeded', 'pending', 'failed', 'refunded'].map((st) => (
              <button
                key={st}
                className={`admin-date-pill ${statusFilter === st ? 'active' : ''}`}
                style={{ textTransform: 'capitalize' }}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="admin-table-wrapper">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <LoadingSpinner text="Querying payment gateway transaction ledgers..." />
            </div>
          ) : (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Order Reference</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Gateway Ref</th>
                  <th>Status</th>
                  <th>Date & Time</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx._id}>
                      {/* Transaction ID */}
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>
                        {tx.transactionId}
                      </td>

                      {/* Order Ref */}
                      <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        #{tx.orderId?.toString().slice(-6)}
                      </td>

                      {/* Customer */}
                      <td>
                        <div style={{ fontWeight: 600 }}>{tx.customer.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--admin-text-subtle)' }}>
                          {tx.customer.email}
                        </div>
                      </td>

                      {/* Amount */}
                      <td style={{ fontWeight: 700, fontSize: 14 }}>
                        ${tx.amount.toFixed(2)}
                      </td>

                      {/* Method */}
                      <td>
                        <span className="admin-status-pill neutral">{tx.paymentMethod}</span>
                      </td>

                      {/* Stripe Reference */}
                      <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--admin-text-subtle)' }}>
                        {tx.stripeReference ? (
                          <span>
                            {tx.stripeReference.slice(0, 15)}…
                          </span>
                        ) : (
                          'Manual / COD'
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`admin-status-pill ${
                            tx.paymentStatus === 'Succeeded'
                              ? 'success'
                              : tx.paymentStatus === 'Refunded'
                              ? 'danger'
                              : tx.paymentStatus === 'Failed'
                              ? 'danger'
                              : 'warning'
                          }`}
                        >
                          {tx.paymentStatus}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ fontSize: 12, color: 'var(--admin-text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(tx.paymentDate).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        {tx.paymentStatus === 'Succeeded' && (
                          <button
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            style={{ color: 'var(--admin-danger)' }}
                            onClick={() => setRefundModalItem(tx)}
                          >
                            <RotateCcw size={12} /> Refund
                          </button>
                        )}
                        {tx.paymentStatus === 'Refunded' && (
                          <span style={{ fontSize: 11, color: 'var(--admin-text-subtle)' }}>
                            Refunded (${tx.refundAmount?.toFixed(2)})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                      No payment transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="admin-pagination-wrapper">
          <div className="admin-pagination-info">
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} transactions)
          </div>
          <div className="admin-pagination-actions">
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      {refundModalItem && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                Authorize Gateway Refund
              </h3>
              <button
                className="admin-modal-close-btn"
                onClick={() => setRefundModalItem(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProcessRefund}>
              <div className="admin-modal-body">
                <p style={{ fontSize: 13, color: 'var(--admin-text-muted)', marginBottom: 16 }}>
                  You are refunding transaction <strong>{refundModalItem.transactionId}</strong> for Order #{refundModalItem.orderId?.toString().slice(-6)}.
                </p>

                <div className="admin-form-group">
                  <label className="admin-form-label">Refund Amount ($)</label>
                  <input
                    type="number"
                    disabled
                    className="admin-form-input"
                    style={{ width: '100%', fontWeight: 700 }}
                    value={refundModalItem.amount.toFixed(2)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Refund Audit Reason *</label>
                  <textarea
                    required
                    rows="3"
                    className="admin-form-textarea"
                    style={{ width: '100%' }}
                    placeholder="Enter reason for processing this gateway refund..."
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setRefundModalItem(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-danger"
                  disabled={submittingRefund}
                >
                  {submittingRefund ? 'Processing...' : 'Authorize Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
