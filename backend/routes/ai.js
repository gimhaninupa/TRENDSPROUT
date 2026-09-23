import express from 'express';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import AIDesign from '../models/aiDesign.js';
import ChatMessage from '../models/chatMessage.js';
import Product from '../models/product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Initialize Gemini Client if API key is provided
let genAI = null;
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim() && apiKey.startsWith('AIzaSy')) {
    if (!genAI) {
      genAI = new GoogleGenerativeAI(apiKey.trim());
    }
    return genAI;
  }
  return null;
};

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

    // Fetch in-stock catalog products for context
    let catalogSnippets = [];
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const dbProducts = await Product.find().limit(8).select('name price brand tag images category');
        catalogSnippets = dbProducts;
      } catch {
        // Fallback
      }
    }

    const ai = getGeminiClient();
    let reply = "";
    let recommendedProducts = [];

    if (ai) {
      try {
        const model = ai.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: `You are SproutStylist, the AI luxury personal fashion stylist for TrendSprout in Sri Lanka.
Tone: Chic, friendly, expert, and conversational. Keep responses concise (2 to 4 sentences).
Store Context: Sri Lankan Rupees (LKR).
Give genuine fashion styling advice for whatever the user asks (events, casual, trends, colors, fabrics).`
        });

        // Convert history format if available
        const contents = [];
        if (Array.isArray(history)) {
          history.slice(-6).forEach(h => {
            contents.push({
              role: h.sender === 'user' ? 'user' : 'model',
              parts: [{ text: h.text || '' }]
            });
          });
        }
        contents.push({ role: 'user', parts: [{ text: message }] });

        const result = await model.generateContent({ contents });
        reply = result.response.text();
      } catch (geminiError) {
        console.warn('Gemini API call failed, using smart fallback:', geminiError.message);
      }
    }

    // Smart Fallback if Gemini not configured or failed
    if (!reply) {
      const lower = message.toLowerCase();
      if (lower.includes('dinner') || lower.includes('party') || lower.includes('cocktail') || lower.includes('evening')) {
        reply = "For an evening dinner or party, I recommend a Silk or Linen Slip Dress (LKR 8,500) paired with an Oversized Wool Blazer (LKR 14,500) draped over your shoulders. Add minimalist gold jewelry and open-toe block heels for effortless contemporary elegance.";
      } else if (lower.includes('wedding') || lower.includes('formal') || lower.includes('ceremony')) {
        reply = "For a formal wedding celebration, an editorial floor-length piece with clean architectural lines will stand out beautifully. Pair with our Leather Crossbody Bag in Cognac Tan (LKR 9,500) and delicate accessories.";
      } else if (lower.includes('gym') || lower.includes('workout') || lower.includes('active') || lower.includes('casual')) {
        reply = "Our Seamless Gym Leggings (LKR 4,200) paired with Minimalist Vegan Sneakers (LKR 11,200) create the ultimate athleisure ensemble—both breathable and sculpt-enhancing for tropical comfort.";
      } else if (lower.includes('budget') || lower.includes('cheap') || lower.includes('under') || lower.includes('price')) {
        reply = "Looking for premium style on a budget? We have pieces starting under LKR 5,000, like our Seamless Leggings (LKR 4,200) and Cable Knit Cardigans. You can also use coupon code 'TREND10' at checkout for 10% off!";
      } else {
        reply = `Hello! I'm your TrendSprout AI Stylist. How can I help you elevate your look today? Feel free to ask me for outfit ideas, color matching, or styling for any upcoming event!`;
      }
    }

    // Attach relevant product recommendations from catalog
    if (catalogSnippets.length > 0) {
      const lower = message.toLowerCase();
      let matched = catalogSnippets.filter(p => {
        const nameMatch = p.name && typeof p.name === 'string' && lower.includes(p.name.toLowerCase());
        const tagMatch = p.tag && typeof p.tag === 'string' && lower.includes(p.tag.toLowerCase());
        const catMatch = typeof p.category === 'string' && lower.includes(p.category.toLowerCase());
        return nameMatch || tagMatch || catMatch;
      });
      if (matched.length === 0) matched = catalogSnippets.slice(0, 2);
      recommendedProducts = matched.slice(0, 2).map(p => ({
        name: p.name,
        price: p.price,
        brand: p.brand || 'Sprout Studio',
        image: (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80'
      }));
    } else {
      recommendedProducts = [
        { name: "Linen Slip Dress", price: 8500, brand: "Aura Label", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80" },
        { name: "Oversized Wool Blazer", price: 14500, brand: "Nouveau Collective", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80" }
      ];
    }

    res.json({
      status: 'success',
      data: {
        role: 'ai',
        text: reply,
        recommendedProducts,
        poweredBy: ai ? 'Google Gemini 2.5 Flash' : 'TrendSprout AI Engine',
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
    const ai = getGeminiClient();

    let description = '';
    let altDescription = '';
    let bulletPoints = [];
    let suggestedTags = [];

    if (ai) {
      try {
        const model = ai.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: `You are an elite e-commerce fashion copywriter and SEO specialist. Return your response in pure valid JSON without markdown formatting.
JSON structure:
{
  "description": "Primary high-converting luxury description (2-3 sentences)",
  "altDescription": "Alternative editorial description with evocative adjectives",
  "bulletPoints": ["4 clear product highlights covering material, fit, ethics, and care"],
  "suggestedTags": ["5-6 trending SEO e-commerce tags"]
}`
        });

        const prompt = `Write product copy for an apparel item:
Title: ${title || 'Fashion Apparel'}
Category: ${category || 'Apparel'}
Material/Fabric: ${material || 'High-grade sustainable textile'}
Fit: ${fit || 'Modern tailored fit'}
Tone: ${tone}
Region: Sri Lanka & Global Luxury Market`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(text);

        description = parsed.description;
        altDescription = parsed.altDescription;
        bulletPoints = parsed.bulletPoints || [];
        suggestedTags = parsed.suggestedTags || [];
      } catch (err) {
        console.warn('Gemini Copywriter failed, using fallback:', err.message);
      }
    }

    // Fallback if not generated
    if (!description) {
      description = `Elevate your wardrobe with the ${title || 'Contemporary Garment'}. Meticulously tailored from premium ${material || 'organic textile'}, this piece embodies modern ${tone.toLowerCase()} elegance with clean lines and breathable comfort. Perfect for seamless day-to-night transitions.`;
      altDescription = `Crafted for the discerning individual, the ${title || 'Statement Piece'} combines a structured ${fit || 'relaxed'} silhouette with exquisite ${material || 'fine fabric'} craftsmanship. An essential statement piece designed to turn heads.`;
      bulletPoints = [
        `Tailored from 100% premium ${material || 'fabric'} with refined seam finishing`,
        `Flattering ${fit || 'relaxed'} silhouette designed for tropical comfort`,
        `Ethically produced by independent artisans in Sri Lanka`,
        `Easy-care durable textile resistant to wrinkles`,
      ];
      suggestedTags = ['Designer', 'Contemporary', 'Limited Edition', 'Ethical Fashion', 'Sri Lanka'];
    }

    res.json({
      status: 'success',
      data: {
        title: title || 'Silk Halter Evening Dress',
        description,
        altDescription,
        bulletPoints,
        suggestedTags,
        poweredBy: ai ? 'Google Gemini 2.5 Flash' : 'TrendSprout AI Engine',
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
