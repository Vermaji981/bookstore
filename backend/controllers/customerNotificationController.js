const CustomerNotification = require('../models/CustomerNotification');
const User = require('../models/User');

// @desc    Get customer's in-app notifications
// @route   GET /api/notifications/customer
// @access  Private
const getCustomerNotifications = async (req, res) => {
  try {
    const notifications = await CustomerNotification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await CustomerNotification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/customer/:id/read
// @access  Private
const markCustomerNotificationRead = async (req, res) => {
  try {
    if (req.params.id === 'all') {
      await CustomerNotification.updateMany(
        { user: req.user._id, isRead: false },
        { isRead: true }
      );
      return res.json({ success: true, message: 'All notifications marked as read' });
    }

    const notif = await CustomerNotification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notif.isRead = true;
    await notif.save();

    res.json({ success: true, data: notif });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update customer notification preferences
// @route   PUT /api/notifications/customer/preferences
// @access  Private
const updateNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false });

    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...req.body,
    };

    await user.save();

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: user.notificationPreferences,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCustomerNotifications,
  markCustomerNotificationRead,
  updateNotificationPreferences,
};

