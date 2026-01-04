
import React, { useState, useEffect, useRef } from 'react';
import { generateIntruderTask, generateScrambleTask } from '../services/geminiService';
import { IntruderTask, ScrambleTask, WordLinkBoard } from '../types';
import { playSuccessSound, playFailureSound, playFanfare, playCelebrationSound } from '../services/audioService';
import { LoadingScreen } from './LoadingScreen';
import { Loader2, CheckCircle, XCircle, Activity, Wind, Square, Circle, Play, Send, X, AlertCircle, Quote, Type, Zap, Eye, Target, Link, LayoutGrid, Heart, Palette, Search, Grid3X3, MousePointerClick, RotateCcw, Box, Copy, TrendingUp, CloudRain, Coins, MapPin, Trophy, Wallet, Video, Delete, CornerDownLeft, ArrowUp, ArrowDown, RotateCw, Trash2, Repeat, Flame, StopCircle, ArrowRight, ShieldCheck, Flag, Star, Umbrella } from 'lucide-react';

// Common Props
interface GameProps {
  onComplete: (score: number) => void;
  onExit: () => void;
  onRequestAd: (cb: () => void) => void;
  highScore?: number;
}

// Reusable Header
const GameHeader: React.FC<{ 
    title: string; 
    icon: React.ReactNode; 
    onExit: () => void; 
    color?: string; 
    rightContent?: React.ReactNode; 
    currentCoins?: number; 
    onCollect?: () => void; // Optional now
    onGetAdvantage?: () => void;
    advantageLabel?: string;
    highScore?: number;
    scoreLabel?: string;
}> = ({ title, icon, onExit, color = "text-gray-600", rightContent, currentCoins = 0, onCollect, onGetAdvantage, advantageLabel = "Ajuda (Vídeo)", highScore, scoreLabel = "Recorde" }) => (
    <div className="flex flex-col p-4 bg-white shadow-sm rounded-b-3xl z-10 mb-4 gap-4">
        <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${color} bg-opacity-10`}>
                    {icon}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 leading-none">{title}</h2>
                    <div className="flex flex-col">
                        {currentCoins > 0 && <span className="text-xs font-bold text-yellow-600 flex items-center gap-1 mt-1"><Coins size={12}/> +{currentCoins}</span>}
                        {highScore !== undefined && highScore > 0 && <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1"><Trophy size={10}/> {scoreLabel}: {highScore}</span>}
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                {rightContent}
                <button onClick={onExit} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <X size={20} className="text-gray-600" />
                </button>
            </div>
        </div>

        <div className="flex items-center gap-2 w-full">
            {onGetAdvantage && (
                <button 
                    onClick={onGetAdvantage} 
                    className="flex-grow bg-yellow-100 text-yellow-800 p-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 border-yellow-300 shadow-sm active:scale-95 animate-pulse hover:bg-yellow-200 transition-colors"
                >
                    <Video size={20} className="fill-yellow-600 text-yellow-800"/>
                    <span className="text-sm">{advantageLabel}</span>
                </button>
            )}
            
            {onCollect && currentCoins > 0 && (
                <button 
                    onClick={onCollect} 
                    className="flex-grow bg-green-100 text-green-800 p-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 border-green-300 shadow-sm animate-in zoom-in hover:bg-green-200"
                >
                    <Wallet size={20}/>
                    <span className="text-sm">Recolher</span>
                </button>
            )}
        </div>
    </div>
);

// === NEW GAMES IMPLEMENTATION ===

// 1. ELO DE PALAVRAS (WORD LINK) - 150 NÍVEIS
const WORD_CATEGORIES = [
    { topic: "Cozinha", correct: ["Panela", "Faca", "Fogão", "Prato", "Colher"], distractors: ["Areia", "Tijolo", "Nuvem", "Pneu"] },
    { topic: "Praia", correct: ["Areia", "Mar", "Sol", "Onda", "Concha"], distractors: ["Neve", "Teclado", "Motor", "Gravata"] },
    { topic: "Ferramentas", correct: ["Martelo", "Alicate", "Chave", "Serra", "Prego"], distractors: ["Maçã", "Travesseiro", "Rio", "Violão"] },
    { topic: "Animais", correct: ["Gato", "Cachorro", "Leão", "Elefante", "Tigre"], distractors: ["Cadeira", "Carro", "Prédio", "Sapato"] },
    { topic: "Frutas", correct: ["Banana", "Maçã", "Uva", "Laranja", "Manga"], distractors: ["Batata", "Carne", "Queijo", "Arroz"] },
    { topic: "Cores", correct: ["Azul", "Vermelho", "Verde", "Amarelo", "Roxo"], distractors: ["Longo", "Alto", "Rápido", "Frio"] },
    { topic: "Móveis", correct: ["Cama", "Mesa", "Sofá", "Cadeira", "Armário"], distractors: ["Grama", "Chuva", "Peixe", "Lua"] },
    { topic: "Instrumentos", correct: ["Violão", "Piano", "Flauta", "Tambor", "Violino"], distractors: ["Martelo", "Colher", "Caneta", "Rádio"] },
    { topic: "Roupas", correct: ["Camisa", "Calça", "Vestido", "Meia", "Casaco"], distractors: ["Janela", "Tijolo", "Flor", "Livro"] },
    { topic: "Corpo", correct: ["Mão", "Pé", "Cabeça", "Olho", "Boca"], distractors: ["Rua", "Casa", "Carro", "Sol"] },
    { topic: "Escola", correct: ["Lápis", "Caderno", "Livro", "Professor", "Lousa"], distractors: ["Colher", "Sabonete", "Travesseiro", "Onda"] },
    { topic: "Banheiro", correct: ["Chuveiro", "Pia", "Toalha", "Sabonete", "Espelho"], distractors: ["Panela", "Garfo", "Sofá", "Jardim"] },
    { topic: "Jardim", correct: ["Flor", "Grama", "Árvore", "Terra", "Regador"], distractors: ["Cama", "Tapete", "Microondas", "Televisão"] },
    { topic: "Céu", correct: ["Nuvem", "Sol", "Lua", "Estrela", "Pássaro"], distractors: ["Peixe", "Pedra", "Carro", "Mesa"] },
    { topic: "Transporte", correct: ["Carro", "Ônibus", "Trem", "Avião", "Barco"], distractors: ["Casa", "Árvore", "Cachorro", "Livro"] },
    { topic: "Esportes", correct: ["Futebol", "Vôlei", "Tênis", "Basquete", "Natação"], distractors: ["Piano", "Bolo", "Sofá", "Relógio"] },
    { topic: "Bebidas", correct: ["Água", "Suco", "Café", "Chá", "Leite"], distractors: ["Pão", "Queijo", "Garfo", "Prato"] },
    { topic: "Doces", correct: ["Bolo", "Pudim", "Chocolate", "Sorvete", "Bala"], distractors: ["Sal", "Arroz", "Feijão", "Carne"] },
    { topic: "Profissões", correct: ["Médico", "Professor", "Bombeiro", "Policial", "Advogado"], distractors: ["Cadeira", "Mesa", "Lápis", "Gato"] },
    { topic: "Sentimentos", correct: ["Amor", "Raiva", "Alegria", "Tristeza", "Medo"], distractors: ["Azul", "Alto", "Doce", "Pedra"] },
    { topic: "Flores", correct: ["Rosa", "Margarida", "Orquídea", "Lírio", "Girassol"], distractors: ["Grama", "Pinheiro", "Musgo", "Cacto"] },
    { topic: "Países", correct: ["Brasil", "França", "China", "Japão", "Itália"], distractors: ["Paris", "Roma", "Londres", "Bahia"] },
    { topic: "Metais", correct: ["Ouro", "Prata", "Ferro", "Cobre", "Alumínio"], distractors: ["Madeira", "Vidro", "Plástico", "Papel"] },
    { topic: "Insetos", correct: ["Abelha", "Formiga", "Mosca", "Borboleta", "Besouro"], distractors: ["Aranha", "Minhoca", "Caracol", "Sapo"] },
    { topic: "Mamíferos", correct: ["Vaca", "Cavalo", "Porco", "Ovelha", "Cabra"], distractors: ["Galinha", "Pato", "Cobra", "Sapo"] },
    { topic: "Aves", correct: ["Pato", "Galinha", "Peru", "Pombo", "Águia"], distractors: ["Morcego", "Abelha", "Mosca", "Rato"] },
    { topic: "Répteis", correct: ["Cobra", "Jacaré", "Tartaruga", "Lagarto", "Iguana"], distractors: ["Sapo", "Peixe", "Baleia", "Rato"] },
    { topic: "Peixes", correct: ["Salmão", "Atum", "Sardinha", "Bacalhau", "Tilápia"], distractors: ["Baleia", "Golfinho", "Camarão", "Polvo"] },
    { topic: "Legumes", correct: ["Cenoura", "Batata", "Beterraba", "Chuchu", "Abóbora"], distractors: ["Maçã", "Uva", "Banana", "Pêra"] },
    { topic: "Verduras", correct: ["Alface", "Couve", "Rúcula", "Espinafre", "Agrião"], distractors: ["Arroz", "Feijão", "Carne", "Ovo"] },
    { topic: "Temperos", correct: ["Sal", "Pimenta", "Alho", "Cebola", "Orégano"], distractors: ["Açúcar", "Leite", "Suco", "Água"] },
    { topic: "Higiene", correct: ["Escova", "Pasta", "Sabonete", "Shampoo", "Fio"], distractors: ["Garfo", "Faca", "Prato", "Copo"] },
    { topic: "Limpeza", correct: ["Vassoura", "Rodo", "Pano", "Balde", "Sabão"], distractors: ["Cama", "Mesa", "Sofá", "Cadeira"] },
    { topic: "Escritório", correct: ["Caneta", "Papel", "Grampeador", "Clips", "Pasta"], distractors: ["Martelo", "Serra", "Prego", "Alicate"] },
    { topic: "Hospital", correct: ["Médico", "Enfermeira", "Maca", "Remédio", "Seringa"], distractors: ["Professor", "Lousa", "Giz", "Livro"] },
    { topic: "Farmácia", correct: ["Remédio", "Vitamina", "Curativo", "Algodão", "Álcool"], distractors: ["Pão", "Leite", "Carne", "Ovo"] },
    { topic: "Padaria", correct: ["Pão", "Bolo", "Sonho", "Tortas", "Biscoito"], distractors: ["Arroz", "Feijão", "Macarrão", "Carne"] },
    { topic: "Açougue", correct: ["Carne", "Frango", "Linguiça", "Costela", "Picanha"], distractors: ["Peixe", "Camarão", "Siri", "Lula"] },
    { topic: "Supermercado", correct: ["Carrinho", "Caixa", "Prateleira", "Sacola", "Produto"], distractors: ["Cama", "Mesa", "Sofá", "Cadeira"] },
    { topic: "Banco", correct: ["Dinheiro", "Cheque", "Cartão", "Caixa", "Gerente"], distractors: ["Pão", "Leite", "Carne", "Ovo"] },
    { topic: "Cinema", correct: ["Filme", "Tela", "Pipoca", "Ingresso", "Cadeira"], distractors: ["Bola", "Rede", "Trave", "Gol"] },
    { topic: "Circo", correct: ["Palhaço", "Mágico", "Malabarista", "Lona", "Pipoca"], distractors: ["Médico", "Enfermeira", "Maca", "Remédio"] },
    { topic: "Zoológico", correct: ["Jaula", "Animal", "Guarda", "Ingresso", "Visita"], distractors: ["Cama", "Mesa", "Sofá", "Cadeira"] },
    { topic: "Parque", correct: ["Banco", "Árvore", "Grama", "Lago", "Pato"], distractors: ["Cama", "Mesa", "Sofá", "Cadeira"] },
    { topic: "Shopping", correct: ["Loja", "Vitrine", "Escada", "Praça", "Cinema"], distractors: ["Areia", "Mar", "Sol", "Onda"] },
    { topic: "Festa", correct: ["Bolo", "Vela", "Balão", "Presente", "Música"], distractors: ["Remédio", "Curativo", "Seringa", "Maca"] },
    { topic: "Casamento", correct: ["Noiva", "Noivo", "Aliança", "Buquê", "Padre"], distractors: ["Bola", "Rede", "Trave", "Gol"] },
    { topic: "Natal", correct: ["Papai", "Árvore", "Presente", "Ceia", "Noel"], distractors: ["Ovo", "Coelho", "Chocolate", "Toca"] },
    { topic: "Páscoa", correct: ["Ovo", "Coelho", "Chocolate", "Toca", "Cenoura"], distractors: ["Papai", "Árvore", "Presente", "Ceia"] },
    { topic: "Carnaval", correct: ["Samba", "Fantasia", "Desfile", "Máscara", "Folia"], distractors: ["Ovo", "Coelho", "Chocolate", "Toca"] },
    { topic: "Inverno", correct: ["Frio", "Neve", "Casaco", "Luva", "Gorro"], distractors: ["Sol", "Praia", "Calor", "Sorvete"] },
    { topic: "Verão", correct: ["Sol", "Praia", "Calor", "Sorvete", "Piscina"], distractors: ["Frio", "Neve", "Casaco", "Luva"] },
    { topic: "Outono", correct: ["Folha", "Vento", "Frio", "Fruta", "Seca"], distractors: ["Sol", "Praia", "Calor", "Sorvete"] },
    { topic: "Primavera", correct: ["Flor", "Sol", "Chuva", "Verde", "Vida"], distractors: ["Frio", "Neve", "Casaco", "Luva"] },
    { topic: "Espaço", correct: ["Lua", "Sol", "Estrela", "Planeta", "Foguete"], distractors: ["Carro", "Ônibus", "Trem", "Bicicleta"] },
    { topic: "Planetas", correct: ["Terra", "Marte", "Júpiter", "Saturno", "Vênus"], distractors: ["Sol", "Lua", "Estrela", "Cometa"] },
    { topic: "Continentes", correct: ["Ásia", "África", "Europa", "América", "Oceania"], distractors: ["Brasil", "França", "China", "Japão"] },
    { topic: "Oceanos", correct: ["Atlântico", "Pacífico", "Índico", "Ártico", "Antártico"], distractors: ["Amazonas", "Nilo", "Paraná", "Tietê"] },
    { topic: "Rios", correct: ["Amazonas", "Nilo", "Paraná", "Tietê", "São Francisco"], distractors: ["Atlântico", "Pacífico", "Índico", "Ártico"] },
    { topic: "Montanhas", correct: ["Everest", "Andes", "Alpes", "Himalaia", "Rochosas"], distractors: ["Amazonas", "Nilo", "Paraná", "Tietê"] },
    { topic: "Desertos", correct: ["Saara", "Atacama", "Gobi", "Kalahari", "Arábia"], distractors: ["Amazonas", "Nilo", "Paraná", "Tietê"] },
    { topic: "Clima", correct: ["Chuva", "Sol", "Vento", "Neve", "Granizo"], distractors: ["Terra", "Marte", "Júpiter", "Saturno"] },
    { topic: "Pedras", correct: ["Granito", "Mármore", "Quartzo", "Brita", "Seixo"], distractors: ["Ouro", "Prata", "Ferro", "Cobre"] },
    { topic: "Joias", correct: ["Anel", "Brinco", "Colar", "Pulseira", "Broche"], distractors: ["Camisa", "Calça", "Vestido", "Meia"] },
    { topic: "Maquiagem", correct: ["Batom", "Rímel", "Pó", "Base", "Sombra"], distractors: ["Anel", "Brinco", "Colar", "Pulseira"] },
    { topic: "Tecidos", correct: ["Algodão", "Lã", "Seda", "Linho", "Jeans"], distractors: ["Ouro", "Prata", "Ferro", "Cobre"] },
    { topic: "Materiais", correct: ["Madeira", "Vidro", "Plástico", "Papel", "Metal"], distractors: ["Azul", "Vermelho", "Verde", "Amarelo"] },
    { topic: "Geometria", correct: ["Círculo", "Quadrado", "Triângulo", "Retângulo", "Losango"], distractors: ["Azul", "Vermelho", "Verde", "Amarelo"] },
    { topic: "Matemática", correct: ["Soma", "Subtração", "Divisão", "Multiplicação", "Raiz"], distractors: ["Verbo", "Nome", "Artigo", "Sujeito"] },
    { topic: "Português", correct: ["Verbo", "Nome", "Artigo", "Sujeito", "Adjetivo"], distractors: ["Soma", "Subtração", "Divisão", "Multiplicação"] },
    { topic: "Ciências", correct: ["Célula", "Átomo", "Molécula", "Gene", "Tecido"], distractors: ["Verbo", "Nome", "Artigo", "Sujeito"] },
    { topic: "História", correct: ["Guerra", "Rei", "Império", "Colônia", "Século"], distractors: ["Célula", "Átomo", "Molécula", "Gene"] },
    { topic: "Geografia", correct: ["Mapa", "País", "Cidade", "Estado", "Capital"], distractors: ["Célula", "Átomo", "Molécula", "Gene"] },
    { topic: "Artes", correct: ["Pintura", "Desenho", "Escultura", "Música", "Dança"], distractors: ["Soma", "Subtração", "Divisão", "Multiplicação"] },
    { topic: "Religião", correct: ["Igreja", "Templo", "Bíblia", "Reza", "Fé"], distractors: ["Célula", "Átomo", "Molécula", "Gene"] },
    { topic: "Família", correct: ["Mãe", "Pai", "Filho", "Irmão", "Avô"], distractors: ["Amigo", "Vizinho", "Chefe", "Colega"] },
    { topic: "Casa", correct: ["Porta", "Janela", "Telhado", "Parede", "Chão"], distractors: ["Rua", "Carro", "Árvore", "Poste"] },
    { topic: "Quarto", correct: ["Cama", "Travesseiro", "Lençol", "Cobertor", "Guarda-Roupa"], distractors: ["Fogão", "Geladeira", "Pia", "Mesa"] },
    { topic: "Sala", correct: ["Sofá", "TV", "Tapete", "Estante", "Cortina"], distractors: ["Cama", "Travesseiro", "Lençol", "Cobertor"] },
    { topic: "Banho", correct: ["Toalha", "Sabonete", "Shampoo", "Condicionador", "Esponja"], distractors: ["Garfo", "Faca", "Prato", "Copo"] },
    { topic: "Café", correct: ["Xícara", "Bule", "Açúcar", "Colher", "Pires"], distractors: ["Garfo", "Faca", "Prato", "Copo"] },
    { topic: "Almoço", correct: ["Arroz", "Feijão", "Carne", "Salada", "Suco"], distractors: ["Pão", "Manteiga", "Café", "Leite"] },
    { topic: "Jantar", correct: ["Sopa", "Pão", "Chá", "Torrada", "Queijo"], distractors: ["Arroz", "Feijão", "Carne", "Salada"] },
    { topic: "Lanche", correct: ["Sanduíche", "Fruta", "Iogurte", "Biscoito", "Suco"], distractors: ["Arroz", "Feijão", "Carne", "Salada"] },
    { topic: "Churrasco", correct: ["Carne", "Carvão", "Espeto", "Faca", "Sal"], distractors: ["Bolo", "Vela", "Balão", "Presente"] },
    { topic: "Piquenique", correct: ["Toalha", "Cesta", "Fruta", "Suco", "Sanduíche"], distractors: ["Bolo", "Vela", "Balão", "Presente"] },
    { topic: "Acampamento", correct: ["Barraca", "Fogueira", "Lanterna", "Saco", "Mochila"], distractors: ["Cama", "Travesseiro", "Lençol", "Cobertor"] },
    { topic: "Pescaria", correct: ["Vara", "Isca", "Anzol", "Peixe", "Linha"], distractors: ["Bola", "Rede", "Trave", "Gol"] },
    { topic: "Futebol", correct: ["Bola", "Campo", "Trave", "Gol", "Juiz"], distractors: ["Vara", "Isca", "Anzol", "Peixe"] },
    { topic: "Vôlei", correct: ["Rede", "Bola", "Saque", "Manchete", "Ponto"], distractors: ["Gol", "Trave", "Chuteira", "Caneleira"] },
    { topic: "Basquete", correct: ["Cesta", "Bola", "Tabela", "Garrafão", "Lance"], distractors: ["Gol", "Trave", "Chuteira", "Caneleira"] },
    { topic: "Tênis", correct: ["Raquete", "Bola", "Rede", "Saque", "Game"], distractors: ["Gol", "Trave", "Chuteira", "Caneleira"] },
    { topic: "Natação", correct: ["Piscina", "Touca", "Óculos", "Raia", "Nado"], distractors: ["Gol", "Trave", "Chuteira", "Caneleira"] },
    { topic: "Corrida", correct: ["Pista", "Tênis", "Largada", "Chegada", "Volta"], distractors: ["Gol", "Trave", "Chuteira", "Caneleira"] },
    { topic: "Ciclismo", correct: ["Bicicleta", "Capacete", "Pedal", "Guidão", "Pneu"], distractors: ["Gol", "Trave", "Chuteira", "Caneleira"] },
    { topic: "Carro", correct: ["Roda", "Volante", "Motor", "Banco", "Porta"], distractors: ["Asa", "Hélice", "Turbina", "Leme"] },
    { topic: "Avião", correct: ["Asa", "Turbina", "Cauda", "Cabine", "Trem"], distractors: ["Roda", "Volante", "Motor", "Banco"] },
    { topic: "Barco", correct: ["Vela", "Leme", "Casco", "Âncora", "Convés"], distractors: ["Roda", "Volante", "Motor", "Banco"] },
    { topic: "Trem", correct: ["Trilho", "Vagão", "Locomotiva", "Apito", "Estação"], distractors: ["Asa", "Turbina", "Cauda", "Cabine"] },
    { topic: "Ônibus", correct: ["Passageiro", "Motorista", "Catraca", "Ponto", "Banco"], distractors: ["Asa", "Turbina", "Cauda", "Cabine"] },
    { topic: "Bicicleta", correct: ["Pedal", "Corrente", "Selim", "Guidão", "Freio"], distractors: ["Volante", "Motor", "Porta", "Vidro"] },
    { topic: "Moto", correct: ["Capacete", "Guidão", "Roda", "Motor", "Escapamento"], distractors: ["Volante", "Porta", "Vidro", "Cinto"] },
    { topic: "Computador", correct: ["Mouse", "Teclado", "Tela", "Cabo", "Botão"], distractors: ["Garfo", "Faca", "Prato", "Copo"] },
    { topic: "Celular", correct: ["Tela", "Bateria", "Chip", "Câmera", "Capa"], distractors: ["Garfo", "Faca", "Prato", "Copo"] },
    { topic: "Televisão", correct: ["Controle", "Tela", "Canal", "Som", "Imagem"], distractors: ["Garfo", "Faca", "Prato", "Copo"] },
    { topic: "Rádio", correct: ["Música", "Notícia", "Estação", "Volume", "Antena"], distractors: ["Tela", "Imagem", "Vídeo", "Foto"] },
    { topic: "Jornal", correct: ["Papel", "Notícia", "Manchete", "Foto", "Texto"], distractors: ["Tela", "Som", "Vídeo", "Botão"] },
    { topic: "Livro", correct: ["Página", "Capa", "História", "Autor", "Texto"], distractors: ["Tela", "Som", "Vídeo", "Botão"] },
    { topic: "Revista", correct: ["Foto", "Artigo", "Capa", "Página", "Moda"], distractors: ["Tela", "Som", "Vídeo", "Botão"] },
    { topic: "Carta", correct: ["Selo", "Envelope", "Papel", "Caneta", "Texto"], distractors: ["Tela", "Som", "Vídeo", "Botão"] },
    { topic: "Email", correct: ["Arroba", "Assunto", "Texto", "Anexo", "Enviar"], distractors: ["Selo", "Envelope", "Papel", "Caneta"] },
    { topic: "Internet", correct: ["Site", "Link", "Rede", "Wifi", "Google"], distractors: ["Selo", "Envelope", "Papel", "Caneta"] },
    { topic: "Rede Social", correct: ["Foto", "Curtida", "Amigo", "Post", "Perfil"], distractors: ["Selo", "Envelope", "Papel", "Caneta"] },
    { topic: "Música", correct: ["Som", "Ritmo", "Letra", "Nota", "Melodia"], distractors: ["Tinta", "Tela", "Pincel", "Cor"] },
    { topic: "Pintura", correct: ["Tinta", "Tela", "Pincel", "Cor", "Quadro"], distractors: ["Som", "Ritmo", "Letra", "Nota"] },
    { topic: "Dança", correct: ["Passo", "Ritmo", "Música", "Corpo", "Movimento"], distractors: ["Tinta", "Tela", "Pincel", "Cor"] },
    { topic: "Teatro", correct: ["Ator", "Palco", "Peça", "Cena", "Texto"], distractors: ["Tinta", "Tela", "Pincel", "Cor"] },
    { topic: "Fotografia", correct: ["Câmera", "Lente", "Foto", "Flash", "Imagem"], distractors: ["Som", "Ritmo", "Letra", "Nota"] },
    { topic: "Costura", correct: ["Agulha", "Linha", "Tecido", "Botão", "Tesoura"], distractors: ["Martelo", "Prego", "Serra", "Chave"] },
    { topic: "Tricô", correct: ["Lã", "Agulha", "Ponto", "Blusa", "Cachecol"], distractors: ["Martelo", "Prego", "Serra", "Chave"] },
    { topic: "Bordado", correct: ["Linha", "Agulha", "Bastidor", "Pano", "Desenho"], distractors: ["Martelo", "Prego", "Serra", "Chave"] },
    { topic: "Crochê", correct: ["Linha", "Agulha", "Ponto", "Toalha", "Bico"], distractors: ["Martelo", "Prego", "Serra", "Chave"] },
    { topic: "Cerâmica", correct: ["Barro", "Forno", "Vaso", "Mão", "Roda"], distractors: ["Agulha", "Linha", "Tecido", "Botão"] },
    { topic: "Jardinagem", correct: ["Terra", "Pá", "Planta", "Água", "Vaso"], distractors: ["Agulha", "Linha", "Tecido", "Botão"] },
    { topic: "Pesca", correct: ["Peixe", "Rio", "Mar", "Barco", "Rede"], distractors: ["Agulha", "Linha", "Tecido", "Botão"] },
    { topic: "Caça", correct: ["Mato", "Bicho", "Rastro", "Arma", "Cão"], distractors: ["Agulha", "Linha", "Tecido", "Botão"] },
    { topic: "Caminhada", correct: ["Tênis", "Trilha", "Mato", "Água", "Sol"], distractors: ["Agulha", "Linha", "Tecido", "Botão"] },
    { topic: "Corrida", correct: ["Suor", "Cansaço", "Velocidade", "Fôlego", "Perna"], distractors: ["Agulha", "Linha", "Tecido", "Botão"] },
    { topic: "Yoga", correct: ["Tapete", "Respiração", "Pose", "Corpo", "Mente"], distractors: ["Agulha", "Linha", "Tecido", "Botão"] },
    { topic: "Meditação", correct: ["Silêncio", "Paz", "Mente", "Olhos", "Calma"], distractors: ["Barulho", "Grito", "Festa", "Música"] },
    { topic: "Leitura", correct: ["Livro", "Óculos", "Luz", "História", "Imaginação"], distractors: ["Barulho", "Grito", "Festa", "Música"] },
    { topic: "Escrita", correct: ["Caneta", "Papel", "Ideia", "Texto", "Palavra"], distractors: ["Barulho", "Grito", "Festa", "Música"] },
    { topic: "Estudo", correct: ["Livro", "Caderno", "Lápis", "Atenção", "Prova"], distractors: ["Barulho", "Grito", "Festa", "Música"] },
    { topic: "Trabalho", correct: ["Chefe", "Salário", "Horário", "Colega", "Tarefa"], distractors: ["Férias", "Praia", "Sol", "Mar"] },
    { topic: "Férias", correct: ["Viagem", "Praia", "Descanso", "Hotel", "Mala"], distractors: ["Chefe", "Salário", "Horário", "Tarefa"] },
    { topic: "Viagem", correct: ["Avião", "Mala", "Passaporte", "Foto", "Mapa"], distractors: ["Chefe", "Salário", "Horário", "Tarefa"] }
];

export const WordChainGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [board, setBoard] = useState<WordLinkBoard | null>(null);
    const [gridWords, setGridWords] = useState<string[]>([]);
    const [foundWords, setFoundWords] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);

    // HighScore aqui representa o NÍVEL ATUAL (Índice da categoria)
    const currentLevel = highScore || 0;

    const loadLevel = () => {
        if (currentLevel >= WORD_CATEGORIES.length) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setFoundWords([]);
        setMistakes(0);
        
        // Pega a categoria sequencialmente baseada no nível do usuário
        const cat = WORD_CATEGORIES[currentLevel];
        
        // --- AUMENTO DE DIFICULDADE (HARDER LOGIC) ---
        // Meta: 16 palavras no total (Grade 4x4)
        // 5 Corretas
        // 11 Distratores (4 nativos + 7 aleatórios de outras categorias)
        
        const otherCategories = WORD_CATEGORIES.filter(c => c.topic !== cat.topic);
        const randomDistractors: string[] = [];
        
        while (randomDistractors.length < 7) {
            const randomCat = otherCategories[Math.floor(Math.random() * otherCategories.length)];
            const allWords = [...randomCat.correct, ...randomCat.distractors];
            const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
            if (!randomDistractors.includes(randomWord) && !cat.correct.includes(randomWord) && !cat.distractors.includes(randomWord)) {
                randomDistractors.push(randomWord);
            }
        }

        const allDistractors = [...cat.distractors, ...randomDistractors];

        const data: WordLinkBoard = {
            topic: cat.topic,
            correctWords: cat.correct,
            distractors: allDistractors
        };

        setBoard(data);
        const all = [...data.correctWords, ...data.distractors].sort(() => Math.random() - 0.5);
        setGridWords(all);
        
        setTimeout(() => setLoading(false), 500);
    };

    useEffect(() => {
        loadLevel();
    }, [currentLevel]);

    const handleWordTap = (word: string) => {
        if (!board || foundWords.includes(word) || loading) return;

        if (board.correctWords.includes(word)) {
            playSuccessSound();
            const newFound = [...foundWords, word];
            setFoundWords(newFound);
            
            if (newFound.length === board.correctWords.length) {
                setTimeout(() => {
                    playFanfare();
                    alert(`Categoria ${board.topic} Completa!`);
                    // Avança para o próximo nível (Score = Nível)
                    onComplete(currentLevel + 1);
                }, 500);
            }
        } else {
            playFailureSound();
            setMistakes(m => {
                const newM = m + 1;
                if (newM >= 3) {
                    alert("Muitos erros! Tente novamente.");
                    // Reinicia o mesmo nível (não avança)
                    setFoundWords([]);
                    setMistakes(0);
                }
                return newM;
            });
        }
    };

    const handleAdvantage = () => {
        onRequestAd(() => {
            if (!board) return;
            const missing = board.correctWords.find(w => !foundWords.includes(w));
            if (missing) {
                handleWordTap(missing); 
            }
        });
    };

    if (loading) return <LoadingScreen message="Criando Categoria..." />;

    // TELA DE FIM DE JOGO
    if (currentLevel >= WORD_CATEGORIES.length) {
        return (
            <div className="flex flex-col h-full bg-brand-bg items-center justify-center p-8 text-center">
                <Star size={80} className="text-blue-500 mb-6 animate-spin-slow" />
                <h1 className="text-3xl font-black text-gray-800 mb-4">Mestre das Palavras!</h1>
                <p className="text-xl text-gray-600 mb-8">Você conectou todas as 150 categorias.</p>
                <div className="bg-white p-6 rounded-2xl shadow-soft mb-8 border border-blue-200">
                    <p className="font-bold text-gray-500 uppercase text-xs mb-2">Conquista</p>
                    <p className="text-lg font-bold text-gray-800">Mais níveis em breve!</p>
                </div>
                <button onClick={onExit} className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold text-xl shadow-lg">Voltar ao Jardim</button>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader 
                title="Elo de Palavras" 
                icon={<Link size={24} className="text-blue-600"/>} 
                onExit={onExit} 
                currentCoins={score} 
                // Removed onCollect logic specifically for this game per instructions
                onGetAdvantage={handleAdvantage}
                advantageLabel="Achar Palavra (Vídeo)"
                highScore={currentLevel + 1}
                scoreLabel="Nível Atual"
                rightContent={
                    <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                            <Heart key={i} size={20} className={i < (3 - mistakes) ? "fill-red-500 text-red-500" : "text-gray-300"} />
                        ))}
                    </div>
                } 
            />
            <div className="flex-grow p-4 flex flex-col">
                <div className="bg-blue-100 p-6 rounded-3xl text-center shadow-sm mb-6 border border-blue-200">
                    <p className="text-blue-800 text-sm font-bold uppercase tracking-widest mb-1">Nível {currentLevel + 1}</p>
                    <h3 className="text-3xl font-black text-blue-900">{board?.topic}</h3>
                    <p className="text-blue-600 text-xs font-bold mt-2">Encontre {board?.correctWords.length} palavras</p>
                </div>

                {/* GRADE MAIOR (4 colunas) para acomodar 16 palavras */}
                <div className="grid grid-cols-4 gap-2">
                    {gridWords.map((word, idx) => {
                        const isFound = foundWords.includes(word);
                        return (
                            <button 
                                key={idx}
                                onClick={() => handleWordTap(word)}
                                disabled={isFound}
                                className={`p-2 py-4 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all transform active:scale-95 border-b-4 flex items-center justify-center text-center break-words
                                ${isFound 
                                    ? 'bg-green-500 text-white border-green-700' 
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                            >
                                {word}
                            </button>
                        )
                    })}
                </div>
                
                <div className="mt-auto text-center text-gray-400 text-xs p-4">
                    Toque apenas nas palavras relacionadas ao tema acima.
                </div>
            </div>
        </div>
    );
};

