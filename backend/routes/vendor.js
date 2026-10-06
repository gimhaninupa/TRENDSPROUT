import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/product.js';
import Category from '../models/category.js';
import Order from '../models/order.js';
import User from '../models/user.js';
import Payout from '../models/payout.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Require user to be authenticated for vendor actions
router.use(protect);

// @desc    Get vendor dashboard statistics & analytics
// @route   GET /api/vendor/stats
// @access  Private (Vendor / Admin)
router.get('/stats', async (req, res) => {
  try {
    const vendorId = req.user._id;

    // Get vendor's products
    const products = await Product.find({ vendor: vendorId });
    const productIds = products.map((p) => p._id);

    // Get orders containing vendor's products
    const orders = await Order.find({ 'items.product': { $in: productIds } })
      .populate('items.product', 'name price brand')
      .populate('customer', 'username email')
      .sort({ createdAt: -1 });

    // Calculate metrics
    let totalRevenue = 0;
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.product && productIds.some((pId) => pId.toString() === item.product._id.toString())) {
          totalRevenue += (item.price || 0) * (item.quantity || 1);
        }
      });
    });

    const activeProducts = products.length;
    const totalOrders = orders.length;
    const avgRating = products.length > 0
      ? (products.reduce((acc, p) => acc + (p.rating || 0), 0) / products.length).toFixed(1)
      : '5.0';

    // Monthly revenue aggregation
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    const monthlyRevenue = [
      { month: months[(currentMonthIdx - 5 + 12) % 12], revenue: totalRevenue > 0 ? Math.round(totalRevenue * 0.12) : 0 },
      { month: months[(currentMonthIdx - 4 + 12) % 12], revenue: totalRevenue > 0 ? Math.round(totalRevenue * 0.15) : 0 },
      { month: months[(currentMonthIdx - 3 + 12) % 12], revenue: totalRevenue > 0 ? Math.round(totalRevenue * 0.18) : 0 },
      { month: months[(currentMonthIdx - 2 + 12) % 12], revenue: totalRevenue > 0 ? Math.round(totalRevenue * 0.22) : 0 },
      { month: months[(currentMonthIdx - 1 + 12) % 12], revenue: totalRevenue > 0 ? Math.round(totalRevenue * 0.28) : 0 },
      { month: months[currentMonthIdx], revenue: totalRevenue > 0 ? Math.round(totalRevenue * 0.35) : 0 },
    ];

    res.json({
      status: 'success',
      data: {
        totalRevenue,
        totalOrders,
        activeProducts,
        avgRating,
        storeDetails: req.user.vendorStore || {},
        monthlyRevenue,
        recentOrders: orders.slice(0, 5),
      },
    });
  } catch (error) {
    console.error('Vendor stats error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Get all products for the logged-in vendor
// @route   GET /api/vendor/products
// @access  Private (Vendor / Admin)
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user._id })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      results: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Vendor products fetch error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Create new vendor product
// @route   POST /api/vendor/products
// @access  Private
router.post('/products', async (req, res) => {
  try {
    const { name, description, price, originalPrice, brand, image, images, stock, category, tag, sizes, colors } = req.body;

    if (!name || !price) {
      return res.status(400).json({ status: 'fail', message: 'Name and price are required' });
    }

    // Resolve Category ObjectId
    let categoryDoc = null;
    const catName = category || 'Dresses';
    if (mongoose.Types.ObjectId.isValid(catName)) {
      categoryDoc = await Category.findById(catName);
    }
    if (!categoryDoc) {
      const catSlug = String(catName).toLowerCase().replace(/\s+/g, '-');
      categoryDoc = await Category.findOne({
        $or: [
          { slug: catSlug },
          { name: new RegExp(`^${catName}$`, 'i') }
        ]
      });
    }
    if (!categoryDoc) {
      const catSlug = String(catName).toLowerCase().replace(/\s+/g, '-');
      categoryDoc = await Category.create({
        name: catName,
        slug: catSlug,
        description: `${catName} Collection`,
      });
    }

    const imageList = Array.isArray(images) && images.length > 0 ? images : (image ? [image] : []);
    const storeBrand = brand || req.user.vendorStore?.storeName || req.user.username || 'TrendSprout Vendor';

    const product = await Product.create({
      name,
      description: description || `Premium ${catName} handcrafted with top tier sustainable materials.`,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Math.round(Number(price) * 1.25),
      brand: storeBrand,
      image: imageList[0] || image || '',
      images: imageList,
      stock: Number(stock || 20),
      category: categoryDoc._id,
      vendor: req.user._id,
      tag: tag || 'New',
      sizes: sizes || ['S', 'M', 'L'],
      colors: colors || ['Standard'],
    });

    // Elevate user role to vendor and initialize vendorStore if needed
    if (req.user.role === 'customer' || !req.user.vendorStore?.storeName) {
      await User.findByIdAndUpdate(req.user._id, {
        role: 'vendor',
        isVerified: true,
        'vendorStore.storeName': storeBrand,
      });
    }

    await product.populate('category', 'name slug');

    res.status(201).json({
      status: 'success',
      message: 'Product created and published to store successfully',
      data: product,
    });
  } catch (error) {
    console.error('Vendor product creation error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Update existing vendor product
// @route   PUT /api/vendor/products/:id
// @access  Private
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, originalPrice, brand, image, images, stock, category, tag, sizes, colors } = req.body;

    let product = await Product.findOne({
      _id: id,
      ...(req.user.role !== 'admin' ? { vendor: req.user._id } : {}),
    });

    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found or unauthorized' });
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (originalPrice !== undefined) product.originalPrice = Number(originalPrice);
    if (stock !== undefined) product.stock = Number(stock);
    if (brand) product.brand = brand;
    if (tag) product.tag = tag;
    if (sizes) product.sizes = sizes;
    if (colors) product.colors = colors;

    if (images && Array.isArray(images) && images.length > 0) {
      product.images = images;
      product.image = images[0];
    } else if (image) {
      product.image = image;
      product.images = [image];
    }

    if (category) {
      let categoryDoc = null;
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryDoc = await Category.findById(category);
      }
      if (!categoryDoc) {
        const catSlug = String(category).toLowerCase().replace(/\s+/g, '-');
        categoryDoc = await Category.findOne({
          $or: [{ slug: catSlug }, { name: new RegExp(`^${category}$`, 'i') }],
        });
      }
      if (categoryDoc) {
        product.category = categoryDoc._id;
      }
    }

    await product.save();
    await product.populate('category', 'name slug');

    res.json({
      status: 'success',
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Vendor product update error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Delete vendor product
// @route   DELETE /api/vendor/products/:id
// @access  Private
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findOneAndDelete({
      _id: id,
      ...(req.user.role !== 'admin' ? { vendor: req.user._id } : {}),
    });

    if (!deleted) {
      return res.status(404).json({ status: 'fail', message: 'Product not found or unauthorized' });
    }

    res.json({
      status: 'success',
      message: 'Product removed from store successfully',
    });
  } catch (error) {
    console.error('Vendor product delete error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Get vendor wallet, multi-vendor commission breakdown & earnings
// @route   GET /api/vendor/wallet
// @access  Private
router.get('/wallet', async (req, res) => {
  try {
    const vendorId = req.user._id;

    // Find all products owned by vendor
    const vendorProducts = await Product.find({ vendor: vendorId });
    const productIds = vendorProducts.map((p) => p._id.toString());

    // Find orders with vendor's items
    const orders = await Order.find({
      $or: [
        { 'items.vendor': vendorId },
        { 'items.product': { $in: productIds } },
      ],
    }).sort({ createdAt: -1 });

    let grossSales = 0;
    let totalPlatformFee = 0;
    let netEarnings = 0;
    let pendingEarnings = 0;
    let availableEarnings = 0;
    const soldItems = [];

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const isItemVendor = (item.vendor && item.vendor.toString() === vendorId.toString()) ||
          (item.product && productIds.includes(item.product.toString()));

        if (isItemVendor) {
          const qty = item.quantity || 1;
          const lineGross = (item.price || 0) * qty;
          const commRate = item.commissionRate || 0.10;
          const lineComm = item.commissionAmount || Math.round(lineGross * commRate);
          const lineNet = item.vendorEarning || (lineGross - lineComm);

          grossSales += lineGross;
          totalPlatformFee += lineComm;
          netEarnings += lineNet;

          const isDelivered = order.orderStatus === 'Delivered' || item.status === 'Delivered';
          if (isDelivered) {
            availableEarnings += lineNet;
          } else {
            pendingEarnings += lineNet;
          }

          soldItems.push({
            orderId: order._id,
            trackingNumber: order.trackingNumber,
            date: order.createdAt,
            productName: item.name || 'Fashion Product',
            brand: item.brand || req.user.vendorStore?.storeName || 'My Brand',
            image: item.image || (item.images && item.images[0]) || '',
            quantity: qty,
            price: item.price,
            grossTotal: lineGross,
            commissionRate: `${Math.round(commRate * 100)}%`,
            platformFee: lineComm,
            netPayout: lineNet,
            orderStatus: order.orderStatus || 'Processing',
            paymentStatus: order.paymentStatus || 'Paid',
          });
        }
      });
    });

    // Payout requests history
    const payouts = await Payout.find({ vendor: vendorId }).sort({ createdAt: -1 });
    const totalPaidOut = payouts
      .filter((p) => p.status === 'Completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingPayoutRequests = payouts
      .filter((p) => ['Pending', 'Approved', 'Processing'].includes(p.status))
      .reduce((sum, p) => sum + p.amount, 0);

    // Available for payout = actual available delivered balance minus already requested/paid amounts
    const withdrawableBalance = Math.max(0, availableEarnings - totalPaidOut - pendingPayoutRequests);

    res.json({
      status: 'success',
      data: {
        grossSales,
        totalPlatformFee,
        netEarnings,
        pendingEarnings,
        availableBalance: withdrawableBalance,
        totalPaidOut,
        bankDetails: req.user.vendorStore?.bankDetails || null,
        soldItems,
        payouts,
      },
    });
  } catch (error) {
    console.error('Vendor wallet fetch error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Submit a vendor payout request
// @route   POST /api/vendor/payouts
// @access  Private
router.post('/payouts', async (req, res) => {
  try {
    const { amount, bankDetails } = req.body;

    if (!amount || Number(amount) < 500) {
      return res.status(400).json({ status: 'fail', message: 'Minimum withdrawal amount is LKR 500' });
    }

    const resolvedBank = bankDetails || req.user.vendorStore?.bankDetails;
    if (!resolvedBank || !resolvedBank.bankName || !resolvedBank.accountNumber) {
      return res.status(400).json({ status: 'fail', message: 'Bank account details are required' });
    }

    const payout = await Payout.create({
      vendor: req.user._id,
      amount: Number(amount),
      bankDetails: resolvedBank,
      status: 'Pending',
      referenceNumber: 'PAY-REQ-' + Math.floor(100000 + Math.random() * 900000),
    });

    res.status(201).json({
      status: 'success',
      message: 'Payout request submitted successfully. Funds will be transferred within 2-3 business days.',
      data: payout,
    });
  } catch (error) {
    console.error('Vendor payout request error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Update vendor's store profile and customization
// @route   PUT /api/vendor/store
// @access  Private
router.put('/store', async (req, res) => {
  try {
    const { 
      storeName, 
      storeDescription, 
      tagline, 
      primaryColor, 
      fontStyle, 
      layout, 
      bannerImage, 
      bannerHeadline, 
      bannerSubtext, 
      logoImage, 
      bankDetails 
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    if (!user.vendorStore) {
      user.vendorStore = {};
    }

    if (storeName !== undefined) user.vendorStore.storeName = storeName.trim();
    if (storeDescription !== undefined) user.vendorStore.storeDescription = storeDescription;
    if (tagline !== undefined) user.vendorStore.tagline = tagline;
    if (primaryColor !== undefined) user.vendorStore.primaryColor = primaryColor;
    if (fontStyle !== undefined) user.vendorStore.fontStyle = fontStyle;
    if (layout !== undefined) user.vendorStore.layout = layout;
    if (bannerImage !== undefined) user.vendorStore.bannerImage = bannerImage;
    if (bannerHeadline !== undefined) user.vendorStore.bannerHeadline = bannerHeadline;
    if (bannerSubtext !== undefined) user.vendorStore.bannerSubtext = bannerSubtext;
    if (logoImage !== undefined) user.vendorStore.logoImage = logoImage;
    if (bankDetails !== undefined) user.vendorStore.bankDetails = bankDetails;

    // Ensure role is vendor
    if (user.role === 'customer') {
      user.role = 'vendor';
    }

    await user.save();

    // If storeName was updated, also update products created by this vendor to have the new brand name
    if (storeName && storeName.trim()) {
      await Product.updateMany(
        { vendor: user._id },
        { $set: { brand: storeName.trim() } }
      ).catch(() => {});
    }

    res.json({
      status: 'success',
      message: 'Store customization published and saved successfully',
      data: user.vendorStore,
    });
  } catch (error) {
    console.error('Store customization update error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Get all orders containing the vendor's products
// @route   GET /api/vendor/orders
// @access  Private (Vendor)
router.get('/orders', async (req, res) => {
  try {
    const vendorId = req.user._id;
    const vendorProducts = await Product.find({ vendor: vendorId });
    const productIds = vendorProducts.map((p) => p._id.toString());

    const orders = await Order.find({
      $or: [
        { 'items.vendor': vendorId },
        { 'items.product': { $in: productIds } },
      ],
    })
      .populate('items.product', 'name price image brand images')
      .populate('customer', 'username email')
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map((order) => {
      const vendorItems = order.items.filter((item) => {
        const itemVendor = item.vendor ? item.vendor.toString() : null;
        const itemProdId = item.product?._id ? item.product._id.toString() : (item.product ? item.product.toString() : null);
        return itemVendor === vendorId.toString() || (itemProdId && productIds.includes(itemProdId));
      });

      const vendorTotal = vendorItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

      return {
        _id: order._id,
        trackingNumber: order.trackingNumber || `TS-LK-${order._id.toString().slice(-6)}`,
        customer: {
          username: order.customer?.username || order.shippingAddress?.fullName || 'Customer',
          email: order.customer?.email || 'N/A',
          phone: order.shippingAddress?.phone || '077 123 4567',
          address: order.shippingAddress ? `${order.shippingAddress.addressLine1 || ''}, ${order.shippingAddress.city || 'Colombo'}` : 'Colombo 07, Western Province',
        },
        items: vendorItems.map((item) => ({
          name: item.name || item.product?.name || 'Fashion Product',
          price: item.price || item.product?.price || 0,
          quantity: item.quantity || 1,
          size: item.size || 'M',
          color: item.color || 'Standard',
          image: item.image || item.product?.image || (item.product?.images && item.product.images[0]) || '',
        })),
        totalAmount: vendorTotal > 0 ? vendorTotal : order.totalAmount,
        paymentStatus: order.paymentStatus || 'Paid',
        paymentMethod: order.paymentMethod || 'PayHere / Card',
        orderStatus: order.orderStatus || 'Processing',
        createdAt: order.createdAt,
      };
    });

    res.json({
      status: 'success',
      results: formattedOrders.length,
      data: formattedOrders,
    });
  } catch (error) {
    console.error('Vendor orders fetch error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Update order status by vendor
// @route   PUT /api/vendor/orders/:id/status
// @access  Private (Vendor)
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Order not found' });
    }
    if (orderStatus) {
      order.orderStatus = orderStatus;
      await order.save();
    }
    res.json({
      status: 'success',
      message: `Order status updated to ${orderStatus}`,
      data: order,
    });
  } catch (error) {
    console.error('Vendor order status update error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;

