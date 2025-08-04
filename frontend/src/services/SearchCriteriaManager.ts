import { extractCriteriaFromText } from "./arcGisApi";
import type { SearchCriteria } from "../types";

export class SearchCriteriaManager {
  private lastSearchCriteria: SearchCriteria | null = null;

  async shouldSearchCasas(text: string): Promise<boolean> {
    const lowerText = text.toLowerCase();

    // Palabras clave principales para búsqueda de casas
    const houseKeywords = [
      "casa", "casas", "vivienda", "hogar", "apartamento", "propiedad",
      "inmueble", "habitación", "habitaciones", "cuarto", "cuartos",
      "dormitorio", "dormitorios", "piezas", "baño", "baños", "garage",
      "balcón", "amoblada", "amueblada", "ascensor", "busco", "necesito",
      "quiero", "me interesa", "mostrar", "encontrar", "hay", "precio",
      "pesos", "millones", "alquiler", "arriendo", "venta", "cerca",
      "hospital", "escuela", "universidad", "parque", "colegio",
      "internet", "televisión", "tv", "pisos", "área", "metros", "m2", "m²"
    ];

    // Patrones específicos para búsqueda de casas
    const searchPatterns = [
      /\d+\s*(habitaciones?|cuartos?|dormitorios?|piezas?)/,
      /\d+\s*(baños?|baño)/,
      /\d+\s*(pisos?|piso)/,
      /\d+\s*(m2|metros|m²)/,
      /\$?\d+(?:\.\d{3})*(?:,\d{3})*/,
      /(con|sin)\s+(garage|internet|balcón|ascensor|televisión)/,
      /cerca\s+(del?|de)\s+(hospital|escuela|universidad|parque)/,
    ];

    // Palabras clave para modificaciones/seguimiento
    const followUpKeywords = [
      "mejor", "prefiero", "cambio", "modificar", "ajustar", "quiero que",
      "en lugar de", "en vez de", "pero", "sino", "no", "solo",
      "solamente", "únicamente", "nada más", "más bien", "ahora",
      "ahora quiero", "actualizar", "corregir", "rectificar", "cambia",
      "cambialo", "cambiala"
    ];

    // Verificar si es una consulta directa de casas
    const isDirectHouseSearch =
      houseKeywords.some((keyword) => lowerText.includes(keyword)) ||
      searchPatterns.some((pattern) => pattern.test(lowerText));

    // Verificar si es una consulta de seguimiento (hay criterios previos)
    const isFollowUpQuery =
      this.lastSearchCriteria &&
      (followUpKeywords.some((keyword) => lowerText.includes(keyword)) ||
        searchPatterns.some((pattern) => pattern.test(lowerText)) ||
        houseKeywords.some((keyword) => lowerText.includes(keyword)));

    // Verificar si menciona modificaciones a características de casas
    const isModificationQuery =
      (lowerText.includes("mejor") ||
        lowerText.includes("prefiero") ||
        lowerText.includes("cambio") ||
        lowerText.includes("solo") ||
        lowerText.includes("únicamente") ||
        lowerText.includes("nada más") ||
        lowerText.includes("en vez de") ||
        lowerText.includes("en lugar de")) &&
      (houseKeywords.some((keyword) => lowerText.includes(keyword)) ||
        searchPatterns.some((pattern) => pattern.test(lowerText)));

    return isDirectHouseSearch || isFollowUpQuery || isModificationQuery;
  }

  extractCriteriaFromFollowUp(
    text: string,
    previousCriteria: SearchCriteria | null = this.lastSearchCriteria
  ): SearchCriteria {
    const lowerText = text.toLowerCase();
    
    // Si no hay criterios previos, extraer todos los criterios del texto
    if (!previousCriteria) {
      return extractCriteriaFromText(text);
    }

    // Empezar siempre con los criterios previos como base
    const merged = { ...previousCriteria };
    
    // Extraer los nuevos criterios del texto actual
    const newCriteria = extractCriteriaFromText(text);


    // Verificar si es una búsqueda completamente nueva
    const isCompletelyNewSearch = 
      lowerText.includes('nueva búsqueda') ||
      lowerText.includes('empezar de nuevo') ||
      lowerText.includes('buscar otra cosa') ||
      lowerText.includes('cambiar todo') ||
      lowerText.includes('olvidate de lo anterior');

    if (isCompletelyNewSearch) {
      // Solo devolver los nuevos criterios, ignorar los anteriores
      return newCriteria;
    }

    // Para cualquier otra situación, mantener los criterios anteriores y actualizar solo lo nuevo
    (Object.keys(newCriteria) as (keyof SearchCriteria)[]).forEach((key) => {
      const newValue = newCriteria[key];
      if (newValue !== undefined && newValue !== null) {
        // Solo actualizar si el nuevo valor es diferente o si no existía antes
        if (merged[key] !== newValue) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (merged as any)[key] = newValue;
        }
      }
    });

    return merged;
  }

  shouldClearPreviousCriteria(text: string): boolean {
    const lowerText = text.toLowerCase();
    const clearPhrases = [
      "nueva búsqueda",
      "empezar de nuevo",
      "buscar otra cosa",
      "cambiar todo",
      "olvidate de lo anterior",
      "nueva consulta",
      "empezar desde cero",
    ];

    return clearPhrases.some((phrase) => lowerText.includes(phrase));
  }

  formatCurrentCriteria(criteria: SearchCriteria): string {
    const parts: string[] = [];

    if (criteria.piezas) parts.push(`${criteria.piezas} habitaciones`);
    if (criteria.banos) parts.push(`${criteria.banos} baños`);
    if (criteria.pisos) parts.push(`${criteria.pisos} pisos`);
    if (criteria.area) parts.push(`${criteria.area} m²`);
    if (criteria.garage !== undefined)
      parts.push(criteria.garage ? "con garage" : "sin garage");
    if (criteria.internet !== undefined)
      parts.push(criteria.internet ? "con internet" : "sin internet");
    if (criteria.amoblada !== undefined)
      parts.push(criteria.amoblada ? "amoblada" : "sin amoblar");
    if (criteria.balcon !== undefined)
      parts.push(criteria.balcon ? "con balcón" : "sin balcón");
    if (criteria.asensor !== undefined)
      parts.push(criteria.asensor ? "con ascensor" : "sin ascensor");
    if (criteria.television !== undefined)
      parts.push(criteria.television ? "con TV" : "sin TV");
    if (criteria.precioMin || criteria.precioMax) {
      if (criteria.precioMin && criteria.precioMax) {
        parts.push(
          `precio entre $${criteria.precioMin.toLocaleString()} y $${criteria.precioMax.toLocaleString()}`
        );
      } else if (criteria.precioMin) {
        parts.push(`precio desde $${criteria.precioMin.toLocaleString()}`);
      } else if (criteria.precioMax) {
        parts.push(`precio hasta $${criteria.precioMax.toLocaleString()}`);
      }
    }
    if (criteria.nearHospital) parts.push("cerca de hospital");
    if (criteria.nearSchool) parts.push("cerca de escuela");
    if (criteria.nearPark) parts.push("cerca de parque");
    if (criteria.nearUniversity) parts.push("cerca de universidad");

    return parts.join(", ");
  }

  updateLastCriteria(criteria: SearchCriteria) {
    this.lastSearchCriteria = criteria;
  }

  clearSearchHistory() {
    this.lastSearchCriteria = null;
  }

  getLastCriteria(): SearchCriteria | null {
    return this.lastSearchCriteria;
  }
}