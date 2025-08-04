import type { SearchCriteria } from "../types";

export class ProximityPatternExtractor {
  private static readonly patterns = {
    hospital: [
      /cerca\s+(del?\s+)?hospital/i,
      /próximo\s+al?\s+hospital/i,
      /cerca\s+a\s+un\s+hospital/i,
      /cerca\s+de\s+un\s+hospital/i,
      /al?\s+lado\s+(del?\s+)?hospital/i,
      /hospital\s+cercano/i,
      /hospital/i
    ],
    school: [
      /cerca\s+(del?\s+)?(escuela|colegio)/i,
      /próximo\s+al?\s+(escuela|colegio)/i,
      /cerca\s+a\s+un(a)?\s+(escuela|colegio)/i,
      /cerca\s+de\s+un(a)?\s+(escuela|colegio)/i,
      /al?\s+lado\s+(del?\s+)?(escuela|colegio)/i,
      /(escuela|colegio)\s+cercano/i
    ],
    park: [
      /cerca\s+(del?\s+)?parque/i,
      /próximo\s+al?\s+parque/i,
      /cerca\s+a\s+un\s+parque/i,
      /cerca\s+de\s+un\s+parque/i,
      /al?\s+lado\s+(del?\s+)?parque/i,
      /parque\s+cercano/i
    ],
    university: [
      /cerca\s+(de\s+la?\s+)?universidad/i,
      /próximo\s+a\s+la?\s+universidad/i,
      /cerca\s+a\s+un(a)?\s+universidad/i,
      /al?\s+lado\s+(de\s+la?\s+)?universidad/i,
      /universidad\s+cercana/i
    ]
  };

  static extractProximities(text: string): Partial<SearchCriteria> {
    const proximities: Partial<SearchCriteria> = {};
    const lowerText = text.toLowerCase();

    // Hospital
    if (this.patterns.hospital.some(pattern => pattern.test(lowerText))) {
      proximities.nearHospital = true;
    }

    // Escuela/Colegio
    if (this.patterns.school.some(pattern => pattern.test(lowerText))) {
      proximities.nearSchool = true;
    }

    // Parque
    if (this.patterns.park.some(pattern => pattern.test(lowerText))) {
      proximities.nearPark = true;
    }

    // Universidad
    if (this.patterns.university.some(pattern => pattern.test(lowerText))) {
      proximities.nearUniversity = true;
    }

    return proximities;
  }
}