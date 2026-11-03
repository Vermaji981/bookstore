const mongoose = require('mongoose');
const Book = require('../models/Book');
const Review = require('../models/Review');
const Category = require('../models/Category');
const Order = require('../models/Order');
const { logAdminActivity } = require('../utils/logger');
const { createNotification } = require('../utils/notifier');

// @desc    Get all books with search, filter, sort, pagination
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      rating,
      sort,
      page = 1,
      limit = 12,
      featured,
      bestseller,
      newarrival,
    } = req.query;

    const query = {};

    // Keyword search across title, author, description, category
    if (keyword && keyword.trim() !== '') {
      const regex = new RegExp(keyword.trim(), 'i');
      query.$or = [
        { title: regex },
        { author: regex },
        { category: regex },
        { description: regex },
      ];
    }

    // Category filter
    if (category && category !== 'All' && category !== '') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Flags
    if (featured === 'true') query.isFeatured = true;
    if (bestseller === 'true') query.isBestSeller = true;
    if (newarrival === 'true') query.isNewArrival = true;

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    else if (sort === 'price_desc') sortOptions = { price: -1 };
    else if (sort === 'rating_desc') sortOptions = { rating: -1 };
    else if (sort === 'newest') sortOptions = { createdAt: -1 };
    else if (sort === 'title_asc') sortOptions = { title: 1 };
    else if (sort === 'popular') sortOptions = { numReviews: -1, rating: -1 };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: books,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Book ID format' });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const reviews = await Review.find({ book: book._id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        ...book.toObject(),
        reviews,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get featured books
