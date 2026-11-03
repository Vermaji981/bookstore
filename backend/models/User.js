const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pinCode: { type: String, default: '' },
      country: { type: String, default: 'USA' },
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin', 'order_manager', 'inventory_manager', 'support'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
    cart: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Book',
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
      },
    ],
    // Referral System
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Loyalty & Rewards Program
    loyaltyPoints: {
      type: Number,
      default: 100, // 100 welcome bonus points
      min: 0,
    },
    loyaltyTier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze',
    },
    // Recently Viewed Books Tracking
    recentlyViewed: [
      {
        book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    // Notification Preferences
    notificationPreferences: {
      emailOrderUpdates: { type: Boolean, default: true },
      emailPromotions: { type: Boolean, default: true },
      priceDropAlerts: { type: Boolean, default: true },
      inAppAlerts: { type: Boolean, default: true },
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving and generate referral code if not present
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (!this.referralCode) {
    const cleanName = (this.name || 'READ').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
    const randNum = Math.floor(1000 + Math.random() * 9000);
    this.referralCode = `${cleanName}-${randNum}`;
  }
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
