// Cyberpunk Web Audio Synthesizer for high-fidelity interactive UI responses
class CyberSoundService {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    // Lazy initialized on first audio cue to satisfy standard UX autoplay criteria
    if (typeof window !== 'undefined') {
      this.muted = localStorage.getItem('cyber_sound_muted') === 'true';
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      try {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (err) {
        console.warn("Failed to spark AudioContext neural grid:", err);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    localStorage.setItem('cyber_sound_muted', String(this.muted));
    this.playTick();
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // Clean digital telemetry chirp
  playTick() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      // Silent error
    }
  }

  // Neon sweeping aura chord for page link transitions
  playHover() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1300, this.ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  // Glowing ledger / digital success chime
  playSuccess() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      
      const now = this.ctx.currentTime;
      [587.33, 739.99, 880.00, 1174.66].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        
        gain.gain.setValueAtTime(0.03, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.3);
        
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.35);
      });
    } catch (e) {}
  }

  // Analog glitch burst for terminal errors or system actions
  playGlitch() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110 + Math.random() * 500, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1600, this.ctx.currentTime + 0.12);
      
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }
}

export const cyberSound = new CyberSoundService();
