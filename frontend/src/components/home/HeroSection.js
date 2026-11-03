import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Sparkles,
  BookMarked,
} from 'lucide-react';

const HeroSection = () => {
  return (
    <section
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f1f5f9 100%)',
        padding: '5rem 0 3.5rem 0',
        overflow: 'hidden',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      {/* Decorative Blur Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div
          className="hero-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            alignItems: 'center',
            gap: 'clamp(2rem, 4vw, 3.5rem)',
          }}
        >
          {/* Left Text Content */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'white',
                padding: '0.4rem 1rem',
                borderRadius: '9999px',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid #e2e8f0',
                marginBottom: '1.5rem',
              }}
            >
              <Sparkles size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                Spring Reading Festival 2026
              </span>
            </div>

            <h1
              className="title-xl font-serif"
              style={{
                marginBottom: '1.25rem',
                color: '#0f172a',
              }}
            >
              Unlock Stories That <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Transform</span> Your World.
            </h1>

            <p
              style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
                color: '#475569',
                lineHeight: 1.6,
                marginBottom: '2rem',
                maxWidth: '540px',
              }}
            >
              Immerse yourself in thousands of curated bestsellers, timeless literary classics, and
              breakthrough non-fiction. Beautifully bound, swiftly delivered.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '2.5rem' }}>
              <Link to="/books?bestseller=true" className="btn btn-primary btn-lg" style={{ flex: '1 1 200px' }}>
                <span>Shop Bestsellers</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/books" className="btn btn-secondary btn-lg" style={{ flex: '1 1 180px' }}>
                <span>Explore Catalog</span>
              </Link>
            </div>

            {/* Quick Stat Highlights */}
            <div
              className="hero-stats-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'clamp(1rem, 3vw, 2rem)',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '1.5rem',
              }}
            >
              <div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>12,000+</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Curated Titles</p>
              </div>
              <div className="hero-stats-divider" style={{ width: '1px', height: '36px', backgroundColor: '#e2e8f0' }} />
              <div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>98.6%</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>5-Star Reader Reviews</p>
              </div>
              <div className="hero-stats-divider" style={{ width: '1px', height: '36px', backgroundColor: '#e2e8f0' }} />
              <div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>24h</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Fast Dispatch</p>
              </div>
            </div>
          </div>

          {/* Right Visual Floating Showcase */}
          <div
            className="hero-showcase"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              width: '100%',
              maxWidth: '100%',
              padding: '1.5rem 0',
            }}
          >
            {/* Center Book Spotlight */}
            <div
              style={{
                position: 'relative',
                width: 'clamp(200px, 58vw, 280px)',
                height: 'clamp(290px, 82vw, 400px)',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
                overflow: 'hidden',
                transform: 'rotate(-3deg)',
                transition: 'transform 0.4s ease',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600"
                alt="Featured Book"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: 'clamp(0.85rem, 3vw, 1.25rem)',
                  background: 'linear-gradient(to top, rgba(15,23,42,0.95), transparent)',
                  color: 'white',
                }}
              >
                <span className="badge badge-accent" style={{ marginBottom: '0.4rem' }}>
                  #1 Bestseller
                </span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
                  The Midnight Library
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Matt Haig • $16.50</p>
              </div>
            </div>

            {/* Overlapping Floating Secondary Book (Hidden on small mobile) */}
            <div
              style={{
                position: 'absolute',
                right: 'clamp(2%, 6vw, 10%)',
                top: '12%',
                width: 'clamp(110px, 32vw, 180px)',
                height: 'clamp(160px, 46vw, 260px)',
                borderRadius: '12px',
                boxShadow: '0 20px 35px -10px rgba(79, 70, 229, 0.4)',
                overflow: 'hidden',
                transform: 'rotate(7deg)',
                border: '3px solid white',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400"
                alt="Atomic Habits"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Floating Review Pill */}
            <div
              style={{
                position: 'absolute',
                bottom: '8%',
                left: 'clamp(1%, 4vw, 5%)',
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: 'clamp(0.6rem, 2vw, 0.85rem) clamp(0.75rem, 2.5vw, 1.25rem)',
                boxShadow: 'var(--shadow-xl)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                border: '1px solid #e2e8f0',
                maxWidth: '92%',
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b45309',
                  flexShrink: 0,
                }}
              >
                <BookMarked size={18} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                  Curator's Choice
                </p>
                <p style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  15,000+ copies sold this month
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div
          className="hero-highlights"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: '1.25rem',
            marginTop: 'clamp(2.5rem, 5vw, 4rem)',
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(1rem, 3vw, 1.75rem)',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                flexShrink: 0,
              }}
            >
              <Truck size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                Free Worldwide Shipping
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>On all orders over $35</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#065f46',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                100% Secure Checkout
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Stripe encrypted payments</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#b45309',
                flexShrink: 0,
              }}
            >
              <RotateCcw size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                30-Day Easy Returns
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Hassle-free guarantee</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#f3e8ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7e22ce',
                flexShrink: 0,
              }}
            >
              <Headphones size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                24/7 Dedicated Support
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Expert book advice</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
