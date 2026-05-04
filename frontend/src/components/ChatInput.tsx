import React, { useState, useRef, useEffect } from "react";
import { Send, Search, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  selectedModel: "cortex-pro" | "neural-lite";
  onModelChange: (model: "cortex-pro" | "neural-lite") => void;
  isQuotaExhausted: boolean;
}

export default function ChatInput({ onSendMessage, disabled, selectedModel, onModelChange, isQuotaExhausted }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || disabled) return;

    onSendMessage(trimmed);
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto mb-4 group">
      <form
        onSubmit={handleSubmit}
        className="glass-card !bg-white/40 !backdrop-blur-2xl rounded-[2.5rem] shadow-2xl focus-within:shadow-[0_20px_50px_rgba(31,38,135,0.15)] focus-within:border-white/60 transition-all duration-500 overflow-hidden"
      >
        <div className="flex items-end gap-3 p-4">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe how you're feeling..."
            disabled={disabled}
            className="flex-grow resize-none bg-transparent border-none focus:ring-0 text-[15px] max-h-40 overflow-y-auto placeholder-slate-400 py-3 px-2 text-slate-700"
          />

          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className={`p-3.5 rounded-full transition-all duration-300 shadow-lg ${input.trim() && !disabled
              ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-110 active:scale-95 shadow-indigo-200"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
          >
            <Send size={20} />
          </button>
        </div>

        <div className="flex items-center justify-between px-6 pb-4">
          <div className="flex gap-4">
            <button
              type="button"
              className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-500 transition-colors text-[10px] font-bold uppercase tracking-wider"
            >
              <Search size={14} />
              Patterns
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-500 transition-colors text-[10px] font-bold uppercase tracking-wider"
            >
              <Sparkles size={14} />
              Insights
            </button>
          </div>
          <div className="flex items-center gap-2 relative">
            <AnimatePresence>
              {showLimitWarning && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute bottom-full right-0 mb-3 w-64 p-3 bg-slate-900 text-white rounded-2xl shadow-2xl z-50 text-[11px] leading-relaxed"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                    <p>
                      <span className="font-bold text-amber-400">Daily Limit Reached!</span><br />
                      Cortex Pro (Gemini) is exhausted. Switched to Neural Lite for today.
                    </p>
                  </div>
                  <div className="absolute top-full right-6 w-3 h-3 bg-slate-900 rotate-45 -translate-y-1/2" />
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => {
                if (isQuotaExhausted && selectedModel === "neural-lite") {
                  setShowLimitWarning(true);
                  setTimeout(() => setShowLimitWarning(false), 3000);
                  return;
                }
                onModelChange(selectedModel === "cortex-pro" ? "neural-lite" : "cortex-pro");
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${selectedModel === "cortex-pro"
                  ? "bg-indigo-50 border-indigo-100 text-indigo-600 shadow-sm"
                  : "bg-slate-50 border-slate-100 text-slate-500"
                }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${selectedModel === "cortex-pro" ? 'bg-indigo-500' : 'bg-slate-400'}`} />
              <span className="text-[9px] font-bold uppercase tracking-[0.15em]">
                {selectedModel === "cortex-pro" ? "Cortex Pro v2.0" : "Neural Lite v1.5"}
              </span>
            </button>
          </div>
        </div>
      </form>

      <p className="text-center text-[11px] text-gray-400 mt-3">
        Press Enter to send • Shift + Enter for new line
      </p>
    </div>
  );
}