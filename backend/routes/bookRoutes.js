const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  getFeaturedBooks,
  getBestSellers,
  getNewArrivals,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createBook,
  updateBook,
  deleteBook,
  createBookReview,
} = require('../controllers/bookController');
const {
  getSmartRecommendations,
  getSimilarBooks,
  getFrequentlyBoughtTogether,
  compareBooks,
} = require('../controllers/recommendationController');
const {
  getSearchSuggestions,
  searchByIsbn,
  getPopularSearches,
} = require('../controllers/searchController');
const { protect, admin } = require('../middleware/authMiddleware');

// Specific routes (MUST come before /:id)
router.route('/').get(getBooks).post(protect, admin, createBook);
router.get('/featured', getFeaturedBooks);
router.get('/bestsellers', getBestSellers);
router.get('/new-arrivals', getNewArrivals);

// Smart Recommendations & Comparison
router.get('/recommendations/smart', getSmartRecommendations);
router.get('/compare', compareBooks);

// Search Suggestions & ISBN Barcode Lookup
router.get('/search/suggestions', getSearchSuggestions);
router.get('/search/popular', getPopularSearches);
router.get('/search/isbn/:isbn', searchByIsbn);

// Category Management
router.route('/categories').get(getCategories).post(protect, admin, createCategory);
router
  .route('/categories/:id')
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

// Item specific endpoints
router.get('/:id/similar', getSimilarBooks);
router.get('/:id/frequently-bought-together', getFrequentlyBoughtTogether);

router
  .route('/:id')
  .get(getBookById)
  .put(protect, admin, updateBook)
  .delete(protect, admin, deleteBook);

router.route('/:id/reviews').post(protect, createBookReview);

module.exports = router;
