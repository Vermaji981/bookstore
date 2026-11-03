const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please provide coupon code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: [true, 'Please provide discount amount or percentage'],
      min: [0, 'Discount must be positive'],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: 0, // 0 means no ceiling
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please specify expiry date'],
    },
    usageLimit: {
      type: Number,
      default: 100,
    },
    timesUsed: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        usedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

couponSchema.methods.isValid = function (orderAmount = 0) {
  if (!this.isActive) return { valid: false, message: 'This coupon is inactive.' };
  if (this.expiryDate && new Date(this.expiryDate) < new Date()) {
    return { valid: false, message: 'This coupon has expired.' };
  }
  if (this.usageLimit && this.timesUsed >= this.usageLimit) {
    return { valid: false, message: 'This coupon usage limit has been reached.' };
  }
  if (this.minOrderAmount && orderAmount < this.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount for this coupon is $${this.minOrderAmount.toFixed(2)}.`,
    };
  }
  return { valid: true };
};

couponSchema.methods.calculateDiscount = function (subtotal = 0) {
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (subtotal * this.discountValue) / 100;
    if (this.maxDiscount > 0 && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = Math.min(this.discountValue, subtotal);
  }
  return Number(discount.toFixed(2));
};

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;