// ... OTHER GAMES KEEP AS IS ...

export const RotationGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    // ... kept same
    const [targetSymbol, setTargetSymbol] = useState("F");
    const [baseAngle, setBaseAngle] = useState(0);
    const [rotationTask, setRotationTask] = useState<{label: string, value: number}>({label: '90° Direita', value: 90});
    const [streak, setStreak] = useState(0);
    const [sessionScore, setSessionScore] = useState(0);
    const [showCheckpoint, setShowCheckpoint] = useState(false);
    
    const SYMBOLS = ["F", "R", "L", "G", "P", "J", "➔", "▲", "★", "♣", "7", "4"];
    const TASKS = [{ label: '90° à Direita (Horário)', value: 90 }, { label: '90° à Esquerda (Anti-horário)', value: 270 }, { label: '180° (Meia Volta)', value: 180 }];

    useEffect(() => { nextRound(); }, []); 

    const nextRound = () => {
        setTargetSymbol(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
        setBaseAngle(Math.floor(Math.random() * 8) * 45); 
        setRotationTask(TASKS[Math.floor(Math.random() * TASKS.length)]);
    }

    const handleGuess = (guessAngle: number) => {
        const target = (baseAngle + rotationTask.value) % 360;
        if(guessAngle === target) {
            playSuccessSound();
            const newStreak = streak + 1;
            setStreak(newStreak);
            setSessionScore(s => s + 5);
            if (newStreak % 5 === 0) { playCelebrationSound(); setShowCheckpoint(true); } else { nextRound(); }
        } else {
            playFailureSound();
            alert(`Errado! Você perdeu o acumulado desta sessão.\nA resposta correta era a figura rotacionada em ${rotationTask.label}.`);
            onComplete(0); 
        }
    }

    const handleContinue = () => { setShowCheckpoint(false); nextRound(); }
    const handleStop = () => { onComplete(sessionScore); }
    const handleAdvantage = () => { onRequestAd(() => { alert(`Dica: A rotação é ${rotationTask.label}. Imagine um relógio.`); }); }

    const [options, setOptions] = useState<number[]>([]);
    useEffect(() => {
        const correct = (baseAngle + rotationTask.value) % 360;
        const opts = new Set<number>();
        opts.add(correct);
        while(opts.size < 4) opts.add((Math.floor(Math.random() * 8) * 45));
        setOptions(Array.from(opts).sort((a,b) => a-b));
    }, [baseAngle, rotationTask]);

    return (
        <div className="flex flex-col h-full bg-brand-bg relative">
            <GameHeader title="Rotação" icon={<RotateCcw size={24} className="text-cyan-500"/>} onExit={onExit} currentCoins={sessionScore} onCollect={() => {}} onGetAdvantage={handleAdvantage} advantageLabel="Dica (Vídeo)" highScore={highScore} scoreLabel="Máx Pontos"/>
            {showCheckpoint && (
                <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
                        <Flag size={64} className="mx-auto text-yellow-500 mb-4 animate-bounce" />
                        <h2 className="text-2xl font-black text-gray-800 mb-2">Checkpoint!</h2>
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-6">
                            <p className="text-xs uppercase text-yellow-700 font-bold">Acumulado</p>
                            <p className="text-3xl font-black text-yellow-600">{sessionScore} Moedas</p>
                        </div>
                        <div className="space-y-3">
                            <button onClick={handleStop} className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition-colors shadow-lg flex items-center justify-center gap-2"><StopCircle /> Parar e Garantir</button>
                            <button onClick={handleContinue} className="w-full bg-white text-gray-700 border-2 border-gray-200 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"><ArrowRight /> Arriscar (+5)</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex-grow flex flex-col items-center justify-center gap-6 p-6">
                <div className="flex gap-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < (streak % 5) || (streak > 0 && streak % 5 === 0) ? 'bg-green-500 scale-110' : 'bg-gray-200'}`} />
                    ))}
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-soft w-32 h-32 flex items-center justify-center border border-gray-100">
                    <span className="text-8xl font-black text-cyan-600 transition-transform block" style={{transform: `rotate(${baseAngle}deg)`}}>{targetSymbol}</span>
                </div>
                <div className="bg-cyan-100 p-4 rounded-xl text-center w-full shadow-inner">
                    <p className="text-cyan-900 font-bold text-sm uppercase mb-1">Sua Missão</p>
                    <p className="text-lg font-black text-cyan-800 leading-tight">Como fica a figura girada <br/><span className="text-2xl text-cyan-600">{rotationTask.label}</span>?</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    {options.map(a => (
                        <button key={a} onClick={() => handleGuess(a)} className="bg-white p-6 rounded-2xl shadow-sm hover:bg-cyan-50 flex items-center justify-center transition-transform active:scale-95">
                            <span className="text-5xl font-black text-gray-700 block" style={{transform: `rotate(${a}deg)`}}>{targetSymbol}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export const ZenFocusGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    // ... kept same
    const [items, setItems] = useState<{id: number, type: 'good'|'bad', x: number, y: number}[]>([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameOver, setGameOver] = useState(false);
    const reqRef = useRef<number>();
    const speedMultiplier = 0.8 + (score * 0.05); 

    useEffect(() => {
        if(gameOver) return;
        const spawnRate = Math.max(300, 1500 / speedMultiplier); 
        const spawn = setInterval(() => {
            setItems(prev => [...prev, {
                id: Date.now(),
                type: Math.random() > 0.3 ? 'good' : 'bad', 
                x: Math.random() * 80 + 10,
                y: 100
            }]);
        }, spawnRate);

        const loop = () => {
            setItems(prev => {
                const next = prev.map(i => ({...i, y: i.y - (0.5 * speedMultiplier)})); 
                next.forEach(i => {
                    if (i.y < -10 && i.type === 'good') {
                        playFailureSound(0);
                        setLives(l => {
                            if (l <= 1) { 
                                setGameOver(true); 
                                const consolation = Math.floor(score / 2);
                                alert(`Você perdeu! Pontuação: ${score}.`);
                                onComplete(consolation); 
                                return 0; 
                            } 
                            return l - 1;
                        });
                    }
                });
                return next.filter(i => i.y > -15);
            });
            if (!gameOver) reqRef.current = requestAnimationFrame(loop);
        };
        reqRef.current = requestAnimationFrame(loop);
        return () => { clearInterval(spawn); cancelAnimationFrame(reqRef.current!); };
    }, [gameOver, score]);

    const handleTap = (id: number, type: 'good'|'bad') => {
        if (gameOver) return;
        if (type === 'good') {
            playSuccessSound();
            setScore(s => s + 1); 
            setItems(prev => prev.filter(i => i.id !== id));
        } else {
            playFailureSound(0);
            setLives(l => {
                if (l <= 1) { 
                    setGameOver(true); 
                    const consolation = Math.floor(score / 2);
                    alert(`Você perdeu! Pontuação: ${score}.`);
                    onComplete(consolation); 
                    return 0; 
                } 
                return l - 1;
            });
            setItems(prev => prev.filter(i => i.id !== id));
        }
    };

    const handleAdvantage = () => {
        setGameOver(true);
        onRequestAd(() => {
            setLives(l => l + 1);
            setGameOver(false);
        });
    };

    return (
        <div className="flex flex-col h-full bg-brand-bg overflow-hidden relative">
            <GameHeader title="Foco Zen" icon={<Eye size={24} className="text-teal-600"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Vida Extra (Vídeo)" highScore={highScore} scoreLabel="Máx Pontos" rightContent={<div className="flex gap-1 text-red-500">{[...Array(lives)].map((_,i)=><Heart key={i} size={20} fill="currentColor"/>)}</div>} />
            <div className="flex-grow relative cursor-crosshair z-0">
                {items.map(item => (
                    <div key={item.id} onClick={() => handleTap(item.id, item.type)} className={`absolute w-16 h-16 flex items-center justify-center transition-transform active:scale-90 shadow-lg ${item.type === 'good' ? 'bg-teal-400 rounded-full cursor-pointer animate-pulse' : 'bg-gray-800 rounded-xl'}`} style={{ left: `${item.x}%`, top: `${item.y}%` }}>
                        {item.type === 'good' ? <Circle className="text-white" size={28}/> : <Square className="text-white" size={28} />}
                    </div>
                ))}
            </div>
        </div>
    )
}

// ... kept same
export const SumTargetGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
     const [target, setTarget] = useState(15);
     const [currentSum, setCurrentSum] = useState(0);
     const [options, setOptions] = useState<number[]>([]);
     const [timeLeft, setTimeLeft] = useState(15);
     const [score, setScore] = useState(0);
     const [level, setLevel] = useState(1); 
     const [paused, setPaused] = useState(false);
     const [showVictory, setShowVictory] = useState(false);
     const isGameOverRef = useRef(false);
     const [history, setHistory] = useState<{value: number, index: number}[]>([]);
 
     useEffect(() => { resetRound(); }, []);
 
     useEffect(() => {
         if (paused || showVictory) return;
         const t = setInterval(() => {
             setTimeLeft(prev => {
                 if (prev <= 1) {
                     clearInterval(t);
                     if (!isGameOverRef.current) {
                         isGameOverRef.current = true;
                         playFailureSound(0);
                         const consolation = Math.floor(score / 2);
                         alert(`Tempo acabou!`);
                         onComplete(consolation);
                     }
                     return 0;
                 }
                 return prev - 1;
             });
         }, 1000);
         return () => clearInterval(t);
     }, [paused, score, showVictory]);
 
     const resetRound = () => {
         isGameOverRef.current = false;
         const baseTarget = 15 + (level * 5); 
         const variance = Math.floor(Math.random() * 10) + (level * 2);
         const t = baseTarget + variance;
         setTarget(t); setCurrentSum(0); setHistory([]);
         const p1 = Math.floor(Math.random() * (t / 2)) + 1;
         const p2 = Math.floor(Math.random() * ((t - p1) / 2)) + 1;
         const remaining = t - p1 - p2;
         const p3 = remaining > 0 ? remaining : 0;
         const solution = p3 > 0 ? [p1, p2, p3] : [p1, t - p1];
         const maxOption = t - 2;
         const randoms = Array.from({length: 6}, () => Math.floor(Math.random() * maxOption) + 1);
         const allOpts = [...solution, ...randoms].sort(() => Math.random() - 0.5);
         setOptions(allOpts);
         setTimeLeft(Math.max(15, 15 + Math.floor(level/2)));
         setShowVictory(false);
     };

     const handleNextLevel = () => { setScore(s => s + 5); setLevel(l => l + 1); resetRound(); }
     const handleAdvantage = () => { setPaused(true); onRequestAd(() => { setTimeLeft(t => t + 10); setPaused(false); }); };
 
     const add = (num: number, idx: number) => {
         if (isGameOverRef.current || showVictory) return;
         const newSum = currentSum + num;
         setCurrentSum(newSum);
         const newOpts = [...options];
         newOpts[idx] = -1; 
         setOptions(newOpts);
         setHistory([...history, {value: num, index: idx}]);
 
         if (newSum === target) {
             playSuccessSound();
             setShowVictory(true); 
         } else if (newSum > target) {
             if (!isGameOverRef.current) {
                 isGameOverRef.current = true;
                 playFailureSound(0);
                 alert("Passou do valor!");
                 onComplete(0);
             }
         }
     };

     const handleClear = () => {
         if (history.length === 0 || showVictory) return;
         const lastHistory = [...history];
         setHistory([]);
         setCurrentSum(0);
         const newOpts = [...options];
         lastHistory.forEach(h => { newOpts[h.index] = h.value; });
         setOptions(newOpts);
     };
 
     return (
         <div className="flex flex-col h-full bg-brand-bg relative">
             <GameHeader title={`Soma Alvo (Nv.${level})`} icon={<Target size={24} className="text-green-600"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="+10s (Vídeo)" highScore={highScore} scoreLabel="Máx Pontos" rightContent={<span className="font-bold text-red-500">{timeLeft}s</span>} />
            {showVictory && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6 animate-in fade-in" style={{pointerEvents: 'auto'}}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
                        <Trophy className="mx-auto text-yellow-500 mb-4 animate-bounce" size={64}/>
                        <h2 className="text-2xl font-black text-gray-800 mb-2">Alvo Atingido!</h2>
                        <div className="flex flex-col gap-3 mt-4">
                            <button onClick={handleNextLevel} className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2"><ArrowRight size={20}/> Próximo Nível (+5 pts)</button>
                            <button onClick={() => onComplete(score + 5)} className="w-full bg-green-100 text-green-800 py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2"><StopCircle size={20}/> Parar e Resgatar</button>
                        </div>
                    </div>
                </div>
            )}
             <div className="p-6 flex flex-col flex-grow">
                 <div className="bg-white p-6 rounded-3xl text-center shadow-soft mb-8 relative">
                     <p className="text-gray-400 text-sm mb-1">Meta</p>
                     <div className="text-6xl font-black text-gray-800 tracking-tighter">{target}</div>
                     <p className={`mt-2 font-bold text-lg transition-colors ${currentSum > target ? 'text-red-500' : 'text-green-600'}`}>{currentSum}</p>
                     <button onClick={handleClear} disabled={currentSum === 0 || showVictory} className="absolute right-4 top-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-30"><Trash2 size={20} className="text-gray-600"/></button>
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                     {options.map((num, i) => (
                         <button key={i} disabled={num === -1 || showVictory} onClick={() => add(num, i)} className={`aspect-square rounded-2xl text-2xl font-bold transition-all ${num === -1 ? 'opacity-0 pointer-events-none' : 'bg-white shadow-soft hover:bg-green-50 text-gray-700 active:scale-95'}`}>{num}</button>
                     ))}
                 </div>
             </div>
         </div>
     );
 };

export const CardGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    // ... kept same
    const [currentCard, setCurrentCard] = useState(5);
    const [nextCard, setNextCard] = useState(8); 
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [hint, setHint] = useState<string | null>(null);

    useEffect(() => {
        const c1 = Math.floor(Math.random() * 13) + 1;
        const c2 = Math.floor(Math.random() * 13) + 1;
        setCurrentCard(c1);
        setNextCard(c2);
    }, []);

    const handleGuess = (higher: boolean) => {
        setHint(null); 
        if ((higher && nextCard >= currentCard) || (!higher && nextCard <= currentCard)) {
            playSuccessSound();
            const comboBonus = Math.min(combo, 5); 
            setScore(s => s + 2 + comboBonus);
            setCombo(c => c + 1);
            setCurrentCard(nextCard);
            setNextCard(Math.floor(Math.random() * 13) + 1); 
        } else {
            playFailureSound();
            alert(`Era ${nextCard}! Fim de jogo.`);
            onComplete(score);
        }
    }

    const handleAdvantage = () => { onRequestAd(() => { const type = nextCard > 7 ? "Alta (>7)" : "Baixa (<=7)"; setHint(`O oráculo viu: A próxima é ${type}`); }); }

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader title="Cartas" icon={<Copy size={24} className="text-red-600"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Dica (Vídeo)" highScore={highScore} scoreLabel="Máx Pontos"/>
            <div className="flex-grow flex flex-col items-center justify-center gap-8 p-6">
                <div className="h-8">
                    {combo >= 2 && ( <div className="bg-orange-100 text-orange-600 px-4 py-1 rounded-full font-bold text-sm animate-bounce flex items-center gap-1"><Flame size={14}/> COMBO x{combo} (+{Math.min(combo, 5)})</div> )}
                </div>
                <div className="bg-white w-40 h-56 rounded-2xl shadow-lg border-2 border-red-200 flex items-center justify-center relative">
                    <span className="text-6xl font-black text-red-600">{currentCard}</span>
                    <div className="absolute top-2 left-2 text-red-600">♥</div>
                    <div className="absolute bottom-2 right-2 text-red-600 rotate-180">♥</div>
                </div>
                <div className="flex flex-col w-full gap-4 items-center">
                    <div className="flex gap-4 w-full">
                        <button onClick={() => handleGuess(false)} className="flex-1 bg-blue-100 text-blue-800 py-4 rounded-xl font-bold flex flex-col items-center transition-transform active:scale-95"><ArrowDown/> Menor</button>
                        <button onClick={() => handleGuess(true)} className="flex-1 bg-red-100 text-red-800 py-4 rounded-xl font-bold flex flex-col items-center transition-transform active:scale-95"><ArrowUp/> Maior</button>
                    </div>
                    {hint && ( <div className="bg-yellow-50 text-yellow-800 p-3 rounded-xl border border-yellow-200 text-sm font-bold animate-in fade-in w-full text-center">{hint}</div> )}
                </div>
            </div>
        </div>
    );
}

export const PatternGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    // ... kept same
    const [pattern, setPattern] = useState<number[]>([]);
    const [userPattern, setUserPattern] = useState<number[]>([]);
    const [phase, setPhase] = useState<'memorize' | 'recall'>('memorize');
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [highlighted, setHighlighted] = useState<number | null>(null);

    useEffect(() => { startLevel(1); }, []);

    const startLevel = (lvl: number) => {
        setPhase('memorize');
        setUserPattern([]);
        const len = 3 + Math.floor(lvl / 2);
        const newPat = Array.from({length: len}, () => Math.floor(Math.random() * 9));
        setPattern(newPat);
        let i = 0;
        const interval = setInterval(() => {
            if (i >= newPat.length) { clearInterval(interval); setHighlighted(null); setPhase('recall'); return; }
            setHighlighted(newPat[i]);
            setTimeout(() => setHighlighted(null), 400); 
            i++;
        }, 800); 
    };

    const handleTap = (idx: number) => {
        if(phase === 'memorize') return;
        setHighlighted(idx);
        setTimeout(() => setHighlighted(null), 200);
        const newUp = [...userPattern, idx];
        setUserPattern(newUp);
        playSuccessSound(); 
        if(newUp[newUp.length-1] !== pattern[newUp.length-1]) { playFailureSound(); onComplete(0); return; }
        if(newUp.length === pattern.length) {
            playSuccessSound();
            const bonus = level * 2;
            setScore(s => s + bonus);
            setLevel(l => l + 1);
            setTimeout(() => startLevel(level + 1), 1000);
        }
    };

    const handleAdvantage = () => { onRequestAd(() => { startLevel(level); }); }

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader title="Padrões" icon={<Grid3X3 size={24} className="text-indigo-500"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Ver de Novo (Vídeo)" highScore={highScore} scoreLabel="Máx Pontos"/>
            <div className="flex-grow flex items-center justify-center p-6">
                <div className="grid grid-cols-3 gap-3 w-full max-w-sm aspect-square">
                    {[0,1,2,3,4,5,6,7,8].map(i => {
                        const isActive = highlighted === i;
                        return ( <button key={i} onClick={() => handleTap(i)} disabled={phase === 'memorize'} className={`rounded-xl transition-all duration-200 ${isActive ? 'bg-indigo-500 scale-95 shadow-glow' : 'bg-white shadow-sm hover:bg-gray-50'}`}/> )
                    })}
                </div>
            </div>
            <p className="text-center pb-8 font-bold text-gray-500 transition-opacity duration-500">{phase === 'memorize' ? 'Memorize a ordem...' : 'Sua vez!'}</p>
        </div>
    );
}

export const EstimateGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    // ... kept same
    const [count, setCount] = useState(0);
    const [items, setItems] = useState<any[]>([]);
    const [phase, setPhase] = useState<'show'|'guess'>('show');
    const [score, setScore] = useState(0);
    const [hint, setHint] = useState<string | null>(null);

    useEffect(() => { startRound(); }, []);

    const startRound = () => {
        setPhase('show');
        setHint(null);
        const difficulty = Math.floor(score / 10);
        const minItems = 5 + difficulty;
        const maxItems = 20 + (difficulty * 5); 
        const c = Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems;
        setCount(c);
        setItems(Array.from({length: c}, (_, i) => ({ id: i, x: Math.random() * 80 + 10, y: Math.random() * 80 + 10, color: ['red','blue','green','yellow'][Math.floor(Math.random()*4)] })));
        const showTime = Math.max(1500, 3000 - (difficulty * 100));
        setTimeout(() => setPhase('guess'), showTime); 
    };

    const handleGuess = (guess: number) => {
        const diff = Math.abs(guess - count);
        if (diff === 0) { playSuccessSound(); setScore(s => s + 10); startRound(); } 
        else if (diff <= 1 && count > 15) { playSuccessSound(); setScore(s => s + 5); alert("Quase! Aceitamos por pouco."); startRound(); } 
        else { playFailureSound(); alert(`Eram ${count} itens!`); onComplete(score); }
    }

    const handleAdvantage = () => { onRequestAd(() => { setHint(`A quantidade está entre ${Math.max(0, count - 2)} e ${count + 2}`); }); }

    return (
        <div className="flex flex-col h-full bg-brand-bg relative overflow-hidden">
            <GameHeader title="Estimativa" icon={<Activity size={24} className="text-orange-500"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Dica de Faixa (Vídeo)" highScore={highScore} scoreLabel="Máx Pontos"/>
            {phase === 'show' ? (
                <div className="flex-grow relative">
                    {items.map(it => ( <div key={it.id} className="absolute w-4 h-4 rounded-full" style={{left: it.x+'%', top: it.y+'%', backgroundColor: it.color}} /> ))}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="text-4xl font-black opacity-20">OBSERVE</span></div>
                </div>
            ) : (
                <div className="flex-grow flex flex-col items-center justify-center p-6 gap-4">
                    <h3 className="text-2xl font-bold">Quantos itens haviam?</h3>
                    <div className="grid grid-cols-3 gap-4 w-full">
                        {[count-2, count-1, count, count+1, count+2, count+5].sort(()=>Math.random()-0.5).map(opt => ( <button key={opt} onClick={() => handleGuess(opt)} className="bg-white p-4 rounded-xl shadow-sm border font-bold text-xl hover:bg-orange-50 active:scale-95">{opt}</button> ))}
                    </div>
                    {hint && ( <div className="bg-yellow-50 text-yellow-800 p-3 rounded-xl border border-yellow-200 text-sm font-bold animate-in fade-in w-full text-center">{hint}</div> )}
                </div>
            )}
        </div>
    );
}

export const ColorMatchGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [word, setWord] = useState("");
    const [color, setColor] = useState("");
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [questionType, setQuestionType] = useState<'meaning'|'color'>('meaning');
    
    const colors = ['red', 'blue', 'green', 'yellow'];
    const words = ['VERMELHO', 'AZUL', 'VERDE', 'AMARELO'];
    const map = { 'VERMELHO': 'red', 'AZUL': 'blue', 'VERDE': 'green', 'AMARELO': 'yellow' };

    useEffect(() => { nextRound(); }, []);

    useEffect(() => {
        const t = setInterval(() => {
            setTimeLeft(prev => {
                if(prev<=0) { clearInterval(t); onComplete(score); return 0; }
                return prev-1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [score]);

    const nextRound = () => {
        const w = words[Math.floor(Math.random()*4)];
        const c = colors[Math.floor(Math.random()*4)];
        setWord(w);
        setColor(c);
        setQuestionType(Math.random() > 0.5 ? 'meaning' : 'color');
    }

    const handleAnswer = (ans: string) => {
        const correct = questionType === 'meaning' ? map[word as keyof typeof map] : color;
        if(ans === correct) {
            playSuccessSound();
            setScore(s => s + 1); // Reward adjusted to 1
            nextRound();
        } else {
            playFailureSound();
            alert("Errou!");
            onComplete(score);
        }
    }

    const handleAdvantage = () => {
        onRequestAd(() => {
            setTimeLeft(t => t + 15);
        });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader title="Cores" icon={<Palette size={24} className="text-pink-500"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="+15s (Vídeo)" highScore={highScore} scoreLabel="Máx Pontos" rightContent={<span className="font-bold text-red-500">{timeLeft}s</span>} />
            <div className="flex-grow flex flex-col items-center justify-center p-6 gap-8">
                <h3 className="text-xl font-bold uppercase text-gray-500">Toque na {questionType === 'meaning' ? 'PALAVRA' : 'COR'}</h3>
                <div className="text-6xl font-black" style={{color: color}}>
                    {word}
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                    {colors.map(c => (
                        <button key={c} onClick={() => handleAnswer(c)} className="h-20 rounded-2xl shadow-sm border-2 border-white" style={{backgroundColor: c}} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export const HiddenObjectGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [grid, setGrid] = useState<any[]>([]);
    const [target, setTarget] = useState<any>(null);
    const [score, setScore] = useState(0);

    const icons = [Circle, Square, TriangleIcon, StarIcon, Heart]; 
    
    useEffect(() => { startRound(); }, []);

    const startRound = () => {
        const tIcon = icons[Math.floor(Math.random()*icons.length)];
        setTarget({icon: tIcon, color: 'text-red-500'});
        
        // Difficulty increase: Random rotation for noise
        const newGrid = Array.from({length: 25}, (_, i) => ({
            id: i,
            icon: Math.random() > 0.1 ? icons[Math.floor(Math.random()*icons.length)] : tIcon,
            color: ['text-blue-500','text-green-500','text-yellow-500'][Math.floor(Math.random()*3)],
            rotation: Math.floor(Math.random() * 4) * 90 // 0, 90, 180, 270
        }));
        const targetIdx = Math.floor(Math.random() * 25);
        newGrid[targetIdx] = { id: targetIdx, icon: tIcon, color: 'text-red-500', rotation: Math.floor(Math.random() * 4) * 90 };
        setGrid(newGrid);
    };

    const handleTap = (item: any) => {
        if(item.icon === target.icon && item.color === target.color) {
            playSuccessSound();
            setScore(s => s + 1); // Reward adjusted to 1
            startRound();
        } else {
            playFailureSound();
            alert("Item errado!");
            onComplete(score);
        }
    }

    const handleAdvantage = () => {
        onRequestAd(() => {
            alert("O item é vermelho!");
        });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader title="Oculto" icon={<Search size={24} className="text-gray-600"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Dica (Vídeo)" highScore={highScore} scoreLabel="Máx Pontos" />
            <div className="p-4 bg-white shadow-sm mb-4 text-center">
                <span className="text-sm font-bold text-gray-500">Encontre este item:</span>
                <div className="flex justify-center mt-2 p-2 bg-gray-100 rounded-xl inline-block mx-auto">
                    {target && <target.icon size={32} className={target.color} />}
                </div>
            </div>
            <div className="flex-grow grid grid-cols-5 gap-2 p-4 content-start">
                {grid.map(item => (
                    <button key={item.id} onClick={() => handleTap(item)} className="aspect-square bg-white rounded-lg flex items-center justify-center shadow-sm hover:bg-gray-50 active:scale-90 transition-transform">
                        <div style={{ transform: `rotate(${item.rotation}deg)` }}>
                            <item.icon size={24} className={item.color} />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

const TriangleIcon = ({size, className}:{size:number, className?:string}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2L2 22h20L12 2z"/></svg>
);
const StarIcon = ({size, className}:{size:number, className?:string}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
);

// REFORMULATED MATH RAIN GAME
export const MathRainGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [drop, setDrop] = useState<{id: number, text: string, answer: number, y: number} | null>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [options, setOptions] = useState<number[]>([]);
    const [speed, setSpeed] = useState(0.2); // Slower start
    
    const reqRef = useRef<number>();

    // Start or Reset Drop
    const spawnDrop = () => {
        const a = Math.floor(Math.random() * 10);
        const b = Math.floor(Math.random() * 10);
        const ans = a + b;
        
        // Generate options including answer
        const opts = new Set<number>();
        opts.add(ans);
        while(opts.size < 3) opts.add(ans + Math.floor(Math.random() * 5) - 2);
        
        setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
        setDrop({ id: Date.now(), text: `${a} + ${b}`, answer: ans, y: -10 });
    };

    useEffect(() => {
        spawnDrop();
    }, []);

    useEffect(() => {
        if (gameOver) return;

        const loop = () => {
            setDrop(prev => {
                if (!prev) return null;
                const newY = prev.y + speed;
                
                if (newY > 90) {
                    // Hit the ground
                    playFailureSound();
                    setGameOver(true);
                    alert(`Oops! A conta caiu. Resposta: ${prev.answer}`);
                    onComplete(score);
                    return prev;
                }
                return { ...prev, y: newY };
            });
            reqRef.current = requestAnimationFrame(loop);
        };
        reqRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(reqRef.current!);
    }, [gameOver, score, speed]);

    const handleAnswer = (val: number) => {
        if (!drop || gameOver) return;
        
        if (val === drop.answer) {
            playSuccessSound();
            setScore(s => s + 1);
            setSpeed(s => Math.min(s + 0.02, 1.5)); // Increase speed cap
            spawnDrop();
        } else {
            playFailureSound();
            setGameOver(true);
            alert(`Incorreto! A resposta era ${drop.answer}`);
            onComplete(score);
        }
    };

    const handleAdvantage = () => {
        setGameOver(true); // Pause
        onRequestAd(() => {
            setGameOver(false);
            setDrop(prev => prev ? { ...prev, y: 10 } : null); // Reset height
        });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg relative overflow-hidden">
            <GameHeader title="Chuva" icon={<CloudRain size={24} className="text-blue-500"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Parar Chuva (Vídeo)" highScore={highScore} scoreLabel="Máx Pontos" />
            
            {/* Sky Area */}
            <div className="flex-grow relative bg-blue-50/50">
                {drop && (
                    <div 
                        className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
                        style={{ top: `${drop.y}%` }}
                    >
                        <div className="text-blue-500 animate-bounce"><Umbrella size={40} fill="currentColor" className="opacity-20"/></div>
                        <div className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-2xl shadow-lg border-2 border-blue-400">
                            {drop.text}
                        </div>
                        <div className="w-0.5 h-10 bg-blue-300 opacity-50 mt-1"></div>
                    </div>
                )}
                
                {/* Ground Line */}
                <div className="absolute bottom-0 w-full h-1 bg-red-400 opacity-30"></div>
            </div>

            {/* Controls */}
            <div className="p-6 bg-white border-t border-gray-100 grid grid-cols-3 gap-4 pb-10">
                {options.map((opt, i) => (
                    <button 
                        key={i} 
                        onClick={() => handleAnswer(opt)} 
                        className="bg-gray-100 hover:bg-blue-100 text-gray-800 font-black text-2xl py-6 rounded-2xl shadow-sm active:scale-95 transition-all border-b-4 border-gray-200"
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}

export const MovingHuntGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    const [items, setItems] = useState<any[]>([]);
    const [score, setScore] = useState(0);
    const reqRef = useRef<number>();

    useEffect(() => {
        // Difficulty Logic: Add more distractors every 3 points
        const baseItems = 10;
        const extraItems = Math.floor(score / 3);
        const totalItems = Math.min(30, baseItems + extraItems); // Cap at 30 items

        setItems(Array.from({length: totalItems}, (_, i) => ({
            id: i,
            x: Math.random()*80, y: Math.random()*80,
            vx: (Math.random()-0.5), vy: (Math.random()-0.5),
            isTarget: i === 0
        })));

        const loop = () => {
            // Difficulty Logic: Increase speed multiplier based on score
            const speedMultiplier = 1 + (score * 0.1); 

            setItems(prev => prev.map(p => {
                let nx = p.x + (p.vx * speedMultiplier);
                let ny = p.y + (p.vy * speedMultiplier);
                if(nx < 0 || nx > 90) p.vx *= -1;
                if(ny < 0 || ny > 90) p.vy *= -1;
                return {...p, x: nx, y: ny};
            }));
            reqRef.current = requestAnimationFrame(loop);
        };
        reqRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(reqRef.current!);
    }, [score]);

    const handleTap = (isTarget: boolean) => {
        if(isTarget) {
            playSuccessSound();
            setScore(s => s + 1); // Reward adjusted to 1
        } else {
            playFailureSound();
            onComplete(score);
        }
    }

    const handleAdvantage = () => {
        onRequestAd(() => {
            alert("Câmera Lenta Ativada!");
        });
    }

    return (
        <div className="flex flex-col h-full bg-brand-bg relative overflow-hidden">
            <GameHeader title="Caça" icon={<MousePointerClick size={24} className="text-red-500"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Lento (Vídeo)" highScore={highScore} scoreLabel="Máx Pontos" />
            <div className="flex-grow relative">
                {items.map(it => (
                    <button 
                        key={it.id} 
                        onClick={() => handleTap(it.isTarget)}
                        className={`absolute w-12 h-12 rounded-full shadow-sm flex items-center justify-center transition-colors ${it.isTarget ? 'bg-red-500 z-10' : 'bg-gray-300 z-0'}`}
                        style={{left: it.x+'%', top: it.y+'%'}}
                    >
                        {it.isTarget && <Target className="text-white" size={20}/>}
                    </button>
                ))}
            </div>
        </div>
    );
}

export const IntruderGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    // ... kept same
    const [task, setTask] = useState<IntruderTask | null>(null);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const t = await generateIntruderTask();
        if(t) setTask(t);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    const handleGuess = (item: string) => {
        if(!task) return;
        if(item === task.intruder) {
            playSuccessSound();
            setScore(s => s + 10);
            alert(`Correto! ${task.reason}`);
            load();
        } else {
            playFailureSound();
            alert("Não é esse o intruso.");
            onComplete(score);
        }
    }

    const handleAdvantage = () => { onRequestAd(() => { if(task) alert(`Dica: ${task.reason}`); }); }

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader title="Intruso" icon={<Search size={24} className="text-purple-600"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Dica (Vídeo)" highScore={highScore} scoreLabel="Máx Pontos" />
            <div className="flex-grow flex flex-col items-center justify-center p-6 gap-6">
                <h3 className="text-xl font-bold text-gray-700">Qual item não pertence?</h3>
                {loading ? <Loader2 className="animate-spin text-purple-500" size={48}/> : (
                    <div className="grid grid-cols-2 gap-4 w-full">
                        {task?.items.map((item, i) => (
                            <button key={i} onClick={() => handleGuess(item)} className="bg-white p-6 rounded-2xl shadow-sm font-bold text-lg hover:bg-purple-50 active:scale-95 transition-all border border-gray-100">{item}</button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export const ScrambleGame: React.FC<GameProps> = ({ onComplete, onExit, onRequestAd, highScore }) => {
    // ... kept same
    const [task, setTask] = useState<ScrambleTask | null>(null);
    const [input, setInput] = useState("");
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const t = await generateScrambleTask();
        if(t) setTask(t);
        setInput("");
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    const check = () => {
        if(!task) return;
        if(input.trim().toUpperCase() === task.word.toUpperCase()) {
            playSuccessSound();
            setScore(s => s + 15);
            load();
        } else {
            playFailureSound();
            alert("Incorreto. Tente novamente.");
        }
    }

    const handleAdvantage = () => { onRequestAd(() => { if(task) alert(`Dica: ${task.hint}`); }); }

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <GameHeader title="Embaralhado" icon={<Type size={24} className="text-indigo-600"/>} onExit={onExit} currentCoins={score} onCollect={() => onComplete(score)} onGetAdvantage={handleAdvantage} advantageLabel="Dica (Vídeo)" highScore={highScore} scoreLabel="Máx Pontos" />
            <div className="flex-grow flex flex-col items-center justify-center p-6 gap-8">
                {loading ? <Loader2 className="animate-spin text-indigo-500" size={48}/> : (
                    <>
                        <div className="text-center">
                            <p className="text-sm text-gray-400 font-bold uppercase mb-2">Desembaralhe:</p>
                            <div className="text-4xl font-black text-indigo-600 tracking-widest break-all">{task?.scrambled}</div>
                        </div>
                        <input value={input} onChange={(e) => setInput(e.target.value.toUpperCase())} className="w-full p-4 text-center text-xl font-bold rounded-2xl border-2 border-indigo-100 focus:border-indigo-500 outline-none uppercase" placeholder="Sua resposta..." />
                        <button onClick={check} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-transform">Verificar</button>
                    </>
                )}
            </div>
        </div>
    );
}
