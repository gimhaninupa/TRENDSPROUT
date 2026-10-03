import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 100,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Processing', 'Completed', 'Rejected'],
      default: 'Pending',
    },
    bankDetails: {
      bankName: { type: String, required: true },
      accountName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      branch: { type: String, default: '' },
    },
    referenceNumber: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Payout = mongoose.model('Payout', payoutSchema);
export default Payout;
