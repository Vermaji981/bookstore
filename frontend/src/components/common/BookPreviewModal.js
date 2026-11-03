import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {
  X,
  BookOpen,
  List,
  User,
  Info,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Check,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const BookPreviewModal = ({ book, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('sample'); // 'sample' | 'contents' | 'author' | 'specs'
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [added, setAdded] = useState(false);

  if (!isOpen || !book) return null;

  const samplePages = book.preview?.samplePages && book.preview.samplePages.length > 0
    ? book.preview.samplePages
    : [
        {
          pageNumber: 1,
          heading: 'Chapter 1: The Spark of Wonder',
          content: book.description || 'Welcome to the sample preview of this acclaimed title. Immerse yourself in the introductory ideas and narrative arc presented in this excerpt.',
        },
      ];

  const tableOfContents = book.preview?.tableOfContents && book.preview.tableOfContents.length > 0
    ? book.preview.tableOfContents
    : [
        { chapterNumber: 1, title: 'Introduction & Foundations', page: 1 },
        { chapterNumber: 2, title: 'Core Principles & Frameworks', page: 28 },
        { chapterNumber: 3, title: 'Real World Applications', page: 85 },
        { chapterNumber: 4, title: 'Advanced Breakthroughs', page: 160 },
        { chapterNumber: 5, title: 'Conclusion & Next Steps', page: 240 },
      ];

  const handleAddToCart = () => {
    addToCart(book, 1);
    setAdded(true);
    showToast(`Added "${book.title}" to your cart!`, 'success');
    setTimeout(() => setAdded(false), 2000);
  };

  const handleNextPage = () => {
    if (currentPageIdx < samplePages.length - 1) {
      setCurrentPageIdx((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIdx > 0) {
      setCurrentPageIdx((prev) => prev - 1);
    }
  };

  const modalJSX = (
    <div
      className="modal-overlay animate-fade-in"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="preview-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          width: '880px',
          maxWidth: '96vw',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
          border: '1px solid #e2e8f0',
          position: 'relative',
        }}
      >
        {/* Modal Header */}
        <div
          className="preview-modal-header"
          style={{
            padding: '16px 24px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <div
              className="preview-header-icon"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BookOpen size={20} color="var(--primary)" />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>
                  Authorized Preview
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  ISBN: {book.isbn || '978-0123456789'}
                </span>
              </div>
              <h3
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '2px',
                  margin: 0,
                }}
              >
                {book.title}
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="preview-close-btn"
              onClick={onClose}
              aria-label="Close Preview"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          className="preview-tabs-bar"
          style={{
            display: 'flex',
            gap: '6px',
            padding: '8px 20px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            overflowX: 'auto',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            className={`preview-tab-btn ${activeTab === 'sample' ? 'active' : ''}`}
            onClick={() => setActiveTab('sample')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'sample' ? '#ffffff' : 'transparent',
              color: activeTab === 'sample' ? 'var(--primary)' : '#475569',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: activeTab === 'sample' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <BookOpen size={16} />
            <span>Sample Pages</span>
          </button>

          <button
            type="button"
            className={`preview-tab-btn ${activeTab === 'contents' ? 'active' : ''}`}
            onClick={() => setActiveTab('contents')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'contents' ? '#ffffff' : 'transparent',
              color: activeTab === 'contents' ? 'var(--primary)' : '#475569',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: activeTab === 'contents' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <List size={16} />
            <span>Table of Contents</span>
          </button>

          <button
            type="button"
            className={`preview-tab-btn ${activeTab === 'author' ? 'active' : ''}`}
            onClick={() => setActiveTab('author')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'author' ? '#ffffff' : 'transparent',
              color: activeTab === 'author' ? 'var(--primary)' : '#475569',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: activeTab === 'author' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <User size={16} />
            <span>Author Info</span>
          </button>

          <button
            type="button"
            className={`preview-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('specs')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'specs' ? '#ffffff' : 'transparent',
              color: activeTab === 'specs' ? 'var(--primary)' : '#475569',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: activeTab === 'specs' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <Info size={16} />
            <span>Specifications</span>
          </button>
        </div>

        {/* Tab 1: Sample Pages Reader */}
        {activeTab === 'sample' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            {/* Toolbar */}
            <div
              style={{
                padding: '8px 24px',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                Sample Page {currentPageIdx + 1} of {samplePages.length}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Font Size:</span>
                <button
                  type="button"
                  onClick={() => setFontSize((f) => Math.max(13, f - 1))}
                  style={{
                    padding: '3px 8px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize((f) => Math.min(22, f + 1))}
                  style={{
                    padding: '3px 8px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  A+
                </button>
              </div>
            </div>

            {/* Reading Page Paper Surface */}
            <div
              className="preview-paper-sheet"
              style={{
                flex: 1,
                padding: '2rem 2.5rem',
                overflowY: 'auto',
                backgroundColor: '#fffdfa',
                borderBottom: '1px solid #e2e8f0',
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}
              >
                SAMPLE PREVIEW • PAGEHAVEN
              </div>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
                {samplePages[currentPageIdx]?.heading || 'Excerpt'}
              </h4>
              <div
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: 1.85,
                  color: '#334155',
                  fontFamily: 'Merriweather, Georgia, serif',
                  whiteSpace: 'pre-line',
                }}
              >
                {samplePages[currentPageIdx]?.content}
              </div>
            </div>

            {/* Reader Footer Navigation */}
            <div
              style={{
                padding: '12px 24px',
                backgroundColor: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handlePrevPage}
                disabled={currentPageIdx === 0}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ChevronLeft size={16} />
                <span>Previous Page</span>
              </button>

              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Page {currentPageIdx + 1} / {samplePages.length}
              </span>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleNextPage}
                disabled={currentPageIdx === samplePages.length - 1}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Next Page</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Table of Contents */}
        {activeTab === 'contents' && (
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
              Complete Table of Contents
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {tableOfContents.map((toc, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                      }}
                    >
                      {toc.chapterNumber || idx + 1}
                    </span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{toc.title}</span>
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Page {toc.page}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Author Info */}
        {activeTab === 'author' && (
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <img
                src={
                  book.authorDetails?.image ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
                }
                alt={book.author}
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ flex: 1, minWidth: '220px' }}>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>{book.author}</h4>
                <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                  {book.category} Author
                </p>
                <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  {book.authorDetails?.bio ||
                    `${book.author} is an acclaimed writer celebrated for profound literary contributions and global bestsellers.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Specifications */}
        {activeTab === 'specs' && (
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              Book Specifications & Available Formats
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>ISBN-13</span>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{book.isbn || '978-0123456789'}</span>
              </div>
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Language</span>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{book.language || 'English'}</span>
              </div>
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Print Length</span>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{book.pageCount || 340} pages</span>
              </div>
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Publisher</span>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{book.publisher || 'PageHaven Press'}</span>
              </div>
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Dimensions</span>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{book.specifications?.dimensions || '6.0 x 1.2 x 9.0 in'}</span>
              </div>
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Weight</span>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{book.specifications?.weight || '1.1 lbs'}</span>
              </div>
            </div>

            {/* Formats Overview */}
            <h5 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
              Available Formats
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              {(book.formats && book.formats.length > 0
                ? book.formats
                : [
                    { formatType: 'Paperback', price: book.price },
                    { formatType: 'Hardcover', price: Number((book.price * 1.35).toFixed(2)) },
                    { formatType: 'E-book', price: Number((book.price * 0.7).toFixed(2)) },
                    { formatType: 'Audiobook', price: Number((book.price * 1.15).toFixed(2)) },
                  ]
              ).map((fmt, i) => (
                <div key={i} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>{fmt.formatType}</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem', marginTop: '2px', display: 'block' }}>
                    ${Number(fmt.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div
          style={{
            padding: '14px 24px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Purchase Price</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                ${Number(book.price).toFixed(2)}
              </span>
              {book.originalPrice && book.originalPrice > book.price && (
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                  ${Number(book.originalPrice).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className={`btn ${added ? 'btn-success' : 'btn-primary'}`}
              onClick={handleAddToCart}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
            >
              {added ? (
                <>
                  <Check size={16} />
                  <span>Added to Cart</span>
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
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalJSX, document.body);
};

export default BookPreviewModal;
