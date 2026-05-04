import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, Sparkles, Send, Plus, BrainCircuit, X } from "lucide-react";
import Sidebar from "./components/Sidebar";
import ChatInput from "./components/ChatInput";
import MessageItem from "./components/MessageItem";
import NeuralBackground from "./components/NeuralBackground";
import { Message, ChatResponse } from "./types";

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentMood, setCurrentMood] = useState("neutral");
  const [usage, setUsage] = useState({ remaining: 0, limit: 10 });
  const [selectedModel, setSelectedModel] = useState<"cortex-pro" | "neural-lite">("cortex-pro");

  const scrollRef = useRef<HTMLDivElement>(null);
  const currentSession = sessions.find(s => s.id === currentSessionId);
  useEffect(() => {
    const saved = localStorage.getItem("chat_sessions");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
    }
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/usage")
      .then(res => res.json())
      .then(data => {
        setUsage(data);
        if (data.remaining === 0) {
          setSelectedModel("neural-lite");
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    localStorage.setItem("chat_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [sessions, isLoading]);

  useEffect(() => {
    if (currentSession && currentSession.messages.length > 0) {
      const lastAiMsg = [...currentSession.messages].reverse().find(m => m.sender === "ai");
      if (lastAiMsg?.analysis?.detected_emotion) {
        setCurrentMood(lastAiMsg.analysis.detected_emotion);
      }
    }
  }, [currentSession]);

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Conversation",
      messages: [],
      createdAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setSidebarOpen(false);
    setCurrentMood("neutral");
  };

  const handleSendMessage = async (text: string) => {
    if (!currentSessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: Date.now(),
    };

    setSessions(prev => prev.map(s =>
      s.id === currentSessionId ? { ...s, messages: [...s.messages, userMessage] } : s
    ));

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          model: selectedModel
        }),
      });

      if (!res.ok) throw new Error("Server error");
      const data: ChatResponse = await res.json();

      const aiMessage: Message = {
        id: Date.now().toString(),
        sender: "ai",
        text: data.response,
        timestamp: Date.now(),
        analysis: data.analysis,
        state: data.state,
        action: data.action
      };

      setSessions(prev => prev.map(s =>
        s.id === currentSessionId ? { ...s, messages: [...s.messages, aiMessage], title: s.messages.length === 0 ? text.slice(0, 30) + "..." : s.title } : s
      ));
      if (data.remaining !== undefined) {
        setUsage(prev => ({ ...prev, remaining: data.remaining! }));
        if (data.remaining === 0) {
          setSelectedModel("neural-lite");
        }
      }
    } catch (err) {
      setError("Failed to connect to Mood AI Engine.");
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodGradient = () => {
    switch (currentMood) {
      case "happy": return "bg-yellow-50/30";
      case "sad": return "bg-blue-50/30";
      case "angry": return "bg-red-50/30";
      case "anxious": return "bg-purple-50/30";
      default: return "bg-slate-50/30";
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden flex relative">
      <NeuralBackground mood={currentMood} />

      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onSelectChat={(id) => { setCurrentSessionId(id); setSidebarOpen(false); }}
        onDeleteChat={(id) => setSessions(prev => prev.filter(s => s.id !== id))}
        onRenameChat={(id, title) => setSessions(prev => prev.map(s => s.id === id ? { ...s, title } : s))}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/20 glass-sidebar z-20 backdrop-blur-2xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <BrainCircuit size={16} className="text-indigo-500" />
                Mood Intelligence
              </h2>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLoading ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                  {isLoading ? 'Processing Neural Patterns' : 'System Ready'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="glass-pill flex items-center gap-3">
              <div className="flex flex-col items-end border-r border-slate-200 pr-3 mr-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Free Tier</span>
                <span className={`text-[10px] font-bold ${usage.remaining < 5 ? 'text-rose-500 animate-pulse' : 'text-slate-600'}`}>
                  {usage.remaining} / {usage.limit} left
                </span>
              </div>
              <div
                className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] mood-pulse`}
                style={{ backgroundColor: `hsl(var(--mood-${currentMood}))` }}
              />
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                {currentMood} state
              </span>
            </div>
          </div>
        </header>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-8 space-y-2 custom-scrollbar"
        >
          <div className="max-w-3xl mx-auto flex flex-col min-h-full">
            <AnimatePresence mode="popLayout">
              {!currentSession || currentSession.messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-12"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-2xl mb-6 animate-bounce">
                    <Sparkles size={40} />
                  </div>
                  <h1 className="text-3xl font-display font-bold text-slate-800 mb-3 tracking-tight">
                    How are you feeling today?
                  </h1>
                  <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                    I'm here to listen, analyze, and help you navigate your emotions through neural pattern recognition.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-10 w-full max-w-md">
                    {["I'm feeling a bit overwhelmed", "Just had a great day!", "Need someone to talk to", "Not sure how I feel"].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSendMessage(suggestion)}
                        className="p-4 rounded-2xl bg-white border border-slate-100 text-sm text-slate-600 hover:border-indigo-200 hover:shadow-md transition-all text-left"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                currentSession.messages.map((msg) => (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    onFeedback={(reward) => {
                      fetch("http://127.0.0.1:8000/feedback", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ state: msg.state, action: msg.action, reward })
                      });
                    }}
                  />
                ))
              )}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-slate-400 text-[12px] font-medium ml-14 mt-2"
              >
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                </div>
                Analyzing emotions...
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto mt-6 px-4 py-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[12px] font-medium flex items-center gap-2"
              >
                <X size={14} />
                {error}
              </motion.div>
            )}
          </div>
        </div>
        <div className="p-6 lg:p-10 bg-transparent">
          <div className="max-w-3xl mx-auto relative">
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isLoading}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              isQuotaExhausted={usage.remaining === 0}
            />
            <p className="text-center text-[10px] text-slate-400 mt-4 font-medium uppercase tracking-[0.2em]">
              AI Powered Emotional Intelligence Engine
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}