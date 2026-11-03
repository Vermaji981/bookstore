const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a book title'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Please provide the author name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a book description'],
    },
    image: {
      type: String,
      required: [true, 'Please provide a book cover image'],
      default: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true,
    },
    originalPrice: {
      type: Number,
      required: [true, 'Please provide original price'],
      min: 0,
    },
    price: {
      type: Number,
      required: [true, 'Please provide current selling price'],
      min: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      default: 15,
      min: 0,
    },
    isbn: {
      type: String,
      default: () => '978-' + Math.floor(1000000000 + Math.random() * 9000000000),
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    publicationDate: {
      type: String,
      default: '2023',
    },
    publisher: {
      type: String,
      default: 'Penguin Random House',
    },
    language: {
      type: String,
      default: 'English',
    },
    pageCount: {
      type: Number,
      default: 320,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    // Multiple Formats Support
    formats: [
      {
        formatType: {
          type: String,
          enum: ['Paperback', 'Hardcover', 'E-book', 'Audiobook'],
          required: true,
          default: 'Paperback',
        },
        price: { type: Number, required: true },
        originalPrice: { type: Number },
        stock: { type: Number, default: 20 },
        isAvailable: { type: Boolean, default: true },
        details: { type: String, default: '' },
      },
    ],
    // Book Preview System
    preview: {
      hasPreview: { type: Boolean, default: true },
      tableOfContents: [
        {
          chapterNumber: { type: Number },
          title: { type: String },
          page: { type: Number },
        },
      ],
      samplePages: [
        {
          pageNumber: { type: Number },
          heading: { type: String },
          content: { type: String },
        },
      ],
      excerpt: { type: String, default: '' },
    },
    // Author & Publisher Details
    authorDetails: {
      bio: { type: String, default: '' },
      image: { type: String, default: '' },
      born: { type: String, default: '' },
      nationality: { type: String, default: '' },
      genres: [{ type: String }],
      website: { type: String, default: '' },
    },
    publisherDetails: {
      name: { type: String, default: '' },
      logo: { type: String, default: '' },
      description: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    // Detailed Specifications for Book Comparison
    specifications: {
      dimensions: { type: String, default: '5.5 x 0.8 x 8.4 inches' },
      weight: { type: String, default: '14.4 ounces' },
      edition: { type: String, default: '1st Edition' },
      readingAge: { type: String, default: '16+ years' },
      printLength: { type: Number, default: 320 },
      fileSize: { type: String, default: '4.2 MB' },
    },
    // Price Drop Alerts subscribers
    priceAlerts: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        email: { type: String },
        targetPrice: { type: Number },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

bookSchema.index({ title: 'text', author: 'text', description: 'text', category: 'text' });
bookSchema.index({ isbn: 1 });
bookSchema.index({ category: 1, price: 1 });
bookSchema.index({ rating: -1 });

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
