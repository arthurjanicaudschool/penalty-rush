export class MusicSystem {
  private static context: AudioContext | null = null;
  private static master: GainNode | null = null;
  private static timer: number | null = null;
  private static step = 0;
  private static enabled = localStorage.getItem('penalty-rush-music') !== 'off';

  static isEnabled(): boolean { return this.enabled; }

  static start(): void {
    if (!this.enabled || this.timer !== null) return;
    try {
      this.context ??= new AudioContext();
      if (this.context.state === 'suspended') void this.context.resume();
      this.master ??= this.context.createGain();
      this.master.gain.value = 0.035;
      this.master.connect(this.context.destination);
      this.tick();
      this.timer = window.setInterval(() => this.tick(), 310);
    } catch { /* Audio remains optional. */ }
  }

  static stop(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
  }

  static toggle(): boolean {
    this.enabled = !this.enabled;
    localStorage.setItem('penalty-rush-music', this.enabled ? 'on' : 'off');
    if (this.enabled) this.start(); else this.stop();
    return this.enabled;
  }

  private static tick(): void {
    const context = this.context; const master = this.master;
    if (!context || !master) return;
    const bass = [82.41, 82.41, 98, 110, 82.41, 123.47, 110, 98];
    const lead = [329.63, 392, 440, 392, 493.88, 440, 392, 329.63];
    this.note(bass[this.step % bass.length], 0.24, 0.42, 'sawtooth');
    if (this.step % 2 === 0) this.note(lead[this.step % lead.length], 0.12, 0.17, 'square', 0.04);
    if (this.step % 4 === 0) this.note(55, 0.08, 0.55, 'sine');
    this.step = (this.step + 1) % 8;
  }

  private static note(frequency: number, duration: number, volume: number, type: OscillatorType, delay = 0): void {
    const context = this.context; const master = this.master;
    if (!context || !master) return;
    const oscillator = context.createOscillator(); const gain = context.createGain();
    const start = context.currentTime + delay;
    oscillator.type = type; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(master);
    oscillator.start(start); oscillator.stop(start + duration + 0.02);
  }
}
