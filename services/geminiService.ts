
import { TriviaQuestion, SequenceTask, IntruderTask, ScrambleTask, ProverbTask, DailyChallengeData } from "../types";
import { GoogleGenAI, Type } from "@google/genai";

// Inicialização direta do cliente API (Client-side)
// Isso resolve o problema de rotas de API inexistentes no Vercel estático
// ATENÇÃO: A chave API deve estar configurada no .env do Vercel como REACT_APP_API_KEY ou VITE_API_KEY ou apenas API_KEY dependendo do build
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-3-flash-preview";

// --- GENERATORS ---

export const generateTriviaQuestion = async (topic: string = "general"): Promise<TriviaQuestion | null> => {
  try {
    const prompt = `Gere uma pergunta de trivia (conhecimentos gerais) adequada para idosos brasileiros. Tópico: ${topic}. Retorne JSON.`;
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    });
    return response.text ? JSON.parse(response.text) : null;
  } catch (error) { 
      console.error("Gemini Error:", error);
      return null; 
  }
};

export const generateSequenceTask = async (): Promise<SequenceTask | null> => {
  try {
    const prompt = `Crie uma tarefa lógica do dia a dia com 5 passos. Ex: Fazer café, Plantar uma flor. JSON.`;
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            steps: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "steps"]
        }
      }
    });
    return response.text ? JSON.parse(response.text) : null;
  } catch (error) { return null; }
};

export const getEncouragementMessage = async (streak: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Frase motivadora curta para idoso, ${streak} dias seguidos.`,
    });
    return response.text || "Parabéns pela dedicação!";
  } catch (e) { return "Continue assim!"; }
};

export const generateIntruderTask = async (): Promise<IntruderTask | null> => {
  try {
    const prompt = "Crie um jogo 'Encontre o Intruso'. Liste 4 itens simples, onde 3 são da mesma categoria e 1 não. JSON.";
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: { type: Type.ARRAY, items: { type: Type.STRING } },
            intruder: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["items", "intruder", "reason"]
        }
      }
    });
    return response.text ? JSON.parse(response.text) : null;
  } catch (e) { return null; }
};

export const generateScrambleTask = async (): Promise<ScrambleTask | null> => {
  try {
    const prompt = "Escolha uma palavra positiva (8+ letras) em português e embaralhe as letras. JSON.";
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            scrambled: { type: Type.STRING },
            hint: { type: Type.STRING }
          },
          required: ["word", "scrambled", "hint"]
        }
      }
    });
    return response.text ? JSON.parse(response.text) : null;
  } catch (e) { return null; }
};

export const generateProverbTask = async (topic: string = "general"): Promise<ProverbTask | null> => {
  try {
    const prompt = "Ditado popular brasileiro famoso. Divida em duas partes. Gere 3 opções erradas que confundam (rimem ou pareçam lógicas). JSON.";
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            part1: { type: Type.STRING },
            part2: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["part1", "part2", "options"]
        }
      }
    });
    return response.text ? JSON.parse(response.text) : null;
  } catch (e) { return null; }
};

export const generateDailyWordChallenge = async (): Promise<DailyChallengeData | null> => {
    try {
        const prompt = `Gere uma única "Palavra do Dia" (PT-BR). Comum, positiva, 5-8 letras. Dica clara. JSON.`;
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        hint: { type: Type.STRING }
                    },
                    required: ["word", "hint"]
                }
            }
        });
        return response.text ? JSON.parse(response.text) : null;
    } catch (e) { return null; }
}

// --- FAST & LENIENT WORD CHAIN ---

export const validateWordChain = async (lastWord: string, userWord: string, category: string): Promise<{isValid: boolean, message: string, nextWord?: string}> => {
    // 1. Validação Local Rápida (Sintaxe)
    if (!userWord || userWord.trim().length < 2) return { isValid: false, message: "Palavra muito curta." };
    
    const lastLetter = lastWord.slice(-1).toLowerCase();
    const firstLetter = userWord.trim().charAt(0).toLowerCase();

    // Remove acentos para comparação da letra
    const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    if (normalize(lastLetter) !== normalize(firstLetter)) {
        return { isValid: false, message: `Deve começar com a letra '${lastLetter.toUpperCase()}'` };
    }

    try {
        // 2. Validação Semântica via IA
        const prompt = `
        Contexto: Jogo de palavras "Corrente".
        Categoria: "${category}".
        Anterior: "${lastWord}".
        Usuário digitou: "${userWord}".
        
        Tarefa:
        1. A palavra do usuário existe em Português? (Seja leniente com acentos faltantes).
        2. Ela pertence (mesmo que remotamente) à categoria?
        
        Se SIM para ambos:
        - isValid: true
        - message: "Muito bem!"
        - nextWord: Uma palavra nova dessa categoria que comece com a última letra de "${userWord}".
        
        Se NÃO:
        - isValid: false
        - message: Explique o erro em 4 palavras.
        
        JSON APENAS.
        `;
        
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                temperature: 0.5,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isValid: { type: Type.BOOLEAN },
                        message: { type: Type.STRING },
                        nextWord: { type: Type.STRING }
                    },
                    required: ["isValid", "message"]
                }
            }
        });
        
        if (response.text) {
             const res = JSON.parse(response.text);
             return res;
        }
        // Se a API não devolver JSON válido, aprovamos para não frustrar o usuário
        return { isValid: true, message: "Aceito!", nextWord: "Bola" };

    } catch (e) {
        console.error("Validation Error", e);
        // Fallback gracioso em caso de erro de rede/API
        // Assumimos válido para não travar o jogo
        const fallbacks = ["Casa", "Dado", "Elefante", "Faca", "Gato"];
        const randomNext = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        return { isValid: true, message: "Conexão instável, mas aceito!", nextWord: randomNext };
    }
}
