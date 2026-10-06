import { useState, useEffect } from "react";
import {
  Sparkles, RefreshCw, Download, Wand2,
  ChevronRight, Share2, Check,
  ChevronDown, Sliders, Sparkle, ArrowRight, Lightbulb, Compass, Copy, Eye,
  Shirt, UserCheck, ZoomIn, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Screen, purple, purpleLight, purpleDark, lkr, 
  Badge, PrimaryBtn, GhostBtn, Navbar
} from '../../components/shared';
import api from '../../services/api';

// Everyday relatable starter prompt ideas for non-fashion experts
const EVERYDAY_PROMPTS = [
  {
    icon: "👔",
    title: "Black Long-Sleeve Shirt",
    text: "Tailored long-sleeve black button-up shirt with structured collar and buttoned cuffs in crisp cotton"
  },
  {
    icon: "🖤",
    title: "Streetwear Graphic Hoodie",
    text: "Oversized washed black heavyweight hoodie with minimalist dragon line art on the back and dropped shoulders"
  },
  {
    icon: "🌴",
    title: "Breezy Sunset Beach Shirt",
    text: "Relaxed open-collar linen vacation shirt with subtle abstract tropical palm leaf prints in warm terracotta"
  },
  {
    icon: "☕",
    title: "Cozy Minimalist Daily Tee",
    text: "Clean boxy crewneck t-shirt in cream off-white with subtle tonal embroidery on the chest pocket"
  },
  {
    icon: "👗",
    title: "Silk Evening Slip Dress",
    text: "Fluid cowl-neck emerald green silk slip dress with delicate cross-back straps and a subtle side slit"
  },
  {
    icon: "⚡",
    title: "Cyberpunk Techwear Jacket",
    text: "Matte black waterproof hooded jacket with neon purple waterproof zippers and utilitarian cargo straps"
  }
];

const SHOT_TYPES = [
  {
    id: "ghost-mannequin",
    label: "Studio Product",
    desc: "Clean garment on neutral studio backdrop",
    icon: <Shirt size={16} />
  },
  {
    id: "model",
    label: "Fashion Model",
    desc: "Real runway model wearing the piece",
    icon: <UserCheck size={16} />
  },
  {
    id: "macro",
    label: "Fabric & Detail",
    desc: "Close-up macro texture & stitching",
    icon: <ZoomIn size={16} />
  }
];

const FIT_TARGETS = [
  { id: "unisex", label: "Unisex Fit" },
  { id: "mens", label: "Men's Collection" },
  { id: "womens", label: "Women's Collection" }
];

// Helper to normalize typos and expand plain everyday phrases into photorealistic fashion studio prompts
const expandPromptWithMagic = (raw: string, shotType = "ghost-mannequin", fitTarget = "unisex"): string => {
  let clean = raw.trim();
  if (!clean) {
    clean = "Classic tailored long-sleeve black button-up shirt with crisp collar";
  }

  // Normalize common informal terms
  clean = clean
    .replace(/\bsleev\b/gi, 'sleeve')
    .replace(/\bsleved\b/gi, 'sleeved')
    .replace(/\bskinner\b/gi, 'ribbed sleeveless tank top')
    .replace(/\bpant\b/gi, 'trousers')
    .replace(/\btee\b/gi, 't-shirt');

  const lower = clean.toLowerCase();
  let garmentContext = clean;

  if (lower.includes("long sleeve") || lower.includes("button-up") || lower.includes("shirt")) {
    if (!lower.includes("collar")) garmentContext = `${clean}, structured Italian spread collar, barrel button cuffs, tailored back yoke`;
  } else if (lower.includes("hoodie") || lower.includes("sweater")) {
    if (!lower.includes("fleece")) garmentContext = `${clean}, 450gsm heavyweight French terry fleece, double-stitched hood, ribbed cuffs`;
  } else if (lower.includes("dress") || lower.includes("slip")) {
    if (!lower.includes("silk") && !lower.includes("satin")) garmentContext = `${clean}, fluid drapery, bias cut, delicate seam finish`;
  }

  const genderStr = fitTarget === 'mens' ? 'male model' : fitTarget === 'womens' ? 'female model' : 'fashion model';

  if (shotType === 'model') {
    return `Full length commercial fashion lookbook photography of a professional ${genderStr} wearing ${garmentContext}, clean neutral studio background, 35mm DSLR, softbox studio lighting, photorealistic skin and crisp fabric texture, Vogue catalog style, no anime, no 3D render, no CGI`;
  } else if (shotType === 'macro') {
    return `Macro detail apparel photography of ${garmentContext}, extreme close-up focus on textured fabric weave, fine stitching, button hardware, shallow depth of field`;
  }

  // Default: Ghost Mannequin / Clean Studio E-Commerce Product Shot
  return `Front-view professional ghost-mannequin e-commerce product photography of ${garmentContext}, centered garment, clean light-grey seamless studio backdrop, crisp fabric texture, sharp collar and seams, soft studio shadows, 8k online fashion store catalog listing, no human face, no anime, no illustration, no 3D cartoon`;
};

