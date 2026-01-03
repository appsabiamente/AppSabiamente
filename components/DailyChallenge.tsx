
import React, { useState, useEffect } from 'react';
import { UserStats } from '../types';
import { generateDailyWordChallenge } from '../services/geminiService';
import { Calendar, Clock, Check, X, Gift, Loader2, Video } from 'lucide-react';
import { playSuccessSound, playFailureSound } from '../services/audioService';

interface DailyChallengeProps {
    stats: UserStats;
    onWin: (coins: number) => void;
    onRequestAd: (cb: () => void) => void;
}

const DailyChallenge: React.FC<DailyChallengeProps> = ({ stats, onWin, onRequestAd }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [timeLeft, setTimeLeft] = useState("");
    
    // Game State
    const [wordData, setWordData] = useState<{word: string, hint: string}|null>(null);
    const [input, setInput] = useState("");
    const [feedback, setFeedback] = useState<string|null>(null);
    const [revealedIndices, setRevealedIndices] = useState<number[]>([]);

    useEffect(() => {
        const checkStatus = () => {
            const today = new Date().toISOString().split('T')[0];
            const isDone = stats.dailyChallengeLastCompleted === today;
            setCompleted(isDone);

            if (isDone) {
                // Calculate time to midnight
                const now = new Date();
                const midnight = new Date();
                midnight.setHours(24, 0, 0, 0);
                const diff = midnight.getTime() - now.getTime();
                
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diff / (1000 * 60)) % 60);
                setTimeLeft(`${hours}h ${minutes}m`);
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [stats.dailyChallengeLastCompleted]);

    const handleOpen = async () => {
        setIsOpen(true);
        if (!wordData) {
            setLoading(true);
            const data = await generateDailyWordChallenge();
            if (data) {
                // Normalize word
                data.word = data.word.trim().toUpperCase();
                setWordData(data);
            }
            setLoading(false);
        }
    };

    const handleGuess = () => {
        if (!wordData) return;
        const normalizedInput = input.trim().toUpperCase();
        const normalizedTarget = wordData.word.toUpperCase();

        if (normalizedInput === normalizedTarget) {
            playSuccessSound();
            setFeedback("CORRECT");
            setTimeout(() => {
                setIsOpen(false);
                onWin(50); // Reward 50 coins
            }, 1500);
        } else {
            playFailureSound();
            setFeedback("WRONG");
            setTimeout(() => setFeedback(null), 1000);
        }
    };

    const handleRevealLetter = () => {
        onRequestAd(() => {
            if (!wordData) return;
            
            // Logic executed AFTER ad closes
            setWordData((currentWordData) => {
                if (!currentWordData) return null;
                
                const targetWord = currentWordData.word.toUpperCase();
                
                setRevealedIndices((currentIndices) => {
                    // Find indices not yet revealed
                    const availableIndices: number[] = [];
                    for (let i = 0; i < targetWord.length; i++) {
                        if (!currentIndices.includes(i)) {
                            availableIndices.push(i);
                        }
                    }

                    if (availableIndices.length > 0) {
                        const randomIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
                        // Add letter to revealed list
                        return [...currentIndices, randomIdx];
                    } else {
                        return currentIndices;
                    }
                });
                
                return currentWordData;
            });
        });
    }

    if (completed) {
        return (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-4 shadow-lg text-white flex items-center justify-between mb-6 border-2 border-green-400">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full"><Check size={24} /></div>
                    <div>
                        <h3 className="font-bold text-lg leading-none">Desafio do Dia</h3>
                        <p className="text-xs opacity-90">Próximo em {timeLeft}</p>
                    </div>
                </div>
                <Clock size={20} className="opacity-60"/>
            </div>
        );
    }

    return (
        <>
            <button 
                onClick={handleOpen}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl p-4 shadow-lg text-white flex items-center justify-between mb-6 transform transition-transform active:scale-95 border-2 border-pink-400"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full animate-bounce"><Calendar size={24} /></div>
                    <div className="text-left">
                        <h3 className="font-bold text-lg leading-none">Desafio da Palavra</h3>
                        <p className="text-xs opacity-90">Adivinhe a palavra do dia! (+50 <span className="inline-block align-middle text-[10px]">🪙</span>)</p>
                    </div>
                </div>
                <div className="bg-white text-pink-600 px-3 py-1 rounded-full font-bold text-xs shadow-sm">
                    JOGAR
                </div>
            </button>

            {/* MODAL */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
                        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
                            <X size={20} />
                        </button>

                        <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
                            <Calendar className="text-pink-500" /> Palavra do Dia
                        </h2>

                        {loading || !wordData ? (
                            <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                                <Loader2 className="animate-spin mb-2" size={32} />
                                <p>Consultando o Sábio...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-pink-50 border-l-4 border-pink-400 p-4 rounded-r-xl">
                                    <p className="text-xs font-bold text-pink-500 uppercase mb-1">Dica</p>
                                    <p className="text-lg font-medium text-gray-800 italic">"{wordData.hint}"</p>
                                </div>

                                {/* Visual slots for letters */}
                                <div className="flex justify-center gap-1.5 flex-wrap">
                                    {wordData.word.split('').map((char, index) => (
                                        <div key={index} className={`w-9 h-12 border-b-4 flex items-center justify-center font-bold text-2xl transition-all ${revealedIndices.includes(index) ? 'border-pink-500 text-pink-600 bg-pink-50 rounded-t-lg' : 'border-gray-300 text-transparent bg-gray-50'}`}>
                                            {revealedIndices.includes(index) ? char.toUpperCase() : '_'}
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-bold text-gray-500 text-center">Digite a palavra completa:</p>
                                    <input 
                                        type="text" 
                                        value={input}
                                        onChange={(e) => setInput(e.target.value.toUpperCase())}
                                        className={`w-full p-4 text-center text-xl font-black uppercase tracking-widest border-2 rounded-2xl outline-none transition-all ${feedback === 'WRONG' ? 'border-red-500 bg-red-50 animate-shake' : feedback === 'CORRECT' ? 'border-green-500 bg-green-50' : 'border-gray-200 focus:border-pink-500'}`}
                                        placeholder={`Palavra de ${wordData.word.length} letras...`}
                                        maxLength={wordData.word.length}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleRevealLetter}
                                        className="flex-1 bg-yellow-100 text-yellow-800 py-3 rounded-xl font-bold text-sm shadow-sm flex flex-col items-center justify-center hover:bg-yellow-200 transition-colors border border-yellow-200 active:scale-95"
                                    >
                                        <div className="flex items-center gap-1"><Video size={16}/> Revelar Letra</div>
                                        <span className="text-[10px] opacity-70">(Assista Vídeo)</span>
                                    </button>
                                    
                                    <button 
                                        onClick={handleGuess}
                                        disabled={!input}
                                        className="flex-[2] bg-gray-900 text-white py-3 rounded-xl font-bold text-lg shadow-lg active:scale-95 disabled:opacity-50 hover:bg-gray-800"
                                    >
                                        Verificar
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {feedback === 'CORRECT' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/95 rounded-3xl z-10 animate-in zoom-in">
                                <div className="text-center">
                                    <Gift size={64} className="mx-auto text-green-500 mb-4 animate-bounce" />
                                    <h3 className="text-3xl font-black text-gray-800">Excelente!</h3>
                                    <p className="text-gray-500 mt-2">A palavra era <br/><span className="text-2xl font-black text-pink-500 uppercase">{wordData?.word}</span></p>
                                    <p className="font-bold text-yellow-500 text-xl mt-4">+50 Moedas</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default DailyChallenge;
