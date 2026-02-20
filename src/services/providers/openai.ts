import OpenAI from "openai";
import { LabResult, Recipe } from "../../types";
import { LAB_JSON_INSTRUCTION, RECIPES_JSON_INSTRUCTION, SYSTEM_INSTRUCTION } from "../constants";

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY || '';
    _client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  }
  return _client;
}

function toOpenAIMessages(messages: { role: 'user' | 'model'; parts: { text: string }[] }[]): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  return messages.map((m) => ({
    role: m.role === 'model' ? 'assistant' : 'user',
    content: m.parts.map((p) => p.text).join('\n'),
  }));
}

export async function generateChatResponse(messages: { role: 'user' | 'model'; parts: { text: string }[] }[]): Promise<string> {
  const completion = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      ...toOpenAIMessages(messages),
    ],
  });
  return completion.choices[0]?.message?.content ?? '';
}

export async function analyzeLabResults(text: string): Promise<LabResult> {
  const completion = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION + '\n\n' + LAB_JSON_INSTRUCTION },
      { role: 'user', content: `Analyze this lab report text and extract markers:\n\n${text}` },
    ],
    response_format: { type: 'json_object' },
  });
  const raw = completion.choices[0]?.message?.content ?? '{}';
  return JSON.parse(raw);
}

export async function getPersonalizedRecipes(labResult: LabResult): Promise<Recipe[]> {
  const completion = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION + '\n\n' + RECIPES_JSON_INSTRUCTION },
      { role: 'user', content: `Based on these lab results, generate 3 personalized recipes:\n\n${JSON.stringify(labResult)}` },
    ],
    response_format: { type: 'json_object' },
  });
  const raw = completion.choices[0]?.message?.content ?? '{}';
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const arr = Array.isArray(parsed) ? parsed : parsed.recipes ?? parsed.list ?? [];
  return Array.isArray(arr) ? arr : [];
}
