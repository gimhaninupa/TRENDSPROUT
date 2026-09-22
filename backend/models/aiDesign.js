import mongoose from 'mongoose';

const aiDesignSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    generatedImageUrl: {
      type: String,
      required: true,
    },
    categorySuggestion: {
      type: String,
      default: '',
    },
    priceSuggestion: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const AIDesign = mongoose.model('AIDesign', aiDesignSchema);
export default AIDesign;
