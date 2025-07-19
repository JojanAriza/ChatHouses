import { TextToNumberConverter } from "../utils/textToNumber";

export class BathroomPatternExtractor {
  private static readonly specificPatterns = [
    // "en vez de X baños dame Y"
    /(?:en vez de|en lugar de)\s*(\d+|un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s*(baños?)\s*(?:dame|quiero|prefiero|mejor|que sean?)\s*(\d+|un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)/i,
    
    // "en vez de X dame Y baños"
    /(?:en vez de|en lugar de)\s*(\d+|un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s*(?:dame|quiero|prefiero|mejor)\s*(\d+|un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s*(baños?)/i,
    
    // Patrones directos con modificadores
    /(?:dame|ahora|prefiero|mejor|quiero)\s*(\d+|un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s*(baños?)/i,
    
    // Cambiar a X baños
    /(?:cambiar?(?:\s+a)?)\s*(\d+|un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s*(baños?)/i,
  ];

  private static readonly originalPatterns = [
    /(?:^|\s)(un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|\d+)\s*(baños?|baño)/,
    /(solo|únicamente|nada más que|solamente)\s*(un|uno|una|dos|tres|cuatro|cinco|\d+)\s*(baño|baños?)/,
    /mejor.*?(que\s+tenga|con)\s*(un|uno|una|dos|tres|cuatro|cinco|\d+)\s*(baños?|baño)/
  ];

  static extract(text: string): number | null {
    const lowerText = text.toLowerCase();

    // Intentar con patrones específicos primero
    for (const pattern of this.specificPatterns) {
      const match = lowerText.match(pattern);
      if (match) {
        
        if (match[3]) {
          return TextToNumberConverter.convert(match[3]);
        } else if (match[2] && match[2].includes('baño')) {
          return TextToNumberConverter.convert(match[1]);
        }
      }
    }

    // Si no se encuentra con patrones específicos, usar originales
    for (const pattern of this.originalPatterns) {
      const match = lowerText.match(pattern);
      if (match) {
        const numIndex = match[1] === 'mejor' ? 2 : 1;
        return TextToNumberConverter.convert(match[numIndex]);
      }
    }

    return null;
  }
}