// @route   GET /api/books/featured
// @access  Public
const getFeaturedBooks = async (req, res) => {
  try {
    const books = await Book.find({ isFeatured: true }).limit(8);
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get best sellers
// @route   GET /api/books/bestsellers
// @access  Public
const getBestSellers = async (req, res) => {
  try {
    const books = await Book.find({ isBestSeller: true }).limit(8);
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get new arrivals
// @route   GET /api/books/new-arrivals
// @access  Public
const getNewArrivals = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 }).limit(8);
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all categories with count
// @route   GET /api/books/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categoriesFromDb = await Category.find();
    const bookCategoryCounts = await Book.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    bookCategoryCounts.forEach((c) => {
      if (c._id) countMap[c._id.toLowerCase()] = c.count;
    });

    const enriched = categoriesFromDb.map((cat) => ({
      ...cat.toObject(),
      count: countMap[cat.name.toLowerCase()] || 0,
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create category (Admin)
// @route   POST /api/books/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, description, icon, image } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || '',
      icon: icon || 'BookOpen',
      image: image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
      isActive: true,
    });

    await logAdminActivity({
      req,
      action: 'CREATE_CATEGORY',
      module: 'categories',
      details: `Created new category "${category.name}"`,
      targetId: category._id.toString(),
      updatedValue: category.toObject(),
    });

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update category (Admin)
// @route   PUT /api/books/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Category ID' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const previousValue = category.toObject();

    if (req.body.name) category.name = req.body.name.trim();
    if (req.body.description !== undefined) category.description = req.body.description;
    if (req.body.icon) category.icon = req.body.icon;
    if (req.body.image) category.image = req.body.image;
    if (req.body.isActive !== undefined) category.isActive = Boolean(req.body.isActive);

    const updated = await category.save();

    await logAdminActivity({
      req,
      action: 'UPDATE_CATEGORY',
      module: 'categories',
      details: `Updated category "${updated.name}"`,
      targetId: updated._id.toString(),
      previousValue,
      updatedValue: updated.toObject(),
    });

    res.json({
      success: true,
      data: updated,
      message: 'Category updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete category (Admin)
// @route   DELETE /api/books/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Category ID' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const bookCount = await Book.countDocuments({
      category: { $regex: new RegExp(`^${category.name}$`, 'i') },
    });

    if (bookCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete "${category.name}". There are ${bookCount} books currently assigned to this category. Please reassign them first.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    await logAdminActivity({
      req,
      action: 'DELETE_CATEGORY',
      module: 'categories',
      details: `Deleted category "${category.name}"`,
      targetId: category._id.toString(),
      previousValue: category.toObject(),
    });

    res.json({ success: true, message: `Category "${category.name}" removed successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new book (Admin only)
// @route   POST /api/books
// @access  Private/Admin
const createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      description,
      image,
      category,
      originalPrice,
      price,
      stock,
      isbn,
      publisher,
      publicationDate,
      language,
      pageCount,
      isFeatured,
      isBestSeller,
      isNewArrival,
    } = req.body;

    if (!title || !author || !description || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, author, description, category, price)',
      });
    }

    const book = await Book.create({
      title,
      author,
      description,
      image: image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
      category,
      originalPrice: originalPrice || price,
      price: Number(price),
      stock: stock !== undefined ? Number(stock) : 10,
      isbn: isbn || '978-' + Math.floor(1000000000 + Math.random() * 9000000000),
      publisher: publisher || 'HarperCollins',
      publicationDate: publicationDate || new Date().getFullYear().toString(),
      language: language || 'English',
      pageCount: pageCount || 300,
      isFeatured: Boolean(isFeatured),
      isBestSeller: Boolean(isBestSeller),
      isNewArrival: Boolean(isNewArrival),
    });

    // Ensure category exists
    await Category.findOneAndUpdate(
      { name: category },
      { name: category },
      { upsert: true, new: true }
    );

    await logAdminActivity({
      req,
      action: 'CREATE_BOOK',
      module: 'books',
      details: `Added new book "${book.title}" by ${book.author} ($${book.price})`,
      targetId: book._id.toString(),
      updatedValue: book.toObject(),
    });

    res.status(201).json({
      success: true,
      data: book,
      message: 'Book created successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update book (Admin only)
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Book ID format' });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const previousBook = book.toObject();

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    await logAdminActivity({
      req,
      action: 'UPDATE_BOOK',
      module: 'books',
      details: `Updated details for book "${updatedBook.title}"`,
      targetId: updatedBook._id.toString(),
      previousValue: previousBook,
      updatedValue: updatedBook.toObject(),
    });

    if (updatedBook.stock === 0) {
      await createNotification({
        title: 'Book Out of Stock Alert',
        message: `"${updatedBook.title}" stock reached 0. Please restock soon.`,
        type: 'inventory',
        link: '/admin?tab=inventory',
      });
    }

    res.json({
      success: true,
      data: updatedBook,
      message: 'Book updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete book (Admin only)
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Book ID format' });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const previousBook = book.toObject();

    await Book.findByIdAndDelete(req.params.id);
    await Review.deleteMany({ book: req.params.id });

    await logAdminActivity({
      req,
      action: 'DELETE_BOOK',
      module: 'books',
      details: `Removed book "${book.title}" by ${book.author} from catalog`,
      targetId: book._id.toString(),
      previousValue: previousBook,
    });

    res.json({
      success: true,
      message: 'Book removed successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new review for book
// @route   POST /api/books/:id/reviews
// @access  Private
const createBookReview = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Book ID format' });
    }

    const { rating, comment } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const alreadyReviewed = await Review.findOne({
      book: req.params.id,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this book',
      });
    }

    // Check verified purchase
    const verifiedOrder = await Order.findOne({
      user: req.user._id,
      'orderItems.book': req.params.id,
      orderStatus: { $ne: 'Cancelled' },
    });

    const review = await Review.create({
      book: req.params.id,
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
      isVerifiedPurchase: !!verifiedOrder,
    });

    // Update book aggregate rating
    const reviews = await Review.find({ book: req.params.id });
    book.numReviews = reviews.length;
    book.rating =
      reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await book.save();

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review added successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBooks,
  getBookById,
  getFeaturedBooks,
  getBestSellers,
  getNewArrivals,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createBook,
  updateBook,
  deleteBook,
  createBookReview,
};
