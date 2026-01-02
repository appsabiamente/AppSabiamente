import React from 'react';
import { Volume2, VolumeX, Info, RotateCcw, Shield, Bell, BellOff } from 'lucide-react';
import { UserStats } from '../types';

interface SettingsProps {
    stats: UserStats;
    onToggleSound: () => void;
    onToggleNotifications: () => void;
    onResetTutorials: () => void;
    onExit: () => void;
}

const Settings: React.FC<SettingsProps> = ({ stats, onToggleSound, onToggleNotifications, onResetTutorials, onExit }) => {
    return (
        <div className="px-6 pb-28 pt-4">
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

                {/* Info */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold">
                        <Info size={20} />
                        <h3>Sobre o App</h3>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span>Versão</span>
                            <span className="font-mono bg-gray-100 px-2 rounded">v1.3.0</span>
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

                {/* Advanced */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 opacity-80">
                    <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold">
                        <Shield size={20} />
                        <h3>Avançado</h3>
                    </div>
                    <button onClick={() => { alert("Tutoriais resetados!"); onResetTutorials(); }} className="w-full py-3 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                        <RotateCcw size={18} /> Rever Tutoriais
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;