import React, { useState, useMemo } from "react";
import {
  LayoutGrid,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Search,
  PieChart,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
}

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onDeleteChat: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  sessions,
  currentSessionId,
  onNewChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");
  const [search, setSearch] = useState("");

  const filteredSessions = useMemo(() => {
    return sessions.filter((chat) =>
      chat.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [sessions, search]);

  const startEditing = (id: string, title: string) => {
    setEditingId(id);
    setTempTitle(title);
  };

  const saveEdit = () => {
    if (editingId && tempTitle.trim()) {
      onRenameChat(editingId, tempTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this chat?")) {
      onDeleteChat(id);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
        fixed lg:static top-0 left-0 h-full glass-sidebar z-50
        transform transition-all duration-500 ease-in-out
        ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "w-20" : "w-72"}
        flex flex-col group/sidebar
      `}
      >
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-400 hover:text-indigo-500 hover:scale-110 transition-all shadow-sm z-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <LayoutGrid size={22} />
            </div>
            {!isCollapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Cortex</motion.span>}
          </div>
          <button className="lg:hidden text-slate-400 hover:text-slate-600" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={`px-5 mb-6 transition-all ${isCollapsed ? "px-2" : ""}`}>
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl shadow-slate-200 ${isCollapsed ? "px-0" : "text-[13px]"}`}
          >
            <Plus size={18} />
            {!isCollapsed && <span>New Conversation</span>}
          </button>
        </div>
        {!isCollapsed && (
          <div className="px-5 mb-4">
            <div className="relative group">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-100/50 border border-transparent focus:bg-white focus:border-indigo-100 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        )}

        <div className={`px-6 mb-2 flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ${isCollapsed ? "justify-center px-0" : ""}`}>
          <History size={12} />
          {!isCollapsed && <span>Recent Chats</span>}
        </div>
        <div className="flex-grow overflow-y-auto px-3 space-y-1 custom-scrollbar">
          {filteredSessions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-slate-400 italic">No history found</p>
            </div>
          ) : (
            filteredSessions.map((chat) => {
              const isActive = chat.id === currentSessionId;
              const isEditing = editingId === chat.id;

              return (
                <div
                  key={chat.id}
                  className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-300 ${isActive
                    ? "bg-white/80 shadow-lg border border-white/60 text-indigo-600 scale-[1.02]"
                    : "text-slate-500 hover:bg-white/40 hover:text-slate-900"
                    } ${isCollapsed ? "justify-center px-0 mx-2" : "justify-between"}`}
                  onClick={() => {
                    if (!isEditing) {
                      onSelectChat(chat.id);
                      onClose();
                    }
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
                    />
                  )}

                  {isEditing ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        value={tempTitle}
                        autoFocus
                        onChange={(e) => setTempTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="text-sm bg-transparent outline-none flex-1 font-medium"
                      />
                      <button onClick={saveEdit} className="text-emerald-500"><Check size={16} /></button>
                    </div>
                  ) : (
                    <>
                      <div className={`flex items-center gap-3 flex-1 overflow-hidden`}>
                        <div className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0" />
                        {!isCollapsed && (
                          <span className="text-sm font-medium truncate">
                            {chat.title || "Untitled Chat"}
                          </span>
                        )}
                      </div>

                      {!isCollapsed && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(chat.id, chat.title);
                            }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="p-1 hover:bg-rose-50 rounded-md text-slate-400 hover:text-rose-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(chat.id);
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
        <div className={`p-5 mt-auto border-t border-slate-100 transition-all ${isCollapsed ? "p-2" : ""}`}>
          {!isCollapsed ? (
            <>
              <div className="bg-white/50 backdrop-blur-xl rounded-[2rem] p-5 border border-white/60 shadow-lg">
                <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  <PieChart size={14} className="text-indigo-400" />
                  Emotional Stability
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Neural Harmony</span>
                    <span className="font-bold text-indigo-500">84%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200/50 rounded-full overflow-hidden p-[2px]">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[84%] rounded-full shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between px-2">
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                  <Settings size={18} />
                </button>
                <span className="text-[10px] text-slate-400 font-medium">v2.0.0 Optimized</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-2">
              <button className="text-slate-400 hover:text-indigo-500 transition-colors">
                <Settings size={20} />
              </button>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}