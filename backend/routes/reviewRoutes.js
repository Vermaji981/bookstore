const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middleware/authMiddleware');

// @desc    Vote helpful on a review
// @route   POST /api/reviews/:id/helpful
// @access  Private
router.post('/:id/helpful', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const userIdStr = req.user._id.toString();
    const index = review.helpfulVotes.findIndex((uid) => uid.toString() === userIdStr);

    let voted = false;
    if (index > -1) {
      review.helpfulVotes.splice(index, 1);
      voted = false;
    } else {
      review.helpfulVotes.push(req.user._id);
      voted = true;
    }

    await review.save();

    res.json({
      success: true,
      helpfulVotesCount: review.helpfulVotes.length,
      hasVoted: voted,
      message: voted ? 'Thank you for your feedback!' : 'Helpful vote removed',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Report an inappropriate review
// @route   POST /api/reviews/:id/report
// @access  Private
router.post('/:id/report', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.reported = true;
    review.reportReason = reason || 'Customer flagged as inappropriate';
    await review.save();

    res.json({
      success: true,
      message: 'Review reported successfully. Our moderation team will investigate.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

