const express = require('express');
const router = express.Router();
const {
  getAllReviewsAdmin,
  updateReviewStatus,
  deleteReviewAdmin,
} = require('../controllers/reviewAdminController');
const { protect, admin, requirePermission } = require('../middleware/authMiddleware');

router.get('/', protect, admin, requirePermission('reviews'), getAllReviewsAdmin);
router.put('/:id/status', protect, admin, requirePermission('reviews'), updateReviewStatus);
router.delete('/:id', protect, admin, requirePermission('reviews'), deleteReviewAdmin);

module.exports = router;

