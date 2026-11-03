import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Award, Clock } from 'lucide-react';
import BookCard from '../common/BookCard';
import api from '../../api/api';

const SmartRecommendationsSection = () => {
  const [activeTab, setActiveTab] = useState('forYou'); // 'forYou' | 'trending' | 'bestSellers' | 'newArrivals'
  const [data, setData] = useState({
    forYou: [],
    trending: [],
    bestSellers: [],
    newArrivals: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api
      .get('/books/recommendations/smart')
      .then((res) => {
        if (res.data.success && res.data.data) {
          setData(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load smart recommendations:', err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const currentList = data[activeTab] || [];

  return (
    <section className="section smart-rec-section">
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
            Curated For Readers
          </span>
          <h2 className="title-lg font-serif">Smart Book Recommendations</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '580px', margin: '0.4rem auto 0 auto' }}>
            Personalized discovery powered by your reading preferences, trending titles, and literary editors
          </p>
        </div>

        {/* Filter Pills */}
        <div className="smart-rec-tabs-wrapper">
          <button
            type="button"
            className={`smart-tab-pill ${activeTab === 'forYou' ? 'active' : ''}`}
            onClick={() => setActiveTab('forYou')}
          >
            <Sparkles size={16} />
            <span>Recommended For You</span>
          </button>

          <button
            type="button"
            className={`smart-tab-pill ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => setActiveTab('trending')}
          >
            <TrendingUp size={16} />
            <span>Trending Now</span>
          </button>

          <button
            type="button"
            className={`smart-tab-pill ${activeTab === 'bestSellers' ? 'active' : ''}`}
            onClick={() => setActiveTab('bestSellers')}
          >
            <Award size={16} />
            <span>Bestsellers</span>
          </button>

          <button
            type="button"
            className={`smart-tab-pill ${activeTab === 'newArrivals' ? 'active' : ''}`}
            onClick={() => setActiveTab('newArrivals')}
          >
            <Clock size={16} />
            <span>New Releases</span>
          </button>
        </div>

        {/* Books Grid */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Curating personalized recommendations...</p>
          </div>
        ) : currentList.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>
            No books found for this category right now.
          </p>
        ) : (
          <div className="grid-books animate-fade-in">
            {currentList.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SmartRecommendationsSection;
