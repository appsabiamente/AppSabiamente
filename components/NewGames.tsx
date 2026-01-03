
import React, { useState, useEffect, useRef } from 'react';
import { generateIntruderTask, generateProverbTask, generateScrambleTask, validateWordChain } from '../services/geminiService';
import { IntruderTask, ProverbTask, ScrambleTask } from '../types';
import { playSuccessSound, playFailureSound } from '../services/audioService';
import { Loader2, CheckCircle, XCircle, Activity, Wind, Square, Circle, Play, Send, X, AlertCircle, Quote, Type, Zap, Eye, Target, Link, LayoutGrid, Heart, Palette, Search, Grid3X3, MousePointerClick, RotateCcw, Box, Copy, TrendingUp, CloudRain, Coins, MapPin, Trophy, Wallet, Video, Delete, CornerDownLeft } from 'lucide-react';
import { LoadingScreen } from './LoadingScreen';

// Common Props
interface GameProps {
  onComplete: (score: number) => void;
  onExit: () => void;
  onRequestAd: (cb: () => void) => void;
  highScore?: number;
}

// Reusable Header with Live Coin Count AND Collect Button
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
}> = ({ title, icon, onExit, color = "text-gray-600", rightContent, currentCoins = 0, onCollect, onGetAdvantage, advantageLabel = "Ajuda (Vídeo)", highScore }) => (
    <div className="flex flex-col p-4 bg-white shadow-sm rounded-b-3xl z-10 mb-4 gap-4">
        {/* Top Row: Title & Exit */}
        <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${color} bg-opacity-10`}>
                    {icon}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 leading-none">{title}</h2>
                    <div className="flex flex-col">
                        {currentCoins > 0 && <span className="text-xs font-bold text-yellow-600 flex items-center gap-1 mt-1"><Coins size={12}/> +{currentCoins}</span>}
                        {highScore && highScore > 0 && <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1"><Trophy size={10}/> Max: {highScore}</span>}
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

        {/* Bottom Row: Actions (Big Advantage Button) */}
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

// === INFINITE GAMES ===

export const WordChainGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [history, setHistory] = useState<string[]>([]); 
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(0);
    const [category, setCategory] = useState("Frutas");
    const [level, setLevel] = useState(1);
    const [timeLeft, setTimeLeft] = useState(15); // REDUCED TO 15s
    const timerRef = useRef<any>(null);
    const [paused, setPaused] = useState(false);
    
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
                    alert(`TEMPO ESGOTADO! Você garantiu ${consolation} moedas (metade).`);
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
        if (loading) return;
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
            setTimeLeft(15); // Resetar para 15s
            
            if (newHistory.length > 0 && newHistory.length % 4 === 0) {
                 alert(`Nível ${level} concluído! Dificuldade aumentando...`);
                 setLevel(l => l + 1);
            }
        } else {
            playFailureSound(0);
            alert(`FIM DE JOGO! ${res.message}. Você perdeu suas moedas.`);
            onComplete(0); // LOSE ALL on logic error
        }
        setLoading(false);
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
                    {loading && <Loader2 className="animate-spin mx-auto text-blue-400"/>}
                </div>
                <div className="bg-white p-4 rounded-3xl shadow-soft">
                    <p className="text-center text-gray-500 mb-2 text-sm">Palavra de {category} com <b>{targetLetter}</b>...</p>
                    <div className="flex gap-2">
                        <input value={input} onChange={e => setInput(e.target.value)} className="flex-grow p-4 rounded-2xl bg-gray-50 border uppercase font-bold" placeholder="..." />
                        <button onClick={handleSubmit} className="bg-blue-600 text-white p-4 rounded-2xl"><Send /></button>
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
    
    // INCREASED DIFFICULTY: Faster speed multiplier formula
    const speedMultiplier = 1 + (score / 100); 

    useEffect(() => {
        if(gameOver) return;
        const spawn = setInterval(() => {
            setItems(prev => [...prev, {
                id: Date.now(),
                type: Math.random() > 0.3 ? 'good' : 'bad', 
                x: Math.random() * 80 + 10,
                y: 100
            }]);
        }, 1000 / speedMultiplier); // Faster spawns

        const loop = () => {
            setItems(prev => {
                // INCREASED FALL SPEED
                const next = prev.map(i => ({...i, y: i.y - (0.6 * speedMultiplier)})); 
                next.forEach(i => {
                    if (i.y < -10 && i.type === 'good') {
                        playFailureSound(0);
                        setLives(l => {
                            if (l <= 1) { 
                                setGameOver(true); 
                                const consolation = Math.floor(score / 2);
                                alert(`Você perdeu! Pontuação: ${score}.\nVocê garantiu ${consolation} moedas.`);
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
                    alert(`Você perdeu! Pontuação: ${score}.\nVocê garantiu ${consolation} moedas.`);
                    onComplete(consolation); 
                    return 0; 
                } 
                return l - 1;
            });
            setItems(prev => prev.filter(i => i.id !== id));
        }
    };

    const handleAdvantage = () => {
        setGameOver(true); // Pause loop
        onRequestAd(() => {
            setLives(l => l + 1);
            setGameOver(false); // Resume (via useEffect dependency logic, might need more robust pause state but this resets items a bit which helps)
            alert("Vida Extra Adicionada!");
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

export const SumTargetGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd }) => {
     const [target, setTarget] = useState(15);
     const [currentSum, setCurrentSum] = useState(0);
     const [options, setOptions] = useState<number[]>([]);
     const [timeLeft, setTimeLeft] = useState(15);
     const [score, setScore] = useState(0);
     const [paused, setPaused] = useState(false);
     const [showVictory, setShowVictory] = useState(false);
     const isGameOverRef = useRef(false); // Fix for incessant notifications
 
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
                         alert(`Tempo acabou! Você levou ${consolation} moedas (metade).`);
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
         
         // GARANTIA: Soma de todos >= alvo
         let newOptions: number[] = [];
         let totalSum = 0;
         do {
             newOptions = Array.from({length: 9}, () => Math.floor(Math.random() * 12) + 1);
             totalSum = newOptions.reduce((acc, curr) => acc + curr, 0);
         } while (totalSum < t); // Regenera se não for possível atingir o alvo
         
         setOptions(newOptions);
         setTimeLeft(15);
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
         if (isGameOverRef.current) return;
         const newSum = currentSum + num;
         setCurrentSum(newSum);
         const newOpts = [...options];
         newOpts[idx] = -1; 
         setOptions(newOpts);
 
         if (newSum === target) {
             playSuccessSound();
             setScore(s => s + 5);
             setShowVictory(true); // Exibe modal em vez de apenas resetar
         } else if (newSum > target) {
             if (!isGameOverRef.current) {
                 isGameOverRef.current = true;
                 playFailureSound(0);
                 alert("Passou do valor! Fim de Jogo.");
                 onComplete(0); // LOSE ALL
             }
         }
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
                rightContent={<span className="font-bold text-red-500">{timeLeft}s</span>} 
            />
            
            {/* MODAL DE VITÓRIA CUSTOMIZADO */}
            {showVictory && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6 animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
                        <Trophy className="mx-auto text-yellow-500 mb-4 animate-bounce" size={64}/>
                        <h2 className="text-2xl font-black text-gray-800 mb-2">Alvo Atingido!</h2>
                        <p className="text-gray-500 mb-6">Você somou exatamente {target}.</p>
                        <button 
                            onClick={resetRound}
                            className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform"
                        >
                            Próximo Nível
                        </button>
                    </div>
                </div>
            )}

             <div className="p-6 flex flex-col flex-grow">
                 <div className="bg-white p-6 rounded-3xl text-center shadow-soft mb-8">
                     <p className="text-gray-400 text-sm mb-1">Meta</p>
                     <div className="text-6xl font-black text-gray-800 tracking-tighter">{target}</div>
                     <p className="mt-2 text-green-600 font-bold text-lg">{currentSum}</p>
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                     {options.map((num, i) => (
                         <button key={i} disabled={num === -1} onClick={() => add(num, i)} className={`aspect-square rounded-2xl text-2xl font-bold transition-all ${num === -1 ? 'opacity-0' : 'bg-white shadow-soft hover:bg-green-50 text-gray-700'}`}>{num}</button>
                     ))}
                 </div>
             </div>
         </div>
     );
 };

// === IMPLEMENTED GAMES ===

// Padrões (Pattern Memory)
export const PatternGame: React.FC<GameProps> = ({ onComplete, onExit, highScore, onRequestAd }) => {
    const [grid, setGrid] = useState<boolean[]>([]);
    const [pattern, setPattern] = useState<boolean[]>([]);
    const [showing, setShowing] = useState(false);
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [gridSize, setGridSize] = useState(3); // 3, 4, 5
    const [timeLeft, setTimeLeft] = useState(20);
    const [paused, setPaused] = useState(false);

    useEffect(() => { startLevel(); }, [level]);

    useEffect(() => {
        if(showing || paused) return;
        const t = setInterval(() => {
             setTimeLeft(prev => {
                 if (prev <= 1) {
                     clearInterval(t);
                     playFailureSound(0);
                     const consolation = Math.floor(score / 2);
                     alert(`Tempo acabou! Você garantiu ${consolation} moedas.`);
                     onComplete(consolation);
                     return 0;
                 }
                 return prev - 1;
             });
        }, 1000);
        return () => clearInterval(t);
    }, [showing, level, paused, score]);

    const handleAdvantage = () => {
        setPaused(true);
        onRequestAd(() => {
            setGrid(pattern); // Reveal pattern
            setTimeout(() => {
                 setGrid(Array(gridSize*gridSize).fill(false)); // Hide again
                 setPaused(false);
            }, 1000);
        });
    }

    const startLevel = () => {
        // Expand grid logic...
        let size = 3;
        if(level >= 3) size = 4;
        if(level >= 6) size = 5;
        setGridSize(size);

        const totalCells = size * size; 
        setGrid(Array(totalCells).fill(false));
        const newPattern = Array(totalCells).fill(false);
        
        let count = 3 + Math.floor(level / 2);
        if (count > Math.floor(totalCells / 2)) count = Math.floor(totalCells / 2);

        for(let i=0; i<count; i++) {
            let idx;
            do { idx = Math.floor(Math.random() * totalCells); } while(newPattern[idx]);
            newPattern[idx] = true;
        }
        setPattern(newPattern);
        setGrid(newPattern);
        setShowing(true);
        setTimeLeft(20); 

        setTimeout(() => {
            setGrid(Array(totalCells).fill(false));
            setShowing(false);
        }, 2000); 
    };

    const handleTap = (idx: number) => {
        if(showing) return;
        const newGrid = [...grid];
        newGrid[idx] = true;
        setGrid(newGrid);

        if (!pattern[idx]) {
            playFailureSound(0);
            alert("Errou o padrão! Fim.");
            onComplete(0); // LOSE ALL on mistake
        } else {
            const currentSelected = newGrid.filter(Boolean).length;
            const totalToFind = pattern.filter(Boolean).length;
            
            if (currentSelected === totalToFind) {
                playSuccessSound();
                setScore(s => s + 2); 
                setTimeout(() => setLevel(l => l + 1), 500);
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader 
                title={`Padrões Nv.${level}`} 
                icon={<Grid3X3 size={24} className="text-purple-600"/>} 
                onExit={onExit} 
                currentCoins={score}
                onCollect={() => onComplete(score)}
                onGetAdvantage={handleAdvantage}
                advantageLabel="Ver Padrão (Vídeo)"
                highScore={highScore}
                rightContent={
                    <div className="flex flex-col items-end">
                        <span className="font-bold text-red-500">{showing ? 'Memorize' : `${timeLeft}s`}</span>
                    </div>
                }
            />
            <div className="flex-grow flex flex-col items-center justify-center p-6">
                <div 
                    className="grid gap-2 w-full max-w-sm aspect-square"
                    style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
                >
                    {grid.map((active, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleTap(i)} 
                            disabled={showing || (active && pattern[i])} 
                            className={`rounded-lg transition-all duration-300 ${active ? 'bg-purple-600 shadow-lg scale-95' : 'bg-white shadow-sm hover:bg-gray-50'}`} 
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// Estimativa
export const EstimateGame: React.FC<GameProps> = ({ onComplete, onExit, highScore, onRequestAd }) => {
    const [dots, setDots] = useState(0);
    const [showDots, setShowDots] = useState(true);
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(0);
    const [visibleOptionsCount, setVisibleOptionsCount] = useState(0);

    // Round initialization
    useEffect(() => {
        const count = Math.floor(Math.random() * 20) + 5;
        setDots(count);
        setShowDots(true);
        setVisibleOptionsCount(0); // Reset options visibility

        // Show dots for limited time based on count (harder with more dots)
        const showTime = 2000 + (count * 100); 
        const t = setTimeout(() => {
            setShowDots(false);
        }, showTime); 
        return () => clearTimeout(t);
    }, [round]);

    // Reveal options one by one after dots disappear
    useEffect(() => {
        if (!showDots) {
            let i = 0;
            const revealInterval = setInterval(() => {
                setVisibleOptionsCount(prev => prev + 1);
                i++;
                if (i >= 3) clearInterval(revealInterval);
            }, 500); // 0.5s delay between options
            return () => clearInterval(revealInterval);
        }
    }, [showDots]);

    const handleAdvantage = () => {
        onRequestAd(() => {
            setShowDots(true); 
            setVisibleOptionsCount(0);
            setTimeout(() => {
                setShowDots(false);
            }, 2000);
        });
    }

    const handleGuess = (val: number) => {
        if (val === dots) {
            playSuccessSound();
            setScore(s => s + 10);
            setRound(r => r + 1);
        } else {
            playFailureSound(0);
            alert(`Errou! Eram ${dots} bolinhas.`);
            onComplete(0); // LOSE ALL on mistake
        }
    };

    const options = React.useMemo(() => 
        [dots, dots + Math.floor(Math.random()*3)+1, dots - Math.floor(Math.random()*3)-1].sort(()=>Math.random()-0.5)
    , [dots]);

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader 
                title="Estimativa" 
                icon={<Activity size={24} className="text-orange-600"/>} 
                onExit={onExit} 
                currentCoins={score} 
                onCollect={() => onComplete(score)}
                onGetAdvantage={handleAdvantage}
                advantageLabel="Ver Bolinhas (Vídeo)"
                highScore={highScore}
            />
            <div className="flex-grow flex flex-col items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl w-72 h-72 flex flex-wrap gap-3 content-center justify-center shadow-soft mb-8 overflow-hidden">
                    {showDots ? [...Array(dots)].map((_,i) => <div key={i} className="w-5 h-5 bg-orange-400 rounded-full animate-bounce"></div>) : <div className="text-6xl font-bold text-gray-300">?</div>}
                </div>
                {!showDots && (
                    <div className="flex gap-4 min-h-[80px]">
                        {options.map((opt, i) => (
                             <button 
                                key={i} 
                                onClick={() => handleGuess(opt)} 
                                className={`bg-white px-8 py-5 rounded-2xl font-bold shadow-md text-xl hover:scale-105 transition-all duration-500 transform ${i < visibleOptionsCount ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                             >
                                 {opt}
                             </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Rotação
export const RotationGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd }) => {
    const [letter, setLetter] = useState('R');
    const [score, setScore] = useState(0);
    
    const [isMirrored, setIsMirrored] = useState(false);
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        const chars = ['R', 'F', 'L', 'P', 'G'];
        setLetter(chars[Math.floor(Math.random()*chars.length)]);
        setIsMirrored(Math.random() > 0.5);
        setRotation(Math.floor(Math.random() * 300));
    }, [score]);

    const handleGuess = (guessMirrored: boolean) => {
        if (guessMirrored === isMirrored) {
            playSuccessSound();
            setScore(s => s + 5);
        } else {
            playFailureSound(0);
            alert("Errou! Fim de jogo.");
            onComplete(0); // LOSE ALL
        }
    };

    const handleAdvantage = () => {
        onRequestAd(() => {
            setRotation(0); // Reset rotation to make it easy
        });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader 
                title="Rotação" 
                icon={<RotateCcw size={24} className="text-cyan-600"/>} 
                onExit={onExit} 
                currentCoins={score} 
                onCollect={() => onComplete(score)}
                onGetAdvantage={handleAdvantage}
                advantageLabel="Resetar (Vídeo)"
            />
            <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
                <div 
                    className="mb-16 text-9xl font-black text-cyan-600 transition-all duration-500"
                    style={{ 
                        transform: `rotate(${rotation}deg) scaleX(${isMirrored ? -1 : 1})` 
                    }}
                >
                    {letter}
                </div>
                <p className="mb-6 text-gray-500 font-medium">A letra está normal ou espelhada?</p>
                <div className="flex gap-6 w-full max-w-sm">
                     <button onClick={()=>handleGuess(false)} className="flex-1 p-6 bg-white rounded-2xl shadow-md font-bold text-lg border-b-4 border-gray-200 active:scale-95">Normal</button>
                     <button onClick={()=>handleGuess(true)} className="flex-1 p-6 bg-white rounded-2xl shadow-md font-bold text-lg border-b-4 border-gray-200 active:scale-95">Espelhada</button>
                </div>
            </div>
        </div>
    );
}

