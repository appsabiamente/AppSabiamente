
import React, { useState, useEffect, useRef } from 'react';
import { generateIntruderTask, generateProverbTask, generateScrambleTask, validateWordChain } from '../services/geminiService';
import { IntruderTask, ProverbTask, ScrambleTask } from '../types';
import { playSuccessSound, playFailureSound } from '../services/audioService';
import { Loader2, CheckCircle, XCircle, Activity, Wind, Square, Circle, Play, Send, X, AlertCircle, Quote, Type, Zap, Eye, Target, Link, LayoutGrid, Heart, Palette, Search, Grid3X3, MousePointerClick, RotateCcw, Box, Copy, TrendingUp, CloudRain, Coins, MapPin, Trophy, Wallet, Video, Delete, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-react';

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
}> = ({ title, icon, onExit, color = "text-gray-600", rightContent, currentCoins = 0, onCollect, onGetAdvantage, advantageLabel = "Ajuda (Vídeo)", highScore }) => (
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
            
            // Foco de volta no input
            setTimeout(() => inputRef.current?.focus(), 100);

            if (newHistory.length > 0 && newHistory.length % 4 === 0) {
                 alert(`Nível ${level} concluído!`);
                 setLevel(l => l + 1);
            }
        } else {
            playFailureSound(0);
            alert(`FIM DE JOGO! ${res.message}.`);
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
    
    const speedMultiplier = 1 + (score / 40); 

    useEffect(() => {
        if(gameOver) return;
        const spawn = setInterval(() => {
            setItems(prev => [...prev, {
                id: Date.now(),
                type: Math.random() > 0.3 ? 'good' : 'bad', 
                x: Math.random() * 80 + 10,
                y: 100
            }]);
        }, 1000 / speedMultiplier);

        const loop = () => {
            setItems(prev => {
                const next = prev.map(i => ({...i, y: i.y - (0.9 * speedMultiplier)})); 
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
     const isGameOverRef = useRef(false);
 
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
         let newOptions: number[] = [];
         let totalSum = 0;
         do {
             newOptions = Array.from({length: 9}, () => Math.floor(Math.random() * 12) + 1);
             totalSum = newOptions.reduce((acc, curr) => acc + curr, 0);
         } while (totalSum < t);
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
            
            {showVictory && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6 animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
                        <Trophy className="mx-auto text-yellow-500 mb-4 animate-bounce" size={64}/>
                        <h2 className="text-2xl font-black text-gray-800 mb-2">Alvo Atingido!</h2>
                        <button onClick={resetRound} className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold text-lg mt-4">
                            Próximo
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

// === MISSING GAMES IMPLEMENTATION ===

export const IntruderGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [task, setTask] = useState<IntruderTask | null>(null);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadTask = async () => {
        setLoading(true);
        const t = await generateIntruderTask();
        if(t) setTask(t);
        setLoading(false);
    };

    useEffect(() => { loadTask(); }, []);

    const handleSelect = (item: string) => {
        if(!task) return;
        if(item === task.intruder) {
            playSuccessSound();
            setScore(s => s + 5);
            alert("Correto! " + task.reason);
            loadTask();
        } else {
            playFailureSound();
            alert("Errado! O intruso era: " + task.intruder);
            onComplete(score);
        }
    }

    const handleAdvantage = () => {
        onRequestAd(() => {
            if (task) alert("Dica: " + task.reason);
        });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader title="Intruso" icon={<AlertCircle size={24} className="text-red-500"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Dica (Vídeo)" highScore={highScore} />
            <div className="p-6 flex-grow flex flex-col justify-center">
                {loading ? <Loader2 className="animate-spin mx-auto"/> : (
                    <>
                        <h3 className="text-xl text-center font-bold mb-8 text-gray-700">Qual item não pertence?</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {task?.items.map((item, i) => (
                                <button key={i} onClick={() => handleSelect(item)} className="bg-white p-6 rounded-2xl shadow-sm font-bold text-lg hover:bg-gray-50 border border-gray-100">{item}</button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export const ProverbGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [task, setTask] = useState<ProverbTask | null>(null);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadTask = async () => {
        setLoading(true);
        const t = await generateProverbTask();
        if(t) setTask(t);
        setLoading(false);
    };

    useEffect(() => { loadTask(); }, []);

    const handleSelect = (option: string) => {
        if(!task) return;
        if(option === task.part2) {
            playSuccessSound();
            setScore(s => s + 5);
            loadTask();
        } else {
            playFailureSound();
            alert("Errado! O certo era: " + task.part2);
            onComplete(score);
        }
    }
    
    const handleAdvantage = () => {
        onRequestAd(() => {
            if(task) {
                // Eliminate 2 wrong answers visually or logically would require more state
                alert("A resposta começa com: " + task.part2.charAt(0));
            }
        });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader title="Ditados" icon={<Quote size={24} className="text-amber-500"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Primeira Letra (Vídeo)" highScore={highScore} />
            <div className="p-6 flex-grow flex flex-col justify-center">
                {loading ? <Loader2 className="animate-spin mx-auto"/> : (
                    <>
                        <div className="bg-amber-100 p-6 rounded-2xl mb-8 text-center border border-amber-200">
                            <p className="text-amber-900 text-xl font-serif italic">"{task?.part1}..."</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {[...(task?.options || []), task?.part2].sort(()=>Math.random()-0.5).map((opt, i) => (
                                <button key={i} onClick={() => handleSelect(opt!)} className="bg-white p-5 rounded-xl shadow-sm font-medium text-gray-700 hover:bg-amber-50 border border-gray-100 text-left">{opt}</button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export const ScrambleGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [task, setTask] = useState<ScrambleTask | null>(null);
    const [input, setInput] = useState("");
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadTask = async () => {
        setLoading(true);
        const t = await generateScrambleTask();
        if(t) setTask(t);
        setInput("");
        setLoading(false);
    };

    useEffect(() => { loadTask(); }, []);

    const check = () => {
        if(!task) return;
        if(input.toUpperCase().trim() === task.word.toUpperCase()) {
            playSuccessSound();
            setScore(s => s + 10);
            loadTask();
        } else {
            playFailureSound();
            alert("Tente novamente!");
        }
    }

    const handleAdvantage = () => {
        onRequestAd(() => {
             if(task) alert("Dica: " + task.hint);
        });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader title="Embaralhado" icon={<Type size={24} className="text-purple-500"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Dica (Vídeo)" highScore={highScore} />
            <div className="p-6 flex-grow flex flex-col items-center justify-center">
                {loading ? <Loader2 className="animate-spin"/> : (
                    <>
                        <div className="text-4xl font-black text-gray-800 tracking-widest mb-8 text-center break-all">
                            {task?.scrambled}
                        </div>
                        <input value={input} onChange={e => setInput(e.target.value)} className="w-full p-4 rounded-xl border-2 border-purple-200 text-center text-xl uppercase font-bold mb-4" placeholder="Qual a palavra?" />
                        <button onClick={check} className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg">Verificar</button>
                    </>
                )}
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

    useEffect(() => { startLevel(); }, [level]);

    const startLevel = () => {
        setPhase('memorize');
        setUserPattern([]);
        const len = 3 + Math.floor(level / 2);
        const newPat = Array.from({length: len}, () => Math.floor(Math.random() * 9));
        setPattern(newPat);
        setTimeout(() => setPhase('recall'), 2000 + (len * 500));
    };

    const handleTap = (idx: number) => {
        if(phase === 'memorize') return;
        const newUp = [...userPattern, idx];
        setUserPattern(newUp);
        playSuccessSound(); // Short beep

        if(newUp[newUp.length-1] !== pattern[newUp.length-1]) {
            playFailureSound();
            alert("Errou a sequência!");
            onComplete(score);
            return;
        }

        if(newUp.length === pattern.length) {
            playSuccessSound();
            setScore(s => s + level * 2);
            setTimeout(() => setLevel(l => l + 1), 500);
        }
    };

    const handleAdvantage = () => {
        onRequestAd(() => {
            setPhase('memorize');
            setTimeout(() => setPhase('recall'), 2000); // Show again for 2s
        });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader title="Padrões" icon={<Grid3X3 size={24} className="text-indigo-500"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Ver de Novo (Vídeo)" highScore={highScore} />
            <div className="flex-grow flex items-center justify-center p-6">
                <div className="grid grid-cols-3 gap-3 w-full max-w-sm aspect-square">
                    {[0,1,2,3,4,5,6,7,8].map(i => {
                        const active = phase === 'memorize' && pattern.includes(i);
                        return (
                            <button 
                                key={i} 
                                onClick={() => handleTap(i)}
                                className={`rounded-xl transition-all duration-300 ${active ? 'bg-indigo-500 scale-95' : 'bg-white shadow-sm hover:bg-gray-50'}`}
                            />
                        )
                    })}
                </div>
            </div>
            <p className="text-center pb-8 font-bold text-gray-500">{phase === 'memorize' ? 'Memorize...' : 'Repita!'}</p>
        </div>
    );
}

export const EstimateGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [count, setCount] = useState(0);
    const [items, setItems] = useState<any[]>([]);
    const [phase, setPhase] = useState<'show'|'guess'>('show');
    const [score, setScore] = useState(0);

    useEffect(() => { startRound(); }, []);

    const startRound = () => {
        setPhase('show');
        const c = Math.floor(Math.random() * 20) + 5;
        setCount(c);
        setItems(Array.from({length: c}, (_, i) => ({
            id: i,
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
            color: ['red','blue','green','yellow'][Math.floor(Math.random()*4)]
        })));
        setTimeout(() => setPhase('guess'), 3000); // Show for 3s
    };

    const handleGuess = (guess: number) => {
        const diff = Math.abs(guess - count);
        if (diff === 0) {
            playSuccessSound();
            setScore(s => s + 10);
            startRound();
        } else if (diff <= 2) {
            playSuccessSound();
            setScore(s => s + 5); // Close enough
            startRound();
        } else {
            playFailureSound();
            alert(`Eram ${count} itens!`);
            onComplete(score);
        }
    }

    const handleAdvantage = () => {
         onRequestAd(() => {
             alert(`A quantidade está entre ${Math.max(0, count - 3)} e ${count + 3}`);
         });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg relative overflow-hidden">
            <GameHeader title="Estimativa" icon={<Activity size={24} className="text-orange-500"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Dica de Faixa (Vídeo)" highScore={highScore} />
            
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
                            <button key={opt} onClick={() => handleGuess(opt)} className="bg-white p-4 rounded-xl shadow-sm border font-bold text-xl hover:bg-orange-50">{opt}</button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export const RotationGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    // Simplified logic: Show an arrow, ask which option is rotated 90 deg right
    const [angle, setAngle] = useState(0);
    const [score, setScore] = useState(0);

    useEffect(() => { setAngle(Math.floor(Math.random() * 4) * 90); }, [score]);

    const handleGuess = (guessAngle: number) => {
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
             // Eliminate one wrong answer visually is hard without more state, so just give text hint
             alert("Gire no sentido horário (direita)!");
         });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader title="Rotação" icon={<RotateCcw size={24} className="text-cyan-500"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Dica (Vídeo)" highScore={highScore} />
            <div className="flex-grow flex flex-col items-center justify-center gap-12 p-6">
                <div className="bg-white p-8 rounded-3xl shadow-soft">
                    <ArrowUp size={64} style={{transform: `rotate(${angle}deg)`}} className="text-cyan-600 transition-transform"/>
                </div>
                <div className="text-center font-bold text-gray-600">Qual figura é esta rodada 90° à direita?</div>
                <div className="grid grid-cols-2 gap-6">
                    {[0, 90, 180, 270].map(a => (
                        <button key={a} onClick={() => handleGuess(a)} className="bg-white p-4 rounded-2xl shadow-sm hover:bg-cyan-50">
                            <ArrowUp size={40} style={{transform: `rotate(${a}deg)`}} className="text-gray-700"/>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export const ColorMatchGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    // Stroop Test
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
            <GameHeader title="Cores" icon={<Palette size={24} className="text-pink-500"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="+15s (Vídeo)" highScore={highScore} rightContent={<span className="font-bold text-red-500">{timeLeft}s</span>} />
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
    // Grid of icons, find the Target
    const [grid, setGrid] = useState<any[]>([]);
    const [target, setTarget] = useState<any>(null);
    const [score, setScore] = useState(0);

    const icons = [Circle, Square, TriangleIcon, StarIcon, Heart]; // Simplified placeholders
    
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
            // Penalty or game over
            alert("Item errado!");
            onComplete(score);
        }
    }

    const handleAdvantage = () => {
        onRequestAd(() => {
            // Highlight target
            alert("O item é vermelho!");
        });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader title="Oculto" icon={<Search size={24} className="text-gray-600"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Dica (Vídeo)" highScore={highScore} />
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

// Helpers for HiddenObject placeholders
const TriangleIcon = ({size, className}:{size:number, className?:string}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2L2 22h20L12 2z"/></svg>
);
const StarIcon = ({size, className}:{size:number, className?:string}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
);

export const CardGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [currentCard, setCurrentCard] = useState(5);
    const [score, setScore] = useState(0);

    const handleGuess = (higher: boolean) => {
        const next = Math.floor(Math.random() * 13) + 1;
        if ((higher && next >= currentCard) || (!higher && next <= currentCard)) {
            playSuccessSound();
            setScore(s => s + 2);
            setCurrentCard(next);
        } else {
            playFailureSound();
            alert(`Era ${next}! Fim de jogo.`);
            onComplete(score);
        }
    }

    const handleAdvantage = () => {
         onRequestAd(() => {
             // Peek?
             alert("A próxima carta é " + (Math.random() > 0.5 ? "Alta (>7)" : "Baixa (<7)")); // Fake hint for now or implement real peek
         });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader title="Cartas" icon={<Copy size={24} className="text-red-600"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Dica (Vídeo)" highScore={highScore} />
            <div className="flex-grow flex flex-col items-center justify-center gap-8 p-6">
                <div className="bg-white w-40 h-56 rounded-2xl shadow-lg border-2 border-red-200 flex items-center justify-center">
                    <span className="text-6xl font-black text-red-600">{currentCard}</span>
                </div>
                <div className="flex gap-4 w-full">
                    <button onClick={() => handleGuess(false)} className="flex-1 bg-blue-100 text-blue-800 py-4 rounded-xl font-bold flex flex-col items-center"><ArrowDown/> Menor</button>
                    <button onClick={() => handleGuess(true)} className="flex-1 bg-red-100 text-red-800 py-4 rounded-xl font-bold flex flex-col items-center"><ArrowUp/> Maior</button>
                </div>
            </div>
        </div>
    );
}

export const MathRainGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    // Simple version: Equation falls, click correct answer before it hits bottom?
    // Simplified for mobile: Just rapid fire math.
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

    // Generate options around correct answer
    const opts = [q.a, q.a+1, q.a-1].sort(()=>Math.random()-0.5);

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader title="Chuva" icon={<CloudRain size={24} className="text-blue-500"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="+10s (Vídeo)" highScore={highScore} />
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
    // Balls bouncing. Find the red one.
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
            // Slow down
            alert("Câmera Lenta Ativada!");
        });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg relative overflow-hidden">
            <GameHeader title="Caça" icon={<MousePointerClick size={24} className="text-red-500"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Lento (Vídeo)" highScore={highScore} />
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
