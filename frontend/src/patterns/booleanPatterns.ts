export class BooleanPatternExtractor {
  public static readonly patterns = {
    garage: {
      positive: [
        /(?:^|\s)(?:con\s+garage|garage|que\s+tenga\s+garage)(?:\s|$)/i,
        /(?:en vez de|en lugar de|ahora|dame|prefiero|mejor|quiero)\s*(?:con\s*garage|garage|que\s*tenga\s*garage)/i
      ],
      negative: [
        /(?:^|\s)(?:sin\s+garage|no\s+garage|que\s+no\s+tenga\s+garage)(?:\s|$)/i,
        /(?:en vez de|en lugar de|ahora|dame|prefiero|mejor|quiero)\s*(?:sin\s*garage|no\s*garage|que\s*no\s*tenga\s*garage)/i
      ]
    },
    internet: {
      positive: [
        /(?:^|\s)(?:con\s+internet|internet|que\s+tenga\s+internet)(?:\s|$)/i,
        /(?:en vez de|en lugar de|ahora|dame|prefiero|mejor|quiero)\s*(?:con\s*internet|internet)/i
      ],
      negative: [
        /(?:^|\s)(?:sin\s+internet|no\s+internet|que\s+no\s+tenga\s+internet)(?:\s|$)/i,
        /(?:en vez de|en lugar de|ahora|dame|prefiero|mejor|quiero)\s*(?:sin\s*internet|no\s*internet)/i
      ]
    },
    amoblada: {
      positive: [
        /(?:^|\s)(?:amoblada|amueblada|con\s+muebles|que\s+esté\s+amoblada)(?:\s|$)/i,
        /(?:en vez de|en lugar de|ahora|dame|prefiero|mejor|quiero)\s*(?:amoblada|amueblada|con\s*muebles)/i
      ],
      negative: [
        /(?:^|\s)(?:sin\s+amoblar|sin\s+amueblar|sin\s+muebles|no\s+amoblada|no\s+amueblada|que\s+no\s+esté\s+amoblada)(?:\s|$)/i,
        /(?:en vez de|en lugar de|ahora|dame|prefiero|mejor|quiero)\s*(?:sin\s*amoblar|sin\s*amueblar|sin\s*muebles|no\s*amoblada|no\s*amueblada)/i
      ]
    },
    balcon: {
      positive: [
        /(?:^|\s)(?:con\s+balcón|con\s+balcon|balcón|balcon|que\s+tenga\s+balcón)(?:\s|$)/i,
        /(?:en vez de|en lugar de|ahora|dame|prefiero|mejor|quiero)\s*(?:con\s*balcón|con\s*balcon|balcón|balcon)/i
      ],
      negative: [
        /(?:^|\s)(?:sin\s+balcón|sin\s+balcon|no\s+balcón|no\s+balcon|que\s+no\s+tenga\s+balcón)(?:\s|$)/i,
        /(?:en vez de|en lugar de|ahora|dame|prefiero|mejor|quiero)\s*(?:sin\s*balcón|sin\s*balcon|no\s*balcón|no\s*balcon)/i
      ]
    },
    asensor: {
      positive: [
        /(?:^|\s)(?:con\s+ascensor|ascensor|que\s+tenga\s+ascensor)(?:\s|$)/i,
        /(?:en vez de|en lugar de|ahora|dame|prefiero|mejor|quiero)\s*(?:con\s*ascensor|ascensor)/i
      ],
      negative: [
        /(?:^|\s)(?:sin\s+ascensor|no\s+ascensor|que\s+no\s+tenga\s+ascensor)(?:\s|$)/i,
        /(?:en vez de|en lugar de|ahora|dame|prefiero|mejor|quiero)\s*(?:sin\s*ascensor|no\s*ascensor)/i
      ]
    },
    television: {
      positive: [
        /(?:^|\s)(?:con\s+televisión|con\s+television|con\s+tv|televisión|television|tv|que\s+tenga\s+tv)(?:\s|$)/i,
        /(?:en vez de|en lugar de|ahora|dame|prefiero|mejor|quiero)\s*(?:con\s*televisión|con\s*television|con\s*tv|televisión|television|tv)/i
      ],
      negative: [
        /(?:^|\s)(?:sin\s+televisión|sin\s+television|sin\s+tv|no\s+televisión|no\s+television|no\s+tv|que\s+no\s+tenga\s+tv)(?:\s|$)/i,
        /(?:en vez de|en lugar de|ahora|dame|prefiero|mejor|quiero)\s*(?:sin\s*televisión|sin\s*television|sin\s*tv|no\s*televisión|no\s*television|no\s*tv)/i
      ]
    }
  };

  static extract(text: string, property: keyof typeof BooleanPatternExtractor.patterns): boolean | null {
    const lowerText = text.toLowerCase();
    const patternSet = this.patterns[property];

    if (!patternSet) return null;

    // Verificar patrones negativos primero (más específicos)
    for (const pattern of patternSet.negative) {
      if (pattern.test(lowerText)) {
        return false;
      }
    }

    // Verificar patrones positivos
    for (const pattern of patternSet.positive) {
      if (pattern.test(lowerText)) {
        return true;
      }
    }

    return null;
  }
}
