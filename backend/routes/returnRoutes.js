const express = require('express');
const router = express.Router();
const {
  createReturnRequest,
  getMyReturns,
  getAdminReturns,
  updateReturnStatus,
} = require('../controllers/returnController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/request', protect, createReturnRequest);
router.get('/my', protect, getMyReturns);
router.get('/admin/all', protect, admin, getAdminReturns);
router.put('/admin/:id/status', protect, admin, updateReturnStatus);

module.exports = router;

