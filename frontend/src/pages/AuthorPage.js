import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, Award } from 'lucide-react';
import api from '../api/api';
import BookCard from '../components/common/BookCard';

const AuthorPage = () => {
  const { name } = useParams();
  const [authorData, setAuthorData] = useState(null);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setErrorMsg('');
    api
      .get(`/authors/${encodeURIComponent(name)}`)
      .then((res) => {
        if (res.data.success) {
          setAuthorData(res.data.data.author);
          setBooks(res.data.data.books || []);
        }
      })
      .catch((err) => {
        setErrorMsg('Failed to load author profile.');
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

  if (errorMsg || !authorData) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Author Not Found</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          We could not find the author profile for "{name}".
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
        {/* Back Link */}
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

        {/* Author Bio Banner */}
        <div className="author-profile-hero">
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <img
              src={authorData.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
              alt={authorData.name}
              className="author-avatar-lg"
            />
            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-accent">Featured Author</span>
                {authorData.nationality && (
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>• {authorData.nationality}</span>
                )}
              </div>
              <h1 className="title-lg font-serif" style={{ margin: '0.35rem 0' }}>
                {authorData.name}
              </h1>
              <p style={{ color: '#475569', fontSize: '0.98rem', lineHeight: 1.6, maxWidth: '680px' }}>
                {authorData.bio}
              </p>

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <BookOpen size={16} color="var(--primary)" />
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{books.length} Books</span>
                </div>
                {authorData.genres && authorData.genres.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Award size={16} color="#f59e0b" />
                    <span style={{ color: '#64748b' }}>Genres: {authorData.genres.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Catalog by Author */}
        <div style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="title-md font-serif">
              Published Works by {authorData.name} ({books.length})
            </h2>
          </div>

          {books.length === 0 ? (
            <p style={{ color: '#64748b' }}>No books listed currently for this author.</p>
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

export default AuthorPage;
