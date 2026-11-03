const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ROLE_PERMISSIONS = {
  superadmin: ['all'],
  admin: [
    'books',
    'orders',
    'users',
    'inventory',
    'payments',
    'categories',
    'coupons',
    'reviews',
    'content',
    'settings',
    'logs',
    'analytics',
  ],
  order_manager: ['orders', 'payments'],
  inventory_manager: ['books', 'categories', 'inventory'],
  support: ['users', 'orders', 'reviews'],
};

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123456');

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found with this token' });
      }

      if (!req.user.isActive) {
        return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
      }

      next();
    } catch (error) {
      console.error('Auth verification error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// General Admin access (any administrative role)
const admin = (req, res, next) => {
  const adminRoles = ['superadmin', 'admin', 'order_manager', 'inventory_manager', 'support'];
  if (req.user && adminRoles.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Administrative privileges required' });
  }
};

// Super Admin Only
const superAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Requires Super Admin privileges',
    });
  }
};

// Granular RBAC Permission checker
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userRole = req.user.role;
    const permissions = ROLE_PERMISSIONS[userRole] || [];

    if (permissions.includes('all') || permissions.includes(permission)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: `Access denied: Role "${userRole}" lacks permission for "${permission}" module`,
      });
    }
  };
};

module.exports = {
  protect,
  admin,
  superAdmin,
  requirePermission,
  ROLE_PERMISSIONS,
};
