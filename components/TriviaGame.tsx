
import React, { useState, useEffect } from 'react';
import { generateFactOrFake } from '../services/geminiService';
import { FactOrFakeQuestion } from '../types';
import { Check, X, Coins, Brain, ArrowRight, StopCircle, Video, ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';
import { LoadingScreen } from './LoadingScreen';
import { playSuccessSound, playFailureSound } from '../services/audioService';

interface TriviaGameProps {
  onComplete: (score: number) => void;
  onExit: () => void;
  userCoins: number;
  onUseCoins: (amount: number) => boolean;
  onRequestAd: (cb: () => void) => void;
}

const TriviaGame: React.FC<TriviaGameProps> = ({ onComplete, onExit, userCoins, onRequestAd }) => {
  const [data, setData] = useState<FactOrFakeQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentScore, setCurrentScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [lastResult, setLastResult] = useState<'CORRECT' | 'WRONG' | null>(null);

  useEffect(() => {
    loadQuestion();
  }, []);

  const loadQuestion = async () => {
    setLoading(true);
    setAnswered(false);
    setLastResult(null);
    
    const q = await generateFactOrFake();
    if (q) {
      setData(q);
    }
    setLoading(false);
  };

  const handleAnswer = (choice: boolean) => {
    if (answered || !data) return;
    setAnswered(true);

    const correct = choice === data.isFact;
    
    if (correct) {
      playSuccessSound();
      setLastResult('CORRECT');
      setCurrentScore(s => s + 5);
    } else {
      playFailureSound();
      setLastResult('WRONG');
    }
  };

  const handleNext = () => {
      if (lastResult === 'WRONG') {
          onComplete(currentScore); // End game on wrong answer (or can reduce life)
      } else {
          loadQuestion();
      }
  };

  const handleAdvantage = () => {
      onRequestAd(() => {
          // Reveal the answer visually
          if (data) {
              alert(`O Oráculo diz: Isso é ${data.isFact ? "VERDADE" : "MITO"}!`);
          }
      });
  }

  if (loading) return <LoadingScreen message="Consultando os livros..." />;

  if (!data) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-full">
        <p className="text-xl text-red-600 mb-4">Erro ao carregar.</p>
        <button onClick={onExit} className="bg-gray-200 px-6 py-3 rounded-xl text-lg">Voltar</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-brand-bg">
      <div className="flex flex-col p-4 bg-white shadow-sm rounded-b-3xl z-10 mb-4 gap-4">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                    <Brain size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 leading-none">Fato ou Mito?</h2>
                    <span className="text-xs font-bold text-yellow-600 flex items-center gap-1"><Coins size={12}/> Acumulado: {currentScore}</span>
                </div>
            </div>
            <button onClick={onExit} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} className="text-gray-600" />
            </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto px-6 flex flex-col justify-center">
        
        {/* CARD DA PERGUNTA */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-gray-100 text-center relative mb-8">
            <HelpCircle size={40} className="mx-auto text-blue-300 mb-4"/>
            <p className="text-2xl font-bold leading-relaxed text-slate-800">
                "{data.statement}"
            </p>
            
            {answered && (
                <div className={`mt-6 p-4 rounded-xl text-left animate-in zoom-in ${lastResult === 'CORRECT' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-1">
                        {lastResult === 'CORRECT' ? <Check className="text-green-600"/> : <X className="text-red-600"/>}
                        <span className={`font-black ${lastResult === 'CORRECT' ? 'text-green-700' : 'text-red-700'}`}>
                            {lastResult === 'CORRECT' ? 'ACERTOU!' : 'ERROU!'}
                        </span>
                    </div>
                    <p className="text-gray-700 font-medium">{data.explanation}</p>
                </div>
            )}
        </div>

        {!answered ? (
            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <button 
                        onClick={() => handleAnswer(true)}
                        className="flex-1 bg-green-100 border-b-4 border-green-500 text-green-800 py-6 rounded-2xl font-black text-xl flex flex-col items-center gap-2 active:scale-95 transition-transform"
                    >
                        <ThumbsUp size={32} className="fill-green-600 text-green-600"/>
                        VERDADE
                    </button>
                    <button 
                        onClick={() => handleAnswer(false)}
                        className="flex-1 bg-red-100 border-b-4 border-red-500 text-red-800 py-6 rounded-2xl font-black text-xl flex flex-col items-center gap-2 active:scale-95 transition-transform"
                    >
                        <ThumbsDown size={32} className="fill-red-600 text-red-600"/>
                        MITO
                    </button>
                </div>
                <button onClick={handleAdvantage} className="w-full text-blue-500 font-bold flex items-center justify-center gap-2 py-2">
                    <Video size={16}/> Pedir Ajuda
                </button>
            </div>
        ) : (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4">
                <button 
                    onClick={handleNext}
                    className={`w-full py-4 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02]
                    ${lastResult === 'CORRECT' ? 'bg-brand-primary text-white' : 'bg-gray-800 text-white'}`}
                >
                    {lastResult === 'CORRECT' ? <>Próxima <ArrowRight/></> : <>Tentar Novamente <StopCircle/></>}
                </button>
                {lastResult === 'CORRECT' && (
                    <button onClick={() => onComplete(currentScore)} className="text-gray-500 font-bold py-2">
                        Parar e Pegar Moedas
                    </button>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default TriviaGame;
