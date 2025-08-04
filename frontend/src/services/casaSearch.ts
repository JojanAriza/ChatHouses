import type { SearchCriteria, CasaMatch, Casa } from "../types";
import { getCasas } from "./casaApi";

export const searchCasas = async (criteria: SearchCriteria): Promise<CasaMatch[]> => {
  const casas = await getCasas();
  
  // Función para calcular el puntaje de coincidencia
  const calculateScore = (casa: Casa): { score: number; matches: string[]; partialMatches: string[] } => {
    let score = 0;
    let maxPossibleScore = 0;
    const matches: string[] = [];
    const partialMatches: string[] = [];
    
    // Función helper para agregar puntos y el máximo posible
    const addScore = (points: number, maxPoints: number, condition: boolean, matchText: string, partialMatchText?: string) => {
      maxPossibleScore += maxPoints;
      if (condition) {
        score += points;
        if (points === maxPoints) {
          matches.push(matchText);
        } else if (partialMatchText) {
          partialMatches.push(partialMatchText);
        }
      }
    };
    
    // Coincidencias exactas para números (peso 15)
    if (criteria.banos !== undefined) {
      const difference = Math.abs(casa.Banos - criteria.banos);
      if (difference === 0) {
        addScore(15, 15, true, `${criteria.banos} baños`);
      } else if (difference === 1) {
        addScore(8, 15, true, '', `${casa.Banos} baños (cercano a ${criteria.banos})`);
      } else if (difference === 2) {
        addScore(4, 15, true, '', `${casa.Banos} baños (algo alejado de ${criteria.banos})`);
      } else {
        addScore(0, 15, false, '');
      }
    }
    
    if (criteria.piezas !== undefined) {
      const difference = Math.abs(casa.Piezas - criteria.piezas);
      if (difference === 0) {
        addScore(15, 15, true, `${criteria.piezas} habitaciones`);
      } else if (difference === 1) {
        addScore(8, 15, true, '', `${casa.Piezas} habitaciones (cercano a ${criteria.piezas})`);
      } else if (difference === 2) {
        addScore(4, 15, true, '', `${casa.Piezas} habitaciones (algo alejado de ${criteria.piezas})`);
      } else {
        addScore(0, 15, false, '');
      }
    }

    if (criteria.pisos !== undefined) {
      const difference = Math.abs(casa.Pisos - criteria.pisos);
      if (difference === 0) {
        addScore(12, 12, true, `${criteria.pisos} pisos`);
      } else if (difference === 1) {
        addScore(6, 12, true, '', `${casa.Pisos} pisos (cercano a ${criteria.pisos})`);
      } else {
        addScore(0, 12, false, '');
      }
    }

    if (criteria.area !== undefined) {
      const difference = Math.abs(casa.Area_m2 - criteria.area);
      if (difference <= 10) {
        addScore(12, 12, true, `${casa.Area_m2} m² (área solicitada: ${criteria.area} m²)`);
      } else if (difference <= 30) {
        addScore(8, 12, true, '', `${casa.Area_m2} m² (área solicitada: ${criteria.area} m²)`);
      } else if (difference <= 50) {
        addScore(4, 12, true, '', `${casa.Area_m2} m² (área solicitada: ${criteria.area} m²)`);
      } else {
        addScore(0, 12, false, '');
      }
    }
    
    // Características booleanas (peso 10)
    if (criteria.garage !== undefined) {
      const hasGarage = casa.Garage === 1;
      addScore(10, 10, hasGarage === criteria.garage, 
        criteria.garage ? 'con garage' : 'sin garage');
    }
    
    if (criteria.internet !== undefined) {
      const hasInternet = casa.Internet === 1;
      addScore(10, 10, hasInternet === criteria.internet, 
        criteria.internet ? 'con internet' : 'sin internet');
    }
    
    if (criteria.amoblada !== undefined) {
      const isAmoblada = casa.Amoblada === 1;
      addScore(10, 10, isAmoblada === criteria.amoblada, 
        criteria.amoblada ? 'amoblada' : 'sin amoblar');
    }
    
    if (criteria.balcon !== undefined) {
      const hasBalcon = casa.Balcon === 1;
      addScore(10, 10, hasBalcon === criteria.balcon, 
        criteria.balcon ? 'con balcón' : 'sin balcón');
    }

    if (criteria.asensor !== undefined) {
      const hasAsensor = casa.Asensor === 1;
      addScore(8, 8, hasAsensor === criteria.asensor, 
        criteria.asensor ? 'con ascensor' : 'sin ascensor');
    }

    if (criteria.television !== undefined) {
      const hasTelevision = casa.Television === 1;
      addScore(6, 6, hasTelevision === criteria.television, 
        criteria.television ? 'con televisión' : 'sin televisión');
    }
    
    // Rango de precios (peso 20 - muy importante)
    if (criteria.precioMin !== undefined || criteria.precioMax !== undefined) {
      const precio = casa.Precio;
      if (precio) {
        let priceMatch = true;
        let priceScore = 20;
        
        if (criteria.precioMin !== undefined && precio < criteria.precioMin) {
          const diff = criteria.precioMin - precio;
          const tolerance = criteria.precioMin * 0.1; // 10% de tolerancia
          if (diff <= tolerance) {
            priceScore = 12;
            priceMatch = true;
          } else {
            priceMatch = false;
          }
        }
        
        if (criteria.precioMax !== undefined && precio > criteria.precioMax) {
          const diff = precio - criteria.precioMax;
          const tolerance = criteria.precioMax * 0.1; // 10% de tolerancia
          if (diff <= tolerance) {
            priceScore = Math.min(priceScore, 12);
            priceMatch = true;
          } else {
            priceMatch = false;
          }
        }
        
        if (priceMatch) {
          addScore(priceScore, 20, true, 
            priceScore === 20 ? `precio: $${precio.toLocaleString()}` : '',
            priceScore < 20 ? `precio: $${precio.toLocaleString()} (cercano al rango)` : '');
        } else {
          addScore(0, 20, false, '');
        }
      } else {
        addScore(0, 20, false, '');
      }
    }
    
    // Proximidad a servicios específicos (peso 8)
    if (criteria.hospitalCar !== undefined) {
      if (casa.Hospital_Car <= criteria.hospitalCar) {
        addScore(8, 8, true, `hospital a ${casa.Hospital_Car} min en carro`);
      } else if (casa.Hospital_Car <= criteria.hospitalCar + 5) {
        addScore(5, 8, true, '', `hospital a ${casa.Hospital_Car} min en carro`);
      } else if (casa.Hospital_Car <= criteria.hospitalCar + 10) {
        addScore(2, 8, true, '', `hospital a ${casa.Hospital_Car} min en carro (algo lejos)`);
      } else {
        addScore(0, 8, false, '');
      }
    }
    
    if (criteria.hospitalFoot !== undefined) {
      if (casa.Hospital_foot <= criteria.hospitalFoot) {
        addScore(8, 8, true, `hospital a ${casa.Hospital_foot} min caminando`);
      } else if (casa.Hospital_foot <= criteria.hospitalFoot + 10) {
        addScore(5, 8, true, '', `hospital a ${casa.Hospital_foot} min caminando`);
      } else if (casa.Hospital_foot <= criteria.hospitalFoot + 20) {
        addScore(2, 8, true, '', `hospital a ${casa.Hospital_foot} min caminando (algo lejos)`);
      } else {
        addScore(0, 8, false, '');
      }
    }

    if (criteria.escuelasCar !== undefined) {
      if (casa.Escuelas_Car <= criteria.escuelasCar) {
        addScore(8, 8, true, `escuela a ${casa.Escuelas_Car} min en carro`);
      } else if (casa.Escuelas_Car <= criteria.escuelasCar + 5) {
        addScore(5, 8, true, '', `escuela a ${casa.Escuelas_Car} min en carro`);
      } else if (casa.Escuelas_Car <= criteria.escuelasCar + 10) {
        addScore(2, 8, true, '', `escuela a ${casa.Escuelas_Car} min en carro (algo lejos)`);
      } else {
        addScore(0, 8, false, '');
      }
    }
    
    if (criteria.escuelasFoot !== undefined) {
      if (casa.Escuelas_foot <= criteria.escuelasFoot) {
        addScore(8, 8, true, `escuela a ${casa.Escuelas_foot} min caminando`);
      } else if (casa.Escuelas_foot <= criteria.escuelasFoot + 10) {
        addScore(5, 8, true, '', `escuela a ${casa.Escuelas_foot} min caminando`);
      } else if (casa.Escuelas_foot <= criteria.escuelasFoot + 20) {
        addScore(2, 8, true, '', `escuela a ${casa.Escuelas_foot} min caminando (algo lejos)`);
      } else {
        addScore(0, 8, false, '');
      }
    }

    // Parques
    if (criteria.parquesCar !== undefined) {
      if (casa.Parques_Car <= criteria.parquesCar) {
        addScore(8, 8, true, `parque a ${casa.Parques_Car} min en carro`);
      } else if (casa.Parques_Car <= criteria.parquesCar + 5) {
        addScore(5, 8, true, '', `parque a ${casa.Parques_Car} min en carro`);
      } else if (casa.Parques_Car <= criteria.parquesCar + 10) {
        addScore(2, 8, true, '', `parque a ${casa.Parques_Car} min en carro (algo lejos)`);
      } else {
        addScore(0, 8, false, '');
      }
    }
    
    if (criteria.parquesFoot !== undefined) {
      if (casa.Parques_foot <= criteria.parquesFoot) {
        addScore(8, 8, true, `parque a ${casa.Parques_foot} min caminando`);
      } else if (casa.Parques_foot <= criteria.parquesFoot + 10) {
        addScore(5, 8, true, '', `parque a ${casa.Parques_foot} min caminando`);
      } else if (casa.Parques_foot <= criteria.parquesFoot + 20) {
        addScore(2, 8, true, '', `parque a ${casa.Parques_foot} min caminando (algo lejos)`);
      } else {
        addScore(0, 8, false, '');
      }
    }

    // Universidades
    if (criteria.universidadesCar !== undefined) {
      if (casa.Universidades_Car <= criteria.universidadesCar) {
        addScore(8, 8, true, `universidad a ${casa.Universidades_Car} min en carro`);
      } else if (casa.Universidades_Car <= criteria.universidadesCar + 5) {
        addScore(5, 8, true, '', `universidad a ${casa.Universidades_Car} min en carro`);
      } else if (casa.Universidades_Car <= criteria.universidadesCar + 10) {
        addScore(2, 8, true, '', `universidad a ${casa.Universidades_Car} min en carro (algo lejos)`);
      } else {
        addScore(0, 8, false, '');
      }
    }
    
    if (criteria.universidadesFoot !== undefined) {
      if (casa.Universidades_foot <= criteria.universidadesFoot) {
        addScore(8, 8, true, `universidad a ${casa.Universidades_foot} min caminando`);
      } else if (casa.Universidades_foot <= criteria.universidadesFoot + 10) {
        addScore(5, 8, true, '', `universidad a ${casa.Universidades_foot} min caminando`);
      } else if (casa.Universidades_foot <= criteria.universidadesFoot + 20) {
        addScore(2, 8, true, '', `universidad a ${casa.Universidades_foot} min caminando (algo lejos)`);
      } else {
        addScore(0, 8, false, '');
      }
    }
    
    // Búsquedas generales de proximidad (peso 12)
    if (criteria.nearHospital) {
      if (casa.Hospital_Car <= 10) {
        addScore(12, 12, true, `muy cerca del hospital (${casa.Hospital_Car} min en carro)`);
      } else if (casa.Hospital_Car <= 15) {
        addScore(8, 12, true, '', `cerca del hospital (${casa.Hospital_Car} min en carro)`);
      } else if (casa.Hospital_Car <= 25) {
        addScore(4, 12, true, '', `relativamente cerca del hospital (${casa.Hospital_Car} min en carro)`);
      } else {
        addScore(0, 12, false, '');
      }
    }
    
    if (criteria.nearSchool) {
      if (casa.Escuelas_Car <= 10) {
        addScore(12, 12, true, `muy cerca de escuela (${casa.Escuelas_Car} min en carro)`);
      } else if (casa.Escuelas_Car <= 15) {
        addScore(8, 12, true, '', `cerca de escuela (${casa.Escuelas_Car} min en carro)`);
      } else if (casa.Escuelas_Car <= 25) {
        addScore(4, 12, true, '', `relativamente cerca de escuela (${casa.Escuelas_Car} min en carro)`);
      } else {
        addScore(0, 12, false, '');
      }
    }

    if (criteria.nearPark) {
      if (casa.Parques_Car <= 10) {
        addScore(12, 12, true, `muy cerca de parque (${casa.Parques_Car} min en carro)`);
      } else if (casa.Parques_Car <= 15) {
        addScore(8, 12, true, '', `cerca de parque (${casa.Parques_Car} min en carro)`);
      } else if (casa.Parques_Car <= 25) {
        addScore(4, 12, true, '', `relativamente cerca de parque (${casa.Parques_Car} min en carro)`);
      } else {
        addScore(0, 12, false, '');
      }
    }

    if (criteria.nearUniversity) {
      if (casa.Universidades_Car <= 10) {
        addScore(12, 12, true, `muy cerca de universidad (${casa.Universidades_Car} min en carro)`);
      } else if (casa.Universidades_Car <= 15) {
        addScore(8, 12, true, '', `cerca de universidad (${casa.Universidades_Car} min en carro)`);
      } else if (casa.Universidades_Car <= 25) {
        addScore(4, 12, true, '', `relativamente cerca de universidad (${casa.Universidades_Car} min en carro)`);
      } else {
        addScore(0, 12, false, '');
      }
    }
    
    // Calcular el porcentaje final
    const finalScore = maxPossibleScore > 0 ? (score / maxPossibleScore) * 100 : 0;
    
    return { score: finalScore, matches, partialMatches };
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
  
  // Filtrar solo resultados con score >= 70% y ordenar por puntaje descendente
  return casasWithScore
    .filter(match => match.score >= 70)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
};