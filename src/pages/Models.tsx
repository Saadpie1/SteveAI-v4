import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { fetchAvailableModels, getChatResponse, generateImage } from "../services/aiService";
import { AIModel } from "../types";
import { Search, Server, Cpu, Loader2, Sparkles, Image as ImageIcon, Video, Box, ExternalLink } from "lucide-react";
import { cn } from "../lib/utils";

export default function Models() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [generatedDescriptions, setGeneratedDescriptions] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadModels = async () => {
      setLoading(true);
      const data = await fetchAvailableModels();
      setModels(data);
      setLoading(false);
    };
    loadModels();
  }, []);

  const handleGenerateDescription = async (model: AIModel) => {
    if (generatingFor) return; // Only one at a time to prevent rate limits
    setGeneratingFor(model.id);
    
    try {
      if (model.type === 'text') {
        const response = await getChatResponse(
          "Introduce yourself in exactly 1-2 short and engaging sentences. Say nothing else.",
          model,
          [],
          "You are an AI model introducing yourself."
        );
        setGeneratedDescriptions(prev => ({ ...prev, [model.id]: response }));
      } else if (model.type === 'image') {
        const prompt = "A futuristic glowing crystal core representing AI creativity, high quality, masterpiece";
        const url = await generateImage(prompt, model.id);
        if (url) {
          // Check if the URL returns an error or image
          const testRes = await fetch(url);
          if (!testRes.ok) {
            const errJson = await testRes.json().catch(() => ({}));
            throw new Error(errJson.error || `Image Gen Error: ${testRes.status}`);
          }
          setGeneratedDescriptions(prev => ({ ...prev, [model.id]: `![Sample]( ${url} )` }));
        }
      } else {
        setGeneratedDescriptions(prev => ({ ...prev, [model.id]: `I am a ${model.type} generation model.` }));
      }
    } catch (error: any) {
      console.error("Model Generation Error:", error);
      setGeneratedDescriptions(prev => ({ ...prev, [model.id]: `Error: ${error.message}` }));
    } finally {
      setGeneratingFor(null);
    }
  };

  const filteredModels = models.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.provider.toLowerCase().includes(search.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch(type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case '3d': return <Box className="w-4 h-4" />;
      default: return <Cpu className="w-4 h-4" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch(type) {
      case 'image': return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case 'video': return "bg-red-500/10 text-red-400 border-red-500/20";
      case '3d': return "bg-green-500/10 text-green-400 border-green-500/20";
      default: return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  return (
    <div className="flex-1 w-full h-screen bg-black flex flex-col">
      <div className="flex-1 w-full flex flex-col p-4 lg:p-8 pt-20 overflow-hidden">
        <div className="max-w-6xl w-full mx-auto flex flex-col h-full">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 mt-12 lg:mt-0"
        >
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Server className="w-8 h-8 text-orange-500" />
            Model Registry
          </h1>
          <p className="text-gray-400 mt-2">
            Explore and test the orchestration capabilities of {models.length || '...'} integrated AI models.
          </p>

          <div className="mt-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-2xl leading-5 bg-zinc-900/50 text-white placeholder-gray-500 focus:outline-none focus:bg-zinc-900 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all sm:text-sm"
              placeholder="Search by name or provider..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-20 lg:pb-0">
          {loading ? (
             <div className="flex justify-center items-center h-64">
               <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
             </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredModels.map((model) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={model.id}
                      className="bg-zinc-900/50 border border-white/5 p-5 rounded-2xl flex flex-col hover:border-orange-500/30 transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-2 rounded-xl border flex items-center justify-center", getBadgeColor(model.type))}>
                            {getIcon(model.type)}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-sm truncate max-w-[180px]" title={model.name}>
                              {model.name}
                            </h3>
                            <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">
                              {model.provider}
                            </span>
                          </div>
                        </div>
                        <span className={cn(
                          "text-[10px] uppercase font-bold px-2 py-1 rounded-lg border",
                          model.status === 'ok' 
                            ? "bg-green-500/10 text-green-400 border-green-500/20" 
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                          {model.status || 'unknown'}
                        </span>
                      </div>

                      <div className="flex-1 mb-4 text-sm text-gray-400 bg-black/40 rounded-xl p-3 border border-white/5 relative min-h-[80px]">
                        {generatedDescriptions[model.id] ? (
                          generatedDescriptions[model.id].startsWith('![Sample]') ? (
                            <div className="w-full h-32 rounded-lg overflow-hidden relative group/img">
                              <img 
                                src={generatedDescriptions[model.id].match(/\( (.*) \)/)?.[1]} 
                                alt="Sample" 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                <ExternalLink className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          ) : (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                              {generatedDescriptions[model.id]}
                            </motion.p>
                          )
                        ) : (
                          <p className="italic text-gray-600 flex items-center justify-center h-full">
                            No description yet.
                          </p>
                        )}
                      </div>

                      <button
                        disabled={model.status !== 'ok' || generatingFor === model.id}
                        onClick={() => handleGenerateDescription(model)}
                        className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-orange-500/20 hover:text-orange-400 hover:border-orange-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                      >
                        {generatingFor === model.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            Generate {model.type === 'text' ? 'Description' : 'Sample'}
                          </>
                        )}
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {filteredModels.length === 0 && (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p>No models found matching "{search}"</p>
                  </div>
                )}
              </div>

              {/* Footer Copyright */}
              <div className="mt-20 pb-12 border-t border-white/5 pt-12 text-center space-y-4">
                  <div className="flex flex-wrap justify-center gap-8 text-[9px] font-bold text-gray-600 uppercase tracking-[0.3em]">
                      <span>Model Registry: PUBLIC</span>
                      <span className="text-orange-500">Routing: AIX-4</span>
                      <span>Latency: OPTIMAL</span>
                  </div>
                  <div className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em]">
                      © 2024 Saad Pie & SteveAI Team. All Rights Reserved.
                  </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
