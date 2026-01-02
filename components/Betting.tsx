import React, { useState, useEffect } from 'react';
import { UserStats } from '../types';
import { Clover, Coins, Dices, RotateCcw, Video, Calendar, Check, Lock } from 'lucide-react';
import { playSuccessSound, playFailureSound } from '../services/audioService';

interface BettingProps {
    stats: UserStats;
    onUpdateCoins: (newAmount: number) => void;
    onExit: () => void;
    onRequestAd: (cb: () => void) => void;
    onClaimDaily: (amount: number) => void;
}

const SEGMENTS = [
    { label: '0x', color: '#EF4444', multiplier: 0, probability: 0.55 }, // Red
    { label: '2x', color: '#3B82F6', multiplier: 2, probability: 0.30 }, // Blue
    { label: '5x', color: '#10B981', multiplier: 5, probability: 0.10 }, // Green
    { label: '10x', color: '#F59E0B', multiplier: 10, probability: 0.05 }, // Yellow
];

const DAILY_REWARDS = [10, 20, 30, 50, 80, 100, 500];

const Betting: React.FC<BettingProps> = ({ stats, onUpdateCoins, onRequestAd, onClaimDaily }) => {
    const [betAmount, setBetAmount] = useState<number>(10);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [resultMessage, setResultMessage] = useState<string | null>(null);
    const [lastWin, setLastWin] = useState<number | null>(null);
    const [adUnlocked, setAdUnlocked] = useState(false);
    const [canClaimDaily, setCanClaimDaily] = useState(false);

    useEffect(() => {
        const today = new Date().toDateString();
        // Allow claim if never claimed OR last claim was NOT today
        setCanClaimDaily(!stats.lastDailyClaim || stats.lastDailyClaim !== today);
    }, [stats.lastDailyClaim]);

    const handleUnlock = () => {
        onRequestAd(() => {
            setAdUnlocked(true);
            alert("Roleta liberada para um giro!");
        });
    }

    const spinWheel = () => {
        if (!adUnlocked) return;
        if (stats.coins < betAmount) {
            alert("Moedas insuficientes!");
            return;
        }

        setIsSpinning(true);
        setResultMessage(null);
        setLastWin(null);

        // Deduct immediately
        const currentCoins = stats.coins - betAmount;
        onUpdateCoins(currentCoins);

        // Determine result
        const rand = Math.random();
        let cumulativeProb = 0;
        let selectedSegmentIndex = 0;

        for (let i = 0; i < SEGMENTS.length; i++) {
            cumulativeProb += SEGMENTS[i].probability;
            if (rand < cumulativeProb) {
                selectedSegmentIndex = i;
                break;
            }
        }

        // Each segment is 90 degrees.
        const segmentAngle = 360 / SEGMENTS.length; // 90
        const spins = 360 * (5 + Math.floor(Math.random() * 5)); // 5-10 spins
        // Target angle logic to land roughly in middle of segment
        const targetAngle = spins + (360 - (selectedSegmentIndex * segmentAngle)) - (segmentAngle / 2);

        setRotation(targetAngle);

        setTimeout(() => {
            setIsSpinning(false);
            setAdUnlocked(false); // Lock it again
            const segment = SEGMENTS[selectedSegmentIndex];
            
            if (segment.multiplier > 0) {
                playSuccessSound();
                const winnings = betAmount * segment.multiplier;
                onUpdateCoins(currentCoins + winnings);
                setLastWin(winnings);
                setResultMessage(`GANHOU! ${winnings} MOEDAS!`);
            } else {
                playFailureSound();
                setResultMessage("PERDEU! TENTE NOVAMENTE.");
            }
        }, 3000); 
    };

    const getCurrentStreakIndex = () => {
        // Simple modulo to keep it cycling 0-6 visually, even if streak > 7
        return stats.dailyStreak % 7;
    }

    return (
        <div className="px-6 pb-28 pt-4 space-y-6">
            
            {/* Daily Reward Section */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-3xl shadow-lg text-white relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2"><Calendar size={20}/> Recompensa Diária</h3>
                        <p className="text-xs opacity-80">Entre todo dia para ganhar mais!</p>
                    </div>
                    {canClaimDaily && (
                        <button 
                            onClick={() => onClaimDaily(DAILY_REWARDS[getCurrentStreakIndex()])}
                            className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-xl font-bold text-sm shadow-md animate-pulse hover:scale-105 transition-transform"
                        >
                            Resgatar
                        </button>
                    )}
                </div>
                
                <div className="flex justify-between gap-1 relative z-10">
                    {DAILY_REWARDS.map((amount, idx) => {
                        const currentIndex = getCurrentStreakIndex();
                        const isPast = idx < currentIndex;
                        const isCurrent = idx === currentIndex;
                        
                        return (
                            <div key={idx} className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border ${isCurrent ? 'bg-white/20 border-yellow-300' : 'bg-white/5 border-transparent'} ${isPast ? 'opacity-50' : ''}`}>
                                <span className="text-[10px] font-bold">Dia {idx + 1}</span>
                                {isPast ? <Check size={16} className="text-green-300"/> : (
                                    isCurrent && canClaimDaily ? <Coins size={16} className="text-yellow-300 animate-bounce"/> :
                                    <div className="text-xs font-bold">{amount}</div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                    <Dices size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold opacity-90 text-gray-800">Roleta da Sorte</h2>
                    <p className="text-xs text-gray-500">Multiplique suas moedas!</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
                 
                 {/* Wheel Container - Explicit dimensions for perfect circle */}
                 <div className="relative w-60 h-60 mb-8 flex-shrink-0">
                     {/* Pointer */}
                     <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                         <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-gray-800 drop-shadow-lg"></div>
                     </div>

                     {/* The Wheel */}
                     <div 
                        className="w-full h-full rounded-full border-8 border-gray-800 relative overflow-hidden transition-transform duration-[3000ms] cubic-bezier(0.2, 0.8, 0.2, 1) shadow-2xl"
                        style={{ 
                            transform: `rotate(${rotation}deg)`,
                            background: `conic-gradient(
                                ${SEGMENTS[0].color} 0deg 90deg, 
                                ${SEGMENTS[1].color} 90deg 180deg, 
                                ${SEGMENTS[2].color} 180deg 270deg, 
                                ${SEGMENTS[3].color} 270deg 360deg
                            )` 
                        }}
                     >
                         {/* Labels */}
                         {SEGMENTS.map((seg, i) => {
                             // Rotate container to angle, then translate text out
                             const rotation = i * 90 + 45; 
                             return (
                                 <div 
                                    key={i}
                                    className="absolute inset-0 flex justify-center"
                                    style={{ transform: `rotate(${rotation}deg)` }}
                                 >
                                     <span className="mt-6 font-black text-white text-3xl drop-shadow-md select-none">{seg.label}</span>
                                 </div>
                             )
                         })}
                         
                         {/* Center Cap */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-gray-200 z-10">
                             <Clover className="text-purple-600" />
                         </div>
                     </div>
                 </div>

                 {resultMessage ? (
                     <div className="text-center mb-6 animate-in zoom-in">
                         <h3 className={`text-2xl font-black ${lastWin ? 'text-green-600' : 'text-red-500'}`}>{resultMessage}</h3>
                         <button 
                            onClick={() => setResultMessage(null)}
                            className="mt-4 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto hover:scale-105 transition-transform"
                         >
                             <RotateCcw size={18} /> Jogar Novamente
                         </button>
                     </div>
                 ) : (
                    <div className="w-full max-w-xs space-y-6 z-10">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Sua Aposta</label>
                            <div className="flex items-center gap-4">
                                <button onClick={() => setBetAmount(Math.max(10, betAmount - 10))} className="w-12 h-12 rounded-2xl bg-gray-200 font-bold text-gray-600 hover:bg-gray-300 text-xl">-</button>
                                <div className="flex-grow text-center font-black text-3xl text-gray-800 flex items-center justify-center gap-1">
                                    <Coins size={24} className="text-yellow-500 fill-yellow-500"/> {betAmount}
                                </div>
                                <button onClick={() => setBetAmount(Math.min(stats.coins, betAmount + 10))} className="w-12 h-12 rounded-2xl bg-gray-200 font-bold text-gray-600 hover:bg-gray-300 text-xl">+</button>
                            </div>
                        </div>

                        {!adUnlocked ? (
                            <button 
                                onClick={handleUnlock}
                                className="w-full py-5 rounded-2xl font-black text-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 bg-yellow-500 text-white hover:bg-yellow-600"
                            >
                                <Video size={24} fill="currentColor"/> Liberar Roleta (Vídeo)
                            </button>
                        ) : (
                            <button 
                                onClick={spinWheel}
                                disabled={isSpinning || stats.coins < betAmount}
                                className={`w-full py-5 rounded-2xl font-black text-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2
                                ${isSpinning ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-purple-200'}
                                `}
                            >
                                {isSpinning ? 'Girando...' : 'GIRAR ROLETA'}
                            </button>
                        )}
                    </div>
                 )}
            </div>
        </div>
    );
};

export default Betting;