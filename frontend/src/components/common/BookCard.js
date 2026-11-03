import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Check, BookOpen, Scale } from 'lucide-react';
import RatingStars from './RatingStars';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import BookPreviewModal from './BookPreviewModal';

const BookCard = ({ book, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCompare, isComparing } = useCompare();
  const [added, setAdded] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!book) return null;

  const isFavorited = isInWishlist(book._id);
  const discount =
    book.originalPrice && book.originalPrice > book.price
      ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
      : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (book.stock <= 0) return;
    addToCart(book, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(book);
  };

  // Horizontal List View Mode
  if (viewMode === 'list') {
    return (
      <div
        className="book-card-list"
        onClick={() => navigate(`/book/${book._id}`)}
        style={{ cursor: 'pointer' }}
      >
        <div className="book-card-image-wrap">
          <img
            src={book.image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'}
            alt={book.title}
            className="book-card-image"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';
            }}
          />
          <div
            className="book-card-actions-stack"
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              zIndex: 5,
            }}
          >
            <button
              type="button"
              className={`wishlist-btn ${isFavorited ? 'active' : ''}`}
              onClick={handleWishlistClick}
              title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
              style={{
                position: 'static',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                padding: 0,
              }}
            >
              <Heart
                size={16}
                color={isFavorited ? '#ef4444' : '#64748b'}
                fill={isFavorited ? '#ef4444' : 'none'}
              />
            </button>
            <button
              type="button"
              className="book-action-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setPreviewOpen(true);
              }}
              title="Read Sample Preview"
              style={{
                position: 'static',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                padding: 0,
              }}
            >
              <BookOpen size={15} color="#475569" />
            </button>
            <button
              type="button"
              className={`book-action-btn ${isComparing(book._id) ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCompare(book);
              }}
              title={isComparing(book._id) ? 'In Comparison' : 'Compare with other books'}
              style={{
                position: 'static',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: isComparing(book._id) ? '#eef2ff' : 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(4px)',
                border: isComparing(book._id) ? '1px solid #c7d2fe' : '1px solid rgba(0, 0, 0, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                padding: 0,
              }}
            >
              <Scale size={15} color={isComparing(book._id) ? 'var(--primary)' : '#475569'} />
            </button>
          </div>
          {discount && (
            <div style={{ position: 'absolute', top: 12, left: 12 }}>
              <span className="badge badge-accent">-{discount}%</span>
            </div>
          )}
        </div>

        <div className="book-card-content">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--primary)',
                  letterSpacing: '0.04em',
                  backgroundColor: 'var(--primary-light)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                }}
              >
                {book.category}
              </span>
              <RatingStars rating={book.rating || 4.5} numReviews={book.numReviews || 0} size={14} />
            </div>

            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#0f172a',
                lineHeight: 1.3,
                marginBottom: '0.35rem',
              }}
            >
              {book.title}
            </h3>

            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.75rem' }}>
              by <strong style={{ color: '#334155', fontWeight: 600 }}>{book.author}</strong>
            </p>

            <p
              style={{
                fontSize: '0.875rem',
                color: '#64748b',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                marginBottom: '1rem',
              }}
            >
              {book.description}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '0.85rem',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                ${Number(book.price).toFixed(2)}
              </span>
              {book.originalPrice && book.originalPrice > book.price && (
                <span style={{ fontSize: '0.9rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                  ${Number(book.originalPrice).toFixed(2)}
                </span>
              )}
            </div>

            <button
              type="button"
              className={`btn ${added ? 'btn-success' : 'btn-primary'} btn-sm`}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: added ? '#10b981' : undefined,
              }}
              disabled={book.stock <= 0}
              onClick={handleAddToCart}
            >
              {added ? (
                <>
                  <Check size={16} />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Book Preview Reader Modal */}
        <BookPreviewModal
          book={book}
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
        />
      </div>
    );
  }

  // Default Grid View Mode
  return (
    <div
      className="book-card"
      onClick={() => navigate(`/book/${book._id}`)}
      style={{ cursor: 'pointer' }}
    >
      {/* Cover Image Container */}
      <div className="book-card-image-wrap">
        <img
          src={book.image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'}
          alt={book.title}
          className="book-card-image"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';
          }}
        />

        {/* Floating Quick Action Buttons */}
        <div
          className="book-card-actions-stack"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 5,
          }}
        >
          <button
            type="button"
            className={`wishlist-btn ${isFavorited ? 'active' : ''}`}
            onClick={handleWishlistClick}
            title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
            style={{
              position: 'static',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
              padding: 0,
            }}
          >
            <Heart
              size={16}
              color={isFavorited ? '#ef4444' : '#64748b'}
              fill={isFavorited ? '#ef4444' : 'none'}
            />
          </button>

          <button
            type="button"
            className="book-action-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPreviewOpen(true);
            }}
            title="Read Sample Preview"
            style={{
              position: 'static',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
              padding: 0,
            }}
          >
            <BookOpen size={15} color="#475569" />
          </button>

          <button
            type="button"
            className={`book-action-btn ${isComparing(book._id) ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCompare(book);
            }}
            title={isComparing(book._id) ? 'In Comparison' : 'Compare with other books'}
            style={{
              position: 'static',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: isComparing(book._id) ? '#eef2ff' : 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(4px)',
              border: isComparing(book._id) ? '1px solid #c7d2fe' : '1px solid rgba(0, 0, 0, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
              padding: 0,
            }}
          >
            <Scale size={15} color={isComparing(book._id) ? 'var(--primary)' : '#475569'} />
          </button>
        </div>

        {/* Badges: Discount or Low Stock */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {discount && (
            <span className="badge badge-accent">-{discount}%</span>
          )}
          {book.stock <= 0 ? (
            <span className="badge badge-danger">Out of Stock</span>
          ) : book.stock < 5 ? (
            <span className="badge badge-danger">Only {book.stock} left!</span>
          ) : null}
        </div>
      </div>

      {/* Book Info */}
      <div className="book-card-content" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.45rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--primary)',
              letterSpacing: '0.04em',
              backgroundColor: 'var(--primary-light)',
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            {book.category}
          </span>
          {book.publicationDate && (
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {book.publicationDate}
            </span>
          )}
        </div>

        <h3
          style={{
            fontSize: '0.98rem',
            fontWeight: 700,
            color: '#0f172a',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.7em',
          }}
          title={book.title}
        >
          {book.title}
        </h3>

        <p
          style={{
            fontSize: '0.85rem',
            color: '#64748b',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          by <span style={{ fontWeight: 600, color: '#334155' }}>{book.author}</span>
        </p>

        {/* Rating */}
        <div style={{ margin: '0.15rem 0' }}>
          <RatingStars rating={book.rating || 4.5} numReviews={book.numReviews || 0} size={14} />
        </div>

        {/* Price & Cart Button */}
        <div
          className="book-card-footer"
          style={{
            marginTop: 'auto',
            paddingTop: '0.75rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              minWidth: 'fit-content',
              lineHeight: 1.15,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.01em',
                }}
              >
                ${Number(book.price).toFixed(2)}
              </span>
              {book.originalPrice && book.originalPrice > book.price && (
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    textDecoration: 'line-through',
                    whiteSpace: 'nowrap',
                    fontWeight: 500,
                  }}
                >
                  ${Number(book.originalPrice).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            className={`btn ${added ? 'btn-success' : 'btn-primary'} btn-sm`}
            style={{
              padding: '0.42rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              backgroundColor: added ? '#10b981' : undefined,
              marginLeft: 'auto',
            }}
            disabled={book.stock <= 0}
            onClick={handleAddToCart}
          >
            {added ? (
              <>
                <Check size={15} />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Book Preview Reader Modal */}
      <BookPreviewModal
        book={book}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
};

export default BookCard;
