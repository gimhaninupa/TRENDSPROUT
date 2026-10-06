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
      tagline: { type: String, default: '' },
      primaryColor: { type: String, default: '#6C4DF6' },
      fontStyle: { type: String, default: 'Modern Sans' },
      layout: { type: String, default: 'Grid 3-col' },
      bannerImage: { type: String, default: '' },
      bannerHeadline: { type: String, default: '' },
      bannerSubtext: { type: String, default: '' },
      logoImage: { type: String, default: '' },
      bankDetails: {
        accountNumber: { type: String, default: '' },
        bankName: { type: String, default: '' },
        accountHolder: { type: String, default: '' },
        branchName: { type: String, default: '' },
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
