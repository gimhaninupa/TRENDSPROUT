import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import productRouter from './routes/products.js';
import cartRouter from './routes/cart.js';
import orderRouter from './routes/orders.js';
import reviewRouter from './routes/reviews.js';
import couponRouter from './routes/coupons.js';
import vendorRouter from './routes/vendor.js';
import adminRouter from './routes/admin.js';
import aiRouter from './routes/ai.js';
import cvRouter from './routes/cv.js';
import uploadRouter from './routes/upload.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Mount Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'TRENDSPROUT Backend API is running!' });
});

app.use('/api/auth', authRouter);
app.use('/api/categories', (req, res, next) => {
  req.url = '/categories' + req.url;
  productRouter(req, res, next);
});
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/coupons', couponRouter);
app.use('/api/vendor', vendorRouter);
app.use('/api/admin', adminRouter);
app.use('/api/ai', aiRouter);
app.use('/api/cv', cvRouter);
app.use('/api/upload', uploadRouter);

// Database connection function
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      console.warn('⚠️ MONGODB_URI is not defined in environment variables. Running in server-only mode without database.');
      return;
    }
    
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
  }
};

// Start server and connect to DB
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
};

startServer();
