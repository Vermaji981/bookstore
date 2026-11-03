import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Check,
  Heart,
} from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', paddingTop: 'clamp(2.5rem, 6vw, 4.5rem)', paddingBottom: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
      <div className="container">
        {/* Main Footer Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: 'clamp(1.5rem, 4vw, 2.5rem)',
            marginBottom: '3.5rem',
          }}
        >
          {/* Brand Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <BookOpen size={20} />
              </div>
              <span
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: 'white',
                  letterSpacing: '-0.02em',
                }}
              >
                Page<span style={{ color: '#818cf8' }}>Haven</span>
              </span>
            </Link>

            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#94a3b8' }}>
              Your curated online literary haven. Discover bestselling fiction, timeless classics,
              and thought-provoking non-fiction with secure global delivery.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="#818cf8" />
                <span>542 Bookstore Ave, Suite 100, New York, NY 10001</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="#818cf8" />
                <span>+1 (800) 555-READ (7323)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="#818cf8" />
                <span>support@pagehaven.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Explore Catalog
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
              <li>
                <Link to="/books" style={{ color: '#cbd5e1', transition: 'color 0.2s' }}>
                  All Books
                </Link>
              </li>
              <li>
                <Link to="/books?bestseller=true" style={{ color: '#cbd5e1' }}>
                  Bestsellers
                </Link>
              </li>
              <li>
                <Link to="/books?featured=true" style={{ color: '#cbd5e1' }}>
                  Featured Books
                </Link>
              </li>
              <li>
                <Link to="/books?newarrival=true" style={{ color: '#cbd5e1' }}>
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/books?category=Fiction" style={{ color: '#cbd5e1' }}>
                  Fiction & Literature
                </Link>
              </li>
              <li>
                <Link to="/books?category=Self-Help %26 Mindset" style={{ color: '#cbd5e1' }}>
                  Self-Help & Mindset
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div>
            <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Customer Support
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
              <li>
                <Link to="/track-order" style={{ color: '#cbd5e1' }}>
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/faq" style={{ color: '#cbd5e1' }}>
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" style={{ color: '#cbd5e1' }}>
                  Shipping & Delivery Info
                </Link>
              </li>
              <li>
                <Link to="/return-policy" style={{ color: '#cbd5e1' }}>
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" style={{ color: '#cbd5e1' }}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" style={{ color: '#cbd5e1' }}>
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div>
            <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Reader's Club
            </h4>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: '#cbd5e1' }}>
              Subscribe to get author interviews, reading lists, and an instant 15% discount code!
            </p>

            <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="email"
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #334155',
                  backgroundColor: '#1e293b',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                {subscribed ? (
                  <>
                    <Check size={16} /> Subscribed!
                  </>
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </form>
            {subscribed && (
              <p style={{ color: '#34d399', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                Welcome to PageHaven! Check your inbox for your 15% promo code.
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: '2rem',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>© {new Date().getFullYear()} PageHaven Bookstore Inc. All rights reserved. Made with</span>
            <Heart size={14} color="#ef4444" fill="#ef4444" />
            <span>for book lovers worldwide.</span>
          </div>

          {/* Payment Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Guaranteed Safe Checkout:</span>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge badge-neutral" style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}>
                Stripe Verified
              </span>
              <span className="badge badge-neutral" style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}>
                Visa
              </span>
              <span className="badge badge-neutral" style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}>
                Mastercard
              </span>
              <span className="badge badge-neutral" style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}>
                COD
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
