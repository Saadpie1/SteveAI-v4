// src/pages/Live.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff, 
  Settings, Info, Zap, Sparkles, X, 
  Waves, Radio, Shield, Loader2, Cpu,
  Search, MessageSquare, Brain
} from 'lucide-react';
import { useLiveAssistant } from '../hooks/useLiveAssistant';
import { ChatWindow } from '../components/ChatWindow';
import { PERSONAS } from '../constants';

export const Live = () => {
  const {
    isConnected,
    isConnecting,
    isSpeaking,
    isThinking,
    isSearching,
    isMuted,
    setIsMuted,
    isSpeakerMuted,
    setIsSpeakerMuted,
    selectedVoice,
    setSelectedVoice,
    volumes,
    chatHistory,
    connect,
    disconnect,
    sendTextMessage,
    error,
    summary,
    setSummary
  } = useLiveAssistant();

  const [showSettings, setShowSettings] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);

  // Handle persona selection
  const handlePersonaSelect = (persona: typeof PERSONAS[0]) => {
    setSelectedPersona(persona);
    setSelectedVoice(persona.voice);
    if (isConnected) disconnect();
    setShowSettings(false);
  };

  // Visualizer bars
  const renderVisualizer = (volume: number, color: string) => {
    return (
      <div className="flex items-end gap-1 h-12">
        {Array.from({ length: 8 }).map((_, i) => {
          const height = Math.min(100, (volume / 255) * 100 * (0.4 + Math.random() * 0.6));
          return (
            <motion.div
              key={i}
              animate={{ height: `${Math.max(4, height)}%` }}
              transition={{ type: 'spring', damping: 10, stiffness: 200 }}
              className={`w-1 rounded-full ${color}`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div id="live-page-wrapper" className="flex flex-col h-screen bg-black overflow-hidden relative">
      <div id="live-page-root" className="flex flex-col flex-1 lg:flex-row overflow-hidden relative pt-16">
        {/* Background Ambience */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.1),transparent_70%)] pointer-events-none" />
        
        {/* Left Panel: Controls & Status */}
        <div id="live-controls-panel" className="w-full lg:w-[380px] flex-none lg:flex flex-col border-b lg:border-r lg:border-b-0 border-white/5 bg-zinc-950/50 backdrop-blur-3xl px-4 lg:px-6 py-4 lg:py-8 space-y-4 lg:space-y-6 overflow-y-auto z-10 scrollbar-hide">
          {/* Selected Persona Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all" onClick={() => setShowSettings(true)}>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-xs">
                    {selectedPersona.name.charAt(0)}
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-tight">{selectedPersona.name}</h3>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{selectedPersona.bio}</p>
                </div>
            </div>
            <Settings className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
        </div>

        {/* Status Card */}
        <div id="live-status-card" className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 lg:p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
                <div className="space-y-1">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Link Status</span>
                    <h3 className="text-xs lg:text-sm font-bold text-white flex items-center gap-2">
                        {isConnecting ? (
                             <><Loader2 className="w-3 h-3 animate-spin text-blue-500" /> Linking...</>
                        ) : isConnected ? (
                             <><Zap className="w-3 h-3 text-green-500 animate-pulse" /> Established</>
                        ) : (
                             <><Shield className="w-3 h-3 text-red-500/50" /> Secure</>
                        )}
                    </h3>
                </div>
                
                {(isThinking || isSearching) && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    {isSearching ? <Search className="w-3 h-3 text-orange-400 animate-pulse" /> : <Brain className="w-3 h-3 text-orange-400 animate-pulse" />}
                  </div>
                )}
            </div>

            {/* Visualizer Interface */}
            <div className="h-24 bg-black/40 rounded-xl border border-white/5 flex flex-col items-center justify-center p-3">
                {isConnected ? (
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col items-center gap-1">
                            {renderVisualizer(volumes.input, isMuted ? 'bg-red-500/20' : 'bg-blue-500')}
                            <span className="text-[8px] font-black text-white/10 uppercase tracking-widest text-center">In</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            {renderVisualizer(volumes.output, isSpeakerMuted ? 'bg-red-500/20' : 'bg-orange-500')}
                            <span className="text-[8px] font-black text-white/10 uppercase tracking-widest text-center">Out</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 opacity-10">
                        <Waves className="w-8 h-8 text-white" />
                        <span className="text-[8px] font-black uppercase tracking-[0.3em]">Standby</span>
                    </div>
                )}
            </div>

            <button
                id="live-establish-link"
                disabled={isConnecting}
                onClick={isConnected ? disconnect : connect}
                className={`
                    w-full py-3 rounded-xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all
                    ${isConnected 
                        ? 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' 
                        : 'bg-blue-600 border border-blue-500 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/25'}
                `}
            >
                {isConnected ? 'Terminate Link' : 'Initiate Link'}
            </button>
        </div>

        {/* Quick Controls */}
        <div className="grid grid-cols-2 gap-3">
            <button
                disabled={!isConnected}
                onClick={() => setIsMuted(!isMuted)}
                className={`
                    flex flex-col items-center justify-center p-4 rounded-2xl border transition-all space-y-2
                    ${isMuted ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-white/5 border-white/5 text-gray-400'}
                `}
            >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                <span className="text-[9px] font-black uppercase tracking-widest">Mic</span>
            </button>
            <button
                disabled={!isConnected}
                onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                className={`
                    flex flex-col items-center justify-center p-4 rounded-2xl border transition-all space-y-2
                    ${isSpeakerMuted ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' : 'bg-white/5 border-white/5 text-gray-400'}
                `}
            >
                {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                <span className="text-[9px] font-black uppercase tracking-widest">Speaker</span>
            </button>
        </div>

        {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-[9px] font-bold text-red-400 leading-relaxed uppercase tracking-wider">
                    {error}
                </p>
            </div>
        )}

        <div className="mt-auto pt-6 border-t border-white/5 hidden lg:block">
            <div className="flex items-center gap-3 opacity-20">
                <Cpu className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Neural Engine v4.5</span>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div id="live-main-area" className="flex-1 relative flex flex-col min-h-0 bg-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(30,58,138,0.15),transparent_70%)] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-orange-600/5 pointer-events-none" />
          
          {/* Central Area Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
              {(isThinking || isSearching) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl"
                  >
                     {isSearching ? <Search className="w-4 h-4 text-blue-400 animate-pulse" /> : <Brain className="w-4 h-4 text-blue-400 animate-pulse" />}
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                        {isSearching ? 'Scanning Global Data' : 'Processing Neural Pulse'}
                     </span>
                  </motion.div>
              )}

              <AnimatePresence>
                  {summary && (
                      <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="max-w-md w-full bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl space-y-4 relative"
                      >
                          <button onClick={() => setSummary(null)} className="absolute top-4 right-4 text-white/20 hover:text-white">
                              <X className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-orange-500" />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Call Summary</span>
                          </div>
                          <p className="text-sm font-bold text-white/60 leading-relaxed uppercase tracking-widest">
                              {summary}
                          </p>
                      </motion.div>
                  )}
              </AnimatePresence>
          </div>
      </div>

      <ChatWindow 
          chatHistory={chatHistory} 
          isConnected={isConnected} 
          isThinking={isThinking}
          isSearching={isSearching}
          onSendMessage={sendTextMessage}
      />

      {/* Persona Selection Drawer */}

      <AnimatePresence>
          {showSettings && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
              >
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
                  >
                      <div className="p-6 border-b border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <Brain className="w-6 h-6 text-blue-500" />
                              <h2 className="text-xl font-black uppercase tracking-tighter text-white">Select Persona Profile</h2>
                          </div>
                          <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                              <X className="w-5 h-5 text-gray-500" />
                          </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {PERSONAS.map((p) => (
                                  <button
                                      key={p.id}
                                      onClick={() => handlePersonaSelect(p)}
                                      className={`
                                          flex items-center gap-4 p-4 rounded-2xl border text-left transition-all
                                          ${selectedPersona.id === p.id 
                                              ? 'bg-blue-600/20 border-blue-500/50' 
                                              : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}
                                      `}
                                  >
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${selectedPersona.id === p.id ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/40'}`}>
                                          {p.name.charAt(0)}
                                      </div>
                                      <div className="min-w-0">
                                          <h4 className={`text-sm font-bold uppercase tracking-tight ${selectedPersona.id === p.id ? 'text-white' : 'text-white/60'}`}>{p.name}</h4>
                                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest truncate">{p.bio}</p>
                                      </div>
                                  </button>
                              ))}
                          </div>
                      </div>
                      <div className="p-6 border-t border-white/10 bg-black/20">
                          <p className="text-[10px] text-gray-500 font-bold text-center uppercase tracking-[0.2em]">
                              Switching personas will re-initialize the neural link.
                          </p>
                      </div>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  </div>
  );
};

