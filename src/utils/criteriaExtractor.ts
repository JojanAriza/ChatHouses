import { extractCriteriaFromText } from "../services/arcGisApi";
import type { SearchCriteria } from "../types";

export const isHouseQuery = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  const houseKeywords = [
    "casa",
    "casas", 
    "vivienda",
    "hogar",
    "apartamento",
    "propiedad",
    "piezas",
    "pieza",
    "cuarto",
    "cuartos",
    "habitación",
    "habitaciones",
    "baño",
    "baños",
    "garage",
    "balcón",
    "amoblada",
    "amueblada",
    "con muebles",
    "sin muebles",
    "busco",
    "necesito",
    "quiero",
    "me interesa",
    "mostrar",
    "encontrar",
    // Agregar palabras clave para modificaciones
    "en vez de",
    "en lugar de", 
    "cambiar",
    "cambio",
    "ahora",
    "mejor",
    "prefiero",
    "dame",
    // Palabras clave para características específicas
    "internet",
    "ascensor",
    "televisión",
    "tv",
    "con",
    "sin",
    "tenga",
    "que tenga",
    "que no tenga",
    // Palabras clave para ubicación
    "cerca",
    "cercano",
    "próximo",
    "hospital",
    "escuela",
    "parque",
    "universidad",
  ];

  return houseKeywords.some((keyword) => lowerText.includes(keyword));
};

export const isFollowUpQuery = (text: string, hasLastSearchCriteria: boolean): boolean => {
  const lowerText = text.toLowerCase();
  
  const followUpPatterns = [
    /^(quiero|prefiero|mejor|dame|ahora)/i,
    /^(con|sin)/i,
    /^(que tenga|que no tenga)/i,
    /internet|garage|balcón|ascensor|televisión|tv/i,
    /(amoblada|amueblada|con muebles|sin muebles)/i,
    /(en vez de|en lugar de|cambiar|no quiero)/i, // ← Agregado "no quiero"
    /cerca|cercano|próximo/i,
    /hospital|escuela|parque|universidad/i,
    /(ahora|mejor)\s+(?:quiero|prefiero|que)/i, // ← Nuevo patrón
  ];

  // También considerar seguimiento si detectamos números con contexto de modificación
  const modificationPatterns = [
    /(?:en vez de|en lugar de|cambiar|no quiero|ahora|mejor|prefiero)\s*.*\d+/i,
    /\d+\s+(?:pisos?|piezas?|baños?)\s*(?:en vez|mejor|ahora)/i
  ];

  const isFollowUpPattern = followUpPatterns.some((pattern) => pattern.test(lowerText));
  const isModificationPattern = modificationPatterns.some((pattern) => pattern.test(lowerText));

  return (isFollowUpPattern || isModificationPattern) && hasLastSearchCriteria;
};


