import { Routes, Route, useLocation } from "react-router-dom"; // Removed BrowserRouter alias
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState, createContext, useContext } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "./firebase";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import ImageGen from "./pages/ImageGen";
import Docs from "./pages/Docs";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VideoGen from "./pages/VideoGen";
import ThreeDGen from "./pages/ThreeDGen";
import { cn } from "./lib/utils";
import { doc, setDoc, getDoc, onSnapshot as onSnapshotDoc } from "firebase/firestore";
import { UserSettings } from "./types";
import { SettingsModal, CreditsModal, ActivityModal } from "./components/Modals";

// Auth Context
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

// User Settings Context
interface UserSettingsContextType {
  settings: UserSettings | null;
}

const UserSettingsContext = createContext<UserSettingsContextType>({ settings: null });

export const useUserSettings = () => useContext(UserSettingsContext);

// Sidebar Context
interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({ isOpen: false, setIsOpen: () => {} });

export const useSidebar = () => useContext(SidebarContext);

// Modal Context
interface ModalContextType {
  openSettings: () => void;
  openCredits: () => void;
  openActivity: () => void;
}

const ModalContext = createContext<ModalContextType>({
  openSettings: () => {},
  openCredits: () => {},
  openActivity: () => {},
});

export const useModals = () => useContext(ModalContext);

function AnimatedRoutes() {
  const location = useLocation();
  const { isOpen } = useSidebar();
  const isChatPage = location.pathname.startsWith("/chat");
  const isImagePage = location.pathname === "/image";
  const isVideoPage = location.pathname === "/video";
  const isThreeDPage = location.pathname === "/3d";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  const showSidebar = (isChatPage || isImagePage || isVideoPage || isThreeDPage) && !isAuthPage;

  return (
    <div className="flex min-h-screen bg-black">
      {showSidebar && <Sidebar />}
      <main className={cn(
        "flex-1 transition-all duration-300",
        (showSidebar && isOpen) ? "lg:ml-72" : "ml-0"
      )}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/chat" element={<PageWrapper><Chat /></PageWrapper>} />
            <Route path="/chat/:sessionId" element={<PageWrapper><Chat /></PageWrapper>} />
            <Route path="/image" element={<PageWrapper><ImageGen /></PageWrapper>} />
            <Route path="/video" element={<PageWrapper><VideoGen /></PageWrapper>} />
            <Route path="/3d" element={<PageWrapper><ThreeDGen /></PageWrapper>} />
            <Route path="/docs" element={<PageWrapper><Docs /></PageWrapper>} />
            <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500/50 p-8 rounded-3xl max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h2>
            <p className="text-gray-400 text-sm mb-6">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: new Date().toISOString(),
            role: "user"
          });
        }
        setUser(user);
      } else {
        setUser(null);
        setSettings(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshotDoc(userRef, (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as UserSettings);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const modalValue = {
    openSettings: () => setIsSettingsOpen(true),
    openCredits: () => setIsCreditsOpen(true),
    openActivity: () => setIsActivityOpen(true),
  };

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{ user, loading }}>
        <UserSettingsContext.Provider value={{ settings }}>
          <SidebarContext.Provider value={{ isOpen: isSidebarOpen, setIsOpen: setIsSidebarOpen }}>
            <ModalContext.Provider value={modalValue}>
              {/* Router and duplicate Routes removed to prevent conflict with main.tsx */}
              <NavbarWrapper />
              
              {/* Modals */}
              <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
              <CreditsModal isOpen={isCreditsOpen} onClose={() => setIsCreditsOpen(false)} />
              <ActivityModal isOpen={isActivityOpen} onClose={() => setIsActivityOpen(false)} />
            </ModalContext.Provider>
          </SidebarContext.Provider>
        </UserSettingsContext.Provider>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}

function NavbarWrapper() {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith("/chat");
  const isImagePage = location.pathname === "/image";
  const isVideoPage = location.pathname === "/video";
  const isThreeDPage = location.pathname === "/3d";
  const hideNavbar = isChatPage || isImagePage || isVideoPage || isThreeDPage || location.pathname === "/login" || location.pathname === "/signup";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <AnimatedRoutes />
    </>
  );
          }
      
