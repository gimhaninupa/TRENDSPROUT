import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'vendor', 'admin'],
      default: 'customer',
    },
    phone: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    // Production Real-time additions
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: { type: String, default: null },
      expiresAt: { type: Date, default: null },
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    vendorStore: {
      storeName: { type: String, default: '' },
      storeDescription: { type: String, default: '' },
      bannerImage: { type: String, default: '' },
      logoImage: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
