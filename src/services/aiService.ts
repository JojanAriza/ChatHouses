import { streamText } from 'ai';
import { openrouter } from '../lib/ai';
import { getCasasMatch } from '../utils/getCasasMatch';
import { extraerFiltros } from '../utils/queryBuilder';

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface AIServiceConfig {
  model?: string;
  temperature?: number;
  systemPrompt?: string;
}

class AIService {
  private defaultConfig: AIServiceConfig = {
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    temperature: 0.7,
    systemPrompt: `Eres un asistente de IA útil y amigable. Responde en español de manera clara y concisa. 
    Mantén un tono conversacional y profesional. Si no sabes algo, admítelo honestamente.`
  };


async generateResponse(
  messages: ChatMessage[],
  config: Partial<AIServiceConfig> = {}
) {
  const finalConfig = { ...this.defaultConfig, ...config };

  const lastUserMessage = messages[messages.length - 1]?.text ?? "";

  const filtros = extraerFiltros(lastUserMessage);

  try {
    // Si el mensaje contiene filtros válidos, consulta ArcGIS
    if (Object.keys(filtros).length > 0) {
      const coincidencias = await getCasasMatch(filtros);

      const promptFinal = `
El usuario escribió: "${lastUserMessage}"

Estas son las casas encontradas que coinciden con sus criterios:

${coincidencias}

Redacta una respuesta útil, amable y en español basada en estos resultados.
`;

      const result = await streamText({
        model: openrouter(finalConfig.model!),
        prompt: promptFinal,
        system: finalConfig.systemPrompt,
        temperature: finalConfig.temperature,
        maxTokens: 1000,
      });

      return result.textStream;
    }

    // Si no hay filtros, responde normalmente
    const apiMessages = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.text
    }));

    const result = await streamText({
      model: openrouter(finalConfig.model!),
      messages: apiMessages,
      system: finalConfig.systemPrompt,
      temperature: finalConfig.temperature,
      maxTokens: 1000,
    });

    return result.textStream;
  } catch (error) {
    console.error('Error generando respuesta de IA:', error);
    throw new Error('Error al comunicarse con el servicio de IA');
  }
}


  async generateSimpleResponse(prompt: string, config: Partial<AIServiceConfig> = {}) {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    try {
      const result = await streamText({
        model: openrouter(finalConfig.model!),
        prompt,
        system: finalConfig.systemPrompt,
        temperature: finalConfig.temperature,
        maxTokens: 1000,
      });

      return result.textStream;
    } catch (error) {
      console.error('Error generando respuesta simple:', error);
      throw new Error('Error al comunicarse con el servicio de IA');
    }
  }
}

export default new AIService();