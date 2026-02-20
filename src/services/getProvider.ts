/** Provider priority: OpenAI first, then Anthropic, then Gemini. */
export type AIProvider = 'openai' | 'anthropic' | 'gemini';

export function getProvider(): AIProvider | null {
  if (process.env.OPENAI_API_KEY?.trim()) return 'openai';
  if (process.env.ANTHROPIC_API_KEY?.trim()) return 'anthropic';
  if (process.env.GEMINI_API_KEY?.trim()) return 'gemini';
  return null;
}
