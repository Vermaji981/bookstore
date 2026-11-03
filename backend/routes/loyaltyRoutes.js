const express = require('express');
const router = express.Router();
const {
  getMyLoyalty,
  estimatePointsRedemption,
  adminAdjustPoints,
  getAdminLoyaltySummary,
} = require('../controllers/loyaltyController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/me', protect, getMyLoyalty);
router.post('/redeem-estimate', protect, estimatePointsRedemption);
router.post('/admin/adjust', protect, admin, adminAdjustPoints);
router.get('/admin/summary', protect, admin, getAdminLoyaltySummary);

module.exports = router;