export const extractCriteriaLocally = (text: string): SearchCriteria => {
  const lowerText = text.toLowerCase();
  const criteria: SearchCriteria = {};


  // Detectar "amoblada" con múltiples variantes
  if (lowerText.includes('amoblada') || 
      lowerText.includes('amueblada') || 
      lowerText.includes('con muebles') ||
      lowerText.includes('que tenga muebles') ||
      lowerText.includes('que esté amoblada')) {
    criteria.amoblada = true;
  }
  
  if (lowerText.includes('sin muebles') || 
      lowerText.includes('no amoblada') || 
      lowerText.includes('no amueblada') ||
      lowerText.includes('sin amoblar') ||
      lowerText.includes('que no tenga muebles')) {
    criteria.amoblada = false;
  }

  // Detectar otras características
  if (lowerText.includes('con garage') || lowerText.includes('que tenga garage')) {
    criteria.garage = true;
  }
  if (lowerText.includes('sin garage') || lowerText.includes('que no tenga garage')) {
    criteria.garage = false;
  }

  if (lowerText.includes('con internet') || lowerText.includes('que tenga internet')) {
    criteria.internet = true;
  }
  if (lowerText.includes('sin internet') || lowerText.includes('que no tenga internet')) {
    criteria.internet = false;
  }

  if (lowerText.includes('con balcón') || lowerText.includes('que tenga balcón')) {
    criteria.balcon = true;
  }
  if (lowerText.includes('sin balcón') || lowerText.includes('que no tenga balcón')) {
    criteria.balcon = false;
  }

  if (lowerText.includes('con ascensor') || lowerText.includes('que tenga ascensor')) {
    criteria.asensor = true;
  }
  if (lowerText.includes('sin ascensor') || lowerText.includes('que no tenga ascensor')) {
    criteria.asensor = false;
  }

  if (lowerText.includes('con televisión') || lowerText.includes('con tv') || lowerText.includes('que tenga televisión')) {
    criteria.television = true;
  }
  if (lowerText.includes('sin televisión') || lowerText.includes('sin tv') || lowerText.includes('que no tenga televisión')) {
    criteria.television = false;
  }

  // Detectar ubicaciones
  if (lowerText.includes('cerca del hospital') || lowerText.includes('próximo al hospital')) {
    criteria.nearHospital = true;
  }
  if (lowerText.includes('cerca de la escuela') || lowerText.includes('próximo a la escuela')) {
    criteria.nearSchool = true;
  }
  if (lowerText.includes('cerca del parque') || lowerText.includes('próximo al parque')) {
    criteria.nearPark = true;
  }
  if (lowerText.includes('cerca de la universidad') || lowerText.includes('próximo a la universidad')) {
    criteria.nearUniversity = true;
  }

  // Detectar números (habitaciones, baños, etc.)
  const piezasMatch = text.match(/(\d+)\s*(piezas|habitaciones|cuartos|habitación|pieza|cuarto)/i);
  if (piezasMatch) {
    criteria.piezas = parseInt(piezasMatch[1]);
  }

  const banosMatch = text.match(/(\d+)\s*(baños|baño)/i);
  if (banosMatch) {
    criteria.banos = parseInt(banosMatch[1]);
  }

  const pisosMatch = text.match(/(\d+)\s*(pisos|piso)/i);
  if (pisosMatch) {
    criteria.pisos = parseInt(pisosMatch[1]);
  }

  // Detectar área
  const areaMatch = text.match(/(\d+)\s*m²/i);
  if (areaMatch) {
    criteria.area = parseInt(areaMatch[1]);
  }

return extractCriteriaLocallyImproved(text);
};


