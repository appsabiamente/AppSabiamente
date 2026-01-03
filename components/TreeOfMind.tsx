
import React, { useState, useEffect } from 'react';
import { UserStats } from '../types';
import { Sparkles, Quote, CloudRain, Video } from 'lucide-react';

interface TreeOfMindProps {
  stats: UserStats;
  onWater?: () => void;
  canWater?: boolean;
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

const TreeOfMind: React.FC<TreeOfMindProps> = ({ stats, onWater, canWater }) => {
  const level = stats.level;
  const [message, setMessage] = useState(MOTIVATION[0]);

  useEffect(() => {
      // Pick a message based on day of month to correspond somewhat to 'daily' feel
      const day = new Date().getDate();
      setMessage(MOTIVATION[day % MOTIVATION.length]);
  }, []);

  // Determine Growth Stage
  let stageName = 'SEMENTE';
  let stageKey = 'SEED';

  if (level >= 2) { stageKey = 'SPROUT'; stageName = 'BROTO'; }
  if (level >= 5) { stageKey = 'SAPLING'; stageName = 'MUDA'; }
  if (level >= 10) { stageKey = 'TREE'; stageName = 'ÁRVORE'; }
  if (level >= 20) { stageKey = 'BLOOM'; stageName = 'FLORESCER'; }
  if (level >= 30) { stageKey = 'MYSTIC'; stageName = 'MÍSTICA'; }

  const renderTreeSvg = () => {
    switch (stageKey) {
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
        case 'SAPLING':
            return (
                <g transform="translate(100, 200)">
                    <path d="M0,0 L0,-80" stroke="#5D4037" strokeWidth="12" strokeLinecap="round" />
                    <circle cx="0" cy="-90" r="40" fill="#4CAF50" />
                    <circle cx="-20" cy="-70" r="20" fill="#81C784" />
                    <circle cx="20" cy="-70" r="20" fill="#81C784" />
                </g>
            );
        case 'TREE':
            return (
                <g transform="translate(100, 200)">
                    <path d="M0,0 Q0,-100 -20,-140" stroke="#4E342E" strokeWidth="18" fill="none"/>
                    <path d="M0,0 Q0,-90 20,-130" stroke="#4E342E" strokeWidth="18" fill="none"/>
                    <circle cx="-20" cy="-140" r="50" fill="#388E3C" />
                    <circle cx="20" cy="-130" r="55" fill="#2E7D32" />
                    <circle cx="0" cy="-160" r="40" fill="#4CAF50" />
                </g>
            );
        case 'BLOOM':
            return (
                <g transform="translate(100, 200)">
                    {/* Trunk */}
                    <path d="M0,0 C-10,-50 10,-100 0,-150" stroke="#3E2723" strokeWidth="22" fill="none"/>
                    {/* Canopy */}
                    <circle cx="0" cy="-150" r="70" fill="#1B5E20" />
                    <circle cx="-40" cy="-130" r="50" fill="#2E7D32" />
                    <circle cx="40" cy="-130" r="50" fill="#2E7D32" />
                    <circle cx="0" cy="-180" r="50" fill="#43A047" />
                    {/* Flowers */}
                    <circle cx="-20" cy="-150" r="8" fill="#F06292" className="animate-pulse" />
                    <circle cx="30" cy="-160" r="8" fill="#F06292" className="animate-pulse" />
                    <circle cx="10" cy="-120" r="8" fill="#F06292" className="animate-pulse" />
                    <circle cx="-30" cy="-180" r="8" fill="#F06292" className="animate-pulse" />
                </g>
            );
        case 'MYSTIC':
             return (
                <g transform="translate(100, 200)">
                    {/* Glowing Aura */}
                    <circle cx="0" cy="-150" r="90" fill="#FFD700" fillOpacity="0.2" className="animate-pulse"/>
                    {/* Trunk */}
                    <path d="M0,0 C-15,-60 15,-120 0,-160" stroke="#3E2723" strokeWidth="25" fill="none"/>
                    {/* Canopy */}
                    <circle cx="0" cy="-160" r="75" fill="#004D40" />
                    <circle cx="-45" cy="-140" r="55" fill="#00695C" />
                    <circle cx="45" cy="-140" r="55" fill="#00695C" />
                    <circle cx="0" cy="-200" r="55" fill="#00796B" />
                    {/* Golden Fruits */}
                    <circle cx="-20" cy="-160" r="10" fill="#FFD700" />
                    <circle cx="30" cy="-170" r="10" fill="#FFD700" />
                    <circle cx="0" cy="-130" r="10" fill="#FFD700" />
                    <circle cx="-35" cy="-190" r="10" fill="#FFD700" />
                    <path d="M-50, -50 L50,-50" stroke="none" fill="none">
                         <animateMotion dur="10s" repeatCount="indefinite" path="M0,0 Q20,-20 40,0 T80,0" />
                    </path>
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
          
          <svg width="240" height="240" viewBox="0 0 200 220" className="drop-shadow-2xl z-10 transition-all duration-1000">
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
