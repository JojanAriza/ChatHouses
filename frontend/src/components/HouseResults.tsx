import React from 'react';
import HouseCard from './HouseCard';
import type { HouseResultsContainerProps } from '../types';


const HouseResultsContainer: React.FC<HouseResultsContainerProps> = ({ matches, onHouseClick }) => {
  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-blue-400 text-2xl">🏠</span>
        </div>
        <p className="text-gray-400 text-sm">No se encontraron casas que coincidan con tus criterios</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con contador */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span className="text-blue-300 text-sm font-medium">
            {matches.length} resultado{matches.length !== 1 ? 's' : ''} encontrado{matches.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="text-xs text-gray-400">
          Ordenado por relevancia
        </div>
      </div>

      {/* Grid de casas - Ahora 2 columnas máximo para mejor distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {matches.map((match) => (
          <HouseCard
            key={match.casa.OBJECTID}
            match={match}
            onHouseClick={onHouseClick}
          />
        ))}
      </div>

      {/* Footer con tip */}
      <div className="text-center pt-4 border-t border-blue-500/20">
        <p className="text-gray-400 text-xs">
          💡 Haz click en cualquier casa para ver todos los detalles
        </p>
      </div>
    </div>
  );
};

export default HouseResultsContainer;