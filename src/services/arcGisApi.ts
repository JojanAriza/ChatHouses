import axios from "axios";
import type { Casa, ArcGISFeature, SearchCriteria, CasaMatch } from "../types";

const baseUrl = "https://services7.arcgis.com/BHeMmpbh6URXbisP/arcgis/rest/services/Casas_final/FeatureServer/0/query";


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
    
    // Coincidencias exactas para números (peso 10)
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

    if (criteria.pisos !== undefined) {
      if (casa.Pisos === criteria.pisos) {
        score += 8;
        matches.push(`${criteria.pisos} pisos`);
      } else if (Math.abs(casa.Pisos - criteria.pisos) === 1) {
        score += 4;
        partialMatches.push(`${casa.Pisos} pisos (cercano a ${criteria.pisos})`);
      }
    }

    if (criteria.area !== undefined) {
      if (Math.abs(casa.Area_m2 - criteria.area) <= 10) {
        score += 8;
        matches.push(`${casa.Area_m2} m² (área solicitada: ${criteria.area} m²)`);
      } else if (Math.abs(casa.Area_m2 - criteria.area) <= 30) {
        score += 4;
        partialMatches.push(`${casa.Area_m2} m² (área solicitada: ${criteria.area} m²)`);
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

    if (criteria.asensor !== undefined) {
      if ((casa.Asensor === 1) === criteria.asensor) {
        score += 7;
        matches.push(criteria.asensor ? 'con ascensor' : 'sin ascensor');
      }
    }

    if (criteria.television !== undefined) {
      if ((casa.Television === 1) === criteria.television) {
        score += 6;
        matches.push(criteria.television ? 'con televisión' : 'sin televisión');
      }
    }
    
    // Rango de precios (peso 9)
    if (criteria.precioMin !== undefined || criteria.precioMax !== undefined) {
      const precio = casa.Precio;
      if (precio) {
        let priceMatch = true;
        if (criteria.precioMin !== undefined && precio < criteria.precioMin) {
          priceMatch = false;
        }
        if (criteria.precioMax !== undefined && precio > criteria.precioMax) {
          priceMatch = false;
        }
        
        if (priceMatch) {
          score += 9;
          matches.push(`precio: $${precio.toLocaleString()}`);
        } else {
          // Precio cercano al rango
          const minDiff = criteria.precioMin ? Math.abs(precio - criteria.precioMin) : 0;
          const maxDiff = criteria.precioMax ? Math.abs(precio - criteria.precioMax) : 0;
          const tolerance = 100000; // 100k de tolerancia
          
          if (minDiff <= tolerance || maxDiff <= tolerance) {
            score += 4;
            partialMatches.push(`precio: $${precio.toLocaleString()} (fuera del rango solicitado)`);
          }
        }
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

    // NUEVOS CAMPOS: Parques
    if (criteria.parquesCar !== undefined) {
      if (casa.Parques_Car <= criteria.parquesCar) {
        score += 6;
        matches.push(`parque a ${casa.Parques_Car} min en carro`);
      } else if (casa.Parques_Car <= criteria.parquesCar + 5) {
        score += 3;
        partialMatches.push(`parque a ${casa.Parques_Car} min en carro`);
      }
    }
    
    if (criteria.parquesFoot !== undefined) {
      if (casa.Parques_foot <= criteria.parquesFoot) {
        score += 6;
        matches.push(`parque a ${casa.Parques_foot} min caminando`);
      } else if (casa.Parques_foot <= criteria.parquesFoot + 10) {
        score += 3;
        partialMatches.push(`parque a ${casa.Parques_foot} min caminando`);
      }
    }

    // NUEVOS CAMPOS: Universidades
    if (criteria.universidadesCar !== undefined) {
      if (casa.Universidades_Car <= criteria.universidadesCar) {
        score += 6;
        matches.push(`universidad a ${casa.Universidades_Car} min en carro`);
      } else if (casa.Universidades_Car <= criteria.universidadesCar + 5) {
        score += 3;
        partialMatches.push(`universidad a ${casa.Universidades_Car} min en carro`);
      }
    }
    
    if (criteria.universidadesFoot !== undefined) {
      if (casa.Universidades_foot <= criteria.universidadesFoot) {
        score += 6;
        matches.push(`universidad a ${casa.Universidades_foot} min caminando`);
      } else if (casa.Universidades_foot <= criteria.universidadesFoot + 10) {
        score += 3;
        partialMatches.push(`universidad a ${casa.Universidades_foot} min caminando`);
      }
    }
    
    // Búsquedas generales de proximidad (peso 8)
    if (criteria.nearHospital) {
      if (casa.Hospital_Car <= 15) {
        score += 8;
        matches.push(`cerca del hospital (${casa.Hospital_Car} min en carro)`);
      } else if (casa.Hospital_Car <= 25) {
        score += 4;
        partialMatches.push(`relativamente cerca del hospital (${casa.Hospital_Car} min en carro)`);
      }
    }
    
    if (criteria.nearSchool) {
      if (casa.Escuelas_Car <= 15) {
        score += 8;
        matches.push(`cerca de escuela (${casa.Escuelas_Car} min en carro)`);
      } else if (casa.Escuelas_Car <= 25) {
        score += 4;
        partialMatches.push(`relativamente cerca de escuela (${casa.Escuelas_Car} min en carro)`);
      }
    }

    if (criteria.nearPark) {
      if (casa.Parques_Car <= 15) {
        score += 8;
        matches.push(`cerca de parque (${casa.Parques_Car} min en carro)`);
      } else if (casa.Parques_Car <= 25) {
        score += 4;
        partialMatches.push(`relativamente cerca de parque (${casa.Parques_Car} min en carro)`);
      }
    }

    if (criteria.nearUniversity) {
      if (casa.Universidades_Car <= 15) {
        score += 8;
        matches.push(`cerca de universidad (${casa.Universidades_Car} min en carro)`);
      } else if (casa.Universidades_Car <= 25) {
        score += 4;
        partialMatches.push(`relativamente cerca de universidad (${casa.Universidades_Car} min en carro)`);
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

  const pisosMatch = lowerText.match(/(\d+)\s*(pisos?|piso|niveles?|nivel)/);
  if (pisosMatch) {
    criteria.pisos = parseInt(pisosMatch[1]);
  }

  const areaMatch = lowerText.match(/(\d+)\s*(m2|metros cuadrados?|metro cuadrado|m²)/);
  if (areaMatch) {
    criteria.area = parseInt(areaMatch[1]);
  }

  // Rango de precios
  const precioRangeMatch = lowerText.match(/entre\s*\$?(\d+(?:\.\d{3})*(?:,\d{3})*)\s*y\s*\$?(\d+(?:\.\d{3})*(?:,\d{3})*)/);
  if (precioRangeMatch) {
    criteria.precioMin = parseInt(precioRangeMatch[1].replace(/[.,]/g, ''));
    criteria.precioMax = parseInt(precioRangeMatch[2].replace(/[.,]/g, ''));
  }

  const precioMaxMatch = lowerText.match(/(?:hasta|máximo|max|menor que|<)\s*\$?(\d+(?:\.\d{3})*(?:,\d{3})*)/);
  if (precioMaxMatch) {
    criteria.precioMax = parseInt(precioMaxMatch[1].replace(/[.,]/g, ''));
  }

  const precioMinMatch = lowerText.match(/(?:desde|mínimo|min|mayor que|>)\s*\$?(\d+(?:\.\d{3})*(?:,\d{3})*)/);
  if (precioMinMatch) {
    criteria.precioMin = parseInt(precioMinMatch[1].replace(/[.,]/g, ''));
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

  if (lowerText.includes('con ascensor') || lowerText.includes('ascensor')) {
    criteria.asensor = true;
  }
  if (lowerText.includes('sin ascensor')) {
    criteria.asensor = false;
  }

  if (lowerText.includes('con televisión') || lowerText.includes('con television') || lowerText.includes('televisión') || lowerText.includes('television')) {
    criteria.television = true;
  }
  if (lowerText.includes('sin televisión') || lowerText.includes('sin television')) {
    criteria.television = false;
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

  const escuelaCarMatch = lowerText.match(/escuela.*?(\d+).*?minutos?.*?carro/);
  if (escuelaCarMatch) {
    criteria.escuelasCar = parseInt(escuelaCarMatch[1]);
  }
  
  const escuelaFootMatch = lowerText.match(/escuela.*?(\d+).*?minutos?.*?(caminando|pie)/);
  if (escuelaFootMatch) {
    criteria.escuelasFoot = parseInt(escuelaFootMatch[1]);
  }

  // NUEVOS CAMPOS: Parques
  const parqueCarMatch = lowerText.match(/parque.*?(\d+).*?minutos?.*?carro/);
  if (parqueCarMatch) {
    criteria.parquesCar = parseInt(parqueCarMatch[1]);
  }
  
  const parqueFootMatch = lowerText.match(/parque.*?(\d+).*?minutos?.*?(caminando|pie)/);
  if (parqueFootMatch) {
    criteria.parquesFoot = parseInt(parqueFootMatch[1]);
  }

  // NUEVOS CAMPOS: Universidades
  const universidadCarMatch = lowerText.match(/universidad.*?(\d+).*?minutos?.*?carro/);
  if (universidadCarMatch) {
    criteria.universidadesCar = parseInt(universidadCarMatch[1]);
  }
  
  const universidadFootMatch = lowerText.match(/universidad.*?(\d+).*?minutos?.*?(caminando|pie)/);
  if (universidadFootMatch) {
    criteria.universidadesFoot = parseInt(universidadFootMatch[1]);
  }
  
  // Búsquedas generales de proximidad
  if (lowerText.includes('cerca') && lowerText.includes('hospital')) {
    criteria.nearHospital = true;
  }
  
  if (lowerText.includes('cerca') && (lowerText.includes('escuela') || lowerText.includes('colegio'))) {
    criteria.nearSchool = true;
  }

  if (lowerText.includes('cerca') && lowerText.includes('parque')) {
    criteria.nearPark = true;
  }

  if (lowerText.includes('cerca') && lowerText.includes('universidad')) {
    criteria.nearUniversity = true;
  }
  
  // También detectar patrones como "al hospital", "del hospital"
  if ((lowerText.includes('al hospital') || lowerText.includes('del hospital') || lowerText.includes('un hospital')) && !hospitalCarMatch && !hospitalFootMatch) {
    criteria.nearHospital = true;
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
    result += `   • ${casa.Piezas || 0} habitaciones, ${casa.Banos || 0} baños\n`;
    result += `   • ${casa.Pisos || 'N/A'} pisos, ${casa.Area_m2 || 'N/A'} m²\n`;
    result += `   • ${casa.Garage ? 'Con' : 'Sin'} garage\n`;
    result += `   • ${casa.Internet ? 'Con' : 'Sin'} internet\n`;
    result += `   • ${casa.Amoblada ? 'Amoblada' : 'Sin amoblar'}\n`;
    result += `   • ${casa.Balcon ? 'Con' : 'Sin'} balcón\n`;
    result += `   • ${casa.Asensor ? 'Con' : 'Sin'} ascensor\n`;
    result += `   • ${casa.Television ? 'Con' : 'Sin'} televisión\n`;
    
    if (casa.Precio) {
      result += `   • Precio: $${casa.Precio.toLocaleString()}\n`;
    }
    
    if (casa.Telefono) {
      result += `   • Teléfono: ${casa.Telefono}\n`;
    }
    
    result += `   • Hospital: ${casa.Hospital_Car || 'N/A'} min en carro, ${casa.Hospital_foot || 'N/A'} min caminando\n`;
    result += `   • Escuela: ${casa.Escuelas_Car || 'N/A'} min en carro, ${casa.Escuelas_foot || 'N/A'} min caminando\n`;
    result += `   • Parque: ${casa.Parques_Car || 'N/A'} min en carro, ${casa.Parques_foot || 'N/A'} min caminando\n`;
    result += `   • Universidad: ${casa.Universidades_Car || 'N/A'} min en carro, ${casa.Universidades_foot || 'N/A'} min caminando\n`;
    
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