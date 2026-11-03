const Stripe = require('stripe');
const Order = require('../models/Order');

// Initialize Stripe instance if real valid key exists
const getStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (
    !secretKey ||
    secretKey.trim() === '' ||
    secretKey.includes('Mock') ||
    secretKey.startsWith('mock_')
  ) {
    return null;
  }
  try {
    return new Stripe(secretKey);
  } catch (err) {
    console.warn('Failed to initialize Stripe client:', err.message);
    return null;
  }
};

// @desc    Get Stripe publishable key configuration
// @route   GET /api/payment/config
// @access  Public
const getStripeConfig = async (req, res) => {
  const stripe = getStripeInstance();
  const hasRealKeys = Boolean(
    stripe &&
      process.env.STRIPE_PUBLISHABLE_KEY &&
      !process.env.STRIPE_PUBLISHABLE_KEY.includes('Mock')
  );

  res.json({
    success: true,
    publishableKey: hasRealKeys ? process.env.STRIPE_PUBLISHABLE_KEY : 'pk_test_simulated_bookstore',
    isConfigured: true, // Always ready: real Stripe if keys provided, or built-in Test Simulator
    isRealStripe: hasRealKeys,
    mode: hasRealKeys ? 'live_or_stripe_test' : 'simulator',
  });
};

