
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Video, Percent, X, Calculator, Coins, Wallet, Zap, Trophy } from 'lucide-react';
import { playSuccessSound, playFailureSound } from '../services/audioService';

interface MathGameProps {
  onComplete: (score: number) => void;
  onExit: () => void;
  onRequestAd: (callback: () => void) => void;
  highScore?: number;
}

const MathGame: React.FC<MathGameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef<any>(null);

  const generateProblem = () => {
    // Difficulty scales with score
    const difficultyMultiplier = 1 + Math.floor(score / 20); 
    
    const op = Math.random() > 0.5 ? 'sum' : 'mixed';
    let ans = 0;
    let q = "";
    
    // Scale numbers based on score
    const maxVal = 30 * difficultyMultiplier; 
    
    if (op === 'sum') {
        const n1 = Math.floor(Math.random() * maxVal) + 10;
        const n2 = Math.floor(Math.random() * maxVal) + 10;
        ans = n1 + n2;
        q = `R$ ${n1} + R$ ${n2}`;
    } else {
        const n1 = Math.floor(Math.random() * (maxVal + 20)) + 20;
        const n2 = Math.floor(Math.random() * (maxVal/2)) + 5;
        const n3 = Math.floor(Math.random() * 10 * difficultyMultiplier) + 1;
        ans = n1 - n2 + n3;
        q = `R$ ${n1} - R$ ${n2} + R$ ${n3}`;
    }
    
    setQuestion(q);
    setAnswer(ans);

    const opts = new Set<number>();
    opts.add(ans);
    while(opts.size < 3) {
        opts.add(ans + Math.floor(Math.random() * 14) - 7);
    }
    setOptions(Array.from(opts).sort((a,b) => a-b));
    
    // Reset timer on new question (less time as it gets harder)
    setTimeLeft(Math.max(8, 15 - Math.floor(score/50))); 
  };

  useEffect(() => {
    generateProblem();
  }, []); // Run once on mount

  useEffect(() => {
      timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
              if (prev <= 1) {
                  clearInterval(timerRef.current);
                  playFailureSound();
                  alert(`Tempo esgotado! A resposta era R$ ${answer}.\nSua pontuação final: ${score}`);
                  onComplete(0); // Lose if time runs out
                  return 0;
              }
              return prev - 1;
          });
      }, 1000);
      return () => clearInterval(timerRef.current);
  }, [answer, score]); // Re-run timer logic when question changes

  const handleSelect = (val: number) => {
    if (val === answer) {
        playSuccessSound();
        setScore(s => s + 3);
        setLevel(l => l + 1); // Increase level on correct answer
        generateProblem();
    } else {
        playFailureSound();
        alert(`Cálculo incorreto! A resposta era R$ ${answer}.\nVocê perdeu o que ganhou nesta partida.`);
        onComplete(0); // Lose all coins
    }
  };

  const removeWrongOption = () => {
     onRequestAd(() => {
         const wrong = options.filter(o => o !== answer);
         if (wrong.length > 0) {
            setOptions(prev => prev.filter(o => o !== wrong[0]));
         }
     });
  };

  return (
    <div className="flex flex-col h-full bg-brand-bg">
       <div className="flex flex-col p-4 bg-white shadow-sm rounded-b-3xl z-10 mb-4 gap-4">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                    <Calculator size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 leading-none">Cálculo Nv.{level}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-yellow-600 flex items-center gap-1"><Coins size={12}/> +{score}</span>
                        {highScore && highScore > 0 && <span className="text-[10px] text-gray-400 flex items-center gap-1"><Trophy size={10}/> Recorde: {highScore}</span>}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className={`font-mono font-bold text-lg px-2 py-1 rounded ${timeLeft < 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600'}`}>
                    {timeLeft}s
                </span>
                <button onClick={onExit} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <X size={20} className="text-gray-600" />
                </button>
            </div>
        </div>

        <div className="flex gap-2">
             {options.length > 1 && (
                 <button onClick={removeWrongOption} className="flex-grow bg-yellow-100 text-yellow-800 p-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 border-yellow-300 shadow-sm active:scale-95 animate-pulse hover:bg-yellow-200 transition-colors">
                    <Video size={20} className="fill-yellow-600 text-yellow-800"/>
                    <span>Eliminar Erro (Vídeo)</span>
                 </button>
             )}
             {score > 0 && (
                <button onClick={() => onComplete(score)} className="flex-grow bg-green-100 text-green-700 p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border-2 border-green-200 shadow-sm animate-in zoom-in hover:bg-green-200">
                    <Wallet size={16}/>
                    <span>Recolher</span>
                </button>
             )}
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-6">
          <div className="bg-white p-8 rounded-3xl shadow-soft mb-8 w-full text-center">
             <p className="text-gray-400 mb-2 uppercase tracking-wide text-xs font-bold">Quanto custa?</p>
             <h3 className="text-4xl font-black text-gray-800">{question}</h3>
          </div>

          <div className="grid grid-cols-1 w-full gap-4">
              {options.map((opt, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSelect(opt)}
                    className="bg-white text-gray-700 border border-gray-100 text-2xl font-bold py-5 rounded-2xl shadow-sm hover:bg-emerald-50 hover:border-emerald-200 active:scale-95 transition-all"
                  >
                      R$ {opt}
                  </button>
              ))}
          </div>
      </div>
    </div>
  );
};

export default MathGame;
