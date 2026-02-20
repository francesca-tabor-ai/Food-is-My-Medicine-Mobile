import { GoogleGenAI, Type } from "@google/genai";
import { LabResult, Recipe } from "../../types";
import { LAB_JSON_INSTRUCTION, RECIPES_JSON_INSTRUCTION, SYSTEM_INSTRUCTION } from "../constants";

let _client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!_client) {
    const key = process.env.GEMINI_API_KEY?.trim();
    if (!key) throw new Error("GEMINI_API_KEY is not set. Add it to .env.local or use another provider (OPENAI_API_KEY, ANTHROPIC_API_KEY).");
    _client = new GoogleGenAI({ apiKey: key });
  }
  return _client;
}

export async function generateChatResponse(messages: { role: 'user' | 'model'; parts: { text: string }[] }[]): Promise<string> {
  const response = await getClient().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: messages,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
  return response.text ?? '';
}

export async function analyzeLabResults(text: string): Promise<LabResult> {
  const response = await getClient().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this lab report text and extract markers in JSON format. ${LAB_JSON_INSTRUCTION}\n\n${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          date: { type: Type.STRING },
          markers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                value: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                status: { type: Type.STRING, enum: ['low', 'normal', 'high'] },
                optimalRange: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ['name', 'value', 'unit', 'status']
            }
          }
        },
        required: ['markers']
      }
    }
  });
  return JSON.parse(response.text || '{}');
}

export async function getPersonalizedRecipes(labResult: LabResult): Promise<Recipe[]> {
  const response = await getClient().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on these lab results, generate 3 personalized recipes. ${RECIPES_JSON_INSTRUCTION}\n\nLab results: ${JSON.stringify(labResult)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            prepTime: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            image: { type: Type.STRING },
            benefits: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['title', 'description', 'ingredients', 'instructions', 'benefits']
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
}
