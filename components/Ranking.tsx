
import React from 'react';
import { UserStats, LeaderboardEntry } from '../types';
import { Medal, Trophy, User, Shield, Crown, RefreshCw, Flame } from 'lucide-react';

interface RankingProps {
  stats: UserStats;
  onExit: () => void;
  onRefresh: () => void;
}

const Ranking: React.FC<RankingProps> = ({ stats, onExit, onRefresh }) => {
  // Safety check: ensure leaderboard is an array before spreading
  const safeLeaderboard = Array.isArray(stats.leaderboard) ? stats.leaderboard : [];
  
  // Sort leaderboard by coins descending, handling potential undefined coins
  const sortedLeaderboard = [...safeLeaderboard].sort((a, b) => (b.coins || 0) - (a.coins || 0));

  const getRankIcon = (index: number) => {
      if (index === 0) return <Crown className="text-yellow-500 fill-yellow-500" size={24} />;
      if (index === 1) return <Medal className="text-gray-400 fill-gray-400" size={24} />;
      if (index === 2) return <Medal className="text-orange-700 fill-orange-700" size={24} />;
      return <span className="text-lg font-bold text-gray-500">{index + 1}º</span>;
  };

  return (
    <div className="px-6 pb-28 pt-4 h-full flex flex-col">
       <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
                    <Trophy size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold opacity-90 text-gray-800">Ranking</h2>
                    <p className="text-xs text-gray-500">Os mais sábios</p>
                </div>
            </div>
            {/* Refresh Button Removed */}
       </div>

       <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden flex-grow">
          <div className="overflow-y-auto h-full pb-4">
              {sortedLeaderboard.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                      <p>Ranking carregando...</p>
                  </div>
              ) : (
                  sortedLeaderboard.map((entry, index) => {
                      if (!entry) return null; // Skip invalid entries
                      return (
                          <div 
                            key={entry.id || index} 
                            className={`flex items-center gap-4 p-4 border-b border-gray-50 transition-colors ${entry.isUser ? 'bg-brand-primary/10' : 'hover:bg-gray-50'}`}
                          >
                              <div className="w-8 flex justify-center">
                                  {getRankIcon(index)}
                              </div>
                              
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${entry.isUser ? 'bg-white border-brand-primary' : 'bg-gray-100 border-white'}`}>
                                  {entry.isUser ? <User className="text-brand-primary" size={20}/> : <Shield className="text-gray-400" size={20}/>}
                              </div>

                              <div className="flex-grow">
                                  <h4 className={`font-bold ${entry.isUser ? 'text-brand-primary text-lg' : 'text-gray-700'}`}>
                                      {entry.name} {entry.isUser && '(Você)'}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-gray-400 font-bold">Mestre da Mente</span>
                                      <div className="flex items-center gap-1 bg-orange-100 px-2 py-0.5 rounded-md">
                                          <Flame size={12} className="text-orange-500 fill-orange-500" />
                                          <span className="text-[10px] font-bold text-orange-600">{entry.streak || 0} dias</span>
                                      </div>
                                  </div>
                              </div>

                              <div className="text-right">
                                  <span className="block font-black text-gray-800 text-lg">{entry.coins || 0}</span>
                                  <span className="text-[10px] uppercase text-gray-400 font-bold">Moedas</span>
                              </div>
                          </div>
                      );
                  })
              )}
          </div>
       </div>
       
       <div className="mt-4 text-center">
           <p className="text-sm text-gray-500 italic">Jogue mais para subir no ranking!</p>
       </div>
    </div>
  );
};

export default Ranking;
