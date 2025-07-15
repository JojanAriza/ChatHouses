import React from 'react';
import { Home, Bed, Bath, Car, MapPin, Wifi, Building2, Star } from 'lucide-react';
import { type CasaMatch, type Casa } from '../services/arcGisApi';

interface HouseCardProps {
  match: CasaMatch;
  onHouseClick: (casa: Casa) => void;
}

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

  // Función para obtener el color del score
  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'bg-green-500/20 text-green-300 border-green-500/20';
    if (score >= 0.6) return 'bg-blue-500/20 text-blue-300 border-blue-500/20';
    if (score >= 0.4) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/20';
    return 'bg-red-500/20 text-red-300 border-red-500/20';
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

  return (
    <div
      className="group bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md rounded-2xl p-5 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10"
      onClick={() => onHouseClick(casa)}
    >
      {/* Header con nombre y score */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-base leading-tight">
              {getHouseName(casa)}
            </h3>
            {casa.Field && (
              <p className="text-blue-300/80 text-sm mt-1 flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {casa.Field}
              </p>
            )}
          </div>
        </div>
        
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getScoreColor(score)}`}>
          <Star className="w-3 h-3" />
          <span>{Math.round(score * 100)}%</span>
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
              {casa.Amoblada ? 'Sí' : 'No'}
            </span>
            <span className="text-xs text-gray-400 block">amoblada</span>
          </div>
        </div>
      </div>

      {/* Características adicionales */}
      <div className="flex flex-wrap gap-2 mb-4">
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
      </div>

      {/* Proximidad a servicios */}
      <div className="border-t border-blue-500/20 pt-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="text-gray-400">
            <span className="text-blue-300 font-medium">Hospital:</span>
            <div>{displayValue(casa.Hospital_Car, 'No disponible')}</div>
          </div>
          <div className="text-gray-400">
            <span className="text-blue-300 font-medium">Escuelas:</span>
            <div>{displayValue(casa.Escuelas_Car, 'No disponible')}</div>
          </div>
        </div>
      </div>

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