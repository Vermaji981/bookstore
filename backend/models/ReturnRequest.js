const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
        title: { type: String, required: true },
        qty: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true },
      },
    ],
    requestType: {
      type: String,
      enum: ['return', 'replacement', 'refund'],
      default: 'return',
    },
    reason: {
      type: String,
      enum: [
        'damaged_book',
        'wrong_item_received',
        'missing_pages',
        'poor_print_quality',
        'not_as_described',
        'ordered_by_mistake',
        'other',
      ],
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    images: [{ type: String }],
    status: {
      type: String,
      enum: [
        'Requested',
        'Approved',
        'Rejected',
        'Pickup Scheduled',
        'Returned',
        'Refund Processing',
        'Refunded',
        'Completed',
      ],
      default: 'Requested',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    pickupTracking: {
      carrier: { type: String, default: 'FedEx Express' },
      trackingNumber: { type: String, default: '' },
      scheduledDate: { type: Date },
    },
    history: [
      {
        status: { type: String },
        comment: { type: String },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

returnRequestSchema.index({ order: 1 });
returnRequestSchema.index({ user: 1 });
returnRequestSchema.index({ status: 1 });

const ReturnRequest = mongoose.model('ReturnRequest', returnRequestSchema);
module.exports = ReturnRequest;

