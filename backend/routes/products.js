import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/product.js';
import Category from '../models/category.js';

const router = express.Router();

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json({
      status: 'success',
      results: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Get all products (with optional filtering)
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, tag, brand, sort, priceMin, priceMax, page = 1, limit = 50 } = req.query;

    const query = {};

    // Filter by category slug, ID, or name
    if (category && category !== 'All') {
      const isObjectId = mongoose.Types.ObjectId.isValid(category);
      const catSlug = String(category).toLowerCase().replace(/\s+/g, '-');
      const catObj = await Category.findOne({
        $or: [
          ...(isObjectId ? [{ _id: category }] : []),
          { slug: catSlug },
          { name: new RegExp(`^${category}$`, 'i') }
        ]
      });

      if (catObj) {
        query.category = catObj._id;
      }
    }

    // Filter by tag
    if (tag && tag !== 'All' && tag !== 'None') {
      query.tag = tag;
    }

    // Filter by brand
    if (brand) {
      query.brand = new RegExp(brand, 'i');
    }

    // Filter by price range
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }

    // Text search (search in product name, description or brand)
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') }
      ];
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Sorting
    let sortObj = { createdAt: -1 }; // default sorting
    if (sort) {
      if (sort === 'price-asc') sortObj = { price: 1 };
      else if (sort === 'price-desc') sortObj = { price: -1 };
      else if (sort === 'rating') sortObj = { rating: -1 };
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('vendor', 'username storeName')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    const totalProducts = await Product.countDocuments(query);

    res.json({
      status: 'success',
      results: products.length,
      total: totalProducts,
      page: Number(page),
      pages: Math.ceil(totalProducts / Number(limit)),
      data: products,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('vendor', 'username vendorStore');

    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found' });
    }

    res.json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
