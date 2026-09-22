import express from 'express';
import Review from '../models/review.js';
import Product from '../models/product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to recalculate product rating average and count
const updateProductStats = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const reviewsCount = reviews.length;
  const rating = reviewsCount > 0
    ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviewsCount
    : 0;

  await Product.findByIdAndUpdate(productId, {
    rating: Number(rating.toFixed(1)),
    reviewsCount,
  });
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate('customer', 'username profileImage')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      results: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Add or update a review
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ status: 'fail', message: 'Product ID, rating (1-5), and comment are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found' });
    }

    // Check if user already reviewed this product
    let review = await Review.findOne({ product: productId, customer: req.user._id });

    if (review) {
      // Update existing review
      review.rating = Number(rating);
      review.comment = comment;
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        product: productId,
        customer: req.user._id,
        rating: Number(rating),
        comment,
      });
    }

    // Recalculate average rating on product
    await updateProductStats(productId);

    await review.populate('customer', 'username profileImage');

    res.status(201).json({
      status: 'success',
      message: 'Review saved successfully',
      data: review,
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ status: 'fail', message: 'Review not found' });
    }

    const isOwner = review.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized to delete this review' });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);
    await updateProductStats(productId);

    res.json({
      status: 'success',
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
