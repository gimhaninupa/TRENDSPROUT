import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tag: {
      type: String,
      enum: ['Sale', 'Trending', 'New', 'None'],
      default: 'None',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    // Production Real-time additions
    sizes: {
      type: [String],
      default: ['S', 'M', 'L', 'XL'],
    },
    colors: {
      type: [String],
      default: ['Default'],
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
