import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('bookstore_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('bookstore_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      const userData = response.data.data;
      setUser(userData);
      localStorage.setItem('bookstore_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    throw new Error(response.data.message || 'Login failed');
  };

  const register = async (name, email, password, phone) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      phone,
    });
    if (response.data.success) {
      const userData = response.data.data;
      setUser(userData);
      localStorage.setItem('bookstore_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    throw new Error(response.data.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bookstore_user');
  };

  const updateProfile = async (formData) => {
    const response = await api.put('/auth/profile', formData);
    if (response.data.success) {
      const updated = { ...user, ...response.data.data };
      setUser(updated);
      localStorage.setItem('bookstore_user', JSON.stringify(updated));
      return { success: true, user: updated };
    }
    throw new Error(response.data.message || 'Profile update failed');
  };

  const changePassword = async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  };

  const adminRoles = ['superadmin', 'admin', 'order_manager', 'inventory_manager', 'support'];
  const isAdmin = user && adminRoles.includes(user.role);
  const isSuperAdmin = user && user.role === 'superadmin';

  const hasPermission = (moduleName) => {
    if (!user) return false;
    if (user.role === 'superadmin') return true;
    if (user.role === 'admin') return true;
    if (user.role === 'order_manager') return ['orders', 'returns', 'payments', 'giftcards', 'overview'].includes(moduleName);
    if (user.role === 'inventory_manager') return ['books', 'authors', 'categories', 'inventory', 'overview'].includes(moduleName);
    if (user.role === 'support') return ['users', 'orders', 'returns', 'reviews', 'loyalty', 'overview'].includes(moduleName);
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isSuperAdmin,
        hasPermission,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
