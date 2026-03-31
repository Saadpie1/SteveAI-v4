import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Settings, 
  History, 
  Zap, 
  User, 
  Save, 
  Loader2, 
  CheckCircle2,
  Cpu,
  ArrowRight,
  CreditCard,
  Activity as ActivityIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { doc, getDoc, setDoc, collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { UserSettings, ChatSession } from "../types";
import { cn } from "../lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: ModalProps) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    username: "",
    customSystemInstruction: ""
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user || !isOpen) return;

    const fetchSettings = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as UserSettings);
        } else {
          setSettings({
            username: user.displayName || "",
            customSystemInstruction: ""
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user, isOpen]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSuccess(false);
    try {
      await setDoc(doc(db, "users", user.uid), settings, { merge: true });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Settings</h2>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  <p className="text-sm text-gray-500 font-medium">Loading your preferences...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      <User className="w-3.5 h-3.5" />
                      Profile
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400 ml-1">Username</label>
                      <input
                        type="text"
                        value={settings.username}
                        onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                        placeholder="Enter your name"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      <Cpu className="w-3.5 h-3.5" />
                      AI Personality
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400 ml-1">Custom System Instruction</label>
                      <textarea
                        value={settings.customSystemInstruction}
                        onChange={(e) => setSettings({ ...settings, customSystemInstruction: e.target.value })}
                        placeholder="e.g. Talk like a pirate, or focus on technical accuracy..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-all h-32 resize-none"
                      />
                      <p className="text-[10px] text-gray-500 italic ml-1">
                        This will be added to the default SteveAI core instructions.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                    <p className="text-[10px] text-blue-400/80 leading-relaxed font-medium">
                      Core Signature: "SteveAI v4.0 | Advanced Multi-Agent Orchestrator"
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-white/5 bg-black/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {success && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1.5 text-green-500 text-xs font-bold"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Saved Successfully
                  </motion.div>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function CreditsModal({ isOpen, onClose }: ModalProps) {
  const [credits, setCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Logic for GitHub Pages: Fetch from Firestore instead of a missing local /api
      const fetchCredits = async () => {
        try {
          const docRef = doc(db, "system", "credits");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setCredits(docSnap.data().providers || []);
          } else {
            // Fallback for demo purposes if doc doesn't exist
            setCredits([
              { provider: "Gemini Pro", balance: "Unlimited", limit: "Free Tier" },
              { provider: "GPT-4o", balance: "25", limit: "Daily Reset" }
            ]);
          }
        } catch (error) {
          console.error("Credit fetch error:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCredits();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-yellow-500" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Credits & Usage</h2>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  <p className="text-sm text-gray-400">Fetching live credit status...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {credits.map((c, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">{c.provider}</p>
                      <p className={`text-2xl font-black ${c.balance === 'Unlimited' ? 'text-green-500' : 'text-white'}`}>
                        {c.balance}
                      </p>
                      <p className="text-[10px] text-gray-500">{c.limit}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-6 rounded-3xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-bold text-white">Enterprise Credits</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Your account is currently on the Developer Tier. Upgrade to Enterprise for higher rate limits and priority mirror access.
                </p>
                <button 
                  onClick={() => window.location.href = 'mailto:saadabdulrehman2010@gmail.com?subject=Enterprise Upgrade'}
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  Upgrade Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ActivityModal({ isOpen, onClose }: ModalProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !isOpen) return;

    setLoading(true);
    const path = `users/${user.uid}/sessions`;
    const q = query(collection(db, path), orderBy("createdAt", "desc"), limit(10));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sess = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatSession[];
      setActivities(sess);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <ActivityIcon className="w-5 h-5 text-purple-500" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Recent Activity</h2>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12 opacity-30">
                  <History className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest">No recent activity</p>
                </div>
              ) : (
                activities.map((activity: any) => (
                  <div 
                    key={activity.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-white truncate pr-4">{activity.title}</p>
                      <span className="text-[10px] text-gray-500 whitespace-nowrap">
                        {activity.createdAt?.seconds 
                          ? new Date(activity.createdAt.seconds * 1000).toLocaleDateString() 
                          : "Recent"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {activity.lastMessage || "No messages yet"}
                    </p>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-6 border-t border-white/5 bg-black/20 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                Showing last 10 interactions
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
                    }
