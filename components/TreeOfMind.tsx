
import React, { useState, useEffect } from 'react';
import { UserStats } from '../types';
import { Sparkles, Quote, CloudRain, Video } from 'lucide-react';

interface TreeOfMindProps {
  stats: UserStats;
  onWater?: () => void;
  canWater?: boolean;
  isRaining?: boolean;
}

const MOTIVATION = [
    "Exercitar a mente diariamente reduz o estresse.",
    "Jogar SábiaMente ajuda na neuroplasticidade.",
    "A constância é a chave para uma mente saudável.",
    "Dedique 10 minutos hoje ao seu cérebro.",
    "Cada novo desafio fortalece suas memórias.",
    "Você está investindo no seu bem-estar futuro.",
    "Aprender algo novo rejuvenesce a mente."
];

// 21 Stages
const STAGES = [
  "Semente", "Broto", "Plântula", "Muda", "Arbusto", 
  "Ramificação", "Folhagem", "Botão", "Floração", "Polinização",
  "Frutificação", "Maturação", "Colheita", "Poda", "Dormência",
  "Renovação", "Bosque", "Floresta", "Ecossistema", "Bioma", "Biosfera"
];

const RainEffect = () => (
    <div className="absolute inset-0 z-50 pointer-events-none rounded-3xl overflow-hidden">
        {[...Array(30)].map((_, i) => (
            <div
                key={i}
                className="absolute bg-blue-400 opacity-70 w-0.5 h-4 rounded-full"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: -20,
                    animation: `fall ${0.5 + Math.random()}s linear infinite`,
                    animationDelay: `${Math.random()}s`
                }}
            />
        ))}
        <style>{`
            @keyframes fall {
                to { transform: translateY(300px); opacity: 0; }
            }
        `}</style>
    </div>
);

