import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('bookstore_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  useEffect(() => {
    localStorage.setItem('bookstore_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (book, qty = 1) => {
    const quantity = Math.max(1, Number(qty));
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.book._id === book._id);
      if (existing) {
        const newQty = Math.min(existing.qty + quantity, book.stock || 99);
        return prevItems.map((item) =>
          item.book._id === book._id ? { ...item, qty: newQty } : item
        );
      } else {
        const initialQty = Math.min(quantity, book.stock || 99);
        return [...prevItems, { book, qty: initialQty }];
      }
    });
  };

  const removeFromCart = (bookId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.book._id !== bookId)
    );
  };

  const updateQuantity = (bookId, qty) => {
    if (qty <= 0) {
      removeFromCart(bookId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.book._id === bookId) {
          const maxStock = item.book.stock !== undefined ? item.book.stock : 99;
          const safeQty = Math.min(qty, maxStock);
          return { ...item, qty: safeQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setPromoCode('');
    setDiscountPercent(0);
    setPromoError('');
    setPromoSuccess('');
    localStorage.removeItem('bookstore_cart');
  };

  const applyPromoCode = (code) => {
    const cleanCode = code.trim().toUpperCase();
    setPromoError('');
    setPromoSuccess('');

    if (!cleanCode) {
      setPromoError('Please enter a coupon code');
      return false;
    }

    if (cleanCode === 'BOOKWORM' || cleanCode === 'BOOK10') {
      setDiscountPercent(10);
      setPromoCode(cleanCode);
      setPromoSuccess('10% Discount applied successfully!');
      return true;
    } else if (cleanCode === 'WELCOME20' || cleanCode === 'READ20') {
      setDiscountPercent(20);
      setPromoCode(cleanCode);
      setPromoSuccess('20% Reader Welcome discount applied!');
      return true;
    } else {
      setPromoError('Invalid coupon code. Try BOOKWORM or WELCOME20');
      return false;
    }
  };

  // Calculations
  const itemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = Number(
    cartItems
      .reduce((acc, item) => acc + item.book.price * item.qty, 0)
      .toFixed(2)
  );

  const discountAmount = Number(
    ((subtotal * discountPercent) / 100).toFixed(2)
  );

  // Free delivery for orders $35 and above
  const shippingFee = subtotal >= 35 || subtotal === 0 ? 0 : 4.99;

  // 8% estimated sales tax
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number((taxableAmount * 0.08).toFixed(2));

  const total = Number(
    (taxableAmount + shippingFee + taxAmount).toFixed(2)
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemsCount,
        subtotal,
        discountPercent,
        discountAmount,
        shippingFee,
        taxAmount,
        total,
        promoCode,
        promoError,
        promoSuccess,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyPromoCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
