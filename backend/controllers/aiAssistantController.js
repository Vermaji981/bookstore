const Book = require('../models/Book');

// @desc    Query AI Book Assistant
// @route   POST /api/ai/ask
// @access  Public
const askBookAssistant = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide a question or message' });
    }

    const query = message.trim().toLowerCase();

    // 1. Budget extraction (e.g. "under $20", "under 15", "less than 25")
    let maxPrice = null;
    const priceMatch = query.match(/(?:under|below|less than|within|\$)\s*(\d+(?:\.\d+)?)/i);
    if (priceMatch && priceMatch[1]) {
      maxPrice = parseFloat(priceMatch[1]);
    }

    // 2. Category / Genre matching
    const allCategories = await Book.distinct('category');
    let matchedCategory = null;
    for (const cat of allCategories) {
      if (query.includes(cat.toLowerCase())) {
        matchedCategory = cat;
        break;
      }
    }

    // Common synonyms
    if (!matchedCategory) {
      if (query.includes('story') || query.includes('novel')) matchedCategory = 'Fiction';
      else if (query.includes('mind') || query.includes('habit') || query.includes('productivity') || query.includes('motivation')) matchedCategory = 'Self-Help';
      else if (query.includes('money') || query.includes('invest') || query.includes('finance') || query.includes('wealth')) matchedCategory = 'Business';
      else if (query.includes('future') || query.includes('space') || query.includes('alien') || query.includes('ai')) matchedCategory = 'Sci-Fi';
      else if (query.includes('past') || query.includes('history') || query.includes('war')) matchedCategory = 'History';
    }

    // 3. Build MongoDB query
    const dbQuery = { stock: { $gt: 0 } };
    if (maxPrice !== null) {
      dbQuery.price = { $lte: maxPrice };
    }
    if (matchedCategory) {
      dbQuery.category = new RegExp(matchedCategory, 'i');
    }

    // Keyword terms extraction
    const stopwords = ['i', 'want', 'looking', 'for', 'book', 'books', 'suggest', 'recommend', 'show', 'me', 'some', 'good', 'best', 'read', 'under', 'below', 'please', 'the', 'a', 'an'];
    const keywords = query
      .split(/\s+/)
      .map((w) => w.replace(/[^a-z0-9]/g, ''))
      .filter((w) => w.length > 2 && !stopwords.includes(w));

    if (!matchedCategory && keywords.length > 0) {
      const keywordRegexes = keywords.map((kw) => new RegExp(kw, 'i'));
      dbQuery.$or = [
        { title: { $in: keywordRegexes } },
        { author: { $in: keywordRegexes } },
        { description: { $in: keywordRegexes } },
        { category: { $in: keywordRegexes } },
      ];
    }

    let matchingBooks = await Book.find(dbQuery)
      .sort({ rating: -1, numReviews: -1 })
      .limit(5);

    // If no exact match with all filters, fall back to relaxed search
    if (matchingBooks.length === 0) {
      const fallbackQuery = { stock: { $gt: 0 } };
      if (maxPrice !== null) fallbackQuery.price = { $lte: maxPrice };
      matchingBooks = await Book.find(fallbackQuery)
        .sort({ rating: -1 })
        .limit(4);
    }

    // 4. Construct Assistant Response
    let assistantReply = '';
    const bookListText = matchingBooks
      .map((b) => `• "${b.title}" by ${b.author} ($${b.price.toFixed(2)}) — Rated ★ ${b.rating}`)
      .join('\n');

    if (query.includes('beginner') || query.includes('start')) {
      assistantReply = `Here are the absolute best introductory books from our catalog that are easy to digest, deeply rewarding, and highly recommended for beginners:\n\n${bookListText}\n\nEach of these is available in stock right now with fast delivery!`;
    } else if (maxPrice !== null) {
      assistantReply = `I've found these fantastic titles currently priced under $${maxPrice.toFixed(2)} in our bookstore catalog:\n\n${bookListText}\n\nWould you like me to tell you more about any of these?`;
    } else if (matchedCategory) {
      assistantReply = `For top-tier **${matchedCategory}** literature, our readers and literary curators rate these as the best in class:\n\n${bookListText}\n\nYou can click any card below to preview sample pages or add directly to your cart!`;
    } else if (query.includes('student') || query.includes('college') || query.includes('study')) {
      assistantReply = `For students and lifelong learners, we strongly recommend these foundational masterpieces from our collection:\n\n${bookListText}\n\nThey combine profound clarity with actionable knowledge!`;
    } else {
      assistantReply = `Based on our current verified bookstore collection, here are our top curated recommendations matching your inquiry:\n\n${bookListText}\n\nFeel free to ask for more specific genres, price limits, or sample chapter previews!`;
    }

    res.json({
      success: true,
      data: {
        reply: assistantReply,
        recommendedBooks: matchingBooks,
        matchedFilters: {
          category: matchedCategory,
          maxPrice,
          keywordCount: keywords.length,
        },
      },
    });
  } catch (error) {
    console.error('AI Assistant Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  askBookAssistant,
};

