import express from 'express';
import mongoose from 'mongoose';
import AIDesign from '../models/aiDesign.js';
import ChatMessage from '../models/chatMessage.js';
import Product from '../models/product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to sanitize and create enhanced fashion prompt with user description prioritized
const buildFashionPrompt = (userPrompt, style, fabric, colorPalette) => {
  const clean = userPrompt.trim();
  const attributes = [];

  if (colorPalette && colorPalette !== 'Default') {
    attributes.push(`${colorPalette} color palette`);
  }
  if (fabric) {
    attributes.push(`crafted in genuine ${fabric}`);
  }
  if (style) {
    attributes.push(`${style} aesthetic`);
  }

  const attrStr = attributes.length > 0 ? ` (${attributes.join(', ')})` : '';

  return `${clean}${attrStr}, full-length fashion apparel photography, studio editorial lighting, crisp garment details, photorealistic clothing catalog presentation, 8k resolution`;
};

// @desc    AI Fashion Stylist Chat
// @route   POST /api/ai/chat
// @access  Public / Optional Auth
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ status: 'fail', message: 'Message is required' });
    }

    const lower = message.toLowerCase();

    // Fetch in-stock catalog products for context
    let catalogSnippets = [];
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const dbProducts = await Product.find().limit(6).select('name price brand tag');
        catalogSnippets = dbProducts;
      } catch {
        // Fallback
      }
    }

    let reply = "";
    let recommendedProducts = [];

    // Intelligent Fashion Stylist Response Logic
    if (lower.includes('dinner') || lower.includes('party') || lower.includes('cocktail') || lower.includes('evening')) {
      reply = "For an evening dinner or party in Sri Lanka, I recommend our Linen Slip Dress (LKR 8,500) paired with an Oversized Wool Blazer (LKR 14,500) draped over your shoulders. Add minimalist gold jewelry and open-toe block heels for effortless contemporary elegance.";
      recommendedProducts = [
        { name: "Linen Slip Dress", price: 8500, brand: "Aura Label", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80" },
        { name: "Oversized Wool Blazer", price: 14500, brand: "Nouveau Collective", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80" }
      ];
    } else if (lower.includes('wedding') || lower.includes('formal') || lower.includes('ceremony')) {
      reply = "For a formal wedding celebration, an editorial floor-length piece with clean architectural lines will stand out beautifully. Pair with our Leather Crossbody Bag in Cognac Tan (LKR 9,500) and delicate accessories.";
      recommendedProducts = [
        { name: "Water-Resistant City Trench", price: 19500, brand: "Sprout Studio", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80" },
        { name: "Leather Crossbody Bag", price: 9500, brand: "Sprout Studio", image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80" }
      ];
    } else if (lower.includes('gym') || lower.includes('workout') || lower.includes('active') || lower.includes('casual')) {
      reply = "Our Seamless Gym Leggings (LKR 4,200) in Lilac Purple paired with Minimalist Vegan Sneakers (LKR 11,200) create the ultimate athleisure ensemble. Both breathable and sculpt-enhancing.";
      recommendedProducts = [
        { name: "Seamless Gym Leggings", price: 4200, brand: "Veloce Active", image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=400&q=80" },
        { name: "Minimalist Vegan Sneakers", price: 11200, brand: "Monolith Studio", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80" }
      ];
    } else if (lower.includes('budget') || lower.includes('cheap') || lower.includes('under') || lower.includes('price')) {
      reply = "Looking for premium style on a budget? We have pieces starting under LKR 5,000, like our Seamless Leggings (LKR 4,200) and Cable Knit Cardigans on seasonal promotion. Don't forget you can use coupon code 'TREND10' for an extra 10% off!";
      recommendedProducts = [
        { name: "Seamless Gym Leggings", price: 4200, brand: "Veloce Active", image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=400&q=80" },
        { name: "Linen Slip Dress", price: 8500, brand: "Aura Label", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80" }
      ];
    } else {
      reply = `I love that fashion inquiry! When styling for that vibe, focus on silhouette balance: pair tailored, structured fits with flowing textures. From our Colombo catalog, pieces like our Linen Slip Dress (LKR 8,500) or Relaxed Vintage Denim Jacket (LKR 7,800) would suit this aesthetic effortlessly. Would you like me to tailor this for a specific occasion or color palette?`;
      recommendedProducts = [
        { name: "Linen Slip Dress", price: 8500, brand: "Aura Label", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80" },
        { name: "Relaxed Vintage Denim Jacket", price: 7800, brand: "Nouveau Collective", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80" }
      ];
    }

    res.json({
      status: 'success',
      data: {
        role: 'ai',
        text: reply,
        recommendedProducts,
      },
    });
  } catch (error) {
    console.error('AI Stylist error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});


// @desc    Generate Fashion Design from Text
// @route   POST /api/ai/generate-design
// @access  Public / Optional Auth
router.post('/generate-design', async (req, res) => {
  try {
    const { prompt, style = 'Editorial', fabric = 'Silk', colorPalette = '' } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ status: 'fail', message: 'Design prompt is required' });
    }

    const enhancedPrompt = buildFashionPrompt(prompt, style, fabric, colorPalette);

    // Using Pollinations Flux engine (fast, photorealistic text-to-image generative diffusion model)
    const encoded = encodeURIComponent(enhancedPrompt);
    const seed = Math.floor(Math.random() * 9999999);
    const generatedImageUrl = `https://image.pollinations.ai/prompt/${encoded}?seed=${seed}&width=800&height=1000&nologo=true&model=flux`;

    // Estimate category & price
    let categorySuggestion = 'Dresses';
    const lowerP = prompt.toLowerCase();
    if (lowerP.includes('jacket') || lowerP.includes('coat')) categorySuggestion = 'Outerwear';
    else if (lowerP.includes('blazer')) categorySuggestion = 'Blazers';
    else if (lowerP.includes('pant') || lowerP.includes('cargo') || lowerP.includes('trouser')) categorySuggestion = 'Bottoms';
    else if (lowerP.includes('bag') || lowerP.includes('jewelry')) categorySuggestion = 'Accessories';

    const priceSuggestion = Math.round((9500 + Math.random() * 12000) / 100) * 100;

    res.json({
      status: 'success',
      message: 'Design generated successfully',
      data: {
        imageUrl: generatedImageUrl,
        prompt,
        style,
        fabric,
        categorySuggestion,
        priceSuggestion,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Design generation error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Generate Vendor AI Product Description & SEO Copy
// @route   POST /api/ai/vendor-description
// @access  Public
router.post('/vendor-description', async (req, res) => {
  try {
    const { title, category, material, fit, tone = 'Luxury' } = req.body;

    const descriptions = [
      `Elevate your wardrobe with the ${title || 'Contemporary Garment'}. Meticulously tailored from premium ${material || 'organic textile'}, this piece embodies modern ${tone.toLowerCase()} elegance with clean lines and breathable comfort. Perfect for seamless day-to-night transitions.`,
      `Crafted for the discerning individual, the ${title || 'Statement Piece'} combines structured ${fit || 'relaxed'} silhouette with exquisite ${material || 'fine fabric'} craftsmanship. An essential statement piece designed to turn heads.`,
    ];

    const tags = ['Designer', 'Contemporary', 'Limited Edition', 'Ethical Fashion', 'Sri Lanka'];

    res.json({
      status: 'success',
      data: {
        title: title || 'Silk Halter Evening Dress',
        description: descriptions[0],
        altDescription: descriptions[1],
        bulletPoints: [
          `Tailored from 100% premium ${material || 'fabric'} with refined seam finishing`,
          `Flattering ${fit || 'relaxed'} silhouette designed for tropical comfort`,
          `Ethically produced by independent artisans in Sri Lanka`,
          `Easy-care durable textile resistant to wrinkles`,
        ],
        suggestedTags: tags,
      },
    });
  } catch (error) {
    console.error('Vendor description error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Generate Vendor AI Pricing Recommendation
// @route   POST /api/ai/vendor-pricing
// @access  Public
router.post('/vendor-pricing', async (req, res) => {
  try {
    const { category, productionCost = 4500, targetMargin = 50 } = req.body;

    const cost = Number(productionCost);
    const suggestedPrice = Math.round((cost * (1 + Number(targetMargin) / 100)) / 100) * 100;
    const competitorLow = Math.round((suggestedPrice * 0.85) / 100) * 100;
    const competitorHigh = Math.round((suggestedPrice * 1.35) / 100) * 100;

    res.json({
      status: 'success',
      data: {
        suggestedPrice,
        optimalDiscountPrice: Math.round((suggestedPrice * 0.9) / 100) * 100,
        competitorRange: {
          min: competitorLow,
          max: competitorHigh,
        },
        estimatedGrossMargin: `${targetMargin}%`,
        profitPerUnit: suggestedPrice - cost,
      },
    });
  } catch (error) {
    console.error('Vendor pricing error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
