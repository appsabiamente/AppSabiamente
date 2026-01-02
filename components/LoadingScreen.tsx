import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, Brain } from 'lucide-react';

const TIPS = [
    "Ler diariamente ajuda a manter o cérebro ativo.",
    "Beber água é essencial para a concentração.",
    "Uma caminhada de 20 minutos oxigena o cérebro.",
    "Tentar aprender algo novo cria novas conexões neurais.",
    "Dormir bem consolida a memória do dia.",
    "Jogos de palavras fortalecem o vocabulário.",
    "Socializar é um ótimo exercício cognitivo."
];

export const LoadingScreen: React.FC = () => {
    const [tip, setTip] = useState(TIPS[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-brand-bg text-center animate-in fade-in">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full animate-pulse"></div>
                <Brain size={64} className="text-brand-primary relative z-10 animate-bounce" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-2">Carregando Sabedoria...</h3>
            <Loader2 className="animate-spin text-brand-secondary mb-8" size={32} />
            
            <div className="bg-white p-6 rounded-2xl shadow-soft max-w-xs border border-gray-100">
                <div className="flex items-center justify-center gap-2 mb-2 text-brand-accent font-bold text-sm uppercase tracking-wider">
                    <Sparkles size={16} /> Curiosidade
                </div>
                <p className="text-gray-600 italic leading-relaxed">"{tip}"</p>
            </div>
        </div>
    );
};