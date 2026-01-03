
import React from 'react';
import { UserStats, LeaderboardEntry } from '../types';
import { Medal, Trophy, User, Shield, Crown, Flame } from 'lucide-react';

interface RankingProps {
  stats: UserStats;
  onExit: () => void;
  onRefresh: () => void;
}

const Ranking: React.FC<RankingProps> = ({ stats, onExit, onRefresh }) => {
  // Ordena o ranking por moedas (do maior para o menor)
  const sortedLeaderboard = [...stats.leaderboard].sort((a, b) => b.coins - a.coins);

  const getRankDisplay = (entry: LeaderboardEntry, index: number) => {
      const realRank = index + 1;

      if (realRank === 1) return <Crown className="text-yellow-500 fill-yellow-500 animate-bounce" size={24} />;
      if (realRank === 2) return <Medal className="text-gray-400 fill-gray-400" size={24} />;
      if (realRank === 3) return <Medal className="text-orange-700 fill-orange-700" size={24} />;
      
      return <span className="text-lg font-bold text-gray-500">{realRank}º</span>;
  };

  return (
    <div className="px-6 pb-28 pt-4 h-full flex flex-col">
       <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
                    <Trophy size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold opacity-90 text-gray-800">Ranking Global</h2>
                    <p className="text-xs text-gray-500">Os mais sábios do mundo</p>
                </div>
            </div>
       </div>

       <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden flex-grow flex flex-col">
          {/* Cabeçalho da Tabela */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <div className="w-14 text-center">Pos</div>
              <div className="flex-grow">Mestre</div>
              <div className="text-right">Moedas</div>
          </div>

          <div className="overflow-y-auto h-full pb-4 scroll-smooth">
              {sortedLeaderboard.map((entry, index) => {
                  return (
                    <div 
                        key={entry.id}
                        className={`flex items-center gap-4 p-4 border-b border-gray-50 transition-all ${entry.isUser ? 'bg-brand-primary/5 border-l-4 border-l-brand-primary shadow-inner' : 'hover:bg-gray-50'}`}
                    >
                        <div className="w-14 flex justify-center flex-shrink-0 font-mono">
                            {getRankDisplay(entry, index)}
                        </div>
                        
                        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-2 shadow-sm ${entry.isUser ? 'bg-white border-brand-primary text-brand-primary' : 'bg-gray-100 border-white text-gray-400'}`}>
                            {entry.isUser ? <User size={20}/> : <Shield size={18}/>}
                        </div>

                        <div className="flex-grow min-w-0">
                            <h4 className={`font-bold truncate leading-tight ${entry.isUser ? 'text-brand-primary text-base' : 'text-gray-700 text-sm'}`}>
                                {entry.name} {entry.isUser && '(Você)'}
                            </h4>
                            {entry.streak > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                    <Flame size={10} className="text-orange-500 fill-orange-500" />
                                    <span className="text-[10px] font-bold text-orange-600">{entry.streak} dias</span>
                                </div>
                            )}
                        </div>

                        <div className="text-right flex-shrink-0">
                            <span className={`block font-black text-lg ${entry.isUser ? 'text-brand-primary' : 'text-gray-800'}`}>{entry.coins}</span>
                        </div>
                    </div>
                  );
              })}
          </div>
       </div>
       
       <div className="mt-4 text-center">
           <p className="text-sm text-gray-500 italic">Jogue mais para subir no ranking!</p>
       </div>
    </div>
  );
};

export default Ranking;
