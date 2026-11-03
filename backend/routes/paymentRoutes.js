const express = require('express');
const router = express.Router();
const {
  getStripeConfig,
  createPaymentIntent,
  verifyPayment,
  stripeWebhook,
  getAdminTransactions,
  processRefund,
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/config', getStripeConfig);
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/verify-payment', protect, verifyPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Admin Payment Management
router.get('/admin/transactions', protect, admin, getAdminTransactions);
router.post('/admin/refund', protect, admin, processRefund);

module.exports = router;
