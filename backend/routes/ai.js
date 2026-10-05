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

// Helper to sanitize, normalize typos, and create photorealistic fashion catalog prompts
const buildFashionPrompt = (userPrompt, style, fabric, colorPalette, shotType = 'ghost-mannequin', fitTarget = 'unisex') => {
  let clean = (userPrompt || '').trim();

  // Normalize common typos & informal clothing terms
  clean = clean
    .replace(/\bsleev\b/gi, 'sleeve')
    .replace(/\bsleved\b/gi, 'sleeved')
    .replace(/\bskinner\b/gi, 'ribbed sleeveless tank top')
    .replace(/\bpant\b/gi, 'trousers')
    .replace(/\btee\b/gi, 't-shirt');

  const isAuto = (val) => !val || val === 'Default' || val === 'Auto' || val.includes('Auto-Detect') || val.includes('AI Choice');

  const attributes = [];
  if (!isAuto(colorPalette)) {
    attributes.push(`${colorPalette} colorway`);
  }
  if (!isAuto(fabric)) {
    attributes.push(`made from authentic ${fabric}`);
  }
  if (!isAuto(style)) {
    attributes.push(`${style} cut`);
  }

  const attrStr = attributes.length > 0 ? ` (${attributes.join(', ')})` : '';

  let framing = '';
  if (shotType === 'model') {
    const genderStr = fitTarget === 'mens' ? 'male model' : fitTarget === 'womens' ? 'female model' : 'fashion model';
    framing = `Full length commercial fashion lookbook photography of a professional ${genderStr} wearing ${clean}${attrStr}, neutral studio backdrop, 35mm lens, softbox studio lighting, photorealistic skin and crisp fabric drape, Vogue catalog aesthetic`;
  } else if (shotType === 'macro') {
    framing = `High-end macro detail photography of ${clean}${attrStr}, extreme close-up focus on textured fabric weave, collar stitching, seam details, and buttons, luxury garment craftsmanship`;
  } else {
    // Default: Ghost Mannequin / Clean Studio E-Commerce Product Shot
    framing = `Front-view professional ghost-mannequin e-commerce product photography of ${clean}${attrStr}, centered garment, clean light-grey seamless studio backdrop, crisp fabric texture, sharp collar and cuffs, soft shadows, 8k online fashion store catalog listing`;
  }

  // Strict negative constraints to prevent anime, illustrations, and face closeups
  const negativeConstraints = 'hyperrealistic apparel presentation, no anime, no 3D CGI cartoon, no digital illustration, no distorted face, no fantasy art, crisp sharp photographic focus';

  return `${framing}, ${negativeConstraints}`;
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
        const dbProducts = await Product.find({ isActive: { $ne: false } }).limit(10).select('_id name price brand tag images category');
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
        const catalogContext = catalogSnippets.length > 0 
          ? `Available catalog items currently in the TrendSprout store: ${catalogSnippets.map(p => `"${p.name}" (LKR ${p.price}, Category: ${p.category?.name || p.category || 'Apparel'}, Brand: ${p.brand || 'TrendSprout'})`).join(', ')}.`
          : `Note: The marketplace catalog currently has 0 items listed in stock as vendors are preparing new seasonal collections. If the user asks about item availability or if specific items (like shorts, skinnies, dresses) are available, clearly let them know these items are currently not in stock yet in the store, while still offering expert fashion styling, color matching, and outfit advice.`;

        const model = ai.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: `You are SproutStylist, the AI luxury personal fashion stylist for TrendSprout fashion marketplace in Sri Lanka.
Tone: Chic, friendly, expert, and conversational. Keep responses helpful, direct, and well-structured.
Currency: Sri Lankan Rupees (LKR).
${catalogContext}
Directly answer whatever the user asks about clothing, occasions, outfits, materials, styling, and color combinations with expert fashion flair.`
        });

        // Gemini API strictly requires:
        // 1. History must start with role 'user'
        // 2. Roles must strictly alternate: user -> model -> user -> model
        const contents = [];
        if (Array.isArray(history)) {
          const validHistory = history.filter(h => h && h.text && typeof h.text === 'string' && h.text.trim());
          
          for (const h of validHistory) {
            const role = (h.sender === 'user' || h.role === 'user') ? 'user' : 'model';
            
            // Skip leading 'model' greeting messages (Gemini API requires the first turn to be 'user')
            if (contents.length === 0 && role === 'model') {
              continue;
            }
            
            // Prevent duplicate consecutive roles
            if (contents.length > 0 && contents[contents.length - 1].role === role) {
              contents[contents.length - 1].parts[0].text += `\n${h.text.trim()}`;
            } else {
              contents.push({
                role,
                parts: [{ text: h.text.trim() }]
              });
            }
          }
        }

        // Add the current user message at the end
        if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
          contents[contents.length - 1].parts[0].text += `\n${message.trim()}`;
        } else {
          contents.push({
            role: 'user',
            parts: [{ text: message.trim() }]
          });
        }

        const result = await model.generateContent({ contents });
        reply = result.response.text();
      } catch (geminiError) {
        console.warn('Gemini 2.5 Flash call note:', geminiError.message);
      }
    }

    // Smart Conversational Fallback if Gemini is offline or rate-limited
    if (!reply) {
      const lower = message.toLowerCase();
      const hasCatalog = catalogSnippets.length > 0;

      if (lower.includes('short') || lower.includes('skinner') || lower.includes('skinny') || lower.includes('tank')) {
        if (hasCatalog) {
          reply = "We currently have a few casual bottom and top options in stock! You can pair high-waisted shorts with a breathable ribbed skinner and an unbuttoned lightweight linen overshirt for a chic, tropical-ready streetwear look.";
        } else {
          reply = "Currently, our store doesn't have shorts or skinner tops listed in stock yet as vendors are preparing upcoming collections. However, for styling them, pairing tailored high-waist shorts with a ribbed skinner and white sneakers creates an effortless, breathable look!";
        }
      } else if (lower.includes('available') || lower.includes('in stock') || lower.includes('have you got') || lower.includes('buy') || lower.includes('items')) {
        if (hasCatalog) {
          reply = `Yes! We currently have ${catalogSnippets.length} items live in our catalog including ${catalogSnippets.slice(0, 3).map(p => `"${p.name}"`).join(', ')}. Browse the shop catalog to explore sizes and colors!`;
        } else {
          reply = "Our marketplace is currently preparing for new designer seasonal drops, so items are temporarily not listed in stock. Feel free to ask me for any outfit ideas, silhouette draping, or color coordination tips in the meantime!";
        }
      } else if (lower.includes('dinner') || lower.includes('party') || lower.includes('cocktail') || lower.includes('evening')) {
        reply = "For an evening dinner or cocktail party in Sri Lanka, a breathable silk slip dress with delicate gold jewelry and minimalist strappy heels creates an effortlessly chic and timeless aesthetic.";
      } else if (lower.includes('wedding') || lower.includes('formal') || lower.includes('ceremony')) {
        reply = "For a formal wedding celebration, an elegant tailored silhouette with rich textures and subtle drape pairs wonderfully with statement earrings and a structured clutch.";
      } else if (lower.includes('gym') || lower.includes('workout') || lower.includes('active') || lower.includes('casual')) {
        reply = "For activewear and casual weekend comfort, high-waist moisture-wicking leggings paired with an oversized cotton tee and clean sneakers will keep you effortlessly stylish and cool.";
      } else if (lower.includes('budget') || lower.includes('cheap') || lower.includes('under') || lower.includes('price')) {
        reply = "Looking for premium style on a budget? Check out our trending arrivals for versatile staples. You can also apply coupon code 'TREND10' at checkout for 10% off your entire order!";
      } else if (lower.includes('dress') || lower.includes('blazer') || lower.includes('jacket') || lower.includes('shirt') || lower.includes('pant')) {
        reply = `For ${message.trim()}, we recommend pairing structured tailoring with soft, breathable fabrics like linen or cotton to maintain comfort while keeping a sleek, modern runway silhouette.`;
      } else {
        reply = `I'd love to help you style that! Tell me more about the occasion, your preferred color palette, or fit (e.g. relaxed, tailored, or oversized), and I'll build you a cohesive look.`;
      }
    }

    // Attach relevant product recommendations only if real catalog items exist
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
        id: p._id ? p._id.toString() : p.id,
        name: p.name,
        price: p.price,
        brand: p.brand || 'TrendSprout Brand',
        image: (p.images && p.images[0]) || ''
      })).filter(p => p.image);
    } else {
      recommendedProducts = [];
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
    const { prompt, style = 'Editorial', fabric = 'Silk', colorPalette = '', shotType = 'ghost-mannequin', fitTarget = 'unisex' } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ status: 'fail', message: 'Design prompt is required' });
    }

    const enhancedPrompt = buildFashionPrompt(prompt, style, fabric, colorPalette, shotType, fitTarget);

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
