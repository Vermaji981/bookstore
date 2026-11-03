import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  ShoppingBag,
  CreditCard,
  Users,
  Star,
  Trash2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import api from '../../api/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const NotificationCenter = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/admin/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/admin/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      alert('Failed to mark all as read');
    }
  };

  const handleClearRead = async () => {
    if (!window.confirm('Delete all read notifications from history?')) return;
    try {
      await api.delete('/admin/notifications/clear-read');
      fetchNotifications();
    } catch (err) {
      alert('Failed to clear read notifications');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingBag size={18} color="#3b82f6" />;
      case 'payment':
        return <CreditCard size={18} color="#10b981" />;
      case 'user':
        return <Users size={18} color="#8b5cf6" />;
      case 'inventory':
        return <AlertTriangle size={18} color="#f59e0b" />;
      case 'review':
        return <Star size={18} color="#eab308" />;
      case 'refund':
        return <RotateCcw size={18} color="#ef4444" />;
      default:
        return <Bell size={18} color="#4f46e5" />;
    }
  };

  const filteredNotifications =
    filterType === 'all'
      ? notifications
      : notifications.filter((n) => n.type === filterType);

  return (
    <div>
      {/* Header */}
      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <h1>Admin Notification Center</h1>
          <p className="admin-view-subtitle">
            Real-time event alerts covering customer orders, Stripe payments, out-of-stock warehouse warnings, and reader reviews.
          </p>
        </div>
        <div className="admin-view-actions">
          <button className="admin-btn admin-btn-secondary" onClick={fetchNotifications}>
            <RefreshCw size={15} /> Refresh
          </button>
          {unreadCount > 0 && (
            <button className="admin-btn admin-btn-secondary" onClick={handleMarkAllRead}>
              <CheckCircle size={15} /> Mark All as Read
            </button>
          )}
          <button className="admin-btn admin-btn-secondary" onClick={handleClearRead}>
            <Trash2 size={15} /> Clear Read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: `All Alerts (${notifications.length})` },
          { id: 'order', label: 'Orders' },
          { id: 'payment', label: 'Payments' },
          { id: 'inventory', label: 'Stock Warnings' },
          { id: 'user', label: 'Users' },
          { id: 'review', label: 'Reviews' },
          { id: 'refund', label: 'Refunds' },
        ].map((t) => (
          <button
            key={t.id}
            className={`admin-date-pill ${filterType === t.id ? 'active' : ''}`}
            onClick={() => setFilterType(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Notifications List Panel */}
      <div className="admin-panel">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <LoadingSpinner text="Retrieving administrative notifications..." />
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredNotifications.map((notif) => (
              <div
                key={notif._id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                  padding: '16px 24px',
                  borderBottom: '1px solid var(--admin-border-subtle)',
                  backgroundColor: notif.isRead
                    ? 'transparent'
                    : 'var(--admin-primary-light)',
                  transition: 'background-color 0.2s',
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--admin-radius-md)',
                    backgroundColor: 'var(--admin-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--admin-border)',
                    flexShrink: 0,
                  }}
                >
                  {getNotificationIcon(notif.type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--admin-text-main)' }}>
                      {notif.title}
                    </span>
                    {!notif.isRead && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'var(--admin-danger)',
                          display: 'inline-block',
                        }}
                      />
                    )}
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--admin-text-muted)', margin: '2px 0 6px 0', lineHeight: 1.4 }}>
                    {notif.message}
                  </p>

                  <div style={{ fontSize: 11.5, color: 'var(--admin-text-subtle)' }}>
                    {new Date(notif.createdAt).toLocaleString()}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                  {notif.link && (
                    <button
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={() => {
                        handleMarkRead(notif._id);
                        const tabMatch = notif.link.match(/tab=([^&]+)/);
                        if (tabMatch && onNavigate) {
                          onNavigate(tabMatch[1]);
                        }
                      }}
                    >
                      <ExternalLink size={12} /> View
                    </button>
                  )}
                  {!notif.isRead && (
                    <button
                      className="admin-btn admin-btn-secondary admin-btn-icon"
                      title="Mark as Read"
                      onClick={() => handleMarkRead(notif._id)}
                    >
                      <CheckCircle size={14} color="var(--admin-primary)" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-text-subtle)' }}>
            <Bell size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <div>No notifications found in this view.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;

