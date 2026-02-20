import Anthropic from "@anthropic-ai/sdk";
import { LabResult, Recipe } from "../../types";
import { LAB_JSON_INSTRUCTION, RECIPES_JSON_INSTRUCTION, SYSTEM_INSTRUCTION } from "../constants";

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY || '';
    _client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  }
  return _client;
}

function toAnthropicMessages(messages: { role: 'user' | 'model'; parts: { text: string }[] }[]): Anthropic.MessageParam[] {
  return messages.map((m) => ({
    role: m.role === 'model' ? 'assistant' : 'user',
    content: m.parts.map((p) => p.text).join('\n'),
  }));
}

export async function generateChatResponse(messages: { role: 'user' | 'model'; parts: { text: string }[] }[]): Promise<string> {
  const msgs = toAnthropicMessages(messages);
  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_INSTRUCTION,
    messages: msgs.length ? msgs : [{ role: 'user', content: 'Hello' }],
  });
  const block = response.content.find((b) => b.type === 'text');
  return block && 'text' in block ? block.text : '';
}

function extractJson(text: string): string {
  const m = text.match(/\{[\s\S]*\}/) || text.match(/\[[\s\S]*\]/);
  return m ? m[0] : text;
}

export async function analyzeLabResults(text: string): Promise<LabResult> {
  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_INSTRUCTION + '\n\n' + LAB_JSON_INSTRUCTION,
    messages: [{ role: 'user', content: `Analyze this lab report text and extract markers:\n\n${text}` }],
  });
  const block = response.content.find((b) => b.type === 'text');
  const raw = block && 'text' in block ? block.text : '{}';
  return JSON.parse(extractJson(raw));
}

export async function getPersonalizedRecipes(labResult: LabResult): Promise<Recipe[]> {
  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_INSTRUCTION + '\n\n' + RECIPES_JSON_INSTRUCTION,
    messages: [{ role: 'user', content: `Based on these lab results, generate 3 personalized recipes:\n\n${JSON.stringify(labResult)}` }],
  });
  const block = response.content.find((b) => b.type === 'text');
  const raw = block && 'text' in block ? block.text : '[]';
  const parsed = JSON.parse(extractJson(raw));
  const arr = Array.isArray(parsed) ? parsed : parsed.recipes ?? parsed.list ?? [];
  return Array.isArray(arr) ? arr : [];
}
