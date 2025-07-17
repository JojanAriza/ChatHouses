import { Home, X, MapPin, Square, DollarSign, Phone, Bed, Bath, Building, Car, Hospital, GraduationCap, Trees, University } from "lucide-react";
import { useEffect } from "react";
import type { HouseDetailsModalProps } from "../types";

const HouseDetailsModal: React.FC<HouseDetailsModalProps> = ({ casa, isOpen, onClose, onOpenMap, }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-500/20">
        {/* Header */}
        <div className="sticky top-0 bg-black/20 backdrop-blur-md border-b border-blue-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Detalles de la Propiedad
              </h2>
              <p className="text-blue-300 text-sm">Información completa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-300 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Main Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-blue-500/20">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Información General
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Home className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">
                      {casa.Name || "Nombre no especificado"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">
                      Nombre: {casa.Name || "No especificado"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Square className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">
                      ID: {casa.OBJECTID}
                    </span>
                  </div>
                  {casa.Precio && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300 text-sm">
                        Precio: ${casa.Precio.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {casa.Telefono && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300 text-sm">
                        Teléfono: {casa.Telefono}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Characteristics */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-blue-500/20">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Características
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Bed className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">
                      {casa.Piezas || 0} piezas
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Bath className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">
                      {casa.Banos || 0} baños
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">
                      {casa.Pisos || "N/A"} pisos
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Square className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">
                      {casa.Area_m2 || "N/A"} m²
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Car className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">
                      {casa.Garage ? "Con garage" : "Sin garage"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Home className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">
                      {casa.Amoblada ? "Amoblada" : "Sin amoblar"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coordinates */}
              {casa.geometry && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-blue-500/20">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Ubicación
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300 text-sm">
                        Coordenadas: {casa.geometry.x.toFixed(6)},{" "}
                        {casa.geometry.y.toFixed(6)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Additional Features */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-blue-500/20">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Características Adicionales
                </h3>
                <div className="space-y-2">
                  {casa.Balcon ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Balcón</span>
                    </div>
                  ) : null}
                  {casa.Internet ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Internet</span>
                    </div>
                  ) : null}
                  {casa.Asensor ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Ascensor</span>
                    </div>
                  ) : null}
                  {casa.Television ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Televisión</span>
                    </div>
                  ) : null}
                  {!casa.Balcon &&
                    !casa.Internet &&
                    !casa.Asensor &&
                    !casa.Television && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="text-gray-400 text-sm">
                          Sin características adicionales
                        </span>
                      </div>
                    )}
                </div>
              </div>

              {/* Proximity to Services */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-blue-500/20">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Proximidad a Servicios
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1 flex items-center">
                      <Hospital className="w-4 h-4 mr-2 text-red-400" />
                      Hospital
                    </h4>
                    <div className="text-xs text-gray-300 ml-6">
                      <div>
                        🚗 En auto: {casa.Hospital_Car || "No especificado"} min
                      </div>
                      <div>
                        🚶 A pie: {casa.Hospital_foot || "No especificado"} min
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1 flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2 text-blue-400" />
                      Escuelas
                    </h4>
                    <div className="text-xs text-gray-300 ml-6">
                      <div>
                        🚗 En auto: {casa.Escuelas_Car || "No especificado"} min
                      </div>
                      <div>
                        🚶 A pie: {casa.Escuelas_foot || "No especificado"} min
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1 flex items-center">
                      <Trees className="w-4 h-4 mr-2 text-green-400" />
                      Parques
                    </h4>
                    <div className="text-xs text-gray-300 ml-6">
                      <div>
                        🚗 En auto: {casa.Parques_Car || "No especificado"} min
                      </div>
                      <div>
                        🚶 A pie: {casa.Parques_foot || "No especificado"} min
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1 flex items-center">
                      <University className="w-4 h-4 mr-2 text-purple-400" />
                      Universidades
                    </h4>
                    <div className="text-xs text-gray-300 ml-6">
                      <div>
                        🚗 En auto:{" "}
                        {casa.Universidades_Car || "No especificado"} min
                      </div>
                      <div>
                        🚶 A pie: {casa.Universidades_foot || "No especificado"}{" "}
                        min
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-lg transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={() => onOpenMap(casa)}
              disabled={!casa.geometry}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <MapPin className="w-4 h-4 inline mr-2" />
              Ver en Mapa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseDetailsModal;