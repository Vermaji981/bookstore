import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const RolesPermissions = () => {
  const { user, isSuperAdmin } = useAuth();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // New staff form
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    phone: '',
  });

  useEffect(() => {
    fetchTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showNotification = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 5000);
  };

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/team');
      if (res.data?.success) {
        setTeam(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching admin team:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      showNotification('error', 'Initial password must be at least 6 characters');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/admin/team', form);
      if (res.data?.success) {
        showNotification('success', `Staff member "${form.name}" created with role "${form.role}"`);
        setShowAddModal(false);
        setForm({ name: '', email: '', password: '', role: 'admin', phone: '' });
        fetchTeam();
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to create staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (memberId, memberName, newRole) => {
    if (!window.confirm(`Are you sure you want to change ${memberName}'s role to "${newRole}"?`)) {
      return;
    }

    try {
      const res = await api.put(`/users/${memberId}/role`, { role: newRole });
      if (res.data?.success) {
        showNotification('success', `Role for ${memberName} updated to ${newRole}`);
        fetchTeam();
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to update role');
    }
  };

  // RBAC Permission Matrix Definition
  const permissionMatrix = [
    { module: 'Dashboard Overview & KPIs', superadmin: true, admin: true, order_manager: true, inventory_manager: true, support: true },
    { module: 'Manage Books & Inventory', superadmin: true, admin: true, order_manager: false, inventory_manager: true, support: false },
    { module: 'Stock Adjustments (+/-)', superadmin: true, admin: true, order_manager: false, inventory_manager: true, support: false },
    { module: 'Category Management', superadmin: true, admin: true, order_manager: false, inventory_manager: true, support: false },
    { module: 'Order Fulfillment & Tracking', superadmin: true, admin: true, order_manager: true, inventory_manager: false, support: true },
    { module: 'Process Refunds', superadmin: true, admin: true, order_manager: true, inventory_manager: false, support: false },
    { module: 'Payment Transactions View', superadmin: true, admin: true, order_manager: false, inventory_manager: false, support: false },
    { module: 'Customer Management & Spend', superadmin: true, admin: true, order_manager: false, inventory_manager: false, support: true },
    { module: 'Discounts & Coupons', superadmin: true, admin: true, order_manager: false, inventory_manager: false, support: false },
    { module: 'Customer Reviews Moderation', superadmin: true, admin: true, order_manager: false, inventory_manager: false, support: true },
    { module: 'CMS Banners & Content', superadmin: true, admin: true, order_manager: false, inventory_manager: false, support: false },
    { module: 'Sales & Revenue Analytics', superadmin: true, admin: true, order_manager: false, inventory_manager: false, support: false },
    { module: 'Security Audit Logs', superadmin: true, admin: false, order_manager: false, inventory_manager: false, support: false },
    { module: 'Create & Manage Admin Roles', superadmin: true, admin: false, order_manager: false, inventory_manager: false, support: false },
    { module: 'System Settings & Config', superadmin: true, admin: false, order_manager: false, inventory_manager: false, support: false },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Role-Based Access Control (RBAC) & Team</h2>
          <p>Enforce strict least-privilege security policies across administrative roles and staff credentials</p>
        </div>
        {isSuperAdmin && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            ➕ Provision Staff Member
          </button>
        )}
      </div>

      {msg.text && (
        <div className={`alert-banner ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          <span>{msg.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{msg.text}</span>
        </div>
      )}

      {/* Role Explanation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="admin-card" style={{ borderLeft: '4px solid #7c3aed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.2rem' }}>👑</span>
            <strong style={{ fontSize: '0.95rem' }}>Super Admin</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
            Unrestricted access to all modules, financial metrics, RBAC management, settings, and audit trails.
          </p>
        </div>

        <div className="admin-card" style={{ borderLeft: '4px solid #4f46e5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.2rem' }}>🛠️</span>
            <strong style={{ fontSize: '0.95rem' }}>Store Admin</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
            Manages catalog, categories, inventory, orders, payments, coupons, content, and reviews.
          </p>
        </div>

        <div className="admin-card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.2rem' }}>📦</span>
            <strong style={{ fontSize: '0.95rem' }}>Order Manager</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
            Dedicated order pipeline control: confirms shipments, updates progression, processes refunds.
          </p>
        </div>

        <div className="admin-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.2rem' }}>📊</span>
            <strong style={{ fontSize: '0.95rem' }}>Inventory Manager</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
            Maintains books catalog, restocks depleted items, adjusts quantities with audit justifications.
          </p>
        </div>

        <div className="admin-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.2rem' }}>🎧</span>
            <strong style={{ fontSize: '0.95rem' }}>Support Specialist</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
            Reviews customer order histories, monitors customer feedback, and moderates ratings.
          </p>
        </div>
      </div>

      {/* Staff Roster */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
            👥 Administrative Staff & Role Assignments ({team.length})
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
            {isSuperAdmin ? '⚡ Super Admin privileges active' : '🔒 Read-only view for standard staff'}
          </span>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Account Status</th>
                <th>Member Since</th>
                {isSuperAdmin && <th>Modify Role</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                    <div className="admin-loading-spinner" style={{ margin: '0 auto 10px' }}></div>
                    Loading staff roster...
                  </td>
                </tr>
              ) : team.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--admin-text-muted)' }}>
                    No administrative team members found.
                  </td>
                </tr>
              ) : (
                team.map((member) => (
                  <tr key={member._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: member.role === 'superadmin' ? '#7c3aed' : 'var(--admin-primary)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{member.name}</strong>
                          {member._id === user?._id && (
                            <span className="badge badge-primary" style={{ marginLeft: '6px', fontSize: '0.68rem' }}>
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{member.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          member.role === 'superadmin'
                            ? 'badge-purple'
                            : member.role === 'admin'
                            ? 'badge-primary'
                            : member.role === 'order_manager'
                            ? 'badge-secondary'
                            : member.role === 'inventory_manager'
                            ? 'badge-success'
                            : 'badge-warning'
                        }`}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {member.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${member.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                        {member.isActive !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                    {isSuperAdmin && (
                      <td>
                        {member._id === user?._id ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                            Current User
                          </span>
                        ) : (
                          <select
                            className="admin-select"
                            value={member.role}
                            onChange={(e) => handleRoleChange(member._id, member.name, e.target.value)}
                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                          >
                            <option value="superadmin">Super Admin</option>
                            <option value="admin">Store Admin</option>
                            <option value="order_manager">Order Manager</option>
                            <option value="inventory_manager">Inventory Manager</option>
                            <option value="support">Customer Support</option>
                            <option value="user">Demote to Shopper</option>
                          </select>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Permission Matrix */}
      <div className="admin-card">
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>
          🛡️ Role Permission Access Matrix
        </h3>
        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
          This matrix represents backend authorization checks executed on every protected route.
        </p>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>System Capability / Module</th>
                <th style={{ textAlign: 'center' }}>Super Admin</th>
                <th style={{ textAlign: 'center' }}>Store Admin</th>
                <th style={{ textAlign: 'center' }}>Order Manager</th>
                <th style={{ textAlign: 'center' }}>Inventory Mgr</th>
                <th style={{ textAlign: 'center' }}>Customer Support</th>
              </tr>
            </thead>
            <tbody>
              {permissionMatrix.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.module}</strong></td>
                  <td style={{ textAlign: 'center' }}>{item.superadmin ? '✅ Full' : '❌'}</td>
                  <td style={{ textAlign: 'center' }}>{item.admin ? '✅ Allowed' : '❌'}</td>
                  <td style={{ textAlign: 'center' }}>{item.order_manager ? '✅ Allowed' : '❌'}</td>
                  <td style={{ textAlign: 'center' }}>{item.inventory_manager ? '✅ Allowed' : '❌'}</td>
                  <td style={{ textAlign: 'center' }}>{item.support ? '✅ Allowed' : '❌'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Provision Administrative Staff Member</h3>
              <button className="admin-modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateStaff}>
              <div className="admin-modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Alex Morgan"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Work Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="alex@bookstore.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Temporary Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Administrative Role</label>
                  <select
                    className="form-control"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="admin">Store Admin (Books, Orders, Users, CMS)</option>
                    <option value="order_manager">Order Manager (Fulfillment & Tracking)</option>
                    <option value="inventory_manager">Inventory Manager (Stock & Books)</option>
                    <option value="support">Customer Support (User Activity & Reviews)</option>
                    <option value="superadmin">Super Admin (Unrestricted Full Access)</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Staff Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissions;
