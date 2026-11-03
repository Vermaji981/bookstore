const mongoose = require('mongoose');
const Order = require('../models/Order');
const Book = require('../models/Book');
const User = require('../models/User');
const GiftCard = require('../models/GiftCard');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const CustomerNotification = require('../models/CustomerNotification');
const { logAdminActivity } = require('../utils/logger');
const { createNotification } = require('../utils/notifier');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice,
      totalPrice,
      giftCardCode,
      giftCardAmount,
      loyaltyPointsRedeemed,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: 'Please provide complete shipping address' });
    }

    // Verify stock and decrement
    for (const item of orderItems) {
      const book = await Book.findById(item.book);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: `Book "${item.title}" no longer exists in our catalog`,
        });
      }
      if (book.stock < item.qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${book.title}". Available: ${book.stock}, requested: ${item.qty}`,
        });
      }
      book.stock -= item.qty;
      await book.save();
    }

    // 1. Process Gift Card deduction if used
    let appliedGiftCardAmount = 0;
    if (giftCardCode) {
      const giftCard = await GiftCard.findOne({ code: giftCardCode.trim().toUpperCase(), isActive: true });
      if (giftCard && giftCard.currentBalance > 0) {
        appliedGiftCardAmount = Math.min(giftCard.currentBalance, Number(giftCardAmount || giftCard.currentBalance));
        giftCard.currentBalance = Math.max(0, giftCard.currentBalance - appliedGiftCardAmount);
        giftCard.usageHistory.push({
          user: req.user._id,
          amountUsed: appliedGiftCardAmount,
          usedAt: new Date(),
        });
        await giftCard.save();
      }
    }

    // 2. Process Loyalty points redeemed
    let pointsRedeemedCount = 0;
    if (loyaltyPointsRedeemed && Number(loyaltyPointsRedeemed) > 0) {
      const user = await User.findById(req.user._id);
      if (user && user.loyaltyPoints >= Number(loyaltyPointsRedeemed)) {
        pointsRedeemedCount = Number(loyaltyPointsRedeemed);
        user.loyaltyPoints -= pointsRedeemedCount;
        await user.save();

        await LoyaltyTransaction.create({
          user: req.user._id,
          type: 'redeemed',
          points: -pointsRedeemedCount,
          balanceAfter: user.loyaltyPoints,
          description: `Redeemed ${pointsRedeemedCount} points at checkout`,
        });
      }
    }

    // 3. Calculate points earned on this order (1.5x of total paid)
    const pointsEarned = Math.round(Number(totalPrice) * 1.5);
    const user = await User.findById(req.user._id);
    if (user) {
      user.loyaltyPoints = (user.loyaltyPoints || 0) + pointsEarned;
      await user.save();

      await LoyaltyTransaction.create({
        user: req.user._id,
        type: 'earned',
        points: pointsEarned,
        balanceAfter: user.loyaltyPoints,
        description: `Earned ${pointsEarned} loyalty points from order purchase`,
      });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Stripe',
      itemsPrice: Number(itemsPrice) || 0,
      taxPrice: Number(taxPrice) || 0,
      shippingPrice: Number(shippingPrice) || 0,
      discountPrice: Number(discountPrice) || 0,
      totalPrice: Number(totalPrice) || 0,
      giftCardCode: giftCardCode || '',
      giftCardAmount: appliedGiftCardAmount,
      loyaltyPointsRedeemed: pointsRedeemedCount,
      loyaltyPointsEarned: pointsEarned,
      carrier: 'FedEx Express',
      trackingNumber: 'PH-' + Math.floor(10000000 + Math.random() * 90000000),
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      orderStatus: 'Pending',
      isPaid: paymentMethod === 'Cash on Delivery' ? false : false,
      trackingHistory: [
        {
          status: 'Order Placed',
          timestamp: new Date(),
          description: 'Your order has been placed and received by our system.',
          location: 'Fulfillment Hub, Warehouse A',
        },
      ],
    });

    const createdOrder = await order.save();

    // Trigger admin notification for new order
    await createNotification({
      title: 'New Order Received',
      message: `Order #${createdOrder._id.toString().slice(-6)} placed by ${shippingAddress.fullName || req.user.name} ($${createdOrder.totalPrice.toFixed(2)})`,
      type: 'order',
      link: '/admin?tab=orders',
      metadata: { orderId: createdOrder._id, amount: createdOrder.totalPrice },
    });

    // Customer In-App Notification
    await CustomerNotification.create({
      user: req.user._id,
      title: 'Order Confirmed! 📦',
      message: `Your order #${createdOrder._id.toString().slice(-6)} has been placed! Tracking number: ${createdOrder.trackingNumber} via ${createdOrder.carrier}.`,
      type: 'order',
      link: `/track-order/${createdOrder._id}`,
    });

    res.status(201).json({
      success: true,
      data: createdOrder,
      message: 'Order created successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.book', 'title author image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('orderItems.book', 'title author image price');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify authorized user or admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order (if eligible: Pending or Confirmed)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    if (order.orderStatus !== 'Pending' && order.orderStatus !== 'Confirmed') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in "${order.orderStatus}" stage. Please contact support.`,
      });
    }

    // Restock books
    for (const item of order.orderItems) {
      const book = await Book.findById(item.book);
      if (book) {
        book.stock += item.qty;
        await book.save();
      }
    }

    order.orderStatus = 'Cancelled';
    order.trackingHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      description: 'Order was cancelled by the customer/admin.',
    });

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Order has been cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.orderStatus = status;
    }

    if (search && search.trim() !== '') {
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        query._id = search;
      } else {
        query['shippingAddress.fullName'] = { $regex: search, $options: 'i' };
      }
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status & tracking (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    const status = req.body.status || req.body.orderStatus;
    const { note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const validStatuses = [
      'Pending',
      'Confirmed',
      'Processing',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
      'Returned',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = status;

    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
      if (order.paymentMethod === 'Cash on Delivery') {
        order.isPaid = true;
        order.paidAt = Date.now();
      }
    }

    if (status === 'Returned') {
      // Restock books
      for (const item of order.orderItems) {
        const book = await Book.findById(item.book);
        if (book) {
          book.stock += item.qty;
          await book.save();
        }
      }
    }

    const statusDescriptions = {
      Pending: 'Order is under review.',
      Confirmed: 'Order confirmed and scheduled for packaging.',
      Processing: 'Items are being packed at our central fulfillment warehouse.',
      Shipped: 'Package has been dispatched and handed over to courier.',
      'Out for Delivery': 'Package is out for delivery with our local delivery agent.',
      Delivered: 'Package has been delivered to recipient.',
      Cancelled: 'Order has been cancelled.',
      Returned: 'Order items returned to inventory.',
    };

    order.trackingHistory.push({
      status: status,
      timestamp: new Date(),
      description: note || statusDescriptions[status] || `Status updated to ${status}`,
    });

    const updatedOrder = await order.save();

    // Customer In-App Notification
    await CustomerNotification.create({
      user: order.user,
      title: `Order Update: ${status}`,
      message: `Your order #${order._id.toString().slice(-6)} is now ${status}. ${note || statusDescriptions[status] || ''}`,
      type: 'order',
      link: `/track-order/${order._id}`,
    });

    await logAdminActivity({
      req,
      action: 'UPDATE_ORDER_STATUS',
      module: 'orders',
      details: `Order #${order._id} status changed from "${previousStatus}" to "${status}"`,
      targetId: order._id.toString(),
      previousValue: { status: previousStatus },
      updatedValue: { status },
    });

    res.json({
      success: true,
      data: updatedOrder,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Track order publicly or by ID
// @route   GET /api/orders/track/:id
// @access  Public
const trackOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid Order ID format' });
    }

    const order = await Order.findById(orderId)
      .populate('orderItems.book', 'title author image')
      .select('orderStatus trackingHistory shippingAddress createdAt deliveredAt isPaid paymentMethod totalPrice orderItems');

    if (!order) {
      return res.status(404).json({ success: false, message: 'No order found with this tracking ID' });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getOrders,
  updateOrderStatus,
  trackOrder,
};
