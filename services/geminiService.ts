
import { TriviaQuestion, SequenceTask, IntruderTask, ScrambleTask, ProverbTask, DailyChallengeData } from "../types";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-3-flash-preview";

// --- GENERATORS ---

export const generateTriviaQuestion = async (topic: string = "general"): Promise<TriviaQuestion | null> => {
  try {
    const prompt = `Gere uma pergunta de trivia DESAFIADORA para idosos. Tópico: ${topic}. Retorne JSON.`;
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
    const prompt = `Crie uma tarefa lógica com 5 passos (aumentando dificuldade). Ex: Receita de bolo, trocar pneu. JSON.`;
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
    return response.text || "Parabéns!";
  } catch (e) { return "Continue assim!"; }
};

export const generateIntruderTask = async (): Promise<IntruderTask | null> => {
  try {
    const prompt = "Crie um jogo 'Encontre o Intruso'. Liste 4 itens, onde 3 pertencem a uma categoria e 1 não. O intruso deve ser sutil. JSON.";
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
    const prompt = "Escolha uma palavra média/longa (8+ letras) em português e embaralhe as letras. JSON.";
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
    const prompt = "Ditado popular brasileiro difícil ou incomum. Divida em duas partes. Gere 3 opções erradas que rimem. JSON.";
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
        const prompt = `Gere uma única "Palavra do Dia" para um jogo cognitivo de idosos em Português.
        A palavra deve ser:
        1. Comum, mas levemente sofisticada (5 a 8 letras).
        2. Positiva ou neutra.
        
        Também forneça uma dica/definição clara.
        Retorne JSON.`;

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

// --- UPDATED INFINITE GAME LOGIC (STRICTER PORTUGUESE) ---

export const validateWordChain = async (lastWord: string, userWord: string, category: string): Promise<{isValid: boolean, message: string, nextWord?: string}> => {
    if (!userWord || userWord.length < 2) return { isValid: false, message: "Muito curta." };
    
    const lastLetter = lastWord.slice(-1).toLowerCase();
    const firstLetter = userWord.charAt(0).toLowerCase();

    if (lastLetter !== firstLetter) {
        return { isValid: false, message: `Deve começar com a letra '${lastLetter.toUpperCase()}'` };
    }

    try {
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
        
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
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
        return { isValid: false, message: "Erro de conexão." };

    } catch (e) {
        console.error(e);
        return { isValid: false, message: "Não consegui verificar. Tente novamente." };
    }
}
