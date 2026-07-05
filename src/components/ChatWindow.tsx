// src/components/ChatWindow.tsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatEntry } from '../hooks/useLiveAssistant';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Zap, Bot, User, Info, Maximize2, Minimize2, Search, Loader2, GripHorizontal } from 'lucide-react';
import { Rnd } from 'react-rnd';

interface ChatWindowProps {
  chatHistory: ChatEntry[];
  onSendMessage?: (text: string) => void;
  isConnected: boolean;
  isThinking?: boolean;
  isSearching?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  chatHistory, 
  onSendMessage, 
  isConnected, 
  isThinking, 
  isSearching 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [size, setSize] = useState({ width: 320, height: 450 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const lastSize = useRef({ width: 320, height: 450 });

  // Default position and size based on screen
  useEffect(() => {
    const handleInitialLayout = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      if (mobile) {
        // More floating-like initial size for mobile
        const w = Math.min(300, window.innerWidth - 40);
        const h = isMinimized ? 60 : 400;
        setSize({ width: w, height: h });
        setPosition({ x: 20, y: window.innerHeight - h - 100 });
      } else {
        // Desktop
        const w = 320;
        const h = 450;
        setSize({ width: w, height: h });
        const x = window.innerWidth - w - 40; 
        const y = window.innerHeight - h - 40;
        setPosition({ x: Math.max(20, x), y: Math.max(20, y) });
      }
    };
    handleInitialLayout();
    window.addEventListener('resize', handleInitialLayout);
    return () => window.removeEventListener('resize', handleInitialLayout);
  }, []);

  useEffect(() => {
    if (isMinimized) {
      lastSize.current = size;
      setSize(s => ({ ...s, height: 60 }));
    } else if (lastSize.current) {
      setSize(lastSize.current);
    }
  }, [isMinimized]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [chatHistory, isThinking, isSearching]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !onSendMessage) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const windowContent = (
    <div className={`flex flex-col h-full bg-zinc-950/90 border border-white/10 rounded-2xl lg:rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl relative ${isMinimized ? 'opacity-90' : 'opacity-100'}`}>
      {/* Header / Drag Handle */}
      <div 
        className="px-4 lg:px-6 py-4 lg:py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.05] cursor-move drag-handle shrink-0 select-none active:bg-white/[0.1] transition-colors"
        style={{ touchAction: 'none' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-1 px-2 border border-white/10 rounded bg-white/5 lg:hidden">
            <GripHorizontal className="w-5 h-5 text-white/40" />
          </div>
          <GripHorizontal className="w-4 h-4 text-white/20 hidden lg:block" />
          <div className="relative">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            {isConnected && (
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-25" />
            )}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            Neural Feed
          </span>
        </div>
        <div className="flex items-center gap-2">
            {(isSearching || isThinking) && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/20"
              >
                {isSearching ? <Search className="w-2.5 h-2.5 text-orange-400" /> : <Loader2 className="w-2.5 h-2.5 text-orange-400 animate-spin" />}
                <span className="text-[8px] font-black uppercase tracking-widest text-orange-400">{isSearching ? 'Search' : 'Think'}</span>
              </motion.div>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4 text-gray-400" /> : <Minimize2 className="w-4 h-4 text-gray-400" />}
            </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div 
            ref={containerRef}
            className="flex-1 overflow-y-auto px-4 lg:px-4 py-4 lg:py-4 space-y-4 scrollbar-hide"
            style={{ scrollBehavior: 'smooth' }}
          >
            <AnimatePresence initial={false}>
              {chatHistory.length === 0 && !isThinking ? (
                <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-20"
                >
                    <Zap className="w-8 h-8 text-blue-500" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] max-w-[160px]">
                        Stream Offline
                    </p>
                </motion.div>
              ) : (
                <>
                  {chatHistory.map((msg, idx) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                      className={`flex gap-2 lg:gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      <div className={`mt-0.5 shrink-0 w-6 h-6 lg:w-6 lg:h-6 rounded-lg flex items-center justify-center border border-white/10 ${
                          msg.sender === 'user' ? 'bg-blue-600/20' : 
                          msg.sender === 'agent' ? 'bg-orange-600/20' : 
                          'bg-white/5'
                      }`}>
                          {msg.sender === 'user' ? <User className="w-3 h-3 text-blue-400" /> : 
                           msg.sender === 'agent' ? <Bot className="w-3 h-3 text-orange-400" /> :
                           <Info className="w-3 h-3 text-gray-500" />}
                      </div>

                      {/* Bubble */}
                      <div className={`max-w-[85%] space-y-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        {msg.sender === 'system' ? (
                          <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[7px] font-bold uppercase tracking-widest text-white/30">
                            {msg.text}
                          </div>
                        ) : (
                          <div className={`
                              relative px-3 py-2 rounded-xl text-[11px] leading-relaxed
                              ${msg.sender === 'user' 
                                ? 'bg-blue-600/20 border border-blue-500/20 text-blue-50' 
                                : 'bg-white/[0.05] border border-white/5 text-gray-200'}
                          `}>
                              {msg.sender === 'agent' ? (
                                  <div className="prose prose-invert prose-xs max-w-none leading-normal">
                                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                  </div>
                              ) : (
                                  msg.text
                              )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isThinking && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4"
                    >
                      <div className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border border-white/10 bg-orange-600/20">
                        <Bot className="w-4 h-4 text-orange-400" />
                      </div>
                      <div className="px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                        <div className="flex gap-1">
                          <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1 h-1 bg-orange-500 rounded-full" />
                          <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-orange-500 rounded-full" />
                          <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-orange-500 rounded-full" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-500/40">Thinking...</span>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
          </div>
          
          {/* Input */}
          <div className="p-3 bg-white/[0.02] border-t border-white/5 mt-auto shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2 relative">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={!isConnected}
                    placeholder={isConnected ? "Transmit pulse..." : "Offline"}
                    className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all disabled:opacity-50"
                />
                <button 
                    type="submit" 
                    disabled={!isConnected || !inputText.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-white/20 text-white rounded-xl px-3 transition-all flex items-center justify-center"
                >
                    <Send className="w-3 h-3" />
                </button>
            </form>
          </div>

          {/* Diagonal Resize Handle Visual */}
          <div className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none flex items-end justify-end p-1 opacity-40 group-hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 19L5 5M19 12L12 19M19 5L5 19" className="opacity-20" />
              <path d="M21 15L15 21M21 10L10 21" />
            </svg>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Rnd
      size={size}
      position={position}
      onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
      onResizeStop={(e, direction, ref, delta, position) => {
        setSize({
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
        setPosition(position);
      }}
      minWidth={260}
      minHeight={isMinimized ? 60 : 150}
      enableResizing={{
        top: !isMinimized,
        right: !isMinimized,
        bottom: !isMinimized,
        left: !isMinimized,
        topRight: !isMinimized,
        bottomRight: !isMinimized,
        bottomLeft: !isMinimized,
        topLeft: !isMinimized,
      }}
      dragHandleClassName="drag-handle"
      className="z-[1000]"
      style={{ touchAction: 'none' }}
    >
      {windowContent}
    </Rnd>
  );
};



