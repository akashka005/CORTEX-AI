import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThumbsUp, ThumbsDown, User, Sparkles, ChevronDown, BarChart2, Copy, Check, AlertCircle } from 'lucide-react';
import NeuralPulse from './NeuralPulse';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
  onFeedback: (reward: number) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onFeedback }) => {
  const isAi = message.sender === 'ai';
  const [feedbackSent, setFeedbackSent] = useState<number | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (reward: number) => {
    if (feedbackSent !== null) return;
    setFeedbackSent(reward);
    onFeedback(reward);
  };

  const getMoodColor = (emotion: string) => {
    switch (emotion?.toLowerCase()) {
      case 'happy': return 'from-yellow-400 to-orange-500';
      case 'sad': return 'from-blue-400 to-indigo-600';
      case 'angry': return 'from-red-500 to-rose-700';
      case 'anxious': return 'from-purple-400 to-fuchsia-600';
      default: return 'from-slate-400 to-slate-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full mb-8 ${isAi ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`flex max-w-[85%] ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 ${isAi ? 'mr-4' : 'ml-4'}`}>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform hover:scale-110 ${isAi
              ? `bg-transparent`
              : 'bg-white text-slate-600 border border-slate-100 shadow-lg'
            }`}>
            {isAi ? <NeuralPulse size="sm" color={message.analysis?.detected_emotion === 'happy' ? 'amber' : 'indigo'} /> : <User size={20} />}
          </div>
        </div>
        <div className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
          <div
            className={`group relative px-6 py-4 rounded-[2rem] text-[15px] leading-relaxed transition-all duration-300 ${isAi
                ? 'bg-white/60 backdrop-blur-md text-slate-800 rounded-tl-none border border-white/40 shadow-lg'
                : 'bg-slate-900 text-white rounded-tr-none shadow-xl'
              }`}
          >
            {message.text}

            {isAi && (
              <button
                onClick={copyToClipboard}
                className="absolute -right-12 top-2 p-2 rounded-xl bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-slate-400 hover:text-indigo-500 shadow-sm"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            )}

            {message.isStreaming && (
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block w-1.5 h-4 bg-indigo-500 ml-1 align-middle rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"
              />
            )}
          </div>
          {isAi && (
            <div className="mt-3 flex flex-col items-start w-full gap-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-medium hover:bg-slate-200 transition-colors"
                >
                  <BarChart2 size={12} />
                  {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
                  <motion.div animate={{ rotate: showAnalysis ? 180 : 0 }}>
                    <ChevronDown size={12} />
                  </motion.div>
                </button>

                <div className="flex items-center gap-1 border-l pl-3 border-slate-200">
                  <button
                    onClick={() => handleFeedback(1)}
                    disabled={feedbackSent !== null}
                    className={`p-1 rounded-md transition-all hover:scale-110 ${feedbackSent === 1 ? 'text-emerald-500 bg-emerald-50' : 'text-slate-400 hover:text-emerald-500'
                      }`}
                  >
                    <ThumbsUp size={14} />
                  </button>
                  <button
                    onClick={() => handleFeedback(-1)}
                    disabled={feedbackSent !== null}
                    className={`p-1 rounded-md transition-all hover:scale-110 ${feedbackSent === -1 ? 'text-rose-500 bg-rose-50' : 'text-slate-400 hover:text-rose-500'
                      }`}
                  >
                    <ThumbsDown size={14} />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showAnalysis && message.analysis && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden w-full"
                  >
                    <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-5 mt-3 shadow-inner">
                      {message.analysis.quota_hit && (
                        <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-2 text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                          <AlertCircle size={14} />
                          Gemini Free Tier Exhausted - Using Local Engine
                        </div>
                      )}
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Sparkles size={12} className="text-indigo-400" />
                        Neural Analysis Metrics ({message.analysis.engine || 'Neural Core'})
                      </h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-[10px] font-semibold uppercase">Detected Emotion</span>
                            <span className="text-indigo-600 font-bold text-[11px] capitalize">{message.analysis.detected_emotion}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: '85%' }}
                              className={`h-full bg-gradient-to-r ${getMoodColor(message.analysis.detected_emotion)}`}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-[10px] font-semibold uppercase">AI Strategy</span>
                            <span className="text-indigo-600 font-bold text-[11px] capitalize">{message.analysis.strategy}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: '70%' }}
                              className="h-full bg-slate-400"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 px-3 py-2 bg-white/50 rounded-2xl border border-white/80">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Cluster Group</span>
                          <span className="text-slate-700 font-bold text-xs tracking-tight">Node #{message.analysis.cluster_group}</span>
                        </div>

                        <div className="flex flex-col gap-1 px-3 py-2 bg-white/50 rounded-2xl border border-white/80">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">User Intent</span>
                          <span className="text-slate-700 font-bold text-xs capitalize">{message.analysis.user_intent}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageItem;