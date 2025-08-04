import { streamText } from "ai";
import { openrouter } from "../lib/ai";
import type { AIServiceConfig, ChatMessage } from "../types";
import { HouseSearchService } from "./HouseSearchService";

class AIService {
  private defaultConfig: AIServiceConfig = {
    model: "meta-llama/llama-3.3-70b-instruct:free",
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
    
    Recuerda: Tu especialidad es conectar a las personas con las propiedades perfectas usando datos precisos y búsquedas inteligentes.`,
  };

  private houseSearchService: HouseSearchService;

  constructor() {
    this.houseSearchService = new HouseSearchService();
  }

  async generateResponse(
    messages: ChatMessage[],
    config: Partial<AIServiceConfig> = {}
  ) {
    const finalConfig = { ...this.defaultConfig, ...config };

    // Obtener el último mensaje del usuario
    const lastUserMessage = messages
      .filter((msg) => msg.sender === "user")
      .slice(-1)[0];

    // Si el último mensaje parece ser sobre búsqueda de casas
    if (
      lastUserMessage &&
      (await this.houseSearchService.shouldSearchCasas(lastUserMessage.text))
    ) {
      const responseText = await this.houseSearchService.handleHouseSearch(
        lastUserMessage.text
      );

      if (responseText) {
        return this.createMockStream(responseText);
      }
    }

    // Convertir mensajes al formato requerido por la API
    const apiMessages = messages.map((msg) => ({
      role: msg.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: msg.text,
    }));

    // Si no hay resultados de casas, usar el LLM normal
    try {
      const result = await streamText({
        model: openrouter(finalConfig.model!),
        messages: apiMessages,
        system: finalConfig.systemPrompt,
        temperature: finalConfig.temperature,
        maxTokens: 1200,
      });

      return result.textStream;
    } catch (error) {
      console.error("Error generando respuesta de IA:", error);
      throw new Error("Error al comunicarse con el servicio de IA");
    }
  }

  private async *createMockStream(text: string) {
    const words = text.split(" ");
    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(" ") + " ";
      yield chunk;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  async generateSimpleResponse(
    prompt: string,
    config: Partial<AIServiceConfig> = {}
  ) {
    const finalConfig = { ...this.defaultConfig, ...config };

    // Verificar si es una consulta sobre casas
    if (await this.houseSearchService.shouldSearchCasas(prompt)) {
      const responseText = await this.houseSearchService.handleHouseSearch(prompt);
      
      if (responseText) {
        return this.createMockStream(responseText);
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
      console.error("Error generando respuesta simple:", error);
      throw new Error("Error al comunicarse con el servicio de IA");
    }
  }

  // Método para limpiar el historial de búsqueda (útil para reiniciar)
  clearSearchHistory() {
    this.houseSearchService.clearSearchHistory();
  }
}

export default new AIService();