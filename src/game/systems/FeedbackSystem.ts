export class FeedbackSystem {
  private static context: AudioContext | null = null;

  private static getContext(): AudioContext | null {
    try {
      this.context ??= new AudioContext();
      if (this.context.state === 'suspended') void this.context.resume();
      return this.context;
    } catch { return null; }
  }

  private static tone(frequency: number, duration: number, gainValue: number, type: OscillatorType = 'sine', delay = 0): void {
    const context = this.getContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start); oscillator.stop(start + duration + 0.02);
  }

  static shot(power: number): void {
    this.tone(90 + power * 70, 0.12, 0.055, 'triangle');
  }

  static goal(): void {
    this.tone(440, 0.16, 0.045, 'square');
    this.tone(660, 0.2, 0.04, 'square', 0.1);
    this.tone(880, 0.26, 0.035, 'sine', 0.2);
  }

  static fail(): void {
    this.tone(150, 0.22, 0.04, 'sawtooth');
  }
}
