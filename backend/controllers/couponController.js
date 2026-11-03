const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
const { logAdminActivity } = require('../utils/logger');

// @desc    Get All Coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      query.$or = [
        { code: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (status === 'active') {
      query.isActive = true;
      query.expiryDate = { $gte: new Date() };
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (status === 'expired') {
      query.expiryDate = { $lt: new Date() };
    }

    const coupons = await Coupon.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: coupons,
      count: coupons.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create New Coupon (Admin)
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      usageLimit,
      isActive,
    } = req.body;

    const discountValue = req.body.discountValue !== undefined ? req.body.discountValue : req.body.discountAmount;
    const expiryDate = req.body.expiryDate || req.body.expiresAt;
    const minOrderAmount = req.body.minOrderAmount !== undefined ? req.body.minOrderAmount : (req.body.minPurchase || 0);
    const maxDiscount = req.body.maxDiscount !== undefined ? req.body.maxDiscount : req.body.maxDiscountAmount;

    if (!code || discountValue === undefined || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide coupon code, discount value, and expiry date',
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Coupon code "${cleanCode}" already exists`,
      });
    }

    const coupon = await Coupon.create({
      code: cleanCode,
      description: description || '',
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscount: Number(maxDiscount) || 0,
      expiryDate: new Date(expiryDate),
      usageLimit: Number(usageLimit) || 100,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    await logAdminActivity({
      req,
      action: 'CREATE_COUPON',
      module: 'coupons',
      details: `Created discount coupon code "${cleanCode}" (${coupon.discountValue}${coupon.discountType === 'percentage' ? '%' : '$'} off)`,
      targetId: coupon._id.toString(),
      updatedValue: coupon.toObject(),
    });

    res.status(201).json({
      success: true,
      data: coupon,
      message: `Coupon "${cleanCode}" created successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Coupon (Admin)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Coupon ID' });
    }

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const previousValue = coupon.toObject();

    if (req.body.code) {
      const cleanCode = req.body.code.trim().toUpperCase();
      const codeExists = await Coupon.findOne({
        code: cleanCode,
        _id: { $ne: coupon._id },
      });
      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: `Coupon code "${cleanCode}" is already used by another coupon`,
        });
      }
      coupon.code = cleanCode;
    }

    if (req.body.description !== undefined) coupon.description = req.body.description;
    if (req.body.discountType) coupon.discountType = req.body.discountType;
    if (req.body.discountValue !== undefined) coupon.discountValue = Number(req.body.discountValue);
    if (req.body.minOrderAmount !== undefined) coupon.minOrderAmount = Number(req.body.minOrderAmount);
    if (req.body.maxDiscount !== undefined) coupon.maxDiscount = Number(req.body.maxDiscount);
    if (req.body.expiryDate) coupon.expiryDate = new Date(req.body.expiryDate);
    if (req.body.usageLimit !== undefined) coupon.usageLimit = Number(req.body.usageLimit);
    if (req.body.isActive !== undefined) coupon.isActive = Boolean(req.body.isActive);

    const updated = await coupon.save();

    await logAdminActivity({
      req,
      action: 'UPDATE_COUPON',
      module: 'coupons',
      details: `Updated coupon "${updated.code}"`,
      targetId: updated._id.toString(),
      previousValue,
      updatedValue: updated.toObject(),
    });

    res.json({
      success: true,
      data: updated,
      message: 'Coupon updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Coupon ID' });
    }

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    await logAdminActivity({
      req,
      action: 'DELETE_COUPON',
      module: 'coupons',
      details: `Deleted coupon code "${coupon.code}"`,
      targetId: coupon._id.toString(),
      previousValue: coupon.toObject(),
    });

    res.json({ success: true, message: `Coupon "${coupon.code}" removed successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate Coupon for Customer Checkout
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code' });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    const validation = coupon.isValid(Number(orderAmount) || 0);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const discount = coupon.calculateDiscount(Number(orderAmount) || 0);

    res.json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
      },
      message: `Coupon "${coupon.code}" applied! You save $${discount.toFixed(2)}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};
