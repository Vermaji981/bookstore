import React, { useState, useEffect } from 'react';
import { History, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookCard from './BookCard';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const RecentlyViewedSection = () => {
  const { user } = useAuth();
  const [recentBooks, setRecentBooks] = useState([]);

  const loadRecentBooks = async () => {
    // 1. Try local storage first
    try {
      const local = localStorage.getItem('pagehaven_recent_books');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentBooks(parsed.slice(0, 6));
        }
      }
    } catch (e) {}

    // 2. If user is logged in, sync with database
    if (user && user.token) {
      try {
        const res = await api.get('/wishlist/recently-viewed');
        if (res.data.success && res.data.data?.length > 0) {
          setRecentBooks(res.data.data.slice(0, 6));
        }
      } catch (err) {}
    }
  };

  useEffect(() => {
    loadRecentBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleClearHistory = () => {
    localStorage.removeItem('pagehaven_recent_books');
    setRecentBooks([]);
  };

  if (recentBooks.length === 0) return null;

  return (
    <section className="section" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={20} color="var(--primary)" />
              <h2 className="title-md font-serif" style={{ margin: 0 }}>Recently Viewed Books</h2>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
              Pick up right where you left off in your reading journey
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleClearHistory}
              style={{ fontSize: '0.8rem' }}
            >
              <Trash2 size={13} />
              <span>Clear History</span>
            </button>
            <Link
              to="/books"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: 'var(--primary)',
                textDecoration: 'none',
              }}
            >
              <span>Explore More</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div className="grid-books">
          {recentBooks.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewedSection;
