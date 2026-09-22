import { useState, useRef, useEffect } from "react";
import {
  Send, Bot, Sparkles, ArrowRight, ShoppingBag
} from "lucide-react";
import { 
  Screen, purple, lkr, 
  Navbar, chatMessages 
} from '../../components/shared';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';

export function AIChatbotScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { addToCart } = useCart();
  const [messages, setMessages] = useState<any[]>(chatMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const send = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg = { role: "user", text: query };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const res = await api.chatWithStylist(query, messages);
      if (res?.data) {
        setMessages(prev => [
          ...prev,
          {
            role: "ai",
            text: res.data.text,
            recommendedProducts: res.data.recommendedProducts,
          }
        ]);
      }
    } catch {
      // Fallback
      setMessages(prev => [
        ...prev,
        {
          role: "ai",
          text: "For a chic Colombo event, our Linen Slip Dress (LKR 8,500) paired with an Oversized Blazer (LKR 14,500) and minimalist jewelry will keep you cool and elegantly styled!",
          recommendedProducts: [
            { name: "Linen Slip Dress", price: 8500, brand: "Aura Label", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80" }
          ]
        }
      ]);
    } finally {
      setTyping(false);
    }
  };

  const quickPrompts = [
    "Rooftop party outfit",
    "Formal wedding guest",
    "Casual weekend brunch",
    "Under LKR 10,000",
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif", background: "#f8f7ff" }}>
      <Navbar current="ai-chatbot" onNavigate={onNavigate} role="customer" />
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full pt-20 pb-0">
        <div className="px-4 py-4 border-b border-gray-100 bg-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md shadow-purple-200" style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)` }}>
              <Bot size={20} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                TRENDSPROUT AI Stylist <Sparkles size={14} className="text-amber-500 fill-amber-500" />
              </p>
              <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                Live Catalog AI Assistant
              </p>
            </div>
          </div>
          <button onClick={() => onNavigate("ai-outfit")} className="text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors">
            Try Outfit Generator →
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4" style={{ maxHeight: "calc(100vh - 230px)" }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`flex gap-3 max-w-[88%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "ai" && (
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0 mt-0.5" style={{ background: purple }}>
                    <Bot size={14} />
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "text-white rounded-tr-sm"
                      : "bg-white text-gray-800 border border-gray-100 rounded-tl-sm shadow-sm"
                  }`}
                  style={msg.role === "user" ? { background: `linear-gradient(135deg, ${purple}, #9333ea)` } : {}}
                >
                  {msg.text}
                </div>
              </div>

              {/* Recommended Product Cards inside Chat */}
              {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                <div className="mt-2 ml-11 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md w-full">
                  {msg.recommendedProducts.map((p: any, pIdx: number) => (
                    <div key={pIdx} className="bg-white rounded-xl border border-purple-100 p-2.5 flex items-center gap-2.5 shadow-sm">
                      <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-purple-600 font-bold">{lkr(p.price)}</p>
                      </div>
                      <button
                        onClick={() => addToCart(p)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-transform active:scale-90 flex-shrink-0"
                        style={{ background: purple }}
                        title="Add to cart"
                      >
                        <ShoppingBag size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {typing && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: purple }}>
                <Bot size={14} />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 shadow-sm">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 py-3 bg-white border-t border-gray-100">
          <div className="flex gap-1.5 flex-wrap mb-2">
            {quickPrompts.map(p => (
              <button
                key={p}
                onClick={() => send(p)}
                className="px-3 py-1 rounded-full text-xs font-medium border border-purple-200 text-purple-700 bg-purple-50/50 hover:bg-purple-100 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              placeholder="Ask your AI fashion stylist anything…"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: purple }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
