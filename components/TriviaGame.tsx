
import React, { useState, useEffect } from 'react';
import { Check, X, Coins, Brain, ArrowRight, Video, ThumbsUp, ThumbsDown, HelpCircle, Trophy, Star, Heart, Sparkles } from 'lucide-react';
import { LoadingScreen } from './LoadingScreen';
import { playSuccessSound, playFailureSound } from '../services/audioService';

interface TriviaGameProps {
  onComplete: (score: number) => void;
  onExit: () => void;
  userCoins: number;
  onUseCoins: (amount: number) => boolean;
  onRequestAd: (cb: () => void) => void;
  highScore?: number; // Usado como Nível Atual
  lives: number;
  onLoseLife: () => void;
}

// 200 PERGUNTAS ÚNICAS
const FACTS_DB = [
    { s: "O Sol é uma estrela.", isFact: true, exp: "Sim, é a anã amarela central do nosso sistema." },
    { s: "A Grande Muralha da China é a única obra humana visível da Lua.", isFact: false, exp: "Mito. Nenhuma obra é visível a olho nu da Lua." },
    { s: "Tomate é biologicamente uma fruta.", isFact: true, exp: "Possui sementes e desenvolve-se da flor." },
    { s: "Peixinhos dourados têm memória de 3 segundos.", isFact: false, exp: "Mito. Eles lembram de fatos por meses." },
    { s: "O Monte Everest cresce alguns milímetros por ano.", isFact: true, exp: "Devido à tectônica de placas." },
    { s: "Avestruzes enterram a cabeça quando sentem perigo.", isFact: false, exp: "Mito. Eles deitam o pescoço no chão para camuflagem." },
    { s: "O Brasil é o maior produtor mundial de café.", isFact: true, exp: "Lidera o mercado há mais de 150 anos." },
    { s: "Morcegos são cegos.", isFact: false, exp: "Mito. Eles enxergam bem, mas usam eco-localização no escuro." },
    { s: "Raios nunca caem duas vezes no mesmo lugar.", isFact: false, exp: "Mito. Prédios altos são atingidos centenas de vezes." },
    { s: "O mel pode durar milhares de anos sem estragar.", isFact: true, exp: "Arqueólogos já acharam mel comestível em tumbas egípcias." },
    { s: "Nós usamos apenas 10% do nosso cérebro.", isFact: false, exp: "Mito. Usamos todo o cérebro, mesmo dormindo." },
    { s: "A baleia-azul é o animal mais barulhento do mundo.", isFact: true, exp: "Seu canto pode ser ouvido a 800km de distância." },
    { s: "O Deserto do Saara é o maior do mundo.", isFact: false, exp: "Mito. A Antártida é o maior (deserto polar)." },
    { s: "O coração do camarão fica na cabeça.", isFact: true, exp: "Verdade. Seus órgãos vitais estão no cefalotórax." },
    { s: "Tornados não ocorrem no Hemisfério Sul.", isFact: false, exp: "Mito. Ocorrem, inclusive no Brasil." },
    { s: "Vidro é feito de areia derretida.", isFact: true, exp: "Sim, areia de sílica aquecida a 1700°C." },
    { s: "A língua é o músculo mais forte do corpo.", isFact: false, exp: "Mito. O masseter (mandíbula) tem a maior força bruta." },
    { s: "Sydney é a capital da Austrália.", isFact: false, exp: "Mito. A capital é Canberra." },
    { s: "Temos mais bactérias que células humanas no corpo.", isFact: true, exp: "A microbiota é vasta e essencial." },
    { s: "Japão significa 'Origem do Sol'.", isFact: true, exp: "Por isso é a Terra do Sol Nascente." },
    { s: "Napoleão era extremamente baixo.", isFact: false, exp: "Mito. Ele tinha estatura média para a época." },
    { s: "Bananas nascem em árvores.", isFact: false, exp: "Mito. Bananeira é uma erva gigante, não tem tronco lenhoso." },
    { s: "O diamante é o material natural mais duro.", isFact: true, exp: "Nota 10 na escala Mohs." },
    { s: "Elefantes têm medo irracional de ratos.", isFact: false, exp: "Mito. Eles se assustam com movimentos surpresa, não com ratos." },
    { s: "A água conduz eletricidade pura.", isFact: false, exp: "Mito. Água pura é isolante; minerais na água conduzem." },
    { s: "Polvos têm três corações.", isFact: true, exp: "Dois bombeiam para as brânquias, um para o corpo." },
    { s: "Vikings usavam chifres nos capacetes.", isFact: false, exp: "Mito. Isso foi invenção de óperas do século 19." },
    { s: "O Universo está em expansão.", isFact: true, exp: "Descoberto por Edwin Hubble em 1929." },
    { s: "Cleópatra era egípcia.", isFact: false, exp: "Mito. Ela era de ascendência grega macedônica." },
    { s: "O som não se propaga no vácuo.", isFact: true, exp: "O som precisa de um meio físico para viajar." },
    { s: "Touros odeiam a cor vermelha.", isFact: false, exp: "Mito. Touros são daltônicos ao vermelho; o movimento os irrita." },
    { s: "A luz do Sol leva 8 minutos para chegar à Terra.", isFact: true, exp: "Aproximadamente 8 minutos e 20 segundos." },
    { s: "Estalar os dedos causa artrite.", isFact: false, exp: "Mito. O som é gás estourando nas articulações." },
    { s: "O Vaticano é o menor país do mundo.", isFact: true, exp: "Tem apenas 0,44 km²." },
    { s: "Pinguins vivem no Polo Norte.", isFact: false, exp: "Mito. Vivem quase exclusivamente no Hemisfério Sul." },
    { s: "O ser humano compartilha 50% do DNA com bananas.", isFact: true, exp: "Compartilhamos genes básicos de funções celulares." },
    { s: "A Muralha da China é visível do espaço.", isFact: false, exp: "Mito. É muito estreita para ser vista sem zoom." },
    { s: "Vênus gira no sentido horário.", isFact: true, exp: "É o único planeta do sistema solar com rotação retrógrada." },
    { s: "Cabelos e unhas continuam crescendo após a morte.", isFact: false, exp: "Mito. A pele encolhe, criando essa ilusão." },
    { s: "O Nilo é o rio mais longo do mundo.", isFact: true, exp: "Embora o Amazonas dispute, o Nilo é geralmente aceito." },
    { s: "Einstein reprovou em matemática.", isFact: false, exp: "Mito. Ele era excelente em matemática desde cedo." },
    { s: "Salzburgo é a cidade natal de Mozart.", isFact: true, exp: "Localizada na Áustria." },
    { s: "O tubarão é um mamífero.", isFact: false, exp: "Mito. Tubarões são peixes cartilaginosos." },
    { s: "O Alasca pertenceu à Rússia.", isFact: true, exp: "Os EUA compraram o Alasca em 1867." },
    { s: "A Torre Eiffel cresce no verão.", isFact: true, exp: "O metal dilata com o calor, crescendo até 15cm." },
    { s: "O camelo armazena água nas corcovas.", isFact: false, exp: "Mito. Armazena gordura para energia." },
    { s: "O primeiro homem na Lua foi Yuri Gagarin.", isFact: false, exp: "Mito. Foi Neil Armstrong. Gagarin foi o primeiro no espaço." },
    { s: "Girafas têm a língua azul/roxa.", isFact: true, exp: "Para proteger contra queimaduras solares enquanto comem." },
    { s: "O Titanic afundou em 1912.", isFact: true, exp: "Após colidir com um iceberg." },
    { s: "Aranhas são insetos.", isFact: false, exp: "Mito. São aracnídeos (8 patas vs 6 dos insetos)." },
    { s: "O Sol é 400 vezes maior que a Lua.", isFact: true, exp: "E está 400 vezes mais longe, por isso parecem iguais." },
    { s: "O Mar Morto é tão salgado que você flutua.", isFact: true, exp: "A densidade do sal impede que afunde." },
    { s: "Sushi significa 'peixe cru'.", isFact: false, exp: "Mito. Significa 'arroz azedo' (temperado com vinagre)." },
    { s: "A Guerra dos 100 Anos durou 100 anos.", isFact: false, exp: "Mito. Durou 116 anos." },
    { s: "O abacate é um vegetal.", isFact: false, exp: "Mito. É uma fruta." },
    { s: "O esqueleto humano adulto tem 206 ossos.", isFact: true, exp: "Bebês nascem com mais, que se fundem." },
    { s: "O chocolate é tóxico para cães.", isFact: true, exp: "Contém teobromina, que eles não metabolizam." },
    { s: "O lado oculto da Lua é sempre escuro.", isFact: false, exp: "Mito. Recebe luz solar, mas não o vemos da Terra." },
    { s: "O hino nacional da França chama-se Marselhesa.", isFact: true, exp: "Composto durante a Revolução Francesa." },
    { s: "Van Gogh cortou a orelha direita.", isFact: false, exp: "Mito. Foi a esquerda (ou parte dela)." },
    { s: "O bambu cresce muito rápido.", isFact: true, exp: "Certas espécies crescem até 90cm por dia." },
    { s: "O planeta Marte é vermelho devido à ferrugem.", isFact: true, exp: "Óxido de ferro na superfície." },
    { s: "O ouro é magnético.", isFact: false, exp: "Mito. Ouro puro não é atraído por ímãs." },
    { s: "A Estátua da Liberdade foi um presente da França.", isFact: true, exp: "Inaugurada em 1886 em Nova York." },
    { s: "O diabo-da-tasmânia é real.", isFact: true, exp: "É um marsupial carnívoro da Austrália." },
    { s: "O violino tem 6 cordas.", isFact: false, exp: "Mito. Tem 4 cordas." },
    { s: "O Brasil faz fronteira com o Chile.", isFact: false, exp: "Mito. Chile e Equador não tocam o Brasil." },
    { s: "A capital do Canadá é Toronto.", isFact: false, exp: "Mito. É Ottawa." },
    { s: "O DNA humano é 99,9% igual entre as pessoas.", isFact: true, exp: "As diferenças físicas estão no 0,1% restante." },
    { s: "Golfinhos dormem com um olho aberto.", isFact: true, exp: "Para monitorar predadores e subir para respirar." },
    { s: "O Saara já foi uma floresta tropical.", isFact: true, exp: "Mudanças climáticas alteraram a região há milênios." },
    { s: "O tomate veio da Itália.", isFact: false, exp: "Mito. Veio das Américas (Andes)." },
    { s: "A Mona Lisa não tem sobrancelhas.", isFact: true, exp: "Provavelmente raspadas por moda da época ou desbotaram." },
    { s: "A água quente congela mais rápido que a fria.", isFact: true, exp: "Efeito Mpemba, em certas condições." },
    { s: "Cobras são surdas.", isFact: false, exp: "Mito. Ouvem vibrações pelo solo e sons graves." },
    { s: "O Monte Fuji fica na China.", isFact: false, exp: "Mito. Fica no Japão." },
    { s: "O ser humano tem 5 sentidos.", isFact: false, exp: "Mito. Temos mais, como equilíbrio (vestibular) e temperatura." },
    { s: "O plástico leva 400 anos para se decompor.", isFact: true, exp: "Dependendo do tipo, pode levar até mais." },
    { s: "A Terra é perfeitamente redonda.", isFact: false, exp: "Mito. É um esferoide oblato (achatada nos polos)." },
    { s: "O hipopótamo é parente da baleia.", isFact: true, exp: "Evolutivamente, são os parentes vivos mais próximos." },
    { s: "Sherlock Holmes dizia 'Elementar, meu caro Watson'.", isFact: false, exp: "Mito. A frase exata nunca aparece nos livros originais." },
    { s: "O morango é uma baga.", isFact: false, exp: "Mito. É um fruto agregado. A banana é que é uma baga." },
    { s: "O Brasil tem 26 estados e 1 distrito federal.", isFact: true, exp: "Correto." },
    { s: "A Guerra Fria foi um conflito armado direto.", isFact: false, exp: "Mito. Foi uma tensão geopolítica sem guerra direta." },
    { s: "A penicilina foi descoberta por acidente.", isFact: true, exp: "Alexander Fleming notou mofo matando bactérias." },
    { s: "O Everest é a montanha mais alta desde o centro da Terra.", isFact: false, exp: "Mito. O Chimborazo (Equador) é, devido ao formato da Terra." },
    { s: "O Brasil sediou a Copa de 1950.", isFact: true, exp: "E perdeu a final para o Uruguai (Maracanaço)." },
    { s: "A capital da Turquia é Istambul.", isFact: false, exp: "Mito. É Ancara." },
    { s: "O café desidrata.", isFact: false, exp: "Mito. O efeito diurético é leve e não supera a hidratação da água." },
    { s: "A Grande Muralha da China tem mais de 20.000 km.", isFact: true, exp: "Contando todas as ramificações." },
    { s: "O Aconcágua fica no Brasil.", isFact: false, exp: "Mito. Fica na Argentina." },
    { s: "O urso polar é canhoto.", isFact: false, exp: "Mito. Não há evidências científicas disso." },
    { s: "A Amazonia é o pulmão do mundo.", isFact: false, exp: "Mito. Oceanos (algas) produzem a maior parte do oxigênio." },
    { s: "O sangue é azul dentro do corpo.", isFact: false, exp: "Mito. É sempre vermelho (escuro ou claro)." },
    { s: "O inventor da lâmpada foi Thomas Edison.", isFact: true, exp: "Popularizou a lâmpada incandescente comercial." },
    { s: "O Brasil foi descoberto em 1492.", isFact: false, exp: "Mito. Foi em 1500. 1492 foi a América (Colombo)." },
    { s: "O Ornitorrinco põe ovos.", isFact: true, exp: "É um dos poucos mamíferos monotremados." },
    { s: "O vidro é um líquido lento.", isFact: false, exp: "Mito. É um sólido amorfo." },
    { s: "A capital dos EUA é Nova York.", isFact: false, exp: "Mito. É Washington D.C." },
    { s: "O ser humano pode lamber o próprio cotovelo.", isFact: false, exp: "Mito. A anatomia torna quase impossível para a maioria." },
    { s: "O menor osso do corpo é o estribo.", isFact: true, exp: "Fica dentro do ouvido." },
    { s: "O sushi foi inventado na China.", isFact: true, exp: "A técnica de conservar peixe em arroz começou lá." },
    { s: "O Brasil é o 5º maior país do mundo.", isFact: true, exp: "Em extensão territorial." },
    { s: "Ratos gostam de queijo.", isFact: false, exp: "Mito. Preferem doces e grãos; o cheiro forte do queijo os afasta." },
    { s: "O sol é branco.", isFact: true, exp: "Visto do espaço, é branco. A atmosfera o deixa amarelo." },
    { s: "O avião foi inventado apenas pelos irmãos Wright.", isFact: false, exp: "Mito. Santos Dumont foi pioneiro com decolagem autônoma." },
    { s: "O deserto do Atacama é o mais seco do mundo.", isFact: true, exp: "Algumas áreas nunca registraram chuva." },
    { s: "O Brasil tem 4 fusos horários.", isFact: true, exp: "Incluindo as ilhas oceânicas." },
    { s: "A girafa dorme em pé.", isFact: true, exp: "Na maior parte do tempo, por segurança." },
    { s: "O tomate tem mais genes que o humano.", isFact: true, exp: "Cerca de 31 mil contra 20-25 mil humanos." },
    { s: "O tubarão não tem ossos.", isFact: true, exp: "Seu esqueleto é 100% cartilagem." },
    { s: "A capital da Itália é Milão.", isFact: false, exp: "Mito. É Roma." },
    { s: "O Facebook foi criado em 2004.", isFact: true, exp: "Por Mark Zuckerberg e colegas." },
    { s: "O Brasil já teve reis.", isFact: true, exp: "D. Pedro I e D. Pedro II." },
    { s: "A Lua tem luz própria.", isFact: false, exp: "Mito. Ela reflete a luz do Sol." },
    { s: "O elefante é o único animal com 4 joelhos.", isFact: true, exp: "Anatomicamente, as 4 pernas funcionam como joelhos." },
    { s: "O açúcar deixa as crianças hiperativas.", isFact: false, exp: "Mito. Estudos não provam ligação direta." },
    { s: "A Muralha da China servia para transporte.", isFact: true, exp: "Também, mas principalmente defesa." },
    { s: "O café é a segunda bebida mais consumida.", isFact: true, exp: "Depois da água." },
    { s: "A capital da Rússia é São Petersburgo.", isFact: false, exp: "Mito. É Moscou." },
    { s: "O Brasil faz fronteira com 10 países.", isFact: true, exp: "Todos da América do Sul, exceto Chile e Equador." },
    { s: "O arco-íris é um círculo completo.", isFact: true, exp: "Visto de cima (avião), é um círculo." },
    { s: "O hino do Brasil tem duas partes.", isFact: true, exp: "Geralmente cantamos só a primeira." },
    { s: "O tigre vive na África.", isFact: false, exp: "Mito. Tigres são asiáticos." },
    { s: "O anel olímpico azul representa a Europa.", isFact: true, exp: "Sim, e o amarelo a Ásia." },
    { s: "O Brasil ganhou 5 Copas do Mundo.", isFact: true, exp: "Pentacampeão (1958, 62, 70, 94, 2002)." },
    { s: "O pinguim é uma ave.", isFact: true, exp: "Ave marinha não voadora." },
    { s: "O som viaja mais rápido na água que no ar.", isFact: true, exp: "Cerca de 4 vezes mais rápido." },
    { s: "A capital da Alemanha é Munique.", isFact: false, exp: "Mito. É Berlim." },
    { s: "O Brasil foi colônia da Espanha.", isFact: false, exp: "Mito. Foi de Portugal (União Ibérica foi exceção)." },
    { s: "O dente é a única parte que não se cura.", isFact: true, exp: "Esmalte não se regenera." },
    { s: "O leão é o Rei da Selva.", isFact: false, exp: "Mito. Leões vivem na savana, não na selva." },
    { s: "A capital da Argentina é Buenos Aires.", isFact: true, exp: "Correto." },
    { s: "O Brasil tem vulcões ativos.", isFact: false, exp: "Mito. Não há vulcões ativos hoje." },
    { s: "A Estátua da Liberdade é de cobre.", isFact: true, exp: "A cor verde é oxidação (pátina)." },
    { s: "O menor país da América do Sul é o Suriname.", isFact: true, exp: "Correto." },
    { s: "O cavalo-marinho macho engravida.", isFact: true, exp: "Ele carrega os ovos na bolsa." },
    { s: "A capital do Egito é Cairo.", isFact: true, exp: "Correto." },
    { s: "O Brasil é o maior exportador de soja.", isFact: true, exp: "É um dos líderes mundiais." },
    { s: "A França tem mais fusos horários que a Rússia.", isFact: true, exp: "Devido aos territórios ultramarinos (12 fusos)." },
    { s: "O avestruz tem o olho maior que o cérebro.", isFact: true, exp: "Verdade." },
    { s: "O Brasil tem neve.", isFact: true, exp: "Em cidades do sul, como São Joaquim, ocasionalmente." },
    { s: "O cérebro não sente dor.", isFact: true, exp: "Não possui receptores de dor, embora processe a dor do corpo." },
    { s: "O ketchup foi vendido como remédio.", isFact: true, exp: "No século 19, para indigestão." },
    { s: "A Lua se afasta da Terra anualmente.", isFact: true, exp: "Cerca de 3,8 cm por ano." },
    { s: "O Monte Fuji é um vulcão ativo.", isFact: true, exp: "Apesar de não entrar em erupção desde 1707." },
    { s: "O Sol gira em torno da Terra.", isFact: false, exp: "Mito. A Terra gira em torno do Sol." },
    { s: "O Brasil foi descoberto por espanhóis.", isFact: false, exp: "Mito. Oficialmente por portugueses (Cabral)." },
    { s: "A Antártida é um continente.", isFact: true, exp: "Sim, coberto de gelo." },
    { s: "O tomate é vermelho por causa do licopeno.", isFact: true, exp: "É um pigmento antioxidante." },
    { s: "O hino nacional tem letra de Rui Barbosa.", isFact: false, exp: "Mito. Letra de Joaquim Osório Duque-Estrada." },
    { s: "O Brasil é o maior país da América do Sul.", isFact: true, exp: "Cobre quase metade do continente." },
    { s: "O urso panda come principalmente carne.", isFact: false, exp: "Mito. Come quase exclusivamente bambu." },
    { s: "A capital da Austrália é Sydney.", isFact: false, exp: "Mito. É Canberra." },
    { s: "O mercúrio é líquido à temperatura ambiente.", isFact: true, exp: "É o único metal líquido nessas condições." },
    { s: "O Brasil já foi império.", isFact: true, exp: "De 1822 a 1889." },
    { s: "O tigre é nativo da África.", isFact: false, exp: "Mito. É nativo da Ásia." },
    { s: "A capital do Japão é Kyoto.", isFact: false, exp: "Mito. É Tóquio." },
    { s: "O cavalo dorme de pé.", isFact: true, exp: "Possui um mecanismo nas pernas para travar." },
    { s: "O Brasil tem 5 regiões.", isFact: true, exp: "Norte, Nordeste, Centro-Oeste, Sudeste e Sul." },
    { s: "A capital da Espanha é Barcelona.", isFact: false, exp: "Mito. É Madri." },
    { s: "O som se propaga no espaço.", isFact: false, exp: "Mito. O espaço é vácuo, não há meio para o som." },
    { s: "O Brasil sediou as Olimpíadas de 2016.", isFact: true, exp: "No Rio de Janeiro." },
    { s: "A capital da França é Paris.", isFact: true, exp: "Correto." },
    { s: "O elefante tem medo de rato.", isFact: false, exp: "Mito. É uma lenda urbana." },
    { s: "O Brasil tem fronteira com o Peru.", isFact: true, exp: "Sim, no estado do Acre e Amazonas." },
    { s: "A capital da Inglaterra é Londres.", isFact: true, exp: "Correto." },
    { s: "O Brasil fala espanhol.", isFact: false, exp: "Mito. Fala português." },
    { s: "A capital da Itália é Roma.", isFact: true, exp: "Correto." },
    { s: "O Brasil é cortado pela Linha do Equador.", isFact: true, exp: "No norte do país." },
    { s: "A capital dos EUA é Nova Iorque.", isFact: false, exp: "Mito. É Washington D.C." },
    { s: "O Brasil tem o maior rio do mundo.", isFact: true, exp: "O Amazonas (em volume de água)." },
    { s: "A capital da Rússia é Moscou.", isFact: true, exp: "Correto." },
    { s: "O Brasil tem 27 estados.", isFact: false, exp: "Mito. Tem 26 estados e 1 Distrito Federal." },
    { s: "A capital da Alemanha é Berlim.", isFact: true, exp: "Correto." },
    { s: "O Brasil tem litoral no Oceano Pacífico.", isFact: false, exp: "Mito. Apenas no Atlântico." },
    { s: "A capital da China é Pequim.", isFact: true, exp: "Correto." },
    { s: "O Brasil é o maior produtor de laranjas.", isFact: true, exp: "Lidera a produção mundial." },
    { s: "A capital da Argentina é Buenos Aires.", isFact: true, exp: "Correto." },
    { s: "O Brasil tem vulcões.", isFact: false, exp: "Mito. Não há vulcões ativos." },
    { s: "A capital do Canadá é Ottawa.", isFact: true, exp: "Correto." },
    { s: "O Brasil tem deserto.", isFact: false, exp: "Mito. Tem áreas semiáridas, mas não desertos clássicos." },
    { s: "A capital da Índia é Nova Deli.", isFact: true, exp: "Correto." },
    { s: "O Brasil tem a maior floresta tropical.", isFact: true, exp: "A Amazônia." },
    { s: "A capital do Egito é Cairo.", isFact: true, exp: "Correto." },
    { s: "O Brasil tem urso polar.", isFact: false, exp: "Mito. Não é habitat natural." },
    { s: "A capital da Coreia do Sul é Seul.", isFact: true, exp: "Correto." }
];