// Cores (Stroop)
export const ColorMatchGame: React.FC<GameProps> = ({ onComplete, onExit, highScore, onRequestAd }) => {
    const [text, setText] = useState("VERMELHO");
    const [color, setColor] = useState("text-red-500");
    const [match, setMatch] = useState(true);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [paused, setPaused] = useState(false);

    const colors = [
        { name: "VERMELHO", class: "text-red-500" },
        { name: "AZUL", class: "text-blue-500" },
        { name: "VERDE", class: "text-green-500" },
        { name: "AMARELO", class: "text-yellow-500" }
    ];

    useEffect(() => {
        if (paused) return;
        const t = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { 
                    clearInterval(t);
                    const consolation = Math.floor(score / 2);
                    alert(`Tempo acabou! Você garantiu ${consolation} moedas.`);
                    onComplete(consolation); 
                    return 0; 
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [paused, score]);

    const nextRound = () => {
        const c1 = colors[Math.floor(Math.random() * colors.length)];
        const isMatch = Math.random() > 0.5;
        setMatch(isMatch);
        setText(c1.name);
        
        if (isMatch) {
            setColor(c1.class);
        } else {
            let c2;
            do { c2 = colors[Math.floor(Math.random() * colors.length)]; } while (c2.name === c1.name);
            setColor(c2.class);
        }
    };

    useEffect(() => { nextRound(); }, []);

    const handleInput = (response: boolean) => {
        if (response === match) {
            playSuccessSound();
            setScore(s => s + 1); // Only 1 coin
            nextRound();
        } else {
            playFailureSound(0);
            alert("Errou! Fim de jogo.");
            onComplete(0); // LOSE ALL on mistake
        }
    };

    const handleAdvantage = () => {
        setPaused(true);
        onRequestAd(() => {
            setTimeLeft(t => t + 15);
            setPaused(false);
        });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader 
                title="Cores" 
                icon={<Palette size={24} className="text-pink-600"/>} 
                onExit={onExit} 
                currentCoins={score} 
                onCollect={() => onComplete(score)}
                onGetAdvantage={handleAdvantage}
                advantageLabel="+15s (Vídeo)"
                highScore={highScore}
                rightContent={
                    <div className="flex flex-col items-end">
                        <span className="font-mono text-red-500 font-bold text-lg">{timeLeft}s</span>
                    </div>
                } 
            />
            <div className="flex-grow flex flex-col items-center justify-center">
                 <h2 className={`text-6xl font-black mb-12 ${color} drop-shadow-sm`}>{text}</h2>
                 <p className="mb-6 text-gray-500">A cor do texto condiz com a palavra?</p>
                 <div className="flex gap-4 w-full px-6">
                    <button onClick={()=>handleInput(false)} className="flex-1 bg-white text-red-500 border-2 border-red-100 px-8 py-6 rounded-2xl shadow-sm font-black text-xl">NÃO</button>
                    <button onClick={()=>handleInput(true)} className="flex-1 bg-green-500 text-white px-8 py-6 rounded-2xl shadow-lg font-black text-xl">SIM</button>
                 </div>
            </div>
        </div>
    );
}

// Oculto
export const HiddenObjectGame: React.FC<GameProps> = ({ onComplete, onExit, highScore, onRequestAd }) => {
     const [grid, setGrid] = useState<string[]>([]);
     const [score, setScore] = useState(0);
     const [level, setLevel] = useState(1);
     const [timeLeft, setTimeLeft] = useState(15);
     const [target, setTarget] = useState("");
     const [paused, setPaused] = useState(false);
     
     useEffect(() => { generateGrid(); }, [level]);

     useEffect(() => {
         if(paused) return;
         const t = setInterval(() => {
             setTimeLeft(prev => {
                 if (prev <= 1) { 
                    clearInterval(t); 
                    const consolation = Math.floor(score / 2);
                    alert(`Tempo acabou! Você garantiu ${consolation} moedas.`);
                    onComplete(consolation); 
                    return 0; 
                 }
                 return prev - 1;
             });
         }, 1000);
         return () => clearInterval(t);
     }, [paused, score]);

     const generateGrid = () => {
         const pairs = [
             {common: '🌲', target: '🌳'},
             {common: '😐', target: '🙂'},
             {common: '🍎', target: '🍅'},
             {common: '⬛', target: '🔲'},
             {common: '🐱', target: '🦊'}
         ];
         const pair = pairs[(level - 1) % pairs.length];
         setTarget(pair.target);

         const items = Array(35).fill(pair.common);
         const targetIdx = Math.floor(Math.random() * 36);
         items.splice(targetIdx, 0, pair.target); 
         setGrid(items);
     };

     const handleClick = (item: string) => {
         if (item === target) {
             playSuccessSound();
             setScore(s => s + 5);
             setLevel(l => l + 1);
             setTimeLeft(t => t + 5); // Add time
         } else {
             playFailureSound(0);
             alert("Errou! Fim de jogo.");
             onComplete(0); // LOSE ALL
         }
     }

     const handleAdvantage = () => {
        setPaused(true);
        onRequestAd(() => {
            // Wait for ad modal to close, then execute
            setTimeout(() => {
                setTimeLeft(prev => prev + 15);
                alert(`Tempo extra! +15s.\nDica: O objeto é ${target}`);
                setPaused(false);
            }, 500);
        });
     }

     return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader 
                title="Oculto" 
                icon={<Search size={24} className="text-indigo-600"/>} 
                onExit={onExit} 
                currentCoins={score}
                onCollect={() => onComplete(score)}
                onGetAdvantage={handleAdvantage}
                advantageLabel="+15s & Dica"
                highScore={highScore}
                rightContent={
                    <div className="flex flex-col items-end">
                        <span className="font-bold text-red-500">{timeLeft}s</span>
                    </div>
                }
            />
            <div className="flex-grow flex flex-col items-center justify-center">
                 <p className="text-center mb-4 font-bold text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">Encontre: {target}</p>
                 <div className="grid grid-cols-6 gap-2 p-4 bg-gray-100 rounded-3xl border border-gray-200">
                    {grid.map((item, i) => (
                        <button key={i} onClick={() => handleClick(item)} className="text-3xl hover:scale-110 transition-transform p-2">
                            {item}
                        </button>
                    ))}
                 </div>
            </div>
        </div>
    );
}

// 4. MATH RAIN
export const MathRainGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd }) => {
    const [y, setY] = useState(0);
    const [prob, setProb] = useState({q: "2+2", a: 4});
    const [score, setScore] = useState(0);
    const [speed, setSpeed] = useState(0.3);
    const [paused, setPaused] = useState(false);
    const [buffer, setBuffer] = useState(""); // Input buffer for multi-digit
    
    useEffect(() => {
        if(paused) return;
        const t = setInterval(() => {
            setY(curr => {
                if(curr > 90) { 
                    clearInterval(t); 
                    playFailureSound(0);
                    const consolation = Math.floor(score / 2);
                    alert(`Caiu! Era ${prob.a}. Tempo esgotado! Você garantiu ${consolation} moedas.`);
                    onComplete(consolation); 
                    return 90; 
                }
                return curr + speed;
            });
        }, 30);
        return () => clearInterval(t);
    }, [prob, speed, paused, score]);

    const handleInput = (val: number) => {
        const nextBuffer = buffer + val;
        if (nextBuffer.length <= 4) { // Limit length
             setBuffer(nextBuffer);
        }
    }

    const handleDelete = () => {
        setBuffer(prev => prev.slice(0, -1));
    }

    const handleSubmit = () => {
        const numVal = parseInt(buffer);
        if (isNaN(numVal)) return; // Do nothing if empty

        if (numVal === prob.a) {
            // Correct
            playSuccessSound();
            setScore(s => s + 5);
            setSpeed(s => s + 0.05);
            setY(0);
            setBuffer("");
            const n1 = Math.floor(Math.random() * 15);
            const n2 = Math.floor(Math.random() * 15);
            setProb({q: `${n1}+${n2}`, a: n1+n2});
        } else {
            // STRICT FAIL ON WRONG SUBMISSION
            playFailureSound(0);
            alert(`Resposta Incorreta! Era ${prob.a}. Você perdeu suas moedas.`);
            onComplete(0); // Game Over on Wrong answer
        }
    }

    const handleAdvantage = () => {
        setPaused(true);
        onRequestAd(() => {
            setY(0); // Reset position
            setSpeed(s => Math.max(0.1, s - 0.1)); // Slow down
            setPaused(false);
        });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg relative overflow-hidden">
            <GameHeader 
                title="Chuva" 
                icon={<CloudRain size={24} className="text-blue-600"/>} 
                onExit={onExit} 
                currentCoins={score}
                onCollect={() => onComplete(score)}
                onGetAdvantage={handleAdvantage}
                advantageLabel="Lentidão (Vídeo)"
            />
            <div className="absolute left-1/2 -translate-x-1/2 bg-blue-100 border border-blue-300 px-6 py-3 rounded-full font-black text-blue-800 text-xl shadow-lg z-10" style={{top: `${y}%`}}>
                {prob.q}
            </div>
            
            {/* NEW BOTTOM LAYOUT: Combined Visor + Compact Keyboard fixed to bottom */}
            <div className="absolute bottom-0 w-full z-20 pb-4 pt-2 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] rounded-t-3xl flex flex-col items-center">
                
                {/* Visor Area inside the bottom container, slightly protruding upwards */}
                <div className="w-full flex justify-center -mt-8 mb-2">
                     <div className="bg-gray-900 border-4 border-gray-700 rounded-2xl p-2 w-3/4 shadow-xl flex items-center justify-end h-16">
                        <span className="text-green-400 font-mono text-3xl tracking-widest mr-2">{buffer || "_"}</span>
                     </div>
                </div>

                {/* Compact Keyboard Grid */}
                <div className="grid grid-cols-3 gap-2 px-6 w-full max-w-sm">
                    {[1,2,3,4,5,6,7,8,9].map(n => (
                        <button key={n} onClick={() => handleInput(n)} className="h-12 bg-gray-50 rounded-xl font-bold text-xl hover:bg-gray-200 active:scale-95 shadow-sm border-b-4 border-gray-200 text-gray-700">
                            {n}
                        </button>
                    ))}
                    <button onClick={handleDelete} className="h-12 bg-red-100 text-red-600 rounded-xl font-bold flex items-center justify-center active:scale-95 shadow-sm border-b-4 border-red-200">
                        <Delete />
                    </button>
                    <button onClick={() => handleInput(0)} className="h-12 bg-gray-50 rounded-xl font-bold text-2xl hover:bg-gray-200 active:scale-95 shadow-sm border-b-4 border-gray-200 text-gray-700">
                        0
                    </button>
                    <button onClick={handleSubmit} className="h-12 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center active:scale-95 shadow-sm border-b-4 border-green-700 text-lg">
                        OK
                    </button>
                </div>
            </div>
        </div>
    )
}

