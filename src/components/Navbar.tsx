import { useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Cpu, 
  Menu, 
  X, 
  LogIn, 
  LogOut, 
  User as UserIcon,
  Settings,
  CreditCard,
  Activity,
  UserCircle,
  ChevronDown,
  Zap,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Box,
  FileText,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { useAuth, useSidebar, useModals } from "../App";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { isOpen, setIsOpen } = useSidebar();
  const { openSettings, openCredits, openActivity } = useModals();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
      setIsMobileMenuOpen(false);
      setIsUserDropdownOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isChatPage = location.pathname.startsWith("/chat");
  const isImagePage = location.pathname === "/image";
  const isVideoPage = location.pathname === "/video";
  const isThreeDPage = location.pathname === "/3d";
  const isAgentPage = location.pathname === "/agent";
  const showSidebar = (isChatPage || isImagePage || isVideoPage || isThreeDPage || isAgentPage);

  const navLinks = [
    { name: "Home", path: "/", icon: Zap },
    { name: "Agent", path: "/agent", icon: Zap },
    { name: "Chat", path: "/chat", icon: MessageSquare },
    { name: "Image Gen", path: "/image", icon: ImageIcon },
    { name: "Video Gen", path: "/video", icon: Video },
    { name: "3D Gen", path: "/3d", icon: Box },
    { name: "Docs", path: "/docs", icon: FileText },
    { name: "About", path: "/about", icon: Info },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-md border-b border-white/10 h-16 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showSidebar && (
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Cpu className="w-8 h-8 text-blue-500 group-hover:text-blue-400 transition-colors" />
                <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full animate-pulse" />
              </div>
              <span className="text-xl font-bold tracking-tighter text-white">
                STEVE<span className="text-blue-500">AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-xs font-bold uppercase tracking-widest transition-colors hover:text-blue-400",
                    location.pathname === link.path ? "text-blue-500" : "text-gray-400"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            {!loading && (
              user ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all group"
                  >
                    <span className="text-[10px] font-black uppercase text-zinc-400 group-hover:text-white tracking-widest">{user.displayName?.split(' ')[0]}</span>
                    {user.photoURL ? (
                      <img src={user.photoURL} className="w-8 h-8 rounded-full border border-white/10 shadow-lg" alt="Profile" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center border border-white/10">
                        <UserIcon className="w-4 h-4 text-blue-500" />
                      </div>
                    )}
                    <ChevronDown className={cn("w-3 h-3 text-zinc-600 transition-transform", isUserDropdownOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsUserDropdownOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 w-64 bg-zinc-950 border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 z-20 backdrop-blur-2xl"
                        >
                          <div className="p-4 border-b border-white/5 mb-2">
                             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Authenticated Node</p>
                             <p className="text-xs font-bold text-white truncate">{user.email}</p>
                          </div>
                          
                          <Link to="/profile" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-2xl transition-colors group">
                            <UserCircle className="w-4 h-4 text-zinc-500 group-hover:text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Neural Profile</span>
                          </Link>
                          
                          <button onClick={() => { openSettings(); setIsUserDropdownOpen(false); }} className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-2xl transition-colors group text-left">
                            <Settings className="w-4 h-4 text-zinc-500 group-hover:text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Global Config</span>
                          </button>
                          
                          <button onClick={() => { openCredits(); setIsUserDropdownOpen(false); }} className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-2xl transition-colors group text-left">
                            <CreditCard className="w-4 h-4 text-zinc-500 group-hover:text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Token Credits</span>
                          </button>

                          <button onClick={() => { openActivity(); setIsUserDropdownOpen(false); }} className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-2xl transition-colors group text-left">
                            <Activity className="w-4 h-4 text-zinc-500 group-hover:text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Synapse Activity</span>
                          </button>

                          <div className="h-px bg-white/5 my-2 mx-2" />

                          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 hover:bg-red-500/10 rounded-2xl transition-colors group text-left">
                            <LogOut className="w-4 h-4 text-zinc-500 group-hover:text-red-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-red-500">Disconnect</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    to="/login"
                    className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                  >
                    Get Started
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
             {user && (
              <div className="relative">
                <button 
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} className="w-8 h-8 rounded-full border border-white/10" alt="Profile" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center border border-white/10">
                      <UserIcon className="w-4 h-4 text-blue-500" />
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsUserDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-zinc-950 border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 z-20 backdrop-blur-2xl"
                      >
                        <div className="p-4 border-b border-white/5 mb-2">
                           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Authenticated Node</p>
                           <p className="text-xs font-bold text-white truncate">{user.email}</p>
                        </div>
                        
                        <Link to="/profile" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-2xl transition-colors group">
                          <UserCircle className="w-4 h-4 text-zinc-500 group-hover:text-blue-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Neural Profile</span>
                        </Link>
                        
                        <button onClick={() => { openSettings(); setIsUserDropdownOpen(false); }} className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-2xl transition-colors group text-left">
                          <Settings className="w-4 h-4 text-zinc-500 group-hover:text-blue-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Global Config</span>
                        </button>
                        
                        <button onClick={() => { openCredits(); setIsUserDropdownOpen(false); }} className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-2xl transition-colors group text-left">
                          <CreditCard className="w-4 h-4 text-zinc-500 group-hover:text-blue-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Token Credits</span>
                        </button>

                        <button onClick={() => { openActivity(); setIsUserDropdownOpen(false); }} className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-2xl transition-colors group text-left">
                          <Activity className="w-4 h-4 text-zinc-500 group-hover:text-blue-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Synapse Activity</span>
                        </button>

                        <div className="h-px bg-white/5 my-2 mx-2" />

                        <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 hover:bg-red-500/10 rounded-2xl transition-colors group text-left">
                          <LogOut className="w-4 h-4 text-zinc-500 group-hover:text-red-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-red-500">Disconnect</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-400 hover:text-white transition-colors p-2 bg-white/5 rounded-xl border border-white/5"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[1001] bg-[#09090B] md:hidden flex flex-col h-screen w-screen"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 min-h-[64px] border-b border-white/10 bg-black/50 backdrop-blur-sm">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                <Cpu className="w-8 h-8 text-blue-500" />
                <span className="text-xl font-bold tracking-tighter text-white uppercase">STEVE<span className="text-blue-500">AI</span></span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white transition-colors">
                <X className="w-7 h-7" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-none">
              <div className="px-6 py-8 space-y-12">
                <nav className="space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-5 px-6 py-5 rounded-2xl transition-all active:scale-95",
                        location.pathname === link.path
                          ? "bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)]"
                          : "text-zinc-300 hover:bg-white/5"
                      )}
                    >
                      <link.icon className={cn("w-6 h-6 transition-colors", location.pathname === link.path ? "text-white" : "text-zinc-500")} />
                      <span className="text-xl font-black uppercase tracking-tighter">
                        {link.name}
                      </span>
                    </Link>
                  ))}
                </nav>

                <div className="pt-8 border-t border-white/10">
                  {!loading && !user ? (
                    <div className="flex flex-col gap-4">
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full flex items-center justify-center gap-3 px-6 py-6 bg-zinc-900 border border-white/5 text-white rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
                      >
                        <LogIn className="w-5 h-5 text-zinc-500" />
                        Connect Node
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full flex items-center justify-center gap-3 px-6 py-6 bg-blue-600 text-white rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 active:scale-95 transition-all"
                      >
                        <UserIcon className="w-5 h-5" />
                        Initialize Join
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="px-8 py-6 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">Authenticated Identity</p>
                        <p className="text-base font-bold text-white truncate font-mono">{user?.email}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center gap-3 p-6 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all active:scale-90">
                          <UserCircle className="w-8 h-8 text-blue-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Profile</span>
                        </Link>
                        <button onClick={() => { openSettings(); setIsMobileMenuOpen(false); }} className="flex flex-col items-center gap-3 p-6 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all active:scale-90">
                          <Settings className="w-8 h-8 text-blue-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Config</span>
                        </button>
                        <button onClick={() => { openCredits(); setIsMobileMenuOpen(false); }} className="flex flex-col items-center gap-3 p-6 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all active:scale-90">
                          <CreditCard className="w-8 h-8 text-blue-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Credits</span>
                        </button>
                        <button onClick={() => { openActivity(); setIsMobileMenuOpen(false); }} className="flex flex-col items-center gap-3 p-6 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all active:scale-90">
                          <Activity className="w-8 h-8 text-blue-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Activity</span>
                        </button>
                      </div>

                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-4 p-6 bg-red-600/10 border border-red-500/20 text-red-500 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95"
                      >
                        <LogOut className="w-6 h-6 outline-none" />
                        Terminate Session
                      </button>
                    </div>
                  )}
                </div>
                {/* Spacer for better scrolling at bottom */}
                <div className="h-20" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
