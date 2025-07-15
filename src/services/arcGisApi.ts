import axios from "axios";

const baseUrl = "https://services7.arcgis.com/BHeMmpbh6URXbisP/arcgis/rest/services/Casas_prueba_johan/FeatureServer/0/query";

export interface Casa {
  OBJECTID: number;
  Name: string;
  Banos: number;
  Piezas: number;
  Garage: number;
  Internet: number;
  Amoblada: number;
  Balcon: number;
  Hospital_Car: number;
  Hospital_foot: number;
  Escuelas_Car: number;
  Escuelas_foot: number;
  Field: number;
  geometry?: {
    x: number;
    y: number;
  };
}

export interface SearchCriteria {
  banos?: number;
  piezas?: number;
  garage?: boolean;
  internet?: boolean;
  amoblada?: boolean;
  balcon?: boolean;
  hospitalCar?: number;
  hospitalFoot?: number;
  escuelasCar?: number;
  escuelasFoot?: number;
  nearHospital?: boolean;
  nearSchool?: boolean;
}

export interface CasaMatch {
  casa: Casa;
  score: number;
  matches: string[];
  partialMatches: string[];
}

export interface ArcGISFeature {
  attributes: Casa;
  geometry: {
    x: number;
    y: number;
  };
}

export const getCasas = async (): Promise<Casa[]> => {
  const params = {
    where: "1=1",
    outFields: "*",
    f: "json",
    returnGeometry: true
  };

  const response = await axios(baseUrl, { params });
  return response.data.features.map((feature: ArcGISFeature) => ({
    ...feature.attributes,
    geometry: feature.geometry
  }));
};

