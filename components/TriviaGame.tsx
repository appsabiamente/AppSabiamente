
import React, { useState, useEffect } from 'react';
import { Check, X, Coins, Brain, ArrowRight, StopCircle, Video, ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';
import { LoadingScreen } from './LoadingScreen';
import { playSuccessSound, playFailureSound } from '../services/audioService';

interface TriviaGameProps {
  onComplete: (score: number) => void;
  onExit: () => void;
  userCoins: number;
  onUseCoins: (amount: number) => boolean;
  onRequestAd: (cb: () => void) => void;
}

// Banco de dados local para operação offline e rápida
const FACTS_DB = [
    { s: "O Sol é uma estrela.", isFact: true, exp: "Sim, é a estrela central do nosso sistema solar." },
    { s: "A Grande Muralha da China é visível da Lua a olho nu.", isFact: false, exp: "Mito. Ela é muito estreita para ser vista de tão longe." },
    { s: "O tomate é uma fruta.", isFact: true, exp: "Botanicamente, o tomate possui sementes e cresce da flor da planta." },
    { s: "Os peixinhos dourados têm memória de apenas 3 segundos.", isFact: false, exp: "Mito. Eles podem lembrar de coisas por meses." },
    { s: "A água ferve a 100°C ao nível do mar.", isFact: true, exp: "Correto. A altitude altera o ponto de ebulição." },
    { s: "O avestruz esconde a cabeça na areia quando está com medo.", isFact: false, exp: "Mito. Eles baixam a cabeça para se camuflar, mas não enterram." },
    { s: "O Brasil é o maior produtor de café do mundo.", isFact: true, exp: "Sim, o Brasil lidera a produção mundial há mais de 150 anos." },
    { s: "O morcego é um pássaro.", isFact: false, exp: "Mito. Morcegos são os únicos mamíferos capazes de voar." },
    { s: "O Monte Everest é a montanha mais alta do mundo.", isFact: true, exp: "Com 8.848 metros, é o pico mais alto acima do nível do mar." },
    { s: "Raios nunca caem duas vezes no mesmo lugar.", isFact: false, exp: "Mito. O Empire State Building é atingido cerca de 25 vezes por ano." },
    { s: "O mel é o único alimento que não estraga.", isFact: true, exp: "Se bem vedado, o mel pode durar séculos devido à sua química." },
    { s: "Nós usamos apenas 10% do nosso cérebro.", isFact: false, exp: "Mito. Usamos praticamente todo o cérebro, mesmo dormindo." },
    { s: "A baleia-azul é o maior animal que já existiu.", isFact: true, exp: "Sim, pode chegar a 30 metros e pesar mais de 150 toneladas." },
    { s: "O deserto do Saara é o maior do mundo.", isFact: false, exp: "Mito. A Antártida é o maior deserto (deserto polar)." },
    { s: "O coração do camarão fica na cabeça.", isFact: true, exp: "Verdade. Os órgãos vitais do camarão ficam no cefalotórax." },
    { s: "Tornados não ocorrem no Brasil.", isFact: false, exp: "Mito. Ocorrem sim, principalmente na região Sul e Sudeste." },
    { s: "O vidro é feito de areia.", isFact: true, exp: "Sim, a areia de sílica é derretida a altas temperaturas." },
    { s: "A língua é o músculo mais forte do corpo.", isFact: false, exp: "Mito. O músculo masseter (mandíbula) exerce a maior força." },
    { s: "A capital da Austrália é Sydney.", isFact: false, exp: "Mito. A capital é Canberra." },
    { s: "O ser humano tem mais bactérias que células no corpo.", isFact: true, exp: "Estima-se que tenhamos 10x mais bactérias (microbiota)." },
    { s: "O Japão é conhecido como a Terra do Sol Nascente.", isFact: true, exp: "Sim, Nihon (nome do país) significa origem do sol." },
    { s: "Napoleão Bonaparte era extremamente baixo.", isFact: false, exp: "Mito. Ele tinha altura média para a época, a confusão veio das unidades de medida." },
    { s: "Bananas crescem em árvores.", isFact: false, exp: "Mito. A bananeira é uma erva gigante, não uma árvore (não tem tronco lenhoso)." },
    { s: "O diamante é a substância natural mais dura.", isFact: true, exp: "Sim, na escala de Mohs ele atinge a pontuação máxima de 10." },
    { s: "Elefantes têm medo de ratos.", isFact: false, exp: "Mito. Eles têm visão ruim e se assustam com movimentos bruscos, não com o rato em si." }
];

const TriviaGame: React.FC<TriviaGameProps> = ({ onComplete, onExit, userCoins, onRequestAd }) => {
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentScore, setCurrentScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [lastResult, setLastResult] = useState<'CORRECT' | 'WRONG' | null>(null);

  useEffect(() => {
    loadQuestion();
  }, []);

  const loadQuestion = () => {
    setLoading(true);
    setAnswered(false);
    setLastResult(null);
    
    // Pick random question directly from local DB
    const randomIdx = Math.floor(Math.random() * FACTS_DB.length);
    setCurrentQuestion(FACTS_DB[randomIdx]);
    
    // Simulate tiny delay for UX smoothness
    setTimeout(() => setLoading(false), 300);
  };

  const handleAnswer = (choice: boolean) => {
    if (answered || !currentQuestion) return;
    setAnswered(true);

    const correct = choice === currentQuestion.isFact;
    
    if (correct) {
      playSuccessSound();
      setLastResult('CORRECT');
      setCurrentScore(s => s + 5);
    } else {
      playFailureSound();
      setLastResult('WRONG');
    }
  };

  const handleNext = () => {
      if (lastResult === 'WRONG') {
          onComplete(currentScore); 
      } else {
          loadQuestion();
      }
  };

  const handleAdvantage = () => {
      onRequestAd(() => {
          if (currentQuestion) {
              alert(`O Oráculo diz: Isso é ${currentQuestion.isFact ? "VERDADE" : "MITO"}!`);
          }
      });
  }

  if (loading) return <LoadingScreen message="Abrindo o livro..." />;

  if (!currentQuestion) return null;

  return (
    <div className="flex flex-col h-full bg-brand-bg">
      <div className="flex flex-col p-4 bg-white shadow-sm rounded-b-3xl z-10 mb-4 gap-4">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                    <Brain size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 leading-none">Fato ou Mito?</h2>
                    <span className="text-xs font-bold text-yellow-600 flex items-center gap-1"><Coins size={12}/> Acumulado: {currentScore}</span>
                </div>
            </div>
            <button onClick={onExit} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} className="text-gray-600" />
            </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto px-6 flex flex-col justify-center">
        
        {/* CARD DA PERGUNTA */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-gray-100 text-center relative mb-8">
            <HelpCircle size={40} className="mx-auto text-blue-300 mb-4"/>
            <p className="text-2xl font-bold leading-relaxed text-slate-800">
                "{currentQuestion.s}"
            </p>
            
            {answered && (
                <div className={`mt-6 p-4 rounded-xl text-left animate-in zoom-in ${lastResult === 'CORRECT' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-1">
                        {lastResult === 'CORRECT' ? <Check className="text-green-600"/> : <X className="text-red-600"/>}
                        <span className={`font-black ${lastResult === 'CORRECT' ? 'text-green-700' : 'text-red-700'}`}>
                            {lastResult === 'CORRECT' ? 'ACERTOU!' : 'ERROU!'}
                        </span>
                    </div>
                    <p className="text-gray-700 font-medium">{currentQuestion.exp}</p>
                </div>
            )}
        </div>

        {!answered ? (
            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <button 
                        onClick={() => handleAnswer(true)}
                        className="flex-1 bg-green-100 border-b-4 border-green-500 text-green-800 py-6 rounded-2xl font-black text-xl flex flex-col items-center gap-2 active:scale-95 transition-transform"
                    >
                        <ThumbsUp size={32} className="fill-green-600 text-green-600"/>
                        VERDADE
                    </button>
                    <button 
                        onClick={() => handleAnswer(false)}
                        className="flex-1 bg-red-100 border-b-4 border-red-500 text-red-800 py-6 rounded-2xl font-black text-xl flex flex-col items-center gap-2 active:scale-95 transition-transform"
                    >
                        <ThumbsDown size={32} className="fill-red-600 text-red-600"/>
                        MITO
                    </button>
                </div>
                <button onClick={handleAdvantage} className="w-full text-blue-500 font-bold flex items-center justify-center gap-2 py-2">
                    <Video size={16}/> Pedir Ajuda
                </button>
            </div>
        ) : (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4">
                <button 
                    onClick={handleNext}
                    className={`w-full py-4 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02]
                    ${lastResult === 'CORRECT' ? 'bg-brand-primary text-white' : 'bg-gray-800 text-white'}`}
                >
                    {lastResult === 'CORRECT' ? <>Próxima <ArrowRight/></> : <>Tentar Novamente <StopCircle/></>}
                </button>
                {lastResult === 'CORRECT' && (
                    <button onClick={() => onComplete(currentScore)} className="text-gray-500 font-bold py-2">
                        Parar e Pegar Moedas
                    </button>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default TriviaGame;
