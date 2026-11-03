const express = require('express');
const router = express.Router();
const {
  getAuthorProfile,
  getPublisherProfile,
  getAllAuthors,
  getAllPublishers,
  createOrUpdateAuthor,
  createOrUpdatePublisher,
} = require('../controllers/authorPublisherController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/authors', getAllAuthors);
router.get('/authors/:name', getAuthorProfile);
router.post('/authors/admin', protect, admin, createOrUpdateAuthor);

router.get('/publishers', getAllPublishers);
router.get('/publishers/:name', getPublisherProfile);
router.post('/publishers/admin', protect, admin, createOrUpdatePublisher);

module.exports = router;
