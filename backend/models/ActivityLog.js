const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    admin: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, required: true },
      email: { type: String, required: true },
      role: { type: String, required: true },
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    module: {
      type: String,
      enum: [
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
        'auth',
      ],
      required: true,
      index: true,
    },
    details: {
      type: String,
      required: true,
    },
    targetId: {
      type: String,
      default: '',
    },
    previousValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    updatedValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
module.exports = ActivityLog;

