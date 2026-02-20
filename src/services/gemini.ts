import { GoogleGenAI, Type } from "@google/genai";
import { LabResult, Recipe } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const SYSTEM_INSTRUCTION = `
You are "Food is My Medicine", a precision nutrition AI coach. 
Your goal is to help users understand their biology through blood test results and provide actionable nutrition plans.

Core Principles:
1. Food is medicine. Every recommendation should be backed by biological data.
2. Be professional, empathetic, and clear.
3. When interpreting lab results, explain what the markers mean in simple terms.
4. Provide specific ingredient and recipe recommendations based on the user's markers.
5. If a user has high cholesterol, focus on fiber, healthy fats, and avoiding processed sugars.
6. If a user is low on iron, suggest heme and non-heme sources with vitamin C for absorption.

You have access to tools to:
- Interpret lab results from text or images.
- Generate personalized recipes.
- Create shopping lists.

Always maintain a supportive and scientific tone.
`;

export async function generateChatResponse(messages: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: messages,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  return response.text;
}

export async function analyzeLabResults(text: string): Promise<LabResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this lab report text and extract markers in JSON format: ${text}`,
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
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on these lab results: ${JSON.stringify(labResult)}, generate 3 personalized recipes.`,
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
