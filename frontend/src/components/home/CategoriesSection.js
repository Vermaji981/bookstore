import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  Compass,
  Zap,
  Cpu,
  Search,
  TrendingUp,
  Heart,
  ArrowRight,
} from 'lucide-react';
import api from '../../api/api';

const iconMap = {
  BookOpen: BookOpen,
  Sparkles: Sparkles,
  Compass: Compass,
  Zap: Zap,
  Cpu: Cpu,
  Search: Search,
  TrendingUp: TrendingUp,
  Heart: Heart,
};

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api
      .get('/books/categories')
      .then((res) => {
        if (res.data.success) {
          setCategories(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load categories', err);
      });
  }, []);

  return (
    <section className="section" style={{ backgroundColor: 'white' }}>
      <div className="container">
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '1rem',
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
              Curated Collections
            </span>
            <h2 className="title-lg font-serif" style={{ marginTop: '0.35rem' }}>
              Explore by Popular Genre
            </h2>
          </div>

          <Link
            to="/books"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--primary)',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            <span>View All Genres</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid-categories">
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || BookOpen;
            return (
              <Link
                key={cat._id || cat.name}
                to={`/books?category=${encodeURIComponent(cat.name)}`}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  textDecoration: 'none',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                  }}
                >
                  <IconComponent size={24} />
                </div>

                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                    {cat.name}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                    {cat.count !== undefined ? `${cat.count} Titles` : 'Explore'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
