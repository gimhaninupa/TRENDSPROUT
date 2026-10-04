import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";

interface PreloaderProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

export function Preloader({ onFinish, minDurationMs = 700 }: PreloaderProps) {
  const [progress, setProgress] = useState(15);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 25) + 15;
      });
    }, 120);

    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsVisible(false);
        if (onFinish) onFinish();
      }, 350);
    }, minDurationMs);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [minDurationMs, onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="app-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden"
          style={{
            background: "radial-gradient(circle at 50% 40%, #170932 0%, #0a0a0f 70%, #050508 100%)",
            touchAction: "none"
          }}
        >
          {/* Glowing Ambient Aura */}
          <div 
            className="absolute w-64 h-64 sm:w-96 sm:h-96 rounded-full opacity-35 blur-3xl pointer-events-none animate-pulse"
            style={{ background: "radial-gradient(circle, #6C4DF6, #9333ea)" }}
          />

          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-xs sm:max-w-sm">
            {/* Animated Glowing Logo */}
            <div className="relative mb-6">
              <div 
                className="absolute -inset-1.5 rounded-3xl opacity-75 blur-md animate-pulse"
                style={{ background: "linear-gradient(135deg, #6C4DF6, #9333ea)" }}
              />
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl sm:text-3xl font-black text-white shadow-2xl border border-white/20"
                style={{ background: "linear-gradient(135deg, #6C4DF6, #9333ea)" }}
              >
                TS
              </motion.div>
            </div>

            {/* Brand Title */}
            <motion.h1
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none mb-2"
              style={{ fontFamily: "'Clash Display', 'Inter', sans-serif" }}
            >
              TRENDSPROUT
            </motion.h1>

            {/* Subtitle Badge */}
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-purple-300 text-[11px] font-semibold mb-6"
            >
              <Sparkles size={11} className="animate-spin text-purple-400" />
              <span>AI Fashion Marketplace</span>
            </motion.div>

            {/* Slim Neon Progress Bar */}
            <div className="w-48 sm:w-56 h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, progress)}%`,
                  background: "linear-gradient(90deg, #6C4DF6, #a855f7, #ec4899)",
                  boxShadow: "0 0 12px rgba(108, 77, 246, 0.8)",
                  transition: "width 0.2s ease-out"
                }}
              />
            </div>
            
            <p className="text-[10px] text-gray-400 mt-2.5 tracking-wider uppercase font-medium">
              Loading collections...
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
