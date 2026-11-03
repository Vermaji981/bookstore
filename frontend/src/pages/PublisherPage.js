import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, BookOpen, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import api from '../api/api';
import BookCard from '../components/common/BookCard';

const PublisherPage = () => {
  const { name } = useParams();
  const [publisherData, setPublisherData] = useState(null);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setErrorMsg('');
    api
      .get(`/publishers/${encodeURIComponent(name)}`)
      .then((res) => {
        if (res.data.success) {
          setPublisherData(res.data.data.publisher);
          setBooks(res.data.data.books || []);
        }
      })
      .catch((err) => {
        setErrorMsg('Failed to load publisher profile.');
      })
      .finally(() => setIsLoading(false));
  }, [name]);

  if (isLoading) {
    return (
      <div className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (errorMsg || !publisherData) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Publisher Not Found</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          We could not find the publisher profile for "{name}".
        </p>
        <Link to="/books" className="btn btn-primary btn-sm">
          Return to Books Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="section animate-fade-in" style={{ backgroundColor: '#f8fafc', minHeight: '85vh' }}>
      <div className="container">
        <Link
          to="/books"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#64748b',
            textDecoration: 'none',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>

        {/* Publisher Hero */}
        <div className="author-profile-hero">
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="publisher-logo-box">
              <Building2 size={44} color="var(--primary)" />
            </div>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <span className="badge badge-primary">Verified Publisher</span>
              <h1 className="title-lg font-serif" style={{ margin: '0.35rem 0' }}>
                {publisherData.name}
              </h1>
              <p style={{ color: '#475569', fontSize: '0.98rem', lineHeight: 1.6, maxWidth: '680px' }}>
                {publisherData.description}
              </p>

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <BookOpen size={16} color="var(--primary)" />
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{books.length} Books Published</span>
                </div>
                {publisherData.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={16} color="#64748b" />
                    <span style={{ color: '#64748b' }}>{publisherData.location}</span>
                  </div>
                )}
                {publisherData.foundedYear && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={16} color="#64748b" />
                    <span style={{ color: '#64748b' }}>Est. {publisherData.foundedYear}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Catalog by Publisher */}
        <div style={{ marginTop: '3rem' }}>
          <h2 className="title-md font-serif" style={{ marginBottom: '1.5rem' }}>
            Titles by {publisherData.name} ({books.length})
          </h2>

          {books.length === 0 ? (
            <p style={{ color: '#64748b' }}>No books listed currently for this publisher.</p>
          ) : (
            <div className="grid-books">
              {books.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublisherPage;

