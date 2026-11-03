import React from 'react';
import { Award, Heart, ShieldCheck } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="section animate-fade-in" style={{ backgroundColor: '#f8fafc' }}>
      <div className="container">
        {/* Hero */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 4rem auto' }}>
          <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>
            Our Literary Journey
          </span>
          <h1 className="title-xl font-serif">Connecting Readers With Enduring Words</h1>
          <p style={{ color: '#64748b', fontSize: '1.15rem', lineHeight: 1.7, marginTop: '1rem' }}>
            Founded in 2020, PageHaven is an independent online bookstore dedicated to celebrating
            the transformative power of physical books, authentic journalism, and diverse voices.
          </p>
        </div>

        {/* Feature Story Image & Text */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 'clamp(1.5rem, 4vw, 3rem)',
            alignItems: 'center',
            marginBottom: 'clamp(2.5rem, 6vw, 5rem)',
          }}
        >
          <div
            style={{
              borderRadius: 'clamp(16px, 4vw, 24px)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)',
              height: 'clamp(220px, 50vw, 420px)',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800"
              alt="Our Bookstore Library"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div>
            <h2 className="title-lg font-serif" style={{ marginBottom: '1.25rem' }}>
              We Believe Books Shape Human Destinies
            </h2>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              In an era dominated by rapid digital feeds, reading a physical book provides a rare,
              undivided sanctuary for deep contemplation. We hand-inspect every edition, partnering
              directly with boutique presses and major publishing houses.
            </p>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7 }}>
              From timeless philosophy to heart-racing thrillers and technical system design manuals,
              our shelves are thoughtfully curated for readers who cherish lasting ideas.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: '1.5rem',
          }}
        >
          <div className="card" style={{ padding: 'clamp(1.25rem, 4vw, 2rem)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Curated Excellence
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
              We do not stock clutter. Every title in our catalog is vetted for quality, impact, and reading pleasure.
            </p>
          </div>

          <div className="card" style={{ padding: 'clamp(1.25rem, 4vw, 2rem)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Heart size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Eco-Friendly Packaging
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
              100% recyclable, plastic-free cardboard mailers that protect your precious books and the environment.
            </p>
          </div>

          <div className="card" style={{ padding: 'clamp(1.25rem, 4vw, 2rem)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Reader Guarantee
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Damaged in transit? Don't love the copy? Our 30-day hassle-free replacement promise has you covered.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
