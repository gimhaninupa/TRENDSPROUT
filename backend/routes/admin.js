import express from 'express';
import User from '../models/user.js';
import Product from '../models/product.js';
import Order from '../models/order.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Restrict all admin routes to authenticated admins
router.use(protect, restrictTo('admin'));

// @desc    Get platform-wide admin metrics and health
// @route   GET /api/admin/metrics
// @access  Private (Admin)
router.get('/metrics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const orders = await Order.find({ paymentStatus: 'Paid' });
    const totalGMV = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    const pendingVendors = await User.find({ role: 'vendor', isVerified: false }).select(
      'username email phone vendorStore createdAt'
    );

    const recentOrders = await Order.find()
      .populate('customer', 'username email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      status: 'success',
      data: {
        totalUsers,
        totalCustomers,
        totalVendors,
        totalProducts,
        totalOrders,
        totalGMV,
        pendingVendors,
        recentOrders,
      },
    });
  } catch (error) {
    console.error('Admin metrics fetch error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Get all vendors
// @route   GET /api/admin/vendors
// @access  Private (Admin)
router.get('/vendors', async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' }).select('-password');
    res.json({
      status: 'success',
      results: vendors.length,
      data: vendors,
    });
  } catch (error) {
    console.error('Admin vendors fetch error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Approve or verify a vendor
// @route   PUT /api/admin/vendors/:id/verify
// @access  Private (Admin)
router.put('/vendors/:id/verify', async (req, res) => {
  try {
    const { isVerified = true } = req.body;
    const vendor = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      { new: true }
    ).select('-password');

    if (!vendor) {
      return res.status(404).json({ status: 'fail', message: 'Vendor not found' });
    }

    res.json({
      status: 'success',
      message: `Vendor ${isVerified ? 'verified' : 'suspended'} successfully`,
      data: vendor,
    });
  } catch (error) {
    console.error('Vendor verification error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
