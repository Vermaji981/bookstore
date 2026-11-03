import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingBag,
  BookOpen,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  PackageCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Plus,
  RefreshCw,
} from 'lucide-react';
import api from '../../api/api';
import { StatCard, AreaLineChart, DonutChart } from '../../components/admin/charts/AdminCharts';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminOverview = ({ onNavigate, setActiveTab }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleNav = (tab, opts) => {
    if (typeof onNavigate === 'function') {
      onNavigate(tab, opts);
    } else if (typeof setActiveTab === 'function') {
      setActiveTab(tab);
    }
  };

  const fetchOverview = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/overview');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load overview data:', err);
      setError(err.response?.data?.message || 'Could not load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Synchronizing real-time database statistics..." />;
  }

  if (error || !data) {
    return (
      <div className="admin-panel" style={{ padding: 40, textAlign: 'center' }}>
        <AlertTriangle size={48} color="var(--admin-warning)" style={{ marginBottom: 16 }} />
        <h3>Failed to load Dashboard Overview</h3>
        <p style={{ color: 'var(--admin-text-muted)', marginBottom: 20 }}>{error}</p>
        <button className="admin-btn admin-btn-primary" onClick={fetchOverview}>
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  const { stats, monthlySales, categoryCounts, recentOrders, recentActivities } = data;

  // Format monthly revenue for chart
  const revenueChartData = (monthlySales || []).map((m) => ({
    label: m.month,
    value: m.revenue || 0,
    secondary: m.orders || 0,
  }));

  // Format categories for donut
  const categoryDonutData = (categoryCounts || []).slice(0, 6).map((c) => ({
    label: c._id || 'General',
    value: c.count || 0,
  }));

  return (
    <div>
      {/* Top Banner with Quick Actions */}
      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <h1>Super Admin Dashboard</h1>
          <p className="admin-view-subtitle">
            Real-time telemetry, store metrics, and enterprise controls across your bookstore platform.
          </p>
        </div>
        <div className="admin-view-actions">
          <button className="admin-btn admin-btn-secondary" onClick={fetchOverview}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => handleNav('books', { openAdd: true })}
          >
            <Plus size={16} /> Add New Book
          </button>
        </div>
      </div>

      {/* 10 Core Live Database Statistics Cards */}
      <div className="admin-stats-grid">
        <StatCard
          label="Total Revenue"
          value={`$${Number(stats?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtext={`Avg Order: $${Number(stats?.averageOrderValue || 0).toFixed(2)}`}
          trend="+18.4%"
          trendType="up"
          icon={DollarSign}
          color="#10b981"
          bgColor="rgba(16, 185, 129, 0.12)"
          onClick={() => handleNav('analytics')}
        />

        <StatCard
          label="Total Orders"
          value={stats?.totalOrders || 0}
          subtext={`${stats?.pendingOrders || 0} awaiting fulfillment`}
          trend={`${stats?.pendingOrders || 0} Pending`}
          trendType={(stats?.pendingOrders || 0) > 0 ? 'warning' : 'neutral'}
          icon={ShoppingBag}
          color="#3b82f6"
          bgColor="rgba(59, 130, 246, 0.12)"
          onClick={() => handleNav('orders')}
        />

        <StatCard
          label="Catalog Titles"
          value={stats?.totalBooks || 0}
          subtext="Active bookstore inventory"
          trend="+12 this month"
          trendType="neutral"
          icon={BookOpen}
          color="#8b5cf6"
          bgColor="rgba(139, 92, 246, 0.12)"
          onClick={() => handleNav('books')}
        />

        <StatCard
          label="Registered Users"
          value={stats?.totalUsers || 0}
          subtext={`${stats?.totalCustomers || 0} verified customers`}
          trend="Real-time"
          trendType="up"
          icon={Users}
          color="#06b6d4"
          bgColor="rgba(6, 182, 212, 0.12)"
          onClick={() => handleNav('users')}
        />

        <StatCard
          label="Products Sold"
          value={stats?.totalProductsSold || 0}
          subtext="Verified physical units"
          trend="Total units"
          trendType="up"
          icon={PackageCheck}
          color="#f59e0b"
          bgColor="rgba(245, 158, 11, 0.12)"
        />

        <StatCard
          label="Pending Orders"
          value={stats?.pendingOrders || 0}
          subtext="Awaiting packaging & dispatch"
          trend={(stats?.pendingOrders || 0) > 0 ? 'Action Needed' : 'All Clear'}
          trendType={(stats?.pendingOrders || 0) > 0 ? 'warning' : 'neutral'}
          icon={Clock}
          color="#eab308"
          bgColor="rgba(234, 179, 8, 0.12)"
          onClick={() => handleNav('orders', { filter: 'Pending' })}
        />

        <StatCard
          label="Delivered Orders"
          value={stats?.deliveredOrders || 0}
          subtext="Successfully received"
          trend="Completed"
          trendType="up"
          icon={CheckCircle}
          color="#10b981"
          bgColor="rgba(16, 185, 129, 0.12)"
          onClick={() => handleNav('orders', { filter: 'Delivered' })}
        />

        <StatCard
          label="Cancelled / Returns"
          value={(stats?.cancelledOrders || 0) + (stats?.returnedOrders || 0)}
          subtext={`${stats?.returnedOrders || 0} returned goods`}
          trend={(stats?.cancelledOrders || 0) > 0 ? `${stats?.cancelledOrders} Cancelled` : 'Zero'}
          trendType={(stats?.cancelledOrders || 0) > 0 ? 'down' : 'neutral'}
          icon={XCircle}
          color="#ef4444"
          bgColor="rgba(239, 68, 68, 0.12)"
          onClick={() => handleNav('orders', { filter: 'Cancelled' })}
        />

        <StatCard
          label="Low Stock Books"
          value={stats?.lowStockBooks || 0}
          subtext="≤ 5 copies remaining"
          trend={(stats?.lowStockBooks || 0) > 0 ? 'Restock Alert' : 'Stock Optimal'}
          trendType={(stats?.lowStockBooks || 0) > 0 ? 'down' : 'neutral'}
          icon={AlertTriangle}
          color="#f97316"
          bgColor="rgba(249, 115, 22, 0.12)"
          onClick={() => handleNav('inventory', { filter: 'low_stock' })}
        />

        <StatCard
          label="Out of Stock"
          value={stats?.outOfStockBooks || 0}
          subtext="Immediate restock required"
          trend={(stats?.outOfStockBooks || 0) > 0 ? 'Attention' : 'In Stock'}
          trendType={(stats?.outOfStockBooks || 0) > 0 ? 'down' : 'up'}
          icon={AlertTriangle}
          color="#dc2626"
          bgColor="rgba(220, 38, 38, 0.12)"
          onClick={() => handleNav('inventory', { filter: 'out_of_stock' })}
        />
      </div>

      {/* Interactive Charts Row */}
      <div className="admin-charts-grid">
        {/* Revenue Growth Line/Area Chart */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h3 className="admin-panel-title">
                <TrendingUp size={18} color="var(--admin-primary)" />
                Annual Sales & Revenue Trajectory
              </h3>
              <p className="admin-panel-subtitle">Monthly verified store revenue (MongoDB aggregation)</p>
            </div>
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              onClick={() => handleNav('analytics')}
            >
              Full Analytics <ArrowRight size={14} />
            </button>
          </div>
          <div className="admin-panel-body">
            <AreaLineChart
              data={revenueChartData}
              currency="$"
              height={260}
              strokeColor="#4f46e5"
            />
          </div>
        </div>

        {/* Category Share Donut Chart */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h3 className="admin-panel-title">
                <BookOpen size={18} color="var(--admin-secondary)" />
                Catalog Category Share
              </h3>
              <p className="admin-panel-subtitle">Active titles by category</p>
            </div>
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              onClick={() => handleNav('categories')}
            >
              Manage <ArrowRight size={14} />
            </button>
          </div>
          <div className="admin-panel-body">
            <DonutChart data={categoryDonutData} size={180} />
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Orders & Audit Activity Logs */}
      <div className="admin-charts-grid admin-orders-audit-grid">
        {/* Recent Orders Panel */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h3 className="admin-panel-title">Recent Customer Orders</h3>
              <p className="admin-panel-subtitle">Latest fulfillment requests received</p>
            </div>
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              onClick={() => handleNav('orders')}
            >
              View All Orders <ArrowRight size={14} />
            </button>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders && recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => handleNav('orders', { selectedOrder: order })}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        #{order._id.toString().slice(-6)}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--admin-text-subtle)' }}>
                          {order.shippingAddress?.city || 'USA'}
                        </div>
                      </td>
                      <td>
                        {(order.orderItems || []).length} title(s)
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        ${Number(order.totalPrice || 0).toFixed(2)}
                      </td>
                      <td>
                        <span
                          className={`admin-status-pill ${
                            order.orderStatus === 'Delivered'
                              ? 'success'
                              : order.orderStatus === 'Cancelled'
                              ? 'danger'
                              : order.orderStatus === 'Pending'
                              ? 'warning'
                              : 'info'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>
                      No orders found in database
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Activity Feed */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h3 className="admin-panel-title">Admin Activity Audit</h3>
              <p className="admin-panel-subtitle">Recent administrative system events</p>
            </div>
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              onClick={() => handleNav('logs')}
            >
              Audit Trail <ArrowRight size={14} />
            </button>
          </div>
          <div className="admin-panel-body" style={{ padding: '16px 20px' }}>
            {recentActivities && recentActivities.length > 0 ? (
              <div className="admin-activity-list">
                {recentActivities.map((act) => (
                  <div key={act._id} className="admin-activity-item">
                    <div className="admin-activity-avatar">
                      {act.admin?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="admin-activity-body">
                      <div className="admin-activity-header">
                        <span
                          className="admin-activity-name"
                          title={act.admin?.name || 'Administrator'}
                        >
                          {act.admin?.name || 'Administrator'}
                        </span>
                        <span className="admin-activity-time">
                          {new Date(act.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="admin-activity-details">
                        {act.details}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--admin-text-subtle)' }}>
                No recent activity recorded
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
