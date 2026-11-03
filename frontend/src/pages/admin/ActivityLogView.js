import React, { useState, useEffect } from 'react';
import api from '../../api/api';

const ActivityLogView = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalLogs, setTotalLogs] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [moduleFilter, setModuleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState(null); // For modal diff viewer

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, moduleFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 20,
      });
      if (moduleFilter) params.append('module', moduleFilter);
      if (search) params.append('search', search);

      const res = await api.get(`/admin/activity-logs?${params.toString()}`);
      if (res.data?.success) {
        setLogs(res.data.data || []);
        setTotalLogs(res.data.count || 0);
        setPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getActionBadgeClass = (action) => {
    if (!action) return 'badge-secondary';
    const act = action.toUpperCase();
    if (act.includes('DELETE') || act.includes('DEACTIVATE') || act.includes('CANCEL')) return 'badge-danger';
    if (act.includes('CREATE') || act.includes('ADD') || act.includes('ACTIVATE') || act.includes('CONFIRM')) return 'badge-success';
    if (act.includes('UPDATE') || act.includes('CHANGE') || act.includes('ADJUST')) return 'badge-primary';
    if (act.includes('REFUND') || act.includes('RETURN')) return 'badge-warning';
    return 'badge-purple';
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Security Audit & Activity Trail</h2>
          <p>Immutable record of all administrative operations, inventory updates, role alterations, and financial actions</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={fetchLogs}>
            🔄 Refresh Trail
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search actions, details, admin names..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <select
          className="admin-select"
          value={moduleFilter}
          onChange={(e) => {
            setModuleFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Security Modules</option>
          <option value="books">Books & Catalog</option>
          <option value="inventory">Inventory & Stock</option>
          <option value="orders">Orders & Fulfillment</option>
          <option value="users">User Access & Accounts</option>
          <option value="payments">Payments & Gateways</option>
          <option value="coupons">Discount Coupons</option>
          <option value="categories">Categories</option>
          <option value="reviews">Product Reviews</option>
          <option value="settings">Site Configurations</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Administrator</th>
              <th>Action</th>
              <th>Module</th>
              <th>Action Description</th>
              <th>Client IP</th>
              <th>Audit Payload</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="admin-loading-spinner" style={{ margin: '0 auto 12px' }}></div>
                  <p>Loading security audit records from database...</p>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)' }}>
                  No security audit records found matching your filter criteria.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const hasPayload = (log.previousValue && Object.keys(log.previousValue).length > 0) ||
                                   (log.updatedValue && Object.keys(log.updatedValue).length > 0);
                return (
                  <tr key={log._id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: 'var(--admin-primary)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {(log.adminName || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.85rem', display: 'block' }}>{log.adminName || 'Admin'}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                            {log.adminEmail || ''}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-secondary" style={{ textTransform: 'capitalize' }}>
                        {log.module}
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px', fontSize: '0.85rem' }}>
                      {log.details || '—'}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}>
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td>
                      {hasPayload ? (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          🔍 View Diff
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>No state change</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="admin-pagination">
          <button
            className="pagination-btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            ← Previous
          </button>
          <span>
            Page {page} of {pages} ({totalLogs} events logged)
          </span>
          <button
            className="pagination-btn"
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(p + 1, pages))}
          >
            Next →
          </button>
        </div>
      )}

      {/* Audit Diff Modal */}
      {selectedLog && (
        <div className="admin-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div
            className="admin-modal"
            style={{ maxWidth: '700px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h3>Audit Inspection: {selectedLog.action}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                  Target: {selectedLog.targetModel || 'Object'} #{selectedLog.targetId || 'N/A'} • {new Date(selectedLog.createdAt).toLocaleString()}
                </span>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedLog(null)}>
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>Action Summary</strong>
                <p style={{ margin: 0, fontSize: '0.88rem', background: 'var(--admin-hover)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                  {selectedLog.details}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.88rem', color: 'var(--admin-danger)' }}>
                    ⬅ Previous State
                  </h4>
                  <pre
                    style={{
                      background: 'var(--admin-bg)',
                      border: '1px solid var(--admin-border)',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      maxHeight: '260px',
                      overflowY: 'auto',
                    }}
                  >
                    {selectedLog.previousValue && Object.keys(selectedLog.previousValue).length > 0
                      ? JSON.stringify(selectedLog.previousValue, null, 2)
                      : '// No previous value captured'}
                  </pre>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.88rem', color: 'var(--admin-success)' }}>
                    ➡ Updated State
                  </h4>
                  <pre
                    style={{
                      background: 'var(--admin-bg)',
                      border: '1px solid var(--admin-border)',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      maxHeight: '260px',
                      overflowY: 'auto',
                    }}
                  >
                    {selectedLog.updatedValue && Object.keys(selectedLog.updatedValue).length > 0
                      ? JSON.stringify(selectedLog.updatedValue, null, 2)
                      : '// No updated value captured'}
                  </pre>
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                <div><strong>Admin:</strong> {selectedLog.adminName}</div>
                <div><strong>Role:</strong> {selectedLog.adminEmail}</div>
                <div><strong>IP:</strong> {selectedLog.ipAddress}</div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedLog(null)}>
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogView;
