import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Image as ImageIcon, 
  Download, 
  Loader2, 
  Sparkles, 
  Zap,
  RefreshCw,
  Share2,
  Menu,
  ChevronDown,
  Layers,
  Cpu
} from "lucide-react";
import { cn } from "../lib/utils";
import { generateImage } from "../services/aiService";
import { useAuth, useSidebar } from "../App";
import { signInWithGoogle } from "../firebase";
import { Link } from "react-router-dom";
import { MODELS, AIModel } from "../types";

export default function ImageGen() {
  const { user } = useAuth();
  const { isOpen, setIsOpen } = useSidebar();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>(
    MODELS.find(m => m.type === 'image') || MODELS[0]
  );
  const [showModelMenu, setShowModelMenu] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setGeneratedImage(null);
    
    try {
      const imageUrl = await generateImage(prompt, selectedModel.id);
      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `steveai-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white relative overflow-hidden">
      {/* Header */}
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
        </div>

        <div className="flex items-center gap-4">
          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelMenu(!showModelMenu)}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs sm:text-sm font-medium"
            >
              <Layers className="w-3.5 h-3.5 text-purple-500" />
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
                    Select Image Engine
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto scrollbar-hide">
                    {MODELS.filter(m => m.type === 'image').map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model);
                          setShowModelMenu(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-white/5 transition-colors",
                          selectedModel.id === model.id ? "text-purple-500 bg-purple-500/5" : "text-gray-400"
                        )}
                      >
                        <ImageIcon className="w-4 h-4" />
                        <div className="flex flex-col">
                          <span>{model.name}</span>
                          <span className="text-[10px] opacity-50">{model.provider}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!user ? (
            <button
              onClick={() => signInWithGoogle()}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-full transition-all"
            >
              Login
            </button>
          ) : (
            <div className="flex items-center gap-2">
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

      <div className="flex-1 overflow-y-auto pt-8 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Controls */}
          <div className="w-full md:w-1/3 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-purple-500" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter">IMAGE GEN</h1>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Powered by {selectedModel.name} for high-fidelity visual generation.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A futuristic cybernetic city in neon blue..."
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all h-32 resize-none"
                />
              </div>

              {user ? (
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all",
                    prompt.trim() && !isGenerating
                      ? "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                      : "bg-zinc-800 text-gray-500 cursor-not-allowed"
                  )}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Generate Visual
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => signInWithGoogle()}
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  Login to Generate
                </button>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>PRO TIPS</span>
              </div>
              <ul className="text-[10px] text-gray-500 space-y-2 leading-relaxed">
                <li>• Use descriptive adjectives (e.g., "cinematic", "hyper-realistic")</li>
                <li>• Specify lighting (e.g., "golden hour", "neon glow")</li>
                <li>• Mention artistic styles (e.g., "cyberpunk", "minimalist")</li>
              </ul>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1">
            <div className="aspect-square rounded-[40px] bg-zinc-900 border border-white/10 relative overflow-hidden group">
              <AnimatePresence mode="wait">
                {generatedImage ? (
                  <motion.div
                    key="image"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full relative"
                  >
                    <img
                      src={generatedImage}
                      alt="Generated"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button
                        onClick={downloadImage}
                        className="p-4 rounded-full bg-white text-black hover:scale-110 transition-transform"
                        title="Download"
                      >
                        <Download className="w-6 h-6" />
                      </button>
                      <button
                        onClick={handleGenerate}
                        className="p-4 rounded-full bg-white/20 backdrop-blur-md text-white hover:scale-110 transition-transform"
                        title="Regenerate"
                      >
                        <RefreshCw className="w-6 h-6" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full flex flex-col items-center justify-center text-center p-8"
                  >
                    {isGenerating ? (
                      <div className="space-y-4">
                        <div className="w-20 h-20 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin mx-auto" />
                        <p className="text-gray-400 font-bold animate-pulse">Orchestrating Pixels...</p>
                      </div>
                    ) : (
                      <div className="space-y-4 opacity-30">
                        <ImageIcon className="w-20 h-20 mx-auto" />
                        <p className="text-sm font-bold uppercase tracking-widest">Preview Area</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {generatedImage && (
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Generation Complete</span>
                </div>
                <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors">
                  <Share2 className="w-4 h-4" />
                  Share to Community
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
