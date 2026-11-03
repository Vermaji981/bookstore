const mongoose = require('mongoose');

const publisherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Publisher name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
    },
    foundedYear: {
      type: Number,
    },
    location: {
      type: String,
      default: 'New York, USA',
    },
    website: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

publisherSchema.pre('save', function () {
  if (this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});

publisherSchema.index({ name: 'text', description: 'text' });
publisherSchema.index({ slug: 1 });

const Publisher = mongoose.model('Publisher', publisherSchema);
module.exports = Publisher;

