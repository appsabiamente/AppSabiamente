
import React, { useState, useEffect } from 'react';
import { UserStats } from '../types';
import { Clover, Coins, Dices, RotateCcw, Video, Calendar, Check, Lock, Ticket, Timer, Gift } from 'lucide-react';
import { playSuccessSound, playFailureSound, playCelebrationSound } from '../services/audioService';
import { triggerFireworks } from '../services/celebrationService';
import DailyChallenge from './DailyChallenge';

interface BettingProps {
    stats: UserStats;
    onUpdateStats: (newStats: Partial<UserStats>) => void;
    onExit: () => void;
    onRequestAd: (cb: () => void) => void;
    onClaimDaily: (amount: number) => void;
    onWinDaily: (amount: number) => void;
}

const SEGMENTS = [
    { label: '0x', color: '#EF4444', multiplier: 0, probability: 0.55 }, // Red
    { label: '2x', color: '#3B82F6', multiplier: 2, probability: 0.30 }, // Blue
    { label: '5x', color: '#10B981', multiplier: 5, probability: 0.10 }, // Green
    { label: '10x', color: '#F59E0B', multiplier: 10, probability: 0.05 }, // Yellow
];

const DAILY_REWARDS = [10, 20, 30, 50, 80, 100, 500];

const RAFFLE_JACKPOTS = [
    { name: "Ouro", amount: 5000, chance: 0.001 },   
    { name: "Prata", amount: 2500, chance: 0.005 }, 
    { name: "Bronze", amount: 1000, chance: 0.010 }  
];

