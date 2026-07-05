// src/lib/audioManager.ts

export class AudioManager {
  private inCtx?: AudioContext;
  private outCtx?: AudioContext;
  private inAnalyser?: AnalyserNode;
  private outAnalyser?: AnalyserNode;
  private nextPlayTime = 0;
  private stream?: MediaStream;
  private processor?: ScriptProcessorNode;
  
  // Keep track of active playback sources for potential stopping
  private activeSources: Set<AudioBufferSourceNode> = new Set();

  async startInput(onAudioData: (b64: string) => void) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
        } 
      });

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.inCtx = new AudioContextClass({ sampleRate: 16000 });
      const source = this.inCtx.createMediaStreamSource(this.stream!);
      
      this.inAnalyser = this.inCtx.createAnalyser();
      this.inAnalyser.fftSize = 1024;
      this.inAnalyser.smoothingTimeConstant = 0.5;
      source.connect(this.inAnalyser);
      
      this.processor = this.inCtx.createScriptProcessor(4096, 1, 1);
      this.inAnalyser.connect(this.processor);
      this.processor.connect(this.inCtx.destination);
      
      this.processor.onaudioprocess = (e) => {
        const channelData = e.inputBuffer.getChannelData(0);
        const buf = new Int16Array(channelData.length);
        for (let i = 0; i < channelData.length; i++) {
          // Clamp and scale to Int16
          buf[i] = Math.max(-1, Math.min(1, channelData[i])) * 0x7FFF;
        }
        
        // Efficient way to convert Int16 to Base64
        const uint8 = new Uint8Array(buf.buffer);
        let binary = '';
        for (let i = 0; i < uint8.length; i++) {
           binary += String.fromCharCode(uint8[i]);
        }
        onAudioData(btoa(binary));
      };
    } catch (err) {
      console.error("Failed to start audio input:", err);
      throw err;
    }
  }

  initOutput() {
    if (this.outCtx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.outCtx = new AudioContextClass({ sampleRate: 24000 });
    this.outAnalyser = this.outCtx.createAnalyser();
    this.outAnalyser.fftSize = 1024;
    this.outAnalyser.smoothingTimeConstant = 0.5;
    this.outAnalyser.connect(this.outCtx.destination);
    this.nextPlayTime = 0;
  }

  playOutput(base64: string) {
    if (!this.outCtx) {
      this.initOutput();
    }
    
    try {
      const binary_string = window.atob(base64);
      const len = binary_string.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for(let i = 0; i < int16.length; i++){
         float32[i] = int16[i] / 0x7FFF;
      }
      
      const audioBuffer = this.outCtx!.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);
      
      const source = this.outCtx!.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outAnalyser!);
      
      // Better scheduling for gapless playback
      const currTime = this.outCtx!.currentTime;
      if (this.nextPlayTime < currTime) {
        this.nextPlayTime = currTime;
      }
      
      source.start(this.nextPlayTime);
      this.activeSources.add(source);
      
      source.onended = () => {
        this.activeSources.delete(source);
      };
      
      this.nextPlayTime += audioBuffer.duration;
    } catch (err) {
      console.error("Error playing audio output:", err);
    }
  }

  stopOutput() {
    this.activeSources.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source might have already stopped
      }
    });
    this.activeSources.clear();
    this.nextPlayTime = 0;
  }

  getInputVolume(): number {
    if (!this.inAnalyser) return 0;
    const data = new Uint8Array(this.inAnalyser.frequencyBinCount);
    this.inAnalyser.getByteFrequencyData(data);
    return data.reduce((a,b) => a + b, 0) / data.length;
  }

  getOutputVolume(): number {
    if (!this.outAnalyser) return 0;
    const data = new Uint8Array(this.outAnalyser.frequencyBinCount);
    this.outAnalyser.getByteFrequencyData(data);
    return data.reduce((a,b) => a + b, 0) / data.length;
  }
  
  close() {
    this.stopOutput();
    this.stream?.getTracks().forEach(t => t.stop());
    this.processor?.disconnect();
    this.inCtx?.close();
    this.outCtx?.close();
    this.inCtx = undefined;
    this.outCtx = undefined;
    this.inAnalyser = undefined;
    this.outAnalyser = undefined;
  }
}
