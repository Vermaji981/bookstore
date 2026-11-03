import React, { useState, useEffect } from 'react';
import {
  Plus,
  RefreshCw,
  Edit2,
  Search,
  Building,
  User,
  X,
} from 'lucide-react';
import api from '../../api/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AuthorManagement = () => {
  const [activeTab, setActiveTab] = useState('authors'); // 'authors' | 'publishers'
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Author Modal
  const [authorModalOpen, setAuthorModalOpen] = useState(false);
  const [authorForm, setAuthorForm] = useState({
    name: '',
    bio: '',
    image: '',
    genres: '',
    born: '',
    nationality: '',
    website: '',
    twitter: '',
    instagram: '',
  });

  // Publisher Modal
  const [pubModalOpen, setPubModalOpen] = useState(false);
  const [pubForm, setPubForm] = useState({
    name: '',
    description: '',
    logo: '',
    location: '',
    foundedYear: 1950,
    website: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [authRes, pubRes] = await Promise.all([
        api.get('/authors'),
        api.get('/publishers'),
      ]);
      if (authRes.data.success) setAuthors(authRes.data.data || []);
      if (pubRes.data.success) setPublishers(pubRes.data.data || []);
    } catch (err) {
      console.error('Failed to load authors or publishers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddAuthor = (auth = null) => {
    if (auth) {
      setAuthorForm({
        name: auth.name,
        bio: auth.bio || '',
        image: auth.image || '',
        genres: Array.isArray(auth.genres) ? auth.genres.join(', ') : '',
        born: auth.born || '',
        nationality: auth.nationality || '',
        website: auth.socialLinks?.website || '',
        twitter: auth.socialLinks?.twitter || '',
        instagram: auth.socialLinks?.instagram || '',
      });
    } else {
      setAuthorForm({
        name: '',
        bio: '',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        genres: 'Fiction, Non-Fiction',
        born: '1975',
        nationality: 'International',
        website: '',
        twitter: '',
        instagram: '',
      });
    }
    setAuthorModalOpen(true);
  };

  const handleSaveAuthor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...authorForm,
        genres: authorForm.genres.split(',').map((g) => g.trim()).filter(Boolean),
      };
      const res = await api.post('/authors/admin', payload);
      if (res.data.success) {
        setAuthorModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save author');
    } finally {
      setSubmitting(false);
    }
  };

  const openAddPublisher = (pub = null) => {
    if (pub) {
      setPubForm({
        name: pub.name,
        description: pub.description || '',
        logo: pub.logo || '',
        location: pub.location || '',
        foundedYear: pub.foundedYear || 1950,
        website: pub.website || '',
      });
    } else {
      setPubForm({
        name: '',
        description: '',
        logo: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
        location: 'New York, USA',
        foundedYear: 1950,
        website: '',
      });
    }
    setPubModalOpen(true);
  };

  const handleSavePublisher = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/publishers/admin', pubForm);
      if (res.data.success) {
        setPubModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save publisher');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAuthors = authors.filter((a) =>
    searchTerm === '' || a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPublishers = publishers.filter((p) =>
    searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page animate-fade-in">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--admin-text)' }}>
            Authors & Publishers Management
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Curate author biographies, headshots, genres, and publishing house profiles.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={15} /> Refresh
          </button>
          {activeTab === 'authors' ? (
            <button className="btn btn-primary" onClick={() => openAddAuthor()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Add Author Profile
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => openAddPublisher()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Add Publisher
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="admin-card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('authors')}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'authors' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'authors' ? 'white' : 'var(--admin-text-muted)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <User size={15} /> Authors ({authors.length})
            </button>
            <button
              onClick={() => setActiveTab('publishers')}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'publishers' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'publishers' ? 'white' : 'var(--admin-text-muted)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Building size={15} /> Publishers ({publishers.length})
            </button>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input"
              style={{ paddingLeft: '34px', width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Authors Tab Content */}
      {activeTab === 'authors' && (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px 20px' }}>
              <LoadingSpinner text="Loading author profiles..." />
            </div>
          ) : filteredAuthors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-text-muted)' }}>
              <User size={40} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <p style={{ fontWeight: 600, color: 'var(--admin-text)' }}>No Authors Found</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr>
                    <th>Author</th>
                    <th>Genres</th>
                    <th>Bio Preview</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuthors.map((auth, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={auth.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                            alt={auth.name}
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <strong style={{ color: 'var(--admin-text)' }}>{auth.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                              Slug: <code>{auth.slug}</code>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {auth.genres?.map((g, gi) => (
                            <span key={gi} style={{ fontSize: '0.72rem', padding: '2px 8px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '4px', fontWeight: 600 }}>
                              {g}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '380px' }}>
                          {auth.bio || 'Curated bookstore author.'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openAddAuthor(auth)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Edit2 size={13} /> Edit Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Publishers Tab Content */}
      {activeTab === 'publishers' && (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px 20px' }}>
              <LoadingSpinner text="Loading publishers..." />
            </div>
          ) : filteredPublishers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-text-muted)' }}>
              <Building size={40} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <p style={{ fontWeight: 600, color: 'var(--admin-text)' }}>No Publishers Found</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr>
                    <th>Publisher</th>
                    <th>Location & Founded</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPublishers.map((pub, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={pub.logo || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'}
                            alt={pub.name}
                            style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                          <div>
                            <strong style={{ color: 'var(--admin-text)' }}>{pub.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                              Slug: <code>{pub.slug}</code>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: 'var(--admin-text)' }}>{pub.location || 'Global'}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>Est. {pub.foundedYear || 1950}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '380px' }}>
                          {pub.description || 'Publisher profile'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openAddPublisher(pub)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Author Edit Modal */}
      {authorModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            className="admin-card"
            style={{
              width: '560px',
              maxWidth: '95vw',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                Author Profile Details
              </h3>
              <button
                type="button"
                onClick={() => setAuthorModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAuthor}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Author Full Name *</label>
                <input
                  type="text"
                  required
                  value={authorForm.name}
                  onChange={(e) => setAuthorForm({ ...authorForm, name: e.target.value })}
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Biography</label>
                <textarea
                  rows="3"
                  value={authorForm.bio}
                  onChange={(e) => setAuthorForm({ ...authorForm, bio: e.target.value })}
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Headshot Image URL</label>
                <input
                  type="url"
                  value={authorForm.image}
                  onChange={(e) => setAuthorForm({ ...authorForm, image: e.target.value })}
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-row-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Genres (comma separated)</label>
                  <input
                    type="text"
                    value={authorForm.genres}
                    onChange={(e) => setAuthorForm({ ...authorForm, genres: e.target.value })}
                    className="admin-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nationality</label>
                  <input
                    type="text"
                    value={authorForm.nationality}
                    onChange={(e) => setAuthorForm({ ...authorForm, nationality: e.target.value })}
                    className="admin-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setAuthorModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm"
                >
                  {submitting ? 'Saving...' : 'Save Author Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Publisher Edit Modal */}
      {pubModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            className="admin-card"
            style={{
              width: '520px',
              maxWidth: '95vw',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                Publisher Details
              </h3>
              <button
                type="button"
                onClick={() => setPubModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePublisher}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Publisher Name *</label>
                <input
                  type="text"
                  required
                  value={pubForm.name}
                  onChange={(e) => setPubForm({ ...pubForm, name: e.target.value })}
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Description</label>
                <textarea
                  rows="2"
                  value={pubForm.description}
                  onChange={(e) => setPubForm({ ...pubForm, description: e.target.value })}
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-row-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Headquarters Location</label>
                  <input
                    type="text"
                    value={pubForm.location}
                    onChange={(e) => setPubForm({ ...pubForm, location: e.target.value })}
                    className="admin-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Founded Year</label>
                  <input
                    type="number"
                    value={pubForm.foundedYear}
                    onChange={(e) => setPubForm({ ...pubForm, foundedYear: Number(e.target.value) })}
                    className="admin-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Logo Image URL</label>
                <input
                  type="url"
                  value={pubForm.logo}
                  onChange={(e) => setPubForm({ ...pubForm, logo: e.target.value })}
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setPubModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm"
                >
                  {submitting ? 'Saving...' : 'Save Publisher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorManagement;