export const extractCriteriaFromFollowUp = (
  text: string,
  previousCriteria: SearchCriteria | null = null
): SearchCriteria => {
  
  // FUNCIÓN MEJORADA: Detectar cambios específicos en el texto
  const detectValueChanges = (text: string, previousCriteria: SearchCriteria | null): SearchCriteria => {
    const changes: SearchCriteria = {};
    const lowerText = text.toLowerCase();
  

    // NUEVO: Patrones para detectar cambios sin especificar el tipo (inferir del contexto)
    const contextualChangePatterns = [
      // "en vez de 3 sean 2" - inferir del contexto previo
      {
        regex: /(?:en\s+vez\s+de|en\s+lugar\s+de|cambiar(?:\s+de)?|no\s+(?:quiero\s+)?)\s*(\d+)(?:\s+(?:sean?|que(?:\s+sean?)?|a|por))?\s*(\d+)(?!\s+(?:pisos?|piezas?|baños?|plantas?|niveles?|habitaciones?|cuartos?|dormitorios?|wc))/gi,
        needsContext: true
      }
    ];

    // Buscar patrones contextuales PRIMERO
    for (const pattern of contextualChangePatterns) {
      const matches = [...lowerText.matchAll(pattern.regex)];
      
      if (matches.length > 0 && previousCriteria) {
        const match = matches[0];
        if (match[1] && match[2]) {
          const oldValue = parseInt(match[1]);
          const newValue = parseInt(match[2]);
      
          
          // Buscar qué campo tiene el valor anterior para inferir el contexto
          const fieldsToCheck = ['pisos', 'piezas', 'banos'] as const;
          for (const field of fieldsToCheck) {
            if (previousCriteria[field] === oldValue) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (changes as any)[field] = newValue;
              return changes; // Retornar inmediatamente una vez encontrado
            }
          }
        }
      }
    }

    // Patrones específicos con tipo de habitación mencionado
    const changePatterns = [
      // "en vez de 3 pisos sean 2", "en lugar de 3 pisos quiero 2", etc.
      {
        regex: /(?:en\s+vez\s+de|en\s+lugar\s+de|cambiar(?:\s+de)?|no\s+(?:quiero\s+)?)\s*(\d+)(?:\s+(?:pisos?|plantas?|niveles?))?\s*(?:sean?|que(?:\s+sean?)?|a|por)?\s*(\d+)(?:\s+(?:pisos?|plantas?|niveles?))/gi,
        field: 'pisos' as keyof SearchCriteria
      },
      {
        regex: /(?:en\s+vez\s+de|en\s+lugar\s+de|cambiar(?:\s+de)?|no\s+(?:quiero\s+)?)\s*(\d+)(?:\s+(?:piezas?|habitaciones?|cuartos?|dormitorios?))?\s*(?:sean?|que(?:\s+sean?)?|a|por)?\s*(\d+)(?:\s+(?:piezas?|habitaciones?|cuartos?|dormitorios?))/gi,
        field: 'piezas' as keyof SearchCriteria
      },
      {
        regex: /(?:en\s+vez\s+de|en\s+lugar\s+de|cambiar(?:\s+de)?|no\s+(?:quiero\s+)?)\s*(\d+)(?:\s+(?:baños?|wc))?\s*(?:sean?|que(?:\s+sean?)?|a|por)?\s*(\d+)(?:\s+(?:baños?|wc))/gi,
        field: 'banos' as keyof SearchCriteria
      },
      
      // "ahora quiero 2 pisos", "mejor que sean 2", "prefiero 2"
      {
        regex: /(?:ahora\s+(?:quiero|prefiero)|mejor\s+(?:que\s+)?sean?|prefiero)\s*(\d+)(?:\s+(?:pisos?|plantas?|niveles?))/gi,
        field: 'pisos' as keyof SearchCriteria
      },
      {
        regex: /(?:ahora\s+(?:quiero|prefiero)|mejor\s+(?:que\s+)?sean?|prefiero)\s*(\d+)(?:\s+(?:piezas?|habitaciones?|cuartos?|dormitorios?))/gi,
        field: 'piezas' as keyof SearchCriteria
      },
      {
        regex: /(?:ahora\s+(?:quiero|prefiero)|mejor\s+(?:que\s+)?sean?|prefiero)\s*(\d+)(?:\s+(?:baños?|wc))/gi,
        field: 'banos' as keyof SearchCriteria
      },

      // "que tenga 2 pisos" (cuando ya hay criterios previos y es diferente)
      {
        regex: /(?:que\s+tenga|con)\s*(\d+)(?:\s+(?:pisos?|plantas?|niveles?))/gi,
        field: 'pisos' as keyof SearchCriteria
      },
      {
        regex: /(?:que\s+tenga|con)\s*(\d+)(?:\s+(?:piezas?|habitaciones?|cuartos?|dormitorios?))/gi,
        field: 'piezas' as keyof SearchCriteria
      },
      {
        regex: /(?:que\s+tenga|con)\s*(\d+)(?:\s+(?:baños?|wc))/gi,
        field: 'banos' as keyof SearchCriteria
      }
    ];

    // Buscar patrones específicos
    for (const pattern of changePatterns) {
      const matches = [...lowerText.matchAll(pattern.regex)];
      
      for (const match of matches) {
        
        if (pattern.regex.source.includes('en\\s+vez\\s+de|en\\s+lugar\\s+de|cambiar')) {
          // Para patrones de cambio "de X a Y"
          let newValue;
          if (match[2]) {
            // Caso normal: "en vez de 3 sean 2 pisos"
            newValue = parseInt(match[2]);
          } else if (match[1]) {
            // Caso donde no hay segundo número, usar el primero
            newValue = parseInt(match[1]);
          }
          
          if (newValue && !isNaN(newValue)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (changes as any)[pattern.field] = newValue;
          }
        } else {
          // Para otros patrones, tomar el primer número
          if (match[1]) {
            const newValue = parseInt(match[1]);
            if (!isNaN(newValue) && previousCriteria) {
              // Solo agregar si es diferente al valor anterior
              const currentValue = previousCriteria[pattern.field as keyof SearchCriteria];
              if (currentValue !== newValue) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (changes as any)[pattern.field] = newValue;
              }
            } else if (!previousCriteria) {
              // Si no hay criterios previos, agregar directamente
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (changes as any)[pattern.field] = newValue;
            }
          }
        }
      }
    }

    // Detectar cambios en características booleanas
    const booleanChanges = [
      {
        regex: /(?:en\s+vez\s+de|en\s+lugar\s+de|ahora|mejor|prefiero).*(?:sin\s+(?:muebles|amoblada|amueblar)|no\s+amoblada)/gi,
        field: 'amoblada' as keyof SearchCriteria,
        value: false
      },
      {
        regex: /(?:en\s+vez\s+de|en\s+lugar\s+de|ahora|mejor|prefiero).*(?:con\s+(?:muebles|amoblada|amueblar)|amoblada)/gi,
        field: 'amoblada' as keyof SearchCriteria,
        value: true
      },
      {
        regex: /(?:en\s+vez\s+de|en\s+lugar\s+de|ahora|mejor|prefiero).*(?:sin\s+(?:garage|garaje|estacionamiento))/gi,
        field: 'garage' as keyof SearchCriteria,
        value: false
      },
      {
        regex: /(?:en\s+vez\s+de|en\s+lugar\s+de|ahora|mejor|prefiero).*(?:con\s+(?:garage|garaje|estacionamiento))/gi,
        field: 'garage' as keyof SearchCriteria,
        value: true
      }
    ];

    for (const boolPattern of booleanChanges) {
      if (boolPattern.regex.test(lowerText)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (changes as any)[boolPattern.field] = boolPattern.value;
      }
    }
    return changes;
  };

  // 1. PRIMERO: Detectar cambios específicos en el texto
  const detectedChanges = detectValueChanges(text, previousCriteria);

  // 2. SEGUNDO: Extraer criterios localmente (función mejorada)
  let criteria = extractCriteriaLocallyImproved(text);

  // 3. TERCERO: Intentar extraer con la función API
  try {
    const apiCriteria = extractCriteriaFromText(text);
    // Combinar los criterios (local tiene prioridad para "amoblada")
    criteria = { ...apiCriteria, ...criteria };
  } catch (error) {
    console.warn("⚠️ Error al extraer criterios de API, usando solo locales:", error);
  }

  // 4. CUARTO: Los cambios detectados tienen máxima prioridad
  criteria = { ...criteria, ...detectedChanges };

  // Si no hay criterios previos, retornar los nuevos
  if (!previousCriteria) {
    return criteria;
  }

  // Empezar con los criterios previos como base
  const merged = { ...previousCriteria };

  // Verificar si es una búsqueda completamente nueva
  const lowerText = text.toLowerCase();
  const isCompletelyNewSearch =
    lowerText.includes("nueva búsqueda") ||
    lowerText.includes("empezar de nuevo") ||
    lowerText.includes("buscar otra cosa") ||
    lowerText.includes("cambiar todo") ||
    lowerText.includes("olvidate de lo anterior") ||
    lowerText.includes("olvídate de lo anterior");

  if (isCompletelyNewSearch) {
    return criteria;
  }

  // Mergear todos los criterios nuevos con los anteriores
  (Object.keys(criteria) as (keyof SearchCriteria)[]).forEach((key) => {
    const newValue = criteria[key];
    if (newValue !== undefined && newValue !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (merged as any)[key] = newValue;
    }
  });

  return merged;
};

