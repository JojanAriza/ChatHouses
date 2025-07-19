import { TextToNumberConverter } from "../utils/textToNumber";

export class NumericPatternExtractor {
  static extractFloors(text: string): number | null {
    const match = text.toLowerCase().match(
      /(?:^|\s)(un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|\d+)\s*(pisos?|piso|niveles?|nivel)/
    );
    
    if (match) {
      return TextToNumberConverter.convert(match[1]);
    }
    
    return null;
  }

  static extractArea(text: string): number | null {
    const match = text.toLowerCase().match(
      /(?:^|\s)(un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|\d+)\s*(m2|metros cuadrados?|metro cuadrado|m²)/
    );
    
    if (match) {
      return TextToNumberConverter.convert(match[1]);
    }
    
    return null;
  }

  static extractPriceRange(text: string): { min?: number; max?: number } {
    const lowerText = text.toLowerCase();
    const result: { min?: number; max?: number } = {};

    // Rango de precios
    const rangeMatch = lowerText.match(
      /entre\s*\$?(\d+(?:\.\d{3})*(?:,\d{3})*)\s*y\s*\$?(\d+(?:\.\d{3})*(?:,\d{3})*)/
    );
    if (rangeMatch) {
      result.min = parseInt(rangeMatch[1].replace(/[.,]/g, ""));
      result.max = parseInt(rangeMatch[2].replace(/[.,]/g, ""));
      return result;
    }

    // Precio máximo
    const maxMatch = lowerText.match(
      /(?:hasta|máximo|max|menor que|<)\s*\$?(\d+(?:\.\d{3})*(?:,\d{3})*)/
    );
    if (maxMatch) {
      result.max = parseInt(maxMatch[1].replace(/[.,]/g, ""));
    }

    // Precio mínimo
    const minMatch = lowerText.match(
      /(?:desde|mínimo|min|mayor que|>)\s*\$?(\d+(?:\.\d{3})*(?:,\d{3})*)/
    );
    if (minMatch) {
      result.min = parseInt(minMatch[1].replace(/[.,]/g, ""));
    }

    return result;
  }
}