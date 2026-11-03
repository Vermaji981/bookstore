import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  RefreshCw,
  Search,
  CheckCircle,
  Truck,
  AlertCircle,
  X,
} from 'lucide-react';
import api from '../../api/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ReturnsManagement = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Status update modal
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/returns/admin/all');
      if (res.data.success) {
        setReturns(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load return requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const openStatusModal = (ret) => {
    setSelectedReturn(ret);
    setNewStatus(ret.status);
    setAdminNotes(ret.adminNotes || '');
    setPickupDate(ret.pickupDate ? new Date(ret.pickupDate).toISOString().split('T')[0] : '');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedReturn) return;

    setSubmitting(true);
    try {
      const res = await api.put(`/returns/admin/${selectedReturn._id}/status`, {
        status: newStatus,
        adminNotes,
        pickupDate: pickupDate || undefined,
      });

      if (res.data.success) {
        setSelectedReturn(null);
        fetchReturns();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update return status');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReturns = returns.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch =
      searchTerm === '' ||
      r._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.order?._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate quick KPIs
  const totalRequested = returns.filter((r) => r.status === 'requested').length;
  const totalPickup = returns.filter((r) => r.status === 'pickup_scheduled').length;
  const totalCompleted = returns.filter((r) => ['refunded', 'replacement_sent'].includes(r.status)).length;

  return (
    <div className="admin-page animate-fade-in">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--admin-text)' }}>
            Returns & Replacement Management
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Process customer return requests, inspect returns, and dispatch replacement copies or issue refunds.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchReturns} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="admin-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>
            Pending Review
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>{totalRequested}</span>
            <AlertCircle size={28} color="#f59e0b" />
          </div>
        </div>

        <div className="admin-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>
            Pickups Scheduled
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284c7' }}>{totalPickup}</span>
            <Truck size={28} color="#0284c7" />
          </div>
        </div>

        <div className="admin-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>
            Resolved (Refunded / Replaced)
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>{totalCompleted}</span>
            <CheckCircle size={28} color="#10b981" />
          </div>
        </div>

        <div className="admin-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>
            Total Requests
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--admin-text)' }}>{returns.length}</span>
            <RotateCcw size={28} color="var(--primary)" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', 'requested', 'approved', 'pickup_scheduled', 'received', 'refunded', 'replacement_sent', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: statusFilter === st ? '1px solid var(--primary)' : '1px solid var(--admin-border)',
                  background: statusFilter === st ? 'var(--primary-light)' : 'transparent',
                  color: statusFilter === st ? 'var(--primary)' : 'var(--admin-text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by ID, order, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input"
              style={{ paddingLeft: '34px', width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Returns Data Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 20px' }}>
            <LoadingSpinner text="Loading return requests..." />
          </div>
        ) : filteredReturns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-text-muted)' }}>
            <RotateCcw size={40} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
            <p style={{ fontWeight: 600, margin: '0 0 4px', color: 'var(--admin-text)' }}>No Return Requests Found</p>
            <p style={{ fontSize: '0.85rem' }}>No customer returns match the selected filter criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr>
                  <th>Return ID</th>
                  <th>Customer</th>
                  <th>Order Reference</th>
                  <th>Type & Reason</th>
                  <th>Status</th>
                  <th>Pickup Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReturns.map((ret) => (
                  <tr key={ret._id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace' }}>#{ret._id.slice(-6).toUpperCase()}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                        {new Date(ret.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{ret.user?.name || 'Customer'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>{ret.user?.email}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>#{ret.order?._id ? ret.order._id.slice(-6).toUpperCase() : 'N/A'}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: ret.type === 'Return' ? '#dc2626' : '#2563eb' }}>
                        {ret.type}
                      </span>
                      <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>{ret.reason}</div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          ['refunded', 'replacement_sent'].includes(ret.status)
                            ? 'badge-success'
                            : ret.status === 'rejected'
                            ? 'badge-danger'
                            : 'badge-primary'
                        }`}
                      >
                        {ret.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {ret.pickupDate ? (
                        <span style={{ fontSize: '0.82rem', color: '#0284c7' }}>
                          🚚 {new Date(ret.pickupDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openStatusModal(ret)}
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {selectedReturn && (
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
              width: '500px',
              maxWidth: '95vw',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                Update Return #{selectedReturn._id.slice(-6).toUpperCase()}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedReturn(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Return Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="admin-input"
                  style={{ width: '100%' }}
                >
                  <option value="requested">Requested (Pending Review)</option>
                  <option value="approved">Approved</option>
                  <option value="pickup_scheduled">Pickup Scheduled</option>
                  <option value="received">Received at Warehouse</option>
                  <option value="inspected">Inspected & Verified</option>
                  <option value="refunded">Refunded to Original Method</option>
                  <option value="replacement_sent">Replacement Book Dispatched</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Scheduled Courier Pickup Date</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Admin Resolution Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows="3"
                  placeholder="Notes visible to audit and warehouse staff..."
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedReturn(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnsManagement;
