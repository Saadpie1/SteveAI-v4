import { useState, useRef, useEffect, useCallback } from 'react';
import { PERSONAS, STEVE_SYSTEM_INSTRUCTION } from '../constants';
import { AudioManager } from '../lib/audioManager';

export type ChatEntry = {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  time: Date;
};

export function useLiveAssistant() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Zephyr');
  const [volumes, setVolumes] = useState({ input: 0, output: 0 });
  const [isThinking, setIsThinking] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioManagerRef = useRef<AudioManager | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isMutedRef = useRef(isMuted);
  const isSpeakerMutedRef = useRef(isSpeakerMuted);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isSpeakerMutedRef.current = isSpeakerMuted;
  }, [isSpeakerMuted]);

  const addChat = useCallback((sender: 'user' | 'agent' | 'system', text: string) => {
    setChatHistory(prev => [...prev, { id: Math.random().toString(36).substring(7), sender, text, time: new Date() }]);
  }, []);

  const updateVolumes = useCallback(() => {
    if (audioManagerRef.current) {
      const input = audioManagerRef.current.getInputVolume();
      const output = audioManagerRef.current.getOutputVolume();
      setVolumes({ input, output });
      
      // Agent is speaking if output volume is significant
      setIsSpeaking(output > 5);
    }
    animationFrameRef.current = requestAnimationFrame(updateVolumes);
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    setIsThinking(false);
    setIsSearching(false);
    
    // Add Call Summary
    if (isConnected) {
       setSummary("Neural connection complete. SteveAI archived the stream with 99.8% fidelity. Bio-sync was maintained throughout.");
       addChat('system', 'Neural Link Severed. Session data archived.');
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (audioManagerRef.current) {
      audioManagerRef.current.close();
      audioManagerRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [isConnected, addChat]);

  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;
    
    try {
      setError(null);
      setIsConnecting(true);
      setIsThinking(true);
      
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      audioManagerRef.current = new AudioManager();
      
      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        addChat('system', `Established neural link with ${selectedVoice}. Connection optimal.`);
        
        audioManagerRef.current?.initOutput();
        audioManagerRef.current?.startInput((base64) => {
           if (isMutedRef.current) return;
           if (wsRef.current?.readyState === WebSocket.OPEN) {
             wsRef.current.send(JSON.stringify({
               realtimeInput: { audio: { data: base64, mimeType: 'audio/pcm;rate=16000' } }
             }));
           }
        }).catch(err => {
          console.error("Microphone access denied:", err);
          setError("Microphone access denied. Please enable your microphone.");
          disconnect();
        });
        
        updateVolumes();
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        // Handle structural bridge messages
        if (message.type === 'error') {
           setError(message.message);
           disconnect();
           return;
        }

        // Handle Interruption
        if (message.serverContent?.interrupted) {
          audioManagerRef.current?.stopOutput();
          setIsThinking(false);
          setIsSearching(false);
        }
        
        // Handle Tool Calls (Web Search)
        if (message.toolCall) {
          setIsSearching(true);
          setIsThinking(true);
        }

        if (message.toolResponse) {
          setIsSearching(false);
        }

        // Handle Model Turn
        if (message.serverContent?.modelTurn) {
          const parts = message.serverContent.modelTurn.parts;
          let currentThinking = false;

          if (parts) {
            for (const part of parts) {
              if (part.thought) {
                currentThinking = true;
              }
              if (part.inlineData && part.inlineData.data) {
                if (!isSpeakerMutedRef.current) {
                  audioManagerRef.current?.playOutput(part.inlineData.data);
                }
              }
              if (part.text && part.text.trim()) {
                addChat('agent', part.text);
              }
            }
          }
          setIsThinking(currentThinking);
        }
        
        if (message.serverContent?.turnComplete) {
          setIsThinking(false);
          setIsSearching(false);
        }
        
        // Handle Realtime Input Transcriptions
        if (message.serverContent?.inputAudioTranscription?.text) {
           addChat('user', message.serverContent.inputAudioTranscription.text);
           setIsThinking(true); 
        }

        if (message.goAway) {
          addChat('system', 'Neural link terminated by host. Session duration limit reached.');
          disconnect();
        }
      };

      ws.onerror = (err) => {
        console.error("Neural link bridge error:", err);
        setError("A disturbance in the neural link bridge occurred.");
        disconnect();
      };

      ws.onclose = () => {
        addChat('system', 'Neural link closed.');
        disconnect();
      };

    } catch (err: any) {
      setError(err?.message || "Neural link synchronization failed.");
      setIsConnecting(false);
      disconnect();
    }
  }, [addChat, updateVolumes, selectedVoice, isConnected, isConnecting, disconnect]);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  const sendTextMessage = useCallback((text: string) => {
    if (!isConnected || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    addChat('user', text);
    setIsThinking(true);
    wsRef.current.send(JSON.stringify({
      realtimeInput: { text }
    }));
  }, [isConnected, addChat]);

  return {
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
  };
}
