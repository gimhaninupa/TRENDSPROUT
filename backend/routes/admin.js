import express from 'express';
import User from '../models/user.js';
import Product from '../models/product.js';
import Order from '../models/order.js';
import Payout from '../models/payout.js';
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

// @desc    Get all platform orders for admin
// @route   GET /api/admin/orders
// @access  Private (Admin)
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'username email phone')
      .populate('items.product', 'name price image brand')
      .populate('items.vendor', 'username email vendorStore')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      results: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Admin orders fetch error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private (Admin)
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const update = {};
    if (orderStatus) update.orderStatus = orderStatus;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('customer', 'username email')
      .populate('items.product', 'name price image');

    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Order not found' });
    }

    res.json({
      status: 'success',
      message: 'Order updated successfully',
      data: order,
    });
  } catch (error) {
    console.error('Admin order status error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Get all products across vendors for admin
// @route   GET /api/admin/products
// @access  Private (Admin)
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find()
      .populate('vendor', 'username email vendorStore')
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      results: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Admin products fetch error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Delete product by admin
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin)
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found' });
    }
    res.json({
      status: 'success',
      message: 'Product removed by admin moderation',
    });
  } catch (error) {
    console.error('Admin delete product error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Get all users (customers, vendors, admins)
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      status: 'success',
      results: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'vendor', 'admin'].includes(role)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }
    res.json({
      status: 'success',
      message: `User role changed to ${role}`,
      data: user,
    });
  } catch (error) {
    console.error('Admin user role error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }
    res.json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Admin user delete error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Get all vendor payout requests for admin settlement
// @route   GET /api/admin/payouts
// @access  Private (Admin)
router.get('/payouts', async (req, res) => {
  try {
    const payouts = await Payout.find()
      .populate('vendor', 'username email vendorStore')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      results: payouts.length,
      data: payouts,
    });
  } catch (error) {
    console.error('Admin payouts fetch error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Approve, Process, or Reject a Vendor Payout
// @route   PUT /api/admin/payouts/:id/status
// @access  Private (Admin)
router.put('/payouts/:id/status', async (req, res) => {
  try {
    const { status, referenceNumber, notes } = req.body;
    const updatePayload = { status, notes };
    if (referenceNumber) updatePayload.referenceNumber = referenceNumber;
    if (status === 'Completed') updatePayload.processedAt = new Date();

    const payout = await Payout.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true }
    ).populate('vendor', 'username email vendorStore');

    if (!payout) {
      return res.status(404).json({ status: 'fail', message: 'Payout request not found' });
    }

    res.json({
      status: 'success',
      message: `Payout marked as ${status}`,
      data: payout,
    });
  } catch (error) {
    console.error('Admin payout status error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
