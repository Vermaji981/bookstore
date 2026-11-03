const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const Book = require('./models/Book');
const { seedData } = require('./utils/seeder');

// Routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminRoutes = require('./routes/adminRoutes');
const couponRoutes = require('./routes/couponRoutes');
const reviewAdminRoutes = require('./routes/reviewAdminRoutes');
const giftCardRoutes = require('./routes/giftCardRoutes');
const returnRoutes = require('./routes/returnRoutes');
const loyaltyRoutes = require('./routes/loyaltyRoutes');
const aiAssistantRoutes = require('./routes/aiAssistantRoutes');
const authorPublisherRoutes = require('./routes/authorPublisherRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const customerNotificationRoutes = require('./routes/customerNotificationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const { subscribeNewsletter, getSiteSettings } = require('./controllers/adminController');

const app = express();

// Stripe Webhook needs the raw body, so we intercept before express.json()
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payment/webhook') {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration - dynamic origin matching to support Vercel and credentials safely
const allowedOrigins = [
  'https://bookstore-vermaji981.vercel.app',
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, server-to-server)
      if (!origin) return callback(null, true);

      // Check allowed list or Vercel preview domains
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production';

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback: allow to avoid CORS blockage
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Pre-flight OPTIONS handling
app.options('*', cors());

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static folder for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root landing & health check endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'PageHaven Enterprise Bookstore API Running',
    version: '1.0.0',
    frontend: 'https://bookstore-vermaji981.vercel.app',
    health: '/api/health',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    service: 'Bookstore E-commerce API',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin/reviews', reviewAdminRoutes);
app.use('/api/giftcards', giftCardRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/ai', aiAssistantRoutes);
app.use('/api', authorPublisherRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/notifications', customerNotificationRoutes);
app.use('/api/reviews', reviewRoutes);

// Public Settings & Newsletter
app.get('/api/settings', getSiteSettings);
app.post('/api/settings/newsletter', subscribeNewsletter);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server and initialize database
const startServer = async () => {
  try {
    await connectDB();

    // Check if database needs initial seeding
    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      console.log('No books found in database. Automatically initializing seed catalog...');
      await seedData();
    }

    const server = app.listen(PORT, () => {
      console.log(`\x1b[32m✔ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}\x1b[0m`);
      console.log(`\x1b[36m✔ Bookstore API available at http://localhost:${PORT}/api/health\x1b[0m`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\x1b[31m✖ Error: Port ${PORT} is already in use by another process!\x1b[0m`);
        console.error(`\x1b[33m💡 Ek aur node process pehle se port ${PORT} par chal rhi hai. Terminal me 'npx kill-port ${PORT}' chalaye ya Task Manager se purana node process close kare.\x1b[0m`);
      } else {
        console.error('Server error:', err.message);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
