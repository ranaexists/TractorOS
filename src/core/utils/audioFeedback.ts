/**
 * @file audioFeedback.ts
 * Synthesized Web Audio API automotive audio feedback (relays, starter crank, diesel rumble, warnings)
 */

class AudioFeedbackEngine {
  private ctx: AudioContext | null = null;
  private engineOscillator: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.engineGain) {
      this.engineGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Crisp relay/solenoid contact click (Lock/Unlock/Ignition Relay)
   */
  public playRelayClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.04);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  /**
   * Starter motor mechanical cranking pulse
   */
  public playStarterCrank(durationMs = 1500) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const pulseCount = Math.floor(durationMs / 180);

    for (let i = 0; i < pulseCount; i++) {
      const pulseTime = t + (i * 0.18);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65, pulseTime);
      osc.frequency.linearRampToValueAtTime(110, pulseTime + 0.08);

      gain.gain.setValueAtTime(0.25, pulseTime);
      gain.gain.exponentialRampToValueAtTime(0.01, pulseTime + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(pulseTime);
      osc.stop(pulseTime + 0.15);
    }
  }

  /**
   * Start smooth low frequency diesel engine idle rumble
   */
  public startEngineRumble() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    this.stopEngineRumble();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(45, t); // Low 45Hz tractor cylinder idle

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    this.engineOscillator = osc;
    this.engineGain = gain;
  }

  public stopEngineRumble() {
    if (this.engineOscillator && this.ctx && this.engineGain) {
      const t = this.ctx.currentTime;
      this.engineGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      setTimeout(() => {
        try {
          this.engineOscillator?.stop();
          this.engineOscillator?.disconnect();
          this.engineOscillator = null;
        } catch {}
      }, 300);
    }
  }

  /**
   * High-priority warning alert beeps for Proximity loss & Auto Cutoff countdown
   */
  public playWarningBeep(isUrgent = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isUrgent ? 1200 : 880, t);
    osc.frequency.setValueAtTime(isUrgent ? 1600 : 880, t + 0.1);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isUrgent ? 0.25 : 0.18));

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + (isUrgent ? 0.25 : 0.18));
  }

  /**
   * Positive authorization chime (digital key verified)
   */
  public playAuthSuccess() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = t + (idx * 0.07);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.15, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.25);
    });
  }

  /**
   * Subtle UI touch feedback tap
   */
  public playTap() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.03);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.03);
  }
}

export const audioFeedback = new AudioFeedbackEngine();
