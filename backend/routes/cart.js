import express from 'express';
import Cart from '../models/cart.js';
import Product from '../models/product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All cart routes require user to be authenticated
router.use(protect);

// @desc    Get user's shopping cart
// @route   GET /api/cart
// @access  Private
router.get('/', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price originalPrice image brand stock',
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json({
      status: 'success',
      data: cart,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1, color = 'Default', size = 'M' } = req.body;

    if (!productId) {
      return res.status(400).json({ status: 'fail', message: 'Product ID is required' });
    }

    // Check if product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if same product with same size and color already in cart
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        product: productId,
        quantity: Number(quantity),
        color,
        size,
      });
    }

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name price originalPrice image brand stock',
    });

    res.status(200).json({
      status: 'success',
      message: 'Item added to cart',
      data: cart,
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
router.put('/:itemId', async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (quantity === undefined || Number(quantity) < 1) {
      return res.status(400).json({ status: 'fail', message: 'Valid quantity (>= 1) is required' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ status: 'fail', message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ status: 'fail', message: 'Item not found in cart' });
    }

    item.quantity = Number(quantity);
    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name price originalPrice image brand stock',
    });

    res.json({
      status: 'success',
      message: 'Cart updated',
      data: cart,
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Remove single item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
router.delete('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ status: 'fail', message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name price originalPrice image brand stock',
    });

    res.json({
      status: 'success',
      message: 'Item removed from cart',
      data: cart,
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
router.delete('/', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.json({
      status: 'success',
      message: 'Cart cleared successfully',
      data: cart || { items: [] },
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
