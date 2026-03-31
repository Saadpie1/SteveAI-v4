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
  Quote
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
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
            BEYOND THE <span className="text-blue-500">INTERFACE</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
            SteveAI was born from a vision to democratize high-scale AI infrastructure. We don't just provide AI; we orchestrate it through a robust network of mirrors and proprietary routing.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">The Mission</h2>
            <p className="text-gray-400 leading-relaxed">
              Founded by <span className="text-white font-bold">Saad Pie</span>, SteveAI aims to bridge the gap between complex AI models and user-centric applications. By utilizing a proprietary Model Routing Engine and a failover mirror system, we ensure that every query is handled by the most capable model available, optimizing for both speed and intelligence.
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-gray-400 hover:text-blue-400"
                  title={link.label}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-[40px] bg-gradient-to-br from-blue-600 to-purple-600 opacity-20 blur-3xl absolute inset-0" />
            <div className="relative aspect-square rounded-[40px] border border-white/10 bg-zinc-900/50 p-8 flex flex-col justify-center items-center text-center overflow-hidden">
              <img 
                src="https://picsum.photos/seed/steveai-core/600/600" 
                alt="SteveAI Core" 
                className="absolute inset-0 w-full h-full object-cover opacity-20"
                referrerPolicy="no-referrer"
              />
              <Cpu className="w-16 h-16 text-blue-500 mb-6 relative z-10" />
              <div className="text-4xl font-black mb-2 relative z-10">v4.0</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest relative z-10">Orchestration Engine</div>
              <div className="mt-4 text-[10px] text-blue-400 font-bold uppercase tracking-widest animate-pulse relative z-10">
                Spatial AI & 3D Sculptor Live
              </div>
            </div>
          </div>
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-20 p-10 rounded-[40px] bg-zinc-900/30 border border-white/10 text-center relative"
        >
          <Quote className="w-10 h-10 text-blue-500/10 absolute top-6 left-6" />
          <p className="text-xl italic text-gray-300 leading-relaxed">
            "Innovation isn't just about creating something new; it's about making the complex accessible. SteveAI is our contribution to a future where AI is a seamless extension of human creativity."
          </p>
        </motion.div>

        <div className="border-t border-white/10 pt-20">
          <h2 className="text-center text-sm font-bold text-gray-500 uppercase tracking-[0.3em] mb-12">The Core Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Saad Pie", role: "Lead Architect & Founder", bio: "Visionary behind the SteveAI orchestration layer and mirror failover system." },
              { name: "Shawaiz Ali Yasin", role: "Co-Owner & Strategist", bio: "Driving the strategic growth and infrastructure scale across global endpoints." },
              { name: "Ahmed Aftab", role: "Co-Owner & Spatial Lead", bio: "Architect of the 3D generation and spatial AI modules within the orchestrator." },
            ].map((member) => (
              <div key={member.name} className="p-6 rounded-3xl bg-white/5 border border-white/10 text-center group hover:border-blue-500/50 transition-all">
                <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4 overflow-hidden border border-white/10">
                  <img 
                    src={`https://picsum.photos/seed/${member.name}/200/200`} 
                    alt={member.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="font-bold text-lg">{member.name}</h3>
                <p className="text-blue-500 text-[10px] font-bold uppercase tracking-widest mb-3 mt-1">{member.role}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center">
          <p className="text-gray-500 text-sm mb-4">Interested in collaboration or review?</p>
          <a 
            href="mailto:saadabdulrehman2010@gmail.com" 
            className="text-blue-500 font-bold hover:underline"
          >
            saadabdulrehman2010@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
