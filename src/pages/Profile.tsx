import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  Settings, 
  Trash2, 
  LogOut, 
  Shield, 
  Mail, 
  Calendar,
  AlertTriangle,
  ChevronRight,
  UserCircle,
  Edit2,
  Save,
  X,
  Camera,
  MapPin,
  Sparkles,
  Loader2,
  Check,
  AtSign
} from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { deleteUser, signOut, updateProfile } from 'firebase/auth';
import { doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUserSettings } from '../App';
import { cn } from '../lib/utils';
import Navbar from '../components/Navbar';
import { generateImage } from '../services/aiService';

export default function Profile() {
  const { user } = useAuth();
  const { settings } = useUserSettings();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    dob: '',
    bio: '',
    location: '',
    photoURL: ''
  });

  // Avatar Generation State
  const [showAvatarPrompt, setShowAvatarPrompt] = useState(false);
  const [avatarPrompt, setAvatarPrompt] = useState('');
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  useEffect(() => {
    if (user && settings) {
      setFormData({
        displayName: user.displayName || '',
        username: settings.username || '',
        dob: settings.dob || '',
        bio: settings.bio || '',
        location: settings.location || '',
        photoURL: user.photoURL || ''
      });
    }
  }, [user, settings]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // Update Firebase Auth Profile
      await updateProfile(user, {
        displayName: formData.displayName,
        photoURL: formData.photoURL
      });

      // Update Firestore User Document
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        username: formData.username,
        dob: formData.dob,
        bio: formData.bio,
        location: formData.location,
        photoURL: formData.photoURL,
        updatedAt: new Date().toISOString()
      });

      setIsEditing(false);
    } catch (error: any) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAvatar = async () => {
    if (!avatarPrompt.trim()) return;
    setIsGeneratingAvatar(true);
    try {
      const prompt = `Highly detailed profile picture avatar, ${avatarPrompt}, cyberpunk aesthetic, neon accents, cinematic lighting, 8k resolution, minimalist background`;
      const imageUrl = await generateImage(prompt, 'flux');
      if (imageUrl) {
        setFormData(prev => ({ ...prev, photoURL: imageUrl }));
        setShowAvatarPrompt(false);
      }
    } catch (error) {
      console.error('Avatar generation error:', error);
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);
      navigate('/signup');
    } catch (error: any) {
      console.error('Delete account error:', error);
      alert('You may need to re-authenticate before deleting your account.');
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Navbar />
        <div className="text-center space-y-4">
          <UserCircle className="w-16 h-16 text-gray-800 mx-auto" />
          <h1 className="text-xl font-black uppercase text-white">Not Authenticated</h1>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-blue-500 transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <Navbar />
      
      <div className="pt-32 pb-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-zinc-900/50 border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 backdrop-blur-xl">
              <div className="relative group/avatar">
                {formData.photoURL ? (
                  <img src={formData.photoURL} alt="User" className="w-40 h-40 rounded-[3rem] object-cover border-2 border-white/10 group-hover/avatar:border-blue-500/50 transition-all" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-40 h-40 rounded-[3rem] bg-blue-600/20 flex items-center justify-center border-2 border-white/10 text-blue-500">
                    <UserIcon className="w-16 h-16" />
                  </div>
                )}
                
                {isEditing && (
                  <button 
                    onClick={() => setShowAvatarPrompt(true)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-all rounded-[3rem] flex flex-col items-center justify-center gap-2"
                  >
                    <Sparkles className="w-6 h-6 text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Neural Gen</span>
                  </button>
                )}
                
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-zinc-950 flex items-center justify-center shadow-lg shadow-green-500/20">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              
              <div className="text-center md:text-left flex-1 space-y-4">
                <div className="space-y-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={formData.displayName}
                          onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                          placeholder="Display Name"
                          className="bg-zinc-800/50 border border-white/10 px-4 py-1 rounded-xl w-full max-w-sm outline-none focus:border-blue-500 transition-all"
                        />
                      ) : (
                        user.displayName || 'Neural Identity'
                      )}
                    </h1>
                    <span className="px-4 py-1.5 bg-blue-600/20 text-blue-500 text-[10px] font-black uppercase tracking-widest rounded-full self-center md:self-auto border border-blue-500/10">
                      {settings?.role || 'Alpha Citizen'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-4 text-zinc-500 font-black uppercase tracking-widest text-[10px]">
                    <span className="flex items-center gap-1.5">
                      <AtSign className="w-3.5 h-3.5" />
                      {settings?.username || 'no_handle'}
                    </span>
                    <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      {user.email}
                    </span>
                  </div>
                </div>

                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all active:scale-95 text-xs font-black uppercase tracking-widest"
                  >
                    <Edit2 className="w-4 h-4 text-blue-500" />
                    Sync Protocol
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {isEditing && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-zinc-900/50 border border-blue-500/20 p-8 rounded-[2.5rem] space-y-8 backdrop-blur-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-2">Neural Handle (@)</label>
                      <input 
                        type="text" 
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                        className="w-full bg-black/40 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-mono text-sm"
                        placeholder="username"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-2">Biological Origin (DOB)</label>
                      <input 
                        type="date" 
                        value={formData.dob}
                        onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                        className="w-full bg-black/40 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-2">Geographical Node</label>
                      <div className="relative">
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input 
                          type="text" 
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full bg-black/40 border border-white/10 pl-14 pr-6 py-4 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm"
                          placeholder="Your current sector"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-2">Avatar Direct URL</label>
                      <div className="relative">
                        <Camera className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input 
                          type="text" 
                          value={formData.photoURL}
                          onChange={(e) => setFormData(prev => ({ ...prev, photoURL: e.target.value }))}
                          className="w-full bg-black/40 border border-white/10 pl-14 pr-6 py-4 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-2">Manifesto (Bio)</label>
                    <textarea 
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm resize-none"
                      placeholder="Transmission details..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-white/5">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
                    >
                      Abort
                    </button>
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Indexing...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Commit Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Stats/Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600/20 rounded-2xl">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
                <h2 className="text-base font-black uppercase tracking-widest">Neural Security</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5 group cursor-pointer hover:bg-blue-600/5 transition-all">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-gray-200">Session Status</p>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Active Connection</p>
                  </div>
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5 group cursor-pointer hover:bg-blue-600/5 transition-all">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-gray-200">Neural Encryption</p>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">AES-GCM 256B</p>
                  </div>
                  <Shield className="w-5 h-5 text-blue-500/50" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-600/20 rounded-2xl">
                  <Settings className="w-6 h-6 text-purple-500" />
                </div>
                <h2 className="text-base font-black uppercase tracking-widest">Identity Specs</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-3xl border border-white/5 text-center">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Access Level</p>
                    <p className="text-xs font-black uppercase text-purple-500">{settings?.role || 'User'}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-3xl border border-white/5 text-center">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Node Type</p>
                    <p className="text-xs font-black uppercase text-purple-500">Standard</p>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                   <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Last Transmission</p>
                   <p className="text-xs font-bold text-gray-300">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Danger Zone */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 border-2 border-red-500/20 rounded-[2.5rem] bg-red-500/5 space-y-8"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-red-500/20 rounded-3xl">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-red-500">Danger Operations</h2>
                <p className="text-xs text-red-500/60 font-bold uppercase tracking-widest leading-relaxed">
                  Irreversible actions. Exercise extreme caution within this perimeter.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleLogout}
                className="flex-1 px-8 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl flex items-center justify-center gap-3 transition-all group"
              >
                <LogOut className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Sign Out Node</span>
              </button>

              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 px-8 py-5 bg-red-600/10 hover:bg-red-600 border border-red-600/20 text-red-600 hover:text-white rounded-3xl flex items-center justify-center gap-3 transition-all group"
              >
                <Trash2 className="w-5 h-5 transition-colors" />
                <span className="text-xs font-black uppercase tracking-widest">Decommission Identity</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Avatar Generation Modal */}
      <AnimatePresence>
        {showAvatarPrompt && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-950 border border-white/10 p-8 rounded-[3rem] max-w-lg w-full space-y-8 shadow-[0_0_50px_rgba(59,130,246,0.15)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-3 bg-blue-600/20 rounded-2xl">
                      <Sparkles className="w-6 h-6 text-blue-500" />
                   </div>
                   <h3 className="text-xl font-black uppercase tracking-tighter">Neural Avatar Sync</h3>
                </div>
                <button onClick={() => setShowAvatarPrompt(false)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest leading-relaxed px-2">
                  Describe your desired neural appearance and our AI will manifest it.
                </p>
                <textarea 
                  value={avatarPrompt}
                  onChange={(e) => setAvatarPrompt(e.target.value)}
                  placeholder="e.g. A mysterious cyborg with glowing blue eyes wearing a black techwear hoodie..."
                  className="w-full bg-white/5 border border-white/10 px-6 py-5 rounded-3xl outline-none focus:border-blue-500 transition-all text-sm resize-none h-32"
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowAvatarPrompt(false)}
                  disabled={isGeneratingAvatar}
                  className="flex-1 py-5 bg-white/5 hover:bg-white/10 rounded-3xl font-black uppercase text-xs tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleGenerateAvatar}
                  disabled={isGeneratingAvatar || !avatarPrompt.trim()}
                  className="flex-[2] py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 rounded-3xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20"
                >
                  {isGeneratingAvatar ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Manifesting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Initialize Gen
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-950 border border-red-500/50 p-10 rounded-[3rem] max-w-md w-full space-y-8 shadow-2xl shadow-red-500/10"
            >
              <div className="w-20 h-20 bg-red-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-2 text-red-500">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Full Decommission</h3>
                <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">
                  This action will permanently purge all neural data and access tokens. This process is final.
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 py-5 bg-white/5 hover:bg-white/10 rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  Abort
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 py-5 bg-red-600 hover:bg-red-500 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  {isDeleting ? 'Purging...' : 'Confirm Purge'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
