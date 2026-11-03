const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    bookTitle: {
      type: String,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    adjustedStock: {
      type: Number,
      required: true,
    },
    changeAmount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      default: 'MANUAL_ADJUSTMENT',
    },
    admin: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: 'System' },
      email: { type: String, default: 'system@bookstore.com' },
    },
    note: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

inventoryLogSchema.index({ createdAt: -1 });

const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);
module.exports = InventoryLog;

