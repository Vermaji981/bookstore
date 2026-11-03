const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  getAdminStats,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/admin/stats', protect, admin, getAdminStats);
router.route('/wishlist').get(protect, getWishlist);
router.route('/wishlist/:bookId').post(protect, addToWishlist).delete(protect, removeFromWishlist);

router.route('/').get(protect, admin, getUsers);
router.route('/:id').get(protect, admin, getUserById);
router.route('/:id/role').put(protect, admin, updateUserRole);
router.route('/:id/status').put(protect, admin, toggleUserStatus);

module.exports = router;
