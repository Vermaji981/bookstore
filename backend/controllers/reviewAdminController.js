const mongoose = require('mongoose');
const Review = require('../models/Review');
const Book = require('../models/Book');
const { logAdminActivity } = require('../utils/logger');

// @desc    Get All Reviews (Admin)
// @route   GET /api/admin/reviews
// @access  Private/Admin
const getAllReviewsAdmin = async (req, res) => {
  try {
    const { status, rating, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status.toLowerCase();
    }

    if (rating && rating !== 'All') {
      query.rating = Number(rating);
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { comment: { $regex: search.trim(), $options: 'i' } },
        { name: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [total, reviews] = await Promise.all([
      Review.countDocuments(query),
      Review.find(query)
        .populate('book', 'title author image')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Review Status (Approve / Hide)
// @route   PUT /api/admin/reviews/:id/status
// @access  Private/Admin
const updateReviewStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Review ID' });
    }

    const { status } = req.body;
    if (!['approved', 'pending', 'hidden'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be one of: approved, pending, hidden',
      });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const previousStatus = review.status;
    review.status = status;
    await review.save();

    // Recalculate book rating based only on approved reviews
    const book = await Book.findById(review.book);
    if (book) {
      const approvedReviews = await Review.find({ book: book._id, status: 'approved' });
      book.numReviews = approvedReviews.length;
      book.rating =
        approvedReviews.length > 0
          ? Number(
              (
                approvedReviews.reduce((sum, r) => sum + r.rating, 0) /
                approvedReviews.length
              ).toFixed(1)
            )
          : 0;
      await book.save();
    }

    await logAdminActivity({
      req,
      action: 'UPDATE_REVIEW_STATUS',
      module: 'reviews',
      details: `Changed review #${review._id} status from ${previousStatus} to ${status}`,
      targetId: review._id.toString(),
      previousValue: { status: previousStatus },
      updatedValue: { status },
    });

    res.json({
      success: true,
      data: review,
      message: `Review marked as ${status}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Review (Admin)
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
const deleteReviewAdmin = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Review ID' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const bookId = review.book;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate book rating
    const book = await Book.findById(bookId);
    if (book) {
      const remainingApproved = await Review.find({ book: book._id, status: 'approved' });
      book.numReviews = remainingApproved.length;
      book.rating =
        remainingApproved.length > 0
          ? Number(
              (
                remainingApproved.reduce((sum, r) => sum + r.rating, 0) /
                remainingApproved.length
              ).toFixed(1)
            )
          : 0;
      await book.save();
    }

    await logAdminActivity({
      req,
      action: 'DELETE_REVIEW',
      module: 'reviews',
      details: `Deleted review from "${review.name}" on book #${bookId}`,
      targetId: review._id.toString(),
      previousValue: review.toObject(),
    });

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllReviewsAdmin,
  updateReviewStatus,
  deleteReviewAdmin,
};

