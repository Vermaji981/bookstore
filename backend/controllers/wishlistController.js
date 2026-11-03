const User = require('../models/User');
const Book = require('../models/Book');

// @desc    Get logged in user's wishlist from MongoDB
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({
      success: true,
      data: user.wishlist || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle add/remove book in wishlist
// @route   POST /api/wishlist/toggle
// @access  Private
const toggleWishlist = async (req, res) => {
  try {
    const { bookId } = req.body;
    if (!bookId) {
      return res.status(400).json({ success: false, message: 'Please provide bookId' });
    }

    const user = await User.findById(req.user._id);
    const index = user.wishlist.findIndex((id) => id.toString() === bookId);

    let isAdded = false;
    if (index > -1) {
      user.wishlist.splice(index, 1);
      isAdded = false;
    } else {
      user.wishlist.push(bookId);
      isAdded = true;
    }

    await user.save();
    const updatedUser = await User.findById(req.user._id).populate('wishlist');

    res.json({
      success: true,
      isAdded,
      message: isAdded ? 'Book added to your saved wishlist' : 'Book removed from wishlist',
      data: updatedUser.wishlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Subscribe to Price Drop alerts for a book
// @route   POST /api/wishlist/price-alert
// @access  Private
const subscribePriceAlert = async (req, res) => {
  try {
    const { bookId, targetPrice } = req.body;
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const existingAlertIndex = book.priceAlerts.findIndex(
      (pa) => pa.user.toString() === req.user._id.toString()
    );

    const priceTarget = Number(targetPrice) || book.price * 0.9; // default 10% drop target

    if (existingAlertIndex > -1) {
      book.priceAlerts[existingAlertIndex].targetPrice = priceTarget;
    } else {
      book.priceAlerts.push({
        user: req.user._id,
        email: req.user.email,
        targetPrice: priceTarget,
      });
    }

    await book.save();

    res.json({
      success: true,
      message: `Price drop alert activated! We will notify ${req.user.email} when "${book.title}" drops to $${priceTarget.toFixed(2)} or lower.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Track recently viewed book
// @route   POST /api/wishlist/recently-viewed
// @access  Private
const trackRecentlyViewed = async (req, res) => {
  try {
    const { bookId } = req.body;
    if (!bookId) return res.status(400).json({ success: false });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false });

    // Remove if already exists so we can unshift to front
    user.recentlyViewed = user.recentlyViewed.filter(
      (rv) => rv.book.toString() !== bookId
    );

    user.recentlyViewed.unshift({ book: bookId, viewedAt: new Date() });

    // Keep only last 15
    if (user.recentlyViewed.length > 15) {
      user.recentlyViewed = user.recentlyViewed.slice(0, 15);
    }

    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recently viewed books
// @route   GET /api/wishlist/recently-viewed
// @access  Private
const getRecentlyViewed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('recentlyViewed.book');
    const validBooks = (user.recentlyViewed || [])
      .map((item) => item.book)
      .filter((b) => b !== null);

    res.json({
      success: true,
      data: validBooks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
  subscribePriceAlert,
  trackRecentlyViewed,
  getRecentlyViewed,
};

