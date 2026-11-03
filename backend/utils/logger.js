const ActivityLog = require('../models/ActivityLog');

const logAdminActivity = async ({
  req,
  admin,
  action,
  module,
  details,
  targetId = '',
  previousValue = null,
  updatedValue = null,
}) => {
  try {
    const adminData = admin || (req && req.user ? {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    } : {
      name: 'System',
      email: 'system@bookstore.com',
      role: 'system',
    });

    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '') : '';
    const userAgent = req ? (req.headers['user-agent'] || '') : '';

    await ActivityLog.create({
      admin: adminData,
      action,
      module,
      details,
      targetId,
      previousValue,
      updatedValue,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error('Failed to record activity log:', error.message);
  }
};

module.exports = { logAdminActivity };