const Betting: React.FC<BettingProps> = ({ stats, onUpdateStats, onRequestAd, onClaimDaily, onWinDaily }) => {
    const [betAmount, setBetAmount] = useState<number>(10);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [resultMessage, setResultMessage] = useState<string | null>(null);
    const [lastWin, setLastWin] = useState<number | null>(null);
    const [adUnlocked, setAdUnlocked] = useState(false);
    const [canClaimDaily, setCanClaimDaily] = useState(false);
    
    const [timeLeftRaffle, setTimeLeftRaffle] = useState("");
    const [isCheckingDraw, setIsCheckingDraw] = useState(false);

    useEffect(() => {
        const today = new Date().toDateString();
        setCanClaimDaily(!stats.lastDailyClaim || stats.lastDailyClaim !== today);
        checkRaffleStatus();
        const t = setInterval(() => {
            calculateRaffleTimer();
        }, 1000);
        return () => clearInterval(t);
    }, [stats.lastDailyClaim, stats.nextRaffleDate]);

    const calculateRaffleTimer = () => {
        const now = new Date().getTime();
        const target = new Date(stats.nextRaffleDate).getTime();
        const diff = target - now;

        if (diff <= 0) {
            checkRaffleStatus(); 
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeLeftRaffle(`${days}d ${hours}h ${minutes}m`);
    };

    const getNextSundayDate = () => {
        const d = new Date();
        d.setDate(d.getDate() + (7 - d.getDay()) % 7);
        d.setHours(23, 59, 59, 0);
        if (d.getTime() <= new Date().getTime()) {
             d.setDate(d.getDate() + 7);
        }
        return d.toISOString();
    }

    const checkRaffleStatus = () => {
        const now = new Date().getTime();
        const target = new Date(stats.nextRaffleDate).getTime();

        if (now > target) {
            setIsCheckingDraw(true);
            setTimeout(() => {
                let winAmount = 0;
                let prizeName = "";
                let didWin = false;

                for (let i = 0; i < stats.weeklyTickets; i++) {
                    const roll = Math.random();
                    if (roll < RAFFLE_JACKPOTS[0].chance) { winAmount = Math.max(winAmount, RAFFLE_JACKPOTS[0].amount); prizeName="Ouro"; didWin=true; }
                    else if (roll < RAFFLE_JACKPOTS[1].chance) { winAmount = Math.max(winAmount, RAFFLE_JACKPOTS[1].amount); prizeName = prizeName === "Ouro" ? "Ouro" : "Prata"; didWin=true;}
                    else if (roll < RAFFLE_JACKPOTS[2].chance) { winAmount = Math.max(winAmount, RAFFLE_JACKPOTS[2].amount); prizeName = (prizeName === "Ouro" || prizeName === "Prata") ? prizeName : "Bronze"; didWin=true;}
                }

                if (didWin) {
                    playSuccessSound();
                    triggerFireworks();
                    alert(`PARABÉNS! SEU CUPOM FOI SORTEADO!\n\nPrêmio Jackpot ${prizeName}: +${winAmount} Moedas!`);
                    onUpdateStats({
                        coins: stats.coins + winAmount,
                        weeklyTickets: 0,
                        raffleWins: stats.raffleWins + 1,
                        nextRaffleDate: getNextSundayDate()
                    });
                } else {
                    if (stats.weeklyTickets > 0) {
                        alert(`O sorteio aconteceu, mas seus ${stats.weeklyTickets} cupons não foram premiados desta vez.\nBoa sorte na próxima semana!`);
                    }
                    onUpdateStats({
                        weeklyTickets: 0,
                        nextRaffleDate: getNextSundayDate()
                    });
                }
                setIsCheckingDraw(false);
            }, 2000);
        }
    };

    const handleBuyTicket = () => {
        onRequestAd(() => {
            onUpdateStats({ weeklyTickets: stats.weeklyTickets + 1 });
            alert("Cupom Adicionado! Boa sorte no sorteio semanal.");
        });
    };

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

        const currentCoins = stats.coins - betAmount;
        onUpdateStats({ coins: currentCoins });

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

        const segmentArc = 360 / SEGMENTS.length; // 90 degrees per segment
        
        // We want the SELECTED segment to end up at the TOP (0 degrees).
        // Segment 0 is rendered from 0 to 90deg. Center is 45deg.
        // To bring center (45) to top (0), we need to rotate BACKWARDS by 45deg (or forward by 315).
        // Target Rotation Angle = - (Index * 90 + 45).
        // Adding 360 * 5 ensures multiple spins.
        
        const index = selectedSegmentIndex;
        const offsetToCenter = 45; 
        const targetAngle = -(index * segmentArc + offsetToCenter); 
        
        // Add random jitter within the segment (+/- 40deg)
        const jitter = (Math.random() * 80) - 40;
        
        // Calculate the total rotation to add to current rotation state
        // We want final position % 360 to approximate targetAngle % 360.
        // But we want to spin forward (positive addition).
        
        const spins = 5;
        const currentMod = rotation % 360;
        const dist = (targetAngle - currentMod + jitter); 
        // Normalize dist to be positive for forward spin + full spins
        const forwardDist = ((dist % 360) + 360) % 360 + (360 * spins);
        
        setRotation(prev => prev + forwardDist);

        setTimeout(() => {
            setIsSpinning(false);
            setAdUnlocked(false); 
            const segment = SEGMENTS[selectedSegmentIndex];
            
            if (segment.multiplier > 0) {
                playCelebrationSound();
                triggerFireworks();
                const winnings = betAmount * segment.multiplier;
                onUpdateStats({ coins: currentCoins + winnings });
                setLastWin(winnings);
                setResultMessage(`GANHOU! ${winnings} MOEDAS!`);
            } else {
                playFailureSound();
                setResultMessage("PERDEU! TENTE NOVAMENTE.");
            }
        }, 3000); 
    };

    const getCurrentStreakIndex = () => {
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

            <DailyChallenge 
                stats={stats} 
                onWin={onWinDaily} 
                onRequestAd={onRequestAd} 
            />

            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-6 rounded-3xl shadow-lg text-white relative overflow-hidden border-2 border-yellow-300">
                <div className="absolute top-0 right-0 p-4 opacity-20"><Gift size={80}/></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-black text-2xl flex items-center gap-2 text-white drop-shadow-md">
                                <Ticket size={24} className="fill-white text-yellow-600"/> Mega Sorteio
                            </h3>
                            <p className="text-yellow-100 text-sm font-medium">Sorteio automático todo domingo!</p>
                        </div>
                        <div className="text-right bg-black/20 p-2 rounded-lg backdrop-blur-sm">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-200 flex items-center gap-1 justify-end"><Timer size={10}/> Sorteio em</p>
                            <p className="font-mono font-bold text-lg leading-none">{isCheckingDraw ? 'SORTEANDO...' : timeLeftRaffle}</p>
                        </div>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-4 mb-4 backdrop-blur-sm border border-white/20">
                        <div className="flex justify-between items-center text-sm mb-2">
                            <span>🏆 Jackpot Ouro</span>
                            <span className="font-bold text-yellow-200">5.000 Moedas</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mb-2">
                            <span>🥈 Jackpot Prata</span>
                            <span className="font-bold text-gray-200">2.500 Moedas</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span>🥉 Jackpot Bronze</span>
                            <span className="font-bold text-orange-200">1.000 Moedas</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div className="bg-white text-orange-600 px-4 py-3 rounded-2xl font-bold flex flex-col items-center min-w-[80px]">
                            <span className="text-xs uppercase text-gray-400">Seus Cupons</span>
                            <span className="text-2xl font-black">{stats.weeklyTickets}</span>
                        </div>
                        <button 
                            onClick={handleBuyTicket}
                            className="flex-grow bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                        >
                            <Video size={20}/> Pegar Cupom
                        </button>
                    </div>
                    <p className="text-center text-[10px] mt-3 opacity-70">Quanto mais cupons, maior a chance. Sem limite de compra!</p>
                </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
                <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                    <Dices size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold opacity-90 text-gray-800">Roleta da Sorte</h2>
                    <p className="text-xs text-gray-500">Multiplique suas moedas!</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
                 
                 <div className="relative w-60 h-60 mb-8 flex-shrink-0">
                     <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                         <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-gray-800 drop-shadow-lg"></div>
                     </div>

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
                         {SEGMENTS.map((seg, i) => {
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
