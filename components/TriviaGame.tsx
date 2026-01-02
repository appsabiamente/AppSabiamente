import React, { useState, useEffect } from 'react';
import { generateTriviaQuestion } from '../services/geminiService';
import { TriviaQuestion } from '../types';
import { CheckCircle, XCircle, Lightbulb, Coins, Brain, X, ArrowRight, StopCircle, Wallet, Zap, Video } from 'lucide-react';
import { LoadingScreen } from './LoadingScreen';
import { playSuccessSound, playFailureSound } from '../services/audioService';

interface TriviaGameProps {
  onComplete: (score: number) => void;
  onExit: () => void;
  userCoins: number;
  onUseCoins: (amount: number) => boolean;
}

const TriviaGame: React.FC<TriviaGameProps> = ({ onComplete, onExit, userCoins, onUseCoins }) => {
  const [question, setQuestion] = useState<TriviaQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [visibleOptions, setVisibleOptions] = useState<string[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [showDecision, setShowDecision] = useState(false);

  useEffect(() => {
    loadQuestion();
  }, []);

  const loadQuestion = async () => {
    setLoading(true);
    setShowDecision(false);
    setSelectedOption(null);
    setIsCorrect(null);
    setHintUsed(false);
    
    const q = await generateTriviaQuestion();
    if (q) {
      setQuestion(q);
      setVisibleOptions(q.options);
    }
    setLoading(false);
  };

  const handleOptionSelect = (option: string) => {
    if (selectedOption !== null || !question) return; 
    
    setSelectedOption(option);
    const correct = option === question.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      playSuccessSound();
      const earned = 5;
      const newScore = currentScore + earned;
      setCurrentScore(newScore); // Real-time update
      setTimeout(() => setShowDecision(true), 1500); 
    } else {
        playFailureSound();
        // Lose everything on error
        setTimeout(() => {
            alert("Errou! Você perdeu tudo que ganhou nesta partida.");
            onComplete(0); 
        }, 1000);
    }
  };

  const useHint = () => {
    if (!question || hintUsed) return;
    setHintUsed(true);
    const incorrect = question.options.filter(o => o !== question.correctAnswer);
    const toRemove = incorrect.slice(0, 2);
    setVisibleOptions(prev => prev.filter(o => !toRemove.includes(o)));
  };

  if (loading) return <LoadingScreen />;

  if (!question) {
    return (
      <div className="p-8 text-center">
        <p className="text-xl text-red-600 mb-4">Não foi possível carregar a pergunta.</p>
        <button onClick={onExit} className="bg-gray-200 px-6 py-3 rounded-xl text-lg">Voltar</button>
      </div>
    );
  }

  // Decision Screen (Deal or No Deal style)
  if (showDecision) {
      return (
          <div className="flex flex-col h-full bg-brand-bg p-6 items-center justify-center text-center">
              <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-sm">
                  <Coins size={64} className="mx-auto text-yellow-500 mb-4 animate-bounce"/>
                  <h2 className="text-2xl font-black text-gray-800 mb-2">Muito Bem!</h2>
                  <p className="text-gray-500 mb-6">Você tem <span className="font-bold text-green-600">{currentScore} moedas</span> agora.</p>
                  
                  <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => onComplete(currentScore)}
                        className="w-full bg-green-100 text-green-800 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-200"
                      >
                          <StopCircle /> Parar e Garantir
                      </button>
                      <button 
                        onClick={loadQuestion}
                        className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-md"
                      >
                          <ArrowRight /> Arriscar Próxima
                      </button>
                  </div>
                  <p className="text-xs text-red-400 mt-4 font-bold">Aviso: Se errar a próxima, perde tudo!</p>
              </div>
          </div>
      )
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
                    <h2 className="text-xl font-bold text-gray-800 leading-none">Sabedoria</h2>
                    <span className="text-xs font-bold text-yellow-600 flex items-center gap-1"><Coins size={12}/> Acumulado: {currentScore}</span>
                </div>
            </div>
            <button onClick={onExit} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} className="text-gray-600" />
            </button>
        </div>

        <div className="flex gap-2">
            <button onClick={useHint} disabled={hintUsed} className="flex-grow bg-yellow-100 text-yellow-800 p-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 border-yellow-300 shadow-sm active:scale-95 disabled:opacity-50 animate-pulse hover:bg-yellow-200 transition-colors">
                <Video size={20} className="fill-yellow-600 text-yellow-800"/>
                <span className="text-sm">Eliminar 2 (Vídeo)</span>
            </button>
            {currentScore > 0 && (
                <button onClick={() => onComplete(currentScore)} className="flex-grow bg-green-100 text-green-700 p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border-2 border-green-200 shadow-sm animate-in zoom-in hover:bg-green-200">
                    <Wallet size={16}/>
                    <span className="text-sm">Recolher</span>
                </button>
            )}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto px-6">
        <div className="bg-white p-6 rounded-2xl shadow-soft mb-6 border border-gray-100">
            <p className="text-xl font-medium leading-relaxed text-slate-800">{question.question}</p>
        </div>

        <div className="space-y-3 mb-6">
            {question.options.map((option, idx) => {
                if (!visibleOptions.includes(option)) return null;
                
                const isSelected = selectedOption === option;
                const isThisCorrect = option === question.correctAnswer;
                
                let btnClass = "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50";
                if (selectedOption !== null) {
                    if (isThisCorrect) btnClass = "bg-green-100 border-green-500 text-green-900";
                    else if (isSelected) btnClass = "bg-red-100 border-red-500 text-red-900";
                    else btnClass = "opacity-40 bg-gray-50 border-gray-100";
                }

                return (
                    <button
                        key={idx}
                        onClick={() => handleOptionSelect(option)}
                        className={`w-full p-4 text-left rounded-xl text-lg font-semibold transition-all duration-200 flex justify-between items-center shadow-sm ${btnClass}`}
                        disabled={selectedOption !== null}
                    >
                        {option}
                        {selectedOption !== null && isThisCorrect && <CheckCircle className="text-green-600 animate-in zoom-in" />}
                        {selectedOption !== null && isSelected && !isThisCorrect && <XCircle className="text-red-600 animate-in zoom-in" />}
                    </button>
                )
            })}
        </div>
      </div>
    </div>
  );
};

export default TriviaGame;