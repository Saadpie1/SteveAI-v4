import { motion } from "motion/react";
import { 
  Cpu, 
  Users, 
  Globe, 
  Github, 
  Twitter, 
  Mail, 
  Instagram, 
  Linkedin,
  Quote,
  Layers,
  Shield,
  Zap,
  Boxes,
  Microchip
} from "lucide-react";

export default function About() {
  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/saad_pie", label: "Instagram" },
    { icon: Twitter, href: "https://x.com/saad_pie", label: "X" },
    { icon: Github, href: "https://github.com/Saadpie1", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com/in/saad-pie", label: "LinkedIn" },
    { icon: Mail, href: "mailto:saadabdulrehman2010@gmail.com", label: "Email" }
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20 sm:mb-32"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black mb-8 tracking-[0.3em] uppercase">
            ESTABLISHED 2024 • VERSION 4.0.2
          </div>
          <h1 className="text-5xl sm:text-8xl lg:text-[10rem] font-black tracking-tighter mb-8 leading-[0.8] uppercase">
            THE <span className="text-blue-500">ORIGIN</span><br className="hidden sm:block" />
            STORY
          </h1>
          <p className="text-gray-400 text-base sm:text-xl leading-relaxed max-w-3xl mx-auto font-medium px-4">
            SteveAI was built on a singular premise: <span className="text-white">Orchestration over Isolation.</span> We didn't want to build just another chatbot; we wanted to build the nervous system for a multi-modal future.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-20 mb-32 items-center">
          <div className="space-y-8 order-2 md:order-1">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">The Vision</h2>
            <div className="space-y-6 text-gray-400 text-base sm:text-lg leading-relaxed">
              <p>
                Founded by <span className="text-white font-bold">Saad Pie</span>, SteveAI (Stands for <span className="text-blue-500 italic uppercase">Sovereign Technical Electronic Virtual Entity</span>) began as an experiment in high-availability model routing.
              </p>
              <p>
                Today, it is a sophisticated orchestrator that leverages a proprietary <span className="text-white">Mirror Failover System (MFS)</span>. This system prevents the common drawbacks of single-endpoint AI—timeouts, rate limits, and outages—by maintaining a live grid of synchronized mirrors across global providers.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 sm:p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-gray-400 hover:text-blue-400 hover:scale-110 active:scale-95 shadow-xl"
                  title={link.label}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          <div className="relative order-1 md:order-2 px-8 sm:px-0">
            <div className="aspect-square rounded-[2.5rem] sm:rounded-[3rem] bg-gradient-to-br from-blue-600 to-purple-600 opacity-20 blur-[60px] sm:blur-[100px] absolute inset-0 animate-pulse" />
            <div className="relative aspect-square rounded-[2.5rem] sm:rounded-[3rem] border border-white/10 bg-zinc-900/50 p-8 sm:p-12 flex flex-col justify-center items-center text-center overflow-hidden shadow-3xl">
              <img 
                src="https://images.unsplash.com/photo-1620712943543-bcc4628c9757?q=80&w=2670&auto=format&fit=crop" 
                alt="SteveAI Core Vision" 
                className="absolute inset-0 w-full h-full object-cover opacity-20 filter grayscale"
                referrerPolicy="no-referrer"
              />
              <Microchip className="w-16 h-16 sm:w-20 sm:h-20 text-blue-500 mb-6 sm:mb-8 relative z-10 animate-bounce-slow" />
              <div className="text-5xl sm:text-6xl font-black mb-2 relative z-10 tracking-widest text-white uppercase">4.0.2</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] relative z-10">Neural Architecture</div>
              <div className="mt-8 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 font-black uppercase tracking-widest animate-pulse relative z-10">
                ACTIVE MIRROR GRID 2.1
              </div>
            </div>
          </div>
        </div>

        {/* Philosophy Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-32">
            <div className="p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] bg-zinc-900/30 border border-white/5 space-y-6">
                <Zap className="w-10 h-10 text-blue-500" />
                <h3 className="text-xl font-black uppercase tracking-tight text-white">Speed</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">Latency is the enemy of creativity. Our routing engine optimizes for milliseconds, ensuring thoughts flow through our models as fast as you generate them.</p>
            </div>
            <div className="p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] bg-zinc-900/30 border border-white/5 space-y-6">
                <Shield className="w-10 h-10 text-purple-500" />
                <h3 className="text-xl font-black uppercase tracking-tight text-white">Privacy</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">Your data is ephemeral. We don't train on your prompts, and our mirrors are designed to scrub session metadata instantly after generation.</p>
            </div>
            <div className="p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] bg-zinc-900/30 border border-white/5 space-y-6 sm:col-span-2 lg:col-span-1">
                <Boxes className="w-10 h-10 text-green-500" />
                <h3 className="text-xl font-black uppercase tracking-tight text-white">Modality</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">Text, pixels, spatial meshes, and executable logic. True intelligence is not confined to a single format.</p>
            </div>
        </div>

        {/* Team Section */}
        <div className="border-y border-white/10 py-20 sm:py-32 mb-20">
          <h2 className="text-center text-xs font-black text-gray-500 uppercase tracking-[0.5em] mb-16 sm:mb-20">The Architect Collective</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16">
            {[
              { 
                name: "Saad Pie", 
                role: "Founder & Lead Architect", 
                bio: "Inventor of the sovereign model routing layer and the 4.0 orchestrator core.",
                img: "https://lh3.googleusercontent.com/a/ACg8ocII0Dt3UD1gvZN4bvb1J6iTfqWErDWaZrCXduaQOym1d5O1nCwn=s96-c"
              },
              { name: "Shawaiz Ali", role: "Cloud Strategist", bio: "Leading the scaling operations for our high-compute global mirror network." },
              { name: "Ahmed Aftab", role: "Spatial Designer", bio: "Directing the evolution of 3D synthesis and spatial neural networks." },
            ].map((member) => (
              <div key={member.name} className="flex flex-col items-center text-center group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[2rem] sm:rounded-[2.5rem] bg-zinc-900 border border-white/10 p-1 mb-6 sm:mb-8 transform group-hover:-rotate-3 transition-all duration-500 shadow-2xl relative">
                  <div className="absolute inset-0 bg-blue-600/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img 
                    src={member.img || `https://picsum.photos/seed/${member.name}/400/400`} 
                    alt={member.name} 
                    className="w-full h-full object-cover rounded-[1.8rem] sm:rounded-[2.3rem] filter grayscale group-hover:grayscale-0 transition-all duration-700 relative z-10"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="font-black text-2xl uppercase tracking-tighter text-white">{member.name}</h3>
                <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 mt-2">{member.role}</p>
                <p className="text-gray-500 text-xs leading-relaxed max-w-[220px] italic font-medium">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact/Collaboration */}
        <div className="text-center space-y-10 pb-20 items-center flex flex-col">
          <div className="text-gray-500 text-[10px] sm:text-xs font-black uppercase tracking-widest">Inquiries & Collaborative Review</div>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            href="mailto:saadabdulrehman2010@gmail.com" 
            className="inline-block text-xl sm:text-3xl md:text-5xl font-black text-white hover:text-blue-500 transition-colors uppercase border-b-4 border-white/10 hover:border-blue-500 pb-2 max-w-full truncate px-4"
          >
            saadabdulrehman2010@gmail.com
          </motion.a>
          
          <div className="w-full pt-20 border-t border-white/5 space-y-6">
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
                <span>Mirrors: ONLINE</span>
                <span className="text-green-500">System: OPTIMAL</span>
                <span>Version: 4.0.2</span>
            </div>
            <div className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em]">
          © 2024 Saad Pie & SteveAI Team. All Rights Reserved.
        </div>
      </div>
    </div>
  </div>
</div>
</div>
  );
}
