// pricePatterns.ts - Extractor de precios mejorado y corregido

export class PricePatternExtractor {
  
  // Patrones mejorados para extraer precios individuales
  private static pricePatterns = [
    // Precios con formato completo: $1.000.000, $500,000
    /\$?\s*(\d{1,3}(?:[.,]\d{3})+)(?:\s*(?:pesos?|cop|mill?ones?|mil)?)?/gi,
    
    // Precios con K/M: 500K, 1.5M, 2mill
    /\$?\s*(\d+(?:[.,]\d+)?)\s*([kK]|[mM]ill?(?:ones?)?|[mM])\b/gi,
    
    // Precios simples: 500000, 1000000
    /\$?\s*(\d{5,})\s*(?:pesos?|cop)?/gi,
    
    // Precios con "mil": 500 mil, 300mil
    /\$?\s*(\d+)\s*mil(?:es)?(?:\s*pesos?)?/gi,
    
    // Precios con "millones": 1.5 millones, 2 millones
    /\$?\s*(\d+(?:[.,]\d+)?)\s*mill?(?:ones?|ón)?(?:\s*(?:de\s*)?pesos?)?/gi
  ];

  // Patrones mejorados para rangos de precios con mayor especificidad
  private static rangePatterns = [
    // "más de X y menos de Y" - patrón específico para tu caso
    /más\s+de\s+\$?\s*(\d+(?:[.,]\d+)*(?:\s*(?:mil|mill?(?:ones?)?|[kKmM])?)?)\s*y\s+menos\s+de\s+\$?\s*(\d+(?:[.,]\d+)*(?:\s*(?:mil|mill?(?:ones?)?|[kKmM])?)?)/gi,
    
    // "entre X y Y"
    /entre\s+\$?\s*(\d+(?:[.,]\d+)*(?:\s*(?:mil|mill?(?:ones?)?|[kKmM])?)?)\s*(?:y|a|-|hasta)\s+\$?\s*(\d+(?:[.,]\d+)*(?:\s*(?:mil|mill?(?:ones?)?|[kKmM])?)?)/gi,
    
    // "de X a Y"
    /de\s+\$?\s*(\d+(?:[.,]\d+)*(?:\s*(?:mil|mill?(?:ones?)?|[kKmM])?)?)\s*(?:a|hasta|-)\s+\$?\s*(\d+(?:[.,]\d+)*(?:\s*(?:mil|mill?(?:ones?)?|[kKmM])?)?)/gi,
    
    // "desde X hasta Y"
    /desde\s+\$?\s*(\d+(?:[.,]\d+)*(?:\s*(?:mil|mill?(?:ones?)?|[kKmM])?)?)\s*hasta\s+\$?\s*(\d+(?:[.,]\d+)*(?:\s*(?:mil|mill?(?:ones?)?|[kKmM])?)?)/gi,
    
    // X - Y con guiones
    /\$?\s*(\d+(?:[.,]\d+)*(?:\s*(?:mil|mill?(?:ones?)?|[kKmM])?)?)\s*[-–—]\s*\$?\s*(\d+(?:[.,]\d+)*(?:\s*(?:mil|mill?(?:ones?)?|[kKmM])?)?)/gi
  ];

  // Patrones para precios máximos mejorados
  private static maxPricePatterns = [
    /menos\s+de\s+\$?\s*(\d+(?:[.,]\d+)*(?:\s*(?:mil|mill?(?:ones?)?|[kKmM])?)?)/gi,
    /(?:máximo|hasta|no\s+más\s+de|como\s+máximo)\s+\$?\s*(\d+(?:[.,]\d+)*(?:\s*(?:mil|mill?(?:ones?)?|[kKmM])?)?)/gi,
    /\$?\s*(\d+(?:[.,]\d+)*(?:\s*(?:mil|mill?(?:ones?)?|[kKmM])?)?)\s*(?:o\s+menos|máximo|como\s+tope)/gi
  ];

