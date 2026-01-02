import React, { useState, useEffect } from 'react';
import { generateSequenceTask } from '../services/geminiService';
import { SequenceTask } from '../types';
import { ArrowUp, ArrowDown, CheckCircle, Video, Loader2, ListOrdered, X } from 'lucide-react';

interface SequenceGameProps {
  onComplete: (score: number) => void;
  onExit: () => void;
  onRequestAd: (callback: () => void) => void;
}

const SequenceGame: React.FC<SequenceGameProps> = ({ onComplete, onExit, onRequestAd }) => {
  const [task, setTask] = useState<SequenceTask | null>(null);
  const [userOrder, setUserOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGame();
  }, []);

  const loadGame = async () => {
    setLoading(true);
    const data = await generateSequenceTask();
    if (data) {
        setTask(data);
        setUserOrder([...data.steps].sort(() => Math.random() - 0.5));
    }
    setLoading(false);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...userOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newOrder.length) {
        [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
        setUserOrder(newOrder);
    }
  };

  const checkOrder = () => {
    if (!task) return;
    const isCorrect = JSON.stringify(userOrder) === JSON.stringify(task.steps);
    if (isCorrect) {
        alert("Parabéns! Ordem correta.");
        onComplete(15);
    } else {
        alert("Algo não está certo. Tente revisar a ordem.");
    }
  };

  const showHint = () => {
      onRequestAd(() => {
          if(task) {
             const correctFirst = task.steps[0];
             const currentIdx = userOrder.indexOf(correctFirst);
             if (currentIdx !== 0) {
                 const newOrder = [...userOrder];
                 newOrder.splice(currentIdx, 1);
                 newOrder.unshift(correctFirst);
                 setUserOrder(newOrder);
             }
          }
      });
  };

  return (
    <div className="flex flex-col h-full bg-brand-bg">
       <div className="flex flex-col p-4 bg-white shadow-sm rounded-b-3xl z-10 mb-4 gap-4">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                    <ListOrdered size={24} />
                </div>
                <div className="overflow-hidden">
                    <h2 className="text-xl font-bold text-gray-800 leading-none truncate w-40">{task ? task.title : 'Carregando...'}</h2>
                    <span className="text-xs text-gray-500 font-semibold">Organize os passos</span>
                </div>
            </div>
            <button onClick={onExit} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} className="text-gray-600" />
            </button>
        </div>

        <button onClick={showHint} className="w-full bg-yellow-100 text-yellow-800 p-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 border-yellow-300 shadow-sm active:scale-95 animate-pulse hover:bg-yellow-200 transition-colors">
            <Video size={20} className="fill-yellow-600 text-yellow-800"/>
            <span className="text-sm">Arrumar 1º (Vídeo)</span>
        </button>
      </div>

      <div className="flex-grow p-6 overflow-y-auto">
        {loading ? (
             <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={48} /></div>
        ) : (
            <div className="space-y-3">
                {userOrder.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex flex-col gap-1">
                            <button onClick={() => moveItem(idx, 'up')} disabled={idx === 0} className="p-1 bg-gray-50 rounded hover:bg-gray-200 disabled:opacity-20"><ArrowUp size={20} className="text-gray-600"/></button>
                            <button onClick={() => moveItem(idx, 'down')} disabled={idx === userOrder.length -1} className="p-1 bg-gray-50 rounded hover:bg-gray-200 disabled:opacity-20"><ArrowDown size={20} className="text-gray-600"/></button>
                        </div>
                        <span className="text-lg font-medium text-gray-800 flex-grow leading-tight">{step}</span>
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm">
                            {idx + 1}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      <div className="p-6 pb-8 bg-white/50 backdrop-blur-sm">
          <button onClick={checkOrder} className="w-full bg-orange-500 text-white py-4 rounded-2xl text-xl font-bold shadow-lg shadow-orange-200 flex justify-center items-center gap-2 hover:bg-orange-600 transition-colors">
              <CheckCircle /> Verificar
          </button>
      </div>
    </div>
  );
};

export default SequenceGame;