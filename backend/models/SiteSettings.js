const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    websiteName: {
      type: String,
      default: 'PageHaven Bookstore',
    },
    websiteTagline: {
      type: String,
      default: 'Discover Endless Worlds, Delivered to Your Doorstep',
    },
    websiteLogo: {
      type: String,
      default: '',
    },
    currencyCode: {
      type: String,
      default: 'USD',
    },
    currencySymbol: {
      type: String,
      default: '$',
    },
    shippingFee: {
      type: Number,
      default: 4.99,
    },
    freeShippingThreshold: {
      type: Number,
      default: 35.0,
    },
    taxPercentage: {
      type: Number,
      default: 8.0, // 8%
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    contactEmail: {
      type: String,
      default: 'support@bookstore.com',
    },
    contactPhone: {
      type: String,
      default: '+1 (800) 555-BOOK',
    },
    contactAddress: {
      type: String,
      default: '742 Evergreen Terrace, Springfield, OR 97477',
    },
    workingHours: {
      type: String,
      default: 'Mon - Fri: 9:00 AM - 8:00 PM EST',
    },
    heroBanner: {
      badge: { type: String, default: 'Special Autumn Reading Event' },
      title: { type: String, default: 'Expand Your Mind With Best-Selling Books' },
      subtitle: {
        type: String,
        default: 'Over 10,000+ handpicked literary gems, non-fiction guides, and sci-fi adventures. Free delivery on orders over $35.',
      },
      ctaText: { type: String, default: 'Explore Catalog' },
      ctaLink: { type: String, default: '/books' },
      bgImage: {
        type: String,
        default: 'https://images.unsplash.com/photo-1507842229451-7f01be777a26?auto=format&fit=crop&q=80&w=1600',
      },
    },
    promotionalBanners: [
      {
        title: { type: String, default: '' },
        subtitle: { type: String, default: '' },
        badge: { type: String, default: '' },
        link: { type: String, default: '/books' },
        bgColor: { type: String, default: '#4f46e5' },
        isActive: { type: Boolean, default: true },
      },
    ],
    aboutUsContent: {
      heading: { type: String, default: 'Our Story & Literary Mission' },
      story: {
        type: String,
        default: 'Founded by passionate book lovers, PageHaven began with a simple mission: connecting avid readers with extraordinary stories.',
      },
      mission: {
        type: String,
        default: 'Empowering readers worldwide with affordable, curated, and accessible literature.',
      },
      vision: {
        type: String,
        default: 'Becoming the world’s most trusted indie book sanctuary with seamless digital commerce.',
      },
    },
    footerContent: {
      bio: {
        type: String,
        default: 'PageHaven is an independent bookstore providing readers with curated books, fast shipping, and a community of avid bookworms.',
      },
      copyrightText: {
        type: String,
        default: 'PageHaven Bookstore. All rights reserved.',
      },
    },
    newsletterSubscribers: [
      {
        email: { type: String, lowercase: true, trim: true },
        subscribedAt: { type: Date, default: Date.now },
      },
    ],
    notificationPreferences: {
      emailOnNewOrder: { type: Boolean, default: true },
      emailOnLowStock: { type: Boolean, default: true },
      emailOnRefundRequest: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Singleton helper: ensure one settings document exists
siteSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
module.exports = SiteSettings;