  // Patrones para precios mínimos mejorados
  private static minPricePatterns = [
    /más\s+de\s+\$?\s*(\d+(?:[.,]\d+)*(?:\s*(?:mil|mill?(?:ones?)?|[kKmM])?)?)/gi,
    /(?:mínimo|desde|a\s+partir\s+de|como\s+mínimo)\s+\$?\s*(\d+(?:[.,]\d+)*(?:\s*(?:mil|mill?(?:ones?)?|[kKmM])?)?)/gi,
    /\$?\s*(\d+(?:[.,]\d+)*(?:\s*(?:mil|mill?(?:ones?)?|[kKmM])?)?)\s*(?:o\s+más|hacia\s+arriba|en\s+adelante)/gi
  ];

  /**
   * Normaliza un valor de precio a número con mejor manejo de formatos
   */
  private static normalizePrice(priceStr: string): number {
    console.log('🔢 Normalizando precio:', `"${priceStr}"`);
    
    // Limpiar el string pero preservar información importante
    const cleaned = priceStr.toLowerCase().trim().replace(/\s+/g, ' ');
    console.log('🧹 Texto limpio:', `"${cleaned}"`);
    
    // Extraer el número base con mejor regex
    const numberMatch = cleaned.match(/(\d+(?:[.,]\d+)?)/);
    if (!numberMatch) {
      console.log('❌ No se encontró número en:', priceStr);
      return 0;
    }

    const baseNumber = parseFloat(numberMatch[1].replace(',', '.'));
    console.log('📊 Número base extraído:', baseNumber);

    // Determinar multiplicador basado en el contexto con mayor precisión
    let multiplier = 1;
    
    // PRIORIDAD: Buscar patrones específicos de millones primero
    if (cleaned.includes('millon') || cleaned.includes('millón')) {
      multiplier = 1000000;
      console.log('🔢 Aplicando multiplicador millones (millon/millón):', multiplier);
    } 
    // Solo aplicar "mill" si NO está seguido de "on" (para evitar confundir con "millon")
    else if (cleaned.includes('mill') && !cleaned.includes('millon') && !cleaned.includes('millón')) {
      // Verificar que realmente sea "millones" y no parte de "millon"
      if (cleaned.match(/mill(?:ones?)?(?:\s|$)/)) {
        multiplier = 1000000;
        console.log('🔢 Aplicando multiplicador millones (mill):', multiplier);
      } else {
        console.log('⚠️ "mill" encontrado pero parece ser parte de "millon", aplicando miles');
        multiplier = 1000;
      }
    } 
    // Aplicar miles solo si el número es pequeño y hay "mil" pero NO "millon"
    else if (cleaned.includes('mil') && !cleaned.includes('millon') && !cleaned.includes('millón') && baseNumber < 1000) {
      multiplier = 1000;
      console.log('🔢 Aplicando multiplicador miles:', multiplier);
    } 
    // K abreviatura
    else if (cleaned.includes('k')) {
      multiplier = 1000;
      console.log('🔢 Aplicando multiplicador K:', multiplier);
    } 
    // M abreviatura para millones
    else if (cleaned.includes('m') && baseNumber < 100) {
      multiplier = 1000000;
      console.log('🔢 Aplicando multiplicador M:', multiplier);
    }
    // Si el número es muy grande, probablemente ya está en formato completo
    else if (baseNumber >= 100000) {
      multiplier = 1;
      console.log('🔢 Número grande, sin multiplicador:', multiplier);
    }
    // Caso especial: si contiene "mil" pero también podría ser "millon" truncado
    else if (cleaned.includes('mil') && baseNumber >= 1) {
      // Si el contexto sugiere millones (número pequeño + "mil" podría ser "millon" truncado)
      if (baseNumber <= 10 && cleaned.length <= 6) {
        console.log('🤔 Posible "millon" truncado como "mil", aplicando millones');
        multiplier = 1000000;
      } else {
        multiplier = 1000;
        console.log('🔢 Aplicando multiplicador miles (fallback):', multiplier);
      }
    }

    const result = baseNumber * multiplier;
    console.log('✅ Precio normalizado:', result);
    return result;
  }

