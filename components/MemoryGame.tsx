import React, { useState, useEffect, useRef } from 'react';
import { LucideIcon, Cat, Dog, Fish, Bird, Rabbit, Turtle, Brain, Video, Sparkles, X, Trophy, Coins, Bug, Apple, Star, Moon, Sun, Cloud, Heart, Wallet, Zap } from 'lucide-react';
import { playSuccessSound, playFailureSound } from '../services/audioService';

interface MemoryGameProps {
  onComplete: (score: number) => void;
  onExit: () => void;
  onRequestAd: (callback: () => void) => void;
  highScore?: number;
}

interface Card {
  id: number;
  icon: LucideIcon;
  isFlipped: boolean;
  isMatched: boolean;
  color: string;
}

// Extended Icon Set for Higher Levels
const ALL_ICONS = [Cat, Dog, Fish, Bird, Rabbit, Turtle, Bug, Apple, Star, Moon, Sun, Cloud, Heart, Brain];
const COLORS = ['text-red-500', 'text-blue-500', 'text-green-500', 'text-purple-500', 'text-orange-500', 'text-teal-500', 'text-pink-500', 'text-indigo-500'];

const MemoryGame: React.FC<MemoryGameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0); // Cumulative coins
  const [timeLeft, setTimeLeft] = useState(30);
  const [isFrozen, setIsFrozen] = useState(false);
  
  const timerRef = useRef<any>(null);

  useEffect(() => {
    startLevel();
  }, [level]);

  useEffect(() => {
    if (isFrozen) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
           clearInterval(timerRef.current);
           playFailureSound();
           const consolation = Math.floor(score / 2);
           alert(`Tempo esgotado! Você garantiu ${consolation} moedas (metade).`);
           onComplete(consolation); 
           return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [level, isFrozen, score]);

  const startLevel = () => {
    let numPairs = 2;
    if (level === 2) numPairs = 3;
    if (level === 3) numPairs = 6;
    if (level === 4) numPairs = 8;
    if (level >= 5) numPairs = 10;

    const selectedIcons = ALL_ICONS.slice(0, numPairs);
    const gameCards: Card[] = [];
    
    selectedIcons.forEach((Icon, index) => {
      const color = COLORS[index % COLORS.length];
      gameCards.push({ id: index * 2, icon: Icon, isFlipped: false, isMatched: false, color });
      gameCards.push({ id: index * 2 + 1, icon: Icon, isFlipped: false, isMatched: false, color });
    });

    gameCards.sort(() => Math.random() - 0.5);
    setCards(gameCards);
    setFlippedCards([]);
    setIsLocked(false);
    // TEMPO REDUZIDO: Antes era 30 + 10*Nivel, agora 20 + 5*Nivel
    setTimeLeft(20 + (level * 5)); 
    setIsFrozen(false);
  };

  const handleCardClick = (id: number) => {
    if (isLocked) return;
    const cardIndex = cards.findIndex(c => c.id === id);
    if (cards[cardIndex].isFlipped || cards[cardIndex].isMatched) return;

    const newCards = [...cards];
    newCards[cardIndex].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      checkForMatch(newFlipped, newCards);
    }
  };

  const checkForMatch = (currentFlippedIds: number[], currentCards: Card[]) => {
    const c1 = currentCards.find(c => c.id === currentFlippedIds[0]);
    const c2 = currentCards.find(c => c.id === currentFlippedIds[1]);

    if (c1 && c2 && c1.icon === c2.icon) {
      playSuccessSound();
      setTimeout(() => {
        setCards(prev => prev.map(c => 
          currentFlippedIds.includes(c.id) ? { ...c, isMatched: true } : c
        ));
        setFlippedCards([]);
        setIsLocked(false);
        setScore(s => s + 2); // Reduced from 5 to 2
      }, 500);
    } else {
      setTimeout(() => {
        setCards(prev => prev.map(c => 
          currentFlippedIds.includes(c.id) ? { ...c, isFlipped: false } : c
        ));
        setFlippedCards([]);
        setIsLocked(false);
      }, 1000); 
    }
  };

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.isMatched)) {
        setTimeout(() => {
            alert(`Nível ${level} Completo! Próximo nível...`);
            setLevel(l => l + 1);
        }, 500);
    }
  }, [cards]);

  const handleAdvantage = () => {
    onRequestAd(() => {
        setIsLocked(true);
        // Reveal all non-matched cards
        setCards(prev => prev.map(c => ({...c, isFlipped: true})));
        
        setTimeout(() => {
             setCards(prev => prev.map(c => c.isMatched ? c : {...c, isFlipped: false}));
             setIsLocked(false);
        }, 2000); // 2 second peek
    });
  };

  let gridClass = "grid-cols-2"; 
  if (level === 2) gridClass = "grid-cols-3"; 
  if (level === 3) gridClass = "grid-cols-3"; 
  if (level >= 4) gridClass = "grid-cols-4"; 

  return (
    <div className="flex flex-col h-full bg-brand-bg">
      {/* Header */}
      <div className="flex flex-col p-4 bg-white shadow-sm rounded-b-3xl z-10 mb-4 gap-4">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
                    <Brain size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 leading-none">Memória Nv.{level}</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-yellow-600 flex items-center gap-1"><Coins size={12}/> +{score}</span>
                        {highScore && highScore > 0 && <span className="text-[10px] text-gray-400 flex items-center gap-1"><Trophy size={10}/> Recorde: {highScore}</span>}
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <div className={`font-mono font-bold text-lg px-2 py-1 rounded ${isFrozen ? 'bg-blue-100 text-blue-600' : (timeLeft < 10 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600')}`}>
                    {isFrozen ? 'PAUSE' : `${timeLeft}s`}
                </div>
                <button onClick={onExit} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <X size={20} className="text-gray-600" />
                </button>
            </div>
        </div>

        <div className="flex gap-2">
             <button onClick={handleAdvantage} className="flex-grow bg-yellow-100 text-yellow-800 p-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 border-yellow-300 shadow-sm active:scale-95 animate-pulse hover:bg-yellow-200 transition-colors">
                <Video size={20} className="fill-yellow-600 text-yellow-800"/>
                <span>Ver Cartas (Vídeo)</span>
             </button>
             {score > 0 && (
                <button onClick={() => onComplete(score)} className="flex-grow bg-green-100 text-green-700 p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border-2 border-green-200 shadow-sm animate-in zoom-in hover:bg-green-200">
                    <Wallet size={16}/>
                    <span>Recolher</span>
                </button>
             )}
        </div>
      </div>

      <div className="p-4 flex-grow flex flex-col justify-center items-center overflow-y-auto">
          <div className={`grid gap-3 w-full max-w-sm mx-auto ${gridClass}`}>
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`
                  aspect-square w-full rounded-2xl flex items-center justify-center shadow-md transition-all duration-500 transform
                  ${card.isFlipped || card.isMatched ? 'bg-white border-2 border-purple-400 rotate-y-180' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}
                `}
              >
                {(card.isFlipped || card.isMatched) ? (
                  <card.icon size={level > 3 ? 24 : 32} className={card.color} />
                ) : (
                  <Sparkles size={20} className="text-white opacity-30" />
                )}
              </button>
            ))}
          </div>
      </div>
    </div>
  );
};

export default MemoryGame;