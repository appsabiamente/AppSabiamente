import React, { useState, useEffect } from 'react';
import { ShoppingCart, Video, Percent, X, Calculator, Coins, Wallet, Zap } from 'lucide-react';

interface MathGameProps {
  onComplete: (score: number) => void;
  onExit: () => void;
  onRequestAd: (callback: () => void) => void;
}

const MathGame: React.FC<MathGameProps> = ({ onComplete, onExit, onRequestAd }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);

  const generateProblem = () => {
    const op = Math.random() > 0.5 ? 'sum' : 'mixed';
    let ans = 0;
    let q = "";
    
    if (op === 'sum') {
        const n1 = Math.floor(Math.random() * 30) + 10;
        const n2 = Math.floor(Math.random() * 30) + 10;
        ans = n1 + n2;
        q = `R$ ${n1} + R$ ${n2}`;
    } else {
        const n1 = Math.floor(Math.random() * 50) + 20;
        const n2 = Math.floor(Math.random() * 15) + 5;
        const n3 = Math.floor(Math.random() * 10) + 1;
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
  };

  useEffect(() => {
    generateProblem();
  }, [round]);

  const handleSelect = (val: number) => {
    if (val === answer) {
        // RECOMPENSA REDUZIDA: De 5 para 3
        const newScore = score + 3;
        if (round < 5) {
            setRound(r => r + 1);
            setScore(newScore);
        } else {
            onComplete(newScore + 10);
        }
    } else {
        alert("Cálculo incorreto! Você perdeu o que ganhou nesta partida.");
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
                    <h2 className="text-xl font-bold text-gray-800 leading-none">Cálculo</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 font-semibold">Rodada {round}/5</span>
                        <span className="text-xs font-bold text-yellow-600 flex items-center gap-1"><Coins size={12}/> +{score}</span>
                    </div>
                </div>
            </div>
            <button onClick={onExit} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} className="text-gray-600" />
            </button>
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