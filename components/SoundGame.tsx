import React, { useState, useEffect } from 'react';
import { Music, X, Video } from 'lucide-react';
import { playTone } from '../services/audioService';

interface SoundGameProps {
  onComplete: (score: number) => void;
  onExit: () => void;
  onRequestAd: (callback: () => void) => void;
}

const COLORS = ['bg-rose-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'];
const SOUND_NAMES = ['Dó', 'Ré', 'Mi', 'Fá'];

const SoundGame: React.FC<SoundGameProps> = ({ onComplete, onExit, onRequestAd }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userStep, setUserStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeBtn, setActiveBtn] = useState<number | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => addToSequence(), 500);
    return () => clearTimeout(t);
  }, []);

  const addToSequence = () => {
    const next = Math.floor(Math.random() * 4);
    const newSeq = [...sequence, next];
    setSequence(newSeq);
    setRound(r => r + 1);
    setUserStep(0);
    setTimeout(() => playSequence(newSeq), 1000);
  };

  const playSequence = async (seq: number[]) => {
    setIsPlaying(true);
    for (let i = 0; i < seq.length; i++) {
        await highlightAndPlay(seq[i]);
        await new Promise(r => setTimeout(r, 300)); 
    }
    setIsPlaying(false);
  };

  const highlightAndPlay = (idx: number) => {
    return new Promise<void>(resolve => {
        setActiveBtn(idx);
        playTone(idx); 
        setTimeout(() => {
            setActiveBtn(null);
            resolve();
        }, 500);
    });
  };

  const handlePress = (idx: number) => {
    if (isPlaying) return;
    
    setActiveBtn(idx);
    playTone(idx);
    setTimeout(() => setActiveBtn(null), 200);

    if (idx === sequence[userStep]) {
        if (userStep === sequence.length - 1) {
            if (round >= 5) { 
                setTimeout(() => onComplete(25), 500);
            } else {
                setTimeout(addToSequence, 1000);
            }
        } else {
            setUserStep(s => s + 1);
        }
    } else {
        alert("Ops! Sequência incorreta. Tente novamente.");
        onRequestAd(() => {
            setUserStep(0);
            setTimeout(() => playSequence(sequence), 500);
        });
    }
  };

  const handleReplay = () => {
      onRequestAd(() => {
          setTimeout(() => playSequence(sequence), 500);
      });
  }

  return (
    <div className="flex flex-col h-full bg-brand-bg">
       <div className="flex flex-col p-4 bg-white shadow-sm rounded-b-3xl z-10 mb-4 gap-4">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
                    <Music size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 leading-none">Sons</h2>
                    <span className="text-xs text-gray-500 font-semibold">Rodada {round}/5</span>
                </div>
            </div>
            <button onClick={onExit} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} className="text-gray-600" />
            </button>
        </div>

        <button onClick={handleReplay} disabled={isPlaying} className="w-full bg-yellow-100 text-yellow-800 p-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 border-yellow-300 shadow-sm active:scale-95 animate-pulse hover:bg-yellow-200 transition-colors disabled:opacity-50">
            <Video size={20} className="fill-yellow-600 text-yellow-800"/>
            <span className="text-sm">Repetir Som (Vídeo)</span>
        </button>
      </div>

      <div className="flex-grow flex flex-col justify-center gap-8 p-6">
          <p className="text-center text-xl text-gray-700 font-medium bg-white px-6 py-3 rounded-full shadow-sm mx-auto">
             {isPlaying ? "Escute e Observe..." : "Sua vez! Repita."}
          </p>

          <div className="grid grid-cols-2 gap-4">
              {[0, 1, 2, 3].map(i => (
                  <button
                    key={i}
                    onClick={() => handlePress(i)}
                    className={`
                        aspect-square rounded-3xl shadow-md transition-all duration-150 border-4 border-white
                        ${COLORS[i]} 
                        ${activeBtn === i ? 'scale-95 brightness-125 ring-4 ring-gray-300' : 'opacity-90'}
                        flex items-center justify-center
                    `}
                  >
                      <span className="text-white font-bold text-4xl drop-shadow-md">{SOUND_NAMES[i]}</span>
                  </button>
              ))}
          </div>
      </div>
    </div>
  );
};

export default SoundGame;