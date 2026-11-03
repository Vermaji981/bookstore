const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Book = require('../models/Book');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const SiteSettings = require('../models/SiteSettings');
const InventoryLog = require('../models/InventoryLog');

dotenv.config();

const categoriesData = [
  {
    name: 'Fiction',
    description: 'Bestselling literary fiction, historical novels, and contemporary masterworks.',
    icon: 'BookOpen',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'Sci-Fi & Fantasy',
    description: 'Imaginative realms, cyberpunk worlds, distant galaxies, and heroic sagas.',
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'Non-Fiction',
    description: 'True stories, memoirs, deep investigative journalism, and human chronicles.',
    icon: 'Compass',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'Self-Help & Mindset',
    description: 'Productivity systems, mental wellness, habits, mindfulness, and personal growth.',
    icon: 'Zap',
    image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'Technology & AI',
    description: 'Coding languages, artificial intelligence, software architecture, and modern tech.',
    icon: 'Cpu',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'Mystery & Thriller',
    description: 'Gripping whodunits, psychological edge-of-seat thrillers, and crime investigations.',
    icon: 'Search',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'Business & Finance',
    description: 'Startup strategy, wealth building, economics, investing, and leadership.',
    icon: 'TrendingUp',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'Romance & Drama',
    description: 'Heartwarming love stories, emotional bonds, romantic comedies, and passion.',
    icon: 'Heart',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=400',
  },
];

