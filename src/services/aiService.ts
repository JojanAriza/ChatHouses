import { streamText } from 'ai';
import { openrouter } from '../lib/ai';
import { searchCasas, extractCriteriaFromText, formatCasasResults } from './arcGisApi';
import type { SearchCriteria } from './arcGisApi';

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
    systemPrompt: `Eres un asistente de IA especializado en ayudar a las personas a encontrar casas. 
    Tienes acceso a una base de datos de casas con información detallada sobre:
    - Número de habitaciones (piezas)
    - Número de baños
    - Garage (sí/no)
    - Internet (sí/no)
    - Si está amoblada (sí/no)
    - Si tiene balcón (sí/no)
    - Tiempo al hospital en carro y caminando
    - Tiempo a escuelas en carro y caminando
    
    Cuando un usuario pregunte sobre casas, debes:
    1. Analizar su consulta para identificar los criterios de búsqueda
    2. Buscar en la base de datos las casas que mejor coincidan
    3. Presentar los resultados de manera clara y organizada
    4. Si no hay coincidencias exactas, mostrar las opciones más cercanas
    
    Responde en español de manera amigable y profesional. Si la consulta no es sobre búsqueda de casas, responde normalmente como un asistente útil.`
  };

  private async shouldSearchCasas(text: string): Promise<boolean> {
    const lowerText = text.toLowerCase();
    const houseKeywords = [
      'casa', 'casas', 'vivienda', 'hogar', 'apartamento', 'propiedad',
      'habitación', 'habitaciones', 'cuarto', 'cuartos', 'dormitorio', 'dormitorios',
      'baño', 'baños', 'garage', 'balcón', 'amoblada', 'amueblada',
      'busco', 'necesito', 'quiero', 'me interesa', 'mostrar', 'encontrar'
    ];
    
    return houseKeywords.some(keyword => lowerText.includes(keyword));
  }

  async generateResponse(
    messages: ChatMessage[],
    config: Partial<AIServiceConfig> = {}
  ) {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    // Obtener el último mensaje del usuario
    const lastUserMessage = messages
      .filter(msg => msg.sender === 'user')
      .slice(-1)[0];
    
    let responseText = '';
    
    // Si el último mensaje parece ser sobre búsqueda de casas
    if (lastUserMessage && await this.shouldSearchCasas(lastUserMessage.text)) {
      try {
        // Extraer criterios de búsqueda
        const criteria = extractCriteriaFromText(lastUserMessage.text);
        
        // Solo buscar si hay al menos un criterio
        if (Object.keys(criteria).length > 0) {
          const matches = await searchCasas(criteria);
          responseText = formatCasasResults(matches);
          
          // Si no hay resultados, hacer una búsqueda más amplia
          if (matches.length === 0) {
            // Intentar búsqueda más flexible removiendo algunos criterios
            const flexibleCriteria: SearchCriteria = {};
            if (criteria.piezas) flexibleCriteria.piezas = criteria.piezas;
            if (criteria.banos) flexibleCriteria.banos = criteria.banos;
            
            const flexibleMatches = await searchCasas(flexibleCriteria);
            if (flexibleMatches.length > 0) {
              responseText = `No encontré casas que coincidan exactamente con todos tus criterios, pero aquí tienes algunas opciones similares:\n\n`;
              responseText += formatCasasResults(flexibleMatches);
            }
          }
        }
      } catch (error) {
        console.error('Error al buscar casas:', error);
        responseText = 'Hubo un problema al buscar casas en la base de datos. ¿Podrías intentar reformular tu consulta?';
      }
    }
    
    // Convertir mensajes al formato requerido por la API
    const apiMessages = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.text
    }));
    
    // Si tenemos resultados de casas, incluirlos en el contexto
    if (responseText) {
      apiMessages.push({
        role: 'assistant' as const,
        content: responseText
      });
    }
    
    try {
      const result = await streamText({
        model: openrouter(finalConfig.model!),
        messages: apiMessages,
        system: finalConfig.systemPrompt,
        temperature: finalConfig.temperature,
        maxTokens: 1000,
      });
      
      // Si ya tenemos resultados de casas, devolver esos resultados
      if (responseText) {
        return this.createMockStream(responseText);
      }
      
      return result.textStream;
    } catch (error) {
      console.error('Error generando respuesta de IA:', error);
      throw new Error('Error al comunicarse con el servicio de IA');
    }
  }

  private async* createMockStream(text: string) {
    const words = text.split(' ');
    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(' ') + ' ';
      yield chunk;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  async generateSimpleResponse(prompt: string, config: Partial<AIServiceConfig> = {}) {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    // Verificar si es una consulta sobre casas
    if (await this.shouldSearchCasas(prompt)) {
      try {
        const criteria = extractCriteriaFromText(prompt);
        
        if (Object.keys(criteria).length > 0) {
          const matches = await searchCasas(criteria);
          const responseText = formatCasasResults(matches);
          return this.createMockStream(responseText);
        }
      } catch (error) {
        console.error('Error al buscar casas:', error);
      }
    }
    
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