export const extractCriteriaLocallyImproved = (
  text: string,
): SearchCriteria => {
  const lowerText = text.toLowerCase();
  const criteria: SearchCriteria = {};

  // Detectar "amoblada" con múltiples variantes
  if (lowerText.includes('amoblada') || 
      lowerText.includes('amueblada') || 
      lowerText.includes('con muebles') ||
      lowerText.includes('que tenga muebles') ||
      lowerText.includes('que esté amoblada')) {
    criteria.amoblada = true;
  }
  
  if (lowerText.includes('sin muebles') || 
      lowerText.includes('no amoblada') || 
      lowerText.includes('no amueblada') ||
      lowerText.includes('sin amoblar') ||
      lowerText.includes('que no tenga muebles')) {
    criteria.amoblada = false;
  }

  // Detectar otras características
  if (lowerText.includes('con garage') || lowerText.includes('que tenga garage')) {
    criteria.garage = true;
  }
  if (lowerText.includes('sin garage') || lowerText.includes('que no tenga garage')) {
    criteria.garage = false;
  }

  if (lowerText.includes('con internet') || lowerText.includes('que tenga internet')) {
    criteria.internet = true;
  }
  if (lowerText.includes('sin internet') || lowerText.includes('que no tenga internet')) {
    criteria.internet = false;
  }

  if (lowerText.includes('con balcón') || lowerText.includes('que tenga balcón')) {
    criteria.balcon = true;
  }
  if (lowerText.includes('sin balcón') || lowerText.includes('que no tenga balcón')) {
    criteria.balcon = false;
  }

  if (lowerText.includes('con ascensor') || lowerText.includes('que tenga ascensor')) {
    criteria.asensor = true;
  }
  if (lowerText.includes('sin ascensor') || lowerText.includes('que no tenga ascensor')) {
    criteria.asensor = false;
  }

  if (lowerText.includes('con televisión') || lowerText.includes('con tv') || lowerText.includes('que tenga televisión')) {
    criteria.television = true;
  }
  if (lowerText.includes('sin televisión') || lowerText.includes('sin tv') || lowerText.includes('que no tenga televisión')) {
    criteria.television = false;
  }

  // Detectar ubicaciones
  if (lowerText.includes('cerca del hospital') || lowerText.includes('próximo al hospital')) {
    criteria.nearHospital = true;
  }
  if (lowerText.includes('cerca de la escuela') || lowerText.includes('próximo a la escuela')) {
    criteria.nearSchool = true;
  }
  if (lowerText.includes('cerca del parque') || lowerText.includes('próximo al parque')) {
    criteria.nearPark = true;
  }
  if (lowerText.includes('cerca de la universidad') || lowerText.includes('próximo a la universidad')) {
    criteria.nearUniversity = true;
  }

  // ⚠️ MEJORAR: Detectar números de forma más inteligente
  // Solo extraer números si NO son parte de un patrón de cambio ya procesado
  const hasChangePattern = /(?:en vez de|en lugar de|cambiar|ahora|mejor|prefiero).*\d+/i.test(lowerText);
  
  if (!hasChangePattern) {
    // Detectar números normalmente si no hay patrones de cambio
    const piezasMatch = text.match(/(\d+)\s*(piezas|habitaciones|cuartos|habitación|pieza|cuarto)/i);
    if (piezasMatch) {
      criteria.piezas = parseInt(piezasMatch[1]);
    }

    const banosMatch = text.match(/(\d+)\s*(baños|baño)/i);
    if (banosMatch) {
      criteria.banos = parseInt(banosMatch[1]);
    }

    const pisosMatch = text.match(/(\d+)\s*(pisos|piso)/i);
    if (pisosMatch) {
      criteria.pisos = parseInt(pisosMatch[1]);
    }

    // Detectar área
    const areaMatch = text.match(/(\d+)\s*m²/i);
    if (areaMatch) {
      criteria.area = parseInt(areaMatch[1]);
    }
  }

  return criteria;
};

