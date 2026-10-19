import type { Sequence } from "./morse";

export class SignalAudio {
  private context: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private generation = 0;

  private createContext: () => AudioContext;
  constructor(createContext: () => AudioContext) { this.createContext = createContext; }

  stop() {
    this.generation++;
    const oscillator = this.oscillator;
    const context = this.context;
    this.oscillator = null;
    this.context = null;
    if (oscillator) {
      oscillator.onended = null;
      try { oscillator.stop(); } catch { /* Already ended. */ }
      oscillator.disconnect();
    }
    this.gain?.disconnect();
    this.gain = null;
    if (context && context.state !== "closed") void context.close().catch(() => {});
  }

  async play(sequence: Sequence, frequency: number, onComplete: () => void) {
    this.stop();
    const generation = this.generation;
    const context = this.createContext();
    this.context = context;
    try {
      await context.resume();
      if (generation !== this.generation) return false;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      this.oscillator = oscillator;
      this.gain = gain;
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      gain.connect(context.destination);
      const start = context.currentTime + .02;
      gain.gain.setValueAtTime(0, context.currentTime);
      for (const pulse of sequence.pulses) {
        const from = start + pulse.start / 1000;
        const to = from + pulse.duration / 1000;
        const edge = Math.min(.005, pulse.duration / 4000);
        gain.gain.setValueAtTime(0, from);
        gain.gain.linearRampToValueAtTime(.18, from + edge);
        gain.gain.setValueAtTime(.18, to - edge);
        gain.gain.linearRampToValueAtTime(0, to);
      }
      oscillator.onended = () => {
        if (generation !== this.generation) return;
        this.stop();
        onComplete();
      };
      oscillator.start(start);
      oscillator.stop(start + sequence.total / 1000 + .02);
      return true;
    } catch (error) {
      if (generation !== this.generation) return false;
      this.stop();
      throw error;
    }
  }
}
