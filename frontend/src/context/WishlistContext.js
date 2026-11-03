import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('bookstore_wishlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('bookstore_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync with backend if user is authenticated
  useEffect(() => {
    if (user && user.token) {
      api
        .get('/users/wishlist')
        .then((res) => {
          if (res.data.success && Array.isArray(res.data.data)) {
            setWishlist(res.data.data);
          }
        })
        .catch((err) => {
          // Fallback to local
        });
    }
  }, [user]);

  const isInWishlist = (bookId) => {
    return wishlist.some((item) => (item._id || item) === bookId);
  };

  const toggleWishlist = async (book) => {
    const bookId = book._id || book;
    const exists = isInWishlist(bookId);

    if (exists) {
      setWishlist((prev) => prev.filter((item) => (item._id || item) !== bookId));
      if (user && user.token) {
        try {
          await api.delete(`/users/wishlist/${bookId}`);
        } catch (err) {}
      }
    } else {
      setWishlist((prev) => [...prev, book]);
      if (user && user.token) {
        try {
          await api.post(`/users/wishlist/${bookId}`);
        } catch (err) {}
      }
    }
  };

  const removeFromWishlist = async (bookId) => {
    setWishlist((prev) => prev.filter((item) => (item._id || item) !== bookId));
    if (user && user.token) {
      try {
        await api.delete(`/users/wishlist/${bookId}`);
      } catch (err) {}
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
