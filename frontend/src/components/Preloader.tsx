import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";

interface PreloaderProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

const statusPhrases = [
  "Curating Designer Runway Drops…",
  "Calibrating AI Neural Stylist…",
  "Harmonizing Atelier Fabrics…",
  "Launching TRENDSPROUT Studio…"
];

export function Preloader({ onFinish, minDurationMs = 1100 }: PreloaderProps) {
  const [progress, setProgress] = useState(12);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Smooth progress increment
    const intervalTime = 40;
    const totalSteps = minDurationMs / intervalTime;
    const stepIncrement = 100 / totalSteps;

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) return 98;
        const jitter = (Math.random() * 2 - 1) * 0.5;
        return Math.min(98, prev + stepIncrement + jitter);
      });
    }, intervalTime);

    // Dynamic phrase cycling
    const phraseInterval = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % statusPhrases.length);
    }, minDurationMs / 3.5);

    // Finish sequence
    const finishTimer = setTimeout(() => {
      setProgress(100);
      clearInterval(progressTimer);
      clearInterval(phraseInterval);
      setTimeout(() => {
        setIsVisible(false);
        if (onFinish) onFinish();
      }, 400);
    }, minDurationMs);

    return () => {
      clearInterval(progressTimer);
      clearInterval(phraseInterval);
      clearTimeout(finishTimer);
    };
  }, [minDurationMs, onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="luxury-light-preloader"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.03,
            filter: "blur(6px)",
            transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #faf8ff 0%, #f4f0ff 50%, #ede7ff 100%)",
            touchAction: "none"
          }}
        >
          {/* Ambient Glowing Lavender & Orchid Blurred Orbs matching Hero Section */}
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.45, 0.7, 0.45],
              rotate: [0, 90, 180]
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 -right-16 w-80 h-80 sm:w-[500px] sm:h-[500px] rounded-full blur-[110px] pointer-events-none"
            style={{
              background: "radial-gradient(circle, #c084fc 0%, #7C3AED 50%, transparent 70%)"
            }}
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.35, 0.6, 0.35],
              rotate: [180, 270, 360]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 -left-16 w-72 h-72 sm:w-[450px] sm:h-[450px] rounded-full blur-[100px] pointer-events-none"
            style={{
              background: "radial-gradient(circle, #f472b6 0%, #818cf8 50%, transparent 70%)"
            }}
          />

          {/* Floating Frosted Glass Luxury Card Centerpiece */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center text-center px-8 sm:px-12 py-10 sm:py-12 rounded-[36px] bg-white/75 backdrop-blur-2xl border border-white/90 shadow-2xl shadow-purple-600/15 max-w-sm sm:max-w-md w-[90%]"
          >
            {/* Kinetic 3D Orbital Rings with Central Logo */}
            <div className="relative mb-7 flex items-center justify-center">
              {/* Outer Dashed Orbit in Brand Violet */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-dashed border-purple-400/40"
              />

              {/* Inner Reverse Rotating Orbit with High-Fashion Satellite Beacons */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-purple-300/50"
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-purple-600 shadow-[0_0_10px_rgba(108,77,246,0.8)]" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
              </motion.div>

              {/* Core 3D Glassmorphic Emblem */}
              <div className="relative">
                <div 
                  className="absolute -inset-2.5 rounded-3xl opacity-60 blur-md animate-pulse"
                  style={{ background: "linear-gradient(135deg, #6C4DF6, #9333ea, #ec4899)" }}
                />
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl sm:text-3xl font-black text-white shadow-xl shadow-purple-600/35 border-2 border-white/60 backdrop-blur-xl overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #6C4DF6, #7C3AED)",
                  }}
                >
                  {/* Shimmer Light Bar Sweeping Across TS */}
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }}
                    className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none"
                  />
                  <span className="relative z-10 tracking-tighter" style={{ fontFamily: "'Clash Display', sans-serif" }}>TS</span>
                </motion.div>
              </div>

              {/* Twinkling Fashion Accent */}
              <motion.div 
                animate={{ scale: [0.85, 1.2, 0.85], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1.5 -right-1.5 text-purple-600 drop-shadow-[0_0_8px_rgba(108,77,246,0.6)]"
              >
                <Sparkles size={16} />
              </motion.div>
            </div>

            {/* High-Fashion Brand Title */}
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="mb-1"
            >
              <h1 
                className="text-2xl sm:text-3xl font-black text-gray-900 tracking-[0.16em] leading-none"
                style={{ fontFamily: "'Clash Display', 'Inter', sans-serif" }}
              >
                TRENDSPROUT
              </h1>
            </motion.div>

            {/* Pill Season Badge */}
            <motion.div
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/80 text-purple-700 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase mb-7 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
              <span>AI Fashion Marketplace</span>
            </motion.div>

            {/* Clean Light-Mode Progress Bar */}
            <div className="w-full space-y-2.5">
              <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-purple-100 shadow-inner">
                <motion.div
                  className="h-full rounded-full relative"
                  style={{
                    width: `${Math.min(100, Math.round(progress))}%`,
                    background: "linear-gradient(90deg, #6C4DF6 0%, #7C3AED 50%, #EC4899 100%)",
                    boxShadow: "0 0 12px rgba(108, 77, 246, 0.6)",
                    transition: "width 0.1s linear"
                  }}
                >
                  {/* Leading bead glow */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
                </motion.div>
              </div>

              {/* Status Phrase and Monospace Percentage */}
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-0.5">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={statusIndex}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.25 }}
                    className="text-purple-700 font-bold tracking-normal text-left truncate max-w-[200px] text-[11px]"
                  >
                    {statusPhrases[statusIndex]}
                  </motion.span>
                </AnimatePresence>
                
                <span className="font-mono text-purple-800 font-extrabold bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-lg text-[10px] tracking-wider shadow-sm">
                  {Math.min(100, Math.round(progress))}%
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