  /**
   * Extrae rangos de precios del texto con lógica mejorada
   */
  public static extractPriceRange(text: string): { min?: number; max?: number } {
    const result: { min?: number; max?: number } = {};
    const lowerText = text.toLowerCase();

    console.log('🔍 Analizando texto para precios:', text);

    // 1. ANÁLISIS ESPECÍFICO PARA EL PATRÓN PROBLEMÁTICO
    // Buscar directamente "1 millon" en el texto
    if (lowerText.includes('1 millon') || lowerText.includes('1 millón')) {
      console.log('🎯 Detectado "1 millon/millón" en el texto');
      
      // Patrón específico para este caso
      const millionPattern = /m[aá]s\s+de\s+(\d+)\s*mil\s+y\s+menos\s+de\s+(\d+)\s+mill?[oó]n/gi;
      const millionMatch = millionPattern.exec(lowerText);
      
      if (millionMatch) {
        const minPrice = parseInt(millionMatch[1]) * 1000; // 300mil = 300000
        const maxPrice = parseInt(millionMatch[2]) * 1000000; // 1 millon = 1000000
        
        console.log('🎯 Patrón millón específico encontrado:', { 
          texto: millionMatch[0], 
          minTexto: millionMatch[1] + 'mil',
          maxTexto: millionMatch[2] + ' millon',
          min: minPrice, 
          max: maxPrice 
        });

        result.min = minPrice;
        result.max = maxPrice;
        return result;
      }
    }

    // 2. PRIORIDAD ALTA: Buscar el patrón específico "más de X y menos de Y" con espacios flexibles
    // Patrón más específico que captura "millon" completo
    const specificPattern = /m[aá]s\s+de\s+(\d+\s*(?:mil(?:l[oó]n(?:es?)?)?)?)\s+y\s+menos\s+de\s+(\d+\s*(?:mil(?:l[oó]n(?:es?)?)?)?)/gi;
    let specificMatch = specificPattern.exec(lowerText);
    
    // Patrón alternativo más simple para casos problemáticos
    if (!specificMatch) {
      const alternatePattern = /m[aá]s\s+de\s+(\d+(?:\s*mil)*(?:\s*mill?[oó]n(?:es?)?)?)\s+y\s+menos\s+de\s+(\d+(?:\s*mil)*(?:\s*mill?[oó]n(?:es?)?)?)/gi;
      specificMatch = alternatePattern.exec(lowerText);
    }
    
    if (specificMatch) {
      const minPrice = this.normalizePrice(specificMatch[1]);
      const maxPrice = this.normalizePrice(specificMatch[2]);
      
      console.log('🎯 Patrón específico encontrado:', { 
        texto: specificMatch[0], 
        minTexto: specificMatch[1],
        maxTexto: specificMatch[2],
        min: minPrice, 
        max: maxPrice 
      });

      if (minPrice > 0 && maxPrice > 0) {
        result.min = minPrice;
        result.max = maxPrice;
        return result;
      }
    }

    // 2. Buscar otros rangos explícitos
    for (const pattern of this.rangePatterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(lowerText);
      if (match) {
        const minPrice = this.normalizePrice(match[1]);
        const maxPrice = this.normalizePrice(match[2]);
        
        console.log('📊 Rango encontrado:', { 
          texto: match[0], 
          min: minPrice, 
          max: maxPrice 
        });

        if (minPrice > 0 && maxPrice > 0) {
          result.min = Math.min(minPrice, maxPrice);
          result.max = Math.max(minPrice, maxPrice);
          return result;
        }
      }
    }

    // 3. Buscar precios máximos y mínimos por separado
    let foundMax = false;
    let foundMin = false;

    // Buscar precio máximo
    for (const pattern of this.maxPricePatterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(lowerText);
      if (match && !foundMax) {
        const maxPrice = this.normalizePrice(match[1]);
        console.log('📉 Precio máximo encontrado:', { texto: match[0], max: maxPrice });
        
        if (maxPrice > 0) {
          result.max = maxPrice;
          foundMax = true;
        }
      }
    }

    // Buscar precio mínimo
    for (const pattern of this.minPricePatterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(lowerText);
      if (match && !foundMin) {
        const minPrice = this.normalizePrice(match[1]);
        console.log('📈 Precio mínimo encontrado:', { texto: match[0], min: minPrice });
        
        if (minPrice > 0) {
          result.min = minPrice;
          foundMin = true;
        }
      }
    }

    // 4. Si no encontró rangos explícitos, buscar precios individuales como último recurso
    if (!result.min && !result.max) {
      const prices: number[] = [];
      
      for (const pattern of this.pricePatterns) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(lowerText)) !== null) {
          let price: number;
          if (match[2]) {
            // Tiene multiplicador K/M
            price = this.normalizePrice(match[1] + match[2]);
          } else {
            price = this.normalizePrice(match[1]);
          }
          
          if (price > 0 && price >= 50000) { // Filtrar precios muy bajos
            prices.push(price);
            console.log('💰 Precio individual encontrado:', { texto: match[0], precio: price });
          }
        }
      }

      // Si encontró múltiples precios, usar como rango
      if (prices.length >= 2) {
        const sortedPrices = prices.sort((a, b) => a - b);
        result.min = sortedPrices[0];
        result.max = sortedPrices[sortedPrices.length - 1];
        console.log('📊 Rango inferido de múltiples precios:', result);
      } else if (prices.length === 1) {
        // Decidir si es máximo o mínimo basado en contexto
        if (lowerText.includes('menos') || lowerText.includes('hasta') || 
            lowerText.includes('máximo') || lowerText.includes('tope')) {
          result.max = prices[0];
          console.log('📉 Precio único interpretado como máximo:', prices[0]);
        } else if (lowerText.includes('desde') || lowerText.includes('mínimo') || 
                   lowerText.includes('más de')) {
          result.min = prices[0];
          console.log('📈 Precio único interpretado como mínimo:', prices[0]);
        }
      }
    }

    console.log('✅ Resultado final de extracción de precios:', result);
    return result;
  }

  /**
   * Método de prueba específico para tu caso
   */
  public static testSpecificCase(): void {
    console.log('🧪 Probando caso específico...\n');
    
    const testTexts = [
      "Quiero una casa en renta de mas de 300mil y menos de 1 millon",
      "mas de 300mil  y menos de 1 millon", // con espacios extras
      "más de 300 mil y menos de 1 millón",
      "mas de 300 mil y menos de 1 millón"
    ];
    
    testTexts.forEach((testText, index) => {
      console.log(`\n--- Prueba ${index + 1} ---`);
      console.log(`Texto: "${testText}"`);
      
      const result = this.extractPriceRange(testText);
      console.log('Resultado esperado: { min: 300000, max: 1000000 }');
      console.log('Resultado obtenido:', result);
      
      const isCorrect = result.min === 300000 && result.max === 1000000;
      console.log(isCorrect ? '✅ CORRECTO' : '❌ INCORRECTO');
    });
  }

  /**
   * Método de prueba para múltiples casos
   */
  public static testExtraction(texts: string[]): void {
    console.log('🧪 Iniciando pruebas de extracción de precios...\n');
    
    texts.forEach((text, index) => {
      console.log(`--- Prueba ${index + 1} ---`);
      console.log(`Texto: "${text}"`);
      const result = this.extractPriceRange(text);
      console.log('Resultado:', result);
      console.log('');
    });
  }
}

// Integración con el extractor existente
export const extractPriceRange = (text: string): { min?: number; max?: number } => {
  return PricePatternExtractor.extractPriceRange(text);
};

// Función de prueba para ejecutar en consola
export const testPriceExtraction = () => {
  PricePatternExtractor.testSpecificCase();
  
  console.log('\n--- Casos adicionales ---');
  PricePatternExtractor.testExtraction([
    "más de 300mil y menos de 1 millón",
    "entre 500000 y 2000000",
    "de 300 mil a 1.5 millones", 
    "desde 400K hasta 900K",
    "máximo 800000",
    "más de 1 millón",
    "menos de 500 mil"
  ]);
};