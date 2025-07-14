import { Home, Car, Wifi, Bed, Bath, Building, Hospital, School } from 'lucide-react';

interface Casa {
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

interface CasaMatch {
  casa: Casa;
  score: number;
  matches: string[];
  partialMatches: string[];
}

interface HouseResultsProps {
  matches: CasaMatch[];
  onHouseSelect?: (casa: Casa) => void;
}

const HouseResults: React.FC<HouseResultsProps> = ({ matches, onHouseSelect }) => {
  if (matches.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No hay coincidencias</h3>
          <p className="text-gray-500 mt-2">No se encontraron casas que coincidan con tus criterios.</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 30) return 'bg-green-100 text-green-800';
    if (score >= 20) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Resultados de búsqueda ({matches.length})
        </h3>
      </div>
      
      {matches.map((match, index) => {
        const casa = match.casa;
        return (
          <div
            key={casa.OBJECTID}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onHouseSelect?.(casa)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-semibold text-gray-800">
                  {casa.Name || `Casa ${casa.OBJECTID}`}
                </h4>
                <p className="text-gray-500 text-sm">ID: {casa.OBJECTID}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(match.score)}`}>
                  {match.score} pts
                </span>
                <span className="text-gray-400 text-sm">#{index + 1}</span>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Bed className="w-5 h-5 text-blue-500" />
                <span className="text-sm">
                  <span className="font-medium">{casa.Piezas}</span> habitaciones
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Bath className="w-5 h-5 text-blue-500" />
                <span className="text-sm">
                  <span className="font-medium">{casa.Banos}</span> baños
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Car className={`w-5 h-5 ${casa.Garage ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="text-sm">
                  {casa.Garage ? 'Con garage' : 'Sin garage'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Wifi className={`w-5 h-5 ${casa.Internet ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="text-sm">
                  {casa.Internet ? 'Con internet' : 'Sin internet'}
                </span>
              </div>
            </div>

            {/* Additional Features */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Home className={`w-5 h-5 ${casa.Amoblada ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="text-sm">
                  {casa.Amoblada ? 'Amoblada' : 'Sin amoblar'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Building className={`w-5 h-5 ${casa.Balcon ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="text-sm">
                  {casa.Balcon ? 'Con balcón' : 'Sin balcón'}
                </span>
              </div>
            </div>

            {/* Distance Info */}
            <div className="border-t pt-4 mb-4">
              <h5 className="font-medium text-gray-700 mb-2">Distancias</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Hospital className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600">Hospital</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-6">
                    <div>{casa.Hospital_Car} min en carro</div>
                    <div>{casa.Hospital_foot} min caminando</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <School className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Escuela</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-6">
                    <div>{casa.Escuelas_Car} min en carro</div>
                    <div>{casa.Escuelas_foot} min caminando</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Matches */}
            {(match.matches.length > 0 || match.partialMatches.length > 0) && (
              <div className="border-t pt-4">
                {match.matches.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-green-700">✅ Coincidencias exactas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {match.matches.map((match, i) => (
                        <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {match}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {match.partialMatches.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-yellow-700">⚠️ Coincidencias parciales:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {match.partialMatches.map((match, i) => (
                        <span key={i} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                          {match}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default HouseResults;