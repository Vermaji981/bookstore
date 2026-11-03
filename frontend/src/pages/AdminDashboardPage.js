import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminThemeProvider } from '../context/AdminThemeContext';
import AdminLayout from '../components/admin/AdminLayout';
import '../styles/admin.css';

// Module views
import AdminOverview from './admin/AdminOverview';
import AnalyticsDashboard from './admin/AnalyticsDashboard';
import BookManagement from './admin/BookManagement';
import InventoryManagement from './admin/InventoryManagement';
import CategoryManagement from './admin/CategoryManagement';
import OrderManagement from './admin/OrderManagement';
import PaymentManagement from './admin/PaymentManagement';
import UserManagement from './admin/UserManagement';
import ReviewsManagement from './admin/ReviewsManagement';
import CouponManagement from './admin/CouponManagement';
import WebsiteContentManagement from './admin/WebsiteContentManagement';
import NotificationCenter from './admin/NotificationCenter';
import RolesPermissions from './admin/RolesPermissions';
import ActivityLogView from './admin/ActivityLogView';
import AdminSettings from './admin/AdminSettings';
import ReturnsManagement from './admin/ReturnsManagement';
import GiftCardManagement from './admin/GiftCardManagement';
import LoyaltyReferralManagement from './admin/LoyaltyReferralManagement';
import AuthorManagement from './admin/AuthorManagement';

const AdminDashboardPage = () => {
  const { user, loading, isAdmin, hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab from URL query (?tab=xxx) or default to 'overview'
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTabState] = useState(initialTab);

  // Sync state with URL parameter
  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam !== activeTab) {
      setActiveTabState(tabParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#0f172a',
          color: '#f8fafc',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            border: '4px solid rgba(255, 255, 255, 0.1)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '16px',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: '1rem', fontWeight: 600 }}>Authenticating administrative credentials...</p>
      </div>
    );
  }

  // Access Control: Check if user is logged in and has an administrative role
  if (!user || !isAdmin) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#0b0f19',
          color: '#f8fafc',
          padding: '20px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '36px',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 20px',
            }}
          >
            🔒
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 10px' }}>
            Administrative Access Restricted
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 24px' }}>
            The Super Admin control dashboard requires an authorized administrator or staff account.
            {!user ? ' You are currently not signed in.' : ` Signed in as "${user.email}" (${user.role}).`}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link
              to="/login"
              style={{
                display: 'inline-block',
                background: '#4f46e5',
                color: '#ffffff',
                padding: '12px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Sign In as Administrator
            </Link>
            <Link
              to="/"
              style={{
                display: 'inline-block',
                background: 'transparent',
                border: '1px solid #475569',
                color: '#cbd5e1',
                padding: '12px 20px',
                borderRadius: '8px',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Return to Bookstore Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Permission Check for current tab
  const isPermitted = hasPermission(activeTab);

  const renderActiveModule = () => {
    if (!isPermitted) {
      return (
        <div className="admin-page">
          <div className="admin-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⛔</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem' }}>Permission Denied</h3>
            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 20px' }}>
              Your current administrative role (<strong>{user?.role}</strong>) does not have authorization to view or modify the <code>{activeTab}</code> module.
            </p>
            <button className="btn btn-primary" onClick={() => setActiveTab('overview')}>
              Return to Overview
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <AdminOverview onNavigate={setActiveTab} setActiveTab={setActiveTab} />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'books':
        return <BookManagement />;
      case 'authors':
        return <AuthorManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'returns':
        return <ReturnsManagement />;
      case 'payments':
        return <PaymentManagement />;
      case 'giftcards':
        return <GiftCardManagement />;
      case 'loyalty':
        return <LoyaltyReferralManagement />;
      case 'users':
        return <UserManagement />;
      case 'reviews':
        return <ReviewsManagement />;
      case 'coupons':
        return <CouponManagement />;
      case 'content':
        return <WebsiteContentManagement />;
      case 'notifications':
        return <NotificationCenter onNavigate={setActiveTab} />;
      case 'roles':
        return <RolesPermissions />;
      case 'logs':
        return <ActivityLogView />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminOverview onNavigate={setActiveTab} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <AdminThemeProvider>
      <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderActiveModule()}
      </AdminLayout>
    </AdminThemeProvider>
  );
};

export default AdminDashboardPage;
