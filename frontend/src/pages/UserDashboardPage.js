import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  User,
  Package,
  Heart,
  Lock,
  LogOut,
  Award,
  Bell,
  Copy,
  Check,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BookCard from '../components/common/BookCard';
import api from '../api/api';

const UserDashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { user, logout, updateProfile, changePassword } = useAuth();
  const { wishlist } = useWishlist();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pinCode: user?.address?.pinCode || '',
  });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form state
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Rewards & Loyalty state
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Returns state
  const [myReturns, setMyReturns] = useState([]);
  const [returnsLoading, setReturnsLoading] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [returnForm, setReturnForm] = useState({
    bookId: '',
    type: 'Return',
    reason: 'Damaged during shipping',
    condition: 'Damaged / Defective',
    customerComments: '',
  });
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  // Notification Preferences state
  const [preferences, setPreferences] = useState({
    orderUpdates: true,
    promotions: true,
    priceDrops: true,
    newsletter: false,
  });
  const [prefLoading, setPrefLoading] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'rewards') fetchLoyalty();
    if (activeTab === 'returns') {
      fetchOrders();
      fetchReturns();
    }
  }, [activeTab]);

  const fetchOrders = () => {
    setLoadingOrders(true);
    api
      .get('/orders/myorders')
      .then((res) => {
        if (res.data.success) {
          setOrders(res.data.data);
        }
        setLoadingOrders(false);
      })
      .catch((err) => {
        console.error('Failed to load orders', err);
        setLoadingOrders(false);
      });
  };

  const fetchLoyalty = () => {
    setLoyaltyLoading(true);
    api
      .get('/loyalty/me')
      .then((res) => {
        if (res.data.success) {
          setLoyaltyData(res.data.data);
        }
        setLoyaltyLoading(false);
      })
      .catch(() => setLoyaltyLoading(false));
  };

  const fetchReturns = () => {
    setReturnsLoading(true);
    api
      .get('/returns/my')
      .then((res) => {
        if (res.data.success) {
          setMyReturns(res.data.data);
        }
        setReturnsLoading(false);
      })
      .catch(() => setReturnsLoading(false));
  };

  const handleCopyReferral = () => {
    if (!loyaltyData?.referralLink) return;
    navigator.clipboard.writeText(loyaltyData.referralLink);
    setCopiedLink(true);
    showToast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await api.put(`/orders/${orderId}/cancel`);
      if (res.data.success) {
        showToast('Order cancelled successfully', 'info');
        fetchOrders();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not cancel order', 'error');
    }
  };

  const handleOpenReturnModal = (order) => {
    setSelectedOrderForReturn(order);
    setReturnForm({
      bookId: order.orderItems[0]?.book || '',
      type: 'Return',
      reason: 'Damaged during shipping',
      condition: 'Damaged / Defective',
      customerComments: '',
    });
    setShowReturnModal(true);
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!selectedOrderForReturn || !returnForm.bookId) return;

    setReturnSubmitting(true);
    try {
      const payload = {
        orderId: selectedOrderForReturn._id,
        items: [
          {
            book: returnForm.bookId,
            qty: 1,
            reason: returnForm.reason,
            condition: returnForm.condition,
          },
        ],
        type: returnForm.type,
        reason: returnForm.reason,
        customerComments: returnForm.customerComments,
      };

      const res = await api.post('/returns/request', payload);
      if (res.data.success) {
        showToast('Return request submitted! Admin team will review within 24 hours.', 'success');
        setShowReturnModal(false);
        fetchReturns();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit return request', 'error');
    } finally {
      setReturnSubmitting(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg('');
    try {
      await updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        address: {
          street: profileData.street,
          city: profileData.city,
          state: profileData.state,
          pinCode: profileData.pinCode,
        },
      });
      setProfileMsg('Profile information updated successfully!');
      showToast('Profile updated!', 'success');
    } catch (err) {
      setProfileMsg('Failed to update profile: ' + err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMsg('');
    setPasswordError('');
    try {
      await changePassword(passwords.currentPassword, passwords.newPassword);
      setPasswordMsg('Password changed successfully!');
      showToast('Password changed successfully!', 'success');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setPrefLoading(true);
    try {
      await api.put('/notifications/customer/preferences', preferences);
      showToast('Notification preferences saved!', 'success');
    } catch (err) {
      showToast('Failed to save preferences', 'error');
    } finally {
      setPrefLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="section animate-fade-in dashboard-page-section">
      <div className="container">
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 className="title-lg font-serif">My Account & Portal</h1>
          <p className="dashboard-welcome-text">
            Welcome back, <strong>{user?.name}</strong>! Manage your orders, rewards, and personal details.
          </p>
        </div>

        <div className="dashboard-layout-grid">
          {/* Navigation Sidebar */}
          <aside className="dashboard-sidebar-card">
            {/* User Avatar Mini Banner */}
            <div className="dashboard-user-banner">
              <div className="dashboard-avatar-circle">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="dashboard-user-info">
                <h4 className="dashboard-user-name">
                  {user?.name}
                </h4>
                <span className="badge badge-primary dashboard-role-badge">
                  {user?.role === 'superadmin' ? '👑 Super Admin' : user?.role === 'admin' ? '🛡️ Admin' : 'Verified Reader'}
                </span>
              </div>
            </div>

            {/* Tab Links */}
            <div className="dashboard-nav-group">
              <button
                type="button"
                onClick={() => switchTab('profile')}
                className={`dashboard-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              >
                <User size={18} />
                <span>Profile & Details</span>
              </button>

              <button
                type="button"
                onClick={() => switchTab('orders')}
                className={`dashboard-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              >
                <Package size={18} />
                <span>My Orders</span>
              </button>

              <button
                type="button"
                onClick={() => switchTab('rewards')}
                className={`dashboard-nav-item ${activeTab === 'rewards' ? 'active' : ''}`}
              >
                <Award size={18} color="#f59e0b" />
                <span>Rewards & Referrals</span>
              </button>

              <button
                type="button"
                onClick={() => switchTab('returns')}
                className={`dashboard-nav-item ${activeTab === 'returns' ? 'active' : ''}`}
              >
                <RotateCcw size={18} />
                <span>Returns & Refunds</span>
              </button>

              <button
                type="button"
                onClick={() => switchTab('wishlist')}
                className={`dashboard-nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
              >
                <Heart size={18} />
                <span>Saved Wishlist ({wishlist.length})</span>
              </button>

              <button
                type="button"
                onClick={() => switchTab('preferences')}
                className={`dashboard-nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
              >
                <Bell size={18} />
                <span>Notifications</span>
              </button>

              <button
                type="button"
                onClick={() => switchTab('security')}
                className={`dashboard-nav-item ${activeTab === 'security' ? 'active' : ''}`}
              >
                <Lock size={18} />
                <span>Password & Security</span>
              </button>

              <div className="dashboard-nav-divider" />

              <button
                type="button"
                onClick={logout}
                className="dashboard-nav-item danger"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="dashboard-main-content">
            {/* Tab: Profile */}
            {activeTab === 'profile' && (
              <div className="dashboard-main-card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
                  Personal Information
                </h3>

                {profileMsg && (
                  <div
                    style={{
                      padding: '0.85rem 1.25rem',
                      backgroundColor: profileMsg.includes('Failed') ? '#fee2e2' : '#d1fae5',
                      color: profileMsg.includes('Failed') ? '#991b1b' : '#065f46',
                      borderRadius: '10px',
                      marginBottom: '1.5rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    {profileMsg}
                  </div>
                )}

                <form onSubmit={handleProfileSubmit}>
                  <div className="form-row-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address (Read-only)</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="form-input"
                        style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>

                  <div className="form-row-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="text"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+1 555-019-2834"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Street Address</label>
                      <input
                        type="text"
                        value={profileData.street}
                        onChange={(e) => setProfileData({ ...profileData, street: e.target.value })}
                        placeholder="123 Haven Ave, Apt 4"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-row-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        value={profileData.city}
                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                        placeholder="New York"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        value={profileData.state}
                        onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                        placeholder="NY"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">ZIP Code</label>
                      <input
                        type="text"
                        value={profileData.pinCode}
                        onChange={(e) => setProfileData({ ...profileData, pinCode: e.target.value })}
                        placeholder="10001"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 2rem' }}
                  >
                    {profileLoading ? 'Saving...' : 'Update Profile'}
                  </button>
                </form>
              </div>
            )}

            {/* Tab: Orders */}
            {activeTab === 'orders' && (
              <div className="dashboard-main-card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
                  My Orders History ({orders.length})
                </h3>

                {loadingOrders ? (
                  <LoadingSpinner text="Loading orders..." />
                ) : orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                    <Package size={44} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
                    <p style={{ fontWeight: 600, fontSize: '1.05rem', color: '#0f172a' }}>No orders yet</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: '1.5rem' }}>
                      You haven't placed any book orders yet.
                    </p>
                    <Link to="/books" className="btn btn-primary btn-sm">
                      Browse Books
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {orders.map((ord) => (
                      <div
                        key={ord._id}
                        style={{
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0',
                          padding: '1.5rem',
                          backgroundColor: '#fcfdfe',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '1rem',
                            paddingBottom: '1rem',
                            borderBottom: '1px solid #f1f5f9',
                            marginBottom: '1rem',
                          }}
                        >
                          <div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
                              Order ID
                            </span>
                            <p style={{ fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                              #{ord._id}
                            </p>
                          </div>

                          <div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
                              Date Placed
                            </span>
                            <p style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
                              Status
                            </span>
                            <p>
                              <span
                                className={`badge ${
                                  ord.orderStatus === 'Delivered'
                                    ? 'badge-success'
                                    : ord.orderStatus === 'Cancelled'
                                    ? 'badge-danger'
                                    : 'badge-primary'
                                }`}
                              >
                                {ord.orderStatus}
                              </span>
                            </p>
                          </div>

                          <div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
                              Total Paid
                            </span>
                            <p style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>
                              ${Number(ord.totalPrice).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                          {ord.orderItems?.map((item, idx) => (
                            <div
                              key={idx}
                              style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                            >
                              <img
                                src={item.image}
                                alt={item.title}
                                style={{ width: '48px', height: '68px', objectFit: 'cover', borderRadius: '4px' }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                                  {item.title}
                                </p>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                  Qty: {item.qty} {item.format && `• Format: ${item.format}`} • ${Number(item.price).toFixed(2)} each
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Shipping Timeline & Tracking */}
                        {ord.trackingNumber && (
                          <div
                            style={{
                              marginTop: '1rem',
                              padding: '0.75rem 1rem',
                              backgroundColor: '#f8fafc',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.85rem',
                              color: '#475569',
                              flexWrap: 'wrap',
                              gap: '0.5rem',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Truck size={16} color="var(--primary)" />
                              <span>Carrier: <strong>{ord.carrier || 'FedEx Express'}</strong> • Tracking: <code>{ord.trackingNumber}</code></span>
                            </div>
                            <Link to={`/order-tracking/${ord._id}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                              View Live Timeline →
                            </Link>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.75rem',
                            marginTop: '1.25rem',
                            justifyContent: 'flex-end',
                            flexWrap: 'wrap',
                          }}
                        >
                          {ord.orderStatus === 'Delivered' && (
                            <button
                              type="button"
                              onClick={() => handleOpenReturnModal(ord)}
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                              <RotateCcw size={14} />
                              <span>Request Return / Replacement</span>
                            </button>
                          )}

                          {['Pending', 'Confirmed'].includes(ord.orderStatus) && (
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(ord._id)}
                              className="btn btn-danger btn-sm"
                            >
                              Cancel Order
                            </button>
                          )}
                          <Link to={`/order-success/${ord._id}`} className="btn btn-secondary btn-sm">
                            View Invoice
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Rewards & Referrals */}
            {activeTab === 'rewards' && (
              <div className="dashboard-main-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      Loyalty Rewards & Referral Program
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                      Earn points with every purchase and invite friends to earn bonus credits.
                    </p>
                  </div>
                  {loyaltyData && (
                    <div
                      style={{
                        padding: '6px 14px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: 'white',
                        borderRadius: '20px',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        boxShadow: '0 4px 10px rgba(217, 119, 6, 0.3)',
                      }}
                    >
                      ⭐ {loyaltyData.tier} Member
                    </div>
                  )}
                </div>

                {loyaltyLoading ? (
                  <LoadingSpinner text="Loading rewards..." />
                ) : (
                  <div>
                    {/* Points Summary Card */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem',
                      }}
                    >
                      <div
                        style={{
                          padding: '1.5rem',
                          background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                          borderRadius: '16px',
                          border: '1px solid #c7d2fe',
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase' }}>
                          Available Points
                        </span>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1e1b4b', margin: '0.25rem 0' }}>
                          {loyaltyData?.points || 0}
                        </h2>
                        <span style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: 600 }}>
                          = ${((loyaltyData?.points || 0) * 0.05).toFixed(2)} USD Credit
                        </span>
                      </div>

                      <div
                        style={{
                          padding: '1.5rem',
                          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                          borderRadius: '16px',
                          border: '1px solid #bbf7d0',
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>
                          Friends Invited
                        </span>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#14532d', margin: '0.25rem 0' }}>
                          {loyaltyData?.friendsInvited || 0}
                        </h2>
                        <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>
                          +200 pts per referred order
                        </span>
                      </div>

                      <div
                        style={{
                          padding: '1.5rem',
                          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                          borderRadius: '16px',
                          border: '1px solid #fde68a',
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>
                          Current Tier Perks
                        </span>
                        <p style={{ fontSize: '0.88rem', color: '#78350f', fontWeight: 600, marginTop: '0.5rem', lineHeight: 1.4 }}>
                          {loyaltyData?.tierPerks || '1x Points on all purchases'}
                        </p>
                      </div>
                    </div>

                    {/* Referral Link Card */}
                    <div
                      style={{
                        padding: '1.5rem',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        marginBottom: '2rem',
                      }}
                    >
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                        Share Your Personal Referral Link
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                        Give your friends a <strong>10% welcome coupon</strong>. When they complete their first purchase, you automatically receive <strong>200 loyalty points</strong> ($10 value)!
                      </p>

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <input
                          type="text"
                          readOnly
                          value={loyaltyData?.referralLink || `${window.location.origin}/signup?ref=${loyaltyData?.referralCode || 'READMORE'}`}
                          className="form-input"
                          style={{ flex: 1, minWidth: '220px', backgroundColor: '#f8fafc', fontSize: '0.88rem' }}
                        />
                        <button
                          type="button"
                          onClick={handleCopyReferral}
                          className="btn btn-primary"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem' }}
                        >
                          {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                          <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Points Transaction Audit History */}
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                        Points Activity History
                      </h4>

                      {loyaltyData?.history?.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No point transactions yet. Points will accumulate when you order books!</p>
                      ) : (
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                            <thead>
                              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '10px 14px', textAlign: 'left', color: '#475569' }}>Date</th>
                                <th style={{ padding: '10px 14px', textAlign: 'left', color: '#475569' }}>Description</th>
                                <th style={{ padding: '10px 14px', textAlign: 'right', color: '#475569' }}>Points</th>
                              </tr>
                            </thead>
                            <tbody>
                              {loyaltyData?.history?.map((tx) => (
                                <tr key={tx._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '10px 14px', color: '#64748b' }}>
                                    {new Date(tx.createdAt).toLocaleDateString()}
                                  </td>
                                  <td style={{ padding: '10px 14px', color: '#1e293b' }}>
                                    {tx.description}
                                  </td>
                                  <td
                                    style={{
                                      padding: '10px 14px',
                                      textAlign: 'right',
                                      fontWeight: 700,
                                      color: tx.points > 0 ? '#10b981' : '#ef4444',
                                    }}
                                  >
                                    {tx.points > 0 ? `+${tx.points}` : tx.points}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Returns & Replacement */}
            {activeTab === 'returns' && (
              <div className="dashboard-main-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      Returns & Replacements Portal
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                      All items can be returned or replaced within 14 days of delivery.
                    </p>
                  </div>
                </div>

                {/* Active Return Requests */}
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                  Submitted Requests ({myReturns.length})
                </h4>

                {returnsLoading ? (
                  <LoadingSpinner text="Checking returns..." />
                ) : myReturns.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '2rem' }}>
                    <RotateCcw size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto' }} />
                    <p style={{ fontWeight: 600, color: '#0f172a' }}>No return requests found</p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                      If any received books are damaged or incorrect, you can request a return from your delivered orders below.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    {myReturns.map((ret) => (
                      <div
                        key={ret._id}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '1.25rem',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <span style={{ fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                              Return #{ret._id.slice(-6).toUpperCase()}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '0.75rem' }}>
                              Type: <strong>{ret.type}</strong> • Requested: {new Date(ret.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span
                            className={`badge ${
                              ret.status === 'refunded' || ret.status === 'replacement_sent'
                                ? 'badge-success'
                                : ret.status === 'rejected'
                                ? 'badge-danger'
                                : 'badge-primary'
                            }`}
                          >
                            {ret.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                          <strong>Reason:</strong> {ret.reason} {ret.customerComments && `— "${ret.customerComments}"`}
                        </p>
                        {ret.pickupDate && (
                          <p style={{ fontSize: '0.85rem', color: '#0284c7', marginTop: '0.25rem' }}>
                            🚚 <strong>Scheduled Courier Pickup:</strong> {new Date(ret.pickupDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Delivered Orders Eligible for Return */}
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                  Delivered Orders Eligible for Return
                </h4>
                {orders.filter((o) => o.orderStatus === 'Delivered').length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>No delivered orders eligible for return at this time.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {orders
                      .filter((o) => o.orderStatus === 'Delivered')
                      .map((ord) => (
                        <div
                          key={ord._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            backgroundColor: '#f8fafc',
                            flexWrap: 'wrap',
                            gap: '0.75rem',
                          }}
                        >
                          <div>
                            <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>Order #{ord._id}</strong>
                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              Delivered on {new Date(ord.createdAt).toLocaleDateString()} • {ord.orderItems?.length} items • ${Number(ord.totalPrice).toFixed(2)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenReturnModal(ord)}
                            className="btn btn-primary btn-sm"
                          >
                            Request Return / Replacement
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Saved Wishlist */}
            {activeTab === 'wishlist' && (
              <div className="dashboard-main-card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
                  Saved Books in Wishlist ({wishlist.length})
                </h3>

                {wishlist.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                    <Heart size={44} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
                    <p style={{ fontWeight: 600, fontSize: '1.05rem', color: '#0f172a' }}>
                      Your wishlist is empty
                    </p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: '1.5rem' }}>
                      Click the heart icon on any book card to save it for later!
                    </p>
                    <Link to="/books" className="btn btn-primary btn-sm">
                      Explore Catalog
                    </Link>
                  </div>
                ) : (
                  <div className="dashboard-wishlist-grid">
                    {wishlist.map((book) => (
                      <BookCard key={book._id} book={book} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Notification Preferences */}
            {activeTab === 'preferences' && (
              <div className="dashboard-main-card" style={{ maxWidth: '600px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Notification Preferences
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Customize the alerts and updates you receive on PageHaven.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem', color: '#0f172a' }}>Order Status Updates</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Receive instant in-app alerts when your orders ship and arrive</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.orderUpdates}
                      onChange={(e) => setPreferences({ ...preferences, orderUpdates: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                    />
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem', color: '#0f172a' }}>Price Drop & Restock Alerts</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Get notified when your saved books go on discount</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.priceDrops}
                      onChange={(e) => setPreferences({ ...preferences, priceDrops: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                    />
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem', color: '#0f172a' }}>Loyalty Points & Referral Bonuses</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Notifications when friends use your invite code and points credit</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.promotions}
                      onChange={(e) => setPreferences({ ...preferences, promotions: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    disabled={prefLoading}
                    className="btn btn-primary"
                    style={{ marginTop: '1rem', alignSelf: 'flex-start' }}
                  >
                    {prefLoading ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Security */}
            {activeTab === 'security' && (
              <div className="dashboard-main-card" style={{ maxWidth: '520px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
                  Change Account Password
                </h3>

                {passwordMsg && (
                  <div
                    style={{
                      padding: '0.85rem 1.25rem',
                      backgroundColor: '#d1fae5',
                      color: '#065f46',
                      borderRadius: '10px',
                      marginBottom: '1.5rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    {passwordMsg}
                  </div>
                )}

                {passwordError && (
                  <div
                    style={{
                      padding: '0.85rem 1.25rem',
                      backgroundColor: '#fee2e2',
                      color: '#991b1b',
                      borderRadius: '10px',
                      marginBottom: '1.5rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    {passwordError}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit}>
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                      required
                      placeholder="••••••••"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      required
                      placeholder="••••••••"
                      minLength={6}
                      className="form-input"
                    />
                    <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                      Must be at least 6 characters long
                    </small>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 2rem' }}
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Return Request Modal */}
      {showReturnModal && selectedOrderForReturn && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              width: '540px',
              maxWidth: '95vw',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Request Return or Replacement
              </h3>
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReturn}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Select Book</label>
                <select
                  value={returnForm.bookId}
                  onChange={(e) => setReturnForm({ ...returnForm, bookId: e.target.value })}
                  className="form-input"
                  required
                >
                  {selectedOrderForReturn.orderItems?.map((item) => (
                    <option key={item.book} value={item.book}>
                      {item.title} (${Number(item.price).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Resolution Request</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="returnType"
                      value="Return"
                      checked={returnForm.type === 'Return'}
                      onChange={(e) => setReturnForm({ ...returnForm, type: e.target.value })}
                    />
                    <span>Full Refund (Return)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="returnType"
                      value="Replacement"
                      checked={returnForm.type === 'Replacement'}
                      onChange={(e) => setReturnForm({ ...returnForm, type: e.target.value })}
                    />
                    <span>Replacement Copy</span>
                  </label>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Reason for Return</label>
                <select
                  value={returnForm.reason}
                  onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                  className="form-input"
                >
                  <option value="Damaged during shipping">Damaged during shipping</option>
                  <option value="Print or binding defect">Print or binding defect (missing pages)</option>
                  <option value="Incorrect title delivered">Incorrect title delivered</option>
                  <option value="Quality not as expected">Quality not as expected</option>
                  <option value="No longer needed">No longer needed</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Additional Comments / Description</label>
                <textarea
                  value={returnForm.customerComments}
                  onChange={(e) => setReturnForm({ ...returnForm, customerComments: e.target.value })}
                  rows="3"
                  placeholder="Describe the issue with the book..."
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={returnSubmitting}
                  className="btn btn-primary btn-sm"
                >
                  {returnSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboardPage;
