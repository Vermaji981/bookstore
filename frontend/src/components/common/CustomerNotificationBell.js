import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Package, CreditCard, Tag, Award, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const CustomerNotificationBell = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications/customer');
      if (res.data.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/customer/all/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {}
  };

  const handleItemClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.put(`/notifications/customer/${notif._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {}
    }
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        type="button"
        className="nav-icon-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
        aria-label="Customer Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="nav-badge-pill">{unreadCount}</span>}
      </button>

      {isOpen && (
        <>
          <div className="customer-notif-backdrop" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <div className="customer-notif-dropdown animate-slide-up" role="menu">
          <div className="customer-notif-header">
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Notifications
              </h4>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {unreadCount} unread update{unreadCount === 1 ? '' : 's'}
              </span>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="customer-notif-mark-btn"
                onClick={handleMarkAllRead}
              >
                <CheckCheck size={14} />
                <span>Mark read</span>
              </button>
            )}
          </div>

          <div className="customer-notif-list">
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                <Bell size={28} color="#cbd5e1" style={{ margin: '0 auto 0.5rem auto' }} />
                <p style={{ margin: 0 }}>You're all caught up! No notifications yet.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                let icon = <Package size={15} color="#4f46e5" />;
                if (notif.type === 'payment') icon = <CreditCard size={15} color="#10b981" />;
                else if (notif.type === 'price_drop') icon = <Tag size={15} color="#f59e0b" />;
                else if (notif.type === 'loyalty') icon = <Award size={15} color="#8b5cf6" />;
                else if (notif.type === 'return') icon = <RefreshCcw size={15} color="#ef4444" />;

                return (
                  <div
                    key={notif._id}
                    className={`customer-notif-item ${!notif.isRead ? 'unread' : ''}`}
                    onClick={() => handleItemClick(notif)}
                  >
                    <div className="customer-notif-icon-box">{icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        {notif.title}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0', lineHeight: 1.35 }}>
                        {notif.message}
                      </p>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '3px', display: 'block' }}>
                        {new Date(notif.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="customer-notif-footer">
            <Link
              to="/dashboard?tab=orders"
              style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
              onClick={() => setIsOpen(false)}
            >
              View Order History & Tracking →
            </Link>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default CustomerNotificationBell;
