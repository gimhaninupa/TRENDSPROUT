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

const FALLBACK_PRODUCTS = [
  {
    _id: 'prod_rogfi_bag_01',
    id: 'prod_rogfi_bag_01',
    name: 'Bag',
    price: 3500,
    originalPrice: 5500,
    brand: 'ROGFI',
    category: { name: 'Bags', slug: 'bags' },
    tag: 'New',
    rating: 5.0,
    reviewsCount: 12,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'],
    description: 'High-density ballistic nylon urban utility bag with ergonomic straps and laptop compartment.',
    sizes: ['Standard'],
    colors: ['Navy Blue', 'Black'],
    stock: 45
  },
  {
    _id: 'prod_nadun_sneakers_02',
    id: 'prod_nadun_sneakers_02',
    name: 'AeroStride Urban Sneakers',
    price: 15300,
    originalPrice: 19125,
    brand: 'nadun_manawadu_1605',
    category: { name: 'Footwear', slug: 'footwear' },
    tag: 'New',
    rating: 5.0,
    reviewsCount: 18,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80'],
    description: 'Modern two-tone low-top court sneakers featuring shock-absorbing sole and premium leather upper.',
    sizes: ['40', '41', '42', '43', '44'],
    colors: ['Off-White / Forest Green'],
    stock: 28
  },
  {
    _id: 'prod_nadun_tshirt_03',
    id: 'prod_nadun_tshirt_03',
    name: 'Midnight Core Oversized T-Shirt',
    price: 4200,
    originalPrice: 5250,
    brand: 'nadun_manawadu_1605',
    category: { name: 'T-Shirts', slug: 't-shirts' },
    tag: 'New',
    rating: 5.0,
    reviewsCount: 25,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'],
    description: 'Heavyweight 260 GSM organic combed cotton boxy-fit tee designed for modern streetwear.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Deep Navy', 'Washed Black'],
    stock: 60
  },
  {
    _id: 'prod_fresh_gown_04',
    id: 'prod_fresh_gown_04',
    name: 'Silk Slip Evening Gown',
    price: 18500,
    originalPrice: 22000,
    brand: 'My Fresh Store',
    category: { name: 'Dresses', slug: 'dresses' },
    tag: 'Trending',
    rating: 5.0,
    reviewsCount: 30,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80'],
    description: 'Pure Mulberry silk bias-cut maxi gown with delicate cowl neckline and draped silhouette.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Champagne', 'Emerald'],
    stock: 20
  },
  {
    _id: 'prod_chanupa_blazer_05',
    id: 'prod_chanupa_blazer_05',
    name: 'Tailored Linen Blazer',
    price: 14500,
    originalPrice: 17500,
    brand: 'chanupa_niduwara_9071',
    category: { name: 'Blazers', slug: 'blazers' },
    tag: 'Curated',
    rating: 5.0,
    reviewsCount: 14,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80'],
    description: 'Structured unlined summer blazer tailored from 100% natural breathable European flax linen.',
    sizes: ['38', '40', '42', '44'],
    colors: ['Oatmeal', 'Sage'],
    stock: 15
  }
];

// @desc    Get all products (with optional filtering)
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, tag, brand, sort, priceMin, priceMax, page = 1, limit = 50 } = req.query;

    if (mongoose.connection.readyState === 1) {
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
        .populate('vendor', 'username vendorStore')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit));

      const totalProducts = await Product.countDocuments(query);

      if (products && products.length > 0) {
        return res.json({
          status: 'success',
          results: products.length,
          total: totalProducts,
          page: Number(page),
          pages: Math.ceil(totalProducts / Number(limit)),
          data: products,
        });
      }
    }

    // Fallback products when database has no records or is buffering
    let filteredFallback = [...FALLBACK_PRODUCTS];
    if (brand) {
      filteredFallback = filteredFallback.filter(p => p.brand.toLowerCase() === String(brand).toLowerCase());
    }
    if (search) {
      const s = String(search).toLowerCase();
      filteredFallback = filteredFallback.filter(p => 
        p.name.toLowerCase().includes(s) || 
        p.brand.toLowerCase().includes(s) || 
        p.description.toLowerCase().includes(s)
      );
    }

    return res.json({
      status: 'success',
      results: filteredFallback.length,
      total: filteredFallback.length,
      page: 1,
      pages: 1,
      data: filteredFallback,
    });
  } catch (error) {
    console.warn('Products fallback activated:', error.message);
    return res.json({
      status: 'success',
      results: FALLBACK_PRODUCTS.length,
      total: FALLBACK_PRODUCTS.length,
      page: 1,
      pages: 1,
      data: FALLBACK_PRODUCTS,
    });
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
