// ============================================================
// SOUND MODULE - Web Audio API generated sounds
// ============================================================

const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;

let audioCtx: AudioContext | null = null;

const getCtx = (): AudioContext => {
  if (!audioCtx) {
    audioCtx = new AudioCtx();
  }
  return audioCtx;
};

const playTone = (
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.3,
  delay = 0
) => {
  try {
    const ctx = getCtx();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);

    gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    oscillator.start(ctx.currentTime + delay);
    oscillator.stop(ctx.currentTime + delay + duration);
  } catch (e) {
    // Audio not supported
  }
};

export const sounds = {
  correct: () => {
    // Happy ascending notes
    playTone(523.25, 0.15, "sine", 0.3, 0);    // C5
    playTone(659.25, 0.15, "sine", 0.3, 0.12); // E5
    playTone(783.99, 0.25, "sine", 0.3, 0.24); // G5
    playTone(1046.5, 0.3, "sine", 0.25, 0.36); // C6
  },

  wrong: () => {
    // Descending sad notes
    playTone(400, 0.2, "sawtooth", 0.2, 0);
    playTone(300, 0.3, "sawtooth", 0.2, 0.15);
    playTone(200, 0.4, "sawtooth", 0.15, 0.3);
  },

  levelUp: () => {
    // Fanfare
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      playTone(freq, 0.2, "sine", 0.3, i * 0.1);
    });
    playTone(1047, 0.5, "sine", 0.4, 0.45);
  },

  click: () => {
    playTone(880, 0.05, "sine", 0.15, 0);
  },

  login: () => {
    playTone(440, 0.1, "sine", 0.2, 0);
    playTone(550, 0.1, "sine", 0.2, 0.1);
    playTone(660, 0.2, "sine", 0.2, 0.2);
  },

  perfect: () => {
    // Star / perfect score jingle
    const melody = [523, 659, 784, 659, 784, 1047];
    melody.forEach((freq, i) => {
      playTone(freq, 0.18, "sine", 0.3, i * 0.13);
    });
  },
};

export default sounds;
