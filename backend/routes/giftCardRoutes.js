const express = require('express');
const router = express.Router();
const {
  checkGiftCardBalance,
  createGiftCard,
  getAdminGiftCards,
  toggleGiftCardStatus,
} = require('../controllers/giftCardController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/check', checkGiftCardBalance);
router.post('/', protect, createGiftCard);
router.get('/admin/all', protect, admin, getAdminGiftCards);
router.put('/admin/:id/toggle', protect, admin, toggleGiftCardStatus);

module.exports = router;

