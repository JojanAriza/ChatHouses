export class TextToNumberConverter {
  private static readonly wordToNumber: Record<string, number> = {
    un: 1, uno: 1, una: 1,
    dos: 2, tres: 3, cuatro: 4, cinco: 5,
    seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
    once: 11, doce: 12, trece: 13, catorce: 14, quince: 15,
    dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20,
  };

  static convert(text: string): number | null {
    const num = parseInt(text);
    if (!isNaN(num)) return num;
    return this.wordToNumber[text.toLowerCase()] || null;
  }
}