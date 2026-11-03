import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Lock,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    itemsCount,
    subtotal,
    discountPercent,
    discountAmount,
    shippingFee,
    taxAmount,
    total,
    promoError,
    promoSuccess,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyPromoCode,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    applyPromoCode(couponInput);
  };

  if (cartItems.length === 0) {
    return (
      <div className="section animate-fade-in" style={{ backgroundColor: '#f8fafc', minHeight: '75vh' }}>
        <div className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              color: 'var(--primary)',
            }}
          >
            <ShoppingBag size={40} />
          </div>
          <h2 className="title-lg font-serif" style={{ marginBottom: '0.75rem' }}>
            Your Reading Basket is Empty
          </h2>
          <p style={{ color: '#64748b', maxWidth: '420px', margin: '0 auto 2rem auto', fontSize: '1rem' }}>
            Explore our curated selection of paperbacks, hardcovers, and collectors editions to fill your cart.
          </p>
          <Link to="/books" className="btn btn-primary btn-lg">
            <span>Explore Bookstore Catalog</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section animate-fade-in" style={{ backgroundColor: '#f8fafc', minHeight: '80vh' }}>
      <div className="container">
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 className="title-lg font-serif">Shopping Cart</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            You have <strong style={{ color: '#0f172a' }}>{itemsCount}</strong> items in your cart
          </p>
        </div>

        <div className="cart-grid">
          {/* Left Column: Cart Items List */}
          <div style={{ gridColumn: 'span 8' }} className="cart-items-col">
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: 'clamp(14px, 3.5vw, var(--radius-xl))',
                border: '1px solid #e2e8f0',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '1rem clamp(1rem, 3.5vw, 1.5rem)',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#fcfdfe',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                  Books ({itemsCount})
                </span>
                <button
                  type="button"
                  onClick={clearCart}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Clear Cart
                </button>
              </div>

              {/* Items */}
              <div>
                {cartItems.map((item) => (
                  <div
                    key={item.book._id}
                    className="cart-item-row"
                  >
                    <div className="cart-item-top">
                      {/* Thumbnail */}
                      <Link
                        to={`/book/${item.book._id}`}
                        style={{
                          width: '60px',
                          height: '84px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          flexShrink: 0,
                          backgroundColor: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={item.book.image}
                          alt={item.book.title}
                          style={{ maxWidth: '85%', maxHeight: '90%', objectFit: 'cover' }}
                        />
                      </Link>

                      {/* Book Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: 'var(--primary)',
                            letterSpacing: '0.04em',
                            display: 'block',
                          }}
                        >
                          {item.book.category}
                        </span>
                        <h3
                          style={{
                            fontSize: 'clamp(0.9rem, 2.5vw, 0.95rem)',
                            fontWeight: 700,
                            color: '#0f172a',
                            margin: '2px 0',
                            lineHeight: 1.35,
                            wordBreak: 'break-word',
                          }}
                        >
                          <Link to={`/book/${item.book._id}`} style={{ color: '#0f172a' }}>
                            {item.book.title}
                          </Link>
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          by {item.book.author}
                        </p>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                          ${Number(item.book.price).toFixed(2)} each
                        </p>
                      </div>
                    </div>

                    <div className="cart-item-actions">
                      {/* Quantity Stepper */}
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          backgroundColor: '#ffffff',
                          overflow: 'hidden',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.book._id, item.qty - 1)}
                          style={{
                            width: '32px',
                            height: '32px',
                            border: 'none',
                            background: '#f8fafc',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          -
                        </button>
                        <span style={{ padding: '0 0.5rem', fontWeight: 700, minWidth: '28px', textAlign: 'center', fontSize: '0.9rem' }}>
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.book._id, item.qty + 1)}
                          disabled={item.qty >= (item.book.stock || 99)}
                          style={{
                            width: '32px',
                            height: '32px',
                            border: 'none',
                            background: '#f8fafc',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal & Delete */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'right' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                          ${(item.book.price * item.qty).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.book._id)}
                          style={{
                            background: '#fee2e2',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Remove book"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Free shipping banner if below threshold */}
            {subtotal < 35 && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '0.85rem 1.15rem',
                  backgroundColor: '#eef2ff',
                  borderRadius: '12px',
                  border: '1px solid #c7d2fe',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: '#3730a3',
                  fontSize: '0.875rem',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <Truck size={20} flexShrink={0} />
                <span>
                  Add <strong>${(35 - subtotal).toFixed(2)}</strong> more to unlock <strong>Free Shipping</strong>!
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary & Coupon */}
          <div style={{ gridColumn: 'span 4' }} className="cart-summary-col">
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: 'clamp(14px, 3.5vw, var(--radius-xl))',
                border: '1px solid #e2e8f0',
                padding: 'clamp(1.25rem, 4vw, 1.75rem)',
                boxShadow: 'var(--shadow-sm)',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
                Order Summary
              </h3>

              {/* Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Items Subtotal</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>${subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                    <span>Promo Discount ({discountPercent}%)</span>
                    <span style={{ fontWeight: 700 }}>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Estimated Delivery</span>
                  <span style={{ fontWeight: 600, color: shippingFee === 0 ? '#10b981' : '#0f172a' }}>
                    {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Estimated Tax (8%)</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>${taxAmount.toFixed(2)}</span>
                </div>

                <div
                  style={{
                    borderTop: '2px dashed #e2e8f0',
                    paddingTop: '1rem',
                    marginTop: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Total Due</span>
                  <span style={{ fontSize: 'clamp(1.35rem, 4vw, 1.75rem)', fontWeight: 800, color: 'var(--primary)' }}>
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Coupon Form */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                <form onSubmit={handleCouponSubmit} style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. BOOKWORM)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.85rem', padding: '0.6rem 0.85rem', flex: 1, minWidth: 0 }}
                  />
                  <button
                    type="submit"
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.6rem 1rem', flexShrink: 0, whiteSpace: 'nowrap' }}
                  >
                    Apply
                  </button>
                </form>

                {promoSuccess && (
                  <p style={{ color: '#059669', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 600 }}>
                    {promoSuccess}
                  </p>
                )}
                {promoError && (
                  <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 600 }}>
                    {promoError}
                  </p>
                )}
              </div>

              {/* Checkout Button */}
              <div style={{ marginTop: '1.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      navigate('/login', { state: { from: { pathname: '/checkout' } } });
                    } else {
                      navigate('/checkout');
                    }
                  }}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
                >
                  {user ? (
                    <>
                      <span>Proceed to Checkout</span>
                      <ArrowRight size={18} />
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      <span>Sign In to Checkout & Pay</span>
                    </>
                  )}
                </button>

                {!user && (
                  <p
                    style={{
                      marginTop: '0.65rem',
                      fontSize: '0.78rem',
                      color: '#64748b',
                      textAlign: 'center',
                    }}
                  >
                    🔒 Login is required to place orders and proceed to payment.
                  </p>
                )}
              </div>

              <div
                style={{
                  marginTop: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  fontSize: '0.8rem',
                  color: '#64748b',
                }}
              >
                <ShieldCheck size={16} color="#10b981" />
                <span>Encrypted & secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cart-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 2.5rem;
          align-items: start;
          width: 100%;
        }
        @media (max-width: 900px) {
          .cart-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          .cart-items-col, .cart-summary-col {
            grid-column: 1 / -1 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
        .cart-item-row {
          padding: clamp(0.85rem, 3vw, 1.25rem);
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          border-bottom: 1px solid #f1f5f9;
          width: 100%;
          box-sizing: border-box;
        }
        .cart-item-top {
          display: flex;
          align-items: center;
          gap: clamp(0.75rem, 2.5vw, 1rem);
          width: 100%;
          min-width: 0;
        }
        .cart-item-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding-top: 0.65rem;
          border-top: 1px dashed #e2e8f0;
          box-sizing: border-box;
          margin-left: 0;
        }
        @media (min-width: 641px) {
          .cart-item-row {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
          }
          .cart-item-top {
            flex: 1 1 240px;
            width: auto;
          }
          .cart-item-actions {
            width: auto;
            padding-top: 0;
            border-top: none;
            gap: 1.5rem;
            margin-left: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default CartPage;
