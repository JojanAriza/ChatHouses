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
    /(en vez de|en lugar de|cambiar)/i,
    /cerca|cercano|próximo/i,
    /hospital|escuela|parque|universidad/i,
  ];

  return (
    followUpPatterns.some((pattern) => pattern.test(lowerText)) &&
    hasLastSearchCriteria
  );
};

export const extractCriteriaLocally = (text: string): SearchCriteria => {
  const lowerText = text.toLowerCase();
  const criteria: SearchCriteria = {};

  console.log("🔍 Extrayendo criterios localmente de:", text);

  // Detectar "amoblada" con múltiples variantes
  if (lowerText.includes('amoblada') || 
      lowerText.includes('amueblada') || 
      lowerText.includes('con muebles') ||
      lowerText.includes('que tenga muebles') ||
      lowerText.includes('que esté amoblada')) {
    criteria.amoblada = true;
    console.log("✅ Detectado: amoblada = true");
  }
  
  if (lowerText.includes('sin muebles') || 
      lowerText.includes('no amoblada') || 
      lowerText.includes('no amueblada') ||
      lowerText.includes('sin amoblar') ||
      lowerText.includes('que no tenga muebles')) {
    criteria.amoblada = false;
    console.log("❌ Detectado: amoblada = false");
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

  console.log("🎯 Criterios extraídos localmente:", criteria);
  return criteria;
};

export const extractCriteriaFromFollowUp = (
  text: string,
  previousCriteria: SearchCriteria | null = null
): SearchCriteria => {
  console.log("📝 extractCriteriaFromFollowUp - Texto de entrada:", text);
  console.log("📋 extractCriteriaFromFollowUp - Criterios anteriores:", previousCriteria);

  // SIEMPRE extraer criterios localmente primero
  let criteria = extractCriteriaLocally(text);
  console.log("🏠 Criterios extraídos localmente:", criteria);

  // Luego intentar extraer con la función API (si existe)
  try {
    const apiCriteria = extractCriteriaFromText(text);
    console.log("🌐 Criterios extraídos de API:", apiCriteria);
    
    // Combinar los criterios (local tiene prioridad para "amoblada")
    criteria = { ...apiCriteria, ...criteria };
  } catch (error) {
    console.warn("⚠️ Error al extraer criterios de API, usando solo locales:", error);
  }

  console.log("🎯 Criterios combinados:", criteria);

  // Si no hay criterios previos, retornar los nuevos
  if (!previousCriteria) {
    console.log("✨ Sin criterios previos, usando criterios nuevos");
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
    console.log("🔄 Búsqueda completamente nueva detectada");
    return criteria;
  }

  // Mergear todos los criterios nuevos con los anteriores
  (Object.keys(criteria) as (keyof SearchCriteria)[]).forEach((key) => {
    const newValue = criteria[key];
    if (newValue !== undefined && newValue !== null) {
      console.log(`🔧 Actualizando ${key}: ${merged[key]} -> ${newValue}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (merged as any)[key] = newValue;
    }
  });

  console.log("🎯 Criterios finales merged:", merged);
  return merged;
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