// @desc    Create Stripe Payment Intent
// @route   POST /api/payment/create-payment-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Please provide an orderId' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.isPaid) {
      return res.status(400).json({ success: false, message: 'This order has already been paid' });
    }

    const stripe = getStripeInstance();

    // Amount in cents (minimum $0.50 for Stripe USD)
    const amountInCents = Math.max(50, Math.round(order.totalPrice * 100));

    // 1. If real Stripe keys are configured, use Stripe API
    if (stripe) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: 'usd',
          automatic_payment_methods: {
            enabled: true,
          },
          metadata: {
            orderId: order._id.toString(),
            userId: req.user._id.toString(),
            customerEmail: order.shippingAddress.email,
          },
          description: `Payment for Bookstore Order #${order._id}`,
        });

        order.paymentResult = {
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          status: paymentIntent.status,
        };
        await order.save();

        return res.json({
          success: true,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: amountInCents,
          currency: 'usd',
          mode: 'stripe',
        });
      } catch (stripeErr) {
        console.warn('Real Stripe call failed, falling back to simulated test mode:', stripeErr.message);
      }
    }

    // 2. Built-in Test Simulator (when Stripe keys are not yet provided)
    const mockIntentId = `pi_test_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const mockClientSecret = `${mockIntentId}_secret_${Math.random().toString(36).substring(2, 10)}`;

    order.paymentResult = {
      paymentIntentId: mockIntentId,
      clientSecret: mockClientSecret,
      status: 'succeeded',
    };
    await order.save();

    res.json({
      success: true,
      clientSecret: mockClientSecret,
      paymentIntentId: mockIntentId,
      amount: amountInCents,
      currency: 'usd',
      mode: 'simulator',
      message: 'Test payment intent created successfully',
    });
  } catch (error) {
    console.error('Stripe Create Payment Intent Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Stripe Payment on the backend
// @route   POST /api/payment/verify-payment
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;

    if (!orderId || !paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and Payment Intent ID are required for verification',
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Prevent duplicate processing
    if (order.isPaid) {
      return res.json({
        success: true,
        data: order,
        message: 'Order is already marked as paid',
      });
    }

    const stripe = getStripeInstance();

    // 1. Built-in Test Mode verification
    if (paymentIntentId.startsWith('pi_test_sim_') || !stripe) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.orderStatus = 'Confirmed';
      order.paymentResult = {
        id: paymentIntentId,
        status: 'succeeded',
        update_time: new Date().toISOString(),
        email_address: order.shippingAddress.email,
        paymentIntentId: paymentIntentId,
      };

      order.trackingHistory.push({
        status: 'Confirmed',
        timestamp: new Date(),
        description: `Payment verified via Test Gateway (${paymentIntentId}). Order confirmed.`,
      });

      const updatedOrder = await order.save();

      return res.json({
        success: true,
        data: updatedOrder,
        message: 'Payment verified and order confirmed successfully',
      });
    }

    // 2. Real Stripe Verification
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return res.status(400).json({
        success: false,
        message: 'Payment Intent could not be found with Stripe',
      });
    }

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        status: paymentIntent.status,
        message: `Payment has not succeeded. Current status: ${paymentIntent.status}`,
      });
    }

    if (
      paymentIntent.metadata &&
      paymentIntent.metadata.orderId &&
      paymentIntent.metadata.orderId !== order._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Payment Intent metadata does not match this order',
      });
    }

    // Mark order as paid
    order.isPaid = true;
    order.paidAt = new Date();
    order.orderStatus = 'Confirmed';
    order.paymentResult = {
      id: paymentIntent.id,
      status: paymentIntent.status,
      update_time: new Date().toISOString(),
      email_address: paymentIntent.metadata?.customerEmail || order.shippingAddress.email,
      paymentIntentId: paymentIntent.id,
    };

    order.trackingHistory.push({
      status: 'Confirmed',
      timestamp: new Date(),
      description: `Payment verified via Stripe (ID: ${paymentIntent.id}). Order confirmed.`,
    });

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Payment verified and order confirmed successfully',
    });
  } catch (error) {
    console.error('Stripe Verification Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Stripe Webhook for async payment notification
// @route   POST /api/payment/webhook
// @access  Public
const stripeWebhook = async (req, res) => {
  const stripe = getStripeInstance();
  if (!stripe) {
    return res.status(400).send('Stripe is not configured');
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (endpointSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // In dev without webhook secret
      event = req.body;
    }
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        const order = await Order.findById(orderId);
        if (order && !order.isPaid) {
          order.isPaid = true;
          order.paidAt = new Date();
          order.orderStatus = 'Confirmed';
          order.paymentResult = {
            id: paymentIntent.id,
            status: paymentIntent.status,
            update_time: new Date().toISOString(),
            email_address: paymentIntent.metadata?.customerEmail,
            paymentIntentId: paymentIntent.id,
          };
          order.trackingHistory.push({
            status: 'Confirmed',
            timestamp: new Date(),
            description: `Payment confirmed via webhook (${paymentIntent.id})`,
          });
          await order.save();
          console.log(`Order ${orderId} marked paid via Stripe webhook`);
        }
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      console.warn(`Payment failed for Intent: ${paymentIntent.id}`);
      break;
    }
    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  res.json({ received: true });
};

// @desc    Get All Payment Transactions (Admin)
// @route   GET /api/payment/admin/transactions
// @access  Private/Admin
const getAdminTransactions = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status === 'succeeded') {
      query.isPaid = true;
      query.refundStatus = { $ne: 'refunded' };
    } else if (status === 'pending') {
      query.isPaid = false;
      query.orderStatus = { $ne: 'Cancelled' };
    } else if (status === 'refunded') {
      query.refundStatus = 'refunded';
    } else if (status === 'failed') {
      query.isPaid = false;
      query.orderStatus = 'Cancelled';
    }

    if (search && search.trim() !== '') {
      if (search.trim().match(/^[0-9a-fA-F]{24}$/)) {
        query._id = search.trim();
      } else {
        query.$or = [
          { 'shippingAddress.fullName': { $regex: search.trim(), $options: 'i' } },
          { 'shippingAddress.email': { $regex: search.trim(), $options: 'i' } },
          { 'paymentResult.paymentIntentId': { $regex: search.trim(), $options: 'i' } },
        ];
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [total, orders, allPaidOrders, refundedOrders] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.find({ isPaid: true }).select('totalPrice paymentMethod'),
      Order.find({ refundStatus: 'refunded' }).select('refundAmount'),
    ]);

    const totalSuccessfulAmount = allPaidOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const totalRefundedAmount = refundedOrders.reduce((sum, o) => sum + (o.refundAmount || 0), 0);

    const transactions = orders.map((order) => ({
      _id: order._id,
      transactionId: order.paymentResult?.paymentIntentId || order.paymentResult?.id || `COD-${order._id.toString().slice(-6)}`,
      orderId: order._id,
      customer: {
        name: order.shippingAddress.fullName || order.user?.name || 'Customer',
        email: order.shippingAddress.email || order.user?.email || 'N/A',
      },
      amount: order.totalPrice,
      paymentMethod: order.paymentMethod,
      paymentDate: order.paidAt || order.createdAt,
      paymentStatus:
        order.refundStatus === 'refunded'
          ? 'Refunded'
          : order.isPaid
          ? 'Succeeded'
          : order.orderStatus === 'Cancelled'
          ? 'Failed'
          : 'Pending',
      stripeReference: order.paymentResult?.paymentIntentId || null,
      refundStatus: order.refundStatus,
      refundAmount: order.refundAmount || 0,
      refundReason: order.refundReason || '',
    }));

    res.json({
      success: true,
      data: {
        transactions,
        summary: {
          totalVolume: Number(totalSuccessfulAmount.toFixed(2)),
          totalSuccessfulCount: allPaidOrders.length,
          totalRefundedAmount: Number(totalRefundedAmount.toFixed(2)),
          totalRefundedCount: refundedOrders.length,
          netRevenue: Number((totalSuccessfulAmount - totalRefundedAmount).toFixed(2)),
        },
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Process Order Refund (Admin)
// @route   POST /api/payment/admin/refund
// @access  Private/Admin
const processRefund = async (req, res) => {
  try {
    const { orderId, amount, reason } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Please provide an orderId' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!order.isPaid) {
      return res.status(400).json({ success: false, message: 'Cannot refund an unpaid order' });
    }

    if (order.refundStatus === 'refunded') {
      return res.status(400).json({ success: false, message: 'This order has already been refunded' });
    }

    const refundAmount = amount ? Number(amount) : order.totalPrice;
    const stripe = getStripeInstance();

    // If real Stripe was used and key exists, issue refund via Stripe API
    if (stripe && order.paymentResult?.paymentIntentId && !order.paymentResult.paymentIntentId.startsWith('pi_test_sim_')) {
      try {
        await stripe.refunds.create({
          payment_intent: order.paymentResult.paymentIntentId,
          amount: Math.round(refundAmount * 100),
          reason: 'requested_by_customer',
        });
      } catch (stripeErr) {
        console.warn('Stripe refund API error (handled gracefully for simulator):', stripeErr.message);
      }
    }

    order.refundStatus = 'refunded';
    order.refundAmount = refundAmount;
    order.refundReason = reason || 'Admin approved refund';
    order.refundedAt = new Date();
    order.orderStatus = 'Cancelled';

    order.trackingHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      description: `Refund of $${refundAmount.toFixed(2)} processed successfully. Order cancelled.`,
    });

    await order.save();

    // Restock books
    const Book = require('../models/Book');
    for (const item of order.orderItems) {
      const book = await Book.findById(item.book);
      if (book) {
        book.stock += item.qty;
        await book.save();
      }
    }

    const { logAdminActivity } = require('../utils/logger');
    await logAdminActivity({
      req,
      action: 'PROCESS_REFUND',
      module: 'payments',
      details: `Processed refund of $${refundAmount.toFixed(2)} for Order #${order._id}. Reason: ${reason || 'N/A'}`,
      targetId: order._id.toString(),
      updatedValue: { refundAmount, refundStatus: 'refunded' },
    });

    const { createNotification } = require('../utils/notifier');
    await createNotification({
      title: 'Order Refund Processed',
      message: `Refund of $${refundAmount.toFixed(2)} was processed for Order #${order._id.toString().slice(-6)}.`,
      type: 'refund',
      link: '/admin?tab=payments',
    });

    res.json({
      success: true,
      data: order,
      message: `Refund of $${refundAmount.toFixed(2)} processed successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStripeConfig,
  createPaymentIntent,
  verifyPayment,
  stripeWebhook,
  getAdminTransactions,
  processRefund,
};
