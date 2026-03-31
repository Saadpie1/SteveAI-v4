import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Box, 
  Sparkles, 
  ChevronDown,
  Menu,
  ExternalLink,
  Info,
  Maximize2,
  RefreshCw,
  Layers,
  Languages,
  Cpu
} from "lucide-react";
import { cn } from "../lib/utils";
import { MODELS, AIModel } from "../types";
import { useAuth, useSidebar } from "../App";
import { Link } from "react-router-dom";

export default function ThreeDGen() {
  const { user } = useAuth();
  const { setIsOpen, isOpen } = useSidebar();
  const [selectedModel, setSelectedModel] = useState<AIModel>(
    MODELS.find(m => m.type === '3d') || MODELS[0]
  );
  const [currentMirrorIndex, setCurrentMirrorIndex] = useState(0);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslated, setIsTranslated] = useState(false);

  // Reset mirror index when model changes
  useEffect(() => {
    setCurrentMirrorIndex(0);
    setIsLoading(true);
    setIsTranslated(false);
  }, [selectedModel]);

  const getSpaceUrl = () => {
    const baseUrl = selectedModel.mirrors && selectedModel.mirrors.length > 0
      ? `https://${selectedModel.mirrors[currentMirrorIndex]}`
      : `https://${selectedModel.id.replace('/', '-')}.hf.space`;
    
    if (isTranslated) {
      // Use Google Translate wrapper for the iframe
      return `https://translate.google.com/translate?sl=auto&tl=en&u=${encodeURIComponent(baseUrl)}`;
    }
    return baseUrl;
  };

  const toggleTranslation = () => {
    setIsLoading(true);
    setIsTranslated(!isTranslated);
  };

  const switchMirror = () => {
    if (selectedModel.mirrors && selectedModel.mirrors.length > 1) {
      setIsLoading(true);
      setCurrentMirrorIndex((prev) => (prev + 1) % selectedModel.mirrors!.length);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-4 sm:px-6 shrink-0 bg-black/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3 sm:gap-6">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link to="/" className="flex items-center gap-2 group">
            <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 group-hover:text-green-400 transition-colors" />
            <span className="text-base sm:text-lg font-bold tracking-tighter text-white">
              STEVE<span className="text-green-500">AI</span>
            </span>
          </Link>

          <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2 hidden sm:flex">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(22,163,74,0.4)]">
              <Box className="w-5 h-5" />
            </div>
            <h1 className="font-bold text-sm tracking-tight text-gray-400">3D Sculpture</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelMenu(!showModelMenu)}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs sm:text-sm font-medium"
            >
              <Layers className="w-3.5 h-3.5 text-green-500" />
              <span className="max-w-[80px] sm:max-w-none truncate">{selectedModel.name}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showModelMenu && "rotate-180")} />
            </button>

            <AnimatePresence>
              {showModelMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-20"
                >
                  <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                    Select 3D Engine
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto scrollbar-hide">
                    {MODELS.filter(m => m.type === '3d').map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model);
                          setShowModelMenu(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-white/5 transition-colors",
                          selectedModel.id === model.id ? "text-green-500 bg-green-500/5" : "text-gray-400"
                        )}
                      >
                        <Box className="w-4 h-4" />
                        <div className="flex flex-col">
                          <span>{model.name}</span>
                          <span className="text-[10px] opacity-50">{model.mirrors?.length || 1} Mirrors Available</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mirror Switcher */}
          {selectedModel.mirrors && selectedModel.mirrors.length > 1 && (
            <button
              onClick={switchMirror}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-green-600/10 hover:bg-green-600/20 border border-green-600/20 text-green-500 transition-all text-xs sm:text-sm font-bold"
              title="Switch to another mirror/deployer"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
              <span className="hidden sm:inline">Switch Mirror</span>
              <span className="sm:hidden">Mirror</span>
            </button>
          )}

          {/* Translation Toggle */}
          <button
            onClick={toggleTranslation}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border transition-all text-xs sm:text-sm font-bold",
              isTranslated 
                ? "bg-blue-600/20 border-blue-600/40 text-blue-400" 
                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
            )}
            title="Translate Space to English"
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isTranslated ? "English On" : "Translate"}</span>
          </button>

          {!user ? (
            <Link to="/login" className="text-sm font-medium text-green-500 hover:text-green-400">
              Sign in
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ""} className="w-8 h-8 rounded-full border border-white/10 object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold">
                  {user.displayName?.charAt(0) || "U"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Embedded Space */}
      <div className="flex-1 flex flex-col bg-zinc-950 relative overflow-hidden">
        {/* Info Bar */}
        <div className="px-4 py-2 bg-zinc-900/50 border-b border-white/5 flex items-center justify-between text-[10px] sm:text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Running on Direct HF Space Endpoint</span>
              <span className="sm:hidden">Direct HF Space</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Mirror {currentMirrorIndex + 1} of {selectedModel.mirrors?.length || 1}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href={
                selectedModel.mirrors?.[currentMirrorIndex] 
                  ? `https://huggingface.co/spaces/${selectedModel.mirrors[currentMirrorIndex].split('.hf.space')[0].replace('-', '/')}`
                  : `https://huggingface.co/spaces/${selectedModel.id}`
              } 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              Source <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Iframe Container */}
        <div className="flex-1 relative bg-zinc-900">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-10">
              <RefreshCw className="w-10 h-10 text-green-600 animate-spin mb-4" />
              <p className="text-sm font-medium text-gray-400">Loading 3D Engine Mirror...</p>
            </div>
          )}
          <iframe
            key={`${selectedModel.id}-${currentMirrorIndex}`}
            src={getSpaceUrl()}
            className="w-full h-full border-none"
            onLoad={() => setIsLoading(false)}
            allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
            sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"
          />
          
          {/* Overlay for better integration feel */}
          <div className="absolute top-4 right-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 text-xs font-medium">
              <Maximize2 className="w-3 h-3" />
              Interactive Studio
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
