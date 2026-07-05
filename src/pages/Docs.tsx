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
  MessageSquare,
  Cpu,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Wand2,
  Star,
  Send,
  Loader2
} from "lucide-react";
import { cn } from "../lib/utils";
import { useState } from "react";
import { useAuth } from "../App";
import { addDoc, collection } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

export default function Docs() {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    {
      id: "core",
      title: "Core Mechanics",
      items: [
        {
          title: "The Orchestration Layer",
          icon: Zap,
          content: "SteveAI operates on a multi-modal routing engine. Unlike traditional prompts, your requests are parsed and sent to specialized neural weights based on the complexity and modality required."
        },
        {
          title: "Mirror Failover System (MFS)",
          icon: RefreshCw,
          content: "Access high-compute models without outages. Our MFS maintain 42+ active mirrors across global data centers. If one space is sleep-mode or busy, we hot-swap the endpoint in milliseconds."
        }
      ]
    },
    {
      id: "exec",
      title: "Execution Engine",
      items: [
        {
          title: "The Run Sandbox",
          icon: Terminal,
          content: "SteveAI isn't just about text. When you ask it to code, you can click the 'Run' button to execute logic in real-time. We support Node.js, Python 3, TypeScript, and Bash natively."
        },
        {
          title: "Standard Library Support",
          icon: Code,
          content: "The execution environment includes major standard libraries. For advanced data science or complex logic, the orchestrator handles dependency injection automatically."
        }
      ]
    },
    {
      id: "modality",
      title: "Multi-Modality",
      items: [
        {
          title: "Flux & SDXL Imaging",
          icon: Wand2,
          content: "To generate images, output the specific Markdown tag or ask SteveAI directly. Supported models include Flux.1, SDXL Lightning, and Realism-XL for hyper-realistic renders."
        },
        {
          title: "Spatial AI & 3D",
          icon: Box,
          content: "Create GLB and OBJ assets using the 3D Generation module. Assets are synthesized using transformer-based spatial models like Stable Fast 3D."
        }
      ]
    }
  ];

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0) return;

    setIsSubmitting(true);
    const path = "feedback";
    try {
      await addDoc(collection(db, path), {
        rating,
        feedback,
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date().toISOString()
      });

      // Feedback through email as requested
      const subject = encodeURIComponent(`SteveAI Docs Feedback - ${rating} Stars`);
      const body = encodeURIComponent(`User: ${user.email}\nRating: ${rating}/5\n\nFeedback:\n${feedback}`);
      const mailtoUrl = `mailto:saadabdulrehman2010@gmail.com?subject=${subject}&body=${body}`;
      
      setSubmitted(true);
      
      // Open email client
      window.location.href = mailtoUrl;

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16">
        {/* Navigation Sidebar (Desktop) */}
        <aside className="hidden md:block w-64 shrink-0 font-black text-xs uppercase tracking-[0.2em] space-y-10 sticky top-32 h-fit">
          <div>
            <div className="text-gray-500 mb-6 flex items-center gap-2">
                <Book className="w-4 h-4" /> <span>Getting Started</span>
            </div>
            <ul className="space-y-4">
              <li className="text-white hover:text-blue-500 transition-colors cursor-pointer flex items-center gap-2">
                  <ChevronRight className="w-3 h-3 text-blue-500" /> Introduction
              </li>
              <li className="text-gray-600 hover:text-white transition-colors cursor-pointer">Architecture</li>
              <li className="text-gray-600 hover:text-white transition-colors cursor-pointer">The Mirror Grid</li>
            </ul>
          </div>
          <div>
            <div className="text-gray-500 mb-6 flex items-center gap-2">
                <Terminal className="w-4 h-4" /> <span>Technical Specs</span>
            </div>
            <ul className="space-y-4">
              <li className="text-gray-600 hover:text-white transition-colors cursor-pointer">Code Sandboxing</li>
              <li className="text-gray-600 hover:text-white transition-colors cursor-pointer">Image Tagging</li>
              <li className="text-gray-600 hover:text-white transition-colors cursor-pointer">API Integration</li>
            </ul>
          </div>
        </aside>

        <div className="flex-1">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black mb-8 tracking-[0.3em] uppercase">
              v4.0 TECHNICAL DOCUMENTATION
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-8 leading-none">
              SYSTEM <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">OPERATIONS</span>
            </h1>
            <p className="text-gray-400 text-xl leading-relaxed max-w-2xl font-medium">
              A comprehensive technical guide to orchestrating the most advanced AI mirrors and execution environments in the world.
            </p>
          </motion.div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-20">
              <DocStat icon={Zap} label="Response" value="< 500ms" />
              <DocStat icon={RefreshCw} label="Mirror Uptime" value="99.98%" />
              <DocStat icon={Globe} label="Endpoints" value="100+" />
              <DocStat icon={Shield} label="Security" value="E2EE" />
          </div>

          {/* Main Content Sections */}
          <div className="space-y-32">
            {categories.map((cat) => (
              <section key={cat.id}>
                <h2 className="text-xs font-black text-blue-500 uppercase tracking-[0.5em] mb-12 border-b border-white/10 pb-4 flex items-center justify-between">
                  {cat.title}
                  <span className="text-gray-800 text-[10px]">SECTION::{cat.id.toUpperCase()}</span>
                </h2>
                <div className="grid sm:grid-cols-2 gap-8">
                  {cat.items.map((item) => (
                    <div key={item.title} className="p-10 rounded-[3rem] bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all group">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all">
                        <item.icon className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                      </div>
                      <h3 className="text-xl font-black uppercase mb-4 text-white">{item.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed font-medium">
                        {item.content}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Sandbox Deep Dive Section */}
          <section className="mt-40 p-12 sm:p-20 rounded-[4rem] bg-gradient-to-br from-blue-600/20 to-zinc-950 border border-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full" />
            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1 space-y-8">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 flex items-center justify-center border border-white/20">
                        <Terminal className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-4xl font-black tracking-tight uppercase">The Developer Sandbox</h2>
                    <p className="text-gray-300 text-lg leading-relaxed font-medium">
                        SteveAI executes logic in an isolated containerized environment. This allows you to verify algorithms, solve complex mathematical puzzles, or process large data arrays without leaving the interface.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm font-bold text-blue-300">
                             <CheckCircle2 className="w-4 h-4" /> Node.js 20+ Execution
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-blue-300">
                             <CheckCircle2 className="w-4 h-4" /> Python 3.10+ Scientific Stack
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-blue-300">
                             <CheckCircle2 className="w-4 h-4" /> Isolated /tmp data volumes
                        </div>
                    </div>
                </div>
                <div className="flex-1 w-full max-w-sm">
                    <div className="p-6 rounded-[2rem] bg-black border border-white/10 font-mono text-[10px] sm:text-xs">
                        <div className="text-gray-600 mb-2"># Sample Execution Logic</div>
                        <div className="text-blue-500">const</div> <span className="text-white">steveCore</span> = {"{"} <br />
                        &nbsp;&nbsp;<span className="text-purple-400">orchestration:</span> <span className="text-green-400">"unlimited"</span>, <br />
                        &nbsp;&nbsp;<span className="text-purple-400">mirrors:</span> <span className="text-yellow-500">42</span>, <br />
                        &nbsp;&nbsp;<span className="text-purple-400">status:</span> <span className="text-green-400">() {"=>"} "NOMINAL"</span> <br />
                        {"}"}; <br />
                        <br />
                        <span className="text-blue-500">console</span>.<span className="text-yellow-500">log</span>(steveCore.status());
                        <div className="mt-4 pt-4 border-t border-white/5 text-green-500">
                             {">"} Output: NOMINAL
                        </div>
                    </div>
                </div>
            </div>
          </section>

          {/* Feedback & Rating Section */}
          <section className="mt-40 p-12 rounded-[3.5rem] bg-zinc-900/40 border border-white/5">
            <div className="max-w-2xl mx-auto text-center space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-black uppercase tracking-tight">Was this helpful?</h2>
                <p className="text-gray-500 font-medium">Your feedback drives the neural refinement of SteveAI documentation.</p>
              </div>

              {submitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-10 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold"
                >
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-xl">Feedback Synced Successfully!</p>
                  <p className="text-sm mt-2 font-medium opacity-70">Redirecting to email client for details...</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="space-y-10">
                  <div className="flex justify-center gap-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="transition-all hover:scale-110"
                      >
                        <Star 
                          className={cn(
                            "w-10 h-10 transition-all",
                            (hoverRating || rating) >= star 
                              ? "text-yellow-400 fill-yellow-400" 
                              : "text-zinc-700 hover:text-zinc-500"
                          )} 
                        />
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <textarea
                      placeholder="Tell us how we can improve... (Optional)"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-3xl p-6 text-sm text-white placeholder:text-gray-600 outline-none focus:border-blue-500/50 transition-all min-h-[150px] resize-none"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || rating === 0}
                      className="w-full py-5 bg-blue-600 disabled:bg-zinc-800 disabled:text-gray-600 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-3 group"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Sync Feedback <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>

          {/* Footer Tools - Simplified */}
          <div className="mt-20 pt-20 border-t border-white/5 text-center space-y-6">
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
                <span>Mirrors: ONLINE</span>
                <span className="text-green-500">System: OPTIMAL</span>
                <span>Version: 4.0.2</span>
            </div>
            <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">
              © 2024 Saad Pie & SteveAI Team. All Rights Reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}

function DocStat({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="p-6 rounded-[2rem] bg-zinc-900/50 border border-white/5 flex flex-col items-center text-center">
            <Icon className="w-5 h-5 text-gray-500 mb-3" />
            <div className="text-xl font-black text-white">{value}</div>
            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">{label}</div>
        </div>
    );
}
