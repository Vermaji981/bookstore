import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  RefreshCw,
  Eye,
} from 'lucide-react';
import api from '../../api/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'BookOpen',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Books under category preview modal
  const [previewCategory, setPreviewCategory] = useState(null);
  const [categoryBooks, setCategoryBooks] = useState([]);
  const [loadingCategoryBooks, setLoadingCategoryBooks] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/books/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: 'BookOpen',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
      isActive: true,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
      icon: cat.icon || 'BookOpen',
      image: cat.image || '',
      isActive: cat.isActive !== undefined ? cat.isActive : true,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    setUploading(true);
    try {
      const res = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setFormData((prev) => ({ ...prev, image: res.data.url }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload category image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      if (editingCategory) {
        const res = await api.put(`/books/categories/${editingCategory._id}`, formData);
        if (res.data.success) {
          setModalOpen(false);
          fetchCategories();
        }
      } else {
        const res = await api.post('/books/categories', formData);
        if (res.data.success) {
          setModalOpen(false);
          fetchCategories();
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (cat.count > 0) {
      alert(
        `Cannot delete "${cat.name}". There are currently ${cat.count} books assigned to this category. Please reassign those books first.`
      );
      return;
    }

    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      return;
    }

    try {
      const res = await api.delete(`/books/categories/${cat._id}`);
      if (res.data.success) {
        fetchCategories();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      const updatedVal = !cat.isActive;
      // Optimistic
      setCategories((prev) =>
        prev.map((c) => (c._id === cat._id ? { ...c, isActive: updatedVal } : c))
      );
      await api.put(`/books/categories/${cat._id}`, { isActive: updatedVal });
    } catch (err) {
      fetchCategories();
    }
  };

  const viewCategoryBooks = async (cat) => {
    setPreviewCategory(cat);
    setLoadingCategoryBooks(true);
    try {
      const res = await api.get(`/books?category=${encodeURIComponent(cat.name)}&limit=50`);
      if (res.data.success) {
        setCategoryBooks(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load books for category:', err);
    } finally {
      setLoadingCategoryBooks(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <h1>Category & Taxonomy Management</h1>
          <p className="admin-view-subtitle">
            Organize bookstore titles into genres, configure promotional imagery, and manage active storefront collections.
          </p>
        </div>
        <div className="admin-view-actions">
          <button className="admin-btn admin-btn-secondary" onClick={fetchCategories}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="admin-btn admin-btn-primary" onClick={openAddModal}>
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      {/* Categories Table Panel */}
      <div className="admin-panel">
        <div className="admin-table-wrapper">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <LoadingSpinner text="Loading bookstore categories..." />
            </div>
          ) : (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Slug Identifier</th>
                  <th>Description</th>
                  <th>Assigned Books</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <tr key={cat._id}>
                      {/* Image & Title */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={cat.image}
                            alt={cat.name}
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 'var(--admin-radius-md)',
                              objectFit: 'cover',
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--admin-text-main)' }}>
                              {cat.name}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--admin-text-subtle)' }}>
                              Icon: {cat.icon || 'BookOpen'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                          /{cat.slug || cat.name.toLowerCase()}
                        </span>
                      </td>

                      {/* Description */}
                      <td style={{ fontSize: 12.5, color: 'var(--admin-text-muted)', maxWidth: 280 }}>
                        {cat.description || 'No description provided'}
                      </td>

                      {/* Books count */}
                      <td>
                        <button
                          className="admin-status-pill info"
                          style={{ cursor: 'pointer', border: 'none' }}
                          onClick={() => viewCategoryBooks(cat)}
                        >
                          <Eye size={12} style={{ marginRight: 4 }} />
                          {cat.count || 0} books
                        </button>
                      </td>

                      {/* Active Status */}
                      <td>
                        <button
                          className={`admin-status-pill ${cat.isActive !== false ? 'success' : 'danger'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                          onClick={() => handleToggleStatus(cat)}
                        >
                          {cat.isActive !== false ? 'Active' : 'Disabled'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            className="admin-btn admin-btn-secondary admin-btn-icon"
                            title="Edit Category"
                            onClick={() => openEditModal(cat)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="admin-btn admin-btn-secondary admin-btn-icon"
                            style={{ color: 'var(--admin-danger)' }}
                            title="Delete Category"
                            onClick={() => handleDelete(cat)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                      No categories found. Click "Add Category" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingCategory ? `Edit Category: "${editingCategory.name}"` : 'Add New Category'}
              </h3>
              <button
                className="admin-modal-close-btn"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                {errorMsg && (
                  <div
                    style={{
                      padding: 10,
                      backgroundColor: 'var(--admin-danger-bg)',
                      color: 'var(--admin-danger)',
                      borderRadius: 'var(--admin-radius-md)',
                      marginBottom: 16,
                      fontSize: 13,
                    }}
                  >
                    {errorMsg}
                  </div>
                )}

                <div className="admin-form-group">
                  <label className="admin-form-label">Category Name *</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    style={{ width: '100%' }}
                    placeholder="e.g. Science & Philosophy"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Short Description</label>
                  <textarea
                    rows="3"
                    className="admin-form-textarea"
                    style={{ width: '100%' }}
                    placeholder="Describe what readers will discover in this genre..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Image Banner URL</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      type="text"
                      className="admin-form-input"
                      style={{ flex: 1 }}
                      placeholder="https://images.unsplash.com/..."
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                    <label
                      className="admin-btn admin-btn-secondary"
                      style={{ cursor: uploading ? 'wait' : 'pointer' }}
                    >
                      <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-switch-label">
                    <div
                      className={`admin-switch-track ${formData.isActive ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    >
                      <div className="admin-switch-thumb" />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Active on Public Storefront</span>
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
                  {submitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Books Under Category Preview Modal */}
      {previewCategory && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container large">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                Titles in Category: "{previewCategory.name}" ({categoryBooks.length})
              </h3>
              <button
                className="admin-modal-close-btn"
                onClick={() => setPreviewCategory(null)}
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              {loadingCategoryBooks ? (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <LoadingSpinner text="Fetching books..." />
                </div>
              ) : categoryBooks.length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 16,
                  }}
                >
                  {categoryBooks.map((b) => (
                    <div
                      key={b._id}
                      style={{
                        padding: 12,
                        border: '1px solid var(--admin-border)',
                        borderRadius: 'var(--admin-radius-md)',
                        backgroundColor: 'var(--admin-surface)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                      }}
                    >
                      <img
                        src={b.image}
                        alt={b.title}
                        style={{ width: 60, height: 85, objectFit: 'cover', borderRadius: 4, marginBottom: 8 }}
                      />
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{b.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{b.author}</div>
                      <div style={{ fontWeight: 800, marginTop: 4, color: 'var(--admin-primary)' }}>
                        ${b.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--admin-text-subtle)' }}>
                  No books are currently assigned to this category.
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => setPreviewCategory(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
