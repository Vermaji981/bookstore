const GiftCard = require('../models/GiftCard');

// Helper to generate a friendly 16-character code e.g. "PAGE-9X72-K4M8-B291"
const generateGiftCardCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let segs = [];
  for (let i = 0; i < 3; i++) {
    let seg = '';
    for (let j = 0; j < 4; j++) {
      seg += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segs.push(seg);
  }
  return `PAGE-${segs.join('-')}`;
};

// @desc    Check Gift Card balance & validity
// @route   POST /api/giftcards/check
// @access  Public
const checkGiftCardBalance = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a gift card code' });
    }

    const cleanCode = code.trim().toUpperCase();
    const giftCard = await GiftCard.findOne({ code: cleanCode });

    if (!giftCard) {
      return res.status(404).json({ success: false, message: 'Invalid gift card code' });
    }

    if (!giftCard.isActive) {
      return res.status(400).json({ success: false, message: 'This gift card has been deactivated' });
    }

    if (new Date() > new Date(giftCard.expiryDate)) {
      return res.status(400).json({ success: false, message: 'This gift card has expired' });
    }

    if (giftCard.currentBalance <= 0) {
      return res.status(400).json({ success: false, message: 'This gift card has a $0.00 balance' });
    }

    res.json({
      success: true,
      data: {
        code: giftCard.code,
        currentBalance: giftCard.currentBalance,
        expiryDate: giftCard.expiryDate,
        recipientName: giftCard.recipientName,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create / Purchase a new Gift Card
// @route   POST /api/giftcards
// @access  Private
const createGiftCard = async (req, res) => {
  try {
    const { initialBalance, recipientEmail, recipientName, message, expiryMonths } = req.body;

    if (!initialBalance || Number(initialBalance) < 5) {
      return res.status(400).json({ success: false, message: 'Gift card balance must be at least $5' });
    }

    const code = generateGiftCardCode();
    const months = expiryMonths || 12;
    const expiryDate = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000);

    const giftCard = await GiftCard.create({
      code,
      initialBalance: Number(initialBalance),
      currentBalance: Number(initialBalance),
      recipientEmail: recipientEmail || '',
      recipientName: recipientName || '',
      message: message || '',
      expiryDate,
      createdBy: req.user?._id,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: `Gift card ${code} created successfully with balance $${initialBalance}`,
      data: giftCard,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Get all gift cards
// @route   GET /api/giftcards/admin/all
// @access  Private / Admin
const getAdminGiftCards = async (req, res) => {
  try {
    const giftCards = await GiftCard.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: giftCards,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Toggle Gift Card Status
// @route   PUT /api/giftcards/admin/:id/toggle
// @access  Private / Admin
const toggleGiftCardStatus = async (req, res) => {
  try {
    const giftCard = await GiftCard.findById(req.params.id);
    if (!giftCard) {
      return res.status(404).json({ success: false, message: 'Gift card not found' });
    }

    giftCard.isActive = !giftCard.isActive;
    await giftCard.save();

    res.json({
      success: true,
      message: `Gift card status updated to ${giftCard.isActive ? 'Active' : 'Inactive'}`,
      data: giftCard,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  checkGiftCardBalance,
  createGiftCard,
  getAdminGiftCards,
  toggleGiftCardStatus,
};

