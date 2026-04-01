import { Link, useLocation } from "react-router-dom";
import { Cpu, Menu, X, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { useAuth, useSidebar } from "../App";
import { signInWithGoogle, logout } from "../firebase";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, loading } = useAuth();
  const { isOpen, setIsOpen } = useSidebar();

  const isChatPage = location.pathname.startsWith("/chat");
  const isImagePage = location.pathname === "/image";
  const isVideoPage = location.pathname === "/video";
  const isThreeDPage = location.pathname === "/3d";
  const showSidebar = (isChatPage || isImagePage || isVideoPage || isThreeDPage);

  // Simplified paths: React Router handles the /SteveAI-v4 prefix via basename in main.tsx
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Chat", path: "/chat" },
    { name: "Image Gen", path: "/image" },
    { name: "Video Gen", path: "/video" },
    { name: "3D Gen", path: "/3d" },
    { name: "Docs", path: "/docs" },
    { name: "About", path: "/about" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 will-change-transform">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
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
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-blue-400",
                  location.pathname === link.path ? "text-blue-500" : "text-gray-400"
                )}
              >
                {link.name}
              </Link>
            ))}
            
            {!loading && (
              user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || ""} className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-xs font-bold text-gray-300">{user.displayName?.split(' ')[0]}</span>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                  >
                    Get Started
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-black border-b border-white/10 px-4 pt-2 pb-6 space-y-2"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium",
                  location.pathname === link.path
                    ? "bg-blue-500/10 text-blue-500"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                {link.name}
              </Link>
            ))}
            {!loading && !user && (
              <div className="flex flex-col gap-2 pt-4">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-white/5 border border-white/10 text-white rounded-md text-base font-medium"
                >
                  <LogIn className="w-5 h-5" />
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-blue-600 text-white rounded-md text-base font-medium"
                >
                  <UserIcon className="w-5 h-5" />
                  Create Account
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
            }
