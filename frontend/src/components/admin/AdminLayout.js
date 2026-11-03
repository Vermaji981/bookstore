import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useAdminTheme } from '../../context/AdminThemeContext';

const AdminLayout = ({ activeTab, setActiveTab, children }) => {
  const { user, logout, hasPermission, isSuperAdmin } = useAuth();
  const { theme, toggleTheme } = useAdminTheme();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread notifications count & latest notifications
  const fetchNotificationSummary = async () => {
    try {
      if (!user) return;
      const res = await api.get('/admin/notifications?limit=5');
      if (res.data?.success) {
        setRecentNotifications(res.data.data || []);
        setUnreadNotifCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notification summary:', err);
    }
  };

  useEffect(() => {
    fetchNotificationSummary();
    const interval = setInterval(fetchNotificationSummary, 45000); // refresh every 45s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    const q = globalSearch.toLowerCase();
    if (q.includes('order')) setActiveTab('orders');
    else if (q.includes('return')) setActiveTab('returns');
    else if (q.includes('gift')) setActiveTab('giftcards');
    else if (q.includes('loyalty') || q.includes('reward')) setActiveTab('loyalty');
    else if (q.includes('author') || q.includes('publisher')) setActiveTab('authors');
    else if (q.includes('book') || q.includes('title')) setActiveTab('books');
    else if (q.includes('user') || q.includes('customer')) setActiveTab('users');
    else if (q.includes('coupon') || q.includes('discount')) setActiveTab('coupons');
    else if (q.includes('stock') || q.includes('inventor')) setActiveTab('inventory');
    else if (q.includes('pay') || q.includes('stripe')) setActiveTab('payments');
    else if (q.includes('review') || q.includes('rating')) setActiveTab('reviews');
    else if (q.includes('setting')) setActiveTab('settings');
    else {
      // Default to books catalog search
      setActiveTab('books');
    }
    setGlobalSearch('');
  };

  const handleNavClick = (tabKey) => {
    setActiveTab(tabKey);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation Items with RBAC permissions
  const navSections = [
    {
      group: 'MAIN DASHBOARD',
      items: [
        { key: 'overview', label: 'Overview & KPIs', icon: '📊', perm: 'overview' },
        { key: 'analytics', label: 'Sales & Revenue', icon: '📈', perm: 'analytics' },
      ],
    },
    {
      group: 'CATALOG & INVENTORY',
      items: [
        { key: 'books', label: 'Book Catalog', icon: '📚', perm: 'books' },
        { key: 'authors', label: 'Authors & Publishers', icon: '✍️', perm: 'books' },
        { key: 'inventory', label: 'Inventory Control', icon: '📦', perm: 'inventory' },
        { key: 'categories', label: 'Categories', icon: '🏷️', perm: 'categories' },
      ],
    },
    {
      group: 'SALES & CUSTOMERS',
      items: [
        { key: 'orders', label: 'Customer Orders', icon: '🛍️', perm: 'orders' },
        { key: 'returns', label: 'Returns & Refunds', icon: '🔄', perm: 'orders' },
        { key: 'payments', label: 'Payment Gateway', icon: '💳', perm: 'payments' },
        { key: 'giftcards', label: 'Gift Cards', icon: '🎁', perm: 'coupons' },
        { key: 'loyalty', label: 'Loyalty & Rewards', icon: '⭐', perm: 'users' },
        { key: 'users', label: 'User Accounts', icon: '👥', perm: 'users' },
        { key: 'reviews', label: 'Product Reviews', icon: '⭐', perm: 'reviews' },
        { key: 'coupons', label: 'Discount Coupons', icon: '🎟️', perm: 'coupons' },
      ],
    },
    {
      group: 'STOREFRONT CMS',
      items: [
        { key: 'content', label: 'Banners & Pages', icon: '🖼️', perm: 'content' },
      ],
    },
    {
      group: 'ADMINISTRATION & RBAC',
      items: [
        { key: 'notifications', label: 'Notification Center', icon: '🔔', perm: 'notifications', badge: unreadNotifCount > 0 ? unreadNotifCount : null },
        { key: 'roles', label: 'Staff & Permissions', icon: '🛡️', perm: 'roles' },
        { key: 'logs', label: 'Security Audit Trail', icon: '📜', perm: 'logs' },
        { key: 'settings', label: 'Store Settings', icon: '⚙️', perm: 'settings' },
      ],
    },
  ];

  return (
    <div className="admin-container" data-theme={theme}>
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="admin-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99,
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}
        style={mobileMenuOpen ? { transform: 'translateX(0)', zIndex: 100 } : {}}
      >
        {/* Brand Header */}
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-brand" onClick={() => handleNavClick('overview')}>
            <img
              src="/favicon.svg"
              alt="PageHaven Logo"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                boxShadow: '0 3px 8px rgba(79, 70, 229, 0.3)',
                objectFit: 'contain',
                flexShrink: 0,
              }}
            />
            {!sidebarCollapsed && (
              <div className="admin-brand-info">
                <span className="admin-brand-title">PageHaven</span>
                <span className="admin-brand-badge">
                  {isSuperAdmin ? 'Super Admin' : (user?.role || 'Admin').replace('_', ' ')}
                </span>
              </div>
            )}
          </Link>

          <button
            type="button"
            className="admin-sidebar-toggle-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '▶' : '◀'}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="admin-sidebar-nav">
          {navSections.map((sec, secIdx) => {
            // Filter items permitted for user
            const visibleItems = sec.items.filter((item) => hasPermission(item.perm));
            if (visibleItems.length === 0) return null;

            return (
              <React.Fragment key={secIdx}>
                {!sidebarCollapsed ? (
                  <div className="admin-nav-group-title">{sec.group}</div>
                ) : (
                  <div style={{ height: '1px', background: 'var(--admin-border)', margin: '8px 0' }} />
                )}

                {visibleItems.map((item) => {
                  const isActive = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className={`admin-nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleNavClick(item.key)}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <span className="admin-nav-icon">{item.icon}</span>
                      {!sidebarCollapsed && <span className="admin-nav-label">{item.label}</span>}
                      {!sidebarCollapsed && item.badge && (
                        <span className="admin-nav-badge danger">{item.badge}</span>
                      )}
                    </button>
                  );
                })}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-card">
            <div className="admin-user-avatar">
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="admin-user-meta">
                <span className="admin-user-name">{user?.name || 'Administrator'}</span>
                <span className="admin-user-role-badge">
                  {user?.role ? user.role.replace('_', ' ') : 'Admin'}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Right Content Wrapper */}
      <div className="admin-main-wrapper">
        {/* Top Navigation Bar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ display: 'flex' }}
              aria-label="Open sidebar menu"
            >
              ☰
            </button>

            <form onSubmit={handleGlobalSearch} className="admin-search-wrapper">
              <span className="admin-search-icon">🔍</span>
              <input
                type="text"
                className="admin-search-input"
                placeholder="Jump to books, orders, users, coupons, settings..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
              <span className="admin-search-kbd">↵ Enter</span>
            </form>
          </div>

          <div className="admin-topbar-right">
            {/* View Live Storefront Button */}
            <Link to="/" target="_blank" rel="noopener noreferrer" className="admin-view-store-btn" title="Open storefront in new tab">
              <span>🏪</span>
              <span className="hide-on-mobile">Live Store</span>
            </Link>

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              className="admin-topbar-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Notification Bell Dropdown */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                type="button"
                className="admin-topbar-btn"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                title="Notifications Center"
                aria-label="Notifications"
              >
                🔔
                {unreadNotifCount > 0 && <span className="admin-badge-dot" />}
              </button>

              {notificationsOpen && (
                <div className="admin-dropdown-menu admin-notifications-panel">
                  <div className="admin-dropdown-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '13.5px' }}>Notifications</strong>
                    <span className="badge badge-primary">{unreadNotifCount} Unread</span>
                  </div>

                  <div className="admin-notifications-list">
                    {recentNotifications.length === 0 ? (
                      <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '13px' }}>
                        No new notifications
                      </div>
                    ) : (
                      recentNotifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={`admin-notification-item ${!notif.isRead ? 'unread' : ''}`}
                          onClick={() => {
                            setNotificationsOpen(false);
                            setActiveTab('notifications');
                          }}
                        >
                          <div className="admin-notif-icon-box" style={{ background: 'var(--admin-primary-light)', color: 'var(--admin-primary)' }}>
                            {notif.type === 'order' ? '🛒' : notif.type === 'inventory' ? '⚠️' : notif.type === 'payment' ? '💳' : notif.type === 'review' ? '⭐' : '📢'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="admin-notif-title">{notif.title}</div>
                            <div className="admin-notif-desc">{notif.message}</div>
                            <div className="admin-notif-time">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ padding: '10px 16px', borderTop: '1px solid var(--admin-border)', textAlign: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%' }}
                      onClick={() => {
                        setNotificationsOpen(false);
                        setActiveTab('notifications');
                      }}
                    >
                      View All Alerts ({recentNotifications.length})
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile Dropdown */}
            <div style={{ position: 'relative' }} ref={profileRef}>
              <button
                type="button"
                className="admin-profile-btn"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="Admin Profile menu"
              >
                <div className="admin-user-avatar" style={{ width: '34px', height: '34px', fontSize: '13px' }}>
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }} className="hide-on-mobile">
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--admin-text-main)', lineHeight: 1.2 }}>
                    {user?.name || 'Admin'}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--admin-text-muted)', textTransform: 'capitalize' }}>
                    {(user?.role || 'Admin').replace('_', ' ')}
                  </span>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--admin-text-muted)' }}>▼</span>
              </button>

              {profileOpen && (
                <div className="admin-dropdown-menu">
                  <div className="admin-dropdown-header">
                    <strong style={{ display: 'block', fontSize: '13.5px', color: 'var(--admin-text-main)' }}>
                      {user?.name}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>
                      {user?.email}
                    </span>
                    <div style={{ marginTop: '6px' }}>
                      <span className="badge badge-purple" style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                        {user?.role || 'Admin'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="admin-dropdown-item"
                    onClick={() => {
                      setProfileOpen(false);
                      setActiveTab('settings');
                    }}
                  >
                    <span>👤</span> My Profile
                  </button>

                  <button
                    type="button"
                    className="admin-dropdown-item"
                    onClick={() => {
                      setProfileOpen(false);
                      setActiveTab('settings');
                    }}
                  >
                    <span>⚙️</span> Store Settings
                  </button>

                  {hasPermission('logs') && (
                    <button
                      type="button"
                      className="admin-dropdown-item"
                      onClick={() => {
                        setProfileOpen(false);
                        setActiveTab('logs');
                      }}
                    >
                      <span>📜</span> Security Audit Logs
                    </button>
                  )}

                  <div style={{ height: '1px', background: 'var(--admin-border)', margin: '4px 0' }} />

                  <button
                    type="button"
                    className="admin-dropdown-item danger"
                    onClick={handleLogout}
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="admin-content-container">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
