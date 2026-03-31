import { motion } from "motion/react";
import { 
  Cpu, 
  Zap, 
  Shield, 
  Globe, 
  ArrowRight,
  Code,
  Layers,
  Sparkles,
  Video,
  Image as ImageIcon,
  Box,
  RefreshCw,
  Quote
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 overflow-x-hidden">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] sm:text-xs font-bold mb-8">
            <Sparkles className="w-3 h-3" />
            <span>v4.0 MULTI-MODAL ORCHESTRATOR IS LIVE</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-none">
            STEVE<span className="text-blue-500">AI</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20">
              ORCHESTRATOR
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-gray-400 text-base sm:text-lg md:text-xl mb-10 leading-relaxed px-4">
            Orchestrate 100+ specialized AI models for text, image, video, and 3D generation in one unified interface. Architected for precision and massive scale.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <Link
              to="/chat"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(37,99,235,0.3)]"
            >
              Start Orchestrating <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/docs"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all"
            >
              Read Documentation
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mt-24 border-y border-white/10 py-12">
          {[
            { label: "Models Integrated", value: "120+" },
            { label: "Visual Engines", value: "35+" },
            { label: "Active Users", value: "15k+" },
            { label: "Mirror Uptime", value: "99.99%" },
          ].map((stat) => (
            <div key={stat.label} className="px-2">
              <div className="text-2xl sm:text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Visual Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight">
              MULTI-MODAL <br />
              <span className="text-blue-500">MASTERY</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              From high-logic reasoning to cinematic video and architectural 3D meshes. SteveAI orchestrates the world's most powerful weights through a single, robust API layer.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <ImageIcon className="w-6 h-6 text-purple-500 mb-2" />
                <div className="font-bold text-sm">Image Gen</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">Flux, SDXL, Midjourney</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <Video className="w-6 h-6 text-red-500 mb-2" />
                <div className="font-bold text-sm">Video Gen</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">Wan 2.1, CogVideo, Mochi</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <Box className="w-6 h-6 text-green-500 mb-2" />
                <div className="font-bold text-sm">3D Sculpture</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">Stable Fast 3D, Hunyuan</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <Cpu className="w-6 h-6 text-blue-500 mb-2" />
                <div className="font-bold text-sm">Logic Engines</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">Llama 3.3, DeepSeek R1</div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-blue-600/20 blur-[100px] rounded-full" />
            <img 
              src="https://picsum.photos/seed/ai-sculpture/800/800" 
              alt="AI Generation" 
              className="relative rounded-[40px] border border-white/10 shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-6 -right-6 bg-zinc-900 border border-white/10 p-6 rounded-3xl shadow-2xl max-w-[240px]">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-4 h-4 text-green-500 animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest text-green-500">Mirror Active</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Automatic failover to secondary mirrors ensures 100% availability even during peak demand.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="max-w-4xl mx-auto px-4 mt-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-12 rounded-[40px] bg-zinc-900/50 border border-white/10"
        >
          <Quote className="w-12 h-12 text-blue-500/20 absolute top-8 left-8" />
          <p className="text-xl sm:text-2xl md:text-3xl font-medium italic leading-relaxed text-gray-300 mb-8">
            "The future of AI isn't just about better models, it's about better orchestration. SteveAI is building the nervous system for the next generation of intelligence."
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center font-black text-blue-400">S</div>
            <div className="text-left">
              <div className="font-bold">Saad Pie</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">Lead Architect</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 uppercase">
            Robust Infrastructure
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Engineered for reliability. Our mirror system provides unprecedented access to restricted compute.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: RefreshCw,
              title: "Mirror Failover",
              desc: "Every model is backed by multiple mirrors. If one endpoint goes down, the orchestrator switches instantly.",
              color: "green"
            },
            {
              icon: Globe,
              title: "Global Routing",
              desc: "Strategic routing across Hugging Face spaces and proprietary endpoints for zero-latency generation.",
              color: "blue"
            },
            {
              icon: Shield,
              title: "Enterprise Security",
              desc: "End-to-end encryption for all prompts and generated assets. Your creative data remains yours.",
              color: "purple"
            }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all group"
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                feature.color === "blue" ? "bg-blue-500/20 text-blue-400" :
                feature.color === "purple" ? "bg-purple-500/20 text-purple-400" :
                "bg-green-500/20 text-green-400"
              )}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Architects Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32 text-center">
        <div className="p-12 rounded-[40px] bg-gradient-to-b from-blue-600/10 to-transparent border border-white/10">
          <h2 className="text-2xl font-bold mb-8 uppercase tracking-widest text-blue-400">The Architects</h2>
          <div className="flex flex-wrap justify-center gap-12">
            {[
              { name: "Saad Pie", role: "Lead Architect" },
              { name: "Shawaiz Ali Yasin", role: "Co-Owner" },
              { name: "Ahmed Aftab", role: "Co-Owner" },
            ].map((person) => (
              <div key={person.name} className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 mb-4 flex items-center justify-center overflow-hidden">
                  <img 
                    src={`https://picsum.photos/seed/${person.name}/200/200`} 
                    alt={person.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="font-bold text-white">{person.name}</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">{person.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
