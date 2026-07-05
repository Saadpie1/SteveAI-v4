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
  Quote,
  Terminal,
  Activity,
  Workflow,
  Wand2,
  Lock,
  Search,
  CheckCircle2,
  Boxes
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white pb-20 overflow-x-hidden flex flex-col">
      <div className="pt-24 flex-1">
        {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-600/5 blur-[120px] rounded-full animate-blob animation-delay-2000" />
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative pt-10 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] sm:text-xs font-black mb-8 tracking-[0.2em] uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ORCHESTRATOR v4.0 • LIVE & UNRESTRICTED</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85]">
            <span className="block">STEVE<span className="text-blue-500">AI</span></span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40 drop-shadow-2xl">
              LIMITLESS
            </span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-gray-400 text-lg sm:text-xl md:text-2xl mb-12 leading-relaxed px-4 font-medium">
            The ultimate multi-modal command center. Orchestrating 100+ specialized engines for <span className="text-white">Reasoning</span>, <span className="text-white">Flux Imaging</span>, <span className="text-white">Video Synthesis</span>, and <span className="text-white">Real-time Code Execution</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 pb-20">
            <Link
              to="/chat"
              className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(37,99,235,0.3)] group uppercase tracking-widest text-sm"
            >
              Enter Control Center <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/docs"
              className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/10 transition-all uppercase tracking-widest text-sm backdrop-blur-md"
            >
              System Specs
            </Link>
          </div>
        </motion.div>

        {/* Dashboard Preview Img */}
        <motion.div
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4, duration: 1 }}
           className="relative max-w-5xl mx-auto mt-10 rounded-[2.5rem] p-1 bg-gradient-to-b from-white/20 to-transparent shadow-2xl"
        >
          <div className="bg-[#050505] rounded-[2.3rem] overflow-hidden border border-white/5 relative aspect-video sm:aspect-auto">
            <img 
              src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop" 
              alt="Dashboard Preview" 
              className="w-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-4 sm:p-8 rounded-[2rem] bg-black/60 backdrop-blur-2xl border border-white/10 shadow-3xl text-left max-w-lg mx-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                    <Terminal className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-blue-500 uppercase tracking-widest">Active System</div>
                    <div className="text-lg font-black tracking-tight text-white">Code Execution Sandbox</div>
                  </div>
                </div>
                <div className="font-mono text-xs text-gray-400 space-y-1 mb-4 hidden sm:block">
                  <div className="flex gap-2"><span className="text-green-500">{">"}</span> <span>Executing steve_core.py...</span></div>
                  <div className="flex gap-2"><span className="text-gray-600">...</span> <span>Initializing Mirror 2.1 Protocol</span></div>
                  <div className="flex gap-2"><span className="text-blue-500">{">"}</span> <span className="text-white">Status: ALL SYSTEMS NOMINAL</span></div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest">Mirror 2.1 Ready</span>
                  <span className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-widest">Auto-Scale ON</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Grid */}
      <section className="max-w-7xl mx-auto px-4 mt-20 sm:mt-40">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 sm:p-12 rounded-[3rem] bg-zinc-900/30 border border-white/5 backdrop-blur-sm">
          {[
            { label: "Neural Weights", value: "850B+", icon: Cpu },
            { label: "Mirror Sites", value: "42", icon: Globe },
            { label: "Reasoning Peak", value: "98.4%", icon: Activity },
            { label: "Image Models", icon: ImageIcon, value: "18" },
          ].map((stat) => (
            <div key={stat.label} className="text-center md:text-left space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500">
                <stat.icon className="w-4 h-4" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">{stat.label}</span>
              </div>
              <div className="text-3xl sm:text-5xl font-black tracking-tighter text-white">{stat.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Multi-Modal Mastery Section */}
      <section className="max-w-7xl mx-auto px-4 mt-40">
        <div className="mb-16">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase mb-4">
            MULTI-MODAL <span className="text-blue-500">MASTERY</span>
          </h2>
          <p className="text-gray-400 max-w-xl text-lg font-medium">
            From high-logic reasoning to cinematic video and architectural 3D meshes. SteveAI orchestrates the world's most powerful weights through a single, robust API layer.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard 
            icon={ImageIcon} 
            title="Image Gen" 
            desc="FLUX, SDXL, MIDJOURNEY" 
            color="text-purple-500" 
          />
          <FeatureCard 
            icon={Video} 
            title="Video Gen" 
            desc="WAN 2.1, COGVIDEO, MOCHI" 
            color="text-red-500" 
          />
          <FeatureCard 
            icon={Box} 
            title="3D Sculpture" 
            desc="STABLE FAST 3D, HUNYUAN" 
            color="text-green-500" 
          />
          <FeatureCard 
            icon={Cpu} 
            title="Logic Engines" 
            desc="LLAMA 3.3, DEEPSEEK R1" 
            color="text-blue-500" 
          />
        </div>
      </section>

      {/* Quote Section */}
      <section className="max-w-4xl mx-auto px-4 mt-40 relative">
        <div className="p-8 sm:p-16 rounded-[3rem] bg-zinc-900/50 border border-white/5 relative overflow-hidden group">
          <Quote className="absolute top-8 left-8 w-24 h-24 text-blue-500/10 -rotate-12 transition-transform group-hover:rotate-0 duration-700" />
          <div className="relative z-10">
            <p className="text-2xl sm:text-4xl font-medium italic text-gray-200 leading-tight mb-12 text-center">
              "The future of AI isn't just about better models, it's about better orchestration. SteveAI is building the nervous system for the next generation of intelligence."
            </p>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500 mb-4">
                <img 
                  src="https://lh3.googleusercontent.com/a/ACg8ocII0Dt3UD1gvZN4bvb1J6iTfqWErDWaZrCXduaQOym1d5O1nCwn=s96-c" 
                  alt="Saad Pie" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-white uppercase tracking-tight">Saad Pie</div>
                <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Lead Architect</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure Section with Balloon Image */}
      <section className="max-w-7xl mx-auto px-4 mt-40">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-[3rem] overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=2672&auto=format&fit=crop" 
              alt="Robust Infrastructure" 
              className="w-full aspect-square object-cover transform scale-105 group-hover:scale-100 transition-transform duration-[2s]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-6 right-6 p-6 rounded-3xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 max-w-xs transition-transform hover:scale-105">
                <div className="flex items-center gap-2 text-green-500 font-black text-[10px] uppercase tracking-widest mb-2">
                    <RefreshCw className="w-3 h-3 animate-spin-slow" /> Mirror Active
                </div>
                <p className="text-xs text-gray-400 leading-relaxed font-medium">Automatic failover to secondary mirrors ensures 100% availability even during peak demand.</p>
            </div>
          </div>
          <div className="space-y-8">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-none">
              ROBUST <br /> <span className="text-blue-500">INFRASTRUCTURE</span>
            </h2>
            <p className="text-gray-400 text-xl font-medium leading-relaxed">
              Engineered for reliability. Our mirror system provides unprecedented access to restricted compute, allowing for seamless generation even under heavy global load.
            </p>
          </div>
        </div>
      </section>

      {/* The Core Capabilities */}
      <section className="max-w-7xl mx-auto px-4 mt-40">
        <div className="text-center mb-20 text-gray-500">
           <h2 className="text-xs font-black uppercase tracking-[0.4em]">Engineered Performance</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <CapabilityCard 
            icon={Workflow}
            title="Model Orchestration"
            desc="Dynamic load balancing across 100+ endpoints. Our system intelligently routes every prompt to the best-performing available engine."
          />
          <CapabilityCard 
            icon={Terminal}
            title="Real-time Sandbox"
            desc="The first-of-its-kind secure code execution environment. Write, test, and run scripts in JS, Python, and Bash directly in-chat."
            featured
          />
          <CapabilityCard 
            icon={Wand2}
            title="Flux Synthesis"
            desc="Proprietary integration with the Flux.1 generation model. Hyper-realistic visual synthesis at the press of a button."
          />
        </div>
      </section>

      {/* Gallery Section */}
      <section className="max-w-7xl mx-auto px-4 mt-40">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <img src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=2670&auto=format&fit=crop" alt="Render 1" className="rounded-3xl border border-white/10 aspect-square object-cover" referrerPolicy="no-referrer" />
           <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" alt="Render 2" className="rounded-3xl border border-white/10 aspect-square object-cover" referrerPolicy="no-referrer" />
           <img src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop" alt="Render 3" className="rounded-3xl border border-white/10 aspect-square object-cover" referrerPolicy="no-referrer" />
           <img id="render-img-4" src="https://images.unsplash.com/photo-1620121692029-d088224efc74?q=80&w=2664&auto=format&fit=crop" alt="Render 4" className="rounded-3xl border border-white/10 aspect-square object-cover" referrerPolicy="no-referrer" />
        </div>
      </section>

      {/* Architects & Founders */}
      <section className="max-w-7xl mx-auto px-4 mt-40 text-center pb-20">
        <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] mb-16">The Architects of Intelligence</h2>
        <div className="grid sm:grid-cols-3 gap-12 sm:gap-20 max-w-5xl mx-auto">
          {[
            { 
                name: "Saad Pie", 
                role: "Orchestrator Architect", 
                bio: "Architect of the SteveAI model routing engine and core mirror system.",
                img: "https://lh3.googleusercontent.com/a/ACg8ocII0Dt3UD1gvZN4bvb1J6iTfqWErDWaZrCXduaQOym1d5O1nCwn=s96-c"
            },
            { name: "Ahmed Aftab", role: "Spatial Lead", bio: "Directing development of the 3D generation and spatial intelligence engines." },
            { name: "Shawaiz Ali", role: "Infrastructure Strategist", bio: "Leading the global scale and high-availability mirror deployments." },
          ].map((person) => (
            <div key={person.name} className="group">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2.5rem] bg-zinc-900 border border-white/10 p-0.5 mx-auto mb-6 transform group-hover:rotate-6 transition-all duration-500 shadow-2xl relative">
                <div className="w-full h-full rounded-[2.3rem] overflow-hidden">
                  <img 
                    src={person.img || `https://picsum.photos/seed/${person.name}/400/400`} 
                    alt={person.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-white">{person.name}</h3>
              <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">{person.role}</div>
              <p className="text-gray-500 text-xs leading-relaxed max-w-[200px] mx-auto italic">{person.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Copyright */}
      <footer className="max-w-7xl mx-auto px-4 mt-20 pb-20 border-t border-white/5 pt-20">
        <div className="text-center space-y-6">
            <div className="flex justify-center gap-10 text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-10">
                <span>Mirrors: ONLINE</span>
                <span className="text-green-500">System: OPTIMAL</span>
                <span>Version: 4.0.2</span>
            </div>
            <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">
                © 2024 Saad Pie & SteveAI Team. All Rights Reserved.
            </div>
        </div>
      </footer>
    </div>
  </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-all group shadow-xl">
      <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{title}</h3>
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{desc}</p>
    </div>
  );
}

function CapabilityCard({ icon: Icon, title, desc, featured }: { icon: any, title: string, desc: string, featured?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "p-10 rounded-[3rem] border transition-all duration-500 group relative overflow-hidden",
        featured ? "bg-blue-600 border-blue-500 shadow-2xl scale-105 z-10" : "bg-zinc-900/50 border-white/10 hover:border-white/20"
      )}
    >
      <div className={cn(
        "w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500",
        featured ? "bg-white/20 text-white" : "bg-blue-600/10 text-blue-500 shadow-inner"
      )}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className={cn("text-2xl font-black mb-4 uppercase tracking-tight text-white")}>{title}</h3>
      <p className={cn("text-sm leading-relaxed font-medium shadow-sm", featured ? "text-blue-50" : "text-gray-400")}>{desc}</p>
      
      {featured && (
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 blur-[60px] rounded-full" />
      )}
    </motion.div>
  );
}
