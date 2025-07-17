import { streamText } from 'ai';
import { openrouter } from '../lib/ai';
import { searchCasas, extractCriteriaFromText, formatCasasResults } from './arcGisApi';
import type { AIServiceConfig, ChatMessage, SearchCriteria } from '../types';


class AIService {
  private defaultConfig: AIServiceConfig = {
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    temperature: 0.7,
    systemPrompt: `Eres un asistente de IA especializado en ayudar a las personas a encontrar casas en Bogotá, Colombia. 
    Tienes acceso a una base de datos completa de propiedades con información detallada y específica.

    **INFORMACIÓN DISPONIBLE EN LA BASE DE DATOS:**
    
    **Características básicas:**
    - Número de habitaciones (piezas)
    - Número de baños
    - Área en metros cuadrados (m²)
    - Número de pisos
    - Precio en pesos colombianos
    - Número de teléfono de contacto
    - Nombre/identificador de la propiedad
    
    **Amenidades y servicios:**
    - Garage (sí/no)
    - Internet (sí/no)
    - Amoblada/amueblada (sí/no)
    - Balcón (sí/no)
    - Ascensor (sí/no)
    - Televisión (sí/no)
    
    **Proximidad a servicios (en minutos):**
    - Hospital: tiempo en carro y caminando
    - Escuelas: tiempo en carro y caminando
    - Parques: tiempo en carro y caminando
    - Universidades: tiempo en carro y caminando
    
    **INSTRUCCIONES ESPECÍFICAS:**
    
    1. **Análisis de consultas:** Identifica cuidadosamente los criterios mencionados por el usuario:
       - Números específicos (habitaciones, baños, área, pisos)
       - Rangos de precios (desde X hasta Y, máximo X, mínimo X)
       - Amenidades deseadas (garage, internet, amoblada, balcón, ascensor, TV)
       - Proximidad a servicios (cerca de hospital, escuela, parque, universidad)
       - Tiempos específicos de desplazamiento
    
    2. **Búsqueda inteligente:** 
       - Busca primero coincidencias exactas
       - Si no hay resultados, sugiere opciones similares
       - Prioriza las características más importantes mencionadas
       - Considera tolerancias razonables (±1 habitación, ±10m², ±100k precio)
    
    3. **Presentación de resultados:**
       - Muestra máximo 5-10 opciones ordenadas por relevancia
       - Destaca las coincidencias exactas y parciales
       - Incluye toda la información relevante (precio, contacto, características)
       - Menciona proximidad a servicios cuando sea relevante
       - Usa formato claro con bullets y secciones
    
    4. **Manejo de consultas sin resultados:**
       - Explica por qué no hay coincidencias
       - Sugiere criterios alternativos
       - Ofrece opciones más flexibles
       - Pregunta si quieren ajustar algunos criterios
    
    5. **Consultas de seguimiento:**
       - Si preguntan por más detalles de una propiedad específica
       - Si quieren modificar criterios de búsqueda
       - Si necesitan explicaciones sobre ubicaciones o servicios
    
    **EJEMPLOS DE RESPUESTAS ESPERADAS:**
    
    Para "Busco casa de 3 habitaciones con garage":
    - Identificar: piezas=3, garage=true
    - Buscar y mostrar resultados ordenados por puntaje
    - Destacar coincidencias exactas
    
    Para "Casa barata cerca del hospital":
    - Identificar: nearHospital=true, precio bajo
    - Buscar propiedades con hospital_car <= 15 min
    - Ordenar por precio ascendente
    
    Para "Apartamento amoblado con balcón, máximo 2 millones":
    - Identificar: amoblada=true, balcon=true, precioMax=2000000
    - Buscar coincidencias exactas primero
    - Mostrar alternativas si no hay resultados
    
    **TONO Y ESTILO:**
    - Amigable y profesional
    - Usa términos locales colombianos
    - Sé específico con números y datos
    - Ofrece ayuda adicional cuando sea apropiado
    - Haz preguntas clarificatorias si la consulta es ambigua
    
    **CUANDO NO ES SOBRE CASAS:**
    Si la consulta no es sobre búsqueda de propiedades, responde normalmente como un asistente útil, pero siempre ofrece ayuda para encontrar casas si es relevante.
    
    Recuerda: Tu especialidad es conectar a las personas con las propiedades perfectas usando datos precisos y búsquedas inteligentes.`
  };

  private async shouldSearchCasas(text: string): Promise<boolean> {
    const lowerText = text.toLowerCase();
    const houseKeywords = [
      'casa', 'casas', 'vivienda', 'hogar', 'apartamento', 'propiedad', 'inmueble',
      'habitación', 'habitaciones', 'cuarto', 'cuartos', 'dormitorio', 'dormitorios', 'piezas',
      'baño', 'baños', 'garage', 'balcón', 'amoblada', 'amueblada', 'ascensor',
      'busco', 'necesito', 'quiero', 'me interesa', 'mostrar', 'encontrar', 'hay',
      'precio', 'pesos', 'millones', 'alquiler', 'arriendo', 'venta',
      'cerca', 'hospital', 'escuela', 'universidad', 'parque', 'colegio',
      'internet', 'televisión', 'tv', 'pisos', 'área', 'metros', 'm2', 'm²'
    ];
    
    const searchPatterns = [
      /\d+\s*(habitaciones?|cuartos?|dormitorios?|piezas?)/,
      /\d+\s*(baños?|baño)/,
      /\d+\s*(pisos?|piso)/,
      /\d+\s*(m2|metros|m²)/,
      /\$?\d+(?:\.\d{3})*(?:,\d{3})*/,
      /(con|sin)\s+(garage|internet|balcón|ascensor|televisión)/,
      /cerca\s+(del?|de)\s+(hospital|escuela|universidad|parque)/
    ];
    
    return houseKeywords.some(keyword => lowerText.includes(keyword)) || 
           searchPatterns.some(pattern => pattern.test(lowerText));
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
            if (criteria.garage !== undefined) flexibleCriteria.garage = criteria.garage;
            if (criteria.nearHospital) flexibleCriteria.nearHospital = criteria.nearHospital;
            if (criteria.nearSchool) flexibleCriteria.nearSchool = criteria.nearSchool;
            
            const flexibleMatches = await searchCasas(flexibleCriteria);
            if (flexibleMatches.length > 0) {
              responseText = `No encontré casas que coincidan exactamente con todos tus criterios, pero aquí tienes algunas opciones similares que podrían interesarte:\n\n`;
              responseText += formatCasasResults(flexibleMatches);
            } else {
              responseText = `No encontré casas que coincidan con tus criterios. Te sugiero:\n\n`;
              responseText += `• Ampliar el rango de precio\n`;
              responseText += `• Considerar propiedades con características similares\n`;
              responseText += `• Buscar en zonas con buena conectividad\n\n`;
              responseText += `¿Te gustaría ajustar algún criterio específico?`;
            }
          }
        }
      } catch (error) {
        console.error('Error al buscar casas:', error);
        responseText = 'Hubo un problema al buscar casas en la base de datos. ¿Podrías intentar reformular tu consulta con más detalles específicos?';
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
        maxTokens: 1200, // Aumentado para respuestas más completas
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
        maxTokens: 1200,
      });
      
      return result.textStream;
    } catch (error) {
      console.error('Error generando respuesta simple:', error);
      throw new Error('Error al comunicarse con el servicio de IA');
    }
  }
}

export default new AIService();