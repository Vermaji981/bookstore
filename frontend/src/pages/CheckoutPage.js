import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Banknote,
  ShieldCheck,
  AlertCircle,
  Lock,
  Gift,
  Award,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, discountAmount, shippingFee, taxAmount, total, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Shipping Form
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pinCode: user?.address?.pinCode || '',
    country: user?.address?.country || 'USA',
  });

  const [paymentMethod, setPaymentMethod] = useState('Stripe'); // 'Stripe' | 'Cash on Delivery' | 'Store Credit'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [stripeConfig, setStripeConfig] = useState({ publishableKey: '', isConfigured: true, isRealStripe: false });

  // Gift Card State
  const [giftCardCode, setGiftCardCode] = useState('');
  const [appliedGiftCard, setAppliedGiftCard] = useState(null);
  const [giftCardLoading, setGiftCardLoading] = useState(false);
  const [giftCardError, setGiftCardError] = useState('');

  // Loyalty Points State
  const [loyaltyProfile, setLoyaltyProfile] = useState(null);
  const [pointsToRedeemInput, setPointsToRedeemInput] = useState('');
  const [appliedLoyaltyDiscount, setAppliedLoyaltyDiscount] = useState(0);
  const [appliedPointsCount, setAppliedPointsCount] = useState(0);
  const [loyaltyError, setLoyaltyError] = useState('');

  // Card Payment Details
  const [cardData, setCardData] = useState({
    nameOnCard: user?.name || '',
    cardNumber: '',
    expDate: '',
    cvv: '',
  });

  const handleFillTestCard = () => {
    setCardData({
      nameOnCard: user?.name || 'Jane Doe',
      cardNumber: '4242 4242 4242 4242',
      expDate: '12/28',
      cvv: '123',
    });
  };

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } }, replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    // Check Stripe configuration on server
    api
      .get('/payment/config')
      .then((res) => {
        if (res.data.success) {
          setStripeConfig(res.data);
        }
      })
      .catch((err) => console.error('Stripe config check:', err));

    // Fetch user loyalty points
    if (user) {
      api
        .get('/loyalty/me')
        .then((res) => {
          if (res.data.success) {
            setLoyaltyProfile(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Compute discounts and final payable amount
  const giftCardDeduction = appliedGiftCard ? appliedGiftCard.appliedAmount : 0;
  const loyaltyDeduction = appliedLoyaltyDiscount || 0;
  const finalPayable = Math.max(0, Number((total - giftCardDeduction - loyaltyDeduction).toFixed(2)));

  useEffect(() => {
    if (finalPayable === 0 && (giftCardDeduction > 0 || loyaltyDeduction > 0)) {
      setPaymentMethod('Store Credit');
    } else if (paymentMethod === 'Store Credit' && finalPayable > 0) {
      setPaymentMethod('Stripe');
    }
  }, [finalPayable, giftCardDeduction, loyaltyDeduction, paymentMethod]);

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      const clean = value.replace(/\D/g, '').slice(0, 16);
      const formatted = clean.replace(/(\d{4})(?=\d)/g, '$1 ');
      setCardData((prev) => ({ ...prev, cardNumber: formatted }));
    } else if (name === 'expDate') {
      const clean = value.replace(/\D/g, '').slice(0, 4);
      let formatted = clean;
      if (clean.length > 2) {
        formatted = `${clean.slice(0, 2)}/${clean.slice(2)}`;
      }
      setCardData((prev) => ({ ...prev, expDate: formatted }));
    } else if (name === 'cvv') {
      const clean = value.replace(/\D/g, '').slice(0, 4);
      setCardData((prev) => ({ ...prev, cvv: clean }));
    } else {
      setCardData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Gift Card Redemption
  const handleApplyGiftCard = async (e) => {
    e.preventDefault();
    if (!giftCardCode.trim()) return;
    setGiftCardLoading(true);
    setGiftCardError('');

    try {
      const res = await api.post('/giftcards/check', { code: giftCardCode.trim().toUpperCase() });
      if (res.data.success) {
        const card = res.data.data;
        const availableBalance = card.currentBalance;
        if (availableBalance <= 0) {
          setGiftCardError('This gift card has $0.00 remaining balance.');
          setGiftCardLoading(false);
          return;
        }
        const maxApplicable = Math.min(availableBalance, total - loyaltyDeduction);
        setAppliedGiftCard({
          code: card.code,
          balance: availableBalance,
          appliedAmount: Number(maxApplicable.toFixed(2)),
        });
        showToast(`Gift card applied: -$${maxApplicable.toFixed(2)}`, 'success');
      } else {
        setGiftCardError(res.data.message || 'Invalid or expired gift card.');
      }
    } catch (err) {
      setGiftCardError(err.response?.data?.message || 'Could not verify gift card.');
    } finally {
      setGiftCardLoading(false);
    }
  };

  const handleRemoveGiftCard = () => {
    setAppliedGiftCard(null);
    setGiftCardCode('');
    setGiftCardError('');
  };

  // Loyalty Points Redemption
  const handleApplyLoyalty = async (e) => {
    e.preventDefault();
    setLoyaltyError('');
    const pts = parseInt(pointsToRedeemInput, 10);
    if (isNaN(pts) || pts <= 0) {
      setLoyaltyError('Enter a valid number of points.');
      return;
    }
    if (pts > (loyaltyProfile?.points || 0)) {
      setLoyaltyError(`You only have ${loyaltyProfile?.points || 0} points available.`);
      return;
    }

    try {
      const remainingAfterGiftCard = Math.max(0, total - giftCardDeduction);
      const res = await api.post('/loyalty/redeem-estimate', {
        pointsToRedeem: pts,
        orderSubtotal: remainingAfterGiftCard,
      });

      if (res.data.success) {
        setAppliedLoyaltyDiscount(res.data.data.discountAmount);
        setAppliedPointsCount(pts);
        showToast(`Loyalty reward applied: -$${res.data.data.discountAmount.toFixed(2)}`, 'success');
      }
    } catch (err) {
      setLoyaltyError(err.response?.data?.message || 'Failed to apply points.');
    }
  };

  const handleRemoveLoyalty = () => {
    setAppliedLoyaltyDiscount(0);
    setAppliedPointsCount(0);
    setPointsToRedeemInput('');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    // Form validation
    if (
      !shippingAddress.fullName ||
      !shippingAddress.email ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.pinCode
    ) {
      setErrorMsg('Please fill in all required shipping address fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Prepare order payload
      const orderData = {
        orderItems: cartItems.map((item) => ({
          book: item.book._id,
          title: item.book.title,
          image: item.book.image,
          price: item.book.price,
          qty: item.qty,
          format: item.format || 'Paperback',
        })),
        shippingAddress,
        paymentMethod: finalPayable === 0 ? 'Store Credit' : paymentMethod,
        itemsPrice: subtotal,
        discountPrice: discountAmount + giftCardDeduction + loyaltyDeduction,
        shippingPrice: shippingFee,
        taxPrice: taxAmount,
        totalPrice: finalPayable,
        giftCardCode: appliedGiftCard?.code || '',
        giftCardAmount: giftCardDeduction,
        loyaltyPointsRedeemed: appliedPointsCount,
      };

      // 2. Create Order in backend
      const res = await api.post('/orders', orderData);

      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to create order');
      }

      const createdOrder = res.data.data;

      // 3. Handle Zero Payable (Store Credit / Fully Covered)
      if (finalPayable === 0 || paymentMethod === 'Store Credit') {
        clearCart();
        navigate(`/order-success/${createdOrder._id}`);
        return;
      }

      // 4. Handle Cash on Delivery
      if (paymentMethod === 'Cash on Delivery') {
        clearCart();
        navigate(`/order-success/${createdOrder._id}`);
        return;
      }

      // 5. Handle Stripe Payment
      if (paymentMethod === 'Stripe') {
        if (!cardData.cardNumber.trim() || !cardData.expDate.trim() || !cardData.cvv.trim()) {
          setErrorMsg('Please enter your card number, expiration date, and CVC code.');
          setIsSubmitting(false);
          return;
        }

        if (!stripeConfig.isConfigured) {
          setErrorMsg(
            'Stripe test keys are not configured in backend/.env. Please configure STRIPE_SECRET_KEY & STRIPE_PUBLISHABLE_KEY, or switch to "Cash on Delivery" to complete this order.'
          );
          setIsSubmitting(false);
          return;
        }

        // Create Payment Intent on backend
        const intentRes = await api.post('/payment/create-payment-intent', {
          orderId: createdOrder._id,
        });

        if (!intentRes.data.success) {
          throw new Error(intentRes.data.message || 'Failed to initiate payment intent');
        }

        const { paymentIntentId } = intentRes.data;

        // Verify payment on the backend
        const verifyRes = await api.post('/payment/verify-payment', {
          orderId: createdOrder._id,
          paymentIntentId: paymentIntentId,
        });

        if (verifyRes.data.success) {
          clearCart();
          navigate(`/order-success/${createdOrder._id}`);
        } else {
          throw new Error(verifyRes.data.message || 'Payment verification failed');
        }
      }
    } catch (err) {
      console.error('Order checkout error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'An error occurred during checkout.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="section animate-fade-in" style={{ backgroundColor: '#f8fafc', minHeight: '85vh' }}>
      <div className="container">
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 className="title-lg font-serif">Checkout & Order Placement</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Enter your shipping delivery address, apply vouchers or loyalty rewards, and complete payment.
          </p>
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
            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div
            className="checkout-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: '2.5rem',
              alignItems: 'start',
            }}
          >
            {/* Left Column: Shipping Address, Rewards, & Payment Selection */}
            <div style={{ gridColumn: 'span 7' }} className="checkout-form-col">
              {/* Step 1: Shipping Address */}
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'clamp(1.25rem, 4vw, 2rem)',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'var(--shadow-sm)',
                  marginBottom: '2rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}
                  >
                    1
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                    Shipping Delivery Address
                  </h2>
                </div>

                <div className="form-row-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Eleanor Vance"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={shippingAddress.email}
                      onChange={handleInputChange}
                      placeholder="e.g. eleanor@example.com"
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +1 555-019-2834"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Street Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={shippingAddress.address}
                      onChange={handleInputChange}
                      placeholder="Apartment, suite, street"
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row-responsive" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">State / Province</label>
                    <input
                      type="text"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">ZIP / Postal Code *</label>
                    <input
                      type="text"
                      name="pinCode"
                      value={shippingAddress.pinCode}
                      onChange={handleInputChange}
                      placeholder="ZIP code"
                      required
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Gift Cards & Loyalty Rewards */}
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'clamp(1.25rem, 4vw, 2rem)',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'var(--shadow-sm)',
                  marginBottom: '2rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}
                  >
                    2
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      Gift Card & Loyalty Points
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Redeem bookstore gift cards or PageHaven loyalty points for immediate deduction.
                    </p>
                  </div>
                </div>

                {/* Gift Card Input */}
                <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Gift size={18} color="var(--primary)" />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                      Have a Bookstore Gift Card?
                    </span>
                  </div>

                  {appliedGiftCard ? (
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={18} color="#16a34a" />
                        <div>
                          <strong style={{ color: '#166534', fontSize: '0.9rem' }}>{appliedGiftCard.code}</strong>
                          <span style={{ color: '#15803d', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                            (-${appliedGiftCard.appliedAmount.toFixed(2)} applied)
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveGiftCard}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                        }}
                      >
                        <X size={16} /> Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          placeholder="PAGE-XXXX-XXXX-XXXX"
                          value={giftCardCode}
                          onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                          className="form-input"
                          style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.9rem' }}
                        />
                        <button
                          type="button"
                          onClick={handleApplyGiftCard}
                          disabled={giftCardLoading || !giftCardCode.trim()}
                          className="btn btn-secondary btn-sm"
                          style={{ flexShrink: 0, padding: '0 1.25rem' }}
                        >
                          {giftCardLoading ? 'Verifying...' : 'Apply Card'}
                        </button>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                        Sample demo codes: <code>PAGE-WELCOME-50</code>, <code>PAGE-SUMMER-25</code>, <code>READ-HAVEN-100</code>
                      </span>
                      {giftCardError && (
                        <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '4px' }}>{giftCardError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Loyalty Points Section */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Award size={18} color="#f59e0b" />
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                        Loyalty Points Balance
                      </span>
                    </div>
                    {loyaltyProfile && (
                      <span
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          padding: '3px 9px',
                          borderRadius: '20px',
                        }}
                      >
                        {loyaltyProfile.points} pts (~${(loyaltyProfile.points * 0.05).toFixed(2)})
                      </span>
                    )}
                  </div>

                  {appliedPointsCount > 0 ? (
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={18} color="#16a34a" />
                        <div>
                          <strong style={{ color: '#166534', fontSize: '0.9rem' }}>
                            {appliedPointsCount} Loyalty Points
                          </strong>
                          <span style={{ color: '#15803d', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                            (-${appliedLoyaltyDiscount.toFixed(2)} discount)
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveLoyalty}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                        }}
                      >
                        <X size={16} /> Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="number"
                          placeholder="e.g. 100 points = $5.00 discount"
                          min="10"
                          max={loyaltyProfile?.points || 0}
                          value={pointsToRedeemInput}
                          onChange={(e) => setPointsToRedeemInput(e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.9rem' }}
                        />
                        <button
                          type="button"
                          onClick={handleApplyLoyalty}
                          disabled={!pointsToRedeemInput || (loyaltyProfile?.points || 0) <= 0}
                          className="btn btn-secondary btn-sm"
                          style={{ flexShrink: 0, padding: '0 1.25rem' }}
                        >
                          Redeem Points
                        </button>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                        Earn 1.5x points on every order. 100 points = $5.00 discount.
                      </span>
                      {loyaltyError && (
                        <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '4px' }}>{loyaltyError}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Payment Method Selection */}
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'clamp(1.25rem, 4vw, 2rem)',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}
                  >
                    3
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      Payment Method
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {finalPayable === 0
                        ? 'Your order is 100% covered by credits/gift cards!'
                        : 'Choose your preferred payment gateway'}
                    </p>
                  </div>
                </div>

                {finalPayable === 0 ? (
                  <div
                    style={{
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: '2px solid #10b981',
                      backgroundColor: '#f0fdf4',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <CheckCircle2 size={24} color="#10b981" />
                    <div>
                      <strong style={{ color: '#166534', display: 'block' }}>Store Credit / Gift Card</strong>
                      <span style={{ fontSize: '0.85rem', color: '#15803d' }}>
                        No additional payment required. Click below to complete order.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Stripe Card Payment Option */}
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1.25rem',
                        borderRadius: '12px',
                        border: paymentMethod === 'Stripe' ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                        backgroundColor: paymentMethod === 'Stripe' ? 'var(--primary-light)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="Stripe"
                          checked={paymentMethod === 'Stripe'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        <div>
                          <span style={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>
                            Credit / Debit Card (Stripe Verified)
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Instant secure verification via Stripe 256-bit SSL encryption
                          </span>
                        </div>
                      </div>
                      <CreditCard size={24} color="var(--primary)" />
                    </label>

                    {/* Cash on Delivery Option */}
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1.25rem',
                        borderRadius: '12px',
                        border: paymentMethod === 'Cash on Delivery' ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                        backgroundColor: paymentMethod === 'Cash on Delivery' ? 'var(--primary-light)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="Cash on Delivery"
                          checked={paymentMethod === 'Cash on Delivery'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        <div>
                          <span style={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>
                            Cash on Delivery (COD)
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Pay with cash when courier delivers the books to your doorstep
                          </span>
                        </div>
                      </div>
                      <Banknote size={24} color="#10b981" />
                    </label>
                  </div>
                )}

                {/* Secure Card Payment Form */}
                {paymentMethod === 'Stripe' && finalPayable > 0 && (
                  <div
                    style={{
                      padding: '1.5rem',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 6px -1px rgba(0, 0, 0, 0.06)',
                      marginTop: '1.25rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1.25rem',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Lock size={16} color="var(--primary)" />
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                          Credit / Debit Card Details
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.68rem', padding: '3px 7px', background: '#f1f5f9', borderRadius: '4px', fontWeight: 700, color: '#1e40af', border: '1px solid #e2e8f0' }}>
                          VISA
                        </span>
                        <span style={{ fontSize: '0.68rem', padding: '3px 7px', background: '#f1f5f9', borderRadius: '4px', fontWeight: 700, color: '#ea580c', border: '1px solid #e2e8f0' }}>
                          MASTERCARD
                        </span>
                        <span style={{ fontSize: '0.68rem', padding: '3px 7px', background: '#f1f5f9', borderRadius: '4px', fontWeight: 700, color: '#0284c7', border: '1px solid #e2e8f0' }}>
                          AMEX
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                          Name on Card
                        </label>
                        <input
                          type="text"
                          name="nameOnCard"
                          placeholder="Cardholder Name"
                          value={cardData.nameOnCard}
                          onChange={handleCardInputChange}
                          className="form-input"
                          style={{ fontSize: '0.9rem' }}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                          Card Number
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            name="cardNumber"
                            placeholder="4242 ? 4242 ? 4242 ? 4242"
                            maxLength="19"
                            value={cardData.cardNumber}
                            onChange={handleCardInputChange}
                            className="form-input"
                            style={{ fontSize: '0.9rem', letterSpacing: '0.04em' }}
                          />
                          <CreditCard
                            size={16}
                            style={{
                              position: 'absolute',
                              right: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: '#94a3b8',
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                            Expiration Date
                          </label>
                          <input
                            type="text"
                            name="expDate"
                            placeholder="MM / YY"
                            maxLength="5"
                            value={cardData.expDate}
                            onChange={handleCardInputChange}
                            className="form-input"
                            style={{ fontSize: '0.9rem', textAlign: 'center' }}
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                            Security Code (CVC / CVV)
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="password"
                              name="cvv"
                              placeholder="***"
                              maxLength="4"
                              value={cardData.cvv}
                              onChange={handleCardInputChange}
                              className="form-input"
                              style={{ fontSize: '0.9rem', textAlign: 'center' }}
                            />
                            <Lock
                              size={14}
                              style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#94a3b8',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '1rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid #f1f5f9',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        🔒 256-bit SSL encrypted • Powered by Stripe
                      </span>
                      <button
                        type="button"
                        onClick={handleFillTestCard}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                          textDecoration: 'underline',
                        }}
                      >
                        Auto-fill test card
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Review & Submit */}
            <div style={{ gridColumn: 'span 5' }} className="checkout-review-col">
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'clamp(1.25rem, 4vw, 2rem)',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'sticky',
                  top: '90px',
                }}
              >
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
                  Review Your Order ({cartItems.length} Titles)
                </h3>

                {/* Items Mini List */}
                <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
                  {cartItems.map((item) => (
                    <div
                      key={item.book._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        padding: '0.65rem 0',
                        borderBottom: '1px solid #f1f5f9',
                      }}
                    >
                      <img
                        src={item.book.image}
                        alt={item.book.title}
                        style={{ width: '40px', height: '55px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.book.title}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Qty: {item.qty} {item.format && `(${item.format})`} • ${item.book.price.toFixed(2)}
                        </p>
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                        ${(item.book.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Cost Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Items Subtotal</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>${subtotal.toFixed(2)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                      <span>Coupon Discount</span>
                      <span style={{ fontWeight: 700 }}>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {appliedGiftCard && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                      <span>Gift Card ({appliedGiftCard.code})</span>
                      <span style={{ fontWeight: 700 }}>-${appliedGiftCard.appliedAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {appliedLoyaltyDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                      <span>Loyalty Reward ({appliedPointsCount} pts)</span>
                      <span style={{ fontWeight: 700 }}>-${appliedLoyaltyDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Delivery Fee</span>
                    <span style={{ fontWeight: 600, color: shippingFee === 0 ? '#10b981' : '#0f172a' }}>
                      {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Tax (8%)</span>
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
                    }}
                  >
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Total Amount</span>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                      ${finalPayable.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '1.75rem' }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary btn-lg"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.65rem',
                      padding: '1rem',
                      fontSize: '1.05rem',
                      boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.35)',
                    }}
                  >
                    {isSubmitting ? (
                      <span>Processing Order...</span>
                    ) : (
                      <>
                        <ShieldCheck size={20} />
                        <span>
                          {finalPayable === 0
                            ? 'Complete Order (Store Credit)'
                            : paymentMethod === 'Cash on Delivery'
                            ? `Confirm Order ($${finalPayable.toFixed(2)})`
                            : `Pay $${finalPayable.toFixed(2)} & Place Order`}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    color: '#64748b',
                    fontSize: '0.78rem',
                    marginTop: '1.25rem',
                    textAlign: 'center',
                  }}
                >
                  <Lock size={14} color="#10b981" />
                  <span>All transactions are secured and encrypted with Stripe 256-bit SSL</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
