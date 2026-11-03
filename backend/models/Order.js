const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Book',
          required: true,
        },
        title: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, required: true, min: 1 },
        format: { type: String, default: 'Paperback' },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pinCode: { type: String, required: true },
      country: { type: String, default: 'USA' },
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'Stripe',
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
      paymentIntentId: String,
      clientSecret: String,
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    discountPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    // Gift Card & Loyalty Deductions
    giftCardCode: {
      type: String,
      default: '',
    },
    giftCardAmount: {
      type: Number,
      default: 0.0,
    },
    loyaltyPointsRedeemed: {
      type: Number,
      default: 0,
    },
    loyaltyPointsEarned: {
      type: Number,
      default: 0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    orderStatus: {
      type: String,
      required: true,
      enum: [
        'Pending',
        'Confirmed',
        'Processing',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Returned',
      ],
      default: 'Pending',
    },
    // Shipping carrier & tracking timeline
    carrier: {
      type: String,
      default: 'FedEx Express',
    },
    trackingNumber: {
      type: String,
      default: () => 'PH-' + Math.floor(10000000 + Math.random() * 90000000),
    },
    estimatedDelivery: {
      type: Date,
      default: () => new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days default
    },
    trackingHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        description: { type: String },
        location: { type: String, default: 'Fulfillment Hub' },
      },
    ],
    // Return & Refund System
    returnStatus: {
      type: String,
      enum: [
        'none',
        'requested',
        'approved',
        'rejected',
        'pickup_scheduled',
        'returned',
        'refund_processing',
        'refunded',
        'completed',
      ],
      default: 'none',
    },
    refundStatus: {
      type: String,
      enum: ['none', 'requested', 'approved', 'rejected', 'refunded'],
      default: 'none',
    },
    refundReason: {
      type: String,
      default: '',
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ trackingNumber: 1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