const booksData = [
  {
    title: 'Atomic Habits: Tiny Changes, Remarkable Results',
    author: 'James Clear',
    description: 'No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear, one of the world\'s leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    category: 'Self-Help & Mindset',
    originalPrice: 27.00,
    price: 18.99,
    stock: 45,
    isbn: '978-0735211292',
    rating: 4.9,
    numReviews: 24,
    publicationDate: '2018',
    publisher: 'Avery',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    pageCount: 320,
  },
  {
    title: 'The Midnight Library',
    author: 'Matt Haig',
    description: 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices. Nora Seed finds herself faced with this decision.',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
    category: 'Fiction',
    originalPrice: 26.00,
    price: 16.50,
    stock: 32,
    isbn: '978-0525559474',
    rating: 4.7,
    numReviews: 18,
    publicationDate: '2020',
    publisher: 'Viking',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    pageCount: 304,
  },
  {
    title: 'Dune (The Dune Chronicles, Book 1)',
    author: 'Frank Herbert',
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the "spice" melange, a drug capable of extending life and enhancing consciousness.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600',
    category: 'Sci-Fi & Fantasy',
    originalPrice: 22.00,
    price: 15.99,
    stock: 28,
    isbn: '978-0441172719',
    rating: 4.8,
    numReviews: 31,
    publicationDate: '1965',
    publisher: 'Ace',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    pageCount: 688,
  },
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. This book is a must for any developer, software engineer, or team lead.',
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=600',
    category: 'Technology & AI',
    originalPrice: 49.99,
    price: 38.50,
    stock: 19,
    isbn: '978-0132350884',
    rating: 4.9,
    numReviews: 42,
    publicationDate: '2008',
    publisher: 'Prentice Hall',
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    pageCount: 464,
  },
  {
    title: 'The Psychology of Money: Timeless Lessons on Wealth, Greed, and Happiness',
    author: 'Morgan Housel',
    description: 'Doing well with money isn\'t necessarily about what you know. It\'s about how you behave. And behavior is hard to teach, even to really smart people. Money—investing, personal finance, and business decisions—is typically taught as a math-based field. But in the real world people don\'t make financial decisions on a spreadsheet.',
    image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=600',
    category: 'Business & Finance',
    originalPrice: 24.99,
    price: 17.25,
    stock: 50,
    isbn: '978-0857197689',
    rating: 4.8,
    numReviews: 27,
    publicationDate: '2020',
    publisher: 'Harriman House',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    pageCount: 256,
  },
  {
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    description: 'Alicia Berenson\'s life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house overlooking a park in one of London\'s most desirable areas. One evening her husband returns home late from a fashion shoot, and Alicia shoots him five times in the face, and then never speaks another word.',
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600',
    category: 'Mystery & Thriller',
    originalPrice: 28.00,
    price: 14.99,
    stock: 35,
    isbn: '978-1250301696',
    rating: 4.6,
    numReviews: 19,
    publicationDate: '2019',
    publisher: 'Celadon Books',
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    pageCount: 336,
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    description: 'From a renowned historian comes a groundbreaking narrative of humanity\'s creation and evolution—a #1 international bestseller—that explores the ways in which biology and history have defined us and enhanced our understanding of what it means to be "human".',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
    category: 'Non-Fiction',
    originalPrice: 35.00,
    price: 22.99,
    stock: 40,
    isbn: '978-0062316097',
    rating: 4.8,
    numReviews: 35,
    publicationDate: '2015',
    publisher: 'Harper',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    pageCount: 464,
  },
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    description: 'Data is at the center of many challenges in system design today. Difficult issues need to be figured out, such as scalability, consistency, reliability, efficiency, and maintainability. In addition, we have an overwhelming variety of tools to pick from.',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=600',
    category: 'Technology & AI',
    originalPrice: 59.99,
    price: 44.95,
    stock: 22,
    isbn: '978-1449373320',
    rating: 4.95,
    numReviews: 50,
    publicationDate: '2017',
    publisher: "O'Reilly Media",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    pageCount: 616,
  },
  {
    title: 'It Ends with Us',
    author: 'Colleen Hoover',
    description: 'Lily hasn\'t always had it easy, but that\'s never stopped her from working hard for the life she wants. She\'s come a long way from the small town where she grew up. When she feels a spark with a gorgeous neurosurgeon named Ryle Kincaid, everything in Lily\'s life seems almost too good to be true.',
    image: 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&q=80&w=600',
    category: 'Romance & Drama',
    originalPrice: 20.00,
    price: 13.99,
    stock: 60,
    isbn: '978-1501110368',
    rating: 4.5,
    numReviews: 15,
    publicationDate: '2016',
    publisher: 'Atria Books',
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    pageCount: 384,
  },
  {
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    description: 'Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself are doomed. Except right now, he doesn\'t know that. He can\'t even remember his own name, let alone the nature of his assignment or how to complete it.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600',
    category: 'Sci-Fi & Fantasy',
    originalPrice: 28.99,
    price: 19.50,
    stock: 30,
    isbn: '978-0593135204',
    rating: 4.9,
    numReviews: 22,
    publicationDate: '2021',
    publisher: 'Ballantine Books',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    pageCount: 496,
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    description: 'In the international bestseller, Thinking, Fast and Slow, Daniel Kahneman, the renowned psychologist and winner of the Nobel Prize in Economics, takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think.',
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=600',
    category: 'Non-Fiction',
    originalPrice: 30.00,
    price: 19.99,
    stock: 25,
    isbn: '978-0374533557',
    rating: 4.7,
    numReviews: 16,
    publicationDate: '2011',
    publisher: 'Farrar, Straus and Giroux',
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    pageCount: 512,
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'The story of the fabulously wealthy Jay Gatsby and his new love for the beautiful Daisy Buchanan, of lavish parties on Long Island at a time when The New York Times noted "gin was the national drink and sex the national obsession".',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
    category: 'Fiction',
    originalPrice: 16.00,
    price: 10.99,
    stock: 45,
    isbn: '978-0743273565',
    rating: 4.6,
    numReviews: 12,
    publicationDate: '1925',
    publisher: "Scribner's",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    pageCount: 180,
  },
];

