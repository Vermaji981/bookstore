import React from 'react';
import { Quote } from 'lucide-react';
import RatingStars from '../common/RatingStars';

const testimonials = [
  {
    name: 'Emily Thornton',
    role: 'Avid Book Club Host',
    rating: 5,
    comment:
      'PageHaven has completely revamped our book club. The packaging is pristine, delivery arrived within 48 hours, and the prices are significantly better than big box stores.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    bookTitle: 'The Midnight Library',
  },
  {
    name: 'Marcus Vance',
    role: 'Software Architect & Reader',
    rating: 5,
    comment:
      'Finding technical literature alongside great sci-fi under one roof with Stripe one-click payment was effortless. The order tracking was accurate down to the hour.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    bookTitle: 'Designing Data-Intensive Applications',
  },
  {
    name: 'Sophia Patel',
    role: 'Literature Professor',
    rating: 5,
    comment:
      'The book recommendations and curated collections are phenomenal. Every copy arrives in pristine condition with eco-friendly protective wrapping.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    bookTitle: 'Atomic Habits',
  },
];

const TestimonialsSection = () => {
  return (
    <section className="section testimonials-section">
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem auto' }}>
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--primary)',
              letterSpacing: '0.08em',
            }}
          >
            Reader Stories
          </span>
          <h2 className="title-lg font-serif" style={{ marginTop: '0.35rem' }}>
            Loved by Readers Worldwide
          </h2>
          <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Join over 50,000 satisfied readers who trust PageHaven for their literary journey.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: '1.5rem',
          }}
        >
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                padding: 'clamp(1.25rem, 4vw, 2rem)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
              }}
            >
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: '#e2e8f0' }}>
                <Quote size={40} />
              </div>

              <div>
                <RatingStars rating={t.rating} size={16} />
                <p
                  style={{
                    color: '#334155',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    marginTop: '1rem',
                    fontStyle: 'italic',
                  }}
                >
                  "{t.comment}"
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  marginTop: '1.75rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <img
                  src={t.avatar}
                  alt={t.name}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    {t.name}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
