const ReturnRequest = require('../models/ReturnRequest');
const Order = require('../models/Order');

// @desc    Customer: Submit a return/replacement/refund request
// @route   POST /api/returns/request
// @access  Private
const createReturnRequest = async (req, res) => {
  try {
    const { orderId, items, requestType, reason, explanation, images } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Not authorized for this order' });
    }

    // Verify order eligibility (Delivered status)
    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'Returns can only be requested for delivered orders',
      });
    }

    // Check if return request already exists
    const existing = await ReturnRequest.findOne({ order: orderId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A return request is already active for this order (Status: ${existing.status})`,
      });
    }

    // Calculate requested refund amount based on items
    let calculatedRefund = 0;
    const returnItems = items.map((it) => {
      const match = order.orderItems.find((oi) => oi.book.toString() === it.bookId || oi._id.toString() === it.bookId);
      const price = match ? match.price : (it.price || 0);
      const qty = it.qty || 1;
      calculatedRefund += price * qty;
      return {
        book: match ? match.book : it.bookId,
        title: match ? match.title : (it.title || 'Book item'),
        qty,
        price,
      };
    });

    const returnRequest = await ReturnRequest.create({
      order: orderId,
      user: req.user._id,
      items: returnItems,
      requestType: requestType || 'return',
      reason,
      explanation,
      images: images || [],
      refundAmount: Number(calculatedRefund.toFixed(2)),
      status: 'Requested',
      pickupTracking: {
        carrier: 'FedEx Express',
        trackingNumber: 'RET-' + Math.floor(10000000 + Math.random() * 90000000),
      },
      history: [
        {
          status: 'Requested',
          comment: `Customer initiated ${requestType || 'return'} request. Reason: ${reason}`,
          updatedBy: req.user._id,
          date: new Date(),
        },
      ],
    });

    // Update order return status
    order.returnStatus = 'requested';
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Return request submitted successfully. Our support team will review within 24 hours.',
      data: returnRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Customer: Get my return requests
// @route   GET /api/returns/my
// @access  Private
const getMyReturns = async (req, res) => {
  try {
    const returns = await ReturnRequest.find({ user: req.user._id })
      .populate('order', 'orderItems totalPrice createdAt orderStatus')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: returns,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Get all return requests with filters
// @route   GET /api/returns/admin/all
// @access  Private / Admin
const getAdminReturns = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'All') {
      query.status = status;
    }

    const returns = await ReturnRequest.find(query)
      .populate('user', 'name email phone')
      .populate('order', 'orderItems totalPrice paymentMethod')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: returns,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Update Return Request Status & Process Action
// @route   PUT /api/returns/admin/:id/status
// @access  Private / Admin
const updateReturnStatus = async (req, res) => {
  try {
    const { status, adminNotes, refundAmount } = req.body;
    const returnReq = await ReturnRequest.findById(req.params.id);

    if (!returnReq) {
      return res.status(404).json({ success: false, message: 'Return request not found' });
    }

    returnReq.status = status;
    if (adminNotes) returnReq.adminNotes = adminNotes;
    if (refundAmount !== undefined) returnReq.refundAmount = Number(refundAmount);

    returnReq.history.push({
      status,
      comment: adminNotes || `Status updated to ${status} by admin`,
      updatedBy: req.user._id,
      date: new Date(),
    });

    await returnReq.save();

    // Sync with order
    const order = await Order.findById(returnReq.order);
    if (order) {
      if (status === 'Approved') order.returnStatus = 'approved';
      else if (status === 'Rejected') order.returnStatus = 'rejected';
      else if (status === 'Pickup Scheduled') order.returnStatus = 'pickup_scheduled';
      else if (status === 'Refunded' || status === 'Completed') {
        order.returnStatus = 'completed';
        order.refundStatus = 'refunded';
        order.refundAmount = returnReq.refundAmount;
        order.refundedAt = new Date();
      }
      await order.save();
    }

    res.json({
      success: true,
      message: `Return request updated to "${status}"`,
      data: returnReq,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReturnRequest,
  getMyReturns,
  getAdminReturns,
  updateReturnStatus,
};

