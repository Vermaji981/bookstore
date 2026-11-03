const express = require('express');
const router = express.Router();
const {
  getWishlist,
  toggleWishlist,
  subscribePriceAlert,
  trackRecentlyViewed,
  getRecentlyViewed,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getWishlist);
router.post('/toggle', protect, toggleWishlist);
router.post('/price-alert', protect, subscribePriceAlert);
router.post('/recently-viewed', protect, trackRecentlyViewed);
router.get('/recently-viewed', protect, getRecentlyViewed);

module.exports = router;

