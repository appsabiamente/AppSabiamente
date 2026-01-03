
import React from 'react';
import { UserStats, LeaderboardEntry } from '../types';
import { Medal, Trophy, User, Shield, Crown, RefreshCw, Flame, MoreVertical } from 'lucide-react';

interface RankingProps {
  stats: UserStats;
  onExit: () => void;
  onRefresh: () => void;
}

const Ranking: React.FC<RankingProps> = ({ stats, onExit, onRefresh }) => {
  // Sort leaderboard by coins descending
  const sortedLeaderboard = [...stats.leaderboard].sort((a, b) => b.coins - a.coins);
  
  // Find User Position
  const userIndex = sortedLeaderboard.findIndex(e => e.isUser);
  const isUserLast = userIndex === sortedLeaderboard.length - 1;

  // Determine which items to render
  // If user is last (index 10/11), show Top 5, then a gap, then User with fake rank
  let itemsToRender: LeaderboardEntry[] = [];
  let showGap = false;

  if (isUserLast) {
      itemsToRender = sortedLeaderboard.slice(0, 5); // Top 5
      itemsToRender.push(sortedLeaderboard[userIndex]); // Add User at the end
      showGap = true;
  } else {
      itemsToRender = sortedLeaderboard;
  }

  const getRankDisplay = (entry: LeaderboardEntry, originalIndex: number) => {
      const realRank = originalIndex + 1;

      // Special display for user if they are "last" locally to simulate MMO scale
      if (entry.isUser && isUserLast) {
          return <span className="text-lg font-bold text-gray-500">12.403º</span>;
      }

      if (realRank === 1) return <Crown className="text-yellow-500 fill-yellow-500" size={24} />;
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
          <div className="overflow-y-auto h-full pb-4">
              {itemsToRender.map((entry, i) => {
                  const originalIndex = sortedLeaderboard.indexOf(entry);
                  const isGapRow = showGap && i === itemsToRender.length - 1; // User row when gap is active

                  return (
                    <React.Fragment key={entry.id}>
                        {isGapRow && (
                            <div className="flex flex-col items-center justify-center py-2 bg-gray-50/50 border-y border-gray-100">
                                <MoreVertical size={20} className="text-gray-300"/>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Milhares de jogadores</span>
                            </div>
                        )}
                        
                        <div 
                            className={`flex items-center gap-4 p-4 border-b border-gray-50 transition-colors ${entry.isUser ? 'bg-brand-primary/10 border-l-4 border-l-brand-primary' : 'hover:bg-gray-50'}`}
                        >
                            <div className="w-14 flex justify-center flex-shrink-0">
                                {getRankDisplay(entry, originalIndex)}
                            </div>
                            
                            <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${entry.isUser ? 'bg-white border-brand-primary' : 'bg-gray-100 border-white'}`}>
                                {entry.isUser ? <User className="text-brand-primary" size={20}/> : <Shield className="text-gray-400" size={20}/>}
                            </div>

                            <div className="flex-grow min-w-0">
                                <h4 className={`font-bold truncate ${entry.isUser ? 'text-brand-primary text-lg' : 'text-gray-700'}`}>
                                    {entry.name} {entry.isUser && '(Você)'}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-400 font-bold truncate">Mestre da Mente</span>
                                    {entry.streak > 0 && (
                                        <div className="flex items-center gap-1 bg-orange-100 px-2 py-0.5 rounded-md flex-shrink-0">
                                            <Flame size={12} className="text-orange-500 fill-orange-500" />
                                            <span className="text-[10px] font-bold text-orange-600">{entry.streak} dias</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                                <span className="block font-black text-gray-800 text-lg">{entry.coins}</span>
                                <span className="text-[10px] uppercase text-gray-400 font-bold">Moedas</span>
                            </div>
                        </div>
                    </React.Fragment>
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
