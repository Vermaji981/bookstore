import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Truck,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  User,
  MapPin,
} from 'lucide-react';
import api from '../../api/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OrderManagement = ({ initialSelectedOrder = null, initialFilter = 'All' }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [search, setSearch] = useState('');

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState(initialSelectedOrder);
  const [statusUpdateVal, setStatusUpdateVal] = useState('Confirmed');
  const [statusNoteVal, setStatusNoteVal] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Refund Modal
  const [refundModalOrder, setRefundModalOrder] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [processingRefund, setProcessingRefund] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/orders?${params.toString()}`);
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  // Open Status Update Modal for Order
  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setStatusUpdateVal(order.orderStatus);
    setStatusNoteVal('');
  };

  // Submit Status Update
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const res = await api.put(`/orders/${selectedOrder._id}/status`, {
        status: statusUpdateVal,
        note: statusNoteVal.trim() || undefined,
      });

      if (res.data.success) {
        setSelectedOrder(res.data.data);
        setOrders((prev) =>
          prev.map((o) => (o._id === selectedOrder._id ? res.data.data : o))
        );
        alert(`Order status updated to "${statusUpdateVal}"`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Process Refund
  const handleProcessRefund = async (e) => {
    e.preventDefault();
    if (!refundModalOrder) return;
    setProcessingRefund(true);
    try {
      const res = await api.post('/payment/admin/refund', {
        orderId: refundModalOrder._id,
        amount: refundModalOrder.totalPrice,
        reason: refundReason || 'Customer requested refund approved by admin',
      });

      if (res.data.success) {
        setRefundModalOrder(null);
        setRefundReason('');
        if (selectedOrder && selectedOrder._id === refundModalOrder._id) {
          setSelectedOrder(res.data.data);
        }
        fetchOrders();
        alert('Refund processed successfully.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process refund');
    } finally {
      setProcessingRefund(false);
    }
  };

  const statusList = [
    'All',
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
    'Returned',
  ];

  return (
    <div>
      {/* Header */}
      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <h1>Order Fulfillment Management</h1>
          <p className="admin-view-subtitle">
            Track customer orders, manage status milestones, handle dispatch carrier updates, and process returns/refunds.
          </p>
        </div>
        <div className="admin-view-actions">
          <button className="admin-btn admin-btn-secondary" onClick={fetchOrders}>
            <RefreshCw size={15} /> Refresh Orders
          </button>
        </div>
      </div>

      {/* Orders Filter & Controls Panel */}
      <div className="admin-panel">
        <div className="admin-table-controls">
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260 }}>
            <div className="admin-search-wrapper" style={{ width: '100%' }}>
              <Search className="admin-search-icon" />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search by Order ID (24-hex) or customer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-secondary">
              Search
            </button>
          </form>

          {/* Status Pills Filter */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {statusList.map((st) => (
              <button
                key={st}
                className={`admin-date-pill ${statusFilter === st ? 'active' : ''}`}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="admin-table-wrapper">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <LoadingSpinner text="Retrieving orders from database..." />
            </div>
          ) : (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Customer</th>
                  <th>Items Summary</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Order Status</th>
                  <th>Order Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((o) => (
                    <tr key={o._id}>
                      {/* ID */}
                      <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        #{o._id.toString().slice(-6)}
                      </td>

                      {/* Customer */}
                      <td>
                        <div style={{ fontWeight: 600 }}>{o.shippingAddress?.fullName || 'Customer'}</div>
                        <div style={{ fontSize: 11, color: 'var(--admin-text-subtle)' }}>
                          {o.shippingAddress?.email || 'N/A'}
                        </div>
                      </td>

                      {/* Items */}
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>
                          {(o.orderItems || []).length} title(s) •{' '}
                          {(o.orderItems || []).reduce((acc, it) => acc + (it.qty || 1), 0)} unit(s)
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--admin-text-subtle)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                          {o.orderItems?.[0]?.title}
                          {o.orderItems?.length > 1 ? ` +${o.orderItems.length - 1} more` : ''}
                        </div>
                      </td>

                      {/* Total */}
                      <td style={{ fontWeight: 700, fontSize: 14 }}>
                        ${o.totalPrice.toFixed(2)}
                      </td>

                      {/* Payment */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span
                            className={`admin-status-pill ${
                              o.refundStatus === 'refunded'
                                ? 'danger'
                                : o.isPaid
                                ? 'success'
                                : 'warning'
                            }`}
                          >
                            {o.refundStatus === 'refunded'
                              ? 'Refunded'
                              : o.isPaid
                              ? 'Paid'
                              : 'Unpaid'}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--admin-text-subtle)' }}>
                            {o.paymentMethod}
                          </span>
                        </div>
                      </td>

                      {/* Order Status */}
                      <td>
                        <span
                          className={`admin-status-pill ${
                            o.orderStatus === 'Delivered'
                              ? 'success'
                              : o.orderStatus === 'Cancelled'
                              ? 'danger'
                              : o.orderStatus === 'Pending'
                              ? 'warning'
                              : o.orderStatus === 'Returned'
                              ? 'neutral'
                              : 'info'
                          }`}
                        >
                          {o.orderStatus}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ fontSize: 12, color: 'var(--admin-text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(o.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            onClick={() => openOrderDetails(o)}
                          >
                            <Eye size={13} /> View & Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                      No orders found matching status filter "{statusFilter}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detailed Order View & Progression Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container large">
            <div className="admin-modal-header">
              <div>
                <h3 className="admin-modal-title">
                  Order Details #{selectedOrder._id}
                </h3>
                <span style={{ fontSize: 12, color: 'var(--admin-text-subtle)' }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                className="admin-modal-close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Order Status Progression Form */}
              <div
                style={{
                  padding: 16,
                  backgroundColor: 'var(--admin-bg-alt)',
                  borderRadius: 'var(--admin-radius-md)',
                  marginBottom: 20,
                  border: '1px solid var(--admin-border)',
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Truck size={18} color="var(--admin-primary)" />
                  Update Order Progression Status
                </div>

                <form onSubmit={handleUpdateStatus} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <select
                    className="admin-form-select"
                    value={statusUpdateVal}
                    onChange={(e) => setStatusUpdateVal(e.target.value)}
                    style={{ flex: 1, minWidth: 160 }}
                  >
                    <option value="Pending">Pending (Under Review)</option>
                    <option value="Confirmed">Confirmed (Ready to Pack)</option>
                    <option value="Processing">Processing (Packaging)</option>
                    <option value="Shipped">Shipped (Dispatched to Courier)</option>
                    <option value="Out for Delivery">Out for Delivery (Local Courier)</option>
                    <option value="Delivered">Delivered (Handed to Recipient)</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Returned">Returned</option>
                  </select>

                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="Milestone description or tracking tracking note..."
                    style={{ flex: 2, minWidth: 200 }}
                    value={statusNoteVal}
                    onChange={(e) => setStatusNoteVal(e.target.value)}
                  />

                  <button
                    type="submit"
                    className="admin-btn admin-btn-primary"
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? 'Updating...' : 'Save Status'}
                  </button>
                </form>
              </div>

              {/* Customer & Address Details */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                {/* Customer Details */}
                <div
                  style={{
                    padding: 14,
                    border: '1px solid var(--admin-border)',
                    borderRadius: 'var(--admin-radius-md)',
                    backgroundColor: 'var(--admin-surface)',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <User size={15} color="var(--admin-primary)" /> Customer Details
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                    <div>
                      <strong>Name:</strong> {selectedOrder.shippingAddress?.fullName}
                    </div>
                    <div>
                      <strong>Email:</strong> {selectedOrder.shippingAddress?.email}
                    </div>
                    <div>
                      <strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div
                  style={{
                    padding: 14,
                    border: '1px solid var(--admin-border)',
                    borderRadius: 'var(--admin-radius-md)',
                    backgroundColor: 'var(--admin-surface)',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={15} color="var(--admin-primary)" /> Delivery Destination
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                    <div>{selectedOrder.shippingAddress?.address}</div>
                    <div>
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}{' '}
                      {selectedOrder.shippingAddress?.pinCode}
                    </div>
                    <div>{selectedOrder.shippingAddress?.country || 'USA'}</div>
                  </div>
                </div>
              </div>

              {/* Ordered Book Items Breakdown */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                  Purchased Book Items ({(selectedOrder.orderItems || []).length})
                </h4>

                <div className="admin-table-wrapper">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Unit Price</th>
                        <th>Qty</th>
                        <th style={{ textAlign: 'right' }}>Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedOrder.orderItems || []).map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <img
                                src={item.image}
                                alt={item.title}
                                style={{ width: 36, height: 48, objectFit: 'cover', borderRadius: 4 }}
                              />
                              <div style={{ fontWeight: 600 }}>{item.title}</div>
                            </div>
                          </td>
                          <td>${item.price.toFixed(2)}</td>
                          <td>{item.qty}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>
                            ${((item.price || 0) * (item.qty || 1)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 280,
                    fontSize: 13,
                    lineHeight: 1.8,
                    padding: 14,
                    backgroundColor: 'var(--admin-bg-alt)',
                    borderRadius: 'var(--admin-radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Items Subtotal:</span>
                    <span>${(selectedOrder.itemsPrice || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tax (8%):</span>
                    <span>${(selectedOrder.taxPrice || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Shipping Fee:</span>
                    <span>
                      {selectedOrder.shippingPrice === 0
                        ? 'FREE'
                        : `$${selectedOrder.shippingPrice.toFixed(2)}`}
                    </span>
                  </div>
                  {selectedOrder.discountPrice > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--admin-success)' }}>
                      <span>Discount:</span>
                      <span>-${selectedOrder.discountPrice.toFixed(2)}</span>
                    </div>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 800,
                      fontSize: 15,
                      borderTop: '1px solid var(--admin-border)',
                      paddingTop: 6,
                      marginTop: 4,
                    }}
                  >
                    <span>Total Amount:</span>
                    <span>${selectedOrder.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Tracking History Timeline */}
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                  Customer Tracking Timeline
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(selectedOrder.trackingHistory || []).map((milestone, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: 12,
                        padding: 10,
                        backgroundColor: 'var(--admin-surface)',
                        border: '1px solid var(--admin-border-subtle)',
                        borderRadius: 'var(--admin-radius-sm)',
                        fontSize: 12.5,
                      }}
                    >
                      <span className="admin-status-pill info" style={{ alignSelf: 'flex-start' }}>
                        {milestone.status}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: 'var(--admin-text-main)' }}>{milestone.description}</div>
                        <div style={{ fontSize: 11, color: 'var(--admin-text-subtle)', marginTop: 2 }}>
                          {new Date(milestone.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              {selectedOrder.isPaid && selectedOrder.refundStatus !== 'refunded' && (
                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  style={{ marginRight: 'auto' }}
                  onClick={() => setRefundModalOrder(selectedOrder)}
                >
                  <RotateCcw size={14} /> Process Refund (${selectedOrder.totalPrice.toFixed(2)})
                </button>
              )}
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setSelectedOrder(null)}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {refundModalOrder && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                Confirm Refund: Order #{refundModalOrder._id.toString().slice(-6)}
              </h3>
              <button
                className="admin-modal-close-btn"
                onClick={() => setRefundModalOrder(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProcessRefund}>
              <div className="admin-modal-body">
                <div
                  style={{
                    padding: 14,
                    backgroundColor: 'var(--admin-danger-bg)',
                    borderRadius: 'var(--admin-radius-md)',
                    color: 'var(--admin-danger)',
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  <AlertCircle size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Processing a refund will mark this order as Cancelled, return the ordered books to available stock, and record the transaction.
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Refund Amount ($)</label>
                  <input
                    type="number"
                    disabled
                    className="admin-form-input"
                    style={{ width: '100%', fontWeight: 700 }}
                    value={refundModalOrder.totalPrice.toFixed(2)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Refund Reason *</label>
                  <textarea
                    required
                    rows="3"
                    className="admin-form-textarea"
                    style={{ width: '100%' }}
                    placeholder="Provide justification for customer refund (e.g. Return received in good condition, order damaged in transit)..."
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setRefundModalOrder(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-danger"
                  disabled={processingRefund}
                >
                  {processingRefund ? 'Processing...' : 'Authorize Full Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
