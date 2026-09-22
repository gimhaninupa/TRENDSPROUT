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

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in the environment variables!');
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully.');

    // 1. Clear Existing Data
    console.log('🧹 Clearing existing database collections...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await AIDesign.deleteMany({});
    await Cart.deleteMany({});
    await Coupon.deleteMany({});
    await ChatMessage.deleteMany({});
    console.log('✅ Database cleared.');

    // Pre-hash default password for all seed accounts
    const defaultPassword = 'Password123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 2. Seed Users (15 users: 3 admins, 4 vendors, 8 customers)
    console.log('👤 Seeding Users with production details...');
    const usersData = [];
    
    // Admins
    for (let i = 1; i <= 3; i++) {
      usersData.push({
        username: `admin_user${i}`,
        email: `admin${i}@trendsprout.com`,
        password: hashedPassword,
        role: 'admin',
        phone: `+9477111222${i}`,
        profileImage: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80`,
        isVerified: true,
      });
    }

    // Vendors
    const storeNames = ['Aura Boutique', 'Nouveau Wear', 'EcoThread Labs', 'Veloce Atelier'];
    const storeDescs = [
      'Minimalist runway styles and contemporary designs.',
      'Modern, oversized streetwear and utility apparel.',
      'Sustainably sourced, 100% organic cotton and hemp threads.',
      'Athletic activewear and custom design garments.'
    ];
    for (let i = 1; i <= 4; i++) {
      usersData.push({
        username: `vendor_store${i}`,
        email: `vendor${i}@trendsprout.com`,
        password: hashedPassword,
        role: 'vendor',
        phone: `+9477222333${i}`,
        profileImage: `https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80`,
        isVerified: true,
        vendorStore: {
          storeName: storeNames[i - 1],
          storeDescription: storeDescs[i - 1],
          bannerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&h=400&q=80',
          logoImage: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=100&h=100&q=80'
        }
      });
    }

    // Customers
    for (let i = 1; i <= 8; i++) {
      usersData.push({
        username: `customer_shopper${i}`,
        email: `shopper${i}@gmail.com`,
        password: hashedPassword,
        role: 'customer',
        phone: `+9477333444${i}`,
        profileImage: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80`,
        isVerified: i <= 6, // 6 verified customers, 2 unverified (needing OTP)
        otp: i > 6 ? {
          code: `12345${i}`,
          expiresAt: new Date(Date.now() + 3600000) // expires in 1hr
        } : undefined
      });
    }

    const createdUsers = await User.insertMany(usersData);
    console.log(`✅ Seeded ${createdUsers.length} Users with default password "${defaultPassword}".`);

    const vendors = createdUsers.filter(u => u.role === 'vendor');
    const customers = createdUsers.filter(u => u.role === 'customer');

    // 3. Seed Categories (15 categories)
    console.log('📂 Seeding Categories...');
    const categoriesData = [
      { name: 'Dresses', slug: 'dresses', description: 'Elegant dresses for every occasion', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Blazers', slug: 'blazers', description: 'Smart and formal outer blazers', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Accessories', slug: 'accessories', description: 'Bags, sunglasses, and jewelry to complete your look', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Activewear', slug: 'activewear', description: 'High performance gym and sportswear', image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Denim', slug: 'denim', description: 'Classic jeans, jackets, and skirts', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Footwear', slug: 'footwear', description: 'Sneakers, boots, sandals, and formal shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Knitwear', slug: 'knitwear', description: 'Cozy sweaters, cardigans, and beanies', image: 'https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Outerwear', slug: 'outerwear', description: 'Heavy coats, rain jackets, and windbreakers', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'T-Shirts', slug: 't-shirts', description: 'Casual premium cotton everyday t-shirts', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Shirts', slug: 'shirts', description: 'Formal and semi-formal button-up shirts', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Streetwear', slug: 'streetwear', description: 'Modern, urban, and oversized silhouettes', image: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Swimwear', slug: 'swimwear', description: 'Trendy bikinis, board shorts, and beachwear', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Loungewear', slug: 'loungewear', description: 'Ultra-comfortable tracksuits and pajamas', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Kids Fashion', slug: 'kids-fashion', description: 'Cute outfits for children and toddlers', image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=300&h=400&q=80' },
      { name: 'Ethical Wear', slug: 'ethical-wear', description: '100% sustainable organic materials', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=300&h=400&q=80' }
    ];

    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`✅ Seeded ${createdCategories.length} Categories.`);

    // 4. Seed Products (18 products with sizes and colors)
    console.log('🛍️ Seeding Products with custom sizes and colors...');
    const brands = ['Aura Label', 'Nouveau Collective', 'Sprout Studio', 'EcoThread', 'Veloce', 'Monolith'];
    const tags = ['Sale', 'Trending', 'New', 'None'];
    const sizes = ['XS', 'S', 'M', 'L', 'XL'];
    const colors = ['Midnight Black', 'Vintage White', 'Sage Green', 'Lilac Purple', 'Earth Brown'];
    const productsData = [];

    const productNames = [
      { name: 'Linen Slip Dress', catIdx: 0, price: 8500, origPrice: 12000, desc: 'Flowing linen dress ideal for summer outings and beach days.' },
      { name: 'Oversized Wool Blazer', catIdx: 1, price: 14500, origPrice: 18000, desc: 'Tailored fit wool-blend blazer featuring custom tortoiseshell buttons.' },
      { name: 'Leather Crossbody Bag', catIdx: 2, price: 9500, origPrice: 11000, desc: 'Handcrafted genuine leather bag with adjustable strap.' },
      { name: 'Seamless Gym Leggings', catIdx: 3, price: 4200, origPrice: 5000, desc: 'High-waisted compression leggings designed for intense workouts.' },
      { name: 'Relaxed Fit Denim Jacket', catIdx: 4, price: 7800, origPrice: 9500, desc: 'Distressed vintage denim jacket with double chest pockets.' },
      { name: 'Minimalist White Sneakers', catIdx: 5, price: 11200, origPrice: 15000, desc: 'Breathable vegan leather sneakers with memory foam insoles.' },
      { name: 'Cable Knit Cardigan', catIdx: 6, price: 6900, origPrice: 8500, desc: 'Super cozy, heavyweight cable knit cardigan with wooden buttons.' },
      { name: 'Water-Resistant Trench Coat', catIdx: 7, price: 19500, origPrice: 24000, desc: 'Double-breasted classic trench coat with adjustable waist belt.' },
      { name: 'Heavyweight Cotton Tee', catIdx: 8, price: 2800, origPrice: 3500, desc: 'Boxy oversized street style basic t-shirt made of 240GSM cotton.' },
      { name: 'Classic Oxford Shirt', catIdx: 9, price: 5800, origPrice: 7000, desc: 'Sharp formal button-down shirt crafted from 100% fine cotton.' },
      { name: 'Utility Cargo Pants', catIdx: 10, price: 8200, origPrice: 10000, desc: 'Relaxed fit cargos with multiple secure zipper pockets.' },
      { name: 'Retro Swim Trunks', catIdx: 11, price: 3400, origPrice: 4500, desc: 'Quick-dry swim shorts with an elastic drawstring waist.' },
      { name: 'Fleece Sweatpants', catIdx: 12, price: 4900, origPrice: 6000, desc: 'Ultra-soft fleece joggers featuring ribbed cuffs.' },
      { name: 'Organic Cotton Toddler Set', catIdx: 13, price: 3900, origPrice: 4800, desc: 'Breathable, hypoallergenic baby clothes set.' },
      { name: 'Hemp Fiber Tunic', catIdx: 14, price: 8900, origPrice: 11000, desc: 'Sustainably sourced hemp tunic featuring wooden details.' },
      { name: 'Satin Party Dress', catIdx: 0, price: 12500, origPrice: 15000, desc: 'Shimmering cowl-neck satin slip dress for evenings.' },
      { name: 'Corduroy Blazer', catIdx: 1, price: 13200, origPrice: 16000, desc: 'Retro-inspired fine corduroy jacket in warm earth tones.' },
      { name: 'Gold Link Chain Necklace', catIdx: 2, price: 4500, origPrice: 5500, desc: '18k gold-plated hypoallergenic link chain necklace.' }
    ];

    for (let i = 0; i < productNames.length; i++) {
      const pInfo = productNames[i];
      const vendor = vendors[i % vendors.length];
      const category = createdCategories[pInfo.catIdx];

      productsData.push({
        name: pInfo.name,
        description: pInfo.desc,
        price: pInfo.price,
        originalPrice: pInfo.origPrice,
        brand: brands[i % brands.length],
        image: category.image,
        stock: Math.floor(Math.random() * 50) + 10,
        category: category._id,
        vendor: vendor._id,
        tag: tags[i % tags.length],
        rating: 4 + (Math.random() * 1),
        reviewsCount: Math.floor(Math.random() * 10) + 5,
        sizes: pInfo.catIdx === 2 || pInfo.catIdx === 5 ? ['One Size'] : sizes, // Bags/Necklaces are One Size
        colors: [colors[i % colors.length], colors[(i + 1) % colors.length]],
      });
    }

    const createdProducts = await Product.insertMany(productsData);
    console.log(`✅ Seeded ${createdProducts.length} Products.`);

    // 5. Update Users with Wishlist items
    console.log('❤️ Adding Wishlist items to Users...');
    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      // Give each customer 2 random products in their wishlist
      const p1 = createdProducts[i % createdProducts.length];
      const p2 = createdProducts[(i + 3) % createdProducts.length];
      
      await User.findByIdAndUpdate(customer._id, {
        $push: { wishlist: { $each: [p1._id, p2._id] } }
      });
    }
    console.log('✅ Wishlists updated.');

    // 6. Seed Reviews (16 reviews)
    console.log('⭐ Seeding Reviews...');
    const comments = [
      'Amazing quality! Fits exactly as described.',
      'Highly recommend this item, the material feels super premium.',
      'Love the fit, but delivery took a little longer than expected.',
      'An absolute wardrobe staple! Will buy again in other colors.',
      'Matches the photos perfectly. Exceeded my expectations.',
      'Good value for money. Very stylish design.'
    ];

    const reviewsData = [];
    for (let i = 0; i < 16; i++) {
      const product = createdProducts[i % createdProducts.length];
      const customer = customers[i % customers.length];

      reviewsData.push({
        product: product._id,
        customer: customer._id,
        rating: Math.floor(Math.random() * 2) + 4,
        comment: comments[i % comments.length]
      });
    }

    const createdReviews = await Review.insertMany(reviewsData);
    console.log(`✅ Seeded ${createdReviews.length} Reviews.`);

    // 7. Seed Orders (15 orders)
    console.log('💳 Seeding Orders...');
    const cities = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna'];
    const orderStatuses = ['Processing', 'Shipped', 'Delivered'];
    const paymentStatuses = ['Paid', 'Pending'];
    const ordersData = [];

    for (let i = 0; i < 15; i++) {
      const customer = customers[i % customers.length];
      const prod1 = createdProducts[(i * 2) % createdProducts.length];
      const prod2 = createdProducts[(i * 2 + 1) % createdProducts.length];
      const qty1 = Math.floor(Math.random() * 2) + 1;
      const qty2 = Math.floor(Math.random() * 2) + 1;

      const items = [
        { 
          product: prod1._id, 
          quantity: qty1, 
          price: prod1.price,
          size: prod1.sizes[0],
          color: prod1.colors[0],
        },
        { 
          product: prod2._id, 
          quantity: qty2, 
          price: prod2.price,
          size: prod2.sizes[0],
          color: prod2.colors[0],
        }
      ];

      const totalAmount = (prod1.price * qty1) + (prod2.price * qty2);

      ordersData.push({
        customer: customer._id,
        items,
        totalAmount,
        shippingAddress: {
          street: `${10 + i}, Main Street`,
          city: cities[i % cities.length],
          state: 'Western Province',
          zipCode: `00${i}00`,
          country: 'Sri Lanka'
        },
        paymentStatus: paymentStatuses[i % paymentStatuses.length],
        orderStatus: orderStatuses[i % orderStatuses.length],
        trackingNumber: `TS-TRK-${100000 + i}`
      });
    }

    const createdOrders = await Order.insertMany(ordersData);
    console.log(`✅ Seeded ${createdOrders.length} Orders.`);

    // 8. Seed AIDesigns (15 designs)
    console.log('🤖 Seeding AIDesigns...');
    const prompts = [
      'cyberpunk neon bomber jacket with glow highlights',
      'minimalist linen kimono robe in pastel blue',
      'steampunk trench coat with brass button details',
      'y2k chunky platform sneakers in metallic silver',
      'boho-chic floral maxi dress with ruffle sleeves',
      'oversized holographic hoodie with futuristic typography'
    ];

    const designsData = [];
    for (let i = 0; i < 15; i++) {
      const user = customers[i % customers.length];
      
      designsData.push({
        user: user._id,
        prompt: prompts[i % prompts.length],
        generatedImageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&h=500&q=80',
        categorySuggestion: 'Streetwear',
        priceSuggestion: 4500 + (i * 200)
      });
    }

    const createdDesigns = await AIDesign.insertMany(designsData);
    console.log(`✅ Seeded ${createdDesigns.length} AIDesigns.`);

    // 9. Seed Carts (for all 8 customers)
    console.log('🛒 Seeding User Shopping Carts...');
    const cartsData = [];
    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      const p1 = createdProducts[(i + 1) % createdProducts.length];
      const p2 = createdProducts[(i + 2) % createdProducts.length];

      cartsData.push({
        user: customer._id,
        items: [
          { product: p1._id, quantity: 1, size: p1.sizes[0], color: p1.colors[0] },
          { product: p2._id, quantity: 2, size: p2.sizes[0], color: p2.colors[0] }
        ]
      });
    }
    const createdCarts = await Cart.insertMany(cartsData);
    console.log(`✅ Seeded ${createdCarts.length} Active Shopping Carts.`);

    // 10. Seed Coupons (15 active/expired coupons)
    console.log('🎟️ Seeding Coupons...');
    const couponsData = [];
    for (let i = 1; i <= 15; i++) {
      couponsData.push({
        code: `SPROUT${i}0`,
        discountType: i % 2 === 0 ? 'percentage' : 'fixed',
        discountValue: i % 2 === 0 ? 15 : 1000, // 15% or 1000 LKR
        minOrderAmount: i % 2 === 0 ? 0 : 5000,
        expiresAt: new Date(Date.now() + (i % 3 === 0 ? -86400000 : 86400000 * 30)), // some expired, most active
        isActive: i % 5 !== 0 // some inactive
      });
    }
    const createdCoupons = await Coupon.insertMany(couponsData);
    console.log(`✅ Seeded ${createdCoupons.length} Coupons.`);

    // 11. Seed Chat Messages (16 logs for stylist conversations)
    console.log('💬 Seeding AI Stylist Chat Logs...');
    const chatMsgData = [];
    const chatPrompts = [
      'What should I wear to a semi-formal summer wedding?',
      'Can you recommend a casual streetwear outfit with cargo pants?',
      'Suggest a color palette to pair with a sage green blazer.',
      'I need styling advice for an oversized vintage denim jacket.'
    ];
    const chatReplies = [
      'A linen slip dress or a pastel corduroy blazer would fit a summer wedding perfectly. Try pairing it with clean white leather accessories.',
      'Pair our Utility Cargo Pants with the Heavyweight Cotton Tee in midnight black, and complete the look with Minimalist White Sneakers.',
      'Sage green looks excellent when paired with warm earth tones (like beige or brown) or offset with classic vintage white and denim.',
      'Go for a relaxed look by styling the denim jacket over a boxy white tee, paired with soft fleece sweatpants or dark wash jeans.'
    ];

    for (let i = 0; i < 16; i++) {
      const customer = customers[i % customers.length];
      const qaIdx = i % chatPrompts.length;

      // Add user prompt
      chatMsgData.push({
        user: customer._id,
        role: 'user',
        content: chatPrompts[qaIdx]
      });

      // Add assistant response
      chatMsgData.push({
        user: customer._id,
        role: 'assistant',
        content: chatReplies[qaIdx]
      });
    }
    const createdMessages = await ChatMessage.insertMany(chatMsgData);
    console.log(`✅ Seeded ${createdMessages.length} Chat Messages.`);

    console.log('🎉 Seeding successfully completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    console.log('🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('👋 Database connection closed.');
    process.exit(0);
  }
};

seedDatabase();
