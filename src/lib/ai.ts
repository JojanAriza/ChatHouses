import { createOpenAI } from '@ai-sdk/openai';

// Configuración para OpenRouter
export const openrouter = createOpenAI({
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
});