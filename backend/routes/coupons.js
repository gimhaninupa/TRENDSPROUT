import express from 'express';
import Coupon from '../models/coupon.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all active coupons
// @route   GET /api/coupons
// @access  Public
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    res.json({
      status: 'success',
      results: coupons.length,
      data: coupons,
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Validate and apply a coupon to an order amount
// @route   POST /api/coupons/apply
// @access  Public / Private
router.post('/apply', async (req, res) => {
  try {
    const { code, orderAmount = 0 } = req.body;

    if (!code) {
      return res.status(400).json({ status: 'fail', message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) {
      return res.status(404).json({ status: 'fail', message: 'Invalid promo code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ status: 'fail', message: 'This coupon is no longer active' });
    }

    if (new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ status: 'fail', message: 'This coupon has expired' });
    }

    const amount = Number(orderAmount);
    if (amount < coupon.minOrderAmount) {
      return res.status(400).json({
        status: 'fail',
        message: `Minimum order amount of LKR ${coupon.minOrderAmount.toLocaleString()} required to use this coupon`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((amount * coupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(amount, coupon.discountValue);
    }

    const finalAmount = Math.max(0, amount - discountAmount);

    res.json({
      status: 'success',
      message: 'Coupon applied successfully',
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        originalAmount: amount,
        finalAmount,
      },
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Create new coupon (Admin only)
// @route   POST /api/coupons
// @access  Private (Admin)
router.post('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, expiresAt } = req.body;

    if (!code || !discountType || discountValue === undefined || !expiresAt) {
      return res.status(400).json({ status: 'fail', message: 'Please provide all required coupon fields' });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ status: 'fail', message: 'Coupon with this code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount || 0),
      expiresAt: new Date(expiresAt),
      isActive: true,
    });

    res.status(201).json({
      status: 'success',
      message: 'Coupon created',
      data: coupon,
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