const TriviaGame: React.FC<TriviaGameProps> = ({ onComplete, onExit, userCoins, onRequestAd, highScore, lives, onLoseLife }) => {
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answered, setAnswered] = useState(false);
  const [lastResult, setLastResult] = useState<'CORRECT' | 'WRONG' | null>(null);
  const [oracleHint, setOracleHint] = useState<string | null>(null);
  
  // HighScore aqui representa o NÍVEL ATUAL (Índice da pergunta)
  const currentLevel = highScore || 0;

  useEffect(() => {
    loadQuestion();
  }, [currentLevel]);

  const loadQuestion = () => {
    if (currentLevel >= FACTS_DB.length) {
        setLoading(false);
        return;
    }

    setLoading(true);
    setAnswered(false);
    setLastResult(null);
    setOracleHint(null);
    
    // Carrega a pergunta baseada no nível do usuário
    const q = FACTS_DB[currentLevel];
    setCurrentQuestion(q);
    
    setTimeout(() => setLoading(false), 300);
  };

  const handleAnswer = (choice: boolean) => {
    if (answered || !currentQuestion) return;
    setAnswered(true);

    const correct = choice === currentQuestion.isFact;
    
    if (correct) {
      playSuccessSound();
      setLastResult('CORRECT');
    } else {
      playFailureSound();
      setLastResult('WRONG');
      onLoseLife(); // Perde vida ao errar
    }
  };

  const handleNext = () => {
      if (lastResult === 'CORRECT') {
          // Avança para o próximo nível
          onComplete(currentLevel + 1); 
          // O App.tsx atualiza o highScore e o useEffect recarrega a pergunta
      } else {
          // Se errou, e ainda tem vidas, permite tentar novamente (na prática, recarrega a questão)
          if (lives > 0) {
              setAnswered(false);
              setLastResult(null);
              setOracleHint(null);
          } else {
              // Se acabou as vidas, não faz nada aqui, o App.tsx mostra o modal
          }
      }
  };

  const handleAdvantage = () => {
      // Captura o objeto atual antes do callback
      const currentQ = currentQuestion;
      
      onRequestAd(() => {
          if (currentQ) {
              const answerText = currentQ.isFact ? "VERDADE" : "MITO";
              setOracleHint(`A resposta correta é: ${answerText}`);
          }
      });
  }

  if (loading) return <LoadingScreen message="Abrindo o livro..." />;

  // TELA DE FINAL DE JOGO (Todos os níveis concluídos)
  if (currentLevel >= FACTS_DB.length) {
      return (
        <div className="flex flex-col h-full bg-brand-bg items-center justify-center p-8 text-center">
            <Trophy size={80} className="text-yellow-500 mb-6 animate-bounce" />
            <h1 className="text-3xl font-black text-gray-800 mb-4">Sábio Supremo!</h1>
            <p className="text-xl text-gray-600 mb-8">Você completou todas as 200 perguntas de Fato ou Mito.</p>
            <div className="bg-white p-6 rounded-2xl shadow-soft mb-8 border border-yellow-200">
                <p className="font-bold text-gray-500 uppercase text-xs mb-2">Sua Jornada</p>
                <p className="text-lg font-bold text-gray-800">Mais perguntas em breve!</p>
            </div>
            <button onClick={onExit} className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold text-xl shadow-lg">Voltar ao Jardim</button>
        </div>
      )
  }

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
                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1">Nível {currentLevel + 1}/200</span>
                </div>
            </div>
            <button onClick={onExit} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} className="text-gray-600" />
            </button>
        </div>
        
        <div className="flex items-center justify-between gap-2">
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden flex-grow">
                <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${((currentLevel)/200)*100}%` }}></div>
            </div>
            <div className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                <Heart size={12} className="fill-current"/> {lives}
            </div>
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
                
                {oracleHint ? (
                    <div className="mt-2 p-4 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200 text-center font-bold animate-pulse flex items-center justify-center gap-2 shadow-sm">
                        <Sparkles size={20} className="text-yellow-600"/> {oracleHint}
                    </div>
                ) : (
                    <button onClick={handleAdvantage} className="w-full text-blue-500 font-bold flex items-center justify-center gap-2 py-2 cursor-pointer hover:bg-blue-50 rounded-lg transition-colors">
                        <Video size={16}/> Perguntar ao Oráculo (Vídeo)
                    </button>
                )}
            </div>
        ) : (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4">
                <button 
                    onClick={handleNext}
                    className={`w-full py-4 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02]
                    ${lastResult === 'CORRECT' ? 'bg-brand-primary text-white' : 'bg-gray-800 text-white'}`}
                >
                    {lastResult === 'CORRECT' ? <>Próximo (+1 <Coins size={16}/>) <ArrowRight/></> : <>Tentar Novamente <Video size={20}/></>}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default TriviaGame;
