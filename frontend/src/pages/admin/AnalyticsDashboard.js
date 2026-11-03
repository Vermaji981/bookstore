import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart2,
  PieChart,
  DollarSign,
  ShoppingBag,
  Award,
  Users,
  RefreshCw,
} from 'lucide-react';
import api from '../../api/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { StatCard, AreaLineChart, BarChart, DonutChart } from '../../components/admin/charts/AdminCharts';

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const fetchAnalytics = async (selectedRange = range) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ range: selectedRange });
      if (selectedRange === 'custom' && customStart && customEnd) {
        params.append('startDate', customStart);
        params.append('endDate', customEnd);
      }

      const res = await api.get(`/admin/analytics?${params.toString()}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customStart || !customEnd) {
      alert('Please pick both start and end dates');
      return;
    }
    setRange('custom');
    fetchAnalytics('custom');
  };

  const ranges = [
    { id: 'today', label: 'Today' },
    { id: '7days', label: 'Last 7 Days' },
    { id: '30days', label: 'Last 30 Days' },
    { id: '12months', label: 'Last 12 Months' },
    { id: 'custom', label: 'Custom Range' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <h1>Sales & Revenue Analytics</h1>
          <p className="admin-view-subtitle">
            Deep dive into bookstore performance metrics, customer purchasing patterns, and category revenue distribution.
          </p>
        </div>

        {/* Date Filter Bar */}
        <div className="admin-view-actions">
          <div className="admin-date-filter-bar">
            {ranges.map((r) => (
              <button
                key={r.id}
                className={`admin-date-pill ${range === r.id ? 'active' : ''}`}
                onClick={() => {
                  setRange(r.id);
                  if (r.id === 'custom') setShowCustomPicker(true);
                  else setShowCustomPicker(false);
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button className="admin-btn admin-btn-secondary" onClick={() => fetchAnalytics(range)}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* Custom Date Picker Sub-bar */}
      {showCustomPicker && (
        <form
          onSubmit={handleCustomSubmit}
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            marginBottom: 20,
            padding: 12,
            backgroundColor: 'var(--admin-card-bg)',
            borderRadius: 'var(--admin-radius-md)',
            border: '1px solid var(--admin-border)',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600 }}>Date Range:</span>
          <input
            type="date"
            className="admin-form-input"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
          />
          <span>to</span>
          <input
            type="date"
            className="admin-form-input"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
          />
          <button type="submit" className="admin-btn admin-btn-primary admin-btn-sm">
            Apply Date Range
          </button>
        </form>
      )}

      {loading || !data ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <LoadingSpinner text="Aggregating MongoDB sales and order metrics..." />
        </div>
      ) : (
        <div>
          {/* Key KPI Metric Cards */}
          <div className="admin-stats-grid">
            <StatCard
              label="Selected Period Revenue"
              value={`$${(data.summary?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              subtext={`Across ${data.summary?.totalSales || 0} verified checkouts`}
              trend="Revenue"
              trendType="up"
              icon={DollarSign}
              color="#10b981"
              bgColor="rgba(16, 185, 129, 0.12)"
            />

            <StatCard
              label="Completed Sales"
              value={data.summary?.totalSales || 0}
              subtext="Paid e-commerce orders"
              trend="Sales"
              trendType="up"
              icon={ShoppingBag}
              color="#3b82f6"
              bgColor="rgba(59, 130, 246, 0.12)"
            />

            <StatCard
              label="Average Order Value (AOV)"
              value={`$${(data.summary?.aov || 0).toFixed(2)}`}
              subtext="Revenue per customer order"
              trend="Performance"
              trendType="up"
              icon={TrendingUp}
              color="#8b5cf6"
              bgColor="rgba(139, 92, 246, 0.12)"
            />

            <StatCard
              label="Active Categories"
              value={(data.categorySales || []).length}
              subtext="Generating store revenue"
              trend="Catalog"
              trendType="neutral"
              icon={PieChart}
              color="#06b6d4"
              bgColor="rgba(6, 182, 212, 0.12)"
            />
          </div>

          {/* Revenue Daily Trend Chart */}
          <div className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h3 className="admin-panel-title">
                  <TrendingUp size={18} color="var(--admin-primary)" />
                  Revenue Progression ({range.replace('_', ' ')})
                </h3>
                <p className="admin-panel-subtitle">Interactive day-by-day revenue line with volume tooltips</p>
              </div>
            </div>
            <div className="admin-panel-body">
              <AreaLineChart
                data={(data.dailyTrend || []).map((d) => ({
                  label: d.date.slice(5),
                  value: d.revenue || 0,
                  secondary: d.orders || 0,
                }))}
                currency="$"
                height={280}
                strokeColor="#4f46e5"
                gradientId="analyticsGrad"
              />
            </div>
          </div>

          {/* Two Column Charts: Orders by Category & Order Statuses */}
          <div className="admin-charts-grid">
            {/* Category Revenue Distribution */}
            <div className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <h3 className="admin-panel-title">
                    <PieChart size={18} color="var(--admin-secondary)" />
                    Revenue Share by Category
                  </h3>
                  <p className="admin-panel-subtitle">Top revenue-generating book categories</p>
                </div>
              </div>
              <div className="admin-panel-body">
                <DonutChart
                  data={(data.categorySales || []).map((c) => ({
                    label: c.category,
                    value: Math.round(c.revenue || 0),
                  }))}
                  size={200}
                />
              </div>
            </div>

            {/* Order Status Breakdown Bar Chart */}
            <div className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <h3 className="admin-panel-title">
                    <BarChart2 size={18} color="var(--admin-accent)" />
                    Order Status Breakdown
                  </h3>
                  <p className="admin-panel-subtitle">Fulfillment stage volume distribution</p>
                </div>
              </div>
              <div className="admin-panel-body">
                <BarChart
                  data={(data.statusBreakdown || []).map((s) => ({
                    label: s._id || 'Unknown',
                    value: s.count || 0,
                  }))}
                  height={220}
                  barColor="#8b5cf6"
                />
              </div>
            </div>
          </div>

          {/* Two Column Leaderboard: Best-Selling Books & Top Customers */}
          <div className="admin-charts-grid admin-leaderboard-grid">
            {/* Best-Selling Books Leaderboard */}
            <div className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <h3 className="admin-panel-title">
                    <Award size={18} color="#f59e0b" />
                    Top Selling Titles
                  </h3>
                  <p className="admin-panel-subtitle">Highest volume books ordered</p>
                </div>
              </div>
              <div className="admin-table-wrapper">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Book</th>
                      <th>Units Sold</th>
                      <th style={{ textAlign: 'right' }}>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bestSellingBooks && data.bestSellingBooks.length > 0 ? (
                      data.bestSellingBooks.map((b, idx) => (
                        <tr key={idx}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <img
                                src={b.image}
                                alt={b.title}
                                style={{ width: 32, height: 44, objectFit: 'cover', borderRadius: 4 }}
                                onError={(e) => {
                                  e.target.src =
                                    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200';
                                }}
                              />
                              <div style={{ fontWeight: 600 }}>{b.title}</div>
                            </div>
                          </td>
                          <td>
                            <span className="admin-status-pill success">{b.qty} sold</span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>
                            ${b.revenue.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: 24 }}>
                          No books sold in selected time window.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Customers Leaderboard */}
            <div className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <h3 className="admin-panel-title">
                    <Users size={18} color="var(--admin-primary)" />
                    Top Customers by Spend
                  </h3>
                  <p className="admin-panel-subtitle">Highest value bookstore patrons</p>
                </div>
              </div>
              <div className="admin-table-wrapper">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Orders</th>
                      <th style={{ textAlign: 'right' }}>Lifetime Spend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topCustomers && data.topCustomers.length > 0 ? (
                      data.topCustomers.map((cust, idx) => (
                        <tr key={idx}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{cust.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--admin-text-subtle)' }}>
                              {cust.email}
                            </div>
                          </td>
                          <td>{cust.orderCount} order(s)</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--admin-success)' }}>
                            ${cust.totalSpent.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: 24 }}>
                          No customer purchase data for this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