export function TextToDesignScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [stage, setStage] = useState<"prompt" | "generating" | "preview">("prompt");
  const [prompt, setPrompt] = useState("");
  const [shotType, setShotType] = useState("ghost-mannequin");
  const [fitTarget, setFitTarget] = useState("unisex");
  
  // Technical dropdowns defaulted to "✨ AI Auto-Detect"
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [style, setStyle] = useState("✨ AI Auto-Detect (Recommended)");
  const [fabric, setFabric] = useState("✨ AI Auto-Detect (Recommended)");
  const [colorPalette, setColorPalette] = useState("✨ AI Auto-Detect (Recommended)");
  
  const [progress, setProgress] = useState(0);
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  useEffect(() => {
    if (stage === "generating") {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 95) {
            clearInterval(interval);
            return 95;
          }
          return p + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [stage]);

  const handleMagicEnhance = () => {
    if (!prompt.trim()) {
      setPrompt("Tailored long-sleeve black button-up shirt with structured collar");
      return;
    }
    setIsEnhancing(true);
    setTimeout(() => {
      setPrompt(prev => {
        let cleaned = prev
          .replace(/\bsleev\b/gi, 'sleeve')
          .replace(/\bskinner\b/gi, 'ribbed sleeveless tank top')
          .replace(/\bpant\b/gi, 'trousers');
        if (!cleaned.toLowerCase().includes("tailored") && !cleaned.toLowerCase().includes("oversized")) {
          cleaned = `Tailored ${cleaned}`;
        }
        return cleaned;
      });
      setIsEnhancing(false);
    }, 350);
  };

  const generate = async () => {
    if (!prompt.trim()) return;
    setStage("generating");
    setProgress(15);

    // If technical dropdowns are on auto, extract friendly labels for preview
    const effectiveStyle = style.includes("Auto") ? "Modern Tailoring" : style;
    const effectiveFabric = fabric.includes("Auto") ? "Premium Textile" : fabric;
    const effectivePalette = colorPalette.includes("Auto") ? "True Colorway" : colorPalette;

    const enhancedPrompt = expandPromptWithMagic(prompt, shotType, fitTarget);
    const encoded = encodeURIComponent(enhancedPrompt);
    const seed = Math.floor(Math.random() * 9999999);
    const directUrl = `https://image.pollinations.ai/prompt/${encoded}?seed=${seed}&width=800&height=1000&nologo=true&model=flux`;

    const lowerP = prompt.toLowerCase();
    let categorySuggestion = 'Dresses';
    if (lowerP.includes('jacket') || lowerP.includes('coat')) categorySuggestion = 'Jackets & Coats';
    else if (lowerP.includes('blazer')) categorySuggestion = 'Blazers';
    else if (lowerP.includes('hoodie') || lowerP.includes('sweat')) categorySuggestion = 'Hoodies & Sweats';
    else if (lowerP.includes('pant') || lowerP.includes('trouser') || lowerP.includes('jean')) categorySuggestion = 'Pants & Trousers';
    else if (lowerP.includes('shirt') || lowerP.includes('tee')) categorySuggestion = 'Shirts';

    const fallbackData = {
      imageUrl: directUrl,
      style: effectiveStyle,
      fabric: effectiveFabric,
      colorPalette: effectivePalette,
      displayStyle: effectiveStyle,
      displayFabric: effectiveFabric,
      displayPalette: effectivePalette,
      prompt: prompt,
      categorySuggestion: categorySuggestion,
      shotType: shotType,
      fitTarget: fitTarget
    };

    // Preload image in browser memory so when preview opens, image renders instantly
    const preloadPromise = new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = directUrl;
      // timeout after 2.5s max
      setTimeout(() => resolve(), 2500);
    });

    // Try API with a 2.5s timeout, if backend is sleeping or slow, immediately use client visual engine
    const apiPromise = api.generateDesign(prompt, style, fabric, colorPalette, shotType, fitTarget)
      .catch(() => null);

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));

    try {
      const res: any = await Promise.race([apiPromise, timeoutPromise]);
      if (res && res.data && res.data.imageUrl) {
        setGeneratedResult({
          ...res.data,
          displayStyle: effectiveStyle,
          displayFabric: effectiveFabric,
          displayPalette: effectivePalette,
          shotType: shotType,
          fitTarget: fitTarget
        });
      } else {
        setGeneratedResult(fallbackData);
      }
    } catch {
      setGeneratedResult(fallbackData);
    }

    await preloadPromise;
    setProgress(100);
    setTimeout(() => {
      setStage("preview");
    }, 250);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#faf9fe]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="text-to-design" onNavigate={onNavigate} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header Hero */}
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 shadow-sm" style={{ background: purpleLight, color: purple }}>
            <Sparkles size={13} />
            <span>AI TEXT TO FASHION STUDIO</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 mb-3 tracking-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Design with Words
          </h1>
          <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
            Describe any clothing item in plain words. Choose a clean product shot or model view to generate photorealistic store-ready apparel concepts.
          </p>
        </div>

        {stage === "prompt" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-100/80 p-6 sm:p-8 shadow-xl shadow-purple-900/5 max-w-3xl mx-auto"
          >
            <div className="flex flex-col gap-6">
              {/* Step 1: Prompt Input Box */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-black">1</span>
                    Describe what you want to create
                  </label>
                  <button
                    type="button"
                    onClick={handleMagicEnhance}
                    disabled={isEnhancing}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                    title="Fix typos and enrich fashion details"
                  >
                    <Sparkles size={13} className={isEnhancing ? "animate-spin" : "text-purple-600"} />
                    <span>{isEnhancing ? "Refining..." : "✨ Auto-Refine"}</span>
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 p-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none transition-all"
                    placeholder="e.g. A long sleeve black shirt with clean collar, a cozy oversized beige hoodie, an emerald silk cocktail dress..."
                  />
                  {prompt && (
                    <button
                      onClick={() => setPrompt("")}
                      className="absolute top-3 right-3 text-xs text-gray-400 hover:text-gray-600 bg-white/80 px-2 py-0.5 rounded-md"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Step 2: Presentation & View Style */}
              <div>
                <label className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-black">2</span>
                  How would you like to view the design?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {SHOT_TYPES.map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setShotType(st.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        shotType === st.id
                          ? "border-purple-600 bg-purple-50/70 shadow-sm ring-1 ring-purple-500"
                          : "border-gray-200/80 bg-gray-50/40 hover:bg-gray-50 hover:border-purple-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`p-1.5 rounded-lg ${shotType === st.id ? "bg-purple-600 text-white" : "bg-gray-200/70 text-gray-600"}`}>
                          {st.icon}
                        </span>
                        {shotType === st.id && (
                          <span className="text-purple-600 text-xs font-black">● Active</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{st.label}</p>
                        <p className="text-[11px] text-gray-500 leading-tight">{st.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Target Department / Fit */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Target Department
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  {FIT_TARGETS.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFitTarget(f.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        fitTarget === f.id
                          ? "border-purple-600 bg-purple-600 text-white shadow-sm"
                          : "border-gray-200 text-gray-600 hover:border-purple-200 bg-white"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Starter Ideas for Everyday Users */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb size={13} className="text-amber-500" />
                    <span>Instant Idea Starters (Tap to try)</span>
                  </label>
                  <span className="text-[11px] text-gray-400">1-click fill</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EVERYDAY_PROMPTS.map((ex, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPrompt(ex.text)}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer group flex items-start gap-2.5 ${
                        prompt === ex.text 
                          ? "border-purple-600 bg-purple-50/80 shadow-sm" 
                          : "border-gray-100 bg-gray-50/50 hover:bg-purple-50/40 hover:border-purple-200"
                      }`}
                    >
                      <span className="text-base shrink-0 mt-0.5">{ex.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{ex.title}</p>
                        <p className="text-[11px] text-gray-500 line-clamp-1">{ex.text}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Collapsible Pro Customization for Advanced Users */}
              <div className="border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(prev => !prev)}
                  className="w-full flex items-center justify-between py-2 px-1 text-xs font-bold text-gray-600 hover:text-purple-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sliders size={14} className="text-purple-600" />
                    <span>Fine-Tune Details & Pro Fabrics (Optional)</span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-500 font-medium">
                      {showAdvanced ? "Expanded" : "AI Auto-Decide Active"}
                    </span>
                  </div>
                  <ChevronDown size={15} className={`transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden pt-3"
                    >
                      <div className="grid sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide block mb-1.5">Aesthetic Style</label>
                          <select
                            value={style}
                            onChange={e => setStyle(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-purple-500"
                          >
                            <option>✨ AI Auto-Detect (Recommended)</option>
                            <option>Classic Tailored</option>
                            <option>Modern Minimalist</option>
                            <option>Quiet Luxury & Old Money</option>
                            <option>Streetwear & Urban</option>
                            <option>Boho Resort & Linen</option>
                            <option>Bold Avant-Garde</option>
                            <option>Y2K Glam & Night</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide block mb-1.5">Fabric Material</label>
                          <select
                            value={fabric}
                            onChange={e => setFabric(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-purple-500"
                          >
                            <option>✨ AI Auto-Detect (Recommended)</option>
                            <option>100% Organic Combed Cotton</option>
                            <option>Heavyweight French Terry</option>
                            <option>Mulberry Silk & Satin</option>
                            <option>Pure Coastal Linen</option>
                            <option>Japanese Raw Denim</option>
                            <option>Fine Wool Blend</option>
                            <option>Velvet & Velour</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide block mb-1.5">Color Palette</label>
                          <select
                            value={colorPalette}
                            onChange={e => setColorPalette(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-purple-500"
                          >
                            <option>✨ AI Auto-Detect (Recommended)</option>
                            <option>Monochrome & Slate Noir</option>
                            <option>Earthy Sand & Terracotta</option>
                            <option>Pastel Dream & Lilac</option>
                            <option>Jewel Tones (Emerald/Ruby)</option>
                            <option>Sunset Hues & Warm Gold</option>
                            <option>Cyberpunk Neon & Purple</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Main Generate Button */}
              <PrimaryBtn
                onClick={generate}
                className="w-full !py-4 !rounded-2xl !text-base shadow-xl shadow-purple-500/25 cursor-pointer group"
                icon={<Wand2 size={19} className="group-hover:rotate-12 transition-transform" />}
              >
                Generate AI Fashion Concept
              </PrimaryBtn>
            </div>
          </motion.div>
        )}

        {/* Loading Animation */}
        {stage === "generating" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-gray-100 p-10 sm:p-14 text-center shadow-xl max-w-md mx-auto"
          >
            <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center text-white shadow-xl shadow-purple-500/30" style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)` }}>
              <Wand2 size={32} className="animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Synthesizing Fashion Garment…
            </h3>
            <p className="text-xs text-gray-400 mb-8 max-w-xs mx-auto">
              {shotType === "ghost-mannequin" 
                ? "Rendering clean studio e-commerce apparel presentation…" 
                : shotType === "model" 
                ? "Simulating runway fashion model lookbook shoot…" 
                : "Rendering macro fabric weave and stitching details…"}
            </p>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${purple}, #9333ea)` }} />
            </div>
            <p className="text-xs font-bold text-purple-700">{progress}% complete</p>
          </motion.div>
        )}

        {/* Preview Screen */}
        {stage === "preview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-2 gap-8">
            {/* Visual Display: High Resolution AI Generated Concept */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xl shadow-purple-950/5 flex flex-col">
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-purple-600" />
                  {shotType === "ghost-mannequin" ? "Studio Product Render" : shotType === "model" ? "Fashion Model Lookbook" : "Macro Fabric Render"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800">
                  8K Studio Quality
                </span>
              </div>

              <div className="aspect-[4/5] bg-gray-900 relative flex items-center justify-center overflow-hidden group">
                <img
                  src={generatedResult?.imageUrl}
                  alt="Fashion design concept"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    if (generatedResult?.imageUrl) {
                      (e.target as HTMLImageElement).src = generatedResult.imageUrl;
                    }
                  }}
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="purple">
                    {shotType === "ghost-mannequin" ? "E-Commerce Product" : "Runway Concept"}
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 flex gap-2">
                <button
                  onClick={() => setStage("prompt")}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:border-purple-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw size={14} /> New Prompt
                </button>
                <button
                  onClick={generate}
                  className="flex-1 py-2.5 rounded-xl border border-purple-200 bg-purple-50 text-xs font-semibold text-purple-700 hover:bg-purple-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles size={14} /> Regenerate
                </button>
                <a
                  href={generatedResult?.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  download="trendsprout-fashion-concept.png"
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:border-purple-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={14} /> Download
                </a>
              </div>
            </div>

            {/* Right Column: Concept Specifications & Studio Actions */}
            <div className="flex flex-col gap-5">
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Design Specifications</span>
                  <button onClick={handleShare} className="text-xs text-gray-400 hover:text-purple-600 flex items-center gap-1 cursor-pointer">
                    <Share2 size={13} /> {copiedLink ? "Link Copied!" : "Share"}
                  </button>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 leading-snug">{prompt}</h3>
                
                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Presentation</span>
                    <span className="text-xs font-bold text-gray-800">
                      {shotType === "ghost-mannequin" ? "Studio Product" : shotType === "model" ? "Fashion Model" : "Macro Detail"}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Department</span>
                    <span className="text-xs font-bold text-gray-800">
                      {fitTarget === "mens" ? "Men's Collection" : fitTarget === "womens" ? "Women's Collection" : "Unisex"}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Fabric Finish</span>
                    <span className="text-xs font-bold text-gray-800">{generatedResult?.displayFabric || fabric}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Garment Category</span>
                    <span className="text-xs font-bold text-gray-800">{generatedResult?.categorySuggestion || 'Apparel'}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  Photorealistic apparel concept rendered with seamless studio lighting, authentic textile drape, and 8K catalog clarity.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
export default TextToDesignScreen;