export const formatCriteriaText = (criteria: SearchCriteria): string => {
  const parts: string[] = [];

  if (criteria.piezas) parts.push(`${criteria.piezas} habitaciones`);
  if (criteria.banos) parts.push(`${criteria.banos} baños`);
  if (criteria.pisos) parts.push(`${criteria.pisos} pisos`);
  if (criteria.area) parts.push(`${criteria.area} m²`);
  if (criteria.precioMin && criteria.precioMax) {
    parts.push(
      `Precio: ${criteria.precioMin.toLocaleString()} - ${criteria.precioMax.toLocaleString()}`
    );
  } else if (criteria.precioMin) {
    parts.push(`Precio mínimo: ${criteria.precioMin.toLocaleString()}`);
  } else if (criteria.precioMax) {
    parts.push(`Precio máximo: ${criteria.precioMax.toLocaleString()}`);
  }

  if (criteria.garage === true) parts.push("Con garage");
  if (criteria.garage === false) parts.push("Sin garage");
  if (criteria.internet === true) parts.push("Con internet");
  if (criteria.internet === false) parts.push("Sin internet");
  
  // Mejorar display de "amoblada"
  if (criteria.amoblada === true) parts.push("✅ Amoblada");
  if (criteria.amoblada === false) parts.push("❌ Sin amoblar");
  
  if (criteria.balcon === true) parts.push("Con balcón");
  if (criteria.balcon === false) parts.push("Sin balcón");
  if (criteria.asensor === true) parts.push("Con ascensor");
  if (criteria.asensor === false) parts.push("Sin ascensor");
  if (criteria.television === true) parts.push("Con televisión");
  if (criteria.television === false) parts.push("Sin televisión");

  if (criteria.nearHospital) parts.push("Cerca de hospital");
  if (criteria.nearSchool) parts.push("Cerca de escuela");
  if (criteria.nearPark) parts.push("Cerca de parque");
  if (criteria.nearUniversity) parts.push("Cerca de universidad");

  return parts.length > 0
    ? `📋 Criterios de búsqueda: ${parts.join(", ")}`
    : "";
};