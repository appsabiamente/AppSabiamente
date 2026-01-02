// Simple synth for sound game and effects
const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

let isMuted = false;

export const setMuted = (muted: boolean) => {
    isMuted = muted;
    if (muted && audioCtx && audioCtx.state === 'running') {
        audioCtx.suspend();
    } else if (!muted && audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
};

const FREQUENCIES = {
  0: 261.63, // C4 (Dó)
  1: 293.66, // D4 (Ré)
  2: 329.63, // E4 (Mi)
  3: 349.23  // F4 (Fá)
};

const playOscillator = (freq: number, type: OscillatorType, duration: number) => {
    if (!audioCtx || isMuted) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = freq;

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

export const playTone = (index: number, duration: number = 0.5) => {
  if (isMuted) return;
  playOscillator(FREQUENCIES[index as keyof typeof FREQUENCIES] || 440, 'sine', duration);
};

export const playSuccessSound = () => {
    if (isMuted || !audioCtx) return;
    // High pitched "Ding"
    playOscillator(523.25, 'sine', 0.1); // C5
    setTimeout(() => playOscillator(659.25, 'sine', 0.2), 100); // E5
};

export const playFailureSound = (code?: number) => {
    if (isMuted || !audioCtx) return;
    // Low pitched "Buzz"
    playOscillator(150, 'sawtooth', 0.3);
};