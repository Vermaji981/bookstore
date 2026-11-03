const Book = require('../models/Book');
const Order = require('../models/Order');

// @desc    Get smart personalized recommendations
// @route   GET /api/books/recommendations/smart
// @access  Public (Optional auth for personalization)
const getSmartRecommendations = async (req, res) => {
  try {
    const user = req.user;

    // Default trending and best sellers
    const trending = await Book.find({ stock: { $gt: 0 } })
      .sort({ rating: -1, numReviews: -1 })
      .limit(8);

    const bestSellers = await Book.find({ isBestSeller: true, stock: { $gt: 0 } })
      .limit(8);

    let forYou = [];

    if (user && user.recentlyViewed && user.recentlyViewed.length > 0) {
      // Find categories the user has viewed
      const viewedBookIds = user.recentlyViewed.map((item) => item.book);
      const viewedBooks = await Book.find({ _id: { $in: viewedBookIds } });
      const favoriteCategories = [...new Set(viewedBooks.map((b) => b.category))];

      forYou = await Book.find({
        category: { $in: favoriteCategories },
        _id: { $nin: viewedBookIds },
        stock: { $gt: 0 },
      })
        .sort({ rating: -1 })
        .limit(8);
    }

    if (forYou.length === 0) {
      // Fallback for guest or new users: featured books with highest rating
      forYou = await Book.find({ isFeatured: true, stock: { $gt: 0 } })
        .sort({ rating: -1 })
        .limit(8);
    }

    // New Arrivals
    const newArrivals = await Book.find({ isNewArrival: true, stock: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      success: true,
      data: {
        forYou,
        trending,
        bestSellers: bestSellers.length > 0 ? bestSellers : trending.slice(0, 4),
        newArrivals,
      },
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ success: false, message: 'Server error generating recommendations' });
  }
};

// @desc    Get similar books (by category and author)
// @route   GET /api/books/:id/similar
// @access  Public
const getSimilarBooks = async (req, res) => {
  try {
    const { id } = req.params;
    const currentBook = await Book.findById(id);

    if (!currentBook) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // 1. Same author first
    const sameAuthor = await Book.find({
      author: currentBook.author,
      _id: { $ne: currentBook._id },
    }).limit(4);

    // 2. Same category
    const sameCategory = await Book.find({
      category: currentBook.category,
      author: { $ne: currentBook.author },
      _id: { $ne: currentBook._id },
    })
      .sort({ rating: -1 })
      .limit(8 - sameAuthor.length);

    const similar = [...sameAuthor, ...sameCategory];

    res.json({
      success: true,
      data: similar,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get books frequently bought together
// @route   GET /api/books/:id/frequently-bought-together
// @access  Public
const getFrequentlyBoughtTogether = async (req, res) => {
  try {
    const { id } = req.params;
    const currentBook = await Book.findById(id);

    if (!currentBook) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Look for orders containing this book
    const ordersWithBook = await Order.find({
      'orderItems.book': id,
      orderStatus: { $ne: 'Cancelled' },
    }).limit(20);

    const otherBookIds = new Set();
    ordersWithBook.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (item.book.toString() !== id) {
          otherBookIds.add(item.book.toString());
        }
      });
    });

    let bundleBooks = [];
    if (otherBookIds.size > 0) {
      bundleBooks = await Book.find({ _id: { $in: Array.from(otherBookIds) } }).limit(2);
    }

    // If no orders yet, pick 2 high-rated books in same or related category
    if (bundleBooks.length < 2) {
      const complement = await Book.find({
        _id: { $ne: id, $nin: bundleBooks.map((b) => b._id) },
        category: currentBook.category,
        stock: { $gt: 0 },
      })
        .sort({ rating: -1 })
        .limit(2 - bundleBooks.length);
      bundleBooks = [...bundleBooks, ...complement];
    }

    // Calculate bundle pricing
    const allBundle = [currentBook, ...bundleBooks];
    const totalOriginal = allBundle.reduce((acc, b) => acc + (b.originalPrice || b.price), 0);
    const regularTotal = allBundle.reduce((acc, b) => acc + b.price, 0);
    const bundleDiscount = 0.1; // 10% extra bundle discount
    const bundlePrice = Number((regularTotal * (1 - bundleDiscount)).toFixed(2));
    const bundleSavings = Number((totalOriginal - bundlePrice).toFixed(2));

    res.json({
      success: true,
      data: {
        mainBook: currentBook,
        bundleItems: bundleBooks,
        pricing: {
          regularTotal,
          bundlePrice,
          bundleSavings,
          discountPercent: 10,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Compare multiple books side-by-side
// @route   GET /api/books/compare
// @access  Public
const compareBooks = async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({ success: false, message: 'Please provide book IDs to compare' });
    }

    const idList = ids.split(',').slice(0, 4); // Max 4 books
    const books = await Book.find({ _id: { $in: idList } });

    res.json({
      success: true,
      data: books,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSmartRecommendations,
  getSimilarBooks,
  getFrequentlyBoughtTogether,
  compareBooks,
};

