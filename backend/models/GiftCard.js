const mongoose = require('mongoose');

const giftCardSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    initialBalance: {
      type: Number,
      required: true,
      min: 5,
    },
    currentBalance: {
      type: Number,
      required: true,
      min: 0,
    },
    recipientEmail: {
      type: String,
      trim: true,
    },
    recipientName: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      default: '',
    },
    expiryDate: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    usageHistory: [
      {
        order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amountUsed: { type: Number, required: true },
        usedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

giftCardSchema.index({ recipientEmail: 1 });

const GiftCard = mongoose.model('GiftCard', giftCardSchema);
module.exports = GiftCard;
