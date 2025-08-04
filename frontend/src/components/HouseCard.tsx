import React from 'react';
import { Home, Bed, Bath, Car, MapPin, Wifi, Building2, Star, ArrowUp, Monitor } from 'lucide-react';
import type { Casa, HouseCardProps } from '../types';

// Type for values that can be validated
type ValidatableValue = string | number | boolean | null | undefined;

const HouseCard: React.FC<HouseCardProps> = ({ match, onHouseClick }) => {
  const { casa, score, matches, partialMatches } = match;

  // Función para formatear el nombre de la casa
  const getHouseName = (casa: Casa): string => {
    if (casa.Name && casa.Name.trim()) {
      return casa.Name;
    }
    return `Propiedad #${casa.OBJECTID}`;
  };

  // Función para obtener el color del score (basado en el sistema de scoring de la API)
  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'bg-green-500/20 text-green-300 border-green-500/20';
    if (score >= 80) return 'bg-blue-500/20 text-blue-300 border-blue-500/20';
    if (score >= 70) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/20';
    return 'bg-red-500/20 text-red-300 border-red-500/20';
  };

  // Función para obtener el texto descriptivo del score
  const getScoreText = (score: number): string => {
    if (score >= 90) return 'Excelente';
    if (score >= 80) return 'Muy bueno';
    if (score >= 70) return 'Bueno';
    return 'Regular';
  };

  // Función para verificar si un valor es válido (maneja específicamente valores de ArcGIS)
  const isValidValue = (value: ValidatableValue): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '' && value !== '0' && value.toLowerCase() !== 'n/a';
    if (typeof value === 'number') return value > 0 && !isNaN(value);
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

  // Función para formatear tiempo de proximidad
  const formatProximityTime = (minutes: number | null | undefined): string => {
    if (!isValidValue(minutes)) return 'N/A';
    if (minutes === 0) return 'Inmediato';
    if (minutes === 1) return '1 min';
    return `${minutes} min`;
  };

  // Función para convertir valores binarios de ArcGIS (1/0) a booleanos
  const convertToBoolean = (value: number | null | undefined): boolean => {
    return value === 1;
  };

  // Obtener valores booleanos desde los datos de ArcGIS
  const hasGarage = convertToBoolean(casa.Garage);
  const hasInternet = convertToBoolean(casa.Internet);
  const isAmoblada = convertToBoolean(casa.Amoblada);
  const hasBalcon = convertToBoolean(casa.Balcon);
  const hasAsensor = convertToBoolean(casa.Asensor);
  const hasTelevision = convertToBoolean(casa.Television);

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
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getScoreColor(score)}`}>
            <Star className="w-3 h-3" />
            <span>{Math.round(score)}%</span>
          </div>
          <div className="text-xs text-gray-400">
            {getScoreText(score)}
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
              {displayValue(casa.Piezas, '0')}
            </span>
            <span className="text-xs text-gray-400 block">
              {casa.Piezas === 1 ? 'habitación' : 'habitaciones'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-gray-300">
          <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
            <Bath className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-sm font-medium text-white">
              {displayValue(casa.Banos, '0')}
            </span>
            <span className="text-xs text-gray-400 block">
              {casa.Banos === 1 ? 'baño' : 'baños'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-gray-300">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Car className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <span className="text-sm font-medium text-white">
              {hasGarage ? 'Sí' : 'No'}
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
              {displayValue(casa.Pisos, '0')}
            </span>
            <span className="text-xs text-gray-400 block">
              {casa.Pisos === 1 ? 'piso' : 'pisos'}
            </span>
          </div>
        </div>
      </div>

      {/* Características adicionales */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs ${
          isAmoblada ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-500/20 text-gray-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isAmoblada ? 'bg-emerald-400' : 'bg-gray-400'}`}></div>
          <span>{isAmoblada ? 'Amoblada' : 'Sin amoblar'}</span>
        </div>
        
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs ${
          hasBalcon ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${hasBalcon ? 'bg-blue-400' : 'bg-gray-400'}`}></div>
          <span>{hasBalcon ? 'Balcón' : 'Sin balcón'}</span>
        </div>
        
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs ${
          hasInternet ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-500/20 text-gray-400'
        }`}>
          <Wifi className="w-3 h-3" />
          <span>{hasInternet ? 'Internet' : 'Sin internet'}</span>
        </div>

        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs ${
          hasAsensor ? 'bg-indigo-500/20 text-indigo-300' : 'bg-gray-500/20 text-gray-400'
        }`}>
          <ArrowUp className="w-3 h-3" />
          <span>{hasAsensor ? 'Ascensor' : 'Sin ascensor'}</span>
        </div>

        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs ${
          hasTelevision ? 'bg-pink-500/20 text-pink-300' : 'bg-gray-500/20 text-gray-400'
        }`}>
          <Monitor className="w-3 h-3" />
          <span>{hasTelevision ? 'TV' : 'Sin TV'}</span>
        </div>
      </div>

      {/* Proximidad a servicios */}
      <div className="border-t border-blue-500/20 pt-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <div className="text-gray-400">
              <span className="text-blue-300 font-medium">🏥 Hospital:</span>
              <div>{formatProximityTime(casa.Hospital_Car)} (carro)</div>
              <div className="text-gray-500">{formatProximityTime(casa.Hospital_foot)} (caminando)</div>
            </div>
            <div className="text-gray-400">
              <span className="text-green-300 font-medium">🏫 Escuela:</span>
              <div>{formatProximityTime(casa.Escuelas_Car)} (carro)</div>
              <div className="text-gray-500">{formatProximityTime(casa.Escuelas_foot)} (caminando)</div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-gray-400">
              <span className="text-emerald-300 font-medium">🌳 Parque:</span>
              <div>{formatProximityTime(casa.Parques_Car)} (carro)</div>
              <div className="text-gray-500">{formatProximityTime(casa.Parques_foot)} (caminando)</div>
            </div>
            <div className="text-gray-400">
              <span className="text-purple-300 font-medium">🎓 Universidad:</span>
              <div>{formatProximityTime(casa.Universidades_Car)} (carro)</div>
              <div className="text-gray-500">{formatProximityTime(casa.Universidades_foot)} (caminando)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mostrar coincidencias exactas y parciales */}
      {(matches.length > 0 || partialMatches.length > 0) && (
        <div className="border-t border-blue-500/20 pt-3 mt-3">
          {matches.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center space-x-1 mb-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-300 font-medium">Coincidencias exactas:</span>
              </div>
              <div className="text-xs text-gray-300 pl-3">
                {matches.join(', ')}
              </div>
            </div>
          )}
          
          {partialMatches.length > 0 && (
            <div>
              <div className="flex items-center space-x-1 mb-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-xs text-yellow-300 font-medium">Coincidencias parciales:</span>
              </div>
              <div className="text-xs text-gray-300 pl-3">
                {partialMatches.join(', ')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Información de contacto */}
      {isValidValue(casa.Telefono) && (
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