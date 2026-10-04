import { useState, useEffect } from "react";
import {
  Sparkles, RefreshCw, Download, Wand2,
  ChevronRight, CheckCircle2, Bookmark, Share2, PlusCircle, Store, Check
} from "lucide-react";
import { 
    Screen, purple, purpleLight, lkr, 
    Badge, PrimaryBtn, GhostBtn, Navbar
} from '../../components/shared';
import api from '../../services/api';

export function TextToDesignScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [stage, setStage] = useState<"prompt" | "generating" | "preview">("prompt");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Editorial");
  const [fabric, setFabric] = useState("Silk");
  const [colorPalette, setColorPalette] = useState("Jewel Tones");
  const [progress, setProgress] = useState(0);
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [savedToLookbook, setSavedToLookbook] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
    setSavedToLookbook(false);

    try {
      const res = await api.generateDesign(prompt, style, fabric, colorPalette);
      if (res && res.data) {
        setGeneratedResult(res.data);
      }
    } catch (err) {
      console.warn("Generating via AI visual engine:", err);
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
        categorySuggestion: prompt.toLowerCase().includes('trouser') || prompt.toLowerCase().includes('pant') ? 'Bottoms' : 'Dresses',
      });
    } finally {
      setProgress(100);
      setTimeout(() => setStage("preview"), 400);
    }
  };

  const handleSaveToLookbook = () => {
    if (!generatedResult) return;
    try {
      const saved = localStorage.getItem('ts_saved_lookbook');
      const list = saved ? JSON.parse(saved) : [];
      const item = {
        id: 'lookbook_' + Date.now(),
        prompt: prompt,
        image: generatedResult.imageUrl,
        style,
        fabric,
        colorPalette,
        createdAt: new Date().toISOString()
      };
      list.unshift(item);
      localStorage.setItem('ts_saved_lookbook', JSON.stringify(list));
      setSavedToLookbook(true);
      setTimeout(() => setSavedToLookbook(false), 2500);
    } catch {}
  };

  const handlePublishAsProduct = () => {
    if (!generatedResult) return;
    try {
      // Pre-fill vendor draft with generated design
      const draft = {
        name: `${style} ${fabric} Concept`,
        description: `Original AI generated design concept: ${prompt}. Tailored with premium ${fabric} material.`,
        image: generatedResult.imageUrl,
        category: generatedResult.categorySuggestion || 'Apparel',
      };
      localStorage.setItem('ts_vendor_draft', JSON.stringify(draft));
      onNavigate("vendor-add-product");
    } catch {
      onNavigate("vendor-add-product");
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="text-to-design" onNavigate={onNavigate} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-4 shadow-sm" style={{ background: purpleLight, color: purple }}>
            <Sparkles size={13} /> Generative AI Fashion Studio
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>Design with Words</h1>
          <p className="text-gray-500 max-w-md mx-auto">Describe your aesthetic vision. Generate original high-fashion concepts powered by AI generative diffusion models.</p>
        </div>

        {stage === "prompt" && (
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex flex-col gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-800 block mb-2">Describe your fashion concept</label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none transition-all"
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
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
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
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-purple-600" />
                  AI Concept Render
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800">
                  8K Studio Model
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
                  <button onClick={handleShare} className="text-xs text-gray-400 hover:text-purple-600 flex items-center gap-1">
                    <Share2 size={13} /> {copiedLink ? "Link Copied!" : "Share"}
                  </button>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{prompt}</h3>
                
                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-[11px] text-gray-400 font-medium block">Aesthetic Style</span>
                    <span className="text-xs font-bold text-gray-800">{style}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-[11px] text-gray-400 font-medium block">Target Fabric</span>
                    <span className="text-xs font-bold text-gray-800">{fabric}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-[11px] text-gray-400 font-medium block">Color Harmony</span>
                    <span className="text-xs font-bold text-gray-800">{colorPalette}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-[11px] text-gray-400 font-medium block">Garment Type</span>
                    <span className="text-xs font-bold text-gray-800">{generatedResult?.categorySuggestion || 'Apparel'}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  This original concept was synthesized using neural fashion diffusion. Save it to your lookbook or export it directly into your Vendor Studio to set real inventory and publish for sale.
                </p>
              </div>

              {/* Action Cards */}
              <div className="space-y-3">
                <button
                  onClick={handleSaveToLookbook}
                  className="w-full py-3.5 px-5 rounded-2xl bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-800 font-bold text-xs transition-all flex items-center justify-between cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <Bookmark size={16} className={savedToLookbook ? "text-purple-600 fill-purple-600" : "text-purple-600"} />
                    <span>{savedToLookbook ? "Saved to Lookbook & Moodboard!" : "Save Concept to Lookbook"}</span>
                  </div>
                  {savedToLookbook && <Check size={16} className="text-emerald-500" />}
                </button>

                <button
                  onClick={handlePublishAsProduct}
                  className="w-full py-4 px-5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all flex items-center justify-between cursor-pointer shadow-xl shadow-purple-500/20"
                >
                  <div className="flex items-center gap-2.5">
                    <Store size={16} />
                    <span>Publish as Store Product in Vendor Studio</span>
                  </div>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default TextToDesignScreen;
