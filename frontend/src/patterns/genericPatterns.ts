import type { SearchCriteria } from "../types";
import { TextToNumberConverter } from "../utils/textToNumber";

export class GenericPatternExtractor {
  static extractWithContext(text: string, currentCriteria: SearchCriteria): Partial<SearchCriteria> {
    const lowerText = text.toLowerCase();
    const result: Partial<SearchCriteria> = {};

    // Solo procesar si no se encontró nada específico
    if (!currentCriteria.piezas && !currentCriteria.banos) {
      const genericPattern = /(?:en vez de|en lugar de)\s*(\d+|un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)(?:\s*(\w+))?\s*(?:dame|quiero|prefiero|mejor|que sean?)\s*(\d+|un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)/i;
      
      const match = lowerText.match(genericPattern);
      if (match) {
        const newNumber = TextToNumberConverter.convert(match[3]);
        
        if (newNumber !== null) {
          const context = this.getContext(lowerText, match);
          const contextType = this.determineContextType(context);
          
          if (contextType === 'rooms') {
            result.piezas = newNumber;
          } else if (contextType === 'bathrooms') {
            result.banos = newNumber;
          }
        }
      }
    }

    return result;
  }

  private static getContext(text: string, match: RegExpMatchArray): string {
    const matchStart = match.index || 0;
    const contextBefore = text.substring(Math.max(0, matchStart - 50), matchStart);
    const contextAfter = text.substring(matchStart + match[0].length, matchStart + match[0].length + 50);
    return contextBefore + ' ' + contextAfter;
  }

  private static determineContextType(context: string): 'rooms' | 'bathrooms' | 'unknown' {
    if (/habitacion|pieza|cuarto|dormitorio/.test(context)) {
      return 'rooms';
    } else if (/baño/.test(context)) {
      return 'bathrooms';
    }
    return 'unknown';
  }
}