import { motion } from "motion/react";
import { 
  Book, 
  Code, 
  Terminal, 
  Zap, 
  Shield, 
  Globe, 
  RefreshCw, 
  Box, 
  Video, 
  Image as ImageIcon,
  MessageSquare
} from "lucide-react";

export default function Docs() {
  const sections = [
    {
      title: "The Orchestration Layer",
      icon: Zap,
      content: "SteveAI is a multi-modal orchestrator that routes your requests to the most capable model. Our system handles everything from text reasoning to high-fidelity 3D sculpture generation through a unified interface."
    },
    {
      title: "Mirror Failover System",
      icon: RefreshCw,
      content: "To ensure 100% availability, we utilize a robust mirror system. Each model (especially Video and 3D) is backed by multiple Hugging Face space mirrors. If one endpoint is busy or down, the system automatically fails over to the next available mirror."
    },
    {
      title: "Chat & Reasoning",
      icon: MessageSquare,
      content: "Access top-tier LLMs like Llama 3.3 70B, DeepSeek R1, and Gemini 2.0 Flash. Our routing engine selects models based on whether you need creative writing, complex coding, or fast responses."
    },
    {
      title: "Image Generation",
      icon: ImageIcon,
      content: "Generate stunning visuals using Flux, SDXL Lightning, and specialized creative models. Use the /image command in chat or visit the dedicated Image Gen studio for advanced controls."
    },
    {
      title: "Video Generation",
      icon: Video,
      content: "Create cinematic clips with Wan 2.1, CogVideoX, and Mochi-1. Our Video Studio provides direct access to high-compute mirrors with built-in translation for non-English interfaces."
    },
    {
      title: "3D Sculpture Studio",
      icon: Box,
      content: "Convert concepts into 3D assets using Stable Fast 3D. The 3D Gen page offers a specialized environment for spatial AI generation, optimized for professional workflows."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Book className="w-6 h-6 text-blue-500" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">Documentation</h1>
          </div>
          <p className="text-gray-400 text-lg leading-relaxed">
            Master the orchestration of the world's most advanced AI models. Learn how to leverage our mirror system for uninterrupted creative workflows.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-zinc-900/50 border border-white/10 hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <section.icon className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-lg font-bold">{section.title}</h2>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-3xl bg-blue-600/10 border border-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full -z-10" />
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" /> API & Enterprise
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            Developers can integrate SteveAI's routing engine into their own applications. For enterprise API keys, custom orchestration layers, or dedicated mirror deployments, contact our lead architect.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 transition-all">
              Request API Access
            </button>
            <a 
              href="mailto:saadabdulrehman2010@gmail.com"
              className="px-6 py-3 bg-white/5 text-white text-sm font-bold rounded-xl hover:bg-white/10 transition-all border border-white/10"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
