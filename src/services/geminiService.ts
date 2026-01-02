import { TriviaQuestion, SequenceTask, IntruderTask, ScrambleTask, ProverbTask } from "../types";

// Função auxiliar para chamar o backend serverless
async function callGeminiAPI(prompt: string, schema?: any): Promise<string | null> {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, schema }),
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.text || null;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

// --- GENERATORS ---

export const generateTriviaQuestion = async (topic: string = "general"): Promise<TriviaQuestion | null> => {
  const prompt = `Gere uma pergunta de trivia DESAFIADORA para idosos. Tópico: ${topic}. Retorne JSON.`;
  
  // Definição do Schema manual (sem usar Type enum do SDK para evitar imports do backend)
  const schema = {
    type: "OBJECT",
    properties: {
      question: { type: "STRING" },
      options: { type: "ARRAY", items: { type: "STRING" } },
      correctAnswer: { type: "STRING" },
      explanation: { type: "STRING" }
    },
    required: ["question", "options", "correctAnswer", "explanation"]
  };

  const text = await callGeminiAPI(prompt, schema);
  return text ? JSON.parse(text) : null;
};

export const generateSequenceTask = async (): Promise<SequenceTask | null> => {
  const prompt = `Crie uma tarefa lógica com 5 passos (aumentando dificuldade). Ex: Receita de bolo, trocar pneu. JSON.`;
  
  const schema = {
    type: "OBJECT",
    properties: {
      title: { type: "STRING" },
      steps: { type: "ARRAY", items: { type: "STRING" } },
    },
    required: ["title", "steps"]
  };

  const text = await callGeminiAPI(prompt, schema);
  return text ? JSON.parse(text) : null;
};

export const getEncouragementMessage = async (streak: number): Promise<string> => {
  const prompt = `Frase motivadora curta para idoso, ${streak} dias seguidos.`;
  // Sem schema, retorna texto livre
  const text = await callGeminiAPI(prompt);
  return text || "Parabéns!";
};

export const generateIntruderTask = async (): Promise<IntruderTask | null> => {
  const prompt = "Crie um jogo 'Encontre o Intruso'. Liste 4 itens, onde 3 pertencem a uma categoria e 1 não. O intruso deve ser sutil. JSON.";
  
  const schema = {
    type: "OBJECT",
    properties: {
      items: { type: "ARRAY", items: { type: "STRING" } },
      intruder: { type: "STRING" },
      reason: { type: "STRING" }
    },
    required: ["items", "intruder", "reason"]
  };

  const text = await callGeminiAPI(prompt, schema);
  return text ? JSON.parse(text) : null;
};

export const generateScrambleTask = async (): Promise<ScrambleTask | null> => {
  const prompt = "Escolha uma palavra média/longa (8+ letras) em português e embaralhe as letras. JSON.";
  
  const schema = {
    type: "OBJECT",
    properties: {
      word: { type: "STRING" },
      scrambled: { type: "STRING" },
      hint: { type: "STRING" }
    },
    required: ["word", "scrambled", "hint"]
  };

  const text = await callGeminiAPI(prompt, schema);
  return text ? JSON.parse(text) : null;
};

export const generateProverbTask = async (topic: string = "general"): Promise<ProverbTask | null> => {
  const prompt = "Ditado popular brasileiro difícil ou incomum. Divida em duas partes. Gere 3 opções erradas que rimem. JSON.";
  
  const schema = {
    type: "OBJECT",
    properties: {
      part1: { type: "STRING" },
      part2: { type: "STRING" },
      options: { type: "ARRAY", items: { type: "STRING" } }
    },
    required: ["part1", "part2", "options"]
  };

  const text = await callGeminiAPI(prompt, schema);
  return text ? JSON.parse(text) : null;
};

// --- UPDATED INFINITE GAME LOGIC (STRICTER PORTUGUESE) ---

export const validateWordChain = async (lastWord: string, userWord: string, category: string): Promise<{isValid: boolean, message: string, nextWord?: string}> => {
    if (!userWord || userWord.length < 2) return { isValid: false, message: "Muito curta." };
    
    const lastLetter = lastWord.slice(-1).toLowerCase();
    const firstLetter = userWord.charAt(0).toLowerCase();

    if (lastLetter !== firstLetter) {
        return { isValid: false, message: `Deve começar com a letra '${lastLetter.toUpperCase()}'` };
    }

    const prompt = `Jogo de palavras (Corrente). Categoria: ${category}.
    Palavra anterior: "${lastWord}". Palavra do usuário: "${userWord}".
    
    Regras RIGOROSAS:
    1. A palavra do usuário existe no dicionário oficial de PORTUGUÊS (PT-BR)?
    2. A palavra pertence à categoria ${category}?
    3. A palavra começa com a letra ${lastLetter.toUpperCase()}?
    
    Se a palavra for em inglês ou outro idioma, considere INVÁLIDO.

    Se válido, retorne uma nova palavra EM PORTUGUÊS dessa mesma categoria que comece com a última letra da palavra do usuário.
    Se inválido, explique o motivo em português.
    JSON.`;
    
    const schema = {
        type: "OBJECT",
        properties: {
            isValid: { type: "BOOLEAN" },
            message: { type: "STRING" },
            nextWord: { type: "STRING" }
        },
        required: ["isValid", "message"]
    };

    const text = await callGeminiAPI(prompt, schema);
    
    if (text) {
         try {
             return JSON.parse(text);
         } catch (e) {
             return { isValid: false, message: "Erro ao processar resposta." };
         }
    }
    return { isValid: false, message: "Erro de conexão." };
}