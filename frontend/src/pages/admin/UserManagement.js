import React, { useState, useEffect } from 'react';
import {
  Search,
  Shield,
  UserCheck,
  UserX,
  Eye,
  RefreshCw,
} from 'lucide-react';
import api from '../../api/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
  const { user: currentAdmin, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Selected User Modal State
  const [selectedUserModal, setSelectedUserModal] = useState(null);
  const [userProfileLoading, setUserProfileLoading] = useState(false);
  const [userProfileData, setUserProfileData] = useState(null);

  // Role Edit Modal State
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('user');
  const [roleSubmitting, setRoleSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (roleFilter !== 'All') params.append('role', roleFilter);

      const res = await api.get(`/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  // Toggle User Active / Inactive
  const handleToggleStatus = async (user) => {
    if (user._id === currentAdmin?._id) {
      alert('Cannot deactivate your own active session account.');
      return;
    }
    const action = user.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} "${user.name}"'s account?`)) {
      return;
    }
    try {
      const res = await api.put(`/users/${user._id}/status`);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, isActive: res.data.data.isActive } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  // Open User Profile & Order History Modal
  const openUserProfile = async (user) => {
    setSelectedUserModal(user);
    setUserProfileLoading(true);
    try {
      const res = await api.get(`/users/${user._id}`);
      if (res.data.success) {
        setUserProfileData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
    } finally {
      setUserProfileLoading(false);
    }
  };

  // Open Role Edit Modal (Super Admin only)
  const openRoleModal = (user) => {
    if (!isSuperAdmin) {
      alert('Only the Super Admin is authorized to change staff and user roles.');
      return;
    }
    setRoleModalUser(user);
    setSelectedRole(user.role || 'user');
  };

  // Submit Role Change
  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setRoleSubmitting(true);
    try {
      const res = await api.put(`/users/${roleModalUser._id}/role`, { role: selectedRole });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === roleModalUser._id ? { ...u, role: selectedRole } : u))
        );
        setRoleModalUser(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setRoleSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <h1>User & Staff Management</h1>
          <p className="admin-view-subtitle">
            Manage registered customer accounts, view order histories, lifetime purchases, and assign role-based administrative permissions.
          </p>
        </div>
        <div className="admin-view-actions">
          <button className="admin-btn admin-btn-secondary" onClick={fetchUsers}>
            <RefreshCw size={15} /> Refresh List
          </button>
        </div>
      </div>

      {/* Users Table Panel */}
      <div className="admin-panel">
        <div className="admin-table-controls">
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260 }}>
            <div className="admin-search-wrapper" style={{ width: '100%' }}>
              <Search className="admin-search-icon" />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search users by name or email address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-secondary">
              Search
            </button>
          </form>

          <div className="admin-table-filters">
            <select
              className="admin-filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">All User Roles</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Store Admin</option>
              <option value="order_manager">Order Manager</option>
              <option value="inventory_manager">Inventory Manager</option>
              <option value="support">Customer Support</option>
              <option value="user">Standard Customer</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="admin-table-wrapper">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <LoadingSpinner text="Retrieving registered user database..." />
            </div>
          ) : (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>User Identity</th>
                  <th>Contact Info</th>
                  <th>Assigned Role</th>
                  <th>Account Status</th>
                  <th>Member Since</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u._id}>
                      {/* Name & Avatar */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 'var(--admin-radius-full)',
                              backgroundColor:
                                u.role === 'superadmin'
                                  ? '#7c3aed'
                                  : u.role === 'admin'
                                  ? '#4f46e5'
                                  : u.role === 'order_manager'
                                  ? '#059669'
                                  : u.role === 'inventory_manager'
                                  ? '#d97706'
                                  : '#3b82f6',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 14,
                            }}
                          >
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--admin-text-main)' }}>
                              {u.name}
                            </div>
                            <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--admin-text-subtle)' }}>
                              ID: {u._id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td>
                        <div style={{ fontSize: 13, color: 'var(--admin-text-main)' }}>{u.email}</div>
                        <div style={{ fontSize: 12, color: 'var(--admin-text-subtle)' }}>
                          {u.phone || 'No phone provided'}
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td>
                        <span
                          className={`admin-status-pill ${
                            u.role === 'superadmin'
                              ? 'info'
                              : u.role === 'admin'
                              ? 'success'
                              : u.role === 'order_manager' || u.role === 'inventory_manager'
                              ? 'warning'
                              : 'neutral'
                          }`}
                          style={{ textTransform: 'capitalize' }}
                        >
                          <Shield size={12} style={{ marginRight: 3 }} />
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`admin-status-pill ${u.isActive ? 'success' : 'danger'}`}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                      {/* Created At */}
                      <td style={{ fontSize: 12.5, color: 'var(--admin-text-muted)' }}>
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {/* View Profile & Spend */}
                          <button
                            className="admin-btn admin-btn-secondary admin-btn-icon"
                            title="View Customer Profile & Lifetime Purchases"
                            onClick={() => openUserProfile(u)}
                          >
                            <Eye size={14} />
                          </button>

                          {/* Role Management (Super Admin Only) */}
                          {isSuperAdmin && (
                            <button
                              className="admin-btn admin-btn-secondary admin-btn-icon"
                              title="Modify Role & Permissions"
                              onClick={() => openRoleModal(u)}
                            >
                              <Shield size={14} color="var(--admin-primary)" />
                            </button>
                          )}

                          {/* Activate / Deactivate Toggle */}
                          <button
                            className="admin-btn admin-btn-secondary admin-btn-icon"
                            style={{ color: u.isActive ? 'var(--admin-danger)' : 'var(--admin-success)' }}
                            title={u.isActive ? 'Deactivate Account' : 'Activate Account'}
                            onClick={() => handleToggleStatus(u)}
                          >
                            {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                      No registered users found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Customer Profile & Purchase History Modal */}
      {selectedUserModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container large">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                Customer Profile: {selectedUserModal.name}
              </h3>
              <button
                className="admin-modal-close-btn"
                onClick={() => setSelectedUserModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              {userProfileLoading ? (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <LoadingSpinner text="Loading customer analytics and order history..." />
                </div>
              ) : userProfileData ? (
                <div>
                  {/* Summary Cards */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 16,
                      marginBottom: 24,
                    }}
                  >
                    <div
                      style={{
                        padding: 16,
                        backgroundColor: 'var(--admin-bg-alt)',
                        borderRadius: 'var(--admin-radius-md)',
                        border: '1px solid var(--admin-border)',
                      }}
                    >
                      <div style={{ fontSize: 12, color: 'var(--admin-text-subtle)' }}>LIFETIME SPEND</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--admin-success)' }}>
                        ${userProfileData.metrics?.totalSpent?.toFixed(2) || '0.00'}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: 16,
                        backgroundColor: 'var(--admin-bg-alt)',
                        borderRadius: 'var(--admin-radius-md)',
                        border: '1px solid var(--admin-border)',
                      }}
                    >
                      <div style={{ fontSize: 12, color: 'var(--admin-text-subtle)' }}>TOTAL ORDERS</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--admin-primary)' }}>
                        {userProfileData.metrics?.totalOrders || 0}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: 16,
                        backgroundColor: 'var(--admin-bg-alt)',
                        borderRadius: 'var(--admin-radius-md)',
                        border: '1px solid var(--admin-border)',
                      }}
                    >
                      <div style={{ fontSize: 12, color: 'var(--admin-text-subtle)' }}>ACCOUNT STATUS</div>
                      <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>
                        <span className={`admin-status-pill ${selectedUserModal.isActive ? 'success' : 'danger'}`}>
                          {selectedUserModal.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Contact Card */}
                  <div
                    style={{
                      padding: 16,
                      backgroundColor: 'var(--admin-card-bg)',
                      border: '1px solid var(--admin-border)',
                      borderRadius: 'var(--admin-radius-md)',
                      marginBottom: 24,
                      fontSize: 13,
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Contact & Shipping Details</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <strong>Email:</strong> {selectedUserModal.email}
                      </div>
                      <div>
                        <strong>Phone:</strong> {selectedUserModal.phone || 'N/A'}
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <strong>Default Address:</strong>{' '}
                        {selectedUserModal.address?.street
                          ? `${selectedUserModal.address.street}, ${selectedUserModal.address.city}, ${selectedUserModal.address.state} ${selectedUserModal.address.pinCode}, ${selectedUserModal.address.country}`
                          : 'No shipping address saved yet'}
                      </div>
                    </div>
                  </div>

                  {/* Order History Table */}
                  <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                    Order History ({userProfileData.orders?.length || 0})
                  </h4>

                  <div className="admin-table-wrapper" style={{ maxHeight: 240, overflowY: 'auto' }}>
                    <table className="admin-data-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Total</th>
                          <th>Payment</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userProfileData.orders && userProfileData.orders.length > 0 ? (
                          userProfileData.orders.map((o) => (
                            <tr key={o._id}>
                              <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                #{o._id.toString().slice(-6)}
                              </td>
                              <td style={{ fontSize: 12 }}>
                                {new Date(o.createdAt).toLocaleDateString()}
                              </td>
                              <td style={{ fontWeight: 700 }}>${o.totalPrice.toFixed(2)}</td>
                              <td>
                                <span className={`admin-status-pill ${o.isPaid ? 'success' : 'warning'}`}>
                                  {o.isPaid ? 'Paid' : 'Unpaid'}
                                </span>
                              </td>
                              <td>
                                <span className="admin-status-pill info">{o.orderStatus}</span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>
                              This customer has not placed any orders yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="admin-modal-footer">
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => setSelectedUserModal(null)}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Management Modal (Super Admin Only) */}
      {roleModalUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                Modify Role for "{roleModalUser.name}"
              </h3>
              <button
                className="admin-modal-close-btn"
                onClick={() => setRoleModalUser(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRoleSubmit}>
              <div className="admin-modal-body">
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 13.5, color: 'var(--admin-text-muted)' }}>
                    Assigning administrative permissions grants access to specific modules in the Super Admin dashboard according to RBAC security rules.
                  </p>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Select Role Level</label>
                  <select
                    className="admin-form-select"
                    style={{ width: '100%' }}
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="user">Standard Customer (Store user only)</option>
                    <option value="support">Customer Support (Users & order lookup)</option>
                    <option value="inventory_manager">Inventory Manager (Books & stock control)</option>
                    <option value="order_manager">Order Manager (Order progression & delivery)</option>
                    <option value="admin">Store Admin (All modules except role assignment)</option>
                    <option value="superadmin">Super Admin (Full root access to entire system)</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setRoleModalUser(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={roleSubmitting}
                >
                  {roleSubmitting ? 'Updating...' : 'Save Role Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
