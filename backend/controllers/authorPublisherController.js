const Author = require('../models/Author');
const Publisher = require('../models/Publisher');
const Book = require('../models/Book');

// @desc    Get author profile & catalog
// @route   GET /api/authors/:name
// @access  Public
const getAuthorProfile = async (req, res) => {
  try {
    const rawName = decodeURIComponent(req.params.name);
    let author = await Author.findOne({
      $or: [{ name: new RegExp(`^${rawName}$`, 'i') }, { slug: rawName.toLowerCase() }],
    });

    // If author document doesn't exist yet, construct from books collection
    if (!author) {
      const booksByAuthor = await Book.find({ author: new RegExp(`^${rawName}$`, 'i') });
      if (booksByAuthor.length === 0) {
        return res.status(404).json({ success: false, message: 'Author not found' });
      }

      author = {
        name: booksByAuthor[0].author,
        bio: booksByAuthor[0].authorDetails?.bio || `Acclaimed author of ${booksByAuthor.length} celebrated titles in our collection.`,
        image: booksByAuthor[0].authorDetails?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        genres: [...new Set(booksByAuthor.map((b) => b.category))],
        born: booksByAuthor[0].authorDetails?.born || '1975',
        nationality: booksByAuthor[0].authorDetails?.nationality || 'International',
      };
    }

    const books = await Book.find({ author: new RegExp(author.name, 'i') }).sort({ rating: -1 });

    res.json({
      success: true,
      data: {
        author,
        books,
        totalBooks: books.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get publisher profile & catalog
// @route   GET /api/publishers/:name
// @access  Public
const getPublisherProfile = async (req, res) => {
  try {
    const rawName = decodeURIComponent(req.params.name);
    let publisher = await Publisher.findOne({
      $or: [{ name: new RegExp(`^${rawName}$`, 'i') }, { slug: rawName.toLowerCase() }],
    });

    if (!publisher) {
      const booksByPub = await Book.find({ publisher: new RegExp(`^${rawName}$`, 'i') });
      if (booksByPub.length === 0) {
        return res.status(404).json({ success: false, message: 'Publisher not found' });
      }

      publisher = {
        name: booksByPub[0].publisher,
        description: `Renowned publisher known for curated editions of world-class fiction, non-fiction, and educational literature.`,
        logo: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
        location: 'New York, USA',
        foundedYear: 1925,
      };
    }

    const books = await Book.find({ publisher: new RegExp(publisher.name, 'i') }).sort({ rating: -1 });

    res.json({
      success: true,
      data: {
        publisher,
        books,
        totalBooks: books.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all authors
// @route   GET /api/authors
// @access  Public
const getAllAuthors = async (req, res) => {
  try {
    const authorsInDb = await Author.find().sort({ name: 1 });
    const distinctBookAuthors = await Book.distinct('author');

    // Combine and build unified list
    const authorList = distinctBookAuthors.map((name) => {
      const found = authorsInDb.find((a) => a.name.toLowerCase() === name.toLowerCase());
      return {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        bio: found ? found.bio : 'Featured Bookstore Author',
        image: found ? found.image : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        genres: found ? found.genres : [],
      };
    });

    res.json({
      success: true,
      data: authorList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all publishers
// @route   GET /api/publishers
// @access  Public
const getAllPublishers = async (req, res) => {
  try {
    const publishersInDb = await Publisher.find().sort({ name: 1 });
    const distinctBookPubs = await Book.distinct('publisher');

    const pubList = distinctBookPubs.map((name) => {
      const found = publishersInDb.find((p) => p.name.toLowerCase() === name.toLowerCase());
      return {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: found ? found.description : 'Premier book publisher in our catalog',
        logo: found ? found.logo : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
        location: found ? found.location : 'Global',
      };
    });

    res.json({
      success: true,
      data: pubList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Create or update author
// @route   POST /api/authors/admin
// @access  Private / Admin
const createOrUpdateAuthor = async (req, res) => {
  try {
    const { name, bio, image, genres, born, nationality, website, twitter, instagram } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Author name is required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let author = await Author.findOne({ slug });

    if (author) {
      author.name = name;
      author.bio = bio || author.bio;
      author.image = image || author.image;
      author.genres = genres || author.genres;
      author.born = born || author.born;
      author.nationality = nationality || author.nationality;
      author.socialLinks = { website, twitter, instagram };
      await author.save();
    } else {
      author = await Author.create({
        name,
        slug,
        bio: bio || 'Celebrated author in our catalog.',
        image: image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        genres: genres || [],
        born,
        nationality,
        socialLinks: { website, twitter, instagram },
      });
    }

    res.json({ success: true, data: author, message: 'Author profile saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Create or update publisher
// @route   POST /api/publishers/admin
// @access  Private / Admin
const createOrUpdatePublisher = async (req, res) => {
  try {
    const { name, description, logo, location, foundedYear, website } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Publisher name is required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let publisher = await Publisher.findOne({ slug });

    if (publisher) {
      publisher.name = name;
      publisher.description = description || publisher.description;
      publisher.logo = logo || publisher.logo;
      publisher.location = location || publisher.location;
      publisher.foundedYear = foundedYear || publisher.foundedYear;
      publisher.website = website || publisher.website;
      await publisher.save();
    } else {
      publisher = await Publisher.create({
        name,
        slug,
        description: description || 'Publishing house of renowned works.',
        logo: logo || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
        location,
        foundedYear,
        website,
      });
    }

    res.json({ success: true, data: publisher, message: 'Publisher profile saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAuthorProfile,
  getPublisherProfile,
  getAllAuthors,
  getAllPublishers,
  createOrUpdateAuthor,
  createOrUpdatePublisher,
};
