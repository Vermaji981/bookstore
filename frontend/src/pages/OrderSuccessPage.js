import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle,
  ArrowRight,
  Compass,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../api/api';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    api
      .get(`/orders/${id}`)
      .then((res) => {
        if (res.data.success) {
          setOrder(res.data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load order', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Generating your order invoice..." />;
  }

  return (
    <div className="section animate-fade-in" style={{ backgroundColor: '#f8fafc', minHeight: '85vh' }}>
      <div className="container-sm">
        {/* Success Card */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
          }}
        >
          {/* Top Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              padding: 'clamp(1.75rem, 5vw, 3rem) clamp(1rem, 4vw, 2rem)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                backdropFilter: 'blur(4px)',
              }}
            >
              <CheckCircle size={44} color="white" />
            </div>

            <h1 style={{ fontSize: 'clamp(1.35rem, 4.5vw, 1.85rem)', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
              Order Confirmed & Received!
            </h1>
            <p style={{ color: '#d1fae5', fontSize: '0.95rem', maxWidth: '460px', margin: '0 auto' }}>
              Thank you for shopping with PageHaven! We have sent a confirmation receipt to your email address.
            </p>
          </div>

          {/* Details Body */}
          <div style={{ padding: 'clamp(1.25rem, 4vw, 2.5rem)' }}>
            {/* Order Reference Box */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Order Number / Tracking ID
                </span>
                <p style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1.1rem)', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  #{order?._id || id}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Order Status
                </span>
                <p style={{ marginTop: '2px' }}>
                  <span className="badge badge-success">
                    {order?.orderStatus || 'Confirmed'}
                  </span>
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Payment Method
                </span>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {order?.paymentMethod || 'Stripe'} {order?.isPaid ? '(Paid)' : '(Pending)'}
                </p>
              </div>
            </div>

            {/* Items Purchased List */}
            {order?.orderItems && order.orderItems.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                  Purchased Books
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {order.orderItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #f1f5f9',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{ width: '40px', height: '55px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <div>
                          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{item.title}</p>
                          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Qty: {item.qty}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                        ${(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping Address & Totals Summary */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #f1f5f9',
                marginBottom: '2.5rem',
              }}
            >
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Delivery Destination
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
                  <strong>{order?.shippingAddress?.fullName}</strong>
                  <br />
                  {order?.shippingAddress?.address}
                  <br />
                  {order?.shippingAddress?.city}, {order?.shippingAddress?.state}{' '}
                  {order?.shippingAddress?.pinCode}
                  <br />
                  Phone: {order?.shippingAddress?.phone}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Payment Breakdown
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', color: '#475569' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <span>${order?.itemsPrice?.toFixed(2)}</span>
                  </div>
                  {order?.discountPrice > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                      <span>Discount:</span>
                      <span>-${order?.discountPrice?.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Shipping:</span>
                    <span>{order?.shippingPrice === 0 ? 'FREE' : `$${order?.shippingPrice?.toFixed(2)}`}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#0f172a', fontSize: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '4px' }}>
                    <span>Total Paid:</span>
                    <span>${order?.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <Link
                to={`/track-order/${order?._id || id}`}
                className="btn btn-primary btn-lg"
                style={{ flex: 1, minWidth: '200px' }}
              >
                <Compass size={18} />
                <span>Track Order Live</span>
              </Link>

              <Link
                to="/books"
                className="btn btn-secondary btn-lg"
                style={{ flex: 1, minWidth: '180px' }}
              >
                <span>Continue Shopping</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
