import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  Award,
  Sparkles,
  Upload,
  RefreshCw,
} from 'lucide-react';
import api from '../../api/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const BookManagement = ({ initialOpenAdd = false }) => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);

  // Modal State
  const [modalOpen, setModalOpen] = useState(initialOpenAdd);
  const [editingBook, setEditingBook] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const initialFormState = {
    title: '',
    author: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
    category: 'Fiction',
    price: '',
    originalPrice: '',
    stock: 15,
    isbn: '',
    publisher: 'PageHaven Press',
    publicationDate: '2024',
    language: 'English',
    pageCount: 300,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await api.get('/books/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  // Fetch Books with pagination & filter
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sort: sortBy,
      });

      if (keyword.trim()) params.append('keyword', keyword.trim());
      if (categoryFilter !== 'All') params.append('category', categoryFilter);

      const res = await api.get(`/books?${params.toString()}`);
      if (res.data.success) {
        setBooks(res.data.data);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.pages || 1);
          setTotalBooks(res.data.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error('Failed to load books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, categoryFilter, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBooks();
  };

  // Open Add Modal
  const openAddModal = () => {
    setEditingBook(null);
    setFormData({
      ...initialFormState,
      isbn: '978-' + Math.floor(1000000000 + Math.random() * 9000000000),
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title || '',
      author: book.author || '',
      description: book.description || '',
      image: book.image || '',
      category: book.category || 'Fiction',
      price: book.price !== undefined ? book.price : '',
      originalPrice: book.originalPrice !== undefined ? book.originalPrice : '',
      stock: book.stock !== undefined ? book.stock : 10,
      isbn: book.isbn || '',
      publisher: book.publisher || 'PageHaven Press',
      publicationDate: book.publicationDate || '2024',
      language: book.language || 'English',
      pageCount: book.pageCount || 300,
      isFeatured: Boolean(book.isFeatured),
      isBestSeller: Boolean(book.isBestSeller),
      isNewArrival: Boolean(book.isNewArrival),
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  // Handle Image File Upload via /api/upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    setUploadingImage(true);
    try {
      const res = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setFormData((prev) => ({ ...prev, image: res.data.url }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload image cover');
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit Add or Edit Form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice) || Number(formData.price),
        stock: Number(formData.stock),
        pageCount: Number(formData.pageCount),
      };

      if (editingBook) {
        // Update Book
        const res = await api.put(`/books/${editingBook._id}`, payload);
        if (res.data.success) {
          setModalOpen(false);
          fetchBooks();
        }
      } else {
        // Create Book
        const res = await api.post('/books', payload);
        if (res.data.success) {
          setModalOpen(false);
          fetchBooks();
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save book changes');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Book
  const handleDeleteBook = async (bookId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}" from the bookstore?`)) {
      return;
    }
    try {
      const res = await api.delete(`/books/${bookId}`);
      if (res.data.success) {
        fetchBooks();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete book');
    }
  };

  // Quick Flag Toggles (Featured, BestSeller, NewArrival)
  const handleToggleFlag = async (book, flagName) => {
    const updatedVal = !book[flagName];
    try {
      // Optimistic update
      setBooks((prev) =>
        prev.map((b) => (b._id === book._id ? { ...b, [flagName]: updatedVal } : b))
      );
      await api.put(`/books/${book._id}`, { [flagName]: updatedVal });
    } catch (err) {
      console.error('Failed to toggle flag:', err);
      fetchBooks();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <h1>Book Inventory Management</h1>
          <p className="admin-view-subtitle">
            Full control over store catalog, pricing, metadata, stock quantities, and curated book collections.
          </p>
        </div>
        <div className="admin-view-actions">
          <button className="admin-btn admin-btn-secondary" onClick={fetchBooks}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="admin-btn admin-btn-primary" onClick={openAddModal}>
            <Plus size={16} /> Add New Book
          </button>
        </div>
      </div>

      {/* Table & Filtering Panel */}
      <div className="admin-panel">
        <div className="admin-table-controls">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260 }}>
            <div className="admin-search-wrapper" style={{ width: '100%' }}>
              <Search className="admin-search-icon" />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search by title, author, or ISBN..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-secondary">
              Search
            </button>
          </form>

          {/* Filter dropdowns */}
          <div className="admin-table-filters">
            <select
              className="admin-filter-select"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="admin-filter-select"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
            >
              <option value="newest">Sort: Newest Added</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Top Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Books Table */}
        <div className="admin-table-wrapper">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <LoadingSpinner text="Loading bookstore titles..." />
            </div>
          ) : (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Book Details</th>
                  <th>Category</th>
                  <th>Pricing</th>
                  <th>Stock</th>
                  <th>Curations</th>
                  <th>Rating</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.length > 0 ? (
                  books.map((book) => (
                    <tr key={book._id}>
                      {/* Title & Cover Image */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={book.image}
                            alt={book.title}
                            style={{
                              width: 44,
                              height: 60,
                              objectFit: 'cover',
                              borderRadius: 'var(--admin-radius-sm)',
                              boxShadow: 'var(--admin-shadow-sm)',
                              backgroundColor: '#eee',
                            }}
                            onError={(e) => {
                              e.target.src =
                                'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200';
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--admin-text-main)' }}>
                              {book.title}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>
                              by {book.author}
                            </div>
                            <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--admin-text-subtle)' }}>
                              ISBN: {book.isbn || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="admin-status-pill neutral">
                          {book.category}
                        </span>
                      </td>

                      {/* Price & Discount */}
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>
                          ${book.price.toFixed(2)}
                        </div>
                        {book.originalPrice > book.price && (
                          <div style={{ fontSize: 11, color: 'var(--admin-text-subtle)', textDecoration: 'line-through' }}>
                            ${book.originalPrice.toFixed(2)}
                          </div>
                        )}
                      </td>

                      {/* Stock Status Badge */}
                      <td>
                        <span
                          className={`admin-status-pill ${
                            book.stock === 0
                              ? 'danger'
                              : book.stock <= 5
                              ? 'warning'
                              : 'success'
                          }`}
                        >
                          {book.stock === 0
                            ? 'Out of Stock'
                            : book.stock <= 5
                            ? `Low (${book.stock})`
                            : `${book.stock} in stock`}
                        </span>
                      </td>

                      {/* Collection Flags (Featured, Best Seller, New Arrival) */}
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            title="Toggle Featured"
                            onClick={() => handleToggleFlag(book, 'isFeatured')}
                            style={{
                              border: 'none',
                              background: book.isFeatured ? '#fef3c7' : 'var(--admin-badge-bg)',
                              color: book.isFeatured ? '#d97706' : 'var(--admin-text-subtle)',
                              padding: '4px 6px',
                              borderRadius: 'var(--admin-radius-sm)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            <Star size={13} style={{ marginRight: 2 }} />
                            {book.isFeatured ? 'Feat' : '—'}
                          </button>

                          <button
                            title="Toggle Best Seller"
                            onClick={() => handleToggleFlag(book, 'isBestSeller')}
                            style={{
                              border: 'none',
                              background: book.isBestSeller ? '#ecfdf5' : 'var(--admin-badge-bg)',
                              color: book.isBestSeller ? '#059669' : 'var(--admin-text-subtle)',
                              padding: '4px 6px',
                              borderRadius: 'var(--admin-radius-sm)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            <Award size={13} style={{ marginRight: 2 }} />
                            {book.isBestSeller ? 'Best' : '—'}
                          </button>

                          <button
                            title="Toggle New Arrival"
                            onClick={() => handleToggleFlag(book, 'isNewArrival')}
                            style={{
                              border: 'none',
                              background: book.isNewArrival ? '#ede9fe' : 'var(--admin-badge-bg)',
                              color: book.isNewArrival ? '#7c3aed' : 'var(--admin-text-subtle)',
                              padding: '4px 6px',
                              borderRadius: 'var(--admin-radius-sm)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            <Sparkles size={13} style={{ marginRight: 2 }} />
                            {book.isNewArrival ? 'New' : '—'}
                          </button>
                        </div>
                      </td>

                      {/* Ratings */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontWeight: 700 }}>★ {book.rating ? book.rating.toFixed(1) : '0.0'}</span>
                          <span style={{ fontSize: 11, color: 'var(--admin-text-subtle)' }}>
                            ({book.numReviews || 0})
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            className="admin-btn admin-btn-secondary admin-btn-icon"
                            title="Edit Book"
                            onClick={() => openEditModal(book)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="admin-btn admin-btn-secondary admin-btn-icon"
                            style={{ color: 'var(--admin-danger)' }}
                            title="Delete Book"
                            onClick={() => handleDeleteBook(book._id, book.title)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                      No books matched your query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        <div className="admin-pagination-wrapper">
          <div className="admin-pagination-info">
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalBooks} total books)
          </div>
          <div className="admin-pagination-actions">
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Book Modal Dialog */}
      {modalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container large">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingBook ? `Edit Book: "${editingBook.title}"` : 'Add New Book to Catalog'}
              </h3>
              <button
                className="admin-modal-close-btn"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div className="admin-modal-body">
                {errorMsg && (
                  <div
                    style={{
                      padding: '10px 14px',
                      backgroundColor: 'var(--admin-danger-bg)',
                      border: '1px solid var(--admin-danger-border)',
                      color: 'var(--admin-danger)',
                      borderRadius: 'var(--admin-radius-md)',
                      marginBottom: 18,
                      fontSize: 13,
                    }}
                  >
                    {errorMsg}
                  </div>
                )}

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Book Title *</label>
                    <input
                      type="text"
                      required
                      className="admin-form-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. Sapiens: A Brief History of Humankind"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Author Name *</label>
                    <input
                      type="text"
                      required
                      className="admin-form-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. Yuval Noah Harari"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Book Description *</label>
                  <textarea
                    required
                    rows="3"
                    className="admin-form-textarea"
                    style={{ width: '100%' }}
                    placeholder="Provide a compelling synopsis of the book..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Category *</label>
                    <select
                      className="admin-form-select"
                      style={{ width: '100%' }}
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">ISBN Identifier</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      style={{ width: '100%' }}
                      placeholder="978-0123456789"
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Selling Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="admin-form-input"
                      style={{ width: '100%' }}
                      placeholder="18.99"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Original / Retail Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-form-input"
                      style={{ width: '100%' }}
                      placeholder="24.99"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Stock Quantity *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="admin-form-input"
                      style={{ width: '100%' }}
                      placeholder="25"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    />
                  </div>
                </div>

                {/* Cover Image Upload & Preview */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Book Cover Image URL *</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input
                      type="text"
                      required
                      className="admin-form-input"
                      style={{ flex: 1 }}
                      placeholder="https://images.unsplash.com/..."
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                    <label
                      className="admin-btn admin-btn-secondary"
                      style={{ cursor: uploadingImage ? 'wait' : 'pointer' }}
                    >
                      <Upload size={14} /> {uploadingImage ? 'Uploading...' : 'Upload File'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                  {formData.image && (
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={formData.image}
                        alt="Preview"
                        style={{ width: 50, height: 70, objectFit: 'cover', borderRadius: 4 }}
                      />
                      <span style={{ fontSize: 12, color: 'var(--admin-text-subtle)' }}>
                        Cover preview rendered successfully
                      </span>
                    </div>
                  )}
                </div>

                {/* Additional Metadata */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Publisher</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      style={{ width: '100%' }}
                      value={formData.publisher}
                      onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Page Count</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      style={{ width: '100%' }}
                      value={formData.pageCount}
                      onChange={(e) => setFormData({ ...formData, pageCount: e.target.value })}
                    />
                  </div>
                </div>

                {/* Collection Flags */}
                <div
                  style={{
                    display: 'flex',
                    gap: 24,
                    padding: 16,
                    backgroundColor: 'var(--admin-bg-alt)',
                    borderRadius: 'var(--admin-radius-md)',
                    marginTop: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <label className="admin-switch-label">
                    <div
                      className={`admin-switch-track ${formData.isFeatured ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                    >
                      <div className="admin-switch-thumb" />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Featured in Showcase</span>
                  </label>

                  <label className="admin-switch-label">
                    <div
                      className={`admin-switch-track ${formData.isBestSeller ? 'active' : ''}`}
                      onClick={() =>
                        setFormData({ ...formData, isBestSeller: !formData.isBestSeller })
                      }
                    >
                      <div className="admin-switch-thumb" />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Best Seller Badge</span>
                  </label>

                  <label className="admin-switch-label">
                    <div
                      className={`admin-switch-track ${formData.isNewArrival ? 'active' : ''}`}
                      onClick={() =>
                        setFormData({ ...formData, isNewArrival: !formData.isNewArrival })
                      }
                    >
                      <div className="admin-switch-thumb" />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>New Arrival Tag</span>
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingBook ? 'Save Book Changes' : 'Create & Publish Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookManagement;
