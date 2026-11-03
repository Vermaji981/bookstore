const mongoose = require('mongoose');

const customerNotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['order', 'payment', 'price_drop', 'loyalty', 'referral', 'return', 'system'],
      default: 'system',
    },
    link: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

customerNotificationSchema.index({ user: 1, createdAt: -1 });

const CustomerNotification = mongoose.model('CustomerNotification', customerNotificationSchema);
module.exports = CustomerNotification;

