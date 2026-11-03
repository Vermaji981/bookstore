import axios from 'axios';

const getBaseURL = () => {
  let url = process.env.REACT_APP_API_URL;
  if (!url || !url.trim()) {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      url = 'https://bookstore-lgo4.onrender.com/api';
    } else {
      url = 'http://localhost:5000/api';
    }
  }

  url = url.trim().replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url += '/api';
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach JWT token
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('bookstore_user');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (err) {
        console.error('Failed to parse user token from storage', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for helpful logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // Optional: handle clean session reset if needed
    }
    return Promise.reject(error);
  }
);

export default api;
