import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Grid,
  List,
  SlidersHorizontal,
  RotateCcw,
  BookOpen,
  X,
} from 'lucide-react';
import BookCard from '../components/common/BookCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../api/api';

const BooksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Filter States
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '60');
  const [minRating, setMinRating] = useState(searchParams.get('rating') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state if URL query changes
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory) setSelectedCategory(urlCategory);

    const urlKeyword = searchParams.get('keyword');
    if (urlKeyword !== null) setKeyword(urlKeyword);

    const urlSort = searchParams.get('sort');
    if (urlSort) setSortBy(urlSort);
  }, [searchParams]);

  // Load categories on mount
  useEffect(() => {
    api
      .get('/books/categories')
      .then((res) => {
        if (res.data.success) {
          setCategories(res.data.data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch books whenever filters change
  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, maxPrice, minRating, sortBy, searchParams]);

  const fetchBooks = (page = 1) => {
    setLoading(true);

    const params = new URLSearchParams();
    if (keyword.trim()) params.append('keyword', keyword.trim());
    if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (minRating) params.append('rating', minRating);
    if (sortBy) params.append('sort', sortBy);
    params.append('page', page);
    params.append('limit', 12);

    if (searchParams.get('bestseller') === 'true') params.append('bestseller', 'true');
    if (searchParams.get('featured') === 'true') params.append('featured', 'true');
    if (searchParams.get('newarrival') === 'true') params.append('newarrival', 'true');

    api
      .get(`/books?${params.toString()}`)
      .then((res) => {
        if (res.data.success) {
          setBooks(res.data.data);
          setPagination(res.data.pagination);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch books', err);
        setLoading(false);
      });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBooks(1);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setSelectedCategory('All');
    setMaxPrice('60');
    setMinRating('');
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="section animate-fade-in" style={{ backgroundColor: '#f8fafc', minHeight: '80vh' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 className="title-lg font-serif">Explore Bookstore Catalog</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.35rem' }}>
            Find the perfect book among our collection of bestsellers, classics, and emerging voices.
          </p>
        </div>

        {/* Layout Grid: Sidebar Filters + Main Books Area */}
        <div
          className="catalog-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* Sidebar Filters - Desktop */}
          <aside
            style={{
              gridColumn: 'span 3',
              backgroundColor: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              border: '1px solid #e2e8f0',
              boxShadow: 'var(--shadow-sm)',
              position: 'sticky',
              top: '90px',
            }}
            className="desktop-filter-sidebar"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}>
                <SlidersHorizontal size={18} color="var(--primary)" />
                <span>Filter Books</span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            {/* Keyword Search */}
            <div className="form-group">
              <label className="form-label">Search Query</label>
              <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Title or author..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="form-input"
                  style={{ paddingRight: '2rem' }}
                />
                <button
                  type="submit"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                  }}
                >
                  <Search size={16} />
                </button>
              </form>
            </div>

            {/* Categories */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.6rem' }}>Category</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  style={{
                    textAlign: 'left',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: selectedCategory === 'All' ? 'var(--primary)' : 'transparent',
                    color: selectedCategory === 'All' ? '#ffffff' : '#475569',
                    fontWeight: selectedCategory === 'All' ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>All Categories</span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 7px',
                      borderRadius: '10px',
                      backgroundColor: selectedCategory === 'All' ? 'rgba(255, 255, 255, 0.25)' : '#f1f5f9',
                      color: selectedCategory === 'All' ? '#ffffff' : '#64748b',
                      fontWeight: 600,
                    }}
                  >
                    {pagination.total || books.length}
                  </span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id || cat.name}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: selectedCategory === cat.name ? 'var(--primary)' : 'transparent',
                      color: selectedCategory === cat.name ? '#ffffff' : '#475569',
                      fontWeight: selectedCategory === cat.name ? 700 : 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{cat.name}</span>
                    {cat.count !== undefined && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '2px 7px',
                          borderRadius: '10px',
                          backgroundColor: selectedCategory === cat.name ? 'rgba(255, 255, 255, 0.25)' : '#f1f5f9',
                          color: selectedCategory === cat.name ? '#ffffff' : '#64748b',
                          fontWeight: 600,
                        }}
                      >
                        {cat.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Max Price</label>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>${maxPrice}</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                <span>$10</span>
                <span>$80+</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Minimum Rating</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {[
                  { label: '4.5 & above', val: '4.5' },
                  { label: '4.0 & above', val: '4.0' },
                  { label: '3.5 & above', val: '3.5' },
                ].map((r) => (
                  <label
                    key={r.val}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === r.val}
                      onChange={() => setMinRating(minRating === r.val ? '' : r.val)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Products Container */}
          <main style={{ gridColumn: 'span 9' }} className="catalog-main">
            {/* Top Toolbar */}
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.25rem',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                marginBottom: '1.75rem',
              }}
            >
              {/* Count & Status */}
              <div>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  Showing <strong style={{ color: '#0f172a' }}>{books.length}</strong> of{' '}
                  <strong style={{ color: '#0f172a' }}>{pagination.total}</strong> books
                  {selectedCategory !== 'All' && <span> in <strong>{selectedCategory}</strong></span>}
                </p>
              </div>

              {/* Controls: Sorting and Grid/List toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                {/* Mobile Filter Button */}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm mobile-filter-btn"
                  onClick={() => setMobileFilterOpen(true)}
                  style={{ display: 'none', alignItems: 'center', gap: '0.4rem' }}
                >
                  <SlidersHorizontal size={15} />
                  <span>Filters</span>
                  {((selectedCategory !== 'All' ? 1 : 0) + (maxPrice !== '60' ? 1 : 0) + (minRating ? 1 : 0)) > 0 && (
                    <span className="badge badge-primary" style={{ padding: '0.1rem 0.45rem', fontSize: '0.7rem' }}>
                      {(selectedCategory !== 'All' ? 1 : 0) + (maxPrice !== '60' ? 1 : 0) + (minRating ? 1 : 0)}
                    </span>
                  )}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Sort:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="form-select"
                    style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating_desc">Highest Customer Rating</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>

                <div
                  style={{
                    display: 'flex',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '8px',
                    padding: '2px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    style={{
                      padding: '6px',
                      border: 'none',
                      borderRadius: '6px',
                      background: viewMode === 'grid' ? 'white' : 'transparent',
                      color: viewMode === 'grid' ? 'var(--primary)' : '#64748b',
                      cursor: 'pointer',
                      boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none',
                    }}
                    title="Grid View"
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    style={{
                      padding: '6px',
                      border: 'none',
                      borderRadius: '6px',
                      background: viewMode === 'list' ? 'white' : 'transparent',
                      color: viewMode === 'list' ? 'var(--primary)' : '#64748b',
                      cursor: 'pointer',
                      boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none',
                    }}
                    title="List View"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Chips */}
            {(selectedCategory !== 'All' || maxPrice !== '60' || minRating || keyword.trim()) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Active Filters:</span>
                {selectedCategory !== 'All' && (
                  <span
                    className="badge badge-primary"
                    style={{ cursor: 'pointer', padding: '0.3rem 0.65rem' }}
                    onClick={() => setSelectedCategory('All')}
                  >
                    Category: {selectedCategory} ✕
                  </span>
                )}
                {maxPrice !== '60' && (
                  <span
                    className="badge badge-primary"
                    style={{ cursor: 'pointer', padding: '0.3rem 0.65rem' }}
                    onClick={() => setMaxPrice('60')}
                  >
                    Under ${maxPrice} ✕
                  </span>
                )}
                {minRating && (
                  <span
                    className="badge badge-primary"
                    style={{ cursor: 'pointer', padding: '0.3rem 0.65rem' }}
                    onClick={() => setMinRating('')}
                  >
                    Rating: {minRating}+ ★ ✕
                  </span>
                )}
                {keyword.trim() && (
                  <span
                    className="badge badge-primary"
                    style={{ cursor: 'pointer', padding: '0.3rem 0.65rem' }}
                    onClick={() => {
                      setKeyword('');
                      searchParams.delete('keyword');
                      setSearchParams(searchParams);
                    }}
                  >
                    "{keyword}" ✕
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginLeft: '0.25rem',
                  }}
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Books Listing */}
            {loading ? (
              <LoadingSpinner text="Searching catalogue..." />
            ) : books.length === 0 ? (
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-lg)',
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto',
                    color: 'var(--primary)',
                  }}
                >
                  <BookOpen size={30} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  No matching books found
                </h3>
                <p style={{ color: '#64748b', maxWidth: '420px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
                  We couldn't find any titles matching your current filter criteria. Try adjusting your
                  search or clearing category filters.
                </p>
                <button type="button" className="btn btn-primary" onClick={handleResetFilters}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid-books' : 'list-books'}>
                {books.map((book) => (
                  <BookCard key={book._id} book={book} viewMode={viewMode} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '3rem',
                }}
              >
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => fetchBooks(pageNum)}
                    className={`btn ${pagination.page === pageNum ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    style={{ width: '38px', height: '38px', padding: 0 }}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Slide-Over Drawer */}
      {mobileFilterOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className="animate-fade-in"
            style={{
              width: '88vw',
              maxWidth: '380px',
              height: '100%',
              backgroundColor: 'white',
              boxShadow: 'var(--shadow-xl)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              padding: '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, fontSize: '1.1rem' }}>
                <SlidersHorizontal size={20} color="var(--primary)" />
                <span>Filter Books</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Keyword Search */}
            <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Search Books</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Title, author, keyword..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.4rem', fontSize: '0.9rem' }}
                />
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                />
              </div>
            </form>

            {/* Category Filter */}
            <div className="form-group">
              <label className="form-label">Book Categories</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
                style={{ fontSize: '0.9rem' }}
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Max Price</label>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>${maxPrice}</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                <span>$10</span>
                <span>$80+</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="form-group">
              <label className="form-label">Minimum Rating</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {[
                  { label: '4.5 & above', val: '4.5' },
                  { label: '4.0 & above', val: '4.0' },
                  { label: '3.5 & above', val: '3.5' },
                ].map((r) => (
                  <label
                    key={r.val}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="mobile_rating"
                      checked={minRating === r.val}
                      onChange={() => setMinRating(minRating === r.val ? '' : r.val)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  fetchBooks(1);
                  setMobileFilterOpen(false);
                }}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Apply & View ({books.length}) Books
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  handleResetFilters();
                  setMobileFilterOpen(false);
                }}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-filter-sidebar {
            display: none !important;
          }
          .catalog-main {
            grid-column: span 12 !important;
          }
          .mobile-filter-btn {
            display: inline-flex !important;
          }
        }
        @media (min-width: 901px) {
          .mobile-filter-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BooksPage;