const seedData = async () => {
  try {
    console.log('Clearing existing data...');
    await User.deleteMany();
    await Book.deleteMany();
    await Category.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();
    await Coupon.deleteMany();
    await Notification.deleteMany();
    await ActivityLog.deleteMany();
    await SiteSettings.deleteMany();
    await InventoryLog.deleteMany();

    console.log('Seeding Categories...');
    const formattedCategories = categoriesData.map((cat) => ({
      ...cat,
      isActive: true,
      slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
    }));
    await Category.insertMany(formattedCategories);

    console.log('Seeding Admin & Customer Users...');
    const superAdminUser = await User.create({
      name: 'Alexander Vance (Super Admin)',
      email: 'superadmin@bookstore.com',
      password: 'admin123',
      phone: '+1 (555) 100-0001',
      role: 'superadmin',
      address: {
        street: '100 Enterprise Way, Suite 500',
        city: 'San Francisco',
        state: 'CA',
        pinCode: '94107',
        country: 'USA',
      },
    });

    const adminUser = await User.create({
      name: 'Sarah Connor (Store Admin)',
      email: 'admin@bookstore.com',
      password: 'admin123',
      phone: '+1 (555) 234-5678',
      role: 'admin',
      address: {
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'Oregon',
        pinCode: '97477',
        country: 'USA',
      },
    });

    const orderManagerUser = await User.create({
      name: 'Marcus Holloway (Order Ops)',
      email: 'orders@bookstore.com',
      password: 'admin123',
      phone: '+1 (555) 345-6789',
      role: 'order_manager',
      address: {
        street: '55 Logistics Boulevard',
        city: 'Chicago',
        state: 'IL',
        pinCode: '60601',
        country: 'USA',
      },
    });

    const inventoryManagerUser = await User.create({
      name: 'Elena Fisher (Stock Lead)',
      email: 'inventory@bookstore.com',
      password: 'admin123',
      phone: '+1 (555) 456-7890',
      role: 'inventory_manager',
      address: {
        street: '12 Warehouse Row',
        city: 'Seattle',
        state: 'WA',
        pinCode: '98101',
        country: 'USA',
      },
    });

    const supportUser = await User.create({
      name: 'David Miller (Customer Care)',
      email: 'support@bookstore.com',
      password: 'admin123',
      phone: '+1 (555) 567-8901',
      role: 'support',
      address: {
        street: '88 Service Lane',
        city: 'Austin',
        state: 'TX',
        pinCode: '78701',
        country: 'USA',
      },
    });

    const regularUser = await User.create({
      name: 'Jane Austen Reader',
      email: 'user@bookstore.com',
      password: 'user123',
      phone: '+1 (555) 876-5432',
      role: 'user',
      address: {
        street: '221B Baker Street',
        city: 'New York',
        state: 'NY',
        pinCode: '10001',
        country: 'USA',
      },
    });

    console.log('Seeding Books...');
    const createdBooks = await Book.insertMany(booksData);

    console.log('Seeding Sample Reviews...');
    const sampleReviews = [
      {
        book: createdBooks[0]._id,
        user: regularUser._id,
        name: regularUser.name,
        rating: 5,
        comment: 'This book completely transformed how I think about my daily routine! A must-read for everyone.',
      },
      {
        book: createdBooks[1]._id,
        user: regularUser._id,
        name: regularUser.name,
        rating: 5,
        comment: 'A magnificent and deeply touching philosophical journey. Beautifully written.',
      },
    ];
    await Review.insertMany(sampleReviews);

    console.log('Seeding Sample Orders...');
    const sampleOrder = await Order.create({
      user: regularUser._id,
      orderItems: [
        {
          book: createdBooks[0]._id,
          title: createdBooks[0].title,
          image: createdBooks[0].image,
          price: createdBooks[0].price,
          qty: 1,
        },
        {
          book: createdBooks[2]._id,
          title: createdBooks[2].title,
          image: createdBooks[2].image,
          price: createdBooks[2].price,
          qty: 1,
        },
      ],
      shippingAddress: {
        fullName: regularUser.name,
        email: regularUser.email,
        phone: regularUser.phone,
        address: regularUser.address.street,
        city: regularUser.address.city,
        state: regularUser.address.state,
        pinCode: regularUser.address.pinCode,
        country: 'USA',
      },
      paymentMethod: 'Stripe',
      paymentResult: {
        id: 'pi_test_3N28892jjkkl8829',
        status: 'succeeded',
        update_time: new Date().toISOString(),
        email_address: regularUser.email,
        paymentIntentId: 'pi_test_3N28892jjkkl8829',
      },
      itemsPrice: 34.98,
      taxPrice: 2.80,
      shippingPrice: 0.0,
      discountPrice: 3.50,
      totalPrice: 34.28,
      isPaid: true,
      paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      orderStatus: 'Shipped',
      trackingHistory: [
        {
          status: 'Order Placed',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          description: 'Order placed by customer.',
        },
        {
          status: 'Confirmed',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 1000 * 60 * 15),
          description: 'Payment confirmed via Stripe.',
        },
        {
          status: 'Processing',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          description: 'Items packed and checked for quality.',
        },
        {
          status: 'Shipped',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          description: 'Handed over to carrier (FedEx Tracking #FX98234190).',
        },
      ],
    });

    console.log('Seeding Default Coupons...');
    await Coupon.create([
      {
        code: 'WELCOME10',
        description: 'New reader welcome discount - 10% off any order',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 20,
        maxDiscount: 15,
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        usageLimit: 500,
        timesUsed: 42,
        isActive: true,
      },
      {
        code: 'BOOKWORM20',
        description: '$20 flat discount on premium orders over $75',
        discountType: 'fixed',
        discountValue: 20,
        minOrderAmount: 75,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        usageLimit: 200,
        timesUsed: 18,
        isActive: true,
      },
      {
        code: 'SUMMER25',
        description: 'Seasonal 25% discount special',
        discountType: 'percentage',
        discountValue: 25,
        minOrderAmount: 40,
        maxDiscount: 30,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        timesUsed: 67,
        isActive: true,
      },
    ]);

    console.log('Seeding Initial Site Settings...');
    await SiteSettings.create({
      websiteName: 'PageHaven Bookstore',
      websiteTagline: 'Discover Endless Worlds, Delivered to Your Doorstep',
      currencyCode: 'USD',
      currencySymbol: '$',
      shippingFee: 4.99,
      freeShippingThreshold: 35.0,
      taxPercentage: 8.0,
      lowStockThreshold: 5,
      contactEmail: 'support@bookstore.com',
      contactPhone: '+1 (800) 555-BOOK',
      contactAddress: '742 Evergreen Terrace, Springfield, OR 97477',
      workingHours: 'Mon - Fri: 9:00 AM - 8:00 PM EST',
      heroBanner: {
        badge: 'Special Autumn Reading Event',
        title: 'Expand Your Mind With Best-Selling Books',
        subtitle: 'Over 10,000+ handpicked literary gems, non-fiction guides, and sci-fi adventures. Free delivery on orders over $35.',
        ctaText: 'Explore Catalog',
        ctaLink: '/books',
        bgImage: 'https://images.unsplash.com/photo-1507842229451-7f01be777a26?auto=format&fit=crop&q=80&w=1600',
      },
      promotionalBanners: [
        {
          title: 'Fall Fiction Sale: Up to 40% Off',
          subtitle: 'Immerse yourself in award-winning paperbacks and signed editions',
          badge: 'Limited Time',
          link: '/books?category=Fiction',
          bgColor: '#3b82f6',
          isActive: true,
        },
        {
          title: 'Sci-Fi & AI Masterworks',
          subtitle: 'From Herbert to Andy Weir - Explore the universe',
          badge: 'Staff Picks',
          link: '/books?category=Sci-Fi%20%26%20Fantasy',
          bgColor: '#8b5cf6',
          isActive: true,
        },
      ],
      newsletterSubscribers: [
        { email: 'reader1@gmail.com', subscribedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { email: 'bookclub@nyu.edu', subscribedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { email: 'literaryfan@yahoo.com', subscribedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      ],
    });

    console.log('Seeding Sample Admin Notifications...');
    await Notification.create([
      {
        title: 'New Customer Order Placed',
        message: `Order #${sampleOrder._id.toString().slice(-6)} placed by ${regularUser.name} ($34.28)`,
        type: 'order',
        link: '/admin?tab=orders',
        isRead: false,
      },
      {
        title: 'Stripe Payment Confirmed',
        message: 'Payment of $34.28 was verified via Stripe Gateway (Test Mode).',
        type: 'payment',
        link: '/admin?tab=payments',
        isRead: false,
      },
      {
        title: 'New User Registered',
        message: `Customer "${regularUser.name}" (${regularUser.email}) created an account.`,
        type: 'user',
        link: '/admin?tab=users',
        isRead: true,
        readAt: new Date(),
      },
      {
        title: 'Customer Review Submitted',
        message: `Jane Austen Reader submitted a 5-star review on "${createdBooks[0].title}".`,
        type: 'review',
        link: '/admin?tab=reviews',
        isRead: false,
      },
    ]);

    console.log('Seeding Initial Activity Audit Logs...');
    await ActivityLog.create([
      {
        admin: {
          _id: superAdminUser._id,
          name: superAdminUser.name,
          email: superAdminUser.email,
          role: 'superadmin',
        },
        action: 'INITIAL_SEED',
        module: 'settings',
        details: 'Initial system catalog, coupons, and enterprise configurations initialized.',
        ipAddress: '127.0.0.1',
      },
      {
        admin: {
          _id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: 'admin',
        },
        action: 'CREATE_BOOK',
        module: 'books',
        details: `Published "${createdBooks[0].title}" by James Clear ($18.99).`,
        targetId: createdBooks[0]._id.toString(),
        ipAddress: '127.0.0.1',
      },
      {
        admin: {
          _id: orderManagerUser._id,
          name: orderManagerUser.name,
          email: orderManagerUser.email,
          role: 'order_manager',
        },
        action: 'UPDATE_ORDER_STATUS',
        module: 'orders',
        details: `Dispatched Order #${sampleOrder._id} with FedEx tracking #FX98234190.`,
        targetId: sampleOrder._id.toString(),
        ipAddress: '127.0.0.1',
      },
    ]);

    console.log('Seeding Initial Inventory Logs...');
    await InventoryLog.create([
      {
        book: createdBooks[0]._id,
        bookTitle: createdBooks[0].title,
        previousStock: 0,
        adjustedStock: 45,
        changeAmount: 45,
        reason: 'RESTOCK',
        admin: {
          _id: inventoryManagerUser._id,
          name: inventoryManagerUser.name,
          email: inventoryManagerUser.email,
        },
        note: 'Initial catalog stocking shipment received',
      },
      {
        book: createdBooks[0]._id,
        bookTitle: createdBooks[0].title,
        previousStock: 45,
        adjustedStock: 44,
        changeAmount: -1,
        reason: 'ORDER_FULFILLED',
        admin: {
          _id: orderManagerUser._id,
          name: orderManagerUser.name,
          email: orderManagerUser.email,
        },
        note: `Order #${sampleOrder._id} item fulfilled`,
      },
    ]);

    console.log('\x1b[32m✔ Sample data seeded successfully!\x1b[0m');
    console.log('Demo Credentials:');
    console.log('  Super Admin:      superadmin@bookstore.com / admin123');
    console.log('  Store Admin:      admin@bookstore.com      / admin123');
    console.log('  Order Manager:    orders@bookstore.com     / admin123');
    console.log('  Inventory Lead:   inventory@bookstore.com  / admin123');
    console.log('  Customer Support: support@bookstore.com    / admin123');
    console.log('  Customer:         user@bookstore.com       / user123');
  } catch (error) {
    console.error('\x1b[31m✖ Seeding failed:\x1b[0m', error);
  }
};

module.exports = { seedData };

// If run directly via node seeder.js
if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/db');
  (async () => {
    await connectDB();
    await seedData();
    await disconnectDB();
    process.exit(0);
  })();
}
