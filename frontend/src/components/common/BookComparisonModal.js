import React from 'react';
import ReactDOM from 'react-dom';
import { X, Scale, Trash2, ShoppingBag, Star } from 'lucide-react';
import { useCompare } from '../../context/CompareContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const BookComparisonModal = () => {
  const { compareList, removeFromCompare, clearCompare, isCompareOpen, setIsCompareOpen } = useCompare();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  if (!isCompareOpen) return null;

  const handleAdd = (book) => {
    addToCart(book, 1);
    showToast(`Added "${book.title}" to cart!`, 'success');
  };

  const modalJSX = (
    <div
      className="modal-overlay animate-fade-in"
      onClick={() => setIsCompareOpen(false)}
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
        className="compare-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          width: '980px',
          maxWidth: '96vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
          border: '1px solid #e2e8f0',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          className="compare-header"
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
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
              <Scale size={20} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Compare Books ({compareList.length}/4)
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, marginTop: '2px' }}>
                Side-by-side specification, pricing, format, and availability comparison
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {compareList.length > 0 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={clearCompare}
                style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Trash2 size={14} />
                <span>Clear All</span>
              </button>
            )}
            <button
              type="button"
              className="preview-close-btn"
              onClick={() => setIsCompareOpen(false)}
              aria-label="Close Comparison"
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

        {/* Content Body */}
        {compareList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: '#64748b' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              <Scale size={32} color="#94a3b8" />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              No books selected for comparison
            </h4>
            <p style={{ fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
              Click the "Compare" scale button on any book card in our catalog to compare editions, formats, prices, and specifications side-by-side.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsCompareOpen(false)}
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          <div
            className="compare-table-wrapper"
            style={{
              overflowX: 'auto',
              overflowY: 'auto',
              flex: 1,
              padding: '20px 24px',
            }}
          >
            <table
              className="compare-table"
              style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: 0,
                minWidth: `${180 + compareList.length * 200}px`,
              }}
            >
              <tbody>
                {/* 1. Book Covers & Title */}
                <tr>
                  <td
                    className="compare-row-label"
                    style={{
                      width: '150px',
                      padding: '16px 14px',
                      fontWeight: 800,
                      color: '#475569',
                      fontSize: '0.85rem',
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      borderRight: '1px solid #e2e8f0',
                      verticalAlign: 'middle',
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                    }}
                  >
                    Book Details
                  </td>
                  {compareList.map((book) => (
                    <td
                      key={book._id}
                      className="compare-cell"
                      style={{
                        padding: '16px 18px',
                        borderBottom: '1px solid #f1f5f9',
                        textAlign: 'center',
                        verticalAlign: 'top',
                        background: '#ffffff',
                        width: `${100 / compareList.length}%`,
                      }}
                    >
                      <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto 8px auto' }}>
                        <button
                          type="button"
                          className="compare-remove-item-btn"
                          onClick={() => removeFromCompare(book._id)}
                          title="Remove from comparison"
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#ef4444',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                            zIndex: 5,
                            padding: 0,
                          }}
                        >
                          <X size={13} />
                        </button>
                        <img
                          src={book.image}
                          alt={book.title}
                          className="compare-book-img"
                          style={{
                            width: '90px',
                            height: '130px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            boxShadow: '0 8px 18px rgba(0,0,0,0.14)',
                            display: 'block',
                            margin: '0 auto',
                          }}
                        />
                      </div>
                      <h4
                        style={{
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          marginTop: '0.5rem',
                          marginBottom: '0.2rem',
                          lineHeight: 1.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                        title={book.title}
                      >
                        {book.title}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                        by <strong style={{ color: '#334155' }}>{book.author}</strong>
                      </p>
                    </td>
                  ))}
                </tr>

                {/* 2. Price */}
                <tr>
                  <td
                    className="compare-row-label"
                    style={{
                      padding: '12px 14px',
                      fontWeight: 800,
                      color: '#475569',
                      fontSize: '0.85rem',
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      borderRight: '1px solid #e2e8f0',
                      verticalAlign: 'middle',
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                    }}
                  >
                    Price
                  </td>
                  {compareList.map((book) => (
                    <td
                      key={book._id}
                      className="compare-cell"
                      style={{
                        padding: '12px 18px',
                        borderBottom: '1px solid #f1f5f9',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        background: '#ffffff',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                          ${Number(book.price).toFixed(2)}
                        </span>
                        {book.originalPrice && book.originalPrice > book.price && (
                          <span style={{ fontSize: '0.82rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                            ${Number(book.originalPrice).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 3. Rating & Reviews */}
                <tr>
                  <td
                    className="compare-row-label"
                    style={{
                      padding: '12px 14px',
                      fontWeight: 800,
                      color: '#475569',
                      fontSize: '0.85rem',
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      borderRight: '1px solid #e2e8f0',
                      verticalAlign: 'middle',
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                    }}
                  >
                    Rating
                  </td>
                  {compareList.map((book) => (
                    <td
                      key={book._id}
                      className="compare-cell"
                      style={{
                        padding: '12px 18px',
                        borderBottom: '1px solid #f1f5f9',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        background: '#ffffff',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        <Star size={15} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                          {book.rating || 4.5}
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                          ({book.numReviews || 0})
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 4. Category */}
                <tr>
                  <td
                    className="compare-row-label"
                    style={{
                      padding: '12px 14px',
                      fontWeight: 800,
                      color: '#475569',
                      fontSize: '0.85rem',
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      borderRight: '1px solid #e2e8f0',
                      verticalAlign: 'middle',
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                    }}
                  >
                    Category
                  </td>
                  {compareList.map((book) => (
                    <td
                      key={book._id}
                      className="compare-cell"
                      style={{
                        padding: '12px 18px',
                        borderBottom: '1px solid #f1f5f9',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        background: '#ffffff',
                      }}
                    >
                      <span className="badge badge-primary">{book.category}</span>
                    </td>
                  ))}
                </tr>

                {/* 5. Formats Available */}
                <tr>
                  <td
                    className="compare-row-label"
                    style={{
                      padding: '12px 14px',
                      fontWeight: 800,
                      color: '#475569',
                      fontSize: '0.85rem',
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      borderRight: '1px solid #e2e8f0',
                      verticalAlign: 'middle',
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                    }}
                  >
                    Formats
                  </td>
                  {compareList.map((book) => (
                    <td
                      key={book._id}
                      className="compare-cell"
                      style={{
                        padding: '12px 18px',
                        borderBottom: '1px solid #f1f5f9',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        background: '#ffffff',
                        fontSize: '0.85rem',
                        color: '#334155',
                      }}
                    >
                      {book.formats && book.formats.length > 0
                        ? book.formats.map((f) => f.formatType).join(', ')
                        : 'Paperback, Hardcover, E-book'}
                    </td>
                  ))}
                </tr>

                {/* 6. Page Count */}
                <tr>
                  <td
                    className="compare-row-label"
                    style={{
                      padding: '12px 14px',
                      fontWeight: 800,
                      color: '#475569',
                      fontSize: '0.85rem',
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      borderRight: '1px solid #e2e8f0',
                      verticalAlign: 'middle',
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                    }}
                  >
                    Print Length
                  </td>
                  {compareList.map((book) => (
                    <td
                      key={book._id}
                      className="compare-cell"
                      style={{
                        padding: '12px 18px',
                        borderBottom: '1px solid #f1f5f9',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        background: '#ffffff',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: '#0f172a',
                      }}
                    >
                      {book.pageCount || book.specifications?.printLength || 320} pages
                    </td>
                  ))}
                </tr>

                {/* 7. Publisher */}
                <tr>
                  <td
                    className="compare-row-label"
                    style={{
                      padding: '12px 14px',
                      fontWeight: 800,
                      color: '#475569',
                      fontSize: '0.85rem',
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      borderRight: '1px solid #e2e8f0',
                      verticalAlign: 'middle',
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                    }}
                  >
                    Publisher
                  </td>
                  {compareList.map((book) => (
                    <td
                      key={book._id}
                      className="compare-cell"
                      style={{
                        padding: '12px 18px',
                        borderBottom: '1px solid #f1f5f9',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        background: '#ffffff',
                        fontSize: '0.82rem',
                        color: '#64748b',
                      }}
                    >
                      {book.publisher || 'PageHaven Press'}
                    </td>
                  ))}
                </tr>

                {/* 8. ISBN */}
                <tr>
                  <td
                    className="compare-row-label"
                    style={{
                      padding: '12px 14px',
                      fontWeight: 800,
                      color: '#475569',
                      fontSize: '0.85rem',
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      borderRight: '1px solid #e2e8f0',
                      verticalAlign: 'middle',
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                    }}
                  >
                    ISBN
                  </td>
                  {compareList.map((book) => (
                    <td
                      key={book._id}
                      className="compare-cell"
                      style={{
                        padding: '12px 18px',
                        borderBottom: '1px solid #f1f5f9',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        background: '#ffffff',
                        fontSize: '0.78rem',
                        color: '#64748b',
                        fontFamily: 'monospace',
                      }}
                    >
                      {book.isbn || '978-0123456789'}
                    </td>
                  ))}
                </tr>

                {/* 9. Stock Status */}
                <tr>
                  <td
                    className="compare-row-label"
                    style={{
                      padding: '12px 14px',
                      fontWeight: 800,
                      color: '#475569',
                      fontSize: '0.85rem',
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      borderRight: '1px solid #e2e8f0',
                      verticalAlign: 'middle',
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                    }}
                  >
                    Stock Status
                  </td>
                  {compareList.map((book) => (
                    <td
                      key={book._id}
                      className="compare-cell"
                      style={{
                        padding: '12px 18px',
                        borderBottom: '1px solid #f1f5f9',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        background: '#ffffff',
                      }}
                    >
                      {book.stock > 0 ? (
                        <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.85rem' }}>
                          In Stock ({book.stock} left)
                        </span>
                      ) : (
                        <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.85rem' }}>
                          Out of Stock
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 10. Actions */}
                <tr>
                  <td
                    className="compare-row-label"
                    style={{
                      padding: '16px 14px',
                      fontWeight: 800,
                      color: '#475569',
                      fontSize: '0.85rem',
                      background: '#f8fafc',
                      borderRight: '1px solid #e2e8f0',
                      verticalAlign: 'middle',
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                    }}
                  >
                    Action
                  </td>
                  {compareList.map((book) => (
                    <td
                      key={book._id}
                      className="compare-cell"
                      style={{
                        padding: '16px 18px',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        background: '#ffffff',
                      }}
                    >
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{
                          width: '100%',
                          maxWidth: '160px',
                          margin: '0 auto',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                        onClick={() => handleAdd(book)}
                        disabled={book.stock <= 0}
                      >
                        <ShoppingBag size={14} />
                        <span>Add to Cart</span>
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalJSX, document.body);
};

export default BookComparisonModal;
