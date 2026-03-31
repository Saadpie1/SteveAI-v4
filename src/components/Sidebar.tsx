import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Video, 
  Box, 
  Settings, 
  History,
  Zap,
  Shield,
  Plus,
  Trash2,
  Loader2,
  X,
  Edit2,
  Check
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { useAuth, useSidebar, useModals } from "../App";
import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { ChatSession } from "../types";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOpen, setIsOpen } = useSidebar();
  const { openSettings, openCredits, openActivity } = useModals();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const systemMenuItems = [
    { icon: History, label: "Activity", onClick: openActivity },
    { icon: Zap, label: "Credits", onClick: openCredits },
    { icon: Settings, label: "Settings", onClick: openSettings },
  ];

  useEffect(() => {
    if (!user) {
      setSessions([]);
      return;
    }

    setLoading(true);
    const path = `users/${user.uid}/sessions`;
    const q = query(collection(db, path), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sess = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatSession[];
      setSessions(sess);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    
    const path = `users/${user.uid}/sessions/${sessionId}`;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/sessions`, sessionId));
      if (location.pathname === `/chat/${sessionId}`) {
        navigate("/chat");
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const startEditing = (e: React.MouseEvent, session: ChatSession) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const saveRename = async (e: React.FormEvent | React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !editTitle.trim()) {
      setEditingId(null);
      return;
    }

    const path = `users/${user.uid}/sessions/${sessionId}`;
    try {
      await updateDoc(doc(db, `users/${user.uid}/sessions`, sessionId), {
        title: editTitle.trim()
      });
      setEditingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const groupSessions = (sessions: ChatSession[]) => {
    const groups: { [key: string]: ChatSession[] } = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const last7Days = today - 86400000 * 7;

    sessions.forEach(session => {
      const date = session.createdAt;
      let label = "Older";
      if (date >= today) label = "Today";
      else if (date >= yesterday) label = "Yesterday";
      else if (date >= last7Days) label = "Previous 7 Days";

      if (!groups[label]) groups[label] = [];
      groups[label].push(session);
    });

    return groups;
  };

  const groupedSessions = groupSessions(sessions);

  const menuItems = [
    { icon: MessageSquare, label: "Chat", path: "/chat", color: "text-blue-500" },
    { icon: ImageIcon, label: "Image", path: "/image", color: "text-purple-500" },
    { icon: Video, label: "Video", path: "/video", color: "text-red-500" },
    { icon: Box, label: "3D Gen", path: "/3d", color: "text-green-500" },
  ];

  const isChatPage = location.pathname.startsWith("/chat");
  const isImagePage = location.pathname === "/image";
  const isVideoPage = location.pathname === "/video";
  const isThreeDPage = location.pathname === "/3d";
  const hideNavbar = isChatPage || isImagePage || isVideoPage || isThreeDPage;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed left-0 top-0 bottom-0 w-72 bg-black border-r border-white/10 flex flex-col p-4 z-50 transition-transform duration-300",
        !hideNavbar && "lg:top-16",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <span className="text-xl font-bold tracking-tighter text-white">
            STEVE<span className="text-blue-500">AI</span>
          </span>
          <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <button 
          onClick={() => {
            navigate("/chat");
            setIsOpen(false);
          }}
          className="flex items-center gap-3 px-4 py-3 mb-6 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-all group"
        >
          <Plus className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
          New Chat
        </button>

        <div className="space-y-1 mb-8">
          <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">
            Orchestrator
          </p>
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group",
                location.pathname === item.path || (item.path === "/chat" && location.pathname.startsWith("/chat"))
                  ? "bg-white/5 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", item.color)} />
              {item.label}
              {(location.pathname === item.path || (item.path === "/chat" && location.pathname.startsWith("/chat"))) && (
                <motion.div
                  layoutId="active-pill"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6">
          <div>
            <div className="flex items-center justify-between px-3 mb-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                Chat History
              </p>
            </div>
            
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                </div>
              ) : sessions.length === 0 ? (
                <p className="px-3 text-[10px] text-gray-600 italic">No recent chats</p>
              ) : (
                Object.entries(groupedSessions).map(([label, groupSessions]) => (
                  <div key={label} className="space-y-1">
                    <p className="px-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">
                      {label}
                    </p>
                    {groupSessions.map((session) => (
                      <div key={session.id} className="relative group">
                        {editingId === session.id ? (
                          <form 
                            onSubmit={(e) => saveRename(e, session.id)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10"
                          >
                            <input
                              autoFocus
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onBlur={(e) => saveRename(e, session.id)}
                              className="bg-transparent text-xs text-white outline-none w-full"
                            />
                            <button type="submit" className="text-green-500 hover:text-green-400">
                              <Check className="w-3 h-3" />
                            </button>
                          </form>
                        ) : (
                          <Link
                            to={`/chat/${session.id}`}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative",
                              location.pathname === `/chat/${session.id}`
                                ? "bg-white/5 text-white"
                                : "text-gray-500 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate pr-12">{session.title}</span>
                            <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <button
                                onClick={(e) => startEditing(e, session)}
                                className="p-1 hover:text-blue-400 transition-all"
                                title="Rename"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => deleteSession(e, session.id)}
                                className="p-1 hover:text-red-500 transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">
              System
            </p>
            {systemMenuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-white">v4.0 Active</span>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Orchestrating 100+ models with proprietary routing engine.
          </p>
        </div>
      </aside>
    </>
  );
}
