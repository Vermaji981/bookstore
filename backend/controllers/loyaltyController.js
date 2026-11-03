const User = require('../models/User');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');

// Helper to calculate tier
const calculateTier = (points) => {
  if (points >= 1500) return 'Platinum';
  if (points >= 800) return 'Gold';
  if (points >= 300) return 'Silver';
  return 'Bronze';
};

// @desc    Customer: Get my loyalty profile, balance, tier, and history
// @route   GET /api/loyalty/me
// @access  Private
const getMyLoyalty = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'name email loyaltyPoints loyaltyTier referralCode referredBy'
    );

    // Calculate current accurate tier
    const accurateTier = calculateTier(user.loyaltyPoints || 0);
    if (user.loyaltyTier !== accurateTier) {
      user.loyaltyTier = accurateTier;
      await user.save();
    }

    const history = await LoyaltyTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    // Count invited friends
    const friendsInvited = await User.countDocuments({ referredBy: req.user._id });

    // Tier perks description
    const perks = {
      Bronze: '1x Points on all purchases | Birthday gift voucher',
      Silver: '1.25x Points multiplier | Free standard shipping above $25',
      Gold: '1.5x Points multiplier | Free expedited shipping | Early access to book sales',
      Platinum: '2x Points multiplier | Free 2-day delivery on all orders | VIP signed editions',
    };

    res.json({
      success: true,
      data: {
        points: user.loyaltyPoints || 0,
        tier: user.loyaltyTier,
        tierPerks: perks[user.loyaltyTier] || perks.Bronze,
        referralCode: user.referralCode,
        referralLink: `${req.protocol}://${req.get('host')}/signup?ref=${user.referralCode}`,
        friendsInvited,
        // Conversion: 100 points = $5.00 discount
        monetaryValue: Number(((user.loyaltyPoints || 0) * 0.05).toFixed(2)),
        history,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate points redemption for checkout
// @route   POST /api/loyalty/redeem-estimate
// @access  Private
const estimatePointsRedemption = async (req, res) => {
  try {
    const { pointsToRedeem, orderSubtotal } = req.body;
    const user = await User.findById(req.user._id);

    if (!pointsToRedeem || Number(pointsToRedeem) <= 0) {
      return res.status(400).json({ success: false, message: 'Points must be greater than 0' });
    }

    if (Number(pointsToRedeem) > (user.loyaltyPoints || 0)) {
      return res.status(400).json({
        success: false,
        message: `You only have ${user.loyaltyPoints || 0} points available`,
      });
    }

    // 100 points = $5.00 ($0.05 per point)
    const discountAmount = Number((Number(pointsToRedeem) * 0.05).toFixed(2));
    const cappedDiscount = Math.min(discountAmount, orderSubtotal || discountAmount);

    res.json({
      success: true,
      data: {
        pointsToRedeem: Number(pointsToRedeem),
        discountAmount: cappedDiscount,
        remainingPoints: (user.loyaltyPoints || 0) - Number(pointsToRedeem),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Adjust user points manually
// @route   POST /api/loyalty/admin/adjust
// @access  Private / Admin
const adminAdjustPoints = async (req, res) => {
  try {
    const { userId, points, description } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const adjustment = Number(points);
    user.loyaltyPoints = Math.max(0, (user.loyaltyPoints || 0) + adjustment);
    user.loyaltyTier = calculateTier(user.loyaltyPoints);
    await user.save();

    await LoyaltyTransaction.create({
      user: user._id,
      type: 'adjustment',
      points: adjustment,
      balanceAfter: user.loyaltyPoints,
      description: description || `Admin adjustment of ${adjustment} points`,
    });

    res.json({
      success: true,
      message: `Adjusted points by ${adjustment}. New balance: ${user.loyaltyPoints}`,
      data: {
        userId: user._id,
        newPoints: user.loyaltyPoints,
        newTier: user.loyaltyTier,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Get all loyalty data, tier breakdown, and audit transactions
// @route   GET /api/loyalty/admin/summary
// @access  Private / Admin
const getAdminLoyaltySummary = async (req, res) => {
  try {
    const users = await User.find({ loyaltyPoints: { $gt: 0 } })
      .select('name email loyaltyPoints loyaltyTier referralCode createdAt')
      .sort({ loyaltyPoints: -1 })
      .limit(50);

    const transactions = await LoyaltyTransaction.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(40);

    const totalPointsIssued = await LoyaltyTransaction.aggregate([
      { $match: { points: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$points' } } },
    ]);

    const totalPointsRedeemed = await LoyaltyTransaction.aggregate([
      { $match: { points: { $lt: 0 } } },
      { $group: { _id: null, total: { $sum: '$points' } } },
    ]);

    const tiers = await User.aggregate([
      { $group: { _id: '$loyaltyTier', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        users,
        transactions,
        stats: {
          totalIssued: totalPointsIssued[0]?.total || 0,
          totalRedeemed: Math.abs(totalPointsRedeemed[0]?.total || 0),
          tiers: tiers.reduce((acc, t) => ({ ...acc, [t._id || 'Bronze']: t.count }), {}),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyLoyalty,
  estimatePointsRedemption,
  adminAdjustPoints,
  getAdminLoyaltySummary,
};
