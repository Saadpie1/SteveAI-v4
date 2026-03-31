import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import TextareaAutosize from "react-textarea-autosize";
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Loader2, 
  Sparkles, 
  Image as ImageIcon,
  ChevronDown,
  Trash2,
  Cpu,
  LogIn,
  AlertCircle,
  Plus,
  Menu,
  Maximize2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "../lib/utils";
import { Message, MODELS, AIModel, ChatSession } from "../types";
import { getChatResponse, generateImage, fetchAvailableModels } from "../services/aiService";
import { useAuth, useSidebar, useUserSettings } from "../App";
import { Link, useParams, useNavigate } from "react-router-dom";
import { db, signInWithGoogle, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";

export default function Chat() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { settings } = useUserSettings();
  const { isOpen, setIsOpen } = useSidebar();
  const [messages, setMessages] = useState<Message[]>([]);
  const [availableModels, setAvailableModels] = useState<AIModel[]>(MODELS);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>(MODELS[0]);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadModels = async () => {
      const fetched = await fetchAvailableModels();
      setAvailableModels(fetched);
    };
    loadModels();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages from Firestore
  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }

    if (!sessionId) {
      setMessages([]);
      return;
    }

    const path = `users/${user.uid}/sessions/${sessionId}/messages`;
    const q = query(collection(db, path), orderBy("timestamp", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, [user, sessionId]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsgContent = input;
    setInput("");
    setIsLoading(true);

    let currentSessionId = sessionId;

    try {
      // 1. Create a session if it doesn't exist and user is logged in
      if (user && !currentSessionId) {
        const sessionRef = doc(collection(db, `users/${user.uid}/sessions`));
        currentSessionId = sessionRef.id;
        
        await setDoc(sessionRef, {
          id: currentSessionId,
          title: userMsgContent.slice(0, 40) + (userMsgContent.length > 40 ? "..." : ""),
          createdAt: Date.now(),
          userId: user.uid,
          lastMessage: userMsgContent
        });

        // Redirect to the new session URL
        navigate(`/chat/${currentSessionId}`, { replace: true });
      }

      const tempId = Date.now().toString();
      const newUserMsg: Message = {
        id: tempId,
        role: "user",
        content: userMsgContent,
        timestamp: Date.now(),
        userId: user?.uid || "guest"
      };

      // Optimistic update for guest
      if (!user) {
        setMessages(prev => [...prev, newUserMsg]);
      }

      // 2. Save user message to Firestore if logged in
      if (user && currentSessionId) {
        const path = `users/${user.uid}/sessions/${currentSessionId}/messages`;
        await addDoc(collection(db, path), {
          role: "user",
          content: userMsgContent,
          timestamp: Date.now(),
          userId: user.uid
        });
      }

      let responseContent = "";
      
      // Automatic image generation detection
      const imageKeywords = ["generate image", "visualize", "make a graph", "draw", "create a picture", "show me", "render"];
      const isImageRequest = imageKeywords.some(keyword => userMsgContent.toLowerCase().includes(keyword)) || 
                            userMsgContent.toLowerCase().startsWith("/image ") || 
                            selectedModel.type === 'image';

      if (isImageRequest) {
        let prompt = userMsgContent;
        if (userMsgContent.toLowerCase().startsWith("/image ")) {
          prompt = userMsgContent.slice(7);
        } else {
          imageKeywords.forEach(keyword => {
            if (prompt.toLowerCase().includes(keyword)) {
              prompt = prompt.toLowerCase().replace(keyword, "").trim();
            }
          });
        }
        
        if (userMsgContent.toLowerCase().includes("graph") || userMsgContent.toLowerCase().includes("visualize")) {
          prompt = `A high-quality, professional data visualization or infographic of: ${prompt || userMsgContent}. Clean design, modern aesthetic, 4k resolution.`;
        }
        
        const imageUrl = await generateImage(prompt || userMsgContent);
        if (imageUrl) {
          responseContent = `![Generated Image](${imageUrl})\n\n*Orchestrated by SteveAI using Flux*`;
        } else {
          responseContent = "Failed to generate image. Please try again.";
        }
      } else {
        responseContent = await getChatResponse(userMsgContent, selectedModel, settings?.customSystemInstruction);
      }

      // 3. Save assistant response to Firestore if logged in
      if (user && currentSessionId) {
        const path = `users/${user.uid}/sessions/${currentSessionId}/messages`;
        await addDoc(collection(db, path), {
          role: "assistant",
          content: responseContent,
          timestamp: Date.now(),
          model: selectedModel.name,
          userId: user.uid
        });

        // Update session last message
        const sessionRef = doc(db, `users/${user.uid}/sessions`, currentSessionId);
        await updateDoc(sessionRef, {
          lastMessage: responseContent.slice(0, 100)
        });
      } else {
        // Just update local state for guest
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: responseContent,
          timestamp: Date.now(),
          model: selectedModel.name,
          userId: "guest"
        };
        setMessages(prev => [...prev, assistantMsg]);
      }

    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    if (!user) {
      setMessages([]);
      return;
    }
    if (!sessionId) return;

    const path = `users/${user.uid}/sessions/${sessionId}/messages`;
    try {
      const q = query(collection(db, path));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-black">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white relative overflow-hidden">
      {/* Guest Mode Banner */}
      {!user && !authLoading && (
        <div className="bg-blue-600/10 border-b border-blue-500/20 px-6 py-1.5 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            <span>Guest Mode: History will not be saved</span>
          </div>
          <Link to="/login" className="text-[10px] font-black text-white hover:text-blue-400 transition-colors uppercase tracking-widest">
            Login to Sync
          </Link>
        </div>
      )}

      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-black/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3 sm:gap-6">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link to="/" className="flex items-center gap-2 group">
            <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 group-hover:text-blue-400 transition-colors" />
            <span className="text-base sm:text-lg font-bold tracking-tighter text-white">
              STEVE<span className="text-blue-500">AI</span>
            </span>
          </Link>

          <div className="h-6 w-px bg-white/10 hidden md:block" />

          <div className="relative">
            <button 
              onClick={() => setShowModelMenu(!showModelMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <Cpu className="w-4 h-4 text-blue-500" />
              <span className="text-xs sm:text-sm font-bold">{selectedModel.name}</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", showModelMenu && "rotate-180")} />
            </button>
            
            <AnimatePresence>
              {showModelMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-20"
                >
                  <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                    {availableModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model);
                          setShowModelMenu(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-white/5 transition-colors",
                          selectedModel.id === model.id ? "text-blue-500 bg-blue-500/5" : "text-gray-400"
                        )}
                      >
                        {model.type === 'image' ? <ImageIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        <span className="truncate">{model.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate("/chat")}
            className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
            title="New Chat"
          >
            <Plus className="w-5 h-5" />
          </button>
          {sessionId && (
            <button 
              onClick={clearChat}
              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
              title="Clear Chat"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          {user && (
            <div className="ml-2 pl-2 border-l border-white/10">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ""} className="w-8 h-8 rounded-full border border-white/10 object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                  {user.displayName?.charAt(0) || "U"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-6 sm:space-y-8 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-50 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">How can I help you today?</h2>
              <p className="text-gray-400 max-w-md mx-auto mt-2 text-sm">
                Select a model and start chatting. Use <code className="text-blue-400">/image</code> to generate visuals.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-3 sm:gap-4 max-w-4xl mx-auto",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0",
              msg.role === "user" ? "bg-blue-600" : "bg-zinc-800 border border-white/10"
            )}>
              {msg.role === "user" ? <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />}
            </div>
            <div className={cn(
              "flex flex-col gap-1.5 sm:gap-2 max-w-[85%] sm:max-w-[80%]",
              msg.role === "user" ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl sm:rounded-3xl text-sm leading-relaxed",
                msg.role === "user" 
                  ? "bg-blue-600 text-white rounded-tr-none" 
                  : "bg-zinc-900 border border-white/10 text-gray-200 rounded-tl-none"
              )}>
                <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
              {msg.model && (
                <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">
                  {msg.model}
                </span>
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            </div>
            <div className="bg-zinc-900 border border-white/10 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl sm:rounded-3xl rounded-tl-none flex items-center gap-2">
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-blue-500" />
              <span className="text-xs sm:text-sm text-gray-400">Steve is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-6 bg-gradient-to-t from-black via-black to-transparent">
        <div className="max-w-4xl mx-auto relative">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => {
                const prompts = [
                  "A futuristic cybernetic city in neon blue",
                  "A majestic dragon flying over a crystalline lake",
                  "A cozy cabin in a snowy forest at twilight",
                  "An abstract representation of artificial intelligence",
                  "A surreal landscape with floating islands and purple waterfalls"
                ];
                const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
                setInput(`/image ${randomPrompt}`);
              }}
              className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-blue-400" />
              Surprise Me
            </button>
            <div className="h-4 w-px bg-white/10 mx-1" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {selectedModel.name}
            </span>
          </div>
          <TextareaAutosize
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask Steve anything..."
            className="w-full bg-zinc-900 border border-white/10 rounded-[24px] sm:rounded-[32px] px-5 py-3 sm:px-6 sm:py-4 pr-14 sm:pr-16 focus:outline-none focus:border-blue-500/50 transition-all resize-none min-h-[48px] sm:min-h-[64px] max-h-48 scrollbar-hide text-sm"
            maxRows={8}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "absolute right-1.5 bottom-1.5 sm:right-2 sm:bottom-2 w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all",
              input.trim() && !isLoading 
                ? "bg-blue-600 text-white hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20" 
                : "bg-zinc-800 text-gray-500 cursor-not-allowed"
            )}
          >
            {isLoading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
        <p className="text-center text-[8px] sm:text-[10px] text-gray-600 mt-2 sm:mt-4 uppercase tracking-[0.2em] font-bold">
          SteveAI Orchestrator v4.0 • Powered by Saadpie & Ahmed
        </p>
      </div>
    </div>
  );
}
