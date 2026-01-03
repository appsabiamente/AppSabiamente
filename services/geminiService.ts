
import { SequenceTask, IntruderTask, ScrambleTask } from "../types";
import { GoogleGenAI, Type } from "@google/genai";

// Inicialização direta do cliente API (Client-side)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-3-flash-preview";

// --- GENERATORS ---

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
