import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  CheckCircle,
  AlertCircle,
  Compass,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../api/api';

const ORDER_STAGES = [
  { id: 'Order Placed', label: 'Order Placed', desc: 'Order received and logged in system' },
  { id: 'Confirmed', label: 'Order Confirmed', desc: 'Payment verified and inventory allocated' },
  { id: 'Processing', label: 'Processing', desc: 'Carefully packaged at fulfillment warehouse' },
  { id: 'Shipped', label: 'Shipped', desc: 'Handed over to carrier courier' },
  { id: 'Out for Delivery', label: 'Out for Delivery', desc: 'Local courier agent dispatched for delivery' },
  { id: 'Delivered', label: 'Delivered', desc: 'Safely delivered to customer doorstep' },
];

const OrderTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [searchId, setSearchId] = useState(id || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (id) {
      fetchTracking(id);
    }
  }, [id]);

  const fetchTracking = (orderId) => {
    setLoading(true);
    setErrorMsg('');

    api
      .get(`/orders/track/${orderId.trim()}`)
      .then((res) => {
        if (res.data.success) {
          setOrder(res.data.data);
        } else {
          setErrorMsg(res.data.message || 'No order found with this tracking ID');
        }
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg(
          err.response?.data?.message || 'Invalid Order ID or order not found. Please verify the ID.'
        );
        setLoading(false);
      });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/track-order/${searchId.trim()}`);
      fetchTracking(searchId.trim());
    }
  };

  // Determine stage progression
  const getStageIndex = (status) => {
    if (status === 'Cancelled') return -1;
    const stageMap = {
      'Pending': 0,
      'Order Placed': 0,
      'Confirmed': 1,
      'Processing': 2,
      'Shipped': 3,
      'Out for Delivery': 4,
      'Delivered': 5,
    };
    return stageMap[status] !== undefined ? stageMap[status] : 0;
  };

  const currentStageIndex = order ? getStageIndex(order.orderStatus) : -1;

  return (
    <div className="section animate-fade-in" style={{ backgroundColor: '#f8fafc', minHeight: '85vh' }}>
      <div className="container-sm">
        {/* Header & Search */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <Compass size={28} />
          </div>
          <h1 className="title-lg font-serif">Track Your Bookstore Order</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.35rem' }}>
            Check real-time fulfillment status and delivery tracking updates.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              maxWidth: '520px',
              margin: '1.75rem auto 0 auto',
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <input
              type="text"
              placeholder="Paste your 24-character Order ID (e.g. 67c4...)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.9rem', flex: '1 1 200px' }}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>
              <Search size={16} />
              <span>Track</span>
            </button>
          </form>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              borderRadius: '12px',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              border: '1px solid #fecaca',
            }}
          >
            <AlertCircle size={20} flexShrink={0} />
            <span style={{ fontSize: '0.95rem' }}>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <LoadingSpinner text="Locating shipment details..." />
        ) : order ? (
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 'clamp(16px, 4vw, 24px)',
              border: '1px solid #e2e8f0',
              padding: 'clamp(1.25rem, 4vw, 2.5rem)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Header info */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: '2.5rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Order Tracking Reference
                </span>
                <p style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1.15rem)', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  #{order._id}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Current Status
                </span>
                <p style={{ marginTop: '2px' }}>
                  <span
                    className={`badge ${
                      order.orderStatus === 'Delivered'
                        ? 'badge-success'
                        : order.orderStatus === 'Cancelled'
                        ? 'badge-danger'
                        : 'badge-primary'
                    }`}
                    style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}
                  >
                    {order.orderStatus}
                  </span>
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Order Date
                </span>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Cancelled Notice */}
            {order.orderStatus === 'Cancelled' ? (
              <div
                style={{
                  padding: '1.5rem',
                  backgroundColor: '#fee2e2',
                  borderRadius: '16px',
                  color: '#b91c1c',
                  marginBottom: '2rem',
                }}
              >
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>This Order has been Cancelled</h3>
                <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  Any payment charges have been credited back according to our refund policy.
                </p>
              </div>
            ) : (
              /* Timeline */
              <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.75rem' }}>
                  Fulfillment & Delivery Progress
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {ORDER_STAGES.map((stage, idx) => {
                    const isCompleted = currentStageIndex > idx;
                    const isCurrent = currentStageIndex === idx;

                    return (
                      <div key={stage.id} className="tracking-step">
                        {/* Vertical line connecting nodes */}
                        {idx < ORDER_STAGES.length - 1 && (
                          <div
                            className={`tracking-line ${
                              currentStageIndex > idx ? 'active' : ''
                            }`}
                          />
                        )}

                        {/* Dot indicator */}
                        <div
                          className={`tracking-dot ${
                            isCompleted ? 'completed' : isCurrent ? 'active' : ''
                          }`}
                        >
                          {isCompleted ? <CheckCircle size={18} /> : idx + 1}
                        </div>

                        {/* Stage Details */}
                        <div style={{ flex: 1, paddingTop: '4px' }}>
                          <h4
                            style={{
                              fontSize: '1rem',
                              fontWeight: 700,
                              color: isCurrent ? 'var(--primary)' : isCompleted ? '#0f172a' : '#94a3b8',
                            }}
                          >
                            {stage.label}
                          </h4>
                          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                            {stage.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Destination & Tracking History Events */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid #e2e8f0',
              }}
            >
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Delivery Address
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                  <strong>{order.shippingAddress?.fullName}</strong>
                  <br />
                  {order.shippingAddress?.address}
                  <br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pinCode}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Carrier & Dispatch
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                  Courier: <strong>FedEx Express Courier</strong>
                  <br />
                  Tracking: <code>FX-{(order._id || '').slice(-8).toUpperCase()}</code>
                  <br />
                  Payment: <strong>{order.paymentMethod}</strong> ({order.isPaid ? 'Verified' : 'Pending'})
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