export const searchCasas = async (criteria: SearchCriteria): Promise<CasaMatch[]> => {
  const casas = await getCasas();
  
  // Función para calcular el puntaje de coincidencia
  const calculateScore = (casa: Casa): { score: number; matches: string[]; partialMatches: string[] } => {
    let score = 0;
    const matches: string[] = [];
    const partialMatches: string[] = [];
    
    // Coincidencias exactas (peso 10)
    if (criteria.banos !== undefined) {
      if (casa.Banos === criteria.banos) {
        score += 10;
        matches.push(`${criteria.banos} baños`);
      } else if (Math.abs(casa.Banos - criteria.banos) === 1) {
        score += 5;
        partialMatches.push(`${casa.Banos} baños (cercano a ${criteria.banos})`);
      }
    }
    
    if (criteria.piezas !== undefined) {
      if (casa.Piezas === criteria.piezas) {
        score += 10;
        matches.push(`${criteria.piezas} habitaciones`);
      } else if (Math.abs(casa.Piezas - criteria.piezas) === 1) {
        score += 5;
        partialMatches.push(`${casa.Piezas} habitaciones (cercano a ${criteria.piezas})`);
      }
    }
    
    // Características booleanas (peso 8)
    if (criteria.garage !== undefined) {
      if ((casa.Garage === 1) === criteria.garage) {
        score += 8;
        matches.push(criteria.garage ? 'con garage' : 'sin garage');
      }
    }
    
    if (criteria.internet !== undefined) {
      if ((casa.Internet === 1) === criteria.internet) {
        score += 8;
        matches.push(criteria.internet ? 'con internet' : 'sin internet');
      }
    }
    
    if (criteria.amoblada !== undefined) {
      if ((casa.Amoblada === 1) === criteria.amoblada) {
        score += 8;
        matches.push(criteria.amoblada ? 'amoblada' : 'sin amoblar');
      }
    }
    
    if (criteria.balcon !== undefined) {
      if ((casa.Balcon === 1) === criteria.balcon) {
        score += 8;
        matches.push(criteria.balcon ? 'con balcón' : 'sin balcón');
      }
    }
    
    // Proximidad a servicios específicos (peso 6)
    if (criteria.hospitalCar !== undefined) {
      if (casa.Hospital_Car <= criteria.hospitalCar) {
        score += 6;
        matches.push(`hospital a ${casa.Hospital_Car} min en carro`);
      } else if (casa.Hospital_Car <= criteria.hospitalCar + 5) {
        score += 3;
        partialMatches.push(`hospital a ${casa.Hospital_Car} min en carro`);
      }
    }
    
    if (criteria.hospitalFoot !== undefined) {
      if (casa.Hospital_foot <= criteria.hospitalFoot) {
        score += 6;
        matches.push(`hospital a ${casa.Hospital_foot} min caminando`);
      } else if (casa.Hospital_foot <= criteria.hospitalFoot + 10) {
        score += 3;
        partialMatches.push(`hospital a ${casa.Hospital_foot} min caminando`);
      }
    }
    
    // NUEVA FUNCIONALIDAD: Búsqueda general cerca de hospital
    if (criteria.nearHospital) {
      // Consideramos "cerca" si está a menos de 15 minutos en carro
      if (casa.Hospital_Car <= 15) {
        score += 8;
        matches.push(`cerca del hospital (${casa.Hospital_Car} min en carro)`);
      } else if (casa.Hospital_Car <= 25) {
        score += 4;
        partialMatches.push(`relativamente cerca del hospital (${casa.Hospital_Car} min en carro)`);
      }
    }
    
    if (criteria.escuelasCar !== undefined) {
      if (casa.Escuelas_Car <= criteria.escuelasCar) {
        score += 6;
        matches.push(`escuela a ${casa.Escuelas_Car} min en carro`);
      } else if (casa.Escuelas_Car <= criteria.escuelasCar + 5) {
        score += 3;
        partialMatches.push(`escuela a ${casa.Escuelas_Car} min en carro`);
      }
    }
    
    if (criteria.escuelasFoot !== undefined) {
      if (casa.Escuelas_foot <= criteria.escuelasFoot) {
        score += 6;
        matches.push(`escuela a ${casa.Escuelas_foot} min caminando`);
      } else if (casa.Escuelas_foot <= criteria.escuelasFoot + 10) {
        score += 3;
        partialMatches.push(`escuela a ${casa.Escuelas_foot} min caminando`);
      }
    }
    
    // NUEVA FUNCIONALIDAD: Búsqueda general cerca de escuela
    if (criteria.nearSchool) {
      // Consideramos "cerca" si está a menos de 15 minutos en carro
      if (casa.Escuelas_Car <= 15) {
        score += 8;
        matches.push(`cerca de escuela (${casa.Escuelas_Car} min en carro)`);
      } else if (casa.Escuelas_Car <= 25) {
        score += 4;
        partialMatches.push(`relativamente cerca de escuela (${casa.Escuelas_Car} min en carro)`);
      }
    }
    
    return { score, matches, partialMatches };
  };
  
  // Calcular puntajes y crear matches
  const casasWithScore: CasaMatch[] = casas.map(casa => {
    const { score, matches, partialMatches } = calculateScore(casa);
    return {
      casa,
      score,
      matches,
      partialMatches
    };
  });
  
  // Ordenar por puntaje descendente y limitar a 10 resultados
  return casasWithScore
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
};

