import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle,
  EyeOff,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import api from '../../api/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      });
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (ratingFilter !== 'All') params.append('rating', ratingFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/admin/reviews?${params.toString()}`);
      if (res.data.success) {
        setReviews(res.data.data);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.pages || 1);
          setTotalCount(res.data.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, ratingFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReviews();
  };

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      const res = await api.put(`/admin/reviews/${reviewId}/status`, { status: newStatus });
      if (res.data.success) {
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update review status');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this customer review?')) return;
    try {
      const res = await api.delete(`/admin/reviews/${reviewId}`);
      if (res.data.success) {
        fetchReviews();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <h1>Customer Reviews & Ratings Moderation</h1>
          <p className="admin-view-subtitle">
            Moderate book reviews, filter ratings, approve authentic reader testimonials, and purge spam comments.
          </p>
        </div>
        <div className="admin-view-actions">
          <button className="admin-btn admin-btn-secondary" onClick={fetchReviews}>
            <RefreshCw size={15} /> Refresh Reviews
          </button>
        </div>
      </div>

      {/* Table Panel */}
      <div className="admin-panel">
        <div className="admin-table-controls">
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260 }}>
            <div className="admin-search-wrapper" style={{ width: '100%' }}>
              <Search className="admin-search-icon" />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search reviews by comment content or author name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-secondary">
              Search
            </button>
          </form>

          {/* Filters */}
          <div className="admin-table-filters">
            <select
              className="admin-filter-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Moderation Status</option>
              <option value="approved">Approved & Visible</option>
              <option value="pending">Pending Moderation</option>
              <option value="hidden">Hidden Inappropriate</option>
            </select>

            <select
              className="admin-filter-select"
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Star Ratings</option>
              <option value="5">★★★★★ 5 Stars</option>
              <option value="4">★★★★☆ 4 Stars</option>
              <option value="3">★★★☆☆ 3 Stars</option>
              <option value="2">★★☆☆☆ 2 Stars</option>
              <option value="1">★☆☆☆☆ 1 Star</option>
            </select>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="admin-table-wrapper">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <LoadingSpinner text="Retrieving customer reviews..." />
            </div>
          ) : (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Review Feedback</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Moderation</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length > 0 ? (
                  reviews.map((r) => (
                    <tr key={r._id}>
                      {/* Book */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {r.book?.image && (
                            <img
                              src={r.book.image}
                              alt=""
                              style={{ width: 32, height: 44, objectFit: 'cover', borderRadius: 4 }}
                            />
                          )}
                          <div>
                            <div style={{ fontWeight: 600 }}>{r.book?.title || 'Unknown Title'}</div>
                            <div style={{ fontSize: 11, color: 'var(--admin-text-subtle)' }}>
                              by {r.book?.author || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Reviewer */}
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--admin-text-subtle)' }}>
                          {r.user?.email || 'Registered User'}
                        </div>
                      </td>

                      {/* Rating */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#f59e0b' }}>
                          {[...Array(5)].map((_, i) => (
                            <span key={i} style={{ fontSize: 14 }}>
                              {i < r.rating ? '★' : '☆'}
                            </span>
                          ))}
                          <span style={{ fontSize: 12, fontWeight: 700, marginLeft: 4, color: 'var(--admin-text-main)' }}>
                            {r.rating}.0
                          </span>
                        </div>
                      </td>

                      {/* Comment */}
                      <td style={{ maxWidth: 300, fontSize: 13, lineHeight: 1.5 }}>
                        "{r.comment}"
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`admin-status-pill ${
                            r.status === 'approved'
                              ? 'success'
                              : r.status === 'hidden'
                              ? 'danger'
                              : 'warning'
                          }`}
                        >
                          {r.status || 'approved'}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ fontSize: 12, color: 'var(--admin-text-subtle)', whiteSpace: 'nowrap' }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {r.status !== 'approved' && (
                            <button
                              className="admin-btn admin-btn-secondary admin-btn-icon"
                              style={{ color: 'var(--admin-success)' }}
                              title="Approve Review"
                              onClick={() => handleStatusChange(r._id, 'approved')}
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          {r.status !== 'hidden' && (
                            <button
                              className="admin-btn admin-btn-secondary admin-btn-icon"
                              style={{ color: 'var(--admin-warning)' }}
                              title="Hide Review"
                              onClick={() => handleStatusChange(r._id, 'hidden')}
                            >
                              <EyeOff size={14} />
                            </button>
                          )}
                          <button
                            className="admin-btn admin-btn-secondary admin-btn-icon"
                            style={{ color: 'var(--admin-danger)' }}
                            title="Delete Spam Review"
                            onClick={() => handleDelete(r._id)}
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
                      No reviews found matching the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="admin-pagination-wrapper">
          <div className="admin-pagination-info">
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} reviews)
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
    </div>
  );
};

export default ReviewsManagement;
