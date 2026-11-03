import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Sparkles, Clock } from 'lucide-react';
import BookCard from '../common/BookCard';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../api/api';

const FeaturedSection = () => {
  const [activeTab, setActiveTab] = useState('featured'); // 'featured' | 'bestsellers' | 'newarrivals'
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let endpoint = '/books/featured';
    if (activeTab === 'bestsellers') endpoint = '/books/bestsellers';
    if (activeTab === 'newarrivals') endpoint = '/books/new-arrivals';

    api
      .get(endpoint)
      .then((res) => {
        if (res.data.success) {
          setBooks(res.data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load books for tab', activeTab, err);
        setLoading(false);
      });
  }, [activeTab]);

  return (
    <section className="section featured-books-section">
      <div className="container">
        {/* Header & Tabs */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--primary)',
                letterSpacing: '0.08em',
              }}
            >
              Handpicked Reads
            </span>
            <h2 className="title-lg font-serif" style={{ marginTop: '0.35rem' }}>
              Discover Top Titles
            </h2>
          </div>

          {/* Interactive Filter Tabs */}
          <div className="featured-tabs-wrapper">
            <button
              type="button"
              onClick={() => setActiveTab('featured')}
              className={`featured-tab-btn ${activeTab === 'featured' ? 'active' : ''}`}
            >
              <Sparkles size={16} />
              <span>Featured</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bestsellers')}
              className={`featured-tab-btn ${activeTab === 'bestsellers' ? 'active' : ''}`}
            >
              <Flame size={16} />
              <span>Best Sellers</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('newarrivals')}
              className={`featured-tab-btn ${activeTab === 'newarrivals' ? 'active' : ''}`}
            >
              <Clock size={16} />
              <span>New Arrivals</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner text="Fetching books from bookstore catalog..." />
        ) : books.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <p>No books available in this section yet.</p>
          </div>
        ) : (
          <div className="grid-books">
            {books.slice(0, 8).map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
          <Link to="/books" className="btn btn-secondary btn-lg">
            <span>Explore All {books.length > 0 ? 'Books' : 'Catalog'}</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
