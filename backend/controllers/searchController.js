const Book = require('../models/Book');

// @desc    Autocomplete search suggestions (titles, authors, categories, ISBNs)
// @route   GET /api/books/search/suggestions
// @access  Public
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ success: true, suggestions: [], popular: ['Fiction', 'Psychology', 'Self-Help', 'Sci-Fi'] });
    }

    const query = q.trim();
    const regex = new RegExp(query, 'i');

    const matchingBooks = await Book.find({
      $or: [{ title: regex }, { author: regex }, { isbn: regex }, { category: regex }],
    })
      .select('title author image price category isbn rating stock')
      .limit(6);

    // Extract unique categories matching query
    const matchingCategories = await Book.distinct('category', { category: regex });

    res.json({
      success: true,
      data: {
        books: matchingBooks,
        categories: matchingCategories.slice(0, 3),
        totalMatches: matchingBooks.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search book by ISBN (or barcode scan)
// @route   GET /api/books/search/isbn/:isbn
// @access  Public
const searchByIsbn = async (req, res) => {
  try {
    const rawIsbn = req.params.isbn.replace(/[^0-9X]/gi, '');
    const book = await Book.findOne({
      $or: [
        { isbn: req.params.isbn },
        { isbn: new RegExp(rawIsbn, 'i') },
      ],
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `No book found matching ISBN "${req.params.isbn}"`,
      });
    }

    res.json({
      success: true,
      data: book,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get popular and trending search terms
// @route   GET /api/books/search/popular
// @access  Public
const getPopularSearches = async (req, res) => {
  try {
    const topCategories = await Book.distinct('category');
    const featuredAuthors = await Book.distinct('author');

    res.json({
      success: true,
      data: {
        popularCategories: topCategories.slice(0, 8),
        popularAuthors: featuredAuthors.slice(0, 6),
        trendingTerms: ['Bestsellers', 'New Releases', 'Classic Fiction', 'Personal Finance', 'Sci-Fi', 'Biographies'],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSearchSuggestions,
  searchByIsbn,
  getPopularSearches,
};

