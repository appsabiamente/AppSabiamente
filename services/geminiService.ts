
import { SequenceTask, IntruderTask, ScrambleTask, DailyChallengeData, FactOrFakeQuestion, WordLinkBoard } from "../types";
import { GoogleGenAI, Type } from "@google/genai";

// Inicialização direta do cliente API (Client-side)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-3-flash-preview";

// --- GENERATORS ---

// REFORMULATED: Sabedoria -> Fato ou Mito
export const generateFactOrFake = async (topic: string = "general"): Promise<FactOrFakeQuestion | null> => {
  try {
    const prompt = `Gere uma afirmação curta e interessante sobre ${topic} (história, ciência, natureza, ou cotidiano) que seja ou um FATO curioso ou um MITO comum. Retorne JSON.`;
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            statement: { type: Type.STRING, description: "A frase para o usuário julgar." },
            isFact: { type: Type.BOOLEAN, description: "True se for verdade, False se for mito." },
            explanation: { type: Type.STRING, description: "Explicação curta (max 15 palavras) do porquê." }
          },
          required: ["statement", "isFact", "explanation"]
        }
      }
    });
    return response.text ? JSON.parse(response.text) : null;
  } catch (error) { 
      console.error("Gemini Error:", error);
      return null; 
  }
};

// REFORMULATED: Corrente -> Elo de Palavras (Categorias)
export const generateWordLinkBoard = async (): Promise<WordLinkBoard | null> => {
    try {
        const prompt = `Crie um tabuleiro de jogo de categorias. 
        Escolha um TEMA simples (ex: Cozinha, Praia, Ferramentas).
        Liste 5 palavras que PERTENCEM a esse tema.
        Liste 4 palavras que NÃO pertencem (distratores de temas diferentes).
        Todas palavras em Português.
        JSON.`;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        topic: { type: Type.STRING },
                        correctWords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        distractors: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["topic", "correctWords", "distractors"]
                }
            }
        });
        return response.text ? JSON.parse(response.text) : null;
    } catch (e) { return null; }
}

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
