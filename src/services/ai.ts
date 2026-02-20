import { SYSTEM_INSTRUCTION } from "./constants";
import { getProvider } from "./getProvider";
import * as openai from "./providers/openai";
import * as anthropic from "./providers/anthropic";
import * as gemini from "./providers/gemini";
import type { LabResult, Recipe } from "../types";

export { SYSTEM_INSTRUCTION };

type ChatMessage = { role: 'user' | 'model'; parts: { text: string }[] };

function getProviderModule() {
  const p = getProvider();
  if (p === 'openai') return openai;
  if (p === 'anthropic') return anthropic;
  if (p === 'gemini') return gemini;
  throw new Error('No AI provider configured. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY in .env.local (priority order: OpenAI → Anthropic → Gemini).');
}

export async function generateChatResponse(messages: ChatMessage[]): Promise<string> {
  return getProviderModule().generateChatResponse(messages);
}

export async function analyzeLabResults(text: string): Promise<LabResult> {
  return getProviderModule().analyzeLabResults(text);
}

export async function getPersonalizedRecipes(labResult: LabResult): Promise<Recipe[]> {
  return getProviderModule().getPersonalizedRecipes(labResult);
}
