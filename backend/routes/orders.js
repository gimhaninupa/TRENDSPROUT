import express from 'express';
import Stripe from 'stripe';
import Order from '../models/order.js';
import Product from '../models/product.js';
import Cart from '../models/cart.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Initialize Stripe Client
let stripeClient = null;
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (secretKey && secretKey.startsWith('sk_')) {
    if (!stripeClient) {
      stripeClient = new Stripe(secretKey);
    }
    return stripeClient;
  }
  return null;
};

// Helper to generate realistic tracking number
const generateTrackingNumber = () => {
  return 'TS-LK-' + Math.floor(100000 + Math.random() * 900000);
};

// @desc    Create Stripe PaymentIntent
// @route   POST /api/orders/create-payment-intent
// @access  Private / Public
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { amount, currency = 'lkr', orderId } = req.body;
    const stripe = getStripe();

    if (!amount || amount <= 0) {
      return res.status(400).json({ status: 'fail', message: 'Valid payment amount is required' });
    }

    if (!stripe) {
      return res.json({
        status: 'success',
        simulated: true,
        clientSecret: 'mock_pi_' + Date.now() + '_secret_' + Math.random().toString(36).substring(7),
        message: 'Stripe simulated mode active. Add STRIPE_SECRET_KEY in backend/.env for live gateway.',
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency: currency.toLowerCase(),
      metadata: {
        orderId: orderId || '',
        userId: req.user._id.toString(),
      },
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      status: 'success',
      simulated: false,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    console.error('Stripe PaymentIntent error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      items,
      totalAmount,
      shippingAddress,
      paymentMethod = 'Card',
      paymentDetails = {},
      paymentStatus = 'Paid',
      clearCart = true,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'No order items provided' });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ status: 'fail', message: 'Valid totalAmount is required' });
    }

    const trackingNumber = generateTrackingNumber();

    const order = await Order.create({
      customer: req.user._id,
      items,
      totalAmount,
      shippingAddress: shippingAddress || {
        street: '123 Galle Road',
        city: 'Colombo',
        state: 'Western',
        zipCode: '00300',
        country: 'Sri Lanka',
      },
      paymentMethod,
      paymentDetails,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : paymentStatus,
      orderStatus: 'Processing',
      trackingNumber,
    });

    // Reduce stock for each product in order
    for (const item of items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -Number(item.quantity || 1) },
        });
      }
    }

    // Clear cart if requested
    if (clearCart) {
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    }

    await order.populate({
      path: 'items.product',
      select: 'name price image brand',
    });

    res.status(201).json({
      status: 'success',
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Process simulated 3D Secure / Card / Gateway payment
// @route   POST /api/orders/process-payment
// @access  Public / Private
router.post('/process-payment', async (req, res) => {
  try {
    const { orderId, paymentMethod = 'Card', cardDetails, slipUrl, amount } = req.body;

    // Simulate 3D Secure failure trigger for testing (card ending in 0002)
    const rawNumber = (cardDetails?.cardNumber || '').replace(/\s+/g, '');
    if (rawNumber.endsWith('0002')) {
      return res.status(402).json({
        status: 'fail',
        message: 'Payment declined by issuing bank (3D Secure verification failed / Card declined).',
        errorCode: 'CARD_DECLINED_3DS_FAIL',
      });
    }

    const transactionId = 'TXN-LK-' + Math.floor(10000000 + Math.random() * 90000000);
    const paidAt = new Date();
    const last4 = rawNumber.slice(-4) || '4242';

    let updatedOrder = null;
    if (orderId && orderId.match(/^[0-9a-fA-F]{24}$/)) {
      updatedOrder = await Order.findById(orderId);
      if (updatedOrder) {
        updatedOrder.paymentMethod = paymentMethod;
        updatedOrder.paymentDetails = {
          transactionId,
          cardLast4: last4,
          cardBrand: cardDetails?.cardBrand || 'Visa',
          slipUrl: slipUrl || '',
          paidAt,
        };
        updatedOrder.paymentStatus = paymentMethod === 'COD' ? 'Pending' : 'Paid';
        await updatedOrder.save();
      }
    }

    res.json({
      status: 'success',
      message: paymentMethod === 'COD' ? 'Cash on Delivery confirmed' : 'Payment authorized and settled successfully',
      data: {
        transactionId,
        paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
        paymentMethod,
        cardLast4: last4,
        cardBrand: cardDetails?.cardBrand || 'Visa',
        paidAt,
        amount: amount || (updatedOrder ? updatedOrder.totalAmount : 0),
        order: updatedOrder,
      },
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price image brand',
      })
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      results: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Get tracking timeline and status for an order
// @route   GET /api/orders/:id/track
// @access  Public / Private (can track by order ID or tracking number)
router.get('/:id/track', async (req, res) => {
  try {
    const { id } = req.params;

    let order;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id).populate({
        path: 'items.product',
        select: 'name price image brand',
      });
    } else {
      order = await Order.findOne({ trackingNumber: id }).populate({
        path: 'items.product',
        select: 'name price image brand',
      });
    }

    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Order not found for tracking' });
    }

    // Build timeline milestones based on order status
    const createdDate = order.createdAt || new Date();
    const timeline = [
      {
        title: 'Order Confirmed',
        desc: 'Your order was placed and verified.',
        completed: true,
        date: createdDate,
      },
      {
        title: 'Processing & Packing',
        desc: 'Vendor is preparing and quality checking your garments.',
        completed: ['Processing', 'Shipped', 'Delivered'].includes(order.orderStatus),
        date: new Date(new Date(createdDate).getTime() + 12 * 3600000),
      },
      {
        title: 'Dispatched / In Transit',
        desc: `Handed over to courier with tracking ${order.trackingNumber}`,
        completed: ['Shipped', 'Delivered'].includes(order.orderStatus),
        date: new Date(new Date(createdDate).getTime() + 36 * 3600000),
      },
      {
        title: 'Out for Delivery',
        desc: 'Courier driver is en route to your shipping address.',
        completed: order.orderStatus === 'Delivered',
        date: new Date(new Date(createdDate).getTime() + 60 * 3600000),
      },
      {
        title: 'Delivered',
        desc: 'Package delivered safely.',
        completed: order.orderStatus === 'Delivered',
        date: order.orderStatus === 'Delivered' ? new Date(new Date(createdDate).getTime() + 72 * 3600000) : null,
      },
    ];

    res.json({
      status: 'success',
      data: {
        orderId: order._id,
        trackingNumber: order.trackingNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        items: order.items,
        timeline,
      },
    });
  } catch (error) {
    console.error('Tracking fetch error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'username email phone')
      .populate({
        path: 'items.product',
        select: 'name price image brand vendor',
        populate: { path: 'vendor', select: 'username storeName' },
      });

    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Order not found' });
    }

    // Only allow customer who placed the order or vendor/admin to view it
    const isOwner = order.customer && order.customer._id.toString() === req.user._id.toString();
    const isStaff = ['vendor', 'admin'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized to view this order' });
    }

    res.json({
      status: 'success',
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Update order status (Vendor & Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private (Vendor / Admin)
router.put('/:id/status', protect, restrictTo('vendor', 'admin'), async (req, res) => {
  try {
    const { orderStatus, paymentStatus, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Order not found' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    await order.save();

    res.json({
      status: 'success',
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
