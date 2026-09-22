import { useState, useEffect } from "react";
import {
  Sparkles, RefreshCw, Download, ShoppingCart, Wand2,
  ChevronRight, CheckCircle2, Eye, Palette, Scissors
} from "lucide-react";
import { 
    Screen, purple, purpleLight, lkr, 
    Badge, StarRating, PrimaryBtn, Navbar
} from '../../components/shared';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

export function TextToDesignScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { addToCart } = useCart();
  const [stage, setStage] = useState<"prompt" | "generating" | "preview">("prompt");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Editorial");
  const [fabric, setFabric] = useState("Silk");
  const [colorPalette, setColorPalette] = useState("Jewel Tones");
  const [progress, setProgress] = useState(0);
  const [generatedResult, setGeneratedResult] = useState<any>(null);

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

  const generate = async () => {
    if (!prompt.trim()) return;
    setStage("generating");
    setProgress(15);

    try {
      const res = await api.generateDesign(prompt, style, fabric, colorPalette);
      if (res && res.data) {
        setGeneratedResult(res.data);
      }
    } catch (err) {
      console.warn("Backend unavailable, generating via direct AI engine:", err);
      const enhanced = `${prompt.trim()}, ${fabric} fabric, ${style} aesthetic, ${colorPalette} colors, full-length fashion apparel photography, studio lighting, crisp fabric details, 8k`;
      const encoded = encodeURIComponent(enhanced);
      const seed = Math.floor(Math.random() * 9999999);
      const directUrl = `https://image.pollinations.ai/prompt/${encoded}?seed=${seed}&width=800&height=1000&nologo=true&model=flux`;

      setGeneratedResult({
        imageUrl: directUrl,
        style,
        fabric,
        colorPalette,
        prompt,
        priceSuggestion: 15800,
        categorySuggestion: prompt.toLowerCase().includes('trouser') || prompt.toLowerCase().includes('pant') ? 'Bottoms' : 'Dresses',
      });
    } finally {
      setProgress(100);
      setTimeout(() => setStage("preview"), 400);
    }
  };

  const handleOrderCustom = (vendorPrice: number) => {
    const customItem = {
      id: 'custom_' + Date.now(),
      name: `Custom AI ${fabric} Design (${style})`,
      brand: 'Sprout Atelier (Custom Tailored)',
      price: vendorPrice,
      image: generatedResult?.imageUrl || "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
      size: 'M (Tailored)',
      color: colorPalette,
      qty: 1,
    };
    addToCart(customItem);
    onNavigate("cart");
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="text-to-design" onNavigate={onNavigate} role="customer" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-4 shadow-sm" style={{ background: purpleLight, color: purple }}>
            <Sparkles size={13} /> Generative AI Fashion Studio
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>Design with Words</h1>
          <p className="text-gray-500 max-w-md mx-auto">Describe your vision. Generate original high-fashion concepts powered by AI generative diffusion models.</p>
        </div>

        {stage === "prompt" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <div className="flex flex-col gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-800 block mb-2">Describe your vision</label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none transition-all"
                  placeholder="e.g. Minimalist botanical streetwear piece with Japanese calligraphy and subtle lavender gradient…"
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Aesthetic Style</label>
                  <select value={style} onChange={e => setStyle(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-purple-400">
                    {["Editorial", "Minimal", "Bold", "Classic", "Avant-garde", "Streetwear"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Fabric Material</label>
                  <select value={fabric} onChange={e => setFabric(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-purple-400">
                    {["Organic Cotton", "Heavyweight Jersey", "Silk", "Linen", "Wool Blend", "Velvet", "Denim"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Color Palette</label>
                  <select value={colorPalette} onChange={e => setColorPalette(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-purple-400">
                    {["Jewel Tones", "Monochrome", "Earth Tones", "Pastels", "Midnight Noir"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Prompt inspirations</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Minimalist geometric lotus blossom with vintage typography",
                    "Retro 90s cyber-streetwear aesthetic in neon teal",
                    "Monochrome charcoal sketch of tropical palm silhouettes",
                    "Japanese wave engraving with metallic bronze accents"
                  ].map(ex => (
                    <button key={ex} onClick={() => setPrompt(ex)} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-all bg-gray-50 cursor-pointer">
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
              <PrimaryBtn onClick={generate} className="w-full !py-4 !rounded-2xl !text-base" icon={<Wand2 size={18} />}>
                Generate AI Fashion Concept
              </PrimaryBtn>
            </div>
          </div>
        )}

        {stage === "generating" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center text-white shadow-xl shadow-purple-200" style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)` }}>
              <Wand2 size={32} className="animate-pulse" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>Synthesizing Fashion Garment…</h3>
            <p className="text-sm text-gray-400 mb-8">Rendering realistic {fabric.toLowerCase()} drapery, studio lighting, and silhouette…</p>
            <div className="w-full max-w-md mx-auto h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${purple}, #9333ea)` }} />
            </div>
            <p className="text-xs font-bold text-purple-700">{progress}% complete</p>
          </div>
        )}

        {stage === "preview" && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Visual Display: High Resolution AI Generated Concept */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
              <div className="p-3.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-purple-600" />
                  Photorealistic AI Generated Piece
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800">
                  8K Resolution
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
                    AI Generative Design
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 flex gap-2">
                <button onClick={() => setStage("prompt")} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:border-purple-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                  <RefreshCw size={14} /> New Prompt
                </button>
                <button onClick={generate} className="flex-1 py-2.5 rounded-xl border border-purple-200 bg-purple-50 text-xs font-semibold text-purple-700 hover:bg-purple-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                  <Sparkles size={14} /> Regenerate
                </button>
                <a
                  href={generatedResult?.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  download="trendsprout-fashion.png"
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:border-purple-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={14} /> Download
                </a>
              </div>
            </div>

            {/* Right Column: Specifications & Production */}
            <div className="flex flex-col gap-5">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-1">Generated Design Specifications</h3>
                <p className="text-sm text-gray-600 mb-4">{prompt}</p>
                <div className="flex flex-wrap gap-2">
                  {[style, fabric, colorPalette, "Made-to-Order", "Colombo Artisans"].map(t => (
                    <span key={t} className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: purpleLight, color: purple }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-1">Tailoring & Production Quotes</h3>
                <p className="text-xs text-gray-400 mb-4">Select an artisan partner to manufacture your custom piece:</p>
                {[
                  { brand: "Atelier Nord", price: 15800, delivery: "5–7 days", rating: 4.9 },
                  { brand: "Nouveau Collective", price: 18500, delivery: "3–4 days", rating: 5.0 },
                  { brand: "Veloce Tailoring", price: 13200, delivery: "7–10 days", rating: 4.8 },
                ].map(v => (
                  <div key={v.brand} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{v.brand}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating rating={v.rating} />
                        <span className="text-xs text-gray-400">Est. {v.delivery}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{lkr(v.price)}</p>
                      <button onClick={() => handleOrderCustom(v.price)} className="text-xs font-semibold text-purple-600 hover:underline cursor-pointer">
                        Order Quote →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <PrimaryBtn onClick={() => handleOrderCustom(15800)} className="w-full !py-4 !rounded-2xl !text-base" icon={<ShoppingCart size={18} />}>
                Order Custom Piece ({lkr(15800)})
              </PrimaryBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
