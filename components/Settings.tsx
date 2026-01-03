
import React, { useState } from 'react';
import { Volume2, VolumeX, Info, Bell, BellOff, Mail, BarChart2, Trash2, X, Coins, Flame, Star, Zap, User, Globe, Ticket, Calendar, AlertTriangle } from 'lucide-react';
import { UserStats, Language } from '../types';

interface SettingsProps {
    stats: UserStats;
    onToggleSound: () => void;
    onToggleNotifications: () => void;
    onResetProgress: () => void;
    onExit: () => void;
    onLanguageChange: (lang: Language) => void;
}

const Settings: React.FC<SettingsProps> = ({ stats, onToggleSound, onToggleNotifications, onResetProgress, onExit, onLanguageChange }) => {
    const [showStats, setShowStats] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const handleSupport = () => {
        window.location.href = "mailto:appsabiamente@gmail.com?subject=Suporte SábiaMente";
    };

    return (
        <div className="px-6 pb-28 pt-4 relative">
            <h2 className="text-2xl font-bold mb-6 opacity-90 text-gray-800">Configurações</h2>
            
            <div className="space-y-6">
                {/* Sound */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stats.soundEnabled ? 'bg-brand-primary/10 text-brand-primary' : 'bg-gray-100 text-gray-400'}`}>
                            {stats.soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Efeitos Sonoros</h3>
                            <p className="text-xs text-gray-500">{stats.soundEnabled ? 'Ativado' : 'Desativado'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onToggleSound}
                        className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${stats.soundEnabled ? 'bg-brand-primary' : 'bg-gray-300'}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${stats.soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                {/* Notifications */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stats.notificationsEnabled ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                            {stats.notificationsEnabled ? <Bell size={24} /> : <BellOff size={24} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Lembrete Diário</h3>
                            <p className="text-xs text-gray-500">{stats.notificationsEnabled ? 'Ativado' : 'Desativado'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onToggleNotifications}
                        className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${stats.notificationsEnabled ? 'bg-orange-500' : 'bg-gray-300'}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${stats.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                {/* New Feature Buttons */}
                <div className="grid grid-cols-2 gap-4">
                     <button 
                        onClick={handleSupport}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
                     >
                        <Mail size={24} className="text-blue-500"/>
                        <span className="font-bold text-gray-700 text-sm">Suporte</span>
                     </button>

                     <button 
                        onClick={() => setShowStats(true)}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:bg-purple-50 transition-colors"
                     >
                        <BarChart2 size={24} className="text-purple-500"/>
                        <span className="font-bold text-gray-700 text-sm">Estatísticas</span>
                     </button>
                </div>

                {/* Info */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold">
                        <Info size={20} />
                        <h3>Sobre o App</h3>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span>Versão</span>
                            <span className="font-mono bg-gray-100 px-2 rounded">v1.6.0</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span>Desenvolvedor</span>
                            <span>SábiaMente Team</span>
                        </div>
                        <p className="text-xs text-gray-400 pt-2 text-center">
                            Feito com carinho para exercitar sua mente.
                        </p>
                    </div>
                </div>

                {/* Danger Zone */}
                <button 
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full bg-red-50 p-4 rounded-2xl border border-red-100 text-red-600 font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                >
                    <Trash2 size={20} />
                    Apagar Tudo e Recomeçar
                </button>
            </div>

            {/* RESET CONFIRMATION MODAL */}
            {showResetConfirm && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl relative text-center">
                        <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <AlertTriangle size={32} className="text-red-600" />
                        </div>
                        
                        <h3 className="text-2xl font-black text-gray-800 mb-2">Tem certeza?</h3>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Isso apagará <b className="text-red-500">permanentemente</b> suas moedas, estatísticas e todo o seu progresso no app. Essa ação não pode ser desfeita.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => {
                                    onResetProgress();
                                    setShowResetConfirm(false);
                                }}
                                className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                            >
                                Sim, Apagar Tudo
                            </button>
                            <button 
                                onClick={() => setShowResetConfirm(false)}
                                className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* STATISTICS MODAL */}
            {showStats && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
                        <button onClick={() => setShowStats(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                            <X size={20} className="text-gray-600"/>
                        </button>
                        
                        <h3 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
                            <BarChart2 className="text-purple-500" />
                            Seus Dados
                        </h3>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
                                <span className="text-gray-500 text-xs font-bold uppercase">Nível</span>
                                <span className="text-2xl font-black text-brand-primary">{stats.level}</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
                                <span className="text-gray-500 text-xs font-bold uppercase">Moedas</span>
                                <span className="text-2xl font-black text-yellow-500 flex items-center gap-1"><Coins size={16}/> {stats.coins}</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
                                <span className="text-gray-500 text-xs font-bold uppercase">Dias Seguidos</span>
                                <span className="text-2xl font-black text-orange-500 flex items-center gap-1"><Flame size={16}/> {stats.streak}</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
                                <span className="text-gray-500 text-xs font-bold uppercase">Jogos Total</span>
                                <span className="text-2xl font-black text-gray-800">{stats.totalGamesPlayed}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                             <div className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                 <span className="text-sm font-bold text-gray-600 flex items-center gap-2"><User size={16}/> Avatares</span>
                                 <span className="font-mono font-bold bg-green-100 text-green-700 px-2 py-1 rounded">{stats.unlockedAvatars.length}</span>
                             </div>
                             <div className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                 <span className="text-sm font-bold text-gray-600 flex items-center gap-2"><Star size={16}/> Conquistas</span>
                                 <span className="font-mono font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded">{stats.unlockedAchievements.length}</span>
                             </div>
                             <div className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                 <span className="text-sm font-bold text-gray-600 flex items-center gap-2"><Ticket size={16}/> Mega Sorteios</span>
                                 <span className="font-mono font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded">{stats.raffleWins || 0}</span>
                             </div>
                             {/* Daily Challenge Stat */}
                             <div className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                 <span className="text-sm font-bold text-gray-600 flex items-center gap-2"><Calendar size={16}/> Desafios Diários</span>
                                 <span className="font-mono font-bold bg-pink-100 text-pink-700 px-2 py-1 rounded">{stats.dailyChallengesWon || 0}</span>
                             </div>
                        </div>

                        <button onClick={() => setShowStats(false)} className="w-full mt-6 bg-gray-900 text-white py-3 rounded-xl font-bold">
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
