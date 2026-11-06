import type { GameEventType } from "./types";

class QuietSound {
  private context: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.context) {
      const AudioConstructor: typeof AudioContext | undefined =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioConstructor) return null;
      this.context = new AudioConstructor();
    }
    if (this.context.state === "suspended") void this.context.resume();
    return this.context;
  }

  play(type: GameEventType, enabled: boolean): void {
    if (!enabled) return;
    const context = this.getContext();
    if (!context) return;
    const now = context.currentTime;
    const notes: Record<string, number[]> = {
      spawn: [523.25, 659.25],
      merge: [587.33, 783.99, 1046.5],
      fog: [392, 523.25],
      deliver: [523.25, 659.25, 783.99, 1046.5],
      buy: [440, 659.25],
      daily: [659.25, 783.99, 987.77],
      undo: [440, 392],
      notEnough: [293.66, 261.63],
      noDew: [293.66, 246.94],
      boardFull: [246.94, 220],
      error: [246.94, 220]
    };
    const sequence = notes[type] ?? [523.25];
    sequence.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type === "merge" || type === "deliver" ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, now + index * 0.075);
      gain.gain.linearRampToValueAtTime(type === "notEnough" || type === "noDew" ? 0.018 : 0.035, now + index * 0.075 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.075 + 0.32);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now + index * 0.075);
      oscillator.stop(now + index * 0.075 + 0.34);
    });
  }
}

export const quietSound = new QuietSound();

export function haptic(enabled: boolean, strong = false): void {
  if (!enabled || typeof navigator === "undefined" || !navigator.vibrate) return;
  navigator.vibrate(strong ? [14, 24, 18] : 8);
}
