import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/user.js';
import Category from './models/category.js';
import Product from './models/product.js';
import Order from './models/order.js';
import Review from './models/review.js';
import AIDesign from './models/aiDesign.js';
import Cart from './models/cart.js';
import Coupon from './models/coupon.js';
import ChatMessage from './models/chatMessage.js';
import Payout from './models/payout.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in the environment variables!');
  process.exit(1);
}

const clearAndResetDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully.');

    // 1. Clear All Mock Data
    console.log('🧹 Clearing all mock products, stores, reviews, orders, carts, and coupons...');
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await AIDesign.deleteMany({});
    await Cart.deleteMany({});
    await Coupon.deleteMany({});
    await ChatMessage.deleteMany({});
    await Payout.deleteMany({});
    await User.deleteMany({});
    await Category.deleteMany({});
    console.log('✅ All mock data collections cleared.');

    // 2. Create Fresh Super Admin Account
    const defaultPassword = 'Password123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    console.log('👤 Creating initial Super Admin and Clean Vendor account...');
    await User.create([
      {
        username: 'admin',
        email: 'admin@trendsprout.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+94770000000',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
        isVerified: true,
      },
      {
        username: 'vendor',
        email: 'vendor@trendsprout.com',
        password: hashedPassword,
        role: 'vendor',
        phone: '+94770000001',
        profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80',
        isVerified: true,
        vendorStore: {
          storeName: 'My Fresh Store',
          storeDescription: 'Ready to add fresh new products and collections.',
          bannerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&h=400&q=80',
          logoImage: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=100&h=100&q=80',
        },
      }
    ]);
    console.log('✅ Created clean Admin (admin@trendsprout.com / Password123!) and Vendor accounts.');

    // 3. Setup Standard Categories (Empty of items, ready for real products)
    console.log('📂 Setting up clean category taxonomy...');
    const categoriesData = [
      { name: 'Dresses', slug: 'dresses', description: 'Dresses and gowns', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Blazers', slug: 'blazers', description: 'Outer blazers and formal coats', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Accessories', slug: 'accessories', description: 'Bags, sunglasses, and jewelry', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Activewear', slug: 'activewear', description: 'Sportswear and gym apparel', image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Denim', slug: 'denim', description: 'Jeans, jackets, and denim wear', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Footwear', slug: 'footwear', description: 'Sneakers, boots, and shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Knitwear', slug: 'knitwear', description: 'Sweaters, cardigans, and knitwear', image: 'https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Outerwear', slug: 'outerwear', description: 'Coats, jackets, and windbreakers', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'T-Shirts', slug: 't-shirts', description: 'Casual premium everyday t-shirts', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Shirts', slug: 'shirts', description: 'Formal and semi-formal button-ups', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Streetwear', slug: 'streetwear', description: 'Urban and oversized apparel', image: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Swimwear', slug: 'swimwear', description: 'Beachwear and swimwear', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&h=400&q=80' },
    ];
    await Category.insertMany(categoriesData);
    console.log(`✅ Seeded ${categoriesData.length} clean Categories.`);

    console.log('\n✨ Database is completely reset and clean! Zero mock products or fake orders exist. Ready for fresh new data insertion.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
};

clearAndResetDatabase();
