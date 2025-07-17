import React from 'react';
import { Home, Bed, Bath, Car, MapPin, Wifi, Building2, Star, ArrowUp, Monitor } from 'lucide-react';
import type { Casa, HouseCardProps } from '../types';


// Type for values that can be validated
type ValidatableValue = string | number | boolean | null | undefined;

const HouseCard: React.FC<HouseCardProps> = ({ match, onHouseClick }) => {
  const { casa, score } = match;

  // Función para formatear el nombre de la casa
  const getHouseName = (casa: Casa): string => {
    if (casa.Name && casa.Name.trim()) {
      return casa.Name;
    }
    return `Propiedad #${casa.OBJECTID}`;
  };

  // Función para normalizar el score a un rango de 0-1
  const normalizeScore = (score: number): number => {
    // Si el score ya está entre 0 y 1, devolverlo tal como está
    if (score >= 0 && score <= 1) {
      return score;
    }
    
    // Si el score es mayor a 1, normalizarlo
    // Asumimos que scores típicos pueden estar entre 0 y 10
    // pero ajustamos dinámicamente basado en el valor recibido
    const maxExpectedScore = Math.max(10, score);
    const normalizedScore = Math.min(score / maxExpectedScore, 1);
    
    return normalizedScore;
  };

  // Función para obtener el color del score
  const getScoreColor = (normalizedScore: number): string => {
    if (normalizedScore >= 0.8) return 'bg-green-500/20 text-green-300 border-green-500/20';
    if (normalizedScore >= 0.6) return 'bg-blue-500/20 text-blue-300 border-blue-500/20';
    if (normalizedScore >= 0.4) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/20';
    return 'bg-red-500/20 text-red-300 border-red-500/20';
  };

  // Función para obtener el texto descriptivo del score
  const getScoreText = (normalizedScore: number): string => {
    if (normalizedScore >= 0.8) return 'Excelente';
    if (normalizedScore >= 0.6) return 'Bueno';
    if (normalizedScore >= 0.4) return 'Regular';
    return 'Básico';
  };

  // Función para verificar si un valor es válido (no es 0, '0', null, undefined, o string vacío)
  const isValidValue = (value: ValidatableValue): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '' && value !== '0';
    if (typeof value === 'number') return value > 0;
    return Boolean(value);
  };

  // Función para mostrar valores con fallback
  const displayValue = (value: ValidatableValue, fallback: string = 'No disponible'): string => {
    if (isValidValue(value)) {
      return value!.toString();
    }
    return fallback;
  };

  // Función para formatear el precio
  const formatPrice = (price: number): string => {
    if (!price || price === 0) return 'Precio a consultar';
    return `$${price.toLocaleString('es-CO')}`;
  };

  // Función para formatear el área
  const formatArea = (area: number): string => {
    if (!area || area === 0) return 'No especificado';
    return `${area} m²`;
  };

  // Normalizar el score para la visualización
  const normalizedScore = normalizeScore(score);

  return (
    <div
      className="group bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md rounded-2xl p-5 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10"
      onClick={() => onHouseClick(casa)}
    >
      {/* Header con nombre, precio y score */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-base leading-tight">
              {getHouseName(casa)}
            </h3>
            <div className="flex items-center justify-between mt-1">
              <p className="text-blue-300/80 text-sm flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {formatArea(casa.Area_m2)}
              </p>
              <p className="text-emerald-300 text-sm font-medium">
                {formatPrice(casa.Precio)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-1">
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getScoreColor(normalizedScore)}`}>
            <Star className="w-3 h-3" />
            <span>{Math.round(normalizedScore * 100)}%</span>
          </div>
          <div className="text-xs text-gray-400">
            {getScoreText(normalizedScore)}
          </div>
        </div>
      </div>

      {/* Características principales */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center space-x-2 text-gray-300">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Bed className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <span className="text-sm font-medium text-white">
              {isValidValue(casa.Piezas) ? casa.Piezas : 'No especificado'}
            </span>
            <span className="text-xs text-gray-400 block">
              {isValidValue(casa.Piezas) ? (casa.Piezas === 1 ? 'pieza' : 'piezas') : 'piezas'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-gray-300">
          <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
            <Bath className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-sm font-medium text-white">
              {isValidValue(casa.Banos) ? casa.Banos : 'No especificado'}
            </span>
            <span className="text-xs text-gray-400 block">
              {isValidValue(casa.Banos) ? (casa.Banos === 1 ? 'baño' : 'baños') : 'baños'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-gray-300">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Car className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <span className="text-sm font-medium text-white">
              {casa.Garage ? 'Sí' : 'No'}
            </span>
            <span className="text-xs text-gray-400 block">garage</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-gray-300">
          <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-sm font-medium text-white">
              {isValidValue(casa.Pisos) ? casa.Pisos : 'No especificado'}
            </span>
            <span className="text-xs text-gray-400 block">
              {isValidValue(casa.Pisos) ? (casa.Pisos === 1 ? 'piso' : 'pisos') : 'pisos'}
            </span>
          </div>
        </div>
      </div>

      {/* Características adicionales */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs ${
          casa.Amoblada ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-500/20 text-gray-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${casa.Amoblada ? 'bg-emerald-400' : 'bg-gray-400'}`}></div>
          <span>{casa.Amoblada ? 'Amoblada' : 'Sin amoblar'}</span>
        </div>
        
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs ${
          casa.Balcon ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${casa.Balcon ? 'bg-blue-400' : 'bg-gray-400'}`}></div>
          <span>{casa.Balcon ? 'Balcón' : 'Sin balcón'}</span>
        </div>
        
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs ${
          casa.Internet ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-500/20 text-gray-400'
        }`}>
          <Wifi className="w-3 h-3" />
          <span>{casa.Internet ? 'Internet' : 'Sin internet'}</span>
        </div>

        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs ${
          casa.Asensor ? 'bg-indigo-500/20 text-indigo-300' : 'bg-gray-500/20 text-gray-400'
        }`}>
          <ArrowUp className="w-3 h-3" />
          <span>{casa.Asensor ? 'Ascensor' : 'Sin ascensor'}</span>
        </div>

        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs ${
          casa.Television ? 'bg-pink-500/20 text-pink-300' : 'bg-gray-500/20 text-gray-400'
        }`}>
          <Monitor className="w-3 h-3" />
          <span>{casa.Television ? 'TV' : 'Sin TV'}</span>
        </div>
      </div>

      {/* Proximidad a servicios */}
      <div className="border-t border-blue-500/20 pt-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <div className="text-gray-400">
              <span className="text-blue-300 font-medium">🏥 Hospital:</span>
              <div>{displayValue(casa.Hospital_Car, 'N/A')} min (carro)</div>
            </div>
            <div className="text-gray-400">
              <span className="text-green-300 font-medium">🏫 Escuela:</span>
              <div>{displayValue(casa.Escuelas_Car, 'N/A')} min (carro)</div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-gray-400">
              <span className="text-emerald-300 font-medium">🌳 Parque:</span>
              <div>{displayValue(casa.Parques_Car, 'N/A')} min (carro)</div>
            </div>
            <div className="text-gray-400">
              <span className="text-purple-300 font-medium">🎓 Universidad:</span>
              <div>{displayValue(casa.Universidades_Car, 'N/A')} min (carro)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Información de contacto */}
      {casa.Telefono && (
        <div className="border-t border-blue-500/20 pt-3 mt-3">
          <div className="text-xs text-gray-400">
            <span className="text-blue-300 font-medium">📞 Contacto:</span>
            <div className="text-white">{casa.Telefono}</div>
          </div>
        </div>
      )}

      {/* Hover indicator */}
      <div className="mt-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="text-blue-300 text-xs font-medium">
          Click para ver detalles completos
        </div>
      </div>
    </div>
  );
};

export default HouseCard;