const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const Book = require('../models/Book');
const { logAdminActivity } = require('../utils/logger');

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'All') {
      query.role = role;
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user by ID (Admin)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
    const paidOrders = orders.filter((o) => o.isPaid);
    const totalSpent = paidOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    res.json({
      success: true,
      data: {
        user,
        orders,
        metrics: {
          totalOrders: orders.length,
          paidOrdersCount: paidOrders.length,
          totalSpent: Number(totalSpent.toFixed(2)),
          lastOrderDate: orders.length > 0 ? orders[0].createdAt : null,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role (Super Admin Only)
// @route   PUT /api/users/:id/role
// @access  Private/SuperAdmin
const updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Security policy: Only the Super Admin can change account roles and permissions',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    const { role } = req.body;
    const allowedRoles = ['user', 'admin', 'superadmin', 'order_manager', 'inventory_manager', 'support'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles: ${allowedRoles.join(', ')}`,
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent removing superadmin rights from self if it's the only one
    if (user._id.toString() === req.user._id.toString() && role !== 'superadmin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot demote your own Super Admin account',
      });
    }

    const previousRole = user.role;
    user.role = role;
    await user.save();

    await logAdminActivity({
      req,
      action: 'CHANGE_USER_ROLE',
      module: 'users',
      details: `Changed role for user "${user.name}" (${user.email}) from "${previousRole}" to "${role}"`,
      targetId: user._id.toString(),
      previousValue: { role: previousRole },
      updatedValue: { role },
    });

    res.json({
      success: true,
      data: user,
      message: `User role updated to ${user.role}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user status (Active / Inactive) (Admin)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account',
      });
    }

    const previousStatus = user.isActive;
    user.isActive = !user.isActive;
    await user.save();

    await logAdminActivity({
      req,
      action: 'TOGGLE_USER_STATUS',
      module: 'users',
      details: `Account for "${user.name}" (${user.email}) ${user.isActive ? 'activated' : 'deactivated'}`,
      targetId: user._id.toString(),
      previousValue: { isActive: previousStatus },
      updatedValue: { isActive: user.isActive },
    });

    res.json({
      success: true,
      data: user,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get admin statistics and reports
// @route   GET /api/users/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Financial calculations
    const paidOrders = await Order.find({ isPaid: true });
    const totalRevenue = paidOrders.reduce((acc, order) => acc + order.totalPrice, 0);

    const pendingOrders = await Order.countDocuments({
      orderStatus: { $in: ['Pending', 'Confirmed', 'Processing'] },
    });

    const completedOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

    // Best-selling books
    const bestSellers = await Book.find().sort({ numReviews: -1, rating: -1 }).limit(5);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    // Monthly sales aggregation for chart
    const monthlySales = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedSales = months.map((month, idx) => {
      const match = monthlySales.find((m) => m._id === idx + 1);
      return {
        month,
        revenue: match ? Number(match.total.toFixed(2)) : 0,
        orders: match ? match.count : 0,
      };
    });

    res.json({
      success: true,
      data: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders,
        totalBooks,
        totalUsers,
        pendingOrders,
        completedOrders,
        bestSellers,
        recentOrders,
        monthlySales: formattedSales,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
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

// @desc    Add book to wishlist
// @route   POST /api/users/wishlist/:bookId
// @access  Private
const addToWishlist = async (req, res) => {
  try {
    const bookId = req.params.bookId;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ success: false, message: 'Invalid Book ID format' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const isAlreadyWishlisted = user.wishlist.some(
      (id) => id.toString() === bookId.toString()
    );

    if (!isAlreadyWishlisted) {
      user.wishlist.push(bookId);
      await user.save();
    }

    const populatedUser = await User.findById(req.user._id).populate('wishlist');

    res.json({
      success: true,
      data: populatedUser.wishlist || [],
      message: 'Book added to wishlist',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove book from wishlist
// @route   DELETE /api/users/wishlist/:bookId
// @access  Private
const removeFromWishlist = async (req, res) => {
  try {
    const bookId = req.params.bookId;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ success: false, message: 'Invalid Book ID format' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.wishlist = (user.wishlist || []).filter(
      (id) => id.toString() !== bookId.toString()
    );
    await user.save();

    const populatedUser = await User.findById(req.user._id).populate('wishlist');

    res.json({
      success: true,
      data: populatedUser.wishlist || [],
      message: 'Book removed from wishlist',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  getAdminStats,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