// Función MEJORADA para extraer criterios de texto natural
export const extractCriteriaFromText = (text: string): SearchCriteria => {
  const criteria: SearchCriteria = {};
  const lowerText = text.toLowerCase();
  
  // Extraer números seguidos de palabras clave
  const banosMatch = lowerText.match(/(\d+)\s*(baños?|baño)/);
  if (banosMatch) {
    criteria.banos = parseInt(banosMatch[1]);
  }
  
  const piezasMatch = lowerText.match(/(\d+)\s*(habitaciones?|habitación|piezas?|pieza|dormitorios?|dormitorio|cuartos?|cuarto)/);
  if (piezasMatch) {
    criteria.piezas = parseInt(piezasMatch[1]);
  }
  
  // Características booleanas
  if (lowerText.includes('con garage') || lowerText.includes('garage')) {
    criteria.garage = true;
  }
  if (lowerText.includes('sin garage')) {
    criteria.garage = false;
  }
  
  if (lowerText.includes('con internet') || lowerText.includes('internet')) {
    criteria.internet = true;
  }
  if (lowerText.includes('sin internet')) {
    criteria.internet = false;
  }
  
  if (lowerText.includes('amoblada') || lowerText.includes('amueblada')) {
    criteria.amoblada = true;
  }
  if (lowerText.includes('sin amoblar') || lowerText.includes('sin amueblar')) {
    criteria.amoblada = false;
  }
  
  if (lowerText.includes('con balcón') || lowerText.includes('balcón')) {
    criteria.balcon = true;
  }
  if (lowerText.includes('sin balcón')) {
    criteria.balcon = false;
  }
  
  // Proximidad a servicios específicos
  const hospitalCarMatch = lowerText.match(/hospital.*?(\d+).*?minutos?.*?carro/);
  if (hospitalCarMatch) {
    criteria.hospitalCar = parseInt(hospitalCarMatch[1]);
  }
  
  const hospitalFootMatch = lowerText.match(/hospital.*?(\d+).*?minutos?.*?(caminando|pie)/);
  if (hospitalFootMatch) {
    criteria.hospitalFoot = parseInt(hospitalFootMatch[1]);
  }
  
  // NUEVA FUNCIONALIDAD: Detectar búsquedas generales de proximidad
  if (lowerText.includes('cerca') && lowerText.includes('hospital')) {
    criteria.nearHospital = true;
  }
  
  if (lowerText.includes('cerca') && (lowerText.includes('escuela') || lowerText.includes('colegio'))) {
    criteria.nearSchool = true;
  }
  
  // También detectar patrones como "al hospital", "del hospital"
  if ((lowerText.includes('al hospital') || lowerText.includes('del hospital') || lowerText.includes('un hospital')) && !hospitalCarMatch && !hospitalFootMatch) {
    criteria.nearHospital = true;
  }
  
  const escuelaCarMatch = lowerText.match(/escuela.*?(\d+).*?minutos?.*?carro/);
  if (escuelaCarMatch) {
    criteria.escuelasCar = parseInt(escuelaCarMatch[1]);
  }
  
  const escuelaFootMatch = lowerText.match(/escuela.*?(\d+).*?minutos?.*?(caminando|pie)/);
  if (escuelaFootMatch) {
    criteria.escuelasFoot = parseInt(escuelaFootMatch[1]);
  }
  
  return criteria;
};

// Función para formatear resultados para mostrar al usuario
export const formatCasasResults = (matches: CasaMatch[]): string => {
  if (matches.length === 0) {
    return "No se encontraron casas que coincidan con los criterios especificados.";
  }
  
  let result = `Encontré ${matches.length} casa${matches.length > 1 ? 's' : ''} que coinciden con tus criterios:\n\n`;
  
  matches.forEach((match, index) => {
    const casa = match.casa;
    result += `${index + 1}. **${casa.Name || `Casa ${casa.OBJECTID}`}**\n`;
    result += `   • ${casa.Piezas} habitaciones, ${casa.Banos} baños\n`;
    result += `   • ${casa.Garage ? 'Con' : 'Sin'} garage\n`;
    result += `   • ${casa.Internet ? 'Con' : 'Sin'} internet\n`;
    result += `   • ${casa.Amoblada ? 'Amoblada' : 'Sin amoblar'}\n`;
    result += `   • ${casa.Balcon ? 'Con' : 'Sin'} balcón\n`;
    result += `   • Hospital: ${casa.Hospital_Car} min en carro, ${casa.Hospital_foot} min caminando\n`;
    result += `   • Escuela: ${casa.Escuelas_Car} min en carro, ${casa.Escuelas_foot} min caminando\n`;
    
    if (match.matches.length > 0) {
      result += `   ✅ **Coincidencias exactas:** ${match.matches.join(', ')}\n`;
    }
    
    if (match.partialMatches.length > 0) {
      result += `   ⚠️ **Coincidencias parciales:** ${match.partialMatches.join(', ')}\n`;
    }
    
    result += `   📊 **Puntaje de coincidencia:** ${match.score}\n\n`;
  });
  
  return result;
};