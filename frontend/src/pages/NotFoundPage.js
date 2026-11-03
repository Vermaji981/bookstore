import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Home, Search } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div
      className="section animate-fade-in"
      style={{
        backgroundColor: '#f8fafc',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <div className="container" style={{ maxWidth: '520px' }}>
        <div
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
          }}
        >
          <BookOpen size={44} />
        </div>

        <h1 style={{ fontSize: '4.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
          404
        </h1>

        <h2 className="title-md font-serif" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
          Page Not Found in Our Library
        </h2>

        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          It seems this page has been moved or was never written. Let's get you back to browsing our
          beloved collection of books.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary btn-lg">
            <Home size={18} />
            <span>Return Home</span>
          </Link>
          <Link to="/books" className="btn btn-secondary btn-lg">
            <Search size={18} />
            <span>Explore Catalog</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
