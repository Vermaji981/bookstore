import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const { showToast } = useToast();
  const [compareList, setCompareList] = useState(() => {
    try {
      const saved = localStorage.getItem('pagehaven_compare');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCompareOpen, setIsCompareOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('pagehaven_compare', JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (book) => {
    if (compareList.some((b) => b._id === book._id)) {
      showToast(`"${book.title}" is already in comparison`, 'info');
      setIsCompareOpen(true);
      return;
    }

    if (compareList.length >= 4) {
      showToast('You can compare a maximum of 4 books simultaneously', 'warning');
      setIsCompareOpen(true);
      return;
    }

    setCompareList((prev) => [...prev, book]);
    showToast(`Added "${book.title}" to Book Comparison`, 'success');
    setIsCompareOpen(true);
  };

  const removeFromCompare = (bookId) => {
    setCompareList((prev) => prev.filter((b) => b._id !== bookId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isComparing = (bookId) => {
    return compareList.some((b) => b._id === bookId);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isComparing,
        isCompareOpen,
        setIsCompareOpen,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);

