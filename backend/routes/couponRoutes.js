const express = require('express');
const router = express.Router();
const {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} = require('../controllers/couponController');
const { protect, admin, requirePermission } = require('../middleware/authMiddleware');

// Customer validation endpoint
router.post('/validate', validateCoupon);

// Admin Coupon Management
router
  .route('/')
  .get(protect, admin, requirePermission('coupons'), getCoupons)
  .post(protect, admin, requirePermission('coupons'), createCoupon);

router
  .route('/:id')
  .put(protect, admin, requirePermission('coupons'), updateCoupon)
  .delete(protect, admin, requirePermission('coupons'), deleteCoupon);

module.exports = router;

