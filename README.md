# 📚 PageHaven - Full-Stack MERN Bookstore E-Commerce Platform

A production-ready, full-stack **MERN (MongoDB, Express, React, Node.js)** Online Bookstore E-Commerce web application featuring user authentication, catalog filtering, real-time inventory management, a functional shopping cart, **Stripe Payment Gateway** integration, order fulfillment tracking, customer dashboard, and an administrative command center.

Inspired by modern literary platforms and reference e-commerce architectures.

---

## 🌟 Key Features

### 🛍️ Customer Experience & Storefront
- **Dynamic Homepage**: High-impact hero showcase with floating 3D book covers, category carousels, tabbed featured/bestseller/new arrivals books, Deal of the Day with live countdown timer, and verified reader testimonials.
- **Advanced Book Catalog**: Search by keyword/author/ISBN, real-time category filtering, price range slider ($10–$80+), minimum star rating filters, sorting (Newest, Price: Low to High, Price: High to Low, Rating, Popularity), and Grid/List view toggle.
- **Detailed Book Pages**: High-resolution book cover preview, stock availability status, book specifications (ISBN, Publisher, Pages, Language), synopsis, and customer reviews with interactive star ratings.
- **Interactive Shopping Cart**: Stock limit enforcement, quantity steppers, promo code discount calculation (e.g. `BOOKWORM` for 10% off, `WELCOME20` for 20% off), estimated sales tax, and automated free shipping for orders over $35.
- **Secure Multi-Step Checkout**: Customer shipping address validation, choice between **Stripe Card Payment** (256-bit encrypted) and **Cash on Delivery (COD)**.
- **Live Order Tracking**: Interactive 6-stage timeline (*Order Placed ➔ Confirmed ➔ Processing ➔ Shipped ➔ Out for Delivery ➔ Delivered*) with dynamic status notes that update when changed in the Admin Dashboard.
- **Customer Dashboard**: Profile details editor, default shipping destination manager, password changer, wishlist management, and order cancellation for eligible stages.

### 🛡️ Administrative Command Center
- **Executive Analytics Overview**: Live computed statistics for Total Revenue ($), Total Orders, Catalog Titles, Registered Users, Pending vs. Delivered orders, and monthly revenue trends.
- **Catalog Management (CRUD)**: Add new books with cover image URL, update pricing, discount flags, stock quantities, and remove books.
- **Order Fulfillment & Tracking**: View all customer orders, filter by stage, and update order statuses with custom milestone notes.
- **User Account Administration**: View all registered accounts, toggle administrator privileges, and activate/deactivate accounts.

---

## 💻 Tech Stack

- **Frontend**:
  - React.js (v19)
  - React Router DOM (v7)
  - Lucide React (modern, lightweight SVG icons)
  - Axios (HTTP client with JWT request interceptors)
  - Context API (`AuthContext`, `CartContext`, `WishlistContext`)
  - Modern Custom CSS Design System (Design tokens, fluid typography, glassmorphism, responsive grid)

- **Backend**:
  - Node.js & Express.js REST API
  - MongoDB & Mongoose ORM
  - Automatic In-Memory MongoDB Server fallback for instant evaluation (zero setup required!)
  - JSON Web Tokens (JWT) & bcrypt.js password hashing
  - Stripe SDK (Payment Intents, backend verification, webhooks)
  - Multer (cover image uploads) & Morgan request logging

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ installed
- **npm** v9+ installed

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (a default `.env` is already created):
   ```env
   PORT=5000
   NODE_ENV=development
   # Leave MONGO_URI blank to use automatic in-memory MongoDB fallback, or paste your MongoDB Atlas URI:
   MONGO_URI=
   JWT_SECRET=supersecret_jwt_key_bookstore_2026_dev
   JWT_EXPIRES_IN=30d
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```
   *The database will automatically seed with 12+ bestsellers, categories, admin user, demo reader, reviews, and test orders on initial startup.*

### 3. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🔑 Demo Login Credentials

For immediate evaluation, the Login page includes **1-Click Quick Fill** buttons:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@bookstore.com` | `admin123` |
| **Verified Reader** | `user@bookstore.com` | `user123` |

---

## 💳 Stripe Payment Gateway Setup

1. Sign up or log in to the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys).
2. Copy your **Publishable Key** (`pk_test_...`) and **Secret Key** (`sk_test_...`).
3. Add them to `backend/.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_51...
   STRIPE_PUBLISHABLE_KEY=pk_test_51...
   ```
4. Test cards provided by Stripe:
   - Card Number: `4242 4242 4242 4242`
   - Expiration Date: Any future month/year (e.g. `12/28`)
   - CVC: Any 3 digits (e.g. `123`)
5. *Note: If Stripe keys are not yet configured in `.env`, the checkout page allows selecting **Cash on Delivery (COD)** to test the complete order generation and tracking journey without restrictions.*

---

## 🎟️ Active Coupon Codes

Test coupon codes in the Shopping Cart:
- `BOOKWORM`: **10% discount** on all books
- `WELCOME20`: **20% reader welcome discount**
- Any order with subtotal **$35.00 or higher** automatically unlocks **FREE Shipping**.

---

## 📡 REST API Endpoints Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | Public |
| `GET` | `/api/auth/me` | Fetch logged-in user profile | Authenticated |
| `PUT` | `/api/auth/profile` | Update user profile & address | Authenticated |
| `GET` | `/api/books` | Get books with filters, sorting & pagination | Public |
| `GET` | `/api/books/:id` | Get single book details & customer reviews | Public |
| `POST` | `/api/books` | Create a new book | Admin only |
| `PUT` | `/api/books/:id` | Update book details or stock | Admin only |
| `DELETE` | `/api/books/:id` | Delete book | Admin only |
| `POST` | `/api/books/:id/reviews` | Submit a reader review | Authenticated |
| `POST` | `/api/orders` | Create an order | Authenticated |
| `GET` | `/api/orders/myorders` | Get user order history | Authenticated |
| `GET` | `/api/orders/track/:id` | Get public milestone tracking timeline | Public |
| `GET` | `/api/orders` | Get all orders with filter | Admin only |
| `PUT` | `/api/orders/:id/status` | Update fulfillment stage & tracking notes | Admin only |
| `GET` | `/api/users/admin/stats` | Get executive sales & analytics reports | Admin only |
| `GET` | `/api/payment/config` | Get Stripe public configuration | Public |
| `POST` | `/api/payment/create-payment-intent` | Securely create Stripe PaymentIntent | Authenticated |
| `POST` | `/api/payment/verify-payment` | Backend verification of Stripe transaction | Authenticated |