const TreeOfMind: React.FC<TreeOfMindProps> = ({ stats, onWater, canWater, isRaining }) => {
  const level = Math.max(1, stats.level);
  const [message, setMessage] = useState(MOTIVATION[0]);

  useEffect(() => {
      const day = new Date().getDate();
      setMessage(MOTIVATION[day % MOTIVATION.length]);
  }, []);

  // Determine Growth Stage
  const stageIndex = Math.min(level - 1, STAGES.length - 1);
  const stageName = STAGES[stageIndex];

  // Visual Mapping Helper
  const getVisualType = (lvl: number) => {
      if(lvl <= 1) return 'SEED';
      if(lvl <= 2) return 'SPROUT';
      if(lvl <= 3) return 'PLANTULA'; // slightly bigger sprout
      if(lvl <= 4) return 'SAPLING';
      if(lvl <= 5) return 'BUSH';
      if(lvl <= 6) return 'BRANCHING';
      if(lvl <= 7) return 'FOLIAGE';
      if(lvl <= 8) return 'BUDS';
      if(lvl <= 9) return 'FLOWERING';
      if(lvl <= 10) return 'POLLINATION';
      if(lvl <= 11) return 'FRUIT_SMALL';
      if(lvl <= 12) return 'FRUIT_LARGE';
      if(lvl <= 13) return 'HARVEST';
      if(lvl <= 14) return 'PRUNED';
      if(lvl <= 15) return 'DORMANT';
      if(lvl <= 16) return 'RENEWAL';
      // 17-21 Forest stages
      return 'FOREST';
  };

  const visual = getVisualType(level);

  const renderTreeSvg = () => {
    switch (visual) {
        case 'SEED':
            return (
                <g transform="translate(100, 180)">
                    <circle cx="0" cy="0" r="8" fill="#5D4037" />
                    <path d="M0,0 Q-5,-10 0,-20 Q5,-10 0,0" fill="#81C784" />
                </g>
            );
        case 'SPROUT':
            return (
                <g transform="translate(100, 190)">
                     <path d="M0,0 Q0,-30 -10,-50" stroke="#5D4037" strokeWidth="4" fill="none" />
                     <path d="M0,0 Q0,-40 10,-60" stroke="#5D4037" strokeWidth="4" fill="none" />
                     <circle cx="-10" cy="-50" r="10" fill="#66BB6A" />
                     <circle cx="10" cy="-60" r="12" fill="#66BB6A" />
                </g>
            );
        case 'PLANTULA':
            return (
                <g transform="translate(100, 190)">
                     <path d="M0,0 Q0,-40 -15,-60" stroke="#5D4037" strokeWidth="5" fill="none" />
                     <path d="M0,0 Q5,-50 20,-70" stroke="#5D4037" strokeWidth="5" fill="none" />
                     <circle cx="-15" cy="-60" r="14" fill="#66BB6A" />
                     <circle cx="20" cy="-70" r="16" fill="#66BB6A" />
                     <circle cx="0" cy="-40" r="10" fill="#81C784" />
                </g>
            );
        case 'SAPLING':
            return (
                <g transform="translate(100, 200)">
                    <path d="M0,0 L0,-80" stroke="#5D4037" strokeWidth="12" strokeLinecap="round" />
                    <circle cx="0" cy="-90" r="40" fill="#4CAF50" />
                    <circle cx="-20" cy="-70" r="20" fill="#81C784" />
                    <circle cx="20" cy="-70" r="20" fill="#81C784" />
                </g>
            );
        case 'BUSH':
            return (
                <g transform="translate(100, 200)">
                    <path d="M0,0 L0,-60" stroke="#5D4037" strokeWidth="14" strokeLinecap="round" />
                    <circle cx="0" cy="-60" r="50" fill="#388E3C" />
                    <circle cx="-30" cy="-50" r="40" fill="#4CAF50" />
                    <circle cx="30" cy="-50" r="40" fill="#4CAF50" />
                    <circle cx="0" cy="-90" r="30" fill="#81C784" />
                </g>
            );
        case 'BRANCHING':
            return (
                <g transform="translate(100, 200)">
                    <path d="M0,0 Q0,-80 -20,-120" stroke="#4E342E" strokeWidth="16" fill="none"/>
                    <path d="M0,0 Q0,-70 20,-110" stroke="#4E342E" strokeWidth="16" fill="none"/>
                    <path d="M0,-40 L-40,-80" stroke="#4E342E" strokeWidth="10" fill="none"/>
                    <path d="M0,-50 L40,-90" stroke="#4E342E" strokeWidth="10" fill="none"/>
                    {/* Sparse leaves */}
                    <circle cx="-20" cy="-120" r="15" fill="#4CAF50" />
                    <circle cx="20" cy="-110" r="15" fill="#4CAF50" />
                    <circle cx="-40" cy="-80" r="15" fill="#4CAF50" />
                    <circle cx="40" cy="-90" r="15" fill="#4CAF50" />
                </g>
            );
        case 'FOLIAGE':
            return (
                <g transform="translate(100, 200)">
                    <path d="M0,0 L0,-120" stroke="#4E342E" strokeWidth="20" fill="none"/>
                    <circle cx="0" cy="-120" r="60" fill="#2E7D32" />
                    <circle cx="-40" cy="-100" r="50" fill="#388E3C" />
                    <circle cx="40" cy="-100" r="50" fill="#388E3C" />
                    <circle cx="0" cy="-160" r="40" fill="#43A047" />
                </g>
            );
        case 'BUDS':
            return (
                <g transform="translate(100, 200)">
                    <path d="M0,0 L0,-120" stroke="#4E342E" strokeWidth="20" fill="none"/>
                    <circle cx="0" cy="-120" r="60" fill="#2E7D32" />
                    <circle cx="-40" cy="-100" r="50" fill="#388E3C" />
                    <circle cx="40" cy="-100" r="50" fill="#388E3C" />
                    <circle cx="0" cy="-160" r="40" fill="#43A047" />
                    {/* Buds */}
                    <circle cx="-20" cy="-130" r="5" fill="#F48FB1" />
                    <circle cx="20" cy="-130" r="5" fill="#F48FB1" />
                    <circle cx="0" cy="-100" r="5" fill="#F48FB1" />
                    <circle cx="-30" cy="-90" r="5" fill="#F48FB1" />
                    <circle cx="30" cy="-90" r="5" fill="#F48FB1" />
                </g>
            );
        case 'FLOWERING':
        case 'POLLINATION':
            return (
                <g transform="translate(100, 200)">
                    <path d="M0,0 L0,-120" stroke="#4E342E" strokeWidth="20" fill="none"/>
                    <circle cx="0" cy="-120" r="60" fill="#2E7D32" />
                    <circle cx="-40" cy="-100" r="50" fill="#388E3C" />
                    <circle cx="40" cy="-100" r="50" fill="#388E3C" />
                    <circle cx="0" cy="-160" r="40" fill="#43A047" />
                    {/* Flowers */}
                    <circle cx="-20" cy="-130" r="8" fill="#F06292" className="animate-pulse" />
                    <circle cx="20" cy="-130" r="8" fill="#F06292" className="animate-pulse" />
                    <circle cx="0" cy="-100" r="8" fill="#F06292" className="animate-pulse" />
                    <circle cx="-35" cy="-90" r="8" fill="#F06292" className="animate-pulse" />
                    <circle cx="35" cy="-90" r="8" fill="#F06292" className="animate-pulse" />
                    {visual === 'POLLINATION' && (
                        <>
                            <circle cx="-50" cy="-150" r="2" fill="yellow" className="animate-ping" />
                            <circle cx="50" cy="-140" r="2" fill="yellow" className="animate-ping" style={{animationDelay: '0.5s'}} />
                        </>
                    )}
                </g>
            );
        case 'FRUIT_SMALL':
        case 'FRUIT_LARGE':
        case 'HARVEST':
            const fruitSize = visual === 'FRUIT_SMALL' ? 6 : 10;
            const fruitColor = visual === 'HARVEST' ? '#FFD700' : '#FF5252'; // Gold for harvest
            return (
                <g transform="translate(100, 200)">
                    <path d="M0,0 L0,-130" stroke="#4E342E" strokeWidth="22" fill="none"/>
                    <circle cx="0" cy="-130" r="65" fill="#1B5E20" />
                    <circle cx="-45" cy="-110" r="55" fill="#2E7D32" />
                    <circle cx="45" cy="-110" r="55" fill="#2E7D32" />
                    <circle cx="0" cy="-170" r="45" fill="#43A047" />
                    <circle cx="-25" cy="-140" r={fruitSize} fill={fruitColor} />
                    <circle cx="25" cy="-140" r={fruitSize} fill={fruitColor} />
                    <circle cx="0" cy="-110" r={fruitSize} fill={fruitColor} />
                    <circle cx="-40" cy="-100" r={fruitSize} fill={fruitColor} />
                    <circle cx="40" cy="-100" r={fruitSize} fill={fruitColor} />
                </g>
            );
        case 'PRUNED':
            return (
                <g transform="translate(100, 200)">
                    <path d="M0,0 L0,-100" stroke="#4E342E" strokeWidth="22" fill="none"/>
                    <circle cx="0" cy="-100" r="60" fill="#4CAF50" /> {/* Clean round shape */}
                </g>
            );
        case 'DORMANT':
            return (
                <g transform="translate(100, 200)">
                    <path d="M0,0 L0,-100" stroke="#5D4037" strokeWidth="22" fill="none"/>
                    <path d="M0,-60 L-40,-100" stroke="#5D4037" strokeWidth="12" fill="none"/>
                    <path d="M0,-70 L40,-110" stroke="#5D4037" strokeWidth="12" fill="none"/>
                    <path d="M-40,-100 L-60,-130" stroke="#5D4037" strokeWidth="8" fill="none"/>
                    <path d="M40,-110 L60,-140" stroke="#5D4037" strokeWidth="8" fill="none"/>
                    <path d="M0,-100 L0,-150" stroke="#5D4037" strokeWidth="12" fill="none"/>
                </g>
            );
        case 'RENEWAL':
            return (
                <g transform="translate(100, 200)">
                    <path d="M0,0 L0,-100" stroke="#5D4037" strokeWidth="22" fill="none"/>
                    <path d="M0,-60 L-40,-100" stroke="#5D4037" strokeWidth="12" fill="none"/>
                    <path d="M0,-70 L40,-110" stroke="#5D4037" strokeWidth="12" fill="none"/>
                    <path d="M0,-100 L0,-150" stroke="#5D4037" strokeWidth="12" fill="none"/>
                    {/* Tiny fresh leaves */}
                    <circle cx="-60" cy="-130" r="8" fill="#B9F6CA" />
                    <circle cx="60" cy="-140" r="8" fill="#B9F6CA" />
                    <circle cx="0" cy="-150" r="8" fill="#B9F6CA" />
                    <circle cx="-20" cy="-100" r="8" fill="#B9F6CA" />
                    <circle cx="20" cy="-110" r="8" fill="#B9F6CA" />
                </g>
            );
        case 'FOREST':
             return (
                <g transform="translate(100, 200)">
                    {/* Background Trees */}
                    <g transform="translate(-60, -20) scale(0.6)">
                        <path d="M0,0 L0,-80" stroke="#5D4037" strokeWidth="12" />
                        <circle cx="0" cy="-90" r="40" fill="#2E7D32" opacity="0.6"/>
                    </g>
                    <g transform="translate(60, -20) scale(0.6)">
                        <path d="M0,0 L0,-80" stroke="#5D4037" strokeWidth="12" />
                        <circle cx="0" cy="-90" r="40" fill="#2E7D32" opacity="0.6"/>
                    </g>

                    {/* Main Mystic Tree */}
                    {/* Glowing Aura */}
                    <circle cx="0" cy="-150" r="90" fill="#FFD700" fillOpacity="0.1" className="animate-pulse"/>
                    <path d="M0,0 C-15,-60 15,-120 0,-160" stroke="#3E2723" strokeWidth="25" fill="none"/>
                    <circle cx="0" cy="-160" r="75" fill="#004D40" />
                    <circle cx="-45" cy="-140" r="55" fill="#00695C" />
                    <circle cx="45" cy="-140" r="55" fill="#00695C" />
                    <circle cx="0" cy="-200" r="55" fill="#00796B" />
                    <circle cx="-20" cy="-160" r="10" fill="#FFD700" />
                    <circle cx="30" cy="-170" r="10" fill="#FFD700" />
                    <circle cx="0" cy="-130" r="10" fill="#FFD700" />
                </g>
             );
        default: return null;
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-8 px-4 w-full">
      <div className="bg-white/80 backdrop-blur-sm border border-brand-primary/20 p-4 rounded-2xl shadow-sm mb-6 max-w-sm text-center transform hover:scale-105 transition-transform duration-500">
          <p className="text-brand-primary font-medium text-sm italic flex items-center justify-center gap-2">
              <Quote size={16} className="rotate-180"/> {message} <Quote size={16}/>
          </p>
      </div>

      <div className="flex flex-col items-center gap-1 mb-4 z-10">
          <h3 className="text-2xl font-black text-gray-800 tracking-tight">Jardim da Mente</h3>
          <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Nível {stats.level} • {stageName}
          </span>
      </div>
      
      <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-green-200/50 to-transparent rounded-full blur-3xl"></div>
          
          {/* Rain Effect Layer - Positioned over the tree container */}
          {isRaining && <RainEffect />}

          <svg width="240" height="240" viewBox="0 0 200 220" className="drop-shadow-2xl z-10 transition-all duration-1000 relative">
            {/* Ground */}
            <ellipse cx="100" cy="210" rx="80" ry="10" fill="#8D6E63" opacity="0.8" />
            {renderTreeSvg()}
          </svg>

          {/* Floating particles if high level */}
          {level > 5 && (
            <>
                <Sparkles size={16} className="absolute top-10 left-10 text-yellow-400 animate-bounce delay-100" />
                <Sparkles size={20} className="absolute top-20 right-12 text-yellow-400 animate-bounce delay-700" />
            </>
          )}

          {/* Water Button - Only shows if allowed */}
          {canWater && onWater && (
              <button 
                onClick={onWater}
                className="absolute bottom-4 -right-2 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg border-4 border-white animate-bounce z-20 flex items-center gap-1"
              >
                  <CloudRain size={20} fill="currentColor"/>
                  <span className="text-[10px] font-bold">+XP</span>
              </button>
          )}
      </div>
      
      <div className="w-full max-w-xs mt-6">
        <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
            <span>XP Atual</span>
            <span>{stats.experience}/100</span>
        </div>
        <div className="w-full bg-white rounded-full h-5 shadow-inner overflow-hidden border border-gray-100">
            <div 
                className="bg-gradient-to-r from-brand-secondary to-green-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                style={{ width: `${Math.max(stats.experience, 5)}%` }}
            >
            </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">Jogue para ver sua árvore crescer</p>
      </div>
    </div>
  );
};

export default TreeOfMind;
