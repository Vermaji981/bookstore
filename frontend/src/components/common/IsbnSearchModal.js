import React, { useState } from 'react';
import { X, Barcode, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

const IsbnSearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isbnInput, setIsbnInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [foundBook, setFoundBook] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!isbnInput.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    setFoundBook(null);

    try {
      const cleanIsbn = isbnInput.trim().replace(/[-\s]/g, '');
      const res = await api.get(`/books/search/isbn/${encodeURIComponent(cleanIsbn)}`);
      if (res.data.success && res.data.data) {
        setFoundBook(res.data.data);
      } else {
        setErrorMsg('No book found matching this ISBN.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'No book found with this ISBN. Please verify the 10 or 13-digit code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToBook = () => {
    if (foundBook) {
      onClose();
      navigate(`/book/${foundBook._id}`);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        className="isbn-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="isbn-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="preview-header-icon">
              <Barcode size={22} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                ISBN Barcode & Code Search
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                Enter any 10-digit or 13-digit ISBN code to locate the exact edition
              </p>
            </div>
          </div>

          <button
            type="button"
            className="preview-close-btn"
            onClick={onClose}
            aria-label="Close ISBN Search"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSearch} style={{ padding: '1.25rem 1.5rem 0.5rem 1.5rem' }}>
          <div className="isbn-input-wrap">
            <Barcode size={20} color="#94a3b8" />
            <input
              type="text"
              value={isbnInput}
              onChange={(e) => setIsbnInput(e.target.value)}
              placeholder="e.g. 978-0143127741 or 9780062316097"
              className="isbn-input-field"
              autoFocus
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isLoading || !isbnInput.trim()}
              style={{ padding: '0.55rem 1.25rem' }}
            >
              {isLoading ? 'Searching...' : 'Locate'}
            </button>
          </div>
        </form>

        {/* Quick Sample Buttons */}
        <div style={{ padding: '0 1.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Try sample:</span>
          <button
            type="button"
            className="isbn-sample-btn"
            onClick={() => {
              setIsbnInput('978-0062316097');
              handleSearch();
            }}
          >
            Sapiens (978-0062316097)
          </button>
          <button
            type="button"
            className="isbn-sample-btn"
            onClick={() => {
              setIsbnInput('978-0735211292');
              handleSearch();
            }}
          >
            Atomic Habits (978-0735211292)
          </button>
        </div>

        {/* Result Area */}
        <div style={{ padding: '1.25rem 1.5rem' }}>
          {errorMsg && (
            <div className="isbn-error-box">
              <span>{errorMsg}</span>
            </div>
          )}

          {foundBook && (
            <div className="isbn-result-card animate-fade-in">
              <img src={foundBook.image} alt={foundBook.title} className="isbn-result-thumb" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                  Exact ISBN Match Found
                </span>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px 0' }}>
                  {foundBook.title}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 6px 0' }}>
                  by {foundBook.author} • {foundBook.category}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                    ${Number(foundBook.price).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleNavigateToBook}
                  >
                    <span>View Edition Details</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IsbnSearchModal;
