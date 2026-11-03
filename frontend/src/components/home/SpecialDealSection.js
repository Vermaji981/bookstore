import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const SpecialDealSection = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  // Simulated countdown to midnight
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dealBook = {
    _id: 'deal_atomic_habits',
    title: 'Atomic Habits: Tiny Changes, Remarkable Results',
    author: 'James Clear',
    price: 18.99,
    originalPrice: 27.00,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    category: 'Self-Help & Mindset',
    stock: 45,
  };

  const handleClaimDeal = () => {
    addToCart(dealBook, 1);
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  return (
    <section className="section" style={{ backgroundColor: 'white' }}>
      <div className="container">
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            borderRadius: '24px',
            padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3.5vw, 2.5rem)',
            color: 'white',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            alignItems: 'center',
            gap: 'clamp(1.5rem, 3vw, 2.5rem)',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.4)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-30%',
              right: '-10%',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(129, 140, 248, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Left Deal Info */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                color: '#fbbf24',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '1rem',
              }}
            >
              <Zap size={16} />
              <span>Deal of the Day • Limited Stock</span>
            </div>

            <h2 className="title-lg font-serif" style={{ color: 'white', marginBottom: '1rem' }}>
              Transform Your Daily Routine With Atomic Habits
            </h2>

            <p style={{ color: '#cbd5e1', fontSize: 'clamp(0.9rem, 2vw, 1rem)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              Over 10 million copies sold worldwide. Unlock James Clear's proven scientific framework
              for building good habits and eliminating bad ones. Special 30% discount expires today!
            </p>

            {/* Countdown Timer */}
            <div style={{ display: 'flex', gap: 'clamp(0.45rem, 2vw, 0.85rem)', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.65rem clamp(0.5rem, 2vw, 1rem)',
                  borderRadius: '12px',
                  textAlign: 'center',
                  minWidth: 'clamp(58px, 18vw, 72px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24', display: 'block' }}>
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Hours</span>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.65rem clamp(0.5rem, 2vw, 1rem)',
                  borderRadius: '12px',
                  textAlign: 'center',
                  minWidth: 'clamp(58px, 18vw, 72px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24', display: 'block' }}>
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Mins</span>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.65rem clamp(0.5rem, 2vw, 1rem)',
                  borderRadius: '12px',
                  textAlign: 'center',
                  minWidth: 'clamp(58px, 18vw, 72px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24', display: 'block' }}>
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Secs</span>
              </div>
            </div>

            {/* Price & CTA */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>$18.99</span>
                <span
                  style={{
                    fontSize: '1.1rem',
                    color: '#94a3b8',
                    textDecoration: 'line-through',
                    marginLeft: '0.6rem',
                  }}
                >
                  $27.00
                </span>
              </div>

              <button
                type="button"
                className="btn btn-accent btn-lg"
                onClick={handleClaimDeal}
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                <ShoppingBag size={20} />
                <span>Claim Deal Now</span>
              </button>
            </div>
          </div>

          {/* Right Image Display */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                position: 'relative',
                width: 'clamp(200px, 60vw, 260px)',
                height: 'clamp(280px, 85vw, 370px)',
                maxWidth: '100%',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                border: '4px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <img
                src={dealBook.image}
                alt={dealBook.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '9999px',
                  boxShadow: '0 4px 10px rgba(239, 68, 68, 0.5)',
                }}
              >
                SAVE 30%
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialDealSection;
