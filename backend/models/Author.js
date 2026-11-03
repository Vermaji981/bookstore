const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Author name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    bio: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    },
    born: {
      type: String,
      default: '',
    },
    nationality: {
      type: String,
      default: '',
    },
    genres: [{ type: String }],
    website: {
      type: String,
      default: '',
    },
    socialLinks: {
      twitter: String,
      instagram: String,
      goodreads: String,
    },
  },
  {
    timestamps: true,
  }
);

authorSchema.pre('save', function () {
  if (this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});

authorSchema.index({ name: 'text', bio: 'text' });
authorSchema.index({ slug: 1 });

const Author = mongoose.model('Author', authorSchema);
module.exports = Author;

