import { BathroomPatternExtractor } from "../patterns/bathroomPatterns";
import { BooleanPatternExtractor } from "../patterns/booleanPatterns";
import { GenericPatternExtractor } from "../patterns/genericPatterns";
import { NumericPatternExtractor } from "../patterns/numericPatterns";
import { PricePatternExtractor } from "../patterns/pricePatterns";
import { ProximityPatternExtractor } from "../patterns/proximityPatternExtractor";
import { RoomPatternExtractor } from "../patterns/roomPatterns";
import type { SearchCriteria, CasaMatch } from "../types";


export const extractCriteriaFromText = (text: string): SearchCriteria => {
  const criteria: SearchCriteria = {};

  console.log('🔍 Extrayendo criterios del texto:', text);

  // Extraer habitaciones
  const piezas = RoomPatternExtractor.extract(text);
  if (piezas !== null) {
    criteria.piezas = piezas;
    console.log('🏠 Habitaciones encontradas:', piezas);
  }

  // Extraer baños
  const banos = BathroomPatternExtractor.extract(text);
  if (banos !== null) {
    criteria.banos = banos;
    console.log('🚿 Baños encontrados:', banos);
  }

  // Patrón genérico solo si no se encontró nada específico
  const genericResults = GenericPatternExtractor.extractWithContext(text, criteria);
  Object.assign(criteria, genericResults);

  // Extraer características booleanas
  const booleanProperties: Array<keyof typeof BooleanPatternExtractor.patterns> = [
    'garage', 'internet', 'amoblada', 'balcon', 'asensor', 'television'
  ];

  for (const property of booleanProperties) {
    if (!Object.prototype.hasOwnProperty.call(criteria, property)) {
      const value = BooleanPatternExtractor.extract(text, property);
      if (value !== null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (criteria as any)[property] = value;
        console.log(`✅ ${property}:`, value);
      }
    }
  }

  // Extraer valores numéricos
  const pisos = NumericPatternExtractor.extractFloors(text);
  if (pisos !== null) {
    criteria.pisos = pisos;
    console.log('🏢 Pisos encontrados:', pisos);
  }

  const area = NumericPatternExtractor.extractArea(text);
  if (area !== null) {
    criteria.area = area;
    console.log('📐 Área encontrada:', area);
  }

  // ✅ USAR EL NUEVO EXTRACTOR DE PRECIOS
  const priceRange = PricePatternExtractor.extractPriceRange(text);
  if (priceRange.min !== undefined) {
    criteria.precioMin = priceRange.min;
    console.log('💰 Precio mínimo:', priceRange.min);
  }
  if (priceRange.max !== undefined) {
    criteria.precioMax = priceRange.max;
    console.log('💰 Precio máximo:', priceRange.max);
  }

  // ✅ Extraer proximidades usando el extractor modular
  const proximities = ProximityPatternExtractor.extractProximities(text);
  Object.assign(criteria, proximities);
  if (Object.keys(proximities).length > 0) {
    console.log('📍 Proximidades encontradas:', proximities);
  }

  console.log('📋 Criterios finales extraídos:', criteria);
  return criteria;
};

// El resto de la función formatCasasResults permanece igual
export const formatCasasResults = (matches: CasaMatch[]): string => {
  if (matches.length === 0) {
    return "No se encontraron casas que coincidan con tus criterios en un 70% o más. Te sugiero ajustar algunos criterios para obtener mejores resultados.";
  }

  let result = `Encontré ${matches.length} casa${
    matches.length > 1 ? "s" : ""
  } que coinciden con tus criterios en un 70% o más:\n\n`;

  matches.forEach((match, index) => {
    const casa = match.casa;
    result += `${index + 1}. **${casa.Name || `Casa ${casa.OBJECTID}`}**\n`;
    result += `   • ${casa.Piezas || 0} habitaciones, ${
      casa.Banos || 0
    } baños\n`;
    result += `   • ${casa.Pisos || "N/A"} pisos, ${
      casa.Area_m2 || "N/A"
    } m²\n`;
    result += `   • ${casa.Garage ? "Con" : "Sin"} garage\n`;
    result += `   • ${casa.Internet ? "Con" : "Sin"} internet\n`;
    result += `   • ${casa.Amoblada ? "Amoblada" : "Sin amoblar"}\n`;
    result += `   • ${casa.Balcon ? "Con" : "Sin"} balcón\n`;
    result += `   • ${casa.Asensor ? "Con" : "Sin"} ascensor\n`;
    result += `   • ${casa.Television ? "Con" : "Sin"} televisión\n`;

    if (casa.Precio) {
      result += `   • Precio: $${casa.Precio.toLocaleString()}\n`;
    }

    if (casa.Telefono) {
      result += `   • Teléfono: ${casa.Telefono}\n`;
    }

    result += `   • Hospital: ${casa.Hospital_Car || "N/A"} min en carro, ${
      casa.Hospital_foot || "N/A"
    } min caminando\n`;
    result += `   • Escuela: ${casa.Escuelas_Car || "N/A"} min en carro, ${
      casa.Escuelas_foot || "N/A"
    } min caminando\n`;
    result += `   • Parque: ${casa.Parques_Car || "N/A"} min en carro, ${
      casa.Parques_foot || "N/A"
    } min caminando\n`;
    result += `   • Universidad: ${
      casa.Universidades_Car || "N/A"
    } min en carro, ${casa.Universidades_foot || "N/A"} min caminando\n`;

    if (match.matches.length > 0) {
      result += `   ✅ **Coincidencias exactas:** ${match.matches.join(
        ", "
      )}\n`;
    }

    if (match.partialMatches.length > 0) {
      result += `   ⚠️ **Coincidencias parciales:** ${match.partialMatches.join(
        ", "
      )}\n`;
      
    }

    result += `   📊 **Nivel de coincidencia:** ${Math.round(
      match.score
    )}%\n\n`;
  });

  return result;
};
