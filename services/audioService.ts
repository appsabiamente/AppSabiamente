
// Advanced Synth for SábiaMente
// Designed to be pleasant, organic, and accessible for seniors.

const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

let isMuted = false;

// Master Gain to prevent clipping when multiple sounds play
const masterGain = audioCtx ? audioCtx.createGain() : null;
if (masterGain && audioCtx) {
    masterGain.gain.value = 0.4; // Overall volume control
    masterGain.connect(audioCtx.destination);
}

export const setMuted = (muted: boolean) => {
    isMuted = muted;
    if (audioCtx) {
        if (muted) {
            if (audioCtx.state === 'running') audioCtx.suspend();
        } else {
            if (audioCtx.state === 'suspended') audioCtx.resume();
        }
    }
};

// Helper: Play a single synthesized note with Envelope
const playNote = (
    freq: number, 
    type: OscillatorType, 
    startTime: number, 
    duration: number, 
    volume: number = 1,
    decay: number = 0.1
) => {
    if (!audioCtx || !masterGain || isMuted) return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    // Envelope (Attack, Decay) to remove "clicking" and harshness
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02); // Quick Soft Attack
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration + decay); // Smooth Release

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + decay + 0.1);
};

// 1. CLICK SOUND: A soft, wooden "pop" or "bubble" sound
export const playClickSound = () => {
    if (!audioCtx || !masterGain || isMuted) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const t = audioCtx.currentTime;
    
    // High frequency sine with rapid pitch drop = "Pop" sound
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
    
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(t);
    osc.stop(t + 0.1);
};

// 2. SUCCESS SOUND: A Major Arpeggio (Harp/Celesta style)
// Much more rewarding than a simple beep
export const playSuccessSound = () => {
    if (!audioCtx || isMuted) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const t = audioCtx.currentTime;
    const speed = 0.08; // Arpeggio speed

    // C Major 7 Chord (C, E, G, B, C)
    playNote(523.25, 'sine', t, 0.4, 0.6);          // C5
    playNote(659.25, 'sine', t + speed, 0.4, 0.6);  // E5
    playNote(783.99, 'sine', t + speed*2, 0.4, 0.6);// G5
    playNote(987.77, 'sine', t + speed*3, 0.6, 0.4);// B5
    playNote(1046.50, 'sine', t + speed*4, 0.8, 0.2);// C6
};

// 3. FAILURE SOUND: A low "Bonk" (Woodblock/Low percussion)
// Less aggressive than a buzzer
export const playFailureSound = (code?: number) => {
    if (!audioCtx || isMuted) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const t = audioCtx.currentTime;

    // Use a triangle wave for a "woody" texture
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, t); // Low pitch
    osc.frequency.linearRampToValueAtTime(100, t + 0.15); // Slight pitch drop
    
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2); // Short decay
    
    osc.connect(gain);
    gain.connect(masterGain); // masterGain is defined at top of file
    
    osc.start(t);
    osc.stop(t + 0.25);
};

// 4. LEVEL UP / HIGH SCORE: A longer fanfare
export const playFanfare = () => {
    if (!audioCtx || isMuted) return;
    const t = audioCtx.currentTime;
    // Fast ascending run
    playNote(523.25, 'triangle', t, 0.2);
    playNote(659.25, 'triangle', t + 0.1, 0.2);
    playNote(783.99, 'triangle', t + 0.2, 0.2);
    playNote(1046.50, 'triangle', t + 0.3, 0.8, 0.8); // Long final note
};

// 5. PARTY SOUNDS: Pops and whistles simulation
export const playCelebrationSound = () => {
    if (!audioCtx || isMuted) return;
    const t = audioCtx.currentTime;
    
    // Rapid Pops
    for(let i=0; i<8; i++) {
        setTimeout(playClickSound, i * 150);
    }
    
    // High Whistle
    playNote(880, 'sine', t + 0.5, 0.3, 0.3); // A5
    playNote(1760, 'sine', t + 0.6, 0.5, 0.2); // A6
};

// 6. MAGICAL SOUND (Unlock Avatar)
export const playMagicalSound = () => {
    if (!audioCtx || isMuted) return;
    const t = audioCtx.currentTime;
    // Sparkling chime effect (high frequency sines)
    playNote(1046.50, 'sine', t, 0.5, 0.2); // C6
    playNote(1318.51, 'sine', t + 0.1, 0.5, 0.2); // E6
    playNote(1567.98, 'sine', t + 0.2, 0.5, 0.2); // G6
    playNote(2093.00, 'sine', t + 0.3, 0.8, 0.4); // C7
    // Underlying "shimmer"
    playNote(523.25, 'triangle', t, 1.0, 0.1, 0.5); // C5 long
};

// 7. MUSICAL TONES (For Sound Game)
const FREQUENCIES = {
  0: 261.63, // C4 (Dó)
  1: 329.63, // E4 (Mi)
  2: 392.00, // G4 (Sol)
  3: 523.25  // C5 (Dó Alto)
};

export const playTone = (index: number, duration: number = 0.5) => {
  if (isMuted || !audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const t = audioCtx.currentTime;
  const freq = FREQUENCIES[index as keyof typeof FREQUENCIES] || 440;
  
  playNote(freq, 'sine', t, duration, 0.8, 0.3);
};
