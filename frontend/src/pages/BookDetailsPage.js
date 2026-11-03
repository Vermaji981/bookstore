import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Zap,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  BookOpen,
  Scale,
  Bell,
  ThumbsUp,
  Flag,
  MessageSquare,
} from 'lucide-react';
import RatingStars from '../components/common/RatingStars';
import BookCard from '../components/common/BookCard';
import BookPreviewModal from '../components/common/BookPreviewModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { useToast } from '../context/ToastContext';
import api from '../api/api';

const BookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { addToCompare, isComparing } = useCompare();
  const { showToast } = useToast();

  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [bundleData, setBundleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'specs' | 'reviews'
  const [added, setAdded] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);

  // Price Alert Modal
  const [priceAlertOpen, setPriceAlertOpen] = useState(false);
  const [targetPriceInput, setTargetPriceInput] = useState('');
  const [alertSubmitted, setAlertSubmitted] = useState(false);

  // Review form states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setReviewError('');
    setReviewSuccess('');

    api
      .get(`/books/${id}`)
      .then((res) => {
        if (res.data.success) {
          const currentBook = res.data.data;
          setBook(currentBook);

          // Default format selection
          if (currentBook.formats && currentBook.formats.length > 0) {
            setSelectedFormat(currentBook.formats[0]);
          }

          // Track Recently Viewed in local storage
          try {
            const recentStr = localStorage.getItem('pagehaven_recent_books');
            const recentList = recentStr ? JSON.parse(recentStr) : [];
            const filtered = recentList.filter((b) => b._id !== currentBook._id);
            filtered.unshift(currentBook);
            localStorage.setItem('pagehaven_recent_books', JSON.stringify(filtered.slice(0, 10)));
          } catch (e) {}

          // If logged in, sync with database
          if (user && user.token) {
            api.post('/wishlist/recently-viewed', { bookId: currentBook._id }).catch(() => {});
          }

          // Fetch related books in the same category or overall catalog
          api
            .get(`/books?category=${encodeURIComponent(currentBook.category)}&limit=6`)
            .then(async (relRes) => {
              let related = [];
              if (relRes.data.success) {
                related = relRes.data.data.filter((b) => b._id !== currentBook._id);
              }
              if (related.length < 4) {
                try {
                  const fallbackRes = await api.get('/books?limit=8');
                  if (fallbackRes.data.success) {
                    const extra = fallbackRes.data.data.filter(
                      (b) => b._id !== currentBook._id && !related.some((rb) => rb._id === b._id)
                    );
                    related = [...related, ...extra].slice(0, 4);
                  }
                } catch (e) {}
              }
              setRelatedBooks(related.slice(0, 4));
            })
            .catch(() => {});

          // Fetch frequently bought together bundle
          api
            .get(`/books/${currentBook._id}/frequently-bought-together`)
            .then((bunRes) => {
              if (bunRes.data.success) {
                setBundleData(bunRes.data.data);
              }
            })
            .catch(() => {});
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load book details', err);
        setLoading(false);
      });
  }, [id, user]);

  if (loading) {
    return <LoadingSpinner text="Retrieving book details..." />;
  }

  if (!book) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <h2>Book not found</h2>
        <p style={{ color: '#64748b', margin: '1rem 0' }}>The book you are looking for does not exist.</p>
        <Link to="/books" className="btn btn-primary">
          Back to Bookstore Catalog
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(book._id);
  const activePrice = selectedFormat ? selectedFormat.price : book.price;
  const activeOrigPrice = selectedFormat?.originalPrice || book.originalPrice;
  const discount =
    activeOrigPrice && activeOrigPrice > activePrice
      ? Math.round(((activeOrigPrice - activePrice) / activeOrigPrice) * 100)
      : null;

  const handleAddToCart = () => {
    if (book.stock <= 0) return;
    const itemToAdd = {
      ...book,
      price: activePrice,
      format: selectedFormat ? selectedFormat.formatType : 'Paperback',
    };
    addToCart(itemToAdd, qty);
    setAdded(true);
    showToast(`Added ${qty} × "${book.title}" (${itemToAdd.format}) to cart!`, 'success');
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (book.stock <= 0) return;
    const itemToAdd = {
      ...book,
      price: activePrice,
      format: selectedFormat ? selectedFormat.formatType : 'Paperback',
    };
    addToCart(itemToAdd, qty);
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  const handleAddBundleToCart = () => {
    if (!bundleData) return;
    addToCart({ ...book, price: activePrice }, 1);
    bundleData.bundleItems.forEach((b) => addToCart(b, 1));
    showToast(`Added ${bundleData.bundleItems.length + 1} bundle books to cart with 10% savings!`, 'success');
  };

  const handlePriceAlertSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post('/wishlist/price-alert', {
        bookId: book._id,
        targetPrice: targetPriceInput || activePrice * 0.9,
      });
      if (res.data.success) {
        setAlertSubmitted(true);
        showToast(res.data.message, 'success');
        setTimeout(() => setPriceAlertOpen(false), 2500);
      }
    } catch (err) {
      showToast('Failed to activate price alert', 'error');
    }
  };

  const handleHelpfulVote = async (reviewId) => {
    if (!user) {
      showToast('Please sign in to vote on reviews', 'info');
      return;
    }
    try {
      const res = await api.post(`/reviews/${reviewId}/helpful`);
      if (res.data.success) {
        showToast(res.data.message, 'success');
        // Update review in place
        setBook((prev) => ({
          ...prev,
          reviews: prev.reviews.map((r) =>
            r._id === reviewId
              ? {
                  ...r,
                  helpfulVotes: res.data.hasVoted
                    ? [...(r.helpfulVotes || []), user._id]
                    : (r.helpfulVotes || []).filter((id) => id !== user._id),
                }
              : r
          ),
        }));
      }
    } catch (err) {}
  };

  const handleReportReview = async (reviewId) => {
    if (!user) {
      showToast('Please sign in to report reviews', 'info');
      return;
    }
    try {
      await api.post(`/reviews/${reviewId}/report`, { reason: 'Flagged by user' });
      showToast('Review reported to moderators for investigation', 'success');
    } catch (err) {}
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError('Please write your review thoughts');
      return;
    }

    setReviewSubmitting(true);
    setReviewError('');

    try {
      const res = await api.post(`/books/${book._id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });

      if (res.data.success) {
        setReviewSuccess('Thank you! Your verified review has been published.');
        setReviewComment('');
        showToast('Review submitted successfully!', 'success');
        const updatedBookRes = await api.get(`/books/${book._id}`);
        if (updatedBookRes.data.success) {
          setBook(updatedBookRes.data.data);
        }
      }
    } catch (err) {
      setReviewError(
        err.response?.data?.message || 'Failed to submit review. You may have already reviewed this book.'
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="section animate-fade-in book-details-page-section">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="book-details-breadcrumbs">
          <Link to="/">
            Home
          </Link>
          <ChevronRight size={14} />
          <Link to="/books">
            Books
          </Link>
          <ChevronRight size={14} />
          <Link
            to={`/books?category=${encodeURIComponent(book.category)}`}
          >
            {book.category}
          </Link>
          <ChevronRight size={14} />
          <span className="current-crumb">{book.title}</span>
        </nav>

        {/* Main Product Layout: 2 Columns */}
        <div className="book-details-main-card">
          {/* Left Column: Book Cover Display */}
          <div className="book-details-left-col">
            <div className="book-details-cover-box">
              <img
                src={book.image}
                alt={book.title}
                className="book-details-cover-img"
              />

              {discount && (
                <div className="badge badge-accent book-details-discount-pill">
                  SAVE {discount}%
                </div>
              )}
            </div>

            {/* Quick Interactive Actions Row */}
            <div className="book-details-cover-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                onClick={() => setPreviewOpen(true)}
              >
                <BookOpen size={16} />
                <span>Read Sample</span>
              </button>

              <button
                type="button"
                className={`btn btn-secondary btn-sm ${isComparing(book._id) ? 'active' : ''}`}
                style={{ flex: 1 }}
                onClick={() => addToCompare(book)}
              >
                <Scale size={16} />
                <span>Compare</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPriceAlertOpen(true)}
                title="Get Price Drop Alert"
              >
                <Bell size={16} />
              </button>
            </div>
          </div>

          {/* Right Column: Book Information & Purchase Controls */}
          <div className="book-details-right-col">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
                {book.category}
              </span>

              <button
                type="button"
                className={`wishlist-btn ${isFavorited ? 'active' : ''}`}
                style={{ position: 'static' }}
                onClick={() => toggleWishlist(book)}
                title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={20} color={isFavorited ? '#ef4444' : '#64748b'} fill={isFavorited ? '#ef4444' : 'none'} />
              </button>
            </div>

            <h1 className="title-lg font-serif book-details-title">
              {book.title}
            </h1>

            <p className="book-details-meta">
              Author:{' '}
              <Link
                to={`/author/${encodeURIComponent(book.author)}`}
                className="book-details-author-link"
              >
                {book.author}
              </Link>{' '}
              • Publisher:{' '}
              <Link
                to={`/publisher/${encodeURIComponent(book.publisher || 'PageHaven Press')}`}
                className="book-details-pub-link"
              >
                {book.publisher || 'PageHaven Press'}
              </Link>
            </p>

            {/* Ratings & Reviews Count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <RatingStars rating={book.rating || 4.5} numReviews={book.numReviews || 0} size={18} />
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span className="book-details-choice-badge">
                Verified Reader Choice
              </span>
            </div>

            {/* Format Selector Pills */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="format-selector-label">
                Select Book Format:
              </span>
              <div className="format-selector-grid">
                {(book.formats && book.formats.length > 0
                  ? book.formats
                  : [
                      { formatType: 'Paperback', price: book.price },
                      { formatType: 'Hardcover', price: Number((book.price * 1.35).toFixed(2)) },
                      { formatType: 'E-book', price: Number((book.price * 0.7).toFixed(2)) },
                      { formatType: 'Audiobook', price: Number((book.price * 1.15).toFixed(2)) },
                    ]
                ).map((fmt, idx) => {
                  const isSelected = selectedFormat ? selectedFormat.formatType === fmt.formatType : idx === 0;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`format-choice-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedFormat(fmt)}
                    >
                      <span className="format-name">{fmt.formatType}</span>
                      <span className="format-price">${Number(fmt.price).toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Box */}
            <div className="book-price-display-box">
              <span className="price-main">
                ${Number(activePrice).toFixed(2)}
              </span>
              {activeOrigPrice && activeOrigPrice > activePrice && (
                <>
                  <span className="price-orig">
                    ${Number(activeOrigPrice).toFixed(2)}
                  </span>
                  <span className="price-save-badge">
                    You save ${(activeOrigPrice - activePrice).toFixed(2)} ({discount}%)
                  </span>
                </>
              )}
            </div>

            {/* Stock Availability */}
            <div style={{ marginBottom: '1.25rem' }}>
              {book.stock > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      display: 'inline-block',
                    }}
                  />
                  <span>In Stock ({book.stock} copies ready for instant dispatch)</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#ef4444',
                      display: 'inline-block',
                    }}
                  />
                  <span>Out of Stock</span>
                </div>
              )}
            </div>

            {/* Quantity Selector & Action Buttons */}
            {book.stock > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Quantity:</span>
                  <div className="quantity-control-wrap">
                    <button
                      type="button"
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="quantity-val">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(Math.min(book.stock, qty + 1))}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  <button
                    type="button"
                    className={`btn ${added ? 'btn-success' : 'btn-primary'} btn-lg`}
                    onClick={handleAddToCart}
                    style={{ flex: 1, minWidth: '180px' }}
                  >
                    {added ? (
                      <>
                        <Check size={20} />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={20} />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-accent btn-lg"
                    onClick={handleBuyNow}
                    style={{ flex: 1, minWidth: '160px' }}
                  >
                    <Zap size={20} />
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
            )}

            {/* Guarantee badges */}
            <div className="book-details-trust-grid">
              <div className="book-details-trust-item">
                <Truck size={20} color="var(--primary)" />
                <div>
                  <strong>Free Delivery</strong>
                  <p>On all orders over $35</p>
                </div>
              </div>
              <div className="book-details-trust-item">
                <ShieldCheck size={20} color="#10b981" />
                <div>
                  <strong>100% Secure</strong>
                  <p>Stripe 256-bit checkout</p>
                </div>
              </div>
              <div className="book-details-trust-item">
                <RotateCcw size={20} color="#f59e0b" />
                <div>
                  <strong>Easy Returns</strong>
                  <p>30-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Bought Together Bundle */}
        {bundleData && bundleData.bundleItems && bundleData.bundleItems.length > 0 && (
          <div className="bundle-card animate-fade-in">
            <h3 className="bundle-title">
              Frequently Bought Together
            </h3>
            <div className="bundle-layout">
              {/* Main book + companion books covers */}
              <div className="bundle-items-row">
                <div className="bundle-item-card">
                  <div className="bundle-thumb-wrap">
                    <img src={book.image} alt={book.title} className="bundle-thumb" />
                  </div>
                  <p className="bundle-item-title" title={book.title}>
                    {book.title}
                  </p>
                  <span className="bundle-item-price">${Number(book.price).toFixed(2)}</span>
                </div>

                {bundleData.bundleItems.map((bItem) => (
                  <React.Fragment key={bItem._id}>
                    <span className="bundle-plus-icon">+</span>
                    <div className="bundle-item-card">
                      <div className="bundle-thumb-wrap">
                        <img src={bItem.image} alt={bItem.title} className="bundle-thumb" />
                      </div>
                      <p className="bundle-item-title" title={bItem.title}>
                        {bItem.title}
                      </p>
                      <span className="bundle-item-price">${Number(bItem.price).toFixed(2)}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              {/* Pricing & Add All Button */}
              <div className="bundle-cta-box">
                <span className="badge badge-success bundle-savings-badge">
                  10% Extra Bundle Savings
                </span>
                <div className="bundle-pricing-row">
                  <span className="bundle-price-main">
                    ${bundleData.pricing?.bundlePrice.toFixed(2)}
                  </span>
                  <span className="bundle-price-orig">
                    ${bundleData.pricing?.regularTotal.toFixed(2)}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm bundle-add-btn"
                  onClick={handleAddBundleToCart}
                >
                  <ShoppingBag size={16} />
                  <span>Add All {bundleData.bundleItems.length + 1} to Cart</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Details & Reviews Tabs */}
        <div className="book-details-tabs-card">
          {/* Tab Navigation */}
          <div className="book-details-tab-nav">
            <button
              type="button"
              onClick={() => setActiveTab('description')}
              className={`book-details-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            >
              Description & Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`book-details-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
            >
              Specifications & ISBN
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`book-details-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            >
              Customer Reviews ({book.reviews ? book.reviews.length : 0})
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            {activeTab === 'description' && (
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)', marginBottom: '1rem' }}>
                  About "{book.title}"
                </h3>
                <p style={{ color: 'var(--text-secondary, #475569)', fontSize: '1.05rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                  {book.description}
                </p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                <div className="book-spec-box">
                  <span className="spec-label">Publisher</span>
                  <p className="spec-value">{book.publisher || 'PageHaven Press'}</p>
                </div>

                <div className="book-spec-box">
                  <span className="spec-label">ISBN</span>
                  <p className="spec-value">{book.isbn || '978-0123456789'}</p>
                </div>

                <div className="book-spec-box">
                  <span className="spec-label">Publication Date</span>
                  <p className="spec-value">{book.publicationDate || '2023'}</p>
                </div>

                <div className="book-spec-box">
                  <span className="spec-label">Language</span>
                  <p className="spec-value">{book.language || 'English'}</p>
                </div>

                <div className="book-spec-box">
                  <span className="spec-label">Page Count</span>
                  <p className="spec-value">{book.pageCount || 320} Pages</p>
                </div>

                <div className="book-spec-box">
                  <span className="spec-label">Dimensions</span>
                  <p className="spec-value">
                    {book.specifications?.dimensions || '5.5 x 0.8 x 8.4 in'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {/* Write a review form */}
                <div className="book-review-form-card">
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                    Share Your Thoughts on This Book
                  </h3>

                  {reviewSuccess && (
                    <div style={{ padding: '0.85rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                      {reviewSuccess}
                    </div>
                  )}

                  {reviewError && (
                    <div style={{ padding: '0.85rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                      {reviewError}
                    </div>
                  )}

                  {user ? (
                    <form onSubmit={handleReviewSubmit}>
                      <div className="form-group">
                        <label className="form-label">Your Rating</label>
                        <RatingStars
                          rating={reviewRating}
                          interactive={true}
                          onRatingChange={(r) => setReviewRating(r)}
                          size={24}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Your Review & Analysis</label>
                        <textarea
                          placeholder="What did you love about this book? Who would you recommend it to?"
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="form-textarea"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={reviewSubmitting}
                      >
                        {reviewSubmitting ? 'Posting Review...' : 'Submit Verified Review'}
                      </button>
                    </form>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                      <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                        Please sign in to write a review for this book.
                      </p>
                      <Link to="/login" className="btn btn-primary btn-sm">
                        Sign In to Review
                      </Link>
                    </div>
                  )}
                </div>

                {/* Reviews List */}
                {book.reviews && book.reviews.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {book.reviews.map((rev) => (
                      <div
                        key={rev._id}
                        style={{
                          paddingBottom: '1.5rem',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                              {rev.name}
                            </h4>
                            {rev.isVerifiedPurchase && (
                              <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                                ✓ Verified Purchase
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <RatingStars rating={rev.rating} size={15} />
                        <p style={{ marginTop: '0.5rem', color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
                          {rev.comment}
                        </p>

                        {/* Review Action Tools */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
                          <button
                            type="button"
                            className="review-tool-btn"
                            onClick={() => handleHelpfulVote(rev._id)}
                          >
                            <ThumbsUp size={13} />
                            <span>Helpful ({(rev.helpfulVotes || []).length})</span>
                          </button>
                          <button
                            type="button"
                            className="review-tool-btn danger"
                            onClick={() => handleReportReview(rev._id)}
                          >
                            <Flag size={13} />
                            <span>Report</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                    <MessageSquare size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto', display: 'block', opacity: 0.7 }} />
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary, #1e293b)', marginBottom: '4px' }}>
                      No reader reviews yet
                    </h4>
                    <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                      Be the first verified reader to share your thoughts, analysis, and recommendations for this book!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <div>
            <h2 className="title-md font-serif" style={{ marginBottom: '1.5rem' }}>
              Readers Also Explored in {book.category}
            </h2>
            <div className="grid-books">
              {relatedBooks.map((relBook) => (
                <BookCard key={relBook._id} book={relBook} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Book Preview Reader Modal */}
      <BookPreviewModal
        book={book}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />

      {/* Price Alert Subscription Modal */}
      {priceAlertOpen && (
        <div className="modal-overlay animate-fade-in" onClick={() => setPriceAlertOpen(false)}>
          <div className="modal-dialog-sm" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} color="var(--primary)" />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Price Drop Alert</h4>
              </div>
              <button type="button" className="preview-close-btn" onClick={() => setPriceAlertOpen(false)}>
                ✕
              </button>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Notify me automatically when <strong>"{book.title}"</strong> drops in price!
            </p>
            {alertSubmitted ? (
              <div style={{ padding: '1rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '8px', textAlign: 'center', fontWeight: 600 }}>
                ✓ Price Alert is now active!
              </div>
            ) : (
              <form onSubmit={handlePriceAlertSubmit}>
                <div className="form-group">
                  <label className="form-label">Target Price (Default: 10% drop)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={`e.g. ${(activePrice * 0.9).toFixed(2)}`}
                    value={targetPriceInput}
                    onChange={(e) => setTargetPriceInput(e.target.value)}
                    className="form-input"
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  Activate Price Alert
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetailsPage;
