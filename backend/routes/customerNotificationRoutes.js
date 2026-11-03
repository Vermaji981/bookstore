const express = require('express');
const router = express.Router();
const {
  getCustomerNotifications,
  markCustomerNotificationRead,
  updateNotificationPreferences,
} = require('../controllers/customerNotificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/customer', protect, getCustomerNotifications);
router.put('/customer/:id/read', protect, markCustomerNotificationRead);
router.put('/customer/preferences', protect, updateNotificationPreferences);

module.exports = router;

