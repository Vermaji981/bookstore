import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Plus,
  Minus,
  RefreshCw,
  History,
  Sliders,
} from 'lucide-react';
import api from '../../api/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { StatCard } from '../../components/admin/charts/AdminCharts';

const InventoryManagement = ({ initialFilter = 'all' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Stock Adjustment Modal
  const [adjustModalBook, setAdjustModalBook] = useState(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState(10);
  const [adjustType, setAdjustType] = useState('add'); // 'add' | 'remove'
  const [adjustReason, setAdjustReason] = useState('RESTOCK');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/admin/inventory?${params.toString()}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchInventory();
  };

  const openAdjustModal = (book) => {
    setAdjustModalBook(book);
    setAdjustmentAmount(10);
    setAdjustType('add');
    setAdjustReason('RESTOCK');
    setAdjustNote('');
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustModalBook) return;
    setAdjusting(true);

    try {
      const delta = adjustType === 'add' ? Number(adjustmentAmount) : -Number(adjustmentAmount);
      const res = await api.post('/admin/inventory/adjust', {
        bookId: adjustModalBook._id,
        adjustmentAmount: delta,
        reason: adjustReason,
        note: adjustNote,
      });

      if (res.data.success) {
        setAdjustModalBook(null);
        fetchInventory();
        alert(res.data.message || 'Stock adjusted successfully');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <h1>Stock & Inventory Control</h1>
          <p className="admin-view-subtitle">
            Warehouse unit counts, restocking logistics, low-stock threshold triggers, and audit adjustment history.
          </p>
        </div>
        <div className="admin-view-actions">
          <button className="admin-btn admin-btn-secondary" onClick={fetchInventory}>
            <RefreshCw size={15} /> Refresh Stock
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {data?.summary && (
        <div className="admin-stats-grid">
          <StatCard
            label="Total Units In Stock"
            value={data.summary.totalStock}
            subtext="Across entire catalog"
            icon={Package}
            color="#3b82f6"
            bgColor="rgba(59, 130, 246, 0.12)"
          />

          <StatCard
            label="Low Stock Alert"
            value={data.summary.lowStock}
            subtext={`≤ ${data.summary.threshold} units left`}
            trend={data.summary.lowStock > 0 ? 'Reorder Needed' : 'Healthy'}
            trendType={data.summary.lowStock > 0 ? 'warning' : 'up'}
            icon={AlertTriangle}
            color="#f59e0b"
            bgColor="rgba(245, 158, 11, 0.12)"
            onClick={() => setStatusFilter('low_stock')}
          />

          <StatCard
            label="Out of Stock Titles"
            value={data.summary.outOfStock}
            subtext="Purchasing disabled"
            trend={data.summary.outOfStock > 0 ? 'Critical' : 'Zero'}
            trendType={data.summary.outOfStock > 0 ? 'down' : 'up'}
            icon={XCircle}
            color="#ef4444"
            bgColor="rgba(239, 68, 68, 0.12)"
            onClick={() => setStatusFilter('out_of_stock')}
          />

          <StatCard
            label="Stock Health"
            value="Automatic"
            subtext="Real-time order reservation"
            icon={CheckCircle}
            color="#10b981"
            bgColor="rgba(16, 185, 129, 0.12)"
          />
        </div>
      )}

      {/* Inventory Table Panel */}
      <div className="admin-panel">
        <div className="admin-table-controls">
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260 }}>
            <div className="admin-search-wrapper" style={{ width: '100%' }}>
              <Search className="admin-search-icon" />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search inventory by title, author, or ISBN..."
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
            {[
              { id: 'all', label: 'All Titles' },
              { id: 'in_stock', label: 'In Stock' },
              { id: 'low_stock', label: 'Low Stock Alerts' },
              { id: 'out_of_stock', label: 'Out of Stock' },
            ].map((f) => (
              <button
                key={f.id}
                className={`admin-date-pill ${statusFilter === f.id ? 'active' : ''}`}
                onClick={() => {
                  setStatusFilter(f.id);
                  setPage(1);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Books Table */}
        <div className="admin-table-wrapper">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <LoadingSpinner text="Counting stock levels from database..." />
            </div>
          ) : (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Stock Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.books && data.books.length > 0 ? (
                  data.books.map((b) => (
                    <tr key={b._id}>
                      {/* Title & Cover */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={b.image}
                            alt={b.title}
                            style={{ width: 36, height: 50, objectFit: 'cover', borderRadius: 4 }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--admin-text-main)' }}>
                              {b.title}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>
                              by {b.author}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="admin-status-pill neutral">{b.category}</span>
                      </td>

                      {/* Price */}
                      <td style={{ fontWeight: 700 }}>${b.price.toFixed(2)}</td>

                      {/* Stock Quantity */}
                      <td>
                        <span
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color:
                              b.stock === 0
                                ? 'var(--admin-danger)'
                                : b.stock <= 5
                                ? 'var(--admin-warning)'
                                : 'var(--admin-text-main)',
                          }}
                        >
                          {b.stock} units
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`admin-status-pill ${
                            b.stock === 0
                              ? 'danger'
                              : b.stock <= 5
                              ? 'warning'
                              : 'success'
                          }`}
                        >
                          {b.stock === 0
                            ? 'Out of Stock'
                            : b.stock <= 5
                            ? 'Low Stock Alert'
                            : 'In Stock'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => openAdjustModal(b)}
                        >
                          <Sliders size={13} /> Adjust Stock
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                      No inventory records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {data?.pagination && (
          <div className="admin-pagination-wrapper">
            <div className="admin-pagination-info">
              Showing Page <strong>{data.pagination.page}</strong> of{' '}
              <strong>{data.pagination.pages}</strong> ({data.pagination.total} titles)
            </div>
            <div className="admin-pagination-actions">
              <button
                className="admin-btn admin-btn-secondary admin-btn-sm"
                disabled={data.pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                className="admin-btn admin-btn-secondary admin-btn-sm"
                disabled={data.pagination.page >= data.pagination.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Inventory History Audit Log */}
      {data?.recentLogs && data.recentLogs.length > 0 && (
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h3 className="admin-panel-title">
                <History size={18} color="var(--admin-primary)" />
                Recent Stock Adjustment History
              </h3>
              <p className="admin-panel-subtitle">Audit trail of physical intake, manual deductions, and order fulfillments</p>
            </div>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Book Title</th>
                  <th>Adjustment</th>
                  <th>Resulting Stock</th>
                  <th>Reason</th>
                  <th>Authorized By</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLogs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ fontSize: 12, color: 'var(--admin-text-subtle)' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 600 }}>{log.bookTitle}</td>
                    <td>
                      <span
                        className={`admin-status-pill ${
                          log.changeAmount > 0 ? 'success' : 'danger'
                        }`}
                      >
                        {log.changeAmount > 0 ? `+${log.changeAmount}` : log.changeAmount}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{log.adjustedStock} units</td>
                    <td>
                      <span className="admin-status-pill neutral">{log.reason}</span>
                    </td>
                    <td style={{ fontSize: 12 }}>{log.admin?.name || 'System'}</td>
                    <td style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>
                      {log.note || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustModalBook && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                Adjust Stock: "{adjustModalBook.title}"
              </h3>
              <button
                className="admin-modal-close-btn"
                onClick={() => setAdjustModalBook(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit}>
              <div className="admin-modal-body">
                <div
                  style={{
                    padding: 14,
                    backgroundColor: 'var(--admin-bg-alt)',
                    borderRadius: 'var(--admin-radius-md)',
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 13, color: 'var(--admin-text-muted)' }}>Current Warehouse Stock:</span>
                  <span style={{ fontSize: 20, fontWeight: 800 }}>{adjustModalBook.stock} units</span>
                </div>

                {/* Add or Remove Toggle */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Adjustment Direction</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      className={`admin-btn ${adjustType === 'add' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                      style={{ flex: 1 }}
                      onClick={() => setAdjustType('add')}
                    >
                      <Plus size={15} /> Increase / Restock (+)
                    </button>
                    <button
                      type="button"
                      className={`admin-btn ${adjustType === 'remove' ? 'admin-btn-danger' : 'admin-btn-secondary'}`}
                      style={{ flex: 1 }}
                      onClick={() => setAdjustType('remove')}
                    >
                      <Minus size={15} /> Deduct / Write-Off (-)
                    </button>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Quantity to {adjustType === 'add' ? 'Add' : 'Deduct'} *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="admin-form-input"
                    style={{ width: '100%', fontSize: 16, fontWeight: 700 }}
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                  />
                  <div className="admin-form-hint">
                    Projected new stock: <strong>{Math.max(0, adjustModalBook.stock + (adjustType === 'add' ? Number(adjustmentAmount || 0) : -Number(adjustmentAmount || 0)))} units</strong>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Adjustment Reason *</label>
                  <select
                    className="admin-form-select"
                    style={{ width: '100%' }}
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                  >
                    <option value="RESTOCK">Supplier Restock Shipment Received</option>
                    <option value="MANUAL_ADJUSTMENT">Physical Inventory Audit Discrepancy</option>
                    <option value="DAMAGE_WRITE_OFF">Damaged / Water Damaged / Lost Goods</option>
                    <option value="RETURN_RESTOCK">Customer Return Restocked to Shelf</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Audit Note</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    style={{ width: '100%' }}
                    placeholder="e.g. PO #89201 from Penguin Warehouse"
                    value={adjustNote}
                    onChange={(e) => setAdjustNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setAdjustModalBook(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={adjusting}
                >
                  {adjusting ? 'Saving...' : 'Apply Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;

