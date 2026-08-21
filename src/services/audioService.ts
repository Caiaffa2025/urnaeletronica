// Audio Service simulating the Brazilian Urna Eletrônica sound effects via Web Audio API

class UrnaAudioService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Lazy audio context creation on user interaction
  }

  private getContext(): AudioContext | null {
    if (!this.soundEnabled) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  // Play short click/beep when pressing numbers or keys with subtle tactile pitch variation per key
  public playKeyClick(key?: string) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      // Distinct base pitch mapping per key to simulate tactile physical membrane differences
      const keyFrequencies: Record<string, number> = {
        '1': 1240,
        '2': 1265,
        '3': 1290,
        '4': 1315,
        '5': 1340,
        '6': 1365,
        '7': 1390,
        '8': 1415,
        '9': 1440,
        '0': 1215,
        'branco': 1180,
      };

      const baseFreq = key && keyFrequencies[key] ? keyFrequencies[key] : 1300;
      // Micro pitch jitter (+/- 12 Hz) for organic mechanical feel
      const jitter = (Math.random() - 0.5) * 24;
      const finalFreq = baseFreq + jitter;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(finalFreq, now);
      // Subtle fast frequency drop to emulate physical switch snap
      osc.frequency.exponentialRampToValueAtTime(finalFreq * 0.92, now + 0.075);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

      // Optional click attack transient (short burst) for tactile feel
      const clickBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.005, ctx.sampleRate);
      const output = clickBuffer.getChannelData(0);
      for (let i = 0; i < clickBuffer.length; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.15;
      }
      const clickSource = ctx.createBufferSource();
      clickSource.buffer = clickBuffer;
      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(0.2, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.005);
      clickSource.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickSource.start(now);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.075);
    } catch {
      // Ignore audio context errors
    }
  }

  // Play Corrige / Error tone
  public playCorrigeSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Ignore audio errors
    }
  }

  // Play authentic Urna "FIM" vote confirmation chime with distinct variations for Valid, Branco, and Nulo votes
  public playConfirmationChime(voteType?: '13' | '22' | 'BRANCO' | 'NULO' | string) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      
      // Determine tone sequence frequencies based on vote classification
      let shortFreq = 1050;
      let longFreq = 1450;
      let waveType: OscillatorType = 'sine';

      if (voteType === 'BRANCO') {
        // Soft, neutral mid-register tone sequence for Blank vote
        shortFreq = 880;
        longFreq = 1120;
        waveType = 'sine';
      } else if (voteType === 'NULO') {
        // Deeper, lower-register warning tone sequence for Null vote
        shortFreq = 680;
        longFreq = 850;
        waveType = 'triangle';
      }

      const tones = [
        { freq: shortFreq, duration: 0.1, delay: 0 },
        { freq: shortFreq, duration: 0.1, delay: 0.12 },
        { freq: shortFreq, duration: 0.1, delay: 0.24 },
        { freq: longFreq, duration: 0.7, delay: 0.38 },
      ];

      tones.forEach(({ freq, duration, delay }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = waveType;
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0.35, now + delay);
        gain.gain.setValueAtTime(0.35, now + delay + duration - 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + duration);
      });
    } catch {
      // Ignore audio errors
    }
  }

  // Specific helper for Voto em Branco confirmation
  public playBrancoConfirmation() {
    this.playConfirmationChime('BRANCO');
  }

  // Specific helper for Voto Nulo confirmation
  public playNuloConfirmation() {
    this.playConfirmationChime('NULO');
  }
}

export const audioService = new UrnaAudioService();
