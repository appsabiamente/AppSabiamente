
import React from 'react';
import { UserStats, LeaderboardEntry } from '../types';
import { Medal, Trophy, User, Shield, Crown, Flame, MoreVertical } from 'lucide-react';

interface RankingProps {
  stats: UserStats;
  onExit: () => void;
  onRefresh: () => void;
}

const Ranking: React.FC<RankingProps> = ({ stats, onExit, onRefresh }) => {
  // Ordena o ranking por moedas (do maior para o menor)
  const sortedLeaderboard = [...stats.leaderboard].sort((a, b) => b.coins - a.coins);
  
  // Encontrar índice do usuário
  const userIndex = sortedLeaderboard.findIndex(e => e.isUser);
  const userRank = userIndex + 1;

  // Lógica de Visualização "Janela"
  // Mostra Top 3 + Vizinhança do Usuário + Últimos (se fizer sentido, mas Top + Vizinhos é o padrão UX)
  let displayItems: (LeaderboardEntry | 'SEPARATOR')[] = [];

  // Adiciona Top 3
  displayItems.push(...sortedLeaderboard.slice(0, 3));

  // Se o usuário estiver longe do Top 3, adiciona separador
  if (userIndex > 4) {
      displayItems.push('SEPARATOR');
  }

  // Determina a "vizinhança" do usuário (ex: 2 acima, 2 abaixo)
  const startNeighbor = Math.max(3, userIndex - 2);
  const endNeighbor = Math.min(sortedLeaderboard.length, userIndex + 3);
  
  // Adiciona vizinhos se não sobrepor o Top 3
  if (startNeighbor < endNeighbor) {
      displayItems.push(...sortedLeaderboard.slice(startNeighbor, endNeighbor));
  }

  // Se ainda houver muitos abaixo, adiciona separador final e o último colocado para dar escala
  if (endNeighbor < sortedLeaderboard.length - 1) {
      displayItems.push('SEPARATOR');
      displayItems.push(sortedLeaderboard[sortedLeaderboard.length - 1]);
  }

  const getRankDisplay = (entry: LeaderboardEntry | 'SEPARATOR', index: number, realRank?: number) => {
      if (entry === 'SEPARATOR') return null;
      
      const rank = realRank || 999;

      if (rank === 1) return <Crown className="text-yellow-500 fill-yellow-500 animate-bounce" size={24} />;
      if (rank === 2) return <Medal className="text-gray-400 fill-gray-400" size={24} />;
      if (rank === 3) return <Medal className="text-orange-700 fill-orange-700" size={24} />;
      
      return <span className={`text-lg font-bold ${entry.isUser ? 'text-brand-primary' : 'text-gray-400'}`}>{rank}º</span>;
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
                    <p className="text-xs text-gray-500">{sortedLeaderboard.length.toLocaleString()} Jogadores</p>
                </div>
            </div>
            <div className="bg-brand-primary/10 px-3 py-1 rounded-full">
                <span className="text-xs font-bold text-brand-primary">Sua Posição: {userRank}º</span>
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
              {displayItems.map((entry, i) => {
                  if (entry === 'SEPARATOR') {
                      return (
                          <div key={`sep-${i}`} className="flex justify-center p-2 opacity-30">
                              <MoreVertical size={20}/>
                          </div>
                      )
                  }

                  // Find real rank in original array
                  const realIndex = sortedLeaderboard.findIndex(e => e.id === entry.id);
                  const realRank = realIndex + 1;

                  return (
                    <div 
                        key={entry.id}
                        className={`flex items-center gap-4 p-4 border-b border-gray-50 transition-all ${entry.isUser ? 'bg-brand-primary/5 border-l-4 border-l-brand-primary shadow-inner py-6' : 'hover:bg-gray-50'}`}
                    >
                        <div className="w-14 flex justify-center flex-shrink-0 font-mono">
                            {getRankDisplay(entry, i, realRank)}
                        </div>
                        
                        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-2 shadow-sm ${entry.isUser ? 'bg-white border-brand-primary text-brand-primary' : 'bg-gray-100 border-white text-gray-400'}`}>
                            {entry.isUser ? <User size={20}/> : <Shield size={18}/>}
                        </div>

                        <div className="flex-grow min-w-0">
                            <h4 className={`font-bold truncate leading-tight ${entry.isUser ? 'text-brand-primary text-base' : 'text-gray-700 text-sm'}`}>
                                {entry.isUser ? (stats.userName || 'Você') : entry.name}
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