// 6. MOVING HUNT
export const MovingHuntGame: React.FC<GameProps> = ({ onComplete, onExit, highScore, onRequestAd }) => {
    const [items, setItems] = useState<{id: number, type: 'target'|'distractor', x: number, y: number, dx: number, dy: number}[]>([]);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [timeLeft, setTimeLeft] = useState(15);
    const [paused, setPaused] = useState(false);
    const reqRef = useRef<number>();

    // Timer
    useEffect(() => {
        if(paused) return;
        const t = setInterval(() => {
            setTimeLeft(prev => {
                if(prev <= 1) {
                    playFailureSound(0);
                    const consolation = Math.floor(score / 2);
                    alert(`Tempo Esgotado! Você garantiu ${consolation} moedas.`);
                    onComplete(consolation);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [paused, score]);

    // Init Level
    useEffect(() => {
        const count = 5 + (level * 2);
        const speedBase = 0.2 * level;
        const newItems = [];
        
        // Target
        newItems.push({id: 0, type: 'target' as const, x: 50, y: 50, dx: (Math.random()-0.5)*speedBase, dy: (Math.random()-0.5)*speedBase});
        
        // Distractors
        for(let i=1; i<count; i++) {
            newItems.push({
                id: i, 
                type: 'distractor' as const, 
                x: Math.random()*90, 
                y: Math.random()*80 + 10, 
                dx: (Math.random()-0.5)*speedBase, 
                dy: (Math.random()-0.5)*speedBase
            });
        }
        setItems(newItems);
    }, [level]);

    // Loop
    useEffect(() => {
        if(paused) return;
        const loop = () => {
            setItems(prev => prev.map(item => {
                let nx = item.x + item.dx;
                let ny = item.y + item.dy;
                let ndx = item.dx;
                let ndy = item.dy;

                if (nx < 0 || nx > 85) ndx *= -1;
                if (ny < 10 || ny > 85) ndy *= -1;

                return {...item, x: nx, y: ny, dx: ndx, dy: ndy};
            }));
            reqRef.current = requestAnimationFrame(loop);
        };
        reqRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(reqRef.current!);
    }, [paused]);

    const click = (type: 'target'|'distractor') => {
        if(type === 'target') {
            playSuccessSound();
            const reward = 2 + (level - 1); // Start 2, increase by 1
            setScore(s => s + reward);
            setLevel(l => l + 1);
            setTimeLeft(t => t + 5); 
        } else {
            playFailureSound(0);
            alert("Errou o alvo! Fim de jogo.");
            onComplete(0); // LOSE ALL
        }
    };

    const handleAdvantage = () => {
        setPaused(true);
        onRequestAd(() => {
            setTimeLeft(t => t + 10);
            setPaused(false);
        });
    }

    return (
         <div className="flex flex-col h-full bg-brand-bg relative overflow-hidden">
            <GameHeader 
                title={`Caça (Nível ${level})`} 
                icon={<MousePointerClick size={24} className="text-red-600"/>} 
                onExit={onExit} 
                currentCoins={score} 
                onCollect={() => onComplete(score)}
                onGetAdvantage={handleAdvantage}
                advantageLabel="+10s (Vídeo)"
                highScore={highScore}
                rightContent={
                    <div className="flex flex-col items-end">
                        <span className="font-bold text-red-500">{timeLeft}s</span>
                    </div>
                } 
            />
            <div className="flex-grow relative overflow-hidden bg-white/50 m-4 rounded-3xl border border-gray-200">
                 {items.map(item => (
                     <button 
                        key={item.id}
                        onMouseDown={() => click(item.type)}
                        className="absolute text-3xl transition-transform active:scale-90 select-none"
                        style={{ left: `${item.x}%`, top: `${item.y}%` }}
                     >
                        {item.type === 'target' ? '🍏' : '🍎'}
                     </button>
                 ))}
            </div>
            <p className="text-center p-2 text-gray-500 font-bold">Toque na Maçã VERDE!</p>
        </div>
    )
}

// 2. CARDS
export const CardGame: React.FC<GameProps> = ({ onComplete, onExit, highScore, onRequestAd }) => {
    const [currentCard, setCurrentCard] = useState(5);
    const [nextValue, setNextValue] = useState(0); 
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [hintText, setHintText] = useState<string | null>(null);

    // Initialize next card
    useEffect(() => {
        generateNext(currentCard); // Pass initial value to exclude
    }, []);

    const generateNext = (excludeVal: number) => {
        let n = Math.floor(Math.random() * 13) + 1;
        while(n === excludeVal) {
             n = Math.floor(Math.random() * 13) + 1;
        }
        setNextValue(n);
        setHintText(null); // Clear hint on new round
        return n; 
    }

    const nextCard = (guess: 'high' | 'low') => {
        const next = nextValue;
        
        const correct = (guess === 'high' && next > currentCard) || (guess === 'low' && next < currentCard);
        
        if (correct) {
            playSuccessSound();
            let newScore = score + 1;
            const newStreak = streak + 1;
            
            if (newStreak === 5) {
                newScore += 10; 
            }
            
            setScore(newScore);
            setStreak(newStreak === 5 ? 0 : newStreak);
            setCurrentCard(next);
            generateNext(next); 
        } else {
            playFailureSound(0);
            alert(`Errou! A carta era ${next}.`);
            onComplete(0); // LOSE ALL on wrong guess
        }
    };

    const generateMathHint = (target: number) => {
        // Create simple math problem resulting in 'target'
        const op = Math.random() > 0.5 ? 'plus' : 'minus';
        if (op === 'plus' && target > 1) {
            const a = Math.floor(Math.random() * (target - 1)) + 1;
            const b = target - a;
            return `${a} + ${b}`;
        } else {
            // Minus: a - b = target -> a = target + b
            const b = Math.floor(Math.random() * 5) + 1;
            const a = target + b;
            return `${a} - ${b}`;
        }
    };

    const handleAdvantage = () => {
        onRequestAd(() => {
            const mathProblem = generateMathHint(nextValue);
            setHintText(`A próxima carta é o resultado de: ${mathProblem}`);
        });
    }

    return (
        <div className="flex flex-col h-full bg-green-800">
             <GameHeader 
                title="Cartas" 
                icon={<Copy size={24} className="text-green-800"/>} 
                onExit={onExit} 
                currentCoins={score}
                onCollect={() => onComplete(score)}
                onGetAdvantage={handleAdvantage}
                advantageLabel="Ver Dica (Vídeo)"
                highScore={highScore}
             />
             <div className="flex-grow flex flex-col items-center justify-center">
                
                {/* Hint Display Area */}
                <div className="h-16 flex items-center justify-center mb-2 px-4 text-center">
                    {hintText && (
                        <div className="bg-yellow-100 text-yellow-900 px-4 py-2 rounded-xl font-bold animate-in zoom-in shadow-lg border-2 border-yellow-400">
                            {hintText}
                        </div>
                    )}
                </div>

                {/* Streak Indicator */}
                <div className="mb-4 flex gap-2">
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className={`w-3 h-3 rounded-full ${i <= streak ? 'bg-yellow-400 animate-pulse' : 'bg-green-900'}`}></div>
                    ))}
                </div>
                {streak > 0 && <p className="text-white text-xs font-bold mb-4">Combo: {streak}/5 (+10)</p>}

                <div className="bg-white p-12 rounded-2xl shadow-2xl mb-12 w-48 h-72 flex flex-col items-center justify-center border-4 border-gray-200">
                    <span className="text-6xl font-black text-gray-800">{currentCard === 1 ? 'A' : currentCard === 11 ? 'J' : currentCard === 12 ? 'Q' : currentCard === 13 ? 'K' : currentCard}</span>
                    <span className="text-2xl mt-4">♠️</span>
                </div>
                <p className="text-white mb-6 font-bold">A próxima é...</p>
                <div className="flex gap-6">
                    <button onClick={() => nextCard('low')} className="bg-red-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg active:scale-95">MENOR</button>
                    <button onClick={() => nextCard('high')} className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg active:scale-95">MAIOR</button>
                </div>
            </div>
        </div>
    )
}

// Updated Standard Games with LoadingScreen
export const IntruderGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => { 
    const [task, setTask] = useState<IntruderTask|null>(null); 
    useEffect(()=>{generateIntruderTask().then(setTask)},[]); 
    
    if(!task) return <LoadingScreen />; 

    const handleAdvantage = () => {
        onRequestAd(() => {
            alert(`Dica: O intruso começa com a letra ${task.intruder.charAt(0)}`);
        });
    }

    return (
        <div className="h-full flex flex-col">
            <GameHeader 
                title="Intruso" 
                icon={<AlertCircle size={24}/>} 
                onExit={onExit} 
                onGetAdvantage={handleAdvantage}
                advantageLabel="Ver Dica (Vídeo)"
                highScore={highScore}
            />
            <div className="p-6 flex flex-col gap-4">
                {task.items.map(i=> (
                    <button key={i} onClick={()=>{
                        if(i===task.intruder){ playSuccessSound(); onComplete(5); }
                        else { playFailureSound(0); alert(`Errado! O intruso era: ${task.intruder}\nMotivo: ${task.reason}`); onComplete(0); } // LOSE ALL
                    }} className="p-4 bg-white shadow-sm rounded-xl font-bold hover:bg-gray-50">{i}</button>
                ))}
            </div>
        </div>
    )
}

export const ProverbGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => { 
    const [task, setTask] = useState<ProverbTask|null>(null); 
    useEffect(()=>{generateProverbTask().then(setTask)},[]); 
    if(!task) return <LoadingScreen />; 
    
    const handleAdvantage = () => {
        onRequestAd(() => {
            alert(`Dica: A resposta tem ${task.part2.length} caracteres.`);
        });
    }

    return (
        <div className="h-full flex flex-col">
            <GameHeader 
                title="Ditados" 
                icon={<Quote size={24}/>} 
                onExit={onExit} 
                onGetAdvantage={handleAdvantage}
                advantageLabel="Ver Dica (Vídeo)"
                highScore={highScore}
            />
            <div className="p-6">
                <p className="text-xl italic mb-6">"{task.part1}..."</p>
                {task.options.map(o=>(
                    <button key={o} onClick={()=>{
                        if(o===task.part2){ playSuccessSound(); onComplete(5); }
                        else { playFailureSound(0); alert(`Errado! A resposta era:\n"${task.part2}"`); onComplete(0); } // LOSE ALL
                    }} className="w-full p-4 mb-2 bg-white shadow-sm rounded-xl hover:bg-gray-50">{o}</button>
                ))}
            </div>
        </div>
    )
}

export const ScrambleGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => { 
    const [task, setTask] = useState<ScrambleTask|null>(null); 
    const[v,sV]=useState(""); 
    useEffect(()=>{generateScrambleTask().then(setTask)},[]); 
    if(!task) return <LoadingScreen />; 

    const handleAdvantage = () => {
        onRequestAd(() => {
            alert(`Dica: ${task.hint}`);
        });
    }

    return (
        <div className="h-full flex flex-col">
            <GameHeader 
                title="Palavra" 
                icon={<Type size={24}/>} 
                onExit={onExit} 
                onGetAdvantage={handleAdvantage}
                advantageLabel="Ver Dica (Vídeo)"
                highScore={highScore}
            />
            <div className="p-6 text-center">
                <p className="text-3xl font-mono mb-6">{task.scrambled}</p>
                <input value={v} onChange={e=>sV(e.target.value.toUpperCase())} className="p-2 border rounded mb-4 w-full" placeholder="DIGITE AQUI"/>
                <button onClick={()=>{
                    if(v===task.word){ playSuccessSound(); onComplete(5); }
                    else { playFailureSound(0); alert(`Errado! A palavra era: ${task.word}`); onComplete(0); } // LOSE ALL
                }} className="bg-blue-500 text-white p-3 rounded-xl w-full font-bold">Verificar</button>
            </div>
        </div>
    )
}
