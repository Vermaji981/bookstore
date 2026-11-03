const express = require('express');
const router = express.Router();
const {
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
  getNewsletterSubscribers,
  getAdminTeam,
  createAdminUser,
} = require('../controllers/adminController');
const {
  protect,
  admin,
  superAdmin,
  requirePermission,
} = require('../middleware/authMiddleware');

// Dashboard Overview (requires general admin access)
router.get('/overview', protect, admin, getSuperAdminOverview);

// Sales & Revenue Analytics
router.get('/analytics', protect, admin, requirePermission('analytics'), getDetailedAnalytics);

// Inventory Control
router.get('/inventory', protect, admin, requirePermission('inventory'), getInventory);
router.post('/inventory/adjust', protect, admin, requirePermission('inventory'), adjustStock);

// Audit Activity Logs
router.get('/activity-logs', protect, admin, requirePermission('logs'), getActivityLogs);

// Admin Notifications
router.get('/notifications', protect, admin, getNotifications);
router.put('/notifications/:id/read', protect, admin, markNotificationRead);
router.put('/notifications/mark-all-read', protect, admin, markAllNotificationsRead);
router.delete('/notifications/clear-read', protect, admin, clearReadNotifications);

// Website Settings & Content
router.get('/settings', getSiteSettings);
router.put('/settings', protect, admin, requirePermission('settings'), updateSiteSettings);
router.get('/subscribers', protect, admin, requirePermission('content'), getNewsletterSubscribers);

// Roles & Team Management (Super Admin Only)
router.get('/team', protect, admin, getAdminTeam);
router.post('/team', protect, superAdmin, createAdminUser);

module.exports = router;

