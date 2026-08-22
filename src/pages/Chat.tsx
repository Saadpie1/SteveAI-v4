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
  Maximize2,
  Copy,
  RotateCcw,
  FileImage,
  X,
  Check,
  Pencil,
  Terminal,
  Play
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
import { cn } from "../lib/utils";
import { Message, MODELS, AIModel, ChatSession } from "../types";
import { getChatResponse, generateImage, fetchAvailableModels } from "../services/aiService";
import { useAuth, useSidebar, useUserSettings, useModals } from "../App";
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
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<AIModel>(MODELS[0]);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [htmlPreview, setHtmlPreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadModels = async () => {
      const fetched = await fetchAvailableModels();
      const workingModels = fetched.filter(m => m.status === 'ok' && m.type === 'text');
      // Keep all working models (including images), not just text ones
      const allWorkingModels = fetched.filter(m => m.status === 'ok');
      setAvailableModels(allWorkingModels.length > 0 ? allWorkingModels : fetched);
      if (workingModels.length > 0 && (!selectedModel || selectedModel.type !== 'text' || !workingModels.find(m => m.id === selectedModel.id))) {
        setSelectedModel(workingModels[0]);
      }
    };
    loadModels();
  }, []);

  const { openSettings } = useModals();

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
      setIsMessagesLoading(false);
      return;
    }

    if (!sessionId) {
      setMessages([]);
      setIsMessagesLoading(false);
      return;
    }

    if (messages.length === 0) setIsMessagesLoading(true);
    const path = `users/${user.uid}/sessions/${sessionId}/messages`;
    const q = query(collection(db, path), orderBy("timestamp", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
      setIsMessagesLoading(false);
    }, (error) => {
      setIsMessagesLoading(false);
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, [user, sessionId]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRetry = (msg: Message) => {
    // Find the user message before this assistant message if it's an assistant message
    const index = messages.findIndex(m => m.id === msg.id);
    if (index > 0 && messages[index-1].role === 'user') {
      const userMsg = messages[index-1];
      setInput(userMsg.content);
      if (userMsg.imageUrl) setSelectedImage(userMsg.imageUrl);
      handleSend(userMsg.content, userMsg.imageUrl);
    } else if (msg.role === 'user') {
      setInput(msg.content);
      if (msg.imageUrl) setSelectedImage(msg.imageUrl);
      handleSend(msg.content, msg.imageUrl);
    }
  };

  const handleEdit = async (msg: Message) => {
    if (msg.role !== 'user') return;
    
    // If double clicking pencil or clicking while already editing this msg, toggle off
    if (editingId === msg.id) {
       setEditingId(null);
       setInput("");
       return;
    }

    setInput(msg.content);
    if (msg.imageUrl) setSelectedImage(msg.imageUrl);
    setEditingId(msg.id);
  };

  const compressImage = (base64: string, maxWidth = 1024, maxHeight = 1024, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (raw file can be larger, we will compress)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      // Compress immediately to keep Firestore docs small
      const compressed = await compressImage(base64);
      setSelectedImage(compressed);
    };
    reader.readAsDataURL(file);
  };

  const runOCR = async (image: string): Promise<string> => {
    setIsOcrLoading(true);
    try {
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image })
      });
      if (!res.ok) throw new Error("OCR request failed");
      const data = await res.json();
      return data.ocrReport;
    } catch (err) {
      console.error("OCR Helper Error:", err);
      return "*(System: OCR failed to process this image)*";
    } finally {
      setIsOcrLoading(false);
    }
  };

  const handleSend = async (customInput?: string, customImage?: string) => {
    const userMsgContent = (customInput !== undefined ? customInput : input).trim();
    const currentImage = customImage !== undefined ? customImage : selectedImage;

    if (!userMsgContent && !currentImage) return;

    // Handle Commands
    if (userMsgContent.startsWith('/')) {
      const command = userMsgContent.toLowerCase().split(' ')[0];
      const args = userMsgContent.split(' ').slice(1).join(' ');

      let handled = false;
      let response = "";

      switch (command) {
        case '/help':
          response = "### 🛠 Available Commands\n\n" +
            "- **/help**: Show this help message.\n" +
            "- **/image `<prompt>`**: Generate an image using Flux.\n" +
            "- **/clear**: Clear the current chat history.\n" +
            "- **/model**: List available AI models.\n" +
            "- **/time**: Show the current server time.\n" +
            "- **/about**: Learn more about SteveAI.\n" +
            "- **/contact**: Get in touch with the creators.";
          handled = true;
          break;
        case '/clear':
          clearChat();
          setInput("");
          return;
        case '/time':
          response = `🕒 Current Time: ${new Date().toLocaleString()}`;
          handled = true;
          break;
        case '/about':
          response = "### 🧠 About SteveAI\n\nSteveAI is a premium AI orchestrator designed to bridge multiple high-performance models into a single, seamless experience. Developed by **Saadpie/Saad AbdulRehman** and **Aasmaan Rauf**, it features real-time orchestration, vision capabilities, and multi-modal generation.";
          handled = true;
          break;
        case '/contact':
          response = "### 📬 Contact Us\n\nFor support or collaborations:\n- **Saadpie**: [GitHub](https://github.com/saadpie)\n- **Aasmaan Rauf**: [Profile](#)";
          handled = true;
          break;
        case '/model':
          response = "### 🤖 Available Models\n\n" + availableModels.map(m => `- **${m.name}** (${m.provider})`).join('\n');
          handled = true;
          break;
      }

      if (handled) {
        // Add fake local messages for command execution
        const userCmdMsg: Message = { id: Date.now().toString(), role: "user", content: userMsgContent, timestamp: Date.now(), userId: user?.uid || 'guest' };
        const assistantResMsg: Message = { id: (Date.now()+1).toString(), role: "assistant", content: response, timestamp: Date.now(), userId: user?.uid || 'guest', model: "System" };
        
        setMessages(prev => [...prev, userCmdMsg, assistantResMsg]);
        setInput("");
        return;
      }
    }

    setInput("");
    setSelectedImage(null);
    setEditingId(null);
    setIsLoading(true);

    let currentSessionId = sessionId;

    try {
      // 1. Create a session if it doesn't exist and user is logged in
      if (user && !currentSessionId) {
        const sessionRef = doc(collection(db, `users/${user.uid}/sessions`));
        currentSessionId = sessionRef.id;
        
        const sessionTitle = userMsgContent 
          ? (userMsgContent.slice(0, 40) + (userMsgContent.length > 40 ? "..." : ""))
          : "Image Message";

        await setDoc(sessionRef, {
          id: currentSessionId,
          title: sessionTitle,
          createdAt: Date.now(),
          userId: user.uid,
          lastMessage: userMsgContent || "Sent an image"
        });

        // We don't navigate immediately here to keep the current message in state
        // The URL will be updated via navigate but we'll try to do it after the first user message write
      }

      const tempId = Date.now().toString();
      const newUserMsg: Message = {
        id: tempId,
        role: "user",
        content: userMsgContent,
        imageUrl: currentImage || undefined,
        timestamp: Date.now(),
        userId: user?.uid || "guest"
      };

      // Optimistic update
      setMessages(prev => [...prev, newUserMsg]);

      // 2. Save user message to Firestore if logged in
      if (user && currentSessionId) {
        // If we are editing, update the existing document instead
        if (editingId) {
           const msgRef = doc(db, `users/${user.uid}/sessions/${currentSessionId}/messages`, editingId);
           await updateDoc(msgRef, {
             content: userMsgContent,
             imageUrl: currentImage || null,
             timestamp: Date.now() // Optional: update timestamp or keep original?
           });
           setEditingId(null);
        } else {
          const path = `users/${user.uid}/sessions/${currentSessionId}/messages`;
          await addDoc(collection(db, path), {
            role: "user",
            content: userMsgContent,
            imageUrl: currentImage || null,
            timestamp: Date.now(),
            userId: user.uid
          });

          // Only navigate if it's the first message of a new session
          if (!sessionId) {
            navigate(`/chat/${currentSessionId}`, { replace: true });
          }
        }
      }

      let responseContent = "";
      
      // Automatic image generation detection
      const isImageRequest = userMsgContent.toLowerCase().startsWith("/image ") || selectedModel.type === 'image';

      if (isImageRequest && selectedModel.type === 'image') {
        let prompt = userMsgContent;
        if (userMsgContent.toLowerCase().startsWith("/image ")) {
          prompt = userMsgContent.slice(7);
        }
        
        const imageUrl = await generateImage(prompt || userMsgContent, selectedModel.id);
        if (imageUrl) {
          responseContent = `![Generated Image](${imageUrl})\n\n*Generated with ${selectedModel.name}*`;
        } else {
          responseContent = "Failed to generate image. Please try again.";
        }
      } else if (userMsgContent.toLowerCase().startsWith("/image ") && selectedModel.type !== 'image') {
         let prompt = userMsgContent.slice(7);
         const imageUrl = await generateImage(prompt || userMsgContent, 'flux');
         if (imageUrl) {
            responseContent = `![Generated Image](${imageUrl})\n\n*Orchestrated by SteveAI using Flux*`;
         } else {
            responseContent = "Failed to generate image. Please try again.";
         }
      } else {
        // Handle Vision / OCR Logic
        let messagePayload: any = userMsgContent;
        
        if (currentImage) {
          if (selectedModel.provider === 'gemini') {
             // Native Gemini Vision
             messagePayload = [
               { text: userMsgContent || "Please analyze this image." },
               { inlineData: { 
                   data: currentImage.split(',')[1], 
                   mimeType: currentImage.split(';')[0].split(':')[1] 
                 } 
               }
             ];
          } else {
            // "Fixed OCR" Logic: Target model is NOT Gemini (use OCR pre-processor)
            const ocrReport = await runOCR(currentImage);
            messagePayload = `[IMAGE ATTACHED]\n\n**OCR/IMAGE ANALYSIS REPORT:**\n${ocrReport}\n\n**USER MESSAGE:**\n${userMsgContent || "No specific message provided with image."}`;
          }
        }
        
        // Send to service
        responseContent = await getChatResponse(
          messagePayload, 
          selectedModel, 
          messages.slice(-10), 
          settings?.customSystemInstruction,
          settings?.openrouterApiKey
        );
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

    } catch (error: any) {
      let displayError = error.message;
      
      try {
        const parsed = JSON.parse(error.message);
        displayError = parsed.error || error.message;
      } catch (e) {
        // Not a JSON error, keep as is
      }
      
      const errorMessage: Message = {
         id: (Date.now() + 1).toString(),
         role: "assistant",
         content: `🚨 **Literal Error from ${selectedModel.name}:**\n\n\`\`\`\n${displayError}\n\`\`\``,
         timestamp: Date.now(),
         userId: user?.uid || "guest"
      };
      setMessages(prev => [...prev, errorMessage]);
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
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 border-b border-white/10 bg-black/50 backdrop-blur-md z-10 sticky top-0 scroll-mt-0">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-gray-400 hover:text-white transition-colors shrink-0"
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <Link to="/" className="flex items-center gap-1.5 group shrink-0">
            <Cpu className="w-5 h-5 text-blue-500 group-hover:text-blue-400 transition-colors animate-pulse" />
            <span className="text-sm sm:text-base font-black tracking-tighter text-white whitespace-nowrap">
              STEVE<span className="text-blue-500">AI</span>
            </span>
          </Link>
          
          <div className="h-6 w-px bg-white/10 hidden md:block shrink-0" />

          <div className="relative shrink-0 flex items-center min-w-0">
            <button 
              onClick={() => setShowModelMenu(!showModelMenu)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all min-w-0 max-w-[100px] sm:max-w-none"
            >
              <Cpu className="w-3 h-3 text-blue-500 hidden xs:block shrink-0" />
              <span className="text-[10px] sm:text-xs font-bold truncate leading-none uppercase tracking-widest">{selectedModel.name}</span>
              <ChevronDown className={cn("w-3 h-3 text-gray-500 shrink-0 transition-transform", showModelMenu && "rotate-180")} />
            </button>
            
            <AnimatePresence>
              {showModelMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-20"
                >
                  <div className="max-h-[400px] overflow-y-auto scrollbar-hide py-2">
                    {Object.entries(
                      (availableModels.filter(m => m.type === 'text' && m.status === 'ok').length > 0
                        ? availableModels.filter(m => m.type === 'text' && m.status === 'ok')
                        : availableModels.filter(m => m.type === 'text')
                      ).reduce((acc: Record<string, AIModel[]>, model) => {
                        if (!acc[model.provider]) acc[model.provider] = [];
                        acc[model.provider].push(model);
                        return acc;
                      }, {})
                    ).map(([provider, providerModels]) => (
                      <div key={provider} className="mb-2">
                        <div className="px-4 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-blue-500/50 bg-blue-500/5 border-y border-white/5">
                          {provider}
                        </div>
                        {providerModels.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model);
                              setShowModelMenu(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors",
                              selectedModel.id === model.id ? "text-blue-500 bg-blue-500/5" : "text-gray-400"
                            )}
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/5",
                              selectedModel.id === model.id ? "bg-blue-500/10" : "bg-white/5"
                            )}>
                              <Cpu className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold truncate text-xs">{model.name}</span>
                              <span className="text-[10px] text-gray-500 truncate">{model.id}</span>
                            </div>
                          </button>
                        ))}
                      </div>
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
        {isMessagesLoading ? (
           <div className="h-full flex items-center justify-center">
             <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
           </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-50 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">How can I help you today?</h2>
              <p className="text-gray-400 max-w-md mx-auto mt-2 text-sm">
                Select a model and start chatting. SteveAI can orchestrate text, images, and more.
              </p>
            </div>
          </div>
        ) : null}

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
              "flex flex-col gap-1.5 sm:gap-2 max-w-[85%] sm:max-w-[80%] group/msg",
              msg.role === "user" ? "items-end" : "items-start"
            )}>
              {msg.imageUrl && (
                <div className="mb-2 relative rounded-2xl overflow-hidden border border-white/10 max-w-sm">
                  <img src={msg.imageUrl} alt="Uploaded" className="w-full h-auto object-cover" />
                </div>
              )}
              <div className={cn(
                "px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl sm:rounded-3xl text-sm leading-relaxed relative min-w-0 max-w-full overflow-visible",
                msg.role === "user" 
                  ? "bg-blue-600 text-white rounded-tr-none" 
                  : "bg-zinc-900 border border-white/10 text-gray-200 rounded-tl-none"
              )}>
                <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkMath, remarkGfm]} 
                    rehypePlugins={[rehypeKatex, rehypeRaw, rehypeHighlight]}
                    components={{
                       table({ children }) {
                         return (
                           <div className="table-container">
                             <table>{children}</table>
                           </div>
                         );
                       },
                       code({ node, inline, className, children, ...props }: any) {
                         const match = /language-(\w+)/.exec(className || '');
                         const [isWrapped, setIsWrapped] = useState(true);
                         const [executionOutput, setExecutionOutput] = useState<{ stdout: string; stderr: string; exitCode: number } | null>(null);
                         const [isRunning, setIsRunning] = useState(false);
                         
                         // Recursively extract text from children for copying
                         const getRawText = (nodes: any): string => {
                           if (!nodes) return '';
                           if (typeof nodes === 'string') return nodes;
                           if (Array.isArray(nodes)) return nodes.map(getRawText).join('');
                           if (nodes.props && nodes.props.children) return getRawText(nodes.props.children);
                           return '';
                         };

                         const codeContent = getRawText(children).replace(/\n$/, '');
                         const blockId = `${msg.id}-${className}-${codeContent.slice(0, 10)}`;
                         
                         const runCode = async () => {
                           if (!match) return;
                           setIsRunning(true);
                           setExecutionOutput(null);
                           try {
                             const response = await fetch('/api/execute-code', {
                               method: 'POST',
                               headers: { 'Content-Type': 'application/json' },
                               body: JSON.stringify({
                                 language: match[1],
                                 code: codeContent
                               })
                             });
                             
                             const data = await response.json();
                             
                             if (!response.ok) {
                               setExecutionOutput({
                                 stdout: "",
                                 stderr: data.message || data.error || `Server Error: ${response.status}`,
                                 exitCode: -1
                               });
                               return;
                             }

                             if (data.run) {
                               setExecutionOutput({
                                 stdout: data.run.stdout,
                                 stderr: data.run.stderr,
                                 exitCode: data.run.code
                               });
                             } else {
                               setExecutionOutput({
                                 stdout: "",
                                 stderr: data.message || "Failed to parse execution output",
                                 exitCode: -1
                               });
                             }
                           } catch (error: any) {
                             console.error("Run Error:", error);
                             setExecutionOutput({
                               stdout: "",
                               stderr: `Network or Runtime Error: ${error.message}`,
                               exitCode: -2
                             });
                           } finally {
                             setIsRunning(false);
                           }
                         };

                         if (!inline && match) {
                           const lang = match[1].toLowerCase();
                           return (
                             <div className="group relative my-4">
                               <div className="absolute top-2 right-2 flex items-center gap-2 z-20 md:opacity-0 md:group-hover:opacity-100 transition-all">
                                 <button 
                                   onClick={runCode}
                                   disabled={isRunning}
                                   className="p-2 sm:p-1.5 rounded-lg bg-black/80 border border-white/10 text-gray-400 hover:text-green-500 hover:bg-black transition-all flex items-center gap-2 px-3 sm:px-2 disabled:opacity-50"
                                   title="Run Code"
                                 >
                                   {isRunning ? <Loader2 className="w-4 h-4 sm:w-3.5 sm:h-3.5 animate-spin" /> : <Play className="w-4 h-4 sm:w-3.5 sm:h-3.5" />}
                                   <span className="text-[10px] sm:text-[10px] font-bold uppercase tracking-wider">Run</span>
                                 </button>
                                 {lang === 'html' && (
                                   <button 
                                     onClick={() => setHtmlPreview(codeContent)}
                                     className="p-1.5 rounded-lg bg-black/80 border border-white/10 text-gray-500 hover:text-blue-500 hover:bg-black transition-all flex items-center gap-1.5 px-2"
                                     title="Preview HTML"
                                   >
                                     <Maximize2 className="w-3.5 h-3.5" />
                                     <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Preview</span>
                                   </button>
                                 )}
                                 <button 
                                   onClick={() => setIsWrapped(!isWrapped)}
                                   className="p-1.5 rounded-lg bg-black/80 border border-white/10 text-gray-500 hover:text-white hover:bg-black transition-all flex items-center gap-1.5 px-2"
                                   title={isWrapped ? "Unwrap Code" : "Wrap Code"}
                                 >
                                   <Terminal className="w-3.5 h-3.5" />
                                   <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">{isWrapped ? "Unwrap" : "Wrap"}</span>
                                 </button>
                                 <button 
                                   onClick={() => copyToClipboard(codeContent, blockId)}
                                   className="p-1.5 rounded-lg bg-black/80 border border-white/10 text-gray-500 hover:text-white hover:bg-black transition-all px-2 flex items-center gap-1.5"
                                   title="Copy Code"
                                 >
                                   {copiedId === blockId ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                                   <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Copy</span>
                                 </button>
                               </div>
                               <pre className={cn("m-0 p-0 overflow-hidden rounded-xl border border-white/10 bg-black/40", isWrapped ? "whitespace-pre-wrap break-all" : "whitespace-pre overflow-x-auto")}>
                                 <code className={cn(className, "block p-4")} {...props}>
                                   {children}
                                 </code>
                               </pre>
                               
                               {executionOutput && (
                                 <motion.div 
                                   initial={{ opacity: 0, height: 0 }}
                                   animate={{ opacity: 1, height: "auto" }}
                                   className="mt-2 rounded-xl border border-white/20 bg-[#0c0c0c] overflow-hidden shadow-2xl"
                                 >
                                   <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/10">
                                     <div className="flex items-center gap-2">
                                       <Terminal className="w-3 h-3 text-blue-500" />
                                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SteveAI Console</span>
                                     </div>
                                     <div className="flex items-center gap-2">
                                       <button 
                                         onClick={() => setExecutionOutput(null)} 
                                         className="text-gray-500 hover:text-white p-1 hover:bg-white/5 rounded-md transition-all"
                                         title="Clear Output"
                                       >
                                         <RotateCcw className="w-3 h-3" />
                                       </button>
                                       <button 
                                         onClick={() => setExecutionOutput(null)} 
                                         className="text-gray-500 hover:text-red-500 p-1 hover:bg-red-500/10 rounded-md transition-all"
                                         title="Close Console"
                                       >
                                         <X className="w-3 h-3" />
                                       </button>
                                     </div>
                                   </div>
                                   <div className="p-4 font-mono text-xs max-h-64 overflow-y-auto scrollbar-hide bg-black/40">
                                     {executionOutput.stdout && <div className="text-blue-50 text-opacity-90 whitespace-pre-wrap mb-1">{executionOutput.stdout}</div>}
                                     {executionOutput.stderr && <div className="text-red-400 whitespace-pre-wrap font-bold bg-red-400/5 p-2 rounded border border-red-400/10">{executionOutput.stderr}</div>}
                                     {!executionOutput.stdout && !executionOutput.stderr && <div className="text-gray-600 italic">Program finished with no output (Exit Code: {executionOutput.exitCode})</div>}
                                     
                                     {/* Cursor emulation */}
                                     <span className="inline-block w-1.5 h-3.5 bg-blue-500 animate-pulse ml-1 align-middle" />
                                   </div>
                                 </motion.div>
                               )}

                               {isRunning && !executionOutput && (
                                 <motion.div 
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   className="mt-2 p-3 rounded-xl border border-white/10 bg-black/40 flex items-center gap-3"
                                 >
                                   <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                   <span className="text-xs font-mono text-gray-400 animate-pulse">Initializing sandbox and executing script...</span>
                                 </motion.div>
                               )}
                             </div>
                           )
                         }
                         return (
                           <code className={className} {...props}>
                             {children}
                           </code>
                         )
                       }
                    }}
                  >
                    {(() => {
                      let parsed = msg.content;
                      // Replace standard LaTeX delimiters with markdown math delimiters
                      parsed = parsed.replace(/\\\[/g, '$$$$').replace(/\\\]/g, '$$$$');
                      parsed = parsed.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
                      
                      // Auto-close unclosed think tags
                      const openCount = (parsed.match(/<think>/g) || []).length;
                      const closeCount = (parsed.match(/<\/think>/g) || []).length;
                      if (openCount > closeCount) {
                        parsed += '</think>'.repeat(openCount - closeCount);
                      }
                      return parsed
                        .replace(/<think>/g, '<details class="think-block my-2 border border-white/10 rounded-lg p-3 bg-black/20"><summary class="cursor-pointer font-bold text-gray-400 text-[10px] uppercase tracking-widest hover:text-white transition-colors">Thought Process</summary><div class="text-xs sm:text-sm text-gray-400 mt-3 pt-3 border-t border-white/5">')
                        .replace(/<\/think>/g, '</div></details>');
                    })()}
                  </ReactMarkdown>
                </div>

                {/* Message Actions */}
                <div className={cn(
                  "absolute -bottom-8 flex items-center gap-1 opacity-0 group-hover/msg:opacity-100 transition-all z-10",
                  msg.role === "user" ? "right-0" : "left-0"
                )}>
                  <button 
                    onClick={() => copyToClipboard(msg.content, msg.id)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-gray-400 hover:text-blue-500 transition-colors"
                    title="Copy"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button 
                    onClick={() => handleRetry(msg)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-gray-400 hover:text-blue-500 transition-colors"
                    title="Retry / Edit"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  {msg.role === 'user' && (
                    <button 
                      onClick={() => handleEdit(msg)}
                      className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
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
              <span className="text-xs sm:text-sm text-gray-400">
                {isOcrLoading ? "Extracting text with Fixed OCR..." : "Steve is thinking..."}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-6 bg-gradient-to-t from-black via-black to-transparent relative">
        {/* HTML Preview Overlay */}
        <AnimatePresence>
          {htmlPreview && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-0 bottom-0 top-[72px] bg-black z-[100] flex flex-col border-t border-white/10"
            >
              <div className="h-12 bg-zinc-900 border-b border-white/10 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Live HTML Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setHtmlPreview(null)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all flex items-center gap-2 px-3"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-tight">Close</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-white">
                <iframe 
                  title="Preview"
                  srcDoc={htmlPreview}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-4xl mx-auto relative">
          
          {/* Image Preview */}
          <AnimatePresence>
            {selectedImage && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-0 mb-4 p-2 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl flex items-center gap-3 z-10"
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                  <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="pr-4">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Image Ready</p>
                  <p className="text-[8px] text-gray-500 uppercase tracking-widest">Supports OCR & Analysis</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {editingId && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 mb-4 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center gap-2 z-10"
              >
                <div className="flex items-center gap-2">
                  <Pencil className="w-3 h-3 text-yellow-500" />
                  <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Editing Message</span>
                </div>
                <button 
                  onClick={() => {
                    setEditingId(null);
                    setInput("");
                    setSelectedImage(null);
                  }}
                  className="text-yellow-500 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center flex-wrap gap-2 mb-2">
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
              className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-3 h-3 text-blue-400" />
              Surprise Me
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "px-3 py-1 rounded-full border text-[10px] font-bold transition-all flex items-center gap-1.5 whitespace-nowrap",
                selectedImage 
                  ? "bg-blue-600/20 border-blue-500/50 text-blue-400" 
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              <FileImage className="w-3 h-3" />
              {selectedImage ? "Image Added" : "Add Image (OCR)"}
            </button>

            <button
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
              className={cn(
                "px-3 py-1 rounded-full border text-[10px] font-bold transition-all flex items-center gap-1.5 whitespace-nowrap",
                webSearchEnabled 
                  ? "bg-blue-600 border-blue-500 text-white" 
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
              )}
              title="Search on the web"
            >
              <Plus className={cn("w-3 h-3 transition-transform", webSearchEnabled && "rotate-45")} />
              <span>Search {webSearchEnabled ? "ON" : "OFF"}</span>
            </button>

            <div className="hidden sm:block h-4 w-px bg-white/10 mx-1" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate max-w-[100px] sm:max-w-none">
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
            placeholder={selectedImage ? "Ask about this image..." : "Ask Steve anything..."}
            className="w-full bg-zinc-900 border border-white/10 rounded-[24px] sm:rounded-[32px] px-5 py-3 sm:px-6 sm:py-4 pr-14 sm:pr-16 focus:outline-none focus:border-blue-500/50 transition-all resize-none min-h-[48px] sm:min-h-[64px] max-h-48 scrollbar-hide text-sm"
            maxRows={8}
          />
          <button
            onClick={() => handleSend()}
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className={cn(
              "absolute right-1.5 bottom-1.5 sm:right-2 sm:bottom-2 w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all",
              (input.trim() || selectedImage) && !isLoading 
                ? "bg-blue-600 text-white hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20" 
                : "bg-zinc-800 text-gray-500 cursor-not-allowed"
            )}
          >
            {isLoading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
        <p className="text-center text-[8px] sm:text-[10px] text-gray-600 mt-2 sm:mt-4 uppercase tracking-[0.2em] font-bold">
          SteveAI Orchestrator v4.0 • Powered by Saadpie & Aasmaan Rauf
        </p>
      </div>
    </div>
  );
}
