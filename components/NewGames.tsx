
import React, { useState, useEffect, useRef } from 'react';
import { generateIntruderTask, generateProverbTask, generateScrambleTask, validateWordChain } from '../services/geminiService';
import { IntruderTask, ProverbTask, ScrambleTask } from '../types';
import { playSuccessSound, playFailureSound } from '../services/audioService';
import { LoadingScreen } from './LoadingScreen';
import { Loader2, CheckCircle, XCircle, Activity, Wind, Square, Circle, Play, Send, X, AlertCircle, Quote, Type, Zap, Eye, Target, Link, LayoutGrid, Heart, Palette, Search, Grid3X3, MousePointerClick, RotateCcw, Box, Copy, TrendingUp, CloudRain, Coins, MapPin, Trophy, Wallet, Video, Delete, CornerDownLeft, ArrowUp, ArrowDown, RotateCw, Trash2, Repeat, Flame, StopCircle, ArrowRight } from 'lucide-react';

// Common Props
interface GameProps {
  onComplete: (score: number) => void;
  onExit: () => void;
  onRequestAd: (cb: () => void) => void;
  highScore?: number;
}

// Reusable Header
const GameHeader: React.FC<{ 
    title: string; 
    icon: React.ReactNode; 
    onExit: () => void; 
    color?: string; 
    rightContent?: React.ReactNode; 
    currentCoins?: number; 
    onCollect?: () => void;
    onGetAdvantage?: () => void;
    advantageLabel?: string;
    highScore?: number;
    scoreLabel?: string;
}> = ({ title, icon, onExit, color = "text-gray-600", rightContent, currentCoins = 0, onCollect, onGetAdvantage, advantageLabel = "Ajuda (Vídeo)", highScore, scoreLabel = "Recorde" }) => (
    <div className="flex flex-col p-4 bg-white shadow-sm rounded-b-3xl z-10 mb-4 gap-4">
        <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${color} bg-opacity-10`}>
                    {icon}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 leading-none">{title}</h2>
                    <div className="flex flex-col">
                        {currentCoins > 0 && <span className="text-xs font-bold text-yellow-600 flex items-center gap-1 mt-1"><Coins size={12}/> +{currentCoins}</span>}
                        {highScore !== undefined && highScore > 0 && <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1"><Trophy size={10}/> {scoreLabel}: {highScore}</span>}
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                {rightContent}
                <button onClick={onExit} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <X size={20} className="text-gray-600" />
                </button>
            </div>
        </div>

        <div className="flex items-center gap-2 w-full">
            {onGetAdvantage && (
                <button 
                    onClick={onGetAdvantage} 
                    className="flex-grow bg-yellow-100 text-yellow-800 p-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 border-yellow-300 shadow-sm active:scale-95 animate-pulse hover:bg-yellow-200 transition-colors"
                >
                    <Video size={20} className="fill-yellow-600 text-yellow-800"/>
                    <span className="text-sm">{advantageLabel}</span>
                </button>
            )}
            
            {onCollect && currentCoins > 0 && (
                <button 
                    onClick={onCollect} 
                    className="flex-grow bg-green-100 text-green-800 p-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 border-green-300 shadow-sm animate-in zoom-in hover:bg-green-200"
                >
                    <Wallet size={20}/>
                    <span className="text-sm">Recolher</span>
                </button>
            )}
        </div>
    </div>
);

// === EXISTING INFINITE GAMES ===

export const WordChainGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [history, setHistory] = useState<string[]>([]); 
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(0);
    const [category, setCategory] = useState("Frutas");
    const [level, setLevel] = useState(1);
    const [timeLeft, setTimeLeft] = useState(15);
    const timerRef = useRef<any>(null);
    const [paused, setPaused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        const cats = ["Frutas", "Animais", "Países", "Cores", "Objetos de Casa"];
        const randCat = cats[Math.floor(Math.random() * cats.length)];
        setCategory(randCat);
        const starters: Record<string, string> = {
            "Frutas": "ABACATE", "Animais": "GATO", "Países": "BRASIL", "Cores": "AZUL", "Objetos de Casa": "CADEIRA"
        };
        setHistory([starters[randCat]]);
        setTimeLeft(15);
    }, [level]);

    useEffect(() => {
        if (loading || paused) return;
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    playFailureSound(0);
                    const consolation = Math.floor(score / 2);
                    alert(`TEMPO ESGOTADO! Você garantiu ${consolation} moedas.`);
                    onComplete(consolation);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [history, loading, paused, score]);

    const handleAdvantage = () => {
        setPaused(true);
        onRequestAd(() => {
            setTimeLeft(t => t + 15);
            setPaused(false);
            alert("Tempo adicionado! +15s");
        });
    };

    const lastWord = history[history.length - 1] || "";
    const targetLetter = lastWord.slice(-1).toUpperCase();

    const handleSubmit = async () => {
        if (loading || !input.trim()) return;
        setLoading(true);
        clearInterval(timerRef.current);
        
        const res = await validateWordChain(lastWord, input, category);
        
        if (res.isValid) {
            playSuccessSound();
            const newHistory = [...history, input.toUpperCase()];
            if (res.nextWord) newHistory.push(res.nextWord.toUpperCase());
            
            setHistory(newHistory);
            setInput("");
            const pts = 5 + (level * 2);
            setScore(s => s + pts);
            setTimeLeft(15);
            
            setTimeout(() => inputRef.current?.focus(), 100);

            if (newHistory.length > 0 && newHistory.length % 4 === 0) {
                 alert(`Nível ${level} concluído!`);
                 setLevel(l => l + 1);
            }
        } else {
            playFailureSound(0);
            alert(`FIM DE JOGO! ${res.message}`);
            onComplete(0);
        }
        setLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit();
    };

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader 
                title="Corrente" 
                icon={<Link size={24} className="text-blue-600"/>} 
                onExit={onExit} 
                currentCoins={score} 
                onCollect={() => onComplete(score)}
                onGetAdvantage={handleAdvantage}
                advantageLabel="+15s (Vídeo)"
                highScore={highScore}
                scoreLabel="Máx Pontos"
                rightContent={
                <div className={`font-bold text-lg px-3 py-1 rounded ${timeLeft < 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-800'}`}>
                    {timeLeft}s
                </div>
            } />
            <div className="flex-grow p-4 flex flex-col">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4 rounded-r shadow-sm">
                    <p className="text-yellow-900 font-bold">Categoria: <span className="text-lg uppercase">{category}</span></p>
                </div>
                <div className="flex-grow overflow-y-auto space-y-2 mb-4 p-4 bg-white rounded-3xl shadow-soft">
                    {history.map((w, i) => (
                        <div key={i} className={`p-3 rounded-2xl text-center font-bold max-w-[80%] shadow-sm ${i % 2 === 0 ? 'bg-gray-100 text-gray-600 self-start mr-auto' : 'bg-blue-100 text-blue-800 self-end ml-auto'}`}>
                            {w}
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-end">
                            <div className="bg-gray-100 text-gray-500 p-3 rounded-2xl rounded-tr-none text-xs font-bold flex items-center gap-2 animate-pulse">
                                <Loader2 size={12} className="animate-spin"/> Oponente pensando...
                            </div>
                        </div>
                    )}
                </div>
                <div className="bg-white p-4 rounded-3xl shadow-soft">
                    <p className="text-center text-gray-500 mb-2 text-sm">Palavra de {category} com <b>{targetLetter}</b>...</p>
                    <div className="flex gap-2">
                        <input 
                            ref={inputRef}
                            value={input} 
                            onChange={e => setInput(e.target.value)} 
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                            className="flex-grow p-4 rounded-2xl bg-gray-50 border uppercase font-bold disabled:opacity-50" 
                            placeholder="..." 
                        />
                        <button 
                            onClick={handleSubmit} 
                            disabled={loading || !input}
                            className={`bg-blue-600 text-white p-4 rounded-2xl transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 active:scale-95'}`}
                        >
                            {loading ? <Loader2 className="animate-spin"/> : <Send />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ZenFocusGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [items, setItems] = useState<{id: number, type: 'good'|'bad', x: number, y: number}[]>([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameOver, setGameOver] = useState(false);
    const reqRef = useRef<number>();
    
    const speedMultiplier = 0.8 + (score * 0.05); 

    useEffect(() => {
        if(gameOver) return;
        const spawnRate = Math.max(300, 1500 / speedMultiplier); 
        const spawn = setInterval(() => {
            setItems(prev => [...prev, {
                id: Date.now(),
                type: Math.random() > 0.3 ? 'good' : 'bad', 
                x: Math.random() * 80 + 10,
                y: 100
            }]);
        }, spawnRate);

        const loop = () => {
            setItems(prev => {
                const next = prev.map(i => ({...i, y: i.y - (0.5 * speedMultiplier)})); 
                next.forEach(i => {
                    if (i.y < -10 && i.type === 'good') {
                        playFailureSound(0);
                        setLives(l => {
                            if (l <= 1) { 
                                setGameOver(true); 
                                const consolation = Math.floor(score / 2);
                                alert(`Você perdeu! Pontuação: ${score}.`);
                                onComplete(consolation); 
                                return 0; 
                            } 
                            return l - 1;
                        });
                    }
                });
                return next.filter(i => i.y > -15);
            });
            if (!gameOver) reqRef.current = requestAnimationFrame(loop);
        };
        reqRef.current = requestAnimationFrame(loop);

        return () => { clearInterval(spawn); cancelAnimationFrame(reqRef.current!); };
    }, [gameOver, score]);

    const handleTap = (id: number, type: 'good'|'bad') => {
        if (gameOver) return;
        if (type === 'good') {
            playSuccessSound();
            setScore(s => s + 2); 
            setItems(prev => prev.filter(i => i.id !== id));
        } else {
            playFailureSound(0);
            setLives(l => {
                if (l <= 1) { 
                    setGameOver(true); 
                    const consolation = Math.floor(score / 2);
                    alert(`Você perdeu! Pontuação: ${score}.`);
                    onComplete(consolation); 
                    return 0; 
                } 
                return l - 1;
            });
            setItems(prev => prev.filter(i => i.id !== id));
        }
    };

    const handleAdvantage = () => {
        setGameOver(true);
        onRequestAd(() => {
            setLives(l => l + 1);
            setGameOver(false);
        });
    };

    return (
        <div className="flex flex-col h-full bg-brand-bg overflow-hidden relative">
            <GameHeader 
                title="Foco Zen" 
                icon={<Eye size={24} className="text-teal-600"/>} 
                onExit={onExit} 
                currentCoins={score} 
                onCollect={() => onComplete(score)}
                onGetAdvantage={handleAdvantage}
                advantageLabel="Vida Extra (Vídeo)"
                highScore={highScore}
                scoreLabel="Máx Pontos"
                rightContent={<div className="flex gap-1 text-red-500">{[...Array(lives)].map((_,i)=><Heart key={i} size={20} fill="currentColor"/>)}</div>} 
            />
            <div className="flex-grow relative cursor-crosshair z-0">
                {items.map(item => (
                    <div 
                        key={item.id}
                        onClick={() => handleTap(item.id, item.type)}
                        className={`absolute w-16 h-16 flex items-center justify-center transition-transform active:scale-90 shadow-lg ${item.type === 'good' ? 'bg-teal-400 rounded-full cursor-pointer animate-pulse' : 'bg-gray-800 rounded-xl'}`}
                        style={{ left: `${item.x}%`, top: `${item.y}%` }}
                    >
                        {item.type === 'good' ? <Circle className="text-white" size={28}/> : <Square className="text-white" size={28} />}
                    </div>
                ))}
            </div>
        </div>
    )
}

export const SumTargetGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
     const [target, setTarget] = useState(15);
     const [currentSum, setCurrentSum] = useState(0);
     const [options, setOptions] = useState<number[]>([]);
     const [timeLeft, setTimeLeft] = useState(15);
     const [score, setScore] = useState(0);
     const [paused, setPaused] = useState(false);
     const [showVictory, setShowVictory] = useState(false);
     const isGameOverRef = useRef(false);
     const [history, setHistory] = useState<{value: number, index: number}[]>([]);
 
     useEffect(() => { resetRound(); }, []);
 
     useEffect(() => {
         if (paused || showVictory) return;
         const t = setInterval(() => {
             setTimeLeft(prev => {
                 if (prev <= 1) {
                     clearInterval(t);
                     if (!isGameOverRef.current) {
                         isGameOverRef.current = true;
                         playFailureSound(0);
                         const consolation = Math.floor(score / 2);
                         alert(`Tempo acabou!`);
                         onComplete(consolation);
                     }
                     return 0;
                 }
                 return prev - 1;
             });
         }, 1000);
         return () => clearInterval(t);
     }, [paused, score, showVictory]);
 
     const resetRound = () => {
         isGameOverRef.current = false;
         
         const t = Math.floor(Math.random() * 25) + 20; 
         setTarget(t);
         setCurrentSum(0);
         setHistory([]);
         
         const p1 = Math.floor(Math.random() * (t - 5)) + 1;
         const p2 = Math.floor(Math.random() * (t - p1 - 2)) + 1;
         const p3 = t - p1 - p2;
         const solution = [p1, p2, p3];
         
         const randoms = Array.from({length: 6}, () => Math.floor(Math.random() * 15) + 1);
         const allOpts = [...solution, ...randoms].sort(() => Math.random() - 0.5);
         
         setOptions(allOpts);
         setTimeLeft(20);
         setShowVictory(false);
     };

     const handleAdvantage = () => {
        setPaused(true);
        onRequestAd(() => {
            setTimeLeft(t => t + 10);
            setPaused(false);
        });
     };
 
     const add = (num: number, idx: number) => {
         if (isGameOverRef.current || showVictory) return;
         const newSum = currentSum + num;
         setCurrentSum(newSum);
         const newOpts = [...options];
         newOpts[idx] = -1; // Mark used
         setOptions(newOpts);
         setHistory([...history, {value: num, index: idx}]);
 
         if (newSum === target) {
             playSuccessSound();
             setScore(s => s + 5);
             setShowVictory(true); 
         } else if (newSum > target) {
             if (!isGameOverRef.current) {
                 isGameOverRef.current = true;
                 playFailureSound(0);
                 alert("Passou do valor!");
                 onComplete(0);
             }
         }
     };

     const handleClear = () => {
         if (history.length === 0 || showVictory) return;
         const lastHistory = [...history];
         setHistory([]);
         setCurrentSum(0);
         const newOpts = [...options];
         lastHistory.forEach(h => {
             newOpts[h.index] = h.value;
         });
         setOptions(newOpts);
     };
 
     return (
         <div className="flex flex-col h-full bg-brand-bg relative">
             <GameHeader 
                title="Soma Alvo" 
                icon={<Target size={24} className="text-green-600"/>} 
                onExit={onExit} 
                currentCoins={score} 
                onCollect={() => onComplete(score)}
                onGetAdvantage={handleAdvantage}
                advantageLabel="+10s (Vídeo)"
                highScore={highScore}
                scoreLabel="Máx Pontos"
                rightContent={<span className="font-bold text-red-500">{timeLeft}s</span>} 
            />
            
            {showVictory && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6 animate-in fade-in" style={{pointerEvents: 'auto'}}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
                        <Trophy className="mx-auto text-yellow-500 mb-4 animate-bounce" size={64}/>
                        <h2 className="text-2xl font-black text-gray-800 mb-2">Alvo Atingido!</h2>
                        <div className="flex flex-col gap-3 mt-4">
                            <button onClick={resetRound} className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2">
                                <ArrowRight size={20}/> Continuar (+5 pts)
                            </button>
                            <button onClick={() => onComplete(score)} className="w-full bg-green-100 text-green-800 py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2">
                                <StopCircle size={20}/> Parar e Resgatar
                            </button>
                        </div>
                    </div>
                </div>
            )}

             <div className="p-6 flex flex-col flex-grow">
                 <div className="bg-white p-6 rounded-3xl text-center shadow-soft mb-8 relative">
                     <p className="text-gray-400 text-sm mb-1">Meta</p>
                     <div className="text-6xl font-black text-gray-800 tracking-tighter">{target}</div>
                     <p className={`mt-2 font-bold text-lg transition-colors ${currentSum > target ? 'text-red-500' : 'text-green-600'}`}>{currentSum}</p>
                     
                     <button onClick={handleClear} disabled={currentSum === 0 || showVictory} className="absolute right-4 top-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-30">
                         <Trash2 size={20} className="text-gray-600"/>
                     </button>
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                     {options.map((num, i) => (
                         <button key={i} disabled={num === -1 || showVictory} onClick={() => add(num, i)} className={`aspect-square rounded-2xl text-2xl font-bold transition-all ${num === -1 ? 'opacity-0 pointer-events-none' : 'bg-white shadow-soft hover:bg-green-50 text-gray-700 active:scale-95'}`}>{num}</button>
                     ))}
                 </div>
             </div>
         </div>
     );
 };

export const CardGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [currentCard, setCurrentCard] = useState(5);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [hint, setHint] = useState<string | null>(null);

    const handleGuess = (higher: boolean) => {
        const next = Math.floor(Math.random() * 13) + 1;
        setHint(null); // Clear hint
        if ((higher && next >= currentCard) || (!higher && next <= currentCard)) {
            playSuccessSound();
            const comboBonus = Math.min(combo, 5); 
            setScore(s => s + 2 + comboBonus);
            setCombo(c => c + 1);
            setCurrentCard(next);
        } else {
            playFailureSound();
            alert(`Era ${next}! Fim de jogo.`);
            onComplete(score);
        }
    }

    const handleAdvantage = () => {
         onRequestAd(() => {
             setHint(`Dica: A próxima carta é ${Math.random() > 0.5 ? "Alta (>7)" : "Baixa (<7)"} (Simulado)`);
         });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader 
                title="Cartas" 
                icon={<Copy size={24} className="text-red-600"/>} 
                onExit={onExit} 
                currentCoins={score} 
                onCollect={() => onComplete(score)} 
                onGetAdvantage={handleAdvantage} 
                advantageLabel="Dica (Vídeo)" 
                highScore={highScore} 
                scoreLabel="Máx Pontos"
            />
            <div className="flex-grow flex flex-col items-center justify-center gap-8 p-6">
                <div className="h-8">
                    {combo >= 2 && (
                        <div className="bg-orange-100 text-orange-600 px-4 py-1 rounded-full font-bold text-sm animate-bounce flex items-center gap-1">
                            <Flame size={14}/> COMBO x{combo} (+{Math.min(combo, 5)})
                        </div>
                    )}
                </div>
                <div className="bg-white w-40 h-56 rounded-2xl shadow-lg border-2 border-red-200 flex items-center justify-center relative">
                    <span className="text-6xl font-black text-red-600">{currentCard}</span>
                    <div className="absolute top-2 left-2 text-red-600">♥</div>
                    <div className="absolute bottom-2 right-2 text-red-600 rotate-180">♥</div>
                </div>
                
                {/* Dica Visual Abaixo das Opções */}
                <div className="flex flex-col w-full gap-4 items-center">
                    <div className="flex gap-4 w-full">
                        <button onClick={() => handleGuess(false)} className="flex-1 bg-blue-100 text-blue-800 py-4 rounded-xl font-bold flex flex-col items-center transition-transform active:scale-95"><ArrowDown/> Menor</button>
                        <button onClick={() => handleGuess(true)} className="flex-1 bg-red-100 text-red-800 py-4 rounded-xl font-bold flex flex-col items-center transition-transform active:scale-95"><ArrowUp/> Maior</button>
                    </div>
                    {hint && (
                        <div className="bg-yellow-50 text-yellow-800 p-3 rounded-xl border border-yellow-200 text-sm font-bold animate-in fade-in w-full text-center">
                            {hint}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export const PatternGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [pattern, setPattern] = useState<number[]>([]);
    const [userPattern, setUserPattern] = useState<number[]>([]);
    const [phase, setPhase] = useState<'memorize' | 'recall'>('memorize');
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [highlighted, setHighlighted] = useState<number | null>(null);

    // Initial Start
    useEffect(() => { startLevel(1); }, []);

    const startLevel = (lvl: number) => {
        setPhase('memorize');
        setUserPattern([]);
        const len = 3 + Math.floor(lvl / 2);
        const newPat = Array.from({length: len}, () => Math.floor(Math.random() * 9));
        setPattern(newPat);
        
        // Play Pattern
        let i = 0;
        const interval = setInterval(() => {
            if (i >= newPat.length) {
                clearInterval(interval);
                setHighlighted(null);
                setPhase('recall');
                return;
            }
            setHighlighted(newPat[i]);
            setTimeout(() => setHighlighted(null), 400); 
            i++;
        }, 800); 
    };

    const handleTap = (idx: number) => {
        if(phase === 'memorize') return;
        
        setHighlighted(idx);
        setTimeout(() => setHighlighted(null), 200);

        const newUp = [...userPattern, idx];
        setUserPattern(newUp);
        playSuccessSound(); 

        // Check immediately
        if(newUp[newUp.length-1] !== pattern[newUp.length-1]) {
            playFailureSound();
            // CORRECTION: Send 0 score to force "Que Pena" screen on App.tsx
            onComplete(0);
            return;
        }

        if(newUp.length === pattern.length) {
            playSuccessSound();
            const bonus = level * 2;
            setScore(s => s + bonus);
            setLevel(l => l + 1);
            setTimeout(() => startLevel(level + 1), 1000);
        }
    };

    const handleAdvantage = () => {
        onRequestAd(() => {
            startLevel(level); 
        });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader 
                title="Padrões" 
                icon={<Grid3X3 size={24} className="text-indigo-500"/>} 
                onExit={onExit} 
                currentCoins={score} 
                onCollect={() => onComplete(score)} 
                onGetAdvantage={handleAdvantage} 
                advantageLabel="Ver de Novo (Vídeo)" 
                highScore={highScore}
                scoreLabel="Máx Pontos"
            />
            <div className="flex-grow flex items-center justify-center p-6">
                <div className="grid grid-cols-3 gap-3 w-full max-w-sm aspect-square">
                    {[0,1,2,3,4,5,6,7,8].map(i => {
                        const isActive = highlighted === i;
                        return (
                            <button 
                                key={i} 
                                onClick={() => handleTap(i)}
                                disabled={phase === 'memorize'}
                                className={`rounded-xl transition-all duration-200 ${isActive ? 'bg-indigo-500 scale-95 shadow-glow' : 'bg-white shadow-sm hover:bg-gray-50'}`}
                            />
                        )
                    })}
                </div>
            </div>
            <p className="text-center pb-8 font-bold text-gray-500 transition-opacity duration-500">{phase === 'memorize' ? 'Memorize a ordem...' : 'Sua vez!'}</p>
        </div>
    );
}

export const EstimateGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [count, setCount] = useState(0);
    const [items, setItems] = useState<any[]>([]);
    const [phase, setPhase] = useState<'show'|'guess'>('show');
    const [score, setScore] = useState(0);
    const [hint, setHint] = useState<string | null>(null);

    useEffect(() => { startRound(); }, []);

    const startRound = () => {
        setPhase('show');
        setHint(null);
        // DIFFICULTY SCALING: Increase max items based on score
        const difficulty = Math.floor(score / 10);
        const minItems = 5 + difficulty;
        const maxItems = 20 + (difficulty * 5); // +5 max items every 10 points
        
        const c = Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems;
        setCount(c);
        setItems(Array.from({length: c}, (_, i) => ({
            id: i,
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
            color: ['red','blue','green','yellow'][Math.floor(Math.random()*4)]
        })));
        
        // Slightly faster show time on higher levels?
        const showTime = Math.max(1500, 3000 - (difficulty * 100));
        setTimeout(() => setPhase('guess'), showTime); 
    };

    const handleGuess = (guess: number) => {
        const diff = Math.abs(guess - count);
        
        if (diff === 0) {
            playSuccessSound();
            setScore(s => s + 10);
            startRound();
        } else if (diff <= 1 && count > 15) { 
            playSuccessSound();
            setScore(s => s + 5); 
            alert("Quase! Aceitamos por pouco.");
            startRound();
        } else {
            playFailureSound();
            alert(`Eram ${count} itens!`);
            onComplete(score);
        }
    }

    const handleAdvantage = () => {
         onRequestAd(() => {
             setHint(`A quantidade está entre ${Math.max(0, count - 2)} e ${count + 2}`);
         });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg relative overflow-hidden">
            <GameHeader 
                title="Estimativa" 
                icon={<Activity size={24} className="text-orange-500"/>} 
                onExit={onExit} 
                currentCoins={score} 
                onCollect={() => onComplete(score)} 
                onGetAdvantage={handleAdvantage} 
                advantageLabel="Dica de Faixa (Vídeo)" 
                highScore={highScore}
                scoreLabel="Máx Pontos"
            />
            
            {phase === 'show' ? (
                <div className="flex-grow relative">
                    {items.map(it => (
                        <div key={it.id} className="absolute w-4 h-4 rounded-full" style={{left: it.x+'%', top: it.y+'%', backgroundColor: it.color}} />
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-4xl font-black opacity-20">OBSERVE</span>
                    </div>
                </div>
            ) : (
                <div className="flex-grow flex flex-col items-center justify-center p-6 gap-4">
                    <h3 className="text-2xl font-bold">Quantos itens haviam?</h3>
                    <div className="grid grid-cols-3 gap-4 w-full">
                        {[count-2, count-1, count, count+1, count+2, count+5].sort(()=>Math.random()-0.5).map(opt => (
                            <button key={opt} onClick={() => handleGuess(opt)} className="bg-white p-4 rounded-xl shadow-sm border font-bold text-xl hover:bg-orange-50 active:scale-95">{opt}</button>
                        ))}
                    </div>
                    {hint && (
                        <div className="bg-yellow-50 text-yellow-800 p-3 rounded-xl border border-yellow-200 text-sm font-bold animate-in fade-in w-full text-center">
                            {hint}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// HARDER ROTATION GAME (45 degree intervals and tricky logic)
export const RotationGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [targetLetter, setTargetLetter] = useState("F");
    const [angle, setAngle] = useState(0);
    const [score, setScore] = useState(0);
    
    const LETTERS = ["F", "R", "L", "G", "P", "J"];

    useEffect(() => { 
        setTargetLetter(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
        // Angle can be 0, 45, 90, 135, 180...
        setAngle(Math.floor(Math.random() * 8) * 45); 
    }, [score]);

    const handleGuess = (guessAngle: number) => {
        // Target is +90 degrees clockwise
        const target = (angle + 90) % 360;
        if(guessAngle === target) {
            playSuccessSound();
            setScore(s => s + 5);
        } else {
            playFailureSound();
            alert("Errado!");
            onComplete(score);
        }
    }

    const handleAdvantage = () => {
         onRequestAd(() => {
             alert("Gire no sentido horário (direita) 90 graus ->");
         });
    }

    // Generate difficult options: Correct answer + 3 distractors close to it
    const generateOptions = () => {
        const correct = (angle + 90) % 360;
        const options = new Set<number>();
        options.add(correct);
        
        // Add tricky distractors (e.g. 45 degrees off, or mirrors)
        // Here we just pick other 45 degree intervals
        while(options.size < 4) {
            // High probability of picking close angles
            const noise = (Math.floor(Math.random() * 3) - 1) * 45; // -45, 0, +45 relative to random base
            const candidate = (Math.floor(Math.random() * 8) * 45);
            options.add(candidate);
        }
        return Array.from(options).sort((a,b) => a-b);
    }

    const [options, setOptions] = useState<number[]>([]);
    useEffect(() => {
        setOptions(generateOptions());
    }, [angle]);

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader 
                title="Rotação" 
                icon={<RotateCcw size={24} className="text-cyan-500"/>} 
                onExit={onExit} 
                currentCoins={score} 
                onCollect={() => onComplete(score)} 
                onGetAdvantage={handleAdvantage} 
                advantageLabel="Dica (Vídeo)" 
                highScore={highScore}
                scoreLabel="Máx Pontos"
            />
            <div className="flex-grow flex flex-col items-center justify-center gap-8 p-6">
                <div className="bg-white p-8 rounded-3xl shadow-soft w-32 h-32 flex items-center justify-center border border-gray-100">
                    <span 
                        className="text-8xl font-black text-cyan-600 transition-transform block" 
                        style={{transform: `rotate(${angle}deg)`}}
                    >
                        {targetLetter}
                    </span>
                </div>
                <div className="text-center font-bold text-gray-600 text-lg max-w-xs">
                    Qual opção é a figura acima girada <b className="text-cyan-600">90° à direita</b>?
                </div>
                <div className="grid grid-cols-2 gap-6">
                    {options.map(a => (
                        <button key={a} onClick={() => handleGuess(a)} className="bg-white p-6 rounded-2xl shadow-sm hover:bg-cyan-50 flex items-center justify-center transition-transform active:scale-95">
                            <span 
                                className="text-5xl font-black text-gray-700 block"
                                style={{transform: `rotate(${a}deg)`}}
                            >
                                {targetLetter}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export const ColorMatchGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [word, setWord] = useState("");
    const [color, setColor] = useState("");
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [questionType, setQuestionType] = useState<'meaning'|'color'>('meaning');
    
    const colors = ['red', 'blue', 'green', 'yellow'];
    const words = ['VERMELHO', 'AZUL', 'VERDE', 'AMARELO'];
    const map = { 'VERMELHO': 'red', 'AZUL': 'blue', 'VERDE': 'green', 'AMARELO': 'yellow' };

    useEffect(() => { nextRound(); }, []);

    useEffect(() => {
        const t = setInterval(() => {
            setTimeLeft(prev => {
                if(prev<=0) { clearInterval(t); onComplete(score); return 0; }
                return prev-1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [score]);

    const nextRound = () => {
        const w = words[Math.floor(Math.random()*4)];
        const c = colors[Math.floor(Math.random()*4)];
        setWord(w);
        setColor(c);
        setQuestionType(Math.random() > 0.5 ? 'meaning' : 'color');
    }

    const handleAnswer = (ans: string) => {
        const correct = questionType === 'meaning' ? map[word as keyof typeof map] : color;
        if(ans === correct) {
            playSuccessSound();
            setScore(s => s + 3);
            nextRound();
        } else {
            playFailureSound();
            alert("Errou!");
            onComplete(score);
        }
    }

    const handleAdvantage = () => {
        onRequestAd(() => {
            setTimeLeft(t => t + 15);
        });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader title="Cores" icon={<Palette size={24} className="text-pink-500"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="+15s (Vídeo)" highScore={highScore} scoreLabel="Máx Pontos" rightContent={<span className="font-bold text-red-500">{timeLeft}s</span>} />
            <div className="flex-grow flex flex-col items-center justify-center p-6 gap-8">
                <h3 className="text-xl font-bold uppercase text-gray-500">Toque na {questionType === 'meaning' ? 'PALAVRA' : 'COR'}</h3>
                <div className="text-6xl font-black" style={{color: color}}>
                    {word}
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                    {colors.map(c => (
                        <button key={c} onClick={() => handleAnswer(c)} className="h-20 rounded-2xl shadow-sm border-2 border-white" style={{backgroundColor: c}} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export const HiddenObjectGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [grid, setGrid] = useState<any[]>([]);
    const [target, setTarget] = useState<any>(null);
    const [score, setScore] = useState(0);

    const icons = [Circle, Square, TriangleIcon, StarIcon, Heart]; 
    
    useEffect(() => { startRound(); }, []);

    const startRound = () => {
        const tIcon = icons[Math.floor(Math.random()*icons.length)];
        setTarget({icon: tIcon, color: 'text-red-500'});
        
        const newGrid = Array.from({length: 25}, (_, i) => ({
            id: i,
            icon: Math.random() > 0.1 ? icons[Math.floor(Math.random()*icons.length)] : tIcon,
            color: ['text-blue-500','text-green-500','text-yellow-500'][Math.floor(Math.random()*3)]
        }));
        // Ensure strictly one target exists
        const targetIdx = Math.floor(Math.random() * 25);
        newGrid[targetIdx] = { id: targetIdx, icon: tIcon, color: 'text-red-500' };
        setGrid(newGrid);
    };

    const handleTap = (item: any) => {
        if(item.icon === target.icon && item.color === target.color) {
            playSuccessSound();
            setScore(s => s + 10);
            startRound();
        } else {
            playFailureSound();
            alert("Item errado!");
            onComplete(score);
        }
    }

    const handleAdvantage = () => {
        onRequestAd(() => {
            alert("O item é vermelho!");
        });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader title="Oculto" icon={<Search size={24} className="text-gray-600"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Dica (Vídeo)" highScore={highScore} scoreLabel="Máx Pontos" />
            <div className="p-4 bg-white shadow-sm mb-4 text-center">
                <span className="text-sm font-bold text-gray-500">Encontre este item:</span>
                <div className="flex justify-center mt-2">
                    {target && <target.icon size={32} className={target.color} />}
                </div>
            </div>
            <div className="flex-grow grid grid-cols-5 gap-2 p-4 content-start">
                {grid.map(item => (
                    <button key={item.id} onClick={() => handleTap(item)} className="aspect-square bg-white rounded-lg flex items-center justify-center shadow-sm hover:bg-gray-50">
                        <item.icon size={24} className={item.color} />
                    </button>
                ))}
            </div>
        </div>
    );
}

const TriangleIcon = ({size, className}:{size:number, className?:string}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2L2 22h20L12 2z"/></svg>
);
const StarIcon = ({size, className}:{size:number, className?:string}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
);

export const MathRainGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [q, setQ] = useState({t: "2+2", a: 4});
    const [timeLeft, setTimeLeft] = useState(5);
    const [score, setScore] = useState(0);

    useEffect(() => { nextQ(); }, []);
    useEffect(() => {
        const t = setInterval(() => {
            setTimeLeft(prev => {
                if(prev<=0) { clearInterval(t); onComplete(score); return 0; }
                return prev-0.1;
            });
        }, 100);
        return () => clearInterval(t);
    }, [q, score]);

    const nextQ = () => {
        const a = Math.floor(Math.random() * 10);
        const b = Math.floor(Math.random() * 10);
        setQ({t: `${a} + ${b}`, a: a+b});
        setTimeLeft(5 - Math.min(3, score/10)); // Faster
    }

    const handleAns = (ans: number) => {
        if(ans === q.a) {
            playSuccessSound();
            setScore(s => s + 1);
            nextQ();
        } else {
            playFailureSound();
            onComplete(score);
        }
    }

    const handleAdvantage = () => {
        onRequestAd(() => {
            setTimeLeft(t => t + 10);
        });
    }

    const opts = [q.a, q.a+1, q.a-1].sort(()=>Math.random()-0.5);

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader title="Chuva" icon={<CloudRain size={24} className="text-blue-500"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="+10s (Vídeo)" highScore={highScore} scoreLabel="Máx Pontos" />
            <div className="flex-grow flex flex-col items-center justify-center gap-8">
                 <div className="text-6xl font-black text-blue-600 animate-bounce">{q.t}</div>
                 <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden max-w-xs">
                     <div className="bg-blue-500 h-full transition-all duration-100" style={{width: `${(timeLeft/5)*100}%`}} />
                 </div>
                 <div className="grid grid-cols-3 gap-4 w-full p-6">
                     {opts.map((o, i) => (
                         <button key={i} onClick={() => handleAns(o)} className="bg-white p-6 rounded-2xl shadow-lg font-black text-2xl hover:bg-blue-50">{o}</button>
                     ))}
                 </div>
            </div>
        </div>
    );
}

export const MovingHuntGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [items, setItems] = useState<any[]>([]);
    const [score, setScore] = useState(0);
    const reqRef = useRef<number>();

    useEffect(() => {
        setItems(Array.from({length: 10}, (_, i) => ({
            id: i,
            x: Math.random()*80, y: Math.random()*80,
            vx: (Math.random()-0.5), vy: (Math.random()-0.5),
            isTarget: i === 0
        })));

        const loop = () => {
            setItems(prev => prev.map(p => {
                let nx = p.x + p.vx;
                let ny = p.y + p.vy;
                if(nx < 0 || nx > 90) p.vx *= -1;
                if(ny < 0 || ny > 90) p.vy *= -1;
                return {...p, x: nx, y: ny};
            }));
            reqRef.current = requestAnimationFrame(loop);
        };
        reqRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(reqRef.current!);
    }, [score]);

    const handleTap = (isTarget: boolean) => {
        if(isTarget) {
            playSuccessSound();
            setScore(s => s + 5);
        } else {
            playFailureSound();
            onComplete(score);
        }
    }

    const handleAdvantage = () => {
        onRequestAd(() => {
            alert("Câmera Lenta Ativada!");
        });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg relative overflow-hidden">
            <GameHeader title="Caça" icon={<MousePointerClick size={24} className="text-red-500"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Lento (Vídeo)" highScore={highScore} scoreLabel="Máx Pontos" />
            <div className="flex-grow relative">
                {items.map(it => (
                    <button 
                        key={it.id} 
                        onClick={() => handleTap(it.isTarget)}
                        className={`absolute w-12 h-12 rounded-full shadow-sm flex items-center justify-center ${it.isTarget ? 'bg-red-500' : 'bg-gray-300'}`}
                        style={{left: it.x+'%', top: it.y+'%'}}
                    >
                        {it.isTarget && <Target className="text-white" size={20}/>}
                    </button>
                ))}
            </div>
        </div>
    );
}

export const IntruderGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [task, setTask] = useState<IntruderTask | null>(null);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const t = await generateIntruderTask();
        if(t) setTask(t);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    const handleGuess = (item: string) => {
        if(!task) return;
        if(item === task.intruder) {
            playSuccessSound();
            setScore(s => s + 10);
            alert(`Correto! ${task.reason}`);
            load();
        } else {
            playFailureSound();
            alert("Não é esse o intruso.");
            onComplete(score);
        }
    }

    const handleAdvantage = () => {
        onRequestAd(() => {
            if(task) alert(`Dica: ${task.reason}`);
        });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader title="Intruso" icon={<Search size={24} className="text-purple-600"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Dica (Vídeo)" highScore={highScore} scoreLabel="Máx Pontos" />
            <div className="flex-grow flex flex-col items-center justify-center p-6 gap-6">
                <h3 className="text-xl font-bold text-gray-700">Qual item não pertence?</h3>
                {loading ? <Loader2 className="animate-spin text-purple-500" size={48}/> : (
                    <div className="grid grid-cols-2 gap-4 w-full">
                        {task?.items.map((item, i) => (
                            <button key={i} onClick={() => handleGuess(item)} className="bg-white p-6 rounded-2xl shadow-sm font-bold text-lg hover:bg-purple-50 active:scale-95 transition-all border border-gray-100">{item}</button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export const ProverbGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [task, setTask] = useState<ProverbTask | null>(null);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const t = await generateProverbTask();
        if(t) setTask(t);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    const handleGuess = (option: string) => {
        if(!task) return;
        if(option === task.part2) {
            playSuccessSound();
            setScore(s => s + 10);
            load();
        } else {
            playFailureSound();
            alert(`Errado! O correto era: "${task.part2}"`);
            onComplete(score);
        }
    }

    const handleAdvantage = () => {
        onRequestAd(() => {
            if(task) {
                 alert(`Começa com: ${task.part2.substring(0, 3)}...`);
            }
        });
    }

    // CUSTOM LOADING MESSAGE
    if (loading) return <LoadingScreen message="Carregando Ditados..." />;

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader title="Ditados" icon={<Quote size={24} className="text-amber-600"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Dica (Vídeo)" highScore={highScore} scoreLabel="Máx Pontos" />
            <div className="flex-grow flex flex-col items-center justify-center p-6 gap-6">
                <div className="bg-amber-100 p-6 rounded-2xl w-full text-center shadow-inner">
                    <p className="text-amber-900 text-xl font-serif italic">"{task?.part1}..."</p>
                </div>
                <div className="flex flex-col gap-3 w-full">
                    {[...(task?.options || []), task?.part2].sort(()=>Math.random()-0.5).map((opt, i) => (
                        <button key={i} onClick={() => handleGuess(opt!)} className="bg-white p-4 rounded-xl shadow-sm font-medium text-gray-800 hover:bg-amber-50 text-left border border-gray-100 active:scale-95 transition-all">{opt}</button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export const ScrambleGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [task, setTask] = useState<ScrambleTask | null>(null);
    const [input, setInput] = useState("");
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const t = await generateScrambleTask();
        if(t) setTask(t);
        setInput("");
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    const check = () => {
        if(!task) return;
        if(input.trim().toUpperCase() === task.word.toUpperCase()) {
            playSuccessSound();
            setScore(s => s + 15);
            load();
        } else {
            playFailureSound();
            alert("Incorreto. Tente novamente.");
        }
    }

    const handleAdvantage = () => {
        onRequestAd(() => {
            if(task) alert(`Dica: ${task.hint}`);
        });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader title="Embaralhado" icon={<Type size={24} className="text-indigo-600"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Dica (Vídeo)" highScore={highScore} scoreLabel="Máx Pontos" />
            <div className="flex-grow flex flex-col items-center justify-center p-6 gap-8">
                {loading ? <Loader2 className="animate-spin text-indigo-500" size={48}/> : (
                    <>
                        <div className="text-center">
                            <p className="text-sm text-gray-400 font-bold uppercase mb-2">Desembaralhe:</p>
                            <div className="text-4xl font-black text-indigo-600 tracking-widest break-all">{task?.scrambled}</div>
                        </div>
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value.toUpperCase())}
                            className="w-full p-4 text-center text-xl font-bold rounded-2xl border-2 border-indigo-100 focus:border-indigo-500 outline-none uppercase"
                            placeholder="Sua resposta..."
                        />
                        <button onClick={check} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-transform">Verificar</button>
                    </>
                )}
            </div>
        </div>
    );
}
