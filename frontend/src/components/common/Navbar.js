import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Package,
  LogOut,
  ShieldCheck,
  Mic,
  MicOff,
  Barcode,
  Scale,
  Sun,
  Moon,
  Globe,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useCompare } from '../../context/CompareContext';
import { useToast } from '../../context/ToastContext';
import CustomerNotificationBell from './CustomerNotificationBell';
import IsbnSearchModal from './IsbnSearchModal';
import api from '../../api/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { itemsCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { lang, toggleLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { compareList, setIsCompareOpen } = useCompare();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isbnModalOpen, setIsbnModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Search Autocomplete suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Live search suggestions debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/books/search/suggestions?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.data.success && res.data.data?.books) {
          setSuggestions(res.data.data.books);
          setShowSuggestions(true);
        }
      } catch (err) {}
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside search listener
  useEffect(() => {
    const handleOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/books?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice search is not supported by your current browser. You can use text or ISBN search!', 'info');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      setIsListening(true);
      showToast('Listening... Speak the title or author now', 'info', 2000);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        navigate(`/books?keyword=${encodeURIComponent(transcript)}`);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="pagehaven-header">
        {/* Top Announcement Bar */}
        <div className="announcement-bar">
          <div className="container announcement-container">
            <span>{t('free_delivery_banner')}</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Language Switcher */}
              <button
                type="button"
                className="topbar-tool-btn"
                onClick={toggleLang}
                title="Switch Language (English / हिन्दी)"
              >
                <Globe size={13} />
                <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
              </button>

              {/* Theme Switcher */}
              <button
                type="button"
                className="topbar-tool-btn"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'dark' ? <Sun size={13} color="#f59e0b" /> : <Moon size={13} />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="main-navbar-wrap">
          <div className="container navbar-container">
            {/* Logo */}
            <Link to="/" className="brand-logo-link">
              <img
                src="/favicon.svg"
                alt="PageHaven Logo"
                className="brand-logo-img"
                style={{ width: '40px', height: '40px', objectFit: 'contain', flexShrink: 0, borderRadius: '8px' }}
              />
              <div>
                <span className="brand-title">
                  Page<span style={{ color: 'var(--primary)' }}>Haven</span>
                </span>
                <span className="logo-subtitle">
                  Enterprise Online Bookstore
                </span>
              </div>
            </Link>

            {/* Advanced Search Bar - Desktop */}
            <div className="navbar-search-wrapper" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="navbar-search-form">
                <Search size={18} className="search-icon-left" />
                <input
                  type="text"
                  placeholder={t('nav_search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="navbar-search-input"
                />

                {/* Search Utility Action Buttons */}
                <div className="search-actions-right">
                  <button
                    type="button"
                    className={`search-tool-btn ${isListening ? 'listening' : ''}`}
                    onClick={handleVoiceSearch}
                    title="Voice Search (Speak title or author)"
                  >
                    {isListening ? <MicOff size={16} color="#ef4444" /> : <Mic size={16} />}
                  </button>

                  <button
                    type="button"
                    className="search-tool-btn"
                    onClick={() => setIsbnModalOpen(true)}
                    title="Search by ISBN Barcode"
                  >
                    <Barcode size={18} />
                  </button>
                </div>
              </form>

              {/* Autocomplete Dropdown List */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="search-autocomplete-dropdown animate-slide-up">
                  <div className="autocomplete-header">
                    <span>Matching Bookstore Titles</span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Press enter for all</span>
                  </div>
                  {suggestions.map((book) => (
                    <div
                      key={book._id}
                      className="autocomplete-item"
                      onClick={() => {
                        setShowSuggestions(false);
                        navigate(`/book/${book._id}`);
                      }}
                    >
                      <img src={book.image} alt={book.title} className="autocomplete-thumb" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="autocomplete-title">{book.title}</p>
                        <p className="autocomplete-meta">
                          by {book.author} • <span style={{ color: 'var(--primary)' }}>{book.category}</span>
                        </p>
                      </div>
                      <span className="autocomplete-price">${Number(book.price).toFixed(2)}</span>
                    </div>
                  ))}
                  <div
                    className="autocomplete-footer"
                    onClick={handleSearchSubmit}
                  >
                    <span>View all results for "{searchQuery}" →</span>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Links - Desktop */}
            <nav className="desktop-nav">
              <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                {t('nav_home')}
              </Link>
              <Link to="/books" className={`nav-link ${isActive('/books') ? 'active' : ''}`}>
                {t('nav_catalog')}
              </Link>
              <Link to="/track-order" className={`nav-link ${isActive('/track-order') ? 'active' : ''}`}>
                Track Order
              </Link>
              <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
                About
              </Link>
              <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>
                Contact
              </Link>
            </nav>

            {/* Actions: Compare, Wishlist, Notification, Cart, Profile */}
            <div className="nav-actions-group">
              {/* Compare Button */}
              <button
                type="button"
                className="nav-icon-btn nav-compare-btn"
                onClick={() => setIsCompareOpen(true)}
                title="Book Comparison Matrix"
              >
                <Scale size={20} />
                {compareList.length > 0 && (
                  <span className="nav-badge-pill primary">{compareList.length}</span>
                )}
              </button>

              {/* Wishlist Icon */}
              <Link
                to={user ? '/dashboard?tab=wishlist' : '/login'}
                className="nav-icon-btn nav-wishlist-btn"
                title="Saved Wishlist"
              >
                <Heart size={20} />
                {wishlistCount > 0 && <span className="nav-badge-pill danger">{wishlistCount}</span>}
              </Link>

              {/* Customer Notifications (If logged in) */}
              {user && <CustomerNotificationBell />}

              {/* Shopping Cart Icon */}
              <Link to="/cart" className="nav-icon-btn" title="Shopping Cart">
                <ShoppingCart size={20} />
                {itemsCount > 0 && <span className="nav-badge-pill primary">{itemsCount}</span>}
              </Link>

              {/* User Account / Auth Dropdown */}
              {user ? (
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className={`nav-user-btn ${userDropdownOpen ? 'active' : ''}`}
                  >
                    <div className="nav-user-avatar">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="nav-user-name">{user.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} className="nav-user-chevron" />
                  </button>

                  {userDropdownOpen && (
                    <div className="user-dropdown-menu animate-slide-up">
                      <div className="user-dropdown-header">
                        <p style={{ fontWeight: 700, fontSize: '0.88rem', margin: 0, color: '#0f172a' }}>
                          {user.name}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>{user.email}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '4px' }}>
                          <Award size={13} color="#f59e0b" />
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706' }}>
                            {user.loyaltyTier || 'Silver'} Member
                          </span>
                        </div>
                      </div>

                      <div className="user-dropdown-body">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="user-dropdown-item admin-link"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <ShieldCheck size={16} />
                            <span>Super Admin Panel</span>
                          </Link>
                        )}
                        <Link
                          to="/dashboard?tab=profile"
                          className="user-dropdown-item"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <User size={16} />
                          <span>My Account Profile</span>
                        </Link>
                        <Link
                          to="/dashboard?tab=orders"
                          className="user-dropdown-item"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Package size={16} />
                          <span>My Orders & Tracking</span>
                        </Link>
                        <Link
                          to="/dashboard?tab=rewards"
                          className="user-dropdown-item"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Award size={16} />
                          <span>Rewards & Referrals</span>
                        </Link>
                        <Link
                          to="/dashboard?tab=wishlist"
                          className="user-dropdown-item"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Heart size={16} />
                          <span>Saved Wishlist ({wishlistCount})</span>
                        </Link>

                        <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />

                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="user-dropdown-item danger"
                        >
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary btn-sm">
                  <span>{t('nav_signin')}</span>
                </Link>
              )}

              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                className="mobile-hamburger-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-drawer animate-slide-up">
            <div style={{ padding: '1rem' }}>
              <form onSubmit={handleSearchSubmit} style={{ position: 'relative', marginBottom: '1rem' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="navbar-search-input"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                />
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav_home')}
                </Link>
                <Link to="/books" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav_catalog')}
                </Link>
                <Link to="/track-order" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  Track Order
                </Link>
                <Link to={user ? '/dashboard?tab=wishlist' : '/login'} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ''}
                </Link>
                <button
                  type="button"
                  className="mobile-nav-link"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsCompareOpen(true);
                  }}
                  style={{ background: 'transparent', border: 'none', textAlign: 'left', font: 'inherit', cursor: 'pointer', padding: '0.65rem 0.85rem' }}
                >
                  Book Comparison {compareList.length > 0 ? `(${compareList.length})` : ''}
                </button>
                <Link to="/about" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  About Us
                </Link>
                <Link to="/contact" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  Contact Support
                </Link>
                {user && (
                  <Link to="/dashboard" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Customer Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    Super Admin Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ISBN Search Barcode Modal */}
      <IsbnSearchModal isOpen={isbnModalOpen} onClose={() => setIsbnModalOpen(false)} />
    </>
  );
};

export default Navbar;
