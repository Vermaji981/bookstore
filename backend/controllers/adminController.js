const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const SiteSettings = require('../models/SiteSettings');
const InventoryLog = require('../models/InventoryLog');
const { logAdminActivity } = require('../utils/logger');
const { createNotification } = require('../utils/notifier');

// @desc    Get Comprehensive Super Admin Dashboard Overview
// @route   GET /api/admin/overview
// @access  Private/Admin
const getSuperAdminOverview = async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    const lowStockThreshold = settings.lowStockThreshold || 5;

    // Parallel counts & metrics from real database
    const [
      totalUsers,
      totalCustomers,
      totalBooks,
      totalOrders,
      paidOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      returnedOrders,
      lowStockBooks,
      outOfStockBooks,
      unreadNotifications,
      recentOrders,
      recentActivities,
      topBooks,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Book.countDocuments(),
      Order.countDocuments(),
      Order.find({ isPaid: true }).select('totalPrice orderItems createdAt'),
      Order.countDocuments({
        orderStatus: { $in: ['Pending', 'Confirmed', 'Processing'] },
      }),
      Order.countDocuments({ orderStatus: 'Delivered' }),
      Order.countDocuments({ orderStatus: 'Cancelled' }),
      Order.countDocuments({ orderStatus: 'Returned' }),
      Book.countDocuments({ stock: { $gt: 0, $lte: lowStockThreshold } }),
      Book.countDocuments({ stock: 0 }),
      Notification.countDocuments({ isRead: false }),
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(6),
      ActivityLog.find().sort({ createdAt: -1 }).limit(6),
      Book.find().sort({ numReviews: -1, rating: -1 }).limit(5),
    ]);

    // Financial calculations
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const totalProductsSold = paidOrders.reduce((sum, o) => {
      return (
        sum +
        (o.orderItems || []).reduce((itemSum, item) => itemSum + (item.qty || 1), 0)
      );
    }, 0);

    const averageOrderValue =
      paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

    // Monthly revenue aggregation (last 6 months)
    const monthlySales = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthlySales = months.map((month, idx) => {
      const match = monthlySales.find((m) => m._id.month === idx + 1);
      return {
        month,
        revenue: match ? Number(match.revenue.toFixed(2)) : 0,
        orders: match ? match.orders : 0,
      };
    });

    // Category distribution
    const categoryCounts = await Book.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalRevenue: Number(totalRevenue.toFixed(2)),
          totalOrders,
          totalBooks,
          totalUsers,
          totalCustomers,
          pendingOrders,
          deliveredOrders,
          cancelledOrders,
          returnedOrders,
          totalProductsSold,
          lowStockBooks,
          outOfStockBooks,
          averageOrderValue: Number(averageOrderValue.toFixed(2)),
          unreadNotifications,
        },
        monthlySales: formattedMonthlySales,
        categoryCounts,
        topBooks,
        recentOrders,
        recentActivities,
      },
    });
  } catch (error) {
    console.error('Super Admin Overview Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Detailed Sales & Revenue Analytics with Date Filters
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getDetailedAnalytics = async (req, res) => {
  try {
    const { range = '30days', startDate, endDate } = req.query;

    let dateFilter = {};
    const now = new Date();

    if (range === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { createdAt: { $gte: startOfDay } };
    } else if (range === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: sevenDaysAgo } };
    } else if (range === '30days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: thirtyDaysAgo } };
    } else if (range === '12months') {
      const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      dateFilter = { createdAt: { $gte: twelveMonthsAgo } };
    } else if (range === 'custom' && startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
        },
      };
    }

    // Match criteria for paid orders in range
    const paidMatch = { isPaid: true, ...dateFilter };

    const [
      filteredOrders,
      categorySales,
      topCustomersData,
      statusBreakdown,
    ] = await Promise.all([
      Order.find(paidMatch).sort({ createdAt: 1 }),
      Order.aggregate([
        { $match: paidMatch },
        { $unwind: '$orderItems' },
        {
          $lookup: {
            from: 'books',
            localField: 'orderItems.book',
            foreignField: '_id',
            as: 'bookDetails',
          },
        },
        { $unwind: { path: '$bookDetails', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: { $ifNull: ['$bookDetails.category', 'Uncategorized'] },
            revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } },
            itemsSold: { $sum: '$orderItems.qty' },
          },
        },
        { $sort: { revenue: -1 } },
      ]),
      Order.aggregate([
        { $match: paidMatch },
        {
          $group: {
            _id: '$user',
            totalSpent: { $sum: '$totalPrice' },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            totalSpent: 1,
            orderCount: 1,
            name: { $ifNull: ['$user.name', 'Guest / Removed'] },
            email: { $ifNull: ['$user.email', 'N/A'] },
          },
        },
      ]),
      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$orderStatus',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalRevenue = filteredOrders.reduce((acc, o) => acc + o.totalPrice, 0);
    const totalSales = filteredOrders.length;
    const aov = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Daily breakdown for line/bar chart
    const dailyMap = {};
    filteredOrders.forEach((o) => {
      const dateKey = new Date(o.createdAt).toISOString().split('T')[0];
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { date: dateKey, revenue: 0, orders: 0 };
      }
      dailyMap[dateKey].revenue += o.totalPrice;
      dailyMap[dateKey].orders += 1;
    });

    const dailyTrend = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    // Best-selling books in range
    const bookSoldMap = {};
    filteredOrders.forEach((o) => {
      (o.orderItems || []).forEach((item) => {
        const id = item.book?.toString() || item.title;
        if (!bookSoldMap[id]) {
          bookSoldMap[id] = {
            id,
            title: item.title,
            image: item.image,
            qty: 0,
            revenue: 0,
          };
        }
        bookSoldMap[id].qty += item.qty || 1;
        bookSoldMap[id].revenue += (item.price || 0) * (item.qty || 1);
      });
    });

    const bestSellingBooks = Object.values(bookSoldMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue: Number(totalRevenue.toFixed(2)),
          totalSales,
          aov: Number(aov.toFixed(2)),
        },
        dailyTrend,
        categorySales: categorySales.map((c) => ({
          category: c._id,
          revenue: Number(c.revenue.toFixed(2)),
          itemsSold: c.itemsSold,
        })),
        topCustomers: topCustomersData.map((cust) => ({
          ...cust,
          totalSpent: Number(cust.totalSpent.toFixed(2)),
        })),
        bestSellingBooks: bestSellingBooks.map((b) => ({
          ...b,
          revenue: Number(b.revenue.toFixed(2)),
        })),
        statusBreakdown,
      },
    });
  } catch (error) {
    console.error('Detailed Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Inventory Status, Low Stock & Out of Stock Alerts
// @route   GET /api/admin/inventory
// @access  Private/Admin
const getInventory = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const settings = await SiteSettings.getSettings();
    const threshold = settings.lowStockThreshold || 5;

    const query = {};

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { author: { $regex: search.trim(), $options: 'i' } },
        { isbn: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (status === 'out_of_stock') {
      query.stock = 0;
    } else if (status === 'low_stock') {
      query.stock = { $gt: 0, $lte: threshold };
    } else if (status === 'in_stock') {
      query.stock = { $gt: threshold };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [totalBooks, books, totalStockAgg, recentLogs] = await Promise.all([
      Book.countDocuments(query),
      Book.find(query).sort({ stock: 1 }).skip(skip).limit(limitNum),
      Book.aggregate([
        {
          $group: {
            _id: null,
            totalStock: { $sum: '$stock' },
            outOfStock: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } },
            lowStock: {
              $sum: {
                $cond: [
                  { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', threshold] }] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      InventoryLog.find().sort({ createdAt: -1 }).limit(15),
    ]);

    const aggregateInfo = totalStockAgg[0] || {
      totalStock: 0,
      outOfStock: 0,
      lowStock: 0,
    };

    res.json({
      success: true,
      data: {
        summary: {
          totalStock: aggregateInfo.totalStock,
          outOfStock: aggregateInfo.outOfStock,
          lowStock: aggregateInfo.lowStock,
          threshold,
        },
        books,
        pagination: {
          total: totalBooks,
          page: pageNum,
          pages: Math.ceil(totalBooks / limitNum),
          limit: limitNum,
        },
        recentLogs,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Adjust Book Inventory Stock with Reason & Audit Log
// @route   POST /api/admin/inventory/adjust
// @access  Private/Admin
const adjustStock = async (req, res) => {
  try {
    const { bookId, reason, note } = req.body;
    const adjustmentAmount = req.body.adjustmentAmount !== undefined ? req.body.adjustmentAmount : req.body.changeAmount;

    if (!bookId || adjustmentAmount === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide bookId and adjustmentAmount' });
    }

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ success: false, message: 'Invalid Book ID' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const previousStock = book.stock;
    const change = Number(adjustmentAmount);
    const newStock = Math.max(0, previousStock + change);

    book.stock = newStock;
    await book.save();

    // Log to Inventory History
    const invLog = await InventoryLog.create({
      book: book._id,
      bookTitle: book.title,
      previousStock,
      adjustedStock: newStock,
      changeAmount: change,
      reason: reason || 'MANUAL_ADJUSTMENT',
      admin: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
      note: note || '',
    });

    // Record in Audit Activity Log
    await logAdminActivity({
      req,
      action: 'STOCK_ADJUSTMENT',
      module: 'inventory',
      details: `Stock for "${book.title}" adjusted by ${change > 0 ? '+' : ''}${change} (From ${previousStock} to ${newStock}). Reason: ${reason || 'Manual'}`,
      targetId: book._id.toString(),
      previousValue: { stock: previousStock },
      updatedValue: { stock: newStock },
    });

    // Notify if out of stock
    if (newStock === 0) {
      await createNotification({
        title: 'Book Out of Stock Alert',
        message: `"${book.title}" is now out of stock after manual adjustment.`,
        type: 'inventory',
        link: '/admin?tab=inventory',
      });
    }

    res.json({
      success: true,
      data: {
        book,
        log: invLog,
      },
      message: `Stock updated successfully from ${previousStock} to ${newStock}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Admin Audit Activity Logs
// @route   GET /api/admin/activity-logs
// @access  Private/Admin
const getActivityLogs = async (req, res) => {
  try {
    const { module, search, page = 1, limit = 25 } = req.query;
    const query = {};

    if (module && module !== 'All') {
      query.module = module;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { details: { $regex: search.trim(), $options: 'i' } },
        { action: { $regex: search.trim(), $options: 'i' } },
        { 'admin.name': { $regex: search.trim(), $options: 'i' } },
        { 'admin.email': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [total, logs] = await Promise.all([
      ActivityLog.countDocuments(query),
      ActivityLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    ]);

    res.json({
      success: true,
      data: logs,
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

// @desc    Get Admin Notifications
// @route   GET /api/admin/notifications
// @access  Private/Admin
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark Notification as Read
// @route   PUT /api/admin/notifications/:id/read
// @access  Private/Admin
const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark All Notifications as Read
// @route   PUT /api/admin/notifications/mark-all-read
// @access  Private/Admin
const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true, readAt: new Date() });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear / Delete All Read Notifications
// @route   DELETE /api/admin/notifications/clear-read
// @access  Private/Admin
const clearReadNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ isRead: true });
    res.json({ success: true, message: 'Read notifications cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Website Settings & Content (Public & Admin)
// @route   GET /api/admin/settings
// @access  Public (basic) / Private/Admin (full)
const getSiteSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Website Settings & Content
// @route   PUT /api/admin/settings
// @access  Private/SuperAdmin & Admin with permission
const updateSiteSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();

    // Assign incoming updates
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        settings[key] = req.body[key];
      }
    });

    const updated = await settings.save();

    await logAdminActivity({
      req,
      action: 'UPDATE_SETTINGS',
      module: 'settings',
      details: 'Website settings & content configuration updated by administrator',
      updatedValue: req.body,
    });

    res.json({
      success: true,
      data: updated,
      message: 'Website settings updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Subscribe to Newsletter (Public)
// @route   POST /api/settings/newsletter
// @access  Public
const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const settings = await SiteSettings.getSettings();
    const alreadySubscribed = settings.newsletterSubscribers.some(
      (sub) => sub.email.toLowerCase() === email.toLowerCase()
    );

    if (alreadySubscribed) {
      return res.json({ success: true, message: 'You are already subscribed to our newsletter!' });
    }

    settings.newsletterSubscribers.push({ email: email.toLowerCase() });
    await settings.save();

    await createNotification({
      title: 'New Newsletter Subscriber',
      message: `"${email}" joined the PageHaven newsletter mailing list.`,
      type: 'user',
      link: '/admin?tab=content',
    });

    res.json({ success: true, message: 'Thank you for subscribing to our newsletter!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Newsletter Subscribers
// @route   GET /api/admin/subscribers
// @access  Private/Admin
const getNewsletterSubscribers = async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    res.json({
      success: true,
      data: settings.newsletterSubscribers || [],
      count: (settings.newsletterSubscribers || []).length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Administrative Team Members
// @route   GET /api/admin/team
// @access  Private/Admin
const getAdminTeam = async (req, res) => {
  try {
    const adminRoles = ['superadmin', 'admin', 'order_manager', 'inventory_manager', 'support'];
    const team = await User.find({ role: { $in: adminRoles } })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create New Admin Team Member (Super Admin Only)
// @route   POST /api/admin/team
// @access  Private/SuperAdmin
const createAdminUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and administrative role are required',
      });
    }

    const validRoles = ['admin', 'order_manager', 'inventory_manager', 'support'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles: ${validRoles.join(', ')}`,
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    const newAdmin = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role,
      isActive: true,
    });

    await logAdminActivity({
      req,
      action: 'CREATE_ADMIN_USER',
      module: 'users',
      details: `Created new admin staff member: "${name}" (${email}) with role: ${role}`,
      targetId: newAdmin._id.toString(),
      updatedValue: { role, email },
    });

    res.status(201).json({
      success: true,
      data: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        isActive: newAdmin.isActive,
      },
      message: `Admin user created successfully with role: ${role}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSuperAdminOverview,
  getDetailedAnalytics,
  getInventory,
  adjustStock,
  getActivityLogs,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearReadNotifications,
  getSiteSettings,
  updateSiteSettings,
  subscribeNewsletter,
  getNewsletterSubscribers,
  getAdminTeam,
  createAdminUser,
};
