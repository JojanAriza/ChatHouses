import { TextToNumberConverter } from "../utils/textToNumber";

export class RoomPatternExtractor {
  private static readonly specificPatterns = [
    // "en vez de X habitaciones/piezas/cuartos dame Y"
    /(?:en vez de|en lugar de)\s*(\d+|un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s*(habitaciones?|piezas?|cuartos?|dormitorios?)\s*(?:dame|quiero|prefiero|mejor|que sean?)\s*(\d+|un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)/i,
    
    // "en vez de X dame Y habitaciones/piezas"
    /(?:en vez de|en lugar de)\s*(\d+|un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s*(?:dame|quiero|prefiero|mejor)\s*(\d+|un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s*(habitaciones?|piezas?|cuartos?|dormitorios?)/i,
    
    // Patrones directos con modificadores
    /(?:dame|ahora|prefiero|mejor|quiero)\s*(\d+|un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s*(habitaciones?|piezas?|cuartos?|dormitorios?)/i,
    
    // Cambiar a X habitaciones
    /(?:cambiar?(?:\s+a)?)\s*(\d+|un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s*(habitaciones?|piezas?|cuartos?|dormitorios?)/i,
  ];

  private static readonly originalPatterns = [
    /(?:^|\s)(un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|\d+)\s*(habitaciones?|habitación|piezas?|pieza|dormitorios?|dormitorio|cuartos?|cuarto)/,
    /(solo|únicamente|nada más que|solamente)\s*(un|uno|una|dos|tres|cuatro|cinco|\d+)\s*(habitaciones?|habitación|piezas?|pieza|dormitorios?|dormitorio|cuartos?|cuarto)/,
    /mejor.*?(que\s+tenga|con)\s*(un|uno|una|dos|tres|cuatro|cinco|\d+)\s*(habitaciones?|habitación|piezas?|pieza|dormitorios?|dormitorio|cuartos?|cuarto)/
  ];

  static extract(text: string): number | null {
    const lowerText = text.toLowerCase();

    // Intentar con patrones específicos primero
    for (const pattern of this.specificPatterns) {
      const match = lowerText.match(pattern);
      if (match) {
        console.log('🏠 Match habitaciones específico:', match);
        
        if (match[3]) {
          return TextToNumberConverter.convert(match[3]);
        } else if (match[2] && this.isRoomType(match[2])) {
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

  private static isRoomType(text: string): boolean {
    return /habitacion|pieza|cuarto|dormitorio/.test(text);
  